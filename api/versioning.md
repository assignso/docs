---
description: Update an integration for the in-place v1 pre-release rewrite and understand contract, SDK and client versions.
---

# Versioning

The public API has one long-lived major version, `/api/v1`. It is independent of release numbers for
Assign, the web app, mobile, the CLI, SDKs and MCP. Don't build release-shaped paths such as
`/api/v1.4`.

## Compatibility

The upcoming pre-release rewrite replaces the product contract at the existing `/api/v1`
prefix, including incompatible changes. Use the current reference and its availability
labels when updating an integration. Do not rely on superseded routes or on redirects
from them.

After release, the normal v1 compatibility policy permits additive changes: new endpoints,
optional request properties and optional response properties. A new major is reserved for
broad incompatible changes to a released contract.

- Ignore response properties you don't recognize.
- Request enums accept only documented values. A response enum can gain values only where the schema
  says unknown values are allowed, and the generated SDKs preserve them.
- The [OpenAPI document](/openapi.yaml) is the compatibility authority. Its version identifies the
  contract, not the server release or the URL major.

### Read API metadata <Badge type="warning" text="Awaiting deployment" />

`getApiMetadata` is the anonymous protocol operation `GET /api/v1/meta`. It is separate from
the bearer product methods in the SDKs. Send it directly over HTTP without an authorization
header, browser cookies or a CSRF token:

```sh
curl --disable --proto '=https' --silent --show-error --fail-with-body \
  --connect-timeout 5 --max-time 10 --max-filesize 16384 \
  --header 'Accept: application/json' \
  'https://api.assign.so/api/v1/meta'
```

Download its [OpenAPI reference](/protocols/api-metadata/openapi.json) and
[source-only provenance](/protocols/api-metadata/provenance.json).

Use the trusted API origin for your integration; the example uses the same origin as
[the first-request tutorial](./quickstart#3-read-one-task-page).
This request performs no Workspace or Account lookup. Its JSON response contains:

| Field | Meaning |
| --- | --- |
| `api_major` | The URL major, currently `1`. |
| `contract_epoch`, `schema_epoch` | Current server epochs used to admit compatible retained representations. |
| `server_version` | The server build version, independent of the contract and SDK versions. |
| `capabilities` | Advertised capability keys. A capability does not grant permission. |
| `supported_clients` | Advisory client names and minimum/maximum version ranges. An empty list makes no client-version compatibility promise. |
| `minimum_version_enforcement` | Currently `none`; a client identity header does not grant or remove authority. |

The bounded response uses `Cache-Control: no-store`. Each metadata request returns the current
document; an old ETag or conditional date cannot select an earlier response.

Before reusing a retained observation, compare its `contract_epoch` and `schema_epoch` with
the currently admitted server epochs. A missing or incompatible epoch requires a fresh
authorized baseline. An epoch observation that is still current can be reused; restoring
cached state does not by itself require a new metadata request.

Epoch compatibility grants no resource access. Current authorization still applies to each
request. ETags and cursors remain opaque: use the values issued for the current representation,
credential and query rather than constructing them from an epoch or numeric revision. Preserve
an interrupted write's original request and key while reconciling its outcome.

## SDK and client releases

Each SDK and client releases on its own schedule, and their version numbers don't need to match. An
SDK records the OpenAPI version it was generated from. Detect features from documented
capabilities, not by comparing server versions.

Choose an available SDK release that identifies the contract you intend to use. Regenerate
or replace clients built for an earlier schema even when the URL still starts with `/api/v1`.
The [Task workflow source downloads](./quickstart#run-the-complete-workflow) pin the exact
TypeScript and PHP SDK artifacts used by the examples. Those artifacts are unreleased and
provided separately. Use the tutorial's [HTTP request](./quickstart#http) if you don't have a
matching SDK artifact.

## Update an integration <Badge type="warning" text="Awaiting deployment" />

Match each request to a supported operation in the [current reference](./endpoints). For
Task reads, update lookup and item reads as follows:

| Existing lookup goal | Rewritten v1 request |
| --- | --- |
| Read Tasks within a Project | [`listWorkspaceTasks`](./reference/operations/listworkspacetasks) with `project_id` |
| Find a Task by code | [`listWorkspaceTasks`](./reference/operations/listworkspacetasks) with `code` |
| Read the complete Task after a lookup | [`getTask`](./reference/operations/gettask) with the returned immutable Task ID |

A code lookup returns a bounded collection, which can be empty. Follow its continuation
cursor when present; use the returned Task ID for the item read. See
[Task lookup recipes](./tasks#read) for requests and recovery.

Update request and response types together. Discard cached response bodies that use the
previous schema rather than interpreting them with new types. For an interrupted write,
retain its original body and idempotency key and resolve its outcome before issuing a new
command; changing a client or signing in again is not permission to repeat the write. See
[write recovery](./errors#common-recovery-examples).

## Deprecation

The pre-release rewrite removes superseded development operations without a deprecation
period. For future deprecations of a released v1 operation or field, Assign:

1. ships a replacement while the old behavior keeps working;
2. marks it deprecated in OpenAPI with migration guidance;
3. normally removes it only in the next major.

Responses may carry `Deprecation: true`. A `Sunset` header appears only when a removal date is
committed.

Realtime and MCP are versioned separately from the REST API.

<a id="authentication-migration"></a>

## Authentication migration <Badge type="warning" text="Awaiting deployment" />

The rewritten product API remains under `/api/v1` and accepts bearer credentials. Migrate
integration requests to the canonical resource operation in the public reference. For example,
use `GET /api/v1/workspaces/{workspace_id}/tasks` for Task collections, with a credential bound
to that Workspace. See [Make your first request](./authentication#make-your-first-request).

For an external bearer integration, omit browser cookies and `X-CSRF-Token`. In a browser
Fetch client, set `credentials: "omit"`; a cookie must not act as fallback when a bearer token
is missing or invalid. Do not copy an Assign browser session into an integration. Assign's
own application handles sign-in, session cookies and CSRF protection for browser access.

Existing personal tokens may carry older scopes or longer lifetimes. Follow the credential's
migration notice and explicitly reissue or rotate it when needed; switching a Workspace in
the app does not change a token's Workspace. Product OAuth, native/developer-client grants
and MCP credentials keep distinct audiences. A product token cannot replace an MCP credential.
See [Authentication](./authentication) for expiry, overlap and lost-response recovery.

## Sign out or switch Workspace

An integration credential stays bound to its admitted audience, environment and Workspace.
Selecting another Workspace in the Assign app does not retarget that credential. Obtain a
credential for the intended Workspace before changing the integration's requests, and discard
cached resource data from the prior Workspace.

Sign out through the Assign app to end its browser session. Manage product credentials through
their [own rotation and revocation steps](./authentication#expiry-rotation-and-revocation).
For a native application or CLI, use that client's sign-out and credential-management commands.
Preserve an interrupted write's original request and key while resolving its result, even if
you sign in again or change clients. See [unknown write outcomes](./writes#recover-an-unknown-outcome).
