# Scopes and credentials

## Scopes and permissions

The initial scopes are:

- `assign:read` — read permitted Workspace, Project, Task, and Document data.
- `assign:write` — run supported mutations. It does not imply read access.

Scopes are only ceilings. Assign also checks current Workspace membership,
role capabilities, Project visibility, Workspace AI policy, and resource state
on every call. A client cannot use an identifier to cross a Workspace or
Project boundary.

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
