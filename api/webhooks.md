---
description: Receive signed Task events, acknowledge duplicates and recover customer webhook deliveries under current Workspace authority.
---

# Receive Task webhooks

## Register a receiver <Badge type="warning" text="Awaiting deployment" />

Customer webhooks send selected Task events to your HTTPS receiver. They are separate from
[incoming provider callbacks](./integrations) and the Assign application's
[live connection](./realtime). Check the [current reference](./reference/) for availability before
configuring a receiver.

A current human Workspace Owner or Admin creates the endpoint with an admitted bearer credential
and `integrations:write` or its supported broad write scope. Read controls require
`integrations:read` or the supported broad read scope. Current role and resource access still
apply; an MCP grant or service identity cannot substitute for that administrator.

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

The `201` result includes the endpoint and a one-time `signing_secret`. Store that secret in your
receiver's credential store immediately and keep it out of logs. Retain the request key and
endpoint identity separately. A recovered registration contains `signing_secret: null`; recovery
never reissues a lost secret or grants permission to register another endpoint automatically.

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

## Process an event once

Version 1 events contain `delivery_id`, `event_id`, `event_type`, `event_version`, `workspace_id`,
`occurred_at` and minimal `data`. Supported Task families are `task.created`, `task.updated`,
`task.status.changed`, `task.assignment.changed`, `task.comment.created`, `task.comment.updated`,
`task.comment.deleted` and `task.relation.changed`.

Use the delivery ID to persist a deduplication record together with your own durable acceptance
of the event. Return a `2xx` only after that acceptance succeeds. For a duplicate already accepted
delivery, return a successful acknowledgment without repeating its effect. A `2xx` acknowledges
delivery; it does not establish that your downstream work completed.

Retries preserve the delivery ID, event ID and serialized body. Delivery history omits the
payload, destination and keys. Keep the signed body in your own authorized storage only as long
as your workflow needs it. Use the event as a signal to read currently authorized resource state;
its revision is not an opaque Task `If-Match` validator.

Automatic delivery is ordered within an endpoint and event type. Do not assume total ordering
across event types. A manual replay can deliver an older event. Reconcile current Task state
before applying an out-of-order effect, and keep event identity separate from a local checkpoint.

## Recover delivery gaps

Each delivery cycle permits up to eight attempts within one hour, with bounded backoff and
`Retry-After` handling for network failures and `408`, `425`, `429` or `5xx` responses. The callback
time limit is ten seconds. Keep acknowledgment work short and move longer processing behind
your own durable queue.

Authorized delivery history is retained for seven days, up to 1000 deliveries per endpoint.
Follow opaque `next_cursor` values through short pages until null. A partial page or missing
delivery does not prove that an event never occurred.

For a known retained delivery, a current administrator may request manual redelivery using the
observed delivery `ETag`, a fresh idempotency key and the original target. The endpoint must be
active and its event-type ordering slot available. A delivery allows at most three manual
replays and 32 attempts in total. Read its current status before another request; recover an
interrupted redelivery command under its original key.

When recovery has a gap, pause and reconcile the application state with authorized bounded
resource reads. An explicit endpoint update with `rebaseline: true` abandons pending recovery
and resumes from the current tail under the requesting administrator. It does not replay missing
history. Review that loss of recovery before enabling it. Customer webhooks do not expose the
Assign application's private stream or its checkpoints.

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
After losing access or administrator authority, review the endpoint with a current Workspace
administrator instead of reusing an old token to bypass the failure.
