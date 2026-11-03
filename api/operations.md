---
description: Follow durable background work, distinguish acceptance from completion and recover its currently authorized result.
---

# Follow background work

Some workflows finish after the initiating request returns. Acceptance means that Assign has
recorded the work; it does not mean the work succeeded. Keep the operation ID returned by the
initiating workflow, together with its request and recovery information. A disconnected client
does not cancel work.

## Start an Agent job <Badge type="warning" text="Awaiting deployment" />

Choose an existing [ready Agent](./agents#run-and-inspect) from
[Workspace Agents](./reference/operations/listworkspaceagents). This request starts that Agent's
configured work. The credential needs admitted `agents:write` scope, current Agent authority and
access to every Project in the run's scope. Current readiness and entitlement requirements still
apply. Reading status also needs the source workflow's read
scope; write authority does not imply read authority.

Create a fresh key for this intended job and retain the exact request:

```http
POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs
Authorization: Bearer <token>
Idempotency-Key: <key-for-this-agent-job>
Content-Type: application/json
Accept: application/json

{}
```

The expected `202` returns a pending operation and its `/api/v1/operations/{operation_id}`
`Location`.
Save its ID and status location. The response acknowledges admission; it does not establish a
successful Agent run. Honor `Retry-After: 2` before reading again. If the response is lost,
recover the original key and exact request under current access instead of starting another job.

## Read an operation <Badge type="warning" text="Awaiting deployment" />

Use [`getOperation`](./reference/operations/getoperation) with a credential admitted by the
operation's source workflow. The status reader checks that workflow's scopes and your current
resource access. Having an operation ID or one of the reader's listed scopes does not grant
access to every operation. Check the initiating operation's availability and instructions in
the [reference](./reference/) before submitting work.

This request reads status once. Replace the fictitious ID with the saved operation ID and set
`ASSIGN_TOKEN` to a [supported bearer credential](./authentication).

```sh
curl --fail-with-body \
  -H "Authorization: Bearer $ASSIGN_TOKEN" \
  -H 'Accept: application/json' \
  'https://api.assign.so/api/v1/operations/0198ac5e-f9b7-7000-8000-000000000001'
```

An illustrative active response is:

```json
{
  "id": "0198ac5e-f9b7-7000-8000-000000000001",
  "outcome": "active",
  "state": "running",
  "progress": null,
  "created_at": "2026-01-01T12:00:00Z",
  "updated_at": "2026-01-01T12:00:02Z",
  "expires_at": "2026-01-02T12:00:00Z"
}
```

`progress: null` means progress is unknown. A numeric value is a measured fraction from zero
to one; elapsed time cannot tell you how much work has finished. The response is `no-store`.
Keep the returned `expires_at` with the operation ID and follow the source workflow's retention
policy. Recovering operation status and retaining the source resource are separate lifetimes.

## Wait for a terminal result

| Outcome | Meaning | Next action |
| --- | --- | --- |
| `active` | `pending`, `running` or `cancel_requested` | Read again within a finite polling budget. |
| `succeeded` | Work completed | Follow the authorized result reference. |
| `failed` | Work ended with an error | Inspect its Problem Details and the source workflow's recovery. |
| `cancelled` | Cancellation completed | Stop polling and review the source workflow's effects. |

A cancellation request can remain active; only the terminal result establishes cancellation.
For nonterminal reads, honor `Retry-After: 2` as a minimum delay. Stop after a finite number of
attempts or an elapsed-time deadline, retaining the operation ID for a later explicit read.
Terminal responses omit `Retry-After`.

A successful result contains an `authorized-resource` reference with an `href`, `operation_id`
and `media_type`. The reference names a canonical path on the same API origin. Read it using
its owning operation and your current credentials; authorization is checked again. Its response
can have its own pagination. The status response does not contain the full result or a temporary
download capability.

## Recover after an interruption

Read the saved operation ID before deciding whether to submit more work. Do not resubmit an
initiating command merely because polling failed or your local deadline elapsed. If the initial
response was lost before you saved its ID, use that initiating operation's
[documented write recovery](./writes#recover-an-unknown-outcome).

Follow a returned `Link` only through the source workflow's authorized reader. A failed or
cancelled operation can still need source-specific inspection. An
`Assign-Recovery-Required: reconcile` response requires explicit reconciliation of an unknown
external outcome; it does not authorize an automatic retry.

Access can change while work runs. An authorization failure, unavailable resource or expired
status does not establish that no effects occurred. Preserve the original request information
and use [error recovery](./errors) rather than creating another operation to discover its result.

For application live updates, see [Application realtime](./realtime). Its connection management
does not define an external event stream or change the status reader's recovery rules.
