# API conventions

Assign's public product API uses JSON over HTTPS beneath `/api/v1`.

- Assign-owned identifiers are opaque UUIDv7 strings. Clients must not infer
  creation time, tenant, resource type, or ordering from an identifier.
- Timestamps are RFC 3339 values in UTC.
- Collection operations are bounded and use opaque cursor pagination. Clients
  must not construct or modify cursors.
- Retryable create operations identify their idempotency contract with `Idempotency-Key`.
- Concurrent edits use entity tags and `If-Match` where required by the operation.
- Errors contain a stable machine-readable code, a safe message, and, when available, the request ID.
- A resource outside the caller's workspace is never discoverable merely by knowing its identifier.

The OpenAPI contract defines the exact requirements for each operation. No
public domain operations have been released yet.
