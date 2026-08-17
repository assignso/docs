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
- Error responses use `Cache-Control: no-store`; clients and intermediaries must
  not retain them.
- A resource outside the caller's workspace is never discoverable merely by knowing its identifier.

The OpenAPI contract defines the exact requirements for each operation. See
[Browser authentication](authentication.md), [Account and Workspaces](account.md),
[Projects and Statuses](projects.md), and [Tasks](tasks.md) for the currently
released operations; most domain-resource operations remain unreleased.

## Published but not yet served

The contract is published ahead of the server for some resources, so the
generated SDKs expose methods before the API answers them. As of 2026-08-17
this applies to **comments**, **documents**, and **attachments**: their
operations appear in the OpenAPI description and in the TypeScript and PHP
SDKs, but no deployment serves them yet, and calling them will fail.

Treat an operation as available only once it is documented on one of the pages
listed above. Contract-only operations are published early so client authors
can review shapes and plan work, not as an availability promise; their request
and response schemas are accepted and are not expected to change
incompatibly before release, but their release date is not fixed.
