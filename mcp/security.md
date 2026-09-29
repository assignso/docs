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

## Client revocation <Badge type="warning" text="Awaiting deployment" />

Registering a client again does not reactivate a revoked client. A disabled client
cannot resume access merely by publishing or resubmitting its registration metadata.

## Paid public publishing <Badge type="warning" text="Awaiting deployment" />

Public Document creation and Project publishing also require that Workspace's paid publishing entitlement. A denied tool call returns `paid_workspace_required` without publishing; existing OAuth scopes and actor permissions still apply. Authorized unpublishing remains available. `document_update` replaces content and does not change publication scope.

## Resource scopes <Badge type="warning" text="Awaiting deployment" />

A client can request `assign:<resource>:read` or `assign:<resource>:write` to limit which tool operations its connection can use.

| Read and write | Read only |
| --- | --- |
| projects, tasks, comments, relations, documents, attachments, labels, milestones, inbox, knowledge, memory, discuss, agents, operations | workspaces, statuses, members, activity, search, code, context |

Request read and write separately when both are needed. Granular write permits the mutation and its normal response, but does not grant separate read tools. Existing broad `assign:read` and `assign:write` retain their behavior; omit them when you want narrow access. Broad mutations still require both broad scopes.

For a Task-editing connection, request `assign:tasks:read` and `assign:tasks:write`. Add `assign:workspaces:read` and `assign:projects:read` when the client needs to discover those identifiers, and comment scopes when it needs comment tools. Missing discovery access does not authorize guessing identifiers or switching credentials to bypass a denial.

Scopes limit tool operations; existing authorized result previews retain their current content. `assign:context:read` allows the cross-resource Task context packet. Operations scopes cover reviewed change sets and receipts, including eligible undo. Agent write permits routed actions across authorized resources. Knowledge write manages evidence collections. Approve these aggregate capabilities only when your workflow needs them. Current role, Workspace, Project, policy and entitlement checks still apply.

OAuth metadata advertises the supported set. Each advertised tool identifies its granular scope in `assign/resource_scope` metadata. Calls are checked again even when a client has cached the tool list. An insufficient grant returns `insufficient_scope` without executing the tool.

The service-credential creation API accepts the same finite scope values, with at most 37 distinct entries. The current Web form continues broad read-only or read/write choices. A refresh token cannot add or reinterpret scopes; request fresh consent or create a replacement credential to change access. Existing credentials are not rewritten automatically.
