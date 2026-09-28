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
