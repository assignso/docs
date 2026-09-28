---
description: Identifiers, timestamps, pagination, idempotency, concurrency and errors shared by every Assign API operation.
---

# API conventions

These rules apply to every operation under `/api/v1`. The [OpenAPI document](/openapi.yaml) defines the
exact requirements of each one.

| Topic | Rule |
| --- | --- |
| Identifiers | Opaque UUIDv7 strings. Don't infer time, tenant, type or order from them. |
| Timestamps | RFC 3339 in UTC. Calendar dates are `YYYY-MM-DD`. |
| Pagination | Bounded pages with opaque cursors (`next_cursor`, `has_more`). Never build or edit a cursor. |
| Idempotency | Retryable creates take an `Idempotency-Key`. Reuse a key only for the identical request. |
| Concurrency | Updates send the resource's revision in `If-Match`. A stale revision returns `409`. |
| Errors | A stable machine-readable `code`, a safe message and, when available, a request ID. Error responses aren't cacheable. |
| Isolation | A resource outside your Workspace returns `404`, the same as one that doesn't exist. |

## Availability

The contract can list operations before they're available. Treat an operation as available when its
guide describes it. Native mobile OAuth, credential management and push-device operations are
published for planning only and shouldn't be used yet.

Two deployment notes:

- Attachment operations need object storage, and files report `scan_state: not_scanned` until malware
  scanning is enabled. See [Attachments](./attachments).
- Passkey operations return `404` where passkeys aren't configured.

## Related

[Versioning](./versioning) covers compatibility and deprecation. [Authentication](./authentication)
covers credentials.
