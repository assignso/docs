---
description: Interpret Assign Problem Details, recover from validation and condition failures, and bound rate-limit retries.
---

# Errors and recovery

## Product errors <Badge type="warning" text="Awaiting deployment" />

Product REST errors use `application/problem+json` and `Cache-Control: no-store`. Branch on
`code` or `type`. The optional `reason` refines a domain refusal; `detail` is a safe explanation,
not a stable discriminator. Preserve unknown extension fields. OAuth, MCP, webhooks and other
protocols retain their own documented error shapes.

This illustrative `412` response means a conditional write did not meet its required version:

```json
{
  "type": "https://docs.assign.so/errors/precondition_failed",
  "title": "Precondition failed",
  "status": 412,
  "detail": "The condition no longer holds. Read the current authorized representation before retrying.",
  "instance": "urn:assign:problem:example-condition",
  "code": "precondition_failed",
  "request_id": "example-request-001",
  "retryable": false
}
```

`instance` identifies this occurrence. It is not the request URL. Keep `request_id` and the
`Assign-Request-ID` response header for support; `X-Request-ID` is its correlation alias.
Field errors can include `errors` entries with a JSON Pointer or parameter, a code and a safe
message. Use them to correct the specific input. A gateway may return a non-JSON error:
inspect the status and content type before parsing and preserve the correlation headers.

## Common recovery examples

| Request or observation | Expected error | Safe action |
| --- | --- | --- |
| Task PATCH exceeds its 8 KiB encoded JSON limit | `413 content_too_large` | Reduce the complete request to its declared bounds; do not split one intended atomic edit into blind retries. |
| JSON write declares an unsupported body media type or content coding | `415 unsupported_media_type` | Use the operation's accepted `Content-Type` and request coding. `Accept` does not describe the request body. |
| Conditional Task edit uses an old item tag | `412 precondition_failed` | Read current canonical state and reconcile before a new edit. |
| Conditional Task edit omits its tag | `428 precondition_required` | Obtain the required item validator. |
| Request exceeds its admitted rate budget | `429 rate_limited` | Honor `Retry-After` within a finite deadline; preserve keyed write intent. |
| Mutation connection ends without a response | Outcome unknown | Follow [write recovery](./writes#recover-an-unknown-outcome) before issuing another mutation. |

## Rate limits and availability

`Assign-Limit` is versioned Assign metadata, separate from draft standard `RateLimit` headers.
Its kind, scope, policy and unit describe the applicable budget. Optional `limit` and `remaining`
are window units; `cost` is this request's required units and `reset` is Unix seconds. Unknown
counters can be absent. Search query cost is distinct from paid entitlement. Neither a reset
nor `Retry-After` guarantees that another request will be admitted.

Use [bounded backoff](./writes#bound-retries) for a permitted retry. A `402 payment_required`
or quota/entitlement refusal needs account or plan action. Do not poll it automatically.
Temporary `503` maintenance errors can use `maintenance_offline` or `maintenance_read_only`
as their `reason`; honor `Retry-After` rather than treating them as invalid credentials.

## Error catalog

The catalog is generated from the public contract. Each code links to its trigger and recovery.
An operation's reference determines which errors apply to it. `retryable: true` permits only
the documented bounded recovery; an uncertain write still needs its original key and intent.

<!-- assign:error-catalog -->

## Related

[Writes and retries](./writes) distinguishes a stale edit from recovery of a committed request.
[Pagination](./pagination) explains cursor restart and incomplete traversal.
