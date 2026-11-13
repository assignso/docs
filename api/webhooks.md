---
description: Receive signed Task events, acknowledge duplicates and recover customer webhook deliveries under current Workspace authority.
---

# Receive Task webhooks

## Register a receiver <Badge type="warning" text="Awaiting deployment" />

Customer webhooks send selected Task events to your HTTPS receiver. Check the
[API reference](./reference/) for availability before configuring a receiver.

Use the [credential setup](./quickstart) and [copy the Workspace ID](./account#copy-workspace-id).
A current human Workspace Owner or Admin creates the endpoint with an admitted bearer credential
and either `integrations:write` or `assign:write`. Read controls require
`integrations:read` or `assign:read` and the same current Workspace role. Use a credential
issued to that administrator.

The URL must be publicly reachable HTTPS. Set up a receiver that preserves the exact body bytes
and enforces the 8192-byte body limit before JSON parsing. This illustrative registration selects
one event type:

```http
POST /api/v1/workspaces/{workspace_id}/webhook-endpoints
Authorization: Bearer <token>
Idempotency-Key: <key-for-this-registration>
Content-Type: application/json

{"url":"https://example.com/assign-events","event_types":["task.updated"]}
```

The [registration](./reference/operations/createwebhookendpoint) returns `201` with the endpoint
and a one-time `signing_secret`. Store that secret in your receiver's credential store
immediately and keep it out of logs. Retain the request key and endpoint identity separately.
A recovered registration contains `signing_secret: null`. If you lose the secret, recover the
registration outcome first, then rotate the endpoint's key.

You may select up to eight event types and 50 Project IDs. The URL, event selection and Project
filters are immutable; create a replacement endpoint deliberately to change them. Each Workspace
retains at most 1000 endpoints.

## Verify the exact bytes

The sender uses the [Standard Webhooks signature format](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md).

| Header | Meaning |
| --- | --- |
| `webhook-id` | Stable delivery ID used for deduplication. |
| `webhook-timestamp` | Unix seconds for this send attempt. |
| `webhook-signature` | Space-separated `v1,<base64-signature>` values. |
| `X-Assign-Webhook-Endpoint-Id` | Endpoint identity; it cannot authenticate a request by itself. |

Remove `whsec_` from the configured secret and Base64-decode the remaining key. Compute
HMAC-SHA-256 over `webhook-id + "." + webhook-timestamp + "." + rawBody`, using the original
body bytes. Compare decoded signatures in constant time. During rotation, accept a valid signature
from either configured key. Select keys from your configured receiving route; do not trust an
unverified payload to choose another customer's key.

The maintained verification recipes use a five-minute timestamp tolerance in either direction
as a receiver policy. Keep the receiver clock synchronized. Retries and manual replays receive a
fresh timestamp, so old event occurrence times remain valid when their current send is authentic.
Timestamp verification alone does not deduplicate deliveries.

### Node.js

Save [verify.mjs](https://github.com/assignso/docs/blob/main/examples/webhooks/verify.mjs) beside
your receiver. Supply its bounded raw `Buffer`, a `Headers` object and your configured secret:

```js
import { verifyAssignWebhook } from './verify.mjs'

const event = verifyAssignWebhook(rawBody, headers, [signingSecret])
```

### PHP

Save [verify.php](https://github.com/assignso/docs/blob/main/examples/webhooks/verify.php) beside
your receiver. The helper requires PHP 8.1 or newer and lowercase header names:

```php
require __DIR__ . '/verify.php';

$rawBody = file_get_contents('php://input', false, null, 0, 8193);
if ($rawBody === false) {
    throw new RuntimeException('Could not read webhook body');
}
$headers = array_change_key_case(getallheaders(), CASE_LOWER);
$event = verifyAssignWebhook($rawBody, $headers, [$signingSecret]);
```

Both helpers verify the signed delivery ID against the parsed body's `delivery_id`. After
verification, validate the event schema and expected Workspace, event type and Project selection
before processing it. The helpers do not provide persistent deduplication or execute domain work.

### Check a prepared delivery

Use this fictitious key and request to check either helper offline. Set `signingSecret`
or `$signingSecret` to the key below.

```text
whsec_AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=
```

Pass the JSON line as the raw UTF-8 body, without a trailing newline.

```http
POST /assign-events HTTP/1.1
Content-Type: application/json
webhook-id: 0198ac5e-f9b7-7000-8000-000000000001
webhook-timestamp: 1767225600
webhook-signature: v1,sn6J0xAqFz0RYXyU07a9R6Y5VnvfKwxzbcJeNPXJ7CE=

{"delivery_id":"0198ac5e-f9b7-7000-8000-000000000001","event_id":"evt-task-42","event_type":"task.updated","event_version":1,"workspace_id":"0198ac5e-f9b7-7000-8000-000000000002","occurred_at":"2026-01-01T00:00:00Z","data":{"schema_version":1,"workspace_id":"0198ac5e-f9b7-7000-8000-000000000002","task_id":"0198ac5e-f9b7-7000-8000-000000000003","project_id":"0198ac5e-f9b7-7000-8000-000000000004","operation_id":"0198ac5e-f9b7-7000-8000-000000000005","revision":8,"changed_fields":["priority"],"url":"https://app.assign.so/task/EX-42"}}
```

Supply the three `webhook-*` headers from the request. Pass its timestamp as the verification
clock for this check. Omit the fourth argument in your receiver to use the current clock.

```js
const verified = verifyAssignWebhook(rawBody, headers, [signingSecret], 1767225600)
console.log(verified.delivery_id)
```

```php
$verified = verifyAssignWebhook($rawBody, $headers, [$signingSecret], 1767225600);
echo $verified['delivery_id'];
```

Both print `0198ac5e-f9b7-7000-8000-000000000001`. Append a newline to the raw body and
keep the same signature to check that verification fails.

## Process an event once

Version 1 events contain `delivery_id`, `event_id`, `event_type`, `event_version`, `workspace_id`,
`occurred_at` and minimal `data`. Supported Task families are `task.created`, `task.updated`,
`task.status.changed`, `task.assignment.changed`, `task.comment.created`, `task.comment.updated`,
`task.comment.deleted` and `task.relation.changed`.

Deliveries can arrive more than once. Persist the delivery ID and the accepted work together
before returning `2xx`. If you have already accepted the delivery, return `2xx` without repeating
the work. Track downstream completion in your own system.

Retries and manual redelivery preserve the delivery ID, event ID and body. If several endpoints
feed the same workflow, use the event ID to recognize the same event across deliveries. Use the
event to decide which resource to read under your current API credentials. Use the Task's current
validator from the API for a conditional write.

Automatic delivery is ordered within an endpoint and event type. Other event types and manual
replays can arrive out of order. Reconcile current Task state before acting on an older event.

### Save your processing checkpoint

Record what your integration has durably applied. For example, update a local Task record and
mark the event processed in the same transaction. If your receiver queues work, record durable
acceptance before acknowledgment and advance the processing checkpoint after the worker applies
the change. Use your stored IDs to skip work you already applied when an event arrives again.

A delivery history cursor continues a history listing. To rebuild local state after a gap, read
the resources your workflow tracks and save a fresh checkpoint once you have reconciled them.

## Recover delivery gaps

Each delivery cycle permits up to eight attempts within one hour. Assign retries network
failures and `408`, `425`, `429` or `5xx` responses with bounded backoff and honors
`Retry-After` within the retry window. The callback time limit is ten seconds.

1. [Read the endpoint](./reference/operations/getwebhookendpoint) and inspect its state and
   health. [List delivery history](./reference/operations/listwebhookdeliveries) with the same
   page size and follow each opaque `next_cursor` until it is null, even after a short page.
   History contains metadata for up to seven days and 1,000 deliveries per endpoint. A missing
   delivery may have expired.
2. For a retained delivery, [read the delivery](./reference/operations/getwebhookdelivery) and
   use its exact `ETag` in `If-Match`, or use the corresponding list row's `item_validator.etag`. Keep the
   validator's response encoding as described in the operation reference.
   [Request redelivery](./reference/operations/redeliverwebhookdelivery) with a fresh
   `Idempotency-Key` and no body. The endpoint must be active with a free ordering slot for
   that event type. Each delivery permits up to three manual replays and 32 total attempts.
   A `200` returns a pending delivery. Read it again to see the receiver outcome.
3. After a `409`, inspect the endpoint and delivery before deciding whether to replay. After
   a `412`, reread the delivery and reconcile before sending a new request. If the command's
   outcome is unknown, retry the exact original request with the same key and condition.
   Recovery checks the caller's current Workspace authority.
4. If history is missing or endpoint health reports `rebaseline_required`, reconcile the
   affected state using [bounded resource reads](./pagination) under current authority.
   For example, [list the Tasks](./tasks#list) your workflow tracks and apply the current values to
   your local records. If you decide to abandon pending recovery,
   [update the endpoint](./reference/operations/updatewebhookendpointstate) with its current
   validator in `If-Match`, a new `Idempotency-Key`, and
   `{"state":"active","rebaseline":true}`. The update marks pending deliveries failed and
   resumes from the current event position under the requesting administrator. Older delivery
   metadata remains available within the history limits.

If your Workspace role or access changes, ask a current Owner or Admin to review the endpoint.
They need their own authorized credential to inspect or recover it.

## Rotate, pause or revoke

Read the current endpoint and forward its exact `ETag` for a conditional state change or secret
rotation. A missing condition returns `428`; a stale condition returns `412`. Retain the key,
target and exact request after an unknown outcome; see [Writes and retries](./writes).

Rotation returns a one-time new key and supports the previous key for five minutes. Configure
the new key promptly, retain the previous key through the overlap, then remove it. Another
rotation during overlap conflicts. If the fresh secret was lost, first recover the rotation's
outcome; an original-key replay cannot recover the secret itself.

Pausing stops normal delivery while retaining endpoint recovery state. Revoking clears the
callback and key custody. An already admitted send can overlap revocation by up to ten seconds.
