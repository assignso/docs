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

API v1 spans independent server, client, and SDK releases; additive changes stay
in v1, while broad incompatible changes require a new API major. See
[API and client versioning](versioning.md) for compatibility, SDK releases,
capabilities, and deprecation.

The OpenAPI contract defines the exact requirements for each operation. See
[Browser authentication](authentication.md), [Account and Workspaces](account.md),
[Projects and Statuses](projects.md), [Tasks](tasks.md), and [Search](search.md) for the currently
released operations; most domain-resource operations remain unreleased.

## Published but not yet served

The contract is published ahead of the server for some resources, so the
generated SDKs expose methods before the API answers them.

**Comments**, **documents**, and **attachments** are now implemented and no
longer fall into this category. Two caveats apply to attachments: a deployment
that has no object storage configured does not serve the attachment operations
at all, and no attachment is scanned for malware — `scan_state` is always
`not_scanned`, and nothing in Assign should be read as saying otherwise.

**Password sign-in, the TOTP second factor, and passkeys** are implemented; see
[Browser authentication](authentication.md). Passkey operations are the one
group whose availability depends on the deployment: they are served only where a
WebAuthn relying party is configured, and return `404` elsewhere.

The seven **current-user profile, session, and identity** operations under
`/api/v1/me` are served as of 2026-08-18: updating your profile, listing your
sessions, revoking one or all of them, and listing, linking, or unlinking an
external identity. See [Account and Workspaces](account.md).

The Workspace **search** operation is served for Project and Task titles. Its
bounded result shape and current limitations are documented in [Search](search.md).

The native mobile OAuth, native-bearer Inbox/My Work, credential-management,
and push-device methods are intentionally published **contract-only**. Their
schemas are stable for SDK planning, but they are not an availability promise;
clients must not enable those workflows until the backend release is announced.

Everything not documented on the pages listed above remains contract-only and
will fail if called.

Treat an operation as available only once its documentation explicitly marks it
served. Contract-only operations are published early so client authors
can review shapes and plan work, not as an availability promise; their request
and response schemas are accepted and are not expected to change
incompatibly before release, but their release date is not fixed.
