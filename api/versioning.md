# API and client versioning

Assign's public HTTP API uses a long-lived compatibility major at `/api/v1`.
The API major is separate from the release numbers of Assign Core, Web, Mobile,
Desktop, CLI, SDKs, realtime protocols, and the Assign MCP server.

An Assign Core release does not change the URL. Compatible additions—such as a
new endpoint, an optional response property, or an optional request property—
remain in v1. Assign reserves a new API major for broad incompatible changes
that cannot reasonably coexist with v1.

Do not construct release-shaped routes such as `/api/v1.4` or `/api/v1.14.2`.

## Compatibility promise

Once a public v1 operation or field is released, Assign treats unknown older
clients as active consumers. Changes are additive by default. Replacements are
introduced alongside older behavior and deprecated before removal; removal
normally waits for a later API major.

Clients must ignore unknown response properties. An enum is forward-compatible
only when its schema explicitly permits unknown future values; generated Assign
SDKs preserve those values where the contract makes that promise. Request enums
remain limited to documented values.

The published [OpenAPI contract](https://github.com/assignso/openapi-spec) is the
machine-readable compatibility authority. Its document version identifies a
contract release, not the running server release or API URL major.

## SDK and client releases

Every SDK and client releases independently. A TypeScript SDK major change does
not imply API v2, and the TypeScript and PHP SDK version numbers do not need to
match. Each generated SDK records the exact OpenAPI revision it was built from.

Feature detection must use documented capabilities when available, not
comparisons against an Assign Core version string. A future `/api/v1/meta`
operation will publish API/server identity, stable capabilities, and
minimum/recommended/latest first-party client releases. That operation is not
currently served; its exact schema will be added to OpenAPI before release.

Minimum-client enforcement is reserved for cases where an older client is unsafe
or genuinely unable to continue. Being below the recommended release may produce
an optional upgrade notice; it is not by itself a forced-upgrade condition.

## Deprecation

When a v1 surface is deprecated, Assign will:

1. publish and document a replacement while the old surface continues to work;
2. mark the old surface deprecated in OpenAPI and provide migration guidance;
3. migrate Assign-owned clients and measure remaining use; and
4. normally remove it only in the next API major.

Responses may include `Deprecation: true`. A `Sunset` header is included only
when a removal date has been committed.

## Request diagnostics

The API contract will standardize API version, server release, request ID, client
product, and client release headers before clients rely on them. Until those
headers appear in the released OpenAPI contract, use the current documented
request ID and user-agent behavior rather than assuming header availability.

Realtime and MCP compatibility are versioned separately from REST. Clients must
follow the negotiation and server metadata defined by those protocols rather
than infer support from API v1 or an application release.
