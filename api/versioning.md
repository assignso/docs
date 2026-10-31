---
description: How Assign keeps API v1 compatible, releases SDKs and clients independently, and deprecates old behavior.
---

# Versioning

The public API has one long-lived major version, `/api/v1`. It is independent of release numbers for
Assign, the web app, mobile, the CLI, SDKs and MCP. Don't build release-shaped paths such as
`/api/v1.4`.

## Compatibility

Changes to v1 are additive: new endpoints, optional request properties and optional response
properties. A new major is reserved for broad incompatible changes.

- Ignore response properties you don't recognize.
- Request enums accept only documented values. A response enum can gain values only where the schema
  says unknown values are allowed, and the generated SDKs preserve them.
- The [OpenAPI document](/openapi.yaml) is the compatibility authority. Its version identifies the
  contract, not the server release or the URL major.

## SDK and client releases

Each SDK and client releases on its own schedule, and their version numbers don't need to match. An
SDK records the OpenAPI version it was generated from. Detect features from documented
capabilities, not by comparing server versions.

## Deprecation

When a v1 operation or field is deprecated, Assign:

1. ships a replacement while the old behavior keeps working;
2. marks it deprecated in OpenAPI with migration guidance;
3. normally removes it only in the next major.

Responses may carry `Deprecation: true`. A `Sunset` header appears only when a removal date is
committed.

Realtime and MCP are versioned separately from the REST API.

## Authentication migration <Badge type="warning" text="Awaiting deployment" />

The rewritten product API remains under `/api/v1` and accepts bearer credentials. Migrate
integration requests to the canonical resource operation in the public reference. For example,
use `GET /api/v1/workspaces/{workspace_id}/tasks` for Task collections, with a credential bound
to that Workspace. See [Make your first request](./authentication#make-your-first-request).

Remove browser cookies and `X-CSRF-Token` from product REST requests. In a browser Fetch client,
set `credentials: "omit"`; a cookie must not act as fallback when a bearer token is missing or
invalid. Do not copy an Assign browser session into an integration. Assign's own application
continues to manage its sign-in, cookies and CSRF protection separately.

Existing personal tokens may carry older scopes or longer lifetimes. Follow the credential's
migration notice and explicitly reissue or rotate it when needed; switching a Workspace in
the app does not change a token's Workspace. Product OAuth, native/developer-client grants
and MCP credentials keep distinct audiences. A product token cannot replace an MCP credential.
See [Authentication](./authentication) for expiry, overlap and lost-response recovery.
