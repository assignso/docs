# Connect an MCP client

Assign provides a remote Model Context Protocol server at
`https://mcp.assign.so/`. Add that exact URL as a remote MCP server in a
supported client. The client opens Assign in a browser, where you choose a
Workspace and approve read and, when needed, write access.

Every request uses current Assign permissions. Disconnecting a client,
revoking a service credential, disabling Workspace AI access, or losing
Workspace membership takes effect immediately.

## Available tools

The initial catalog is intentionally bounded:

- Read authorized Workspaces, Projects, Tasks, and Documents with cursor
  pagination.
- Search Tasks and Documents inside one authorized Workspace.
- Create Documents and replace Document content with revision checks.
- Create and update Tasks, assign or unassign them, and add Task comments.

Write tools require a caller-generated idempotency key. Reuse the same key only
when retrying the exact same request. Task and Document updates also require the
current revision so a retry cannot overwrite a newer human change.

The catalog does not expose deletion, billing, member administration,
credential management, arbitrary HTTP, SQL, filesystem, or shell access.

## Scopes and permissions

The initial scopes are:

- `assign:read` — read permitted Workspace, Project, Task, and Document data.
- `assign:write` — run supported mutations. It does not imply read access.

Scopes are only ceilings. Assign also checks current Workspace membership,
role capabilities, Project visibility, Workspace AI policy, and resource state
on every call. A client cannot use an identifier to cross a Workspace or
Project boundary.

## Connection lifetime

Supported clients renew 15-minute access tokens in the background with a
rotating refresh credential. Normal access-token expiry does not require
another browser sign-in. A connection asks you to authorize again only after it
is disconnected, its credential is replayed or invalidated for security, it
remains unused for 90 days, every authorized Workspace membership is lost, or
the one-year authorization lifetime ends.

## Review or disconnect clients

Open **Account settings → MCP access**. Each connected client shows its scopes,
authorized Workspaces, last use, and authorization expiry. Choose
**Disconnect** to revoke its access and refresh credentials immediately.

Workspace owners and admins can open **Workspace settings → Developer tools**
and disable **AI integrations**. This immediately blocks existing and new MCP
access to that Workspace without disconnecting the same client from another
authorized Workspace.

## Service credentials

Workspace owners and admins can create non-interactive credentials under
**Workspace settings → Developer tools → Service credentials**. Use these for
CI or a controlled service that cannot complete browser OAuth.

Choose a name, read-only or read/write access, an expiry of 30, 90, or 365
days, and optionally restrict the credential to selected Projects. The secret
starts with `mcp_sc_` and is shown exactly once. Copy it directly into the
approved secret manager for the service; Assign stores only its digest and a
safe display prefix.

Send the service credential as `Authorization: Bearer <credential>` to the same
MCP endpoint. Never paste it into a browser settings field, source file, log,
task, chat, or support message. Revoking it is immediate and cannot be undone;
create a replacement when rotating access.

## Troubleshooting

- Use the exact HTTPS endpoint, including the trailing slash.
- Complete browser approval with an active Assign Workspace, or use a live
  Workspace service credential in the bearer header.
- Request both `assign:read` and `assign:write` when a workflow needs to inspect
  and then change work.
- If an update reports a revision conflict, read the resource again and decide
  whether the newer state should be replaced. Do not blindly retry with a new
  revision.
- If a tool is rate limited, wait for the returned retry interval and retry the
  same operation with the same idempotency key.
- If a connection was unused for 90 days or reached one year, authorize it
  again from the client.
- If the settings page shows that a client or service credential is revoked,
  start a new authorization or create a replacement. Old credentials cannot be
  restored.

Assign never asks you to send an access token, refresh token, or service
credential to support.
