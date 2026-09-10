# Assign documentation

Public API consumers should start with [API conventions](api/conventions.md)
and [API and client versioning](api/versioning.md).

Public documentation for Assign 3.0 will live here. The machine-readable HTTP
contract is maintained separately in `openapi-spec` and is the source for
generated SDKs.

Assign uses **Workspace** for its tenant and collaboration boundary and **Task**
for its work resource. Public product endpoints use `/api/v1`; operational
responses such as the API-origin health summary at `/`, `/health`, and `/ready`
are not public API resources. The root summary reports only safe aggregate
states for the API, database, WebSocket/Yjs collaboration, and optional
Knowledge service; integrations must not treat it as a versioned product
contract.

- [API conventions](api/conventions.md)
- [Supplemental API operation reference](api/operation-reference.md)
- [Browser authentication](api/authentication.md)
- [Account and Workspaces](api/account.md)
- [Assign CLI](cli.md)
- [Workspace governance](api/workspaces.md)
- [Projects and Statuses](api/projects.md)
- [Tasks](api/tasks.md)
- [Integrations and Rich Entities](api/integrations.md)
- [Documents](api/documents.md)
- [Attachments](api/attachments.md)
- [Current work](api/current-work.md)
- [Search](api/search.md)
- [Workspace Knowledge](api/knowledge.md)
- [Git-backed Documents](api/git-backed-documents.md)
- [People profiles](api/people.md)
- [Inbox](api/inbox.md)
- [Activity](api/activity.md)
- [Workspace Agents](api/agents.md)
- [Connect an MCP client](mcp.md)
- [Time tracking](time-tracking.md)
- [Writing in Assign](editor.md)
- [Privacy and cookie choices](privacy-and-cookies.md)
- [Frontend prototype](frontend-prototype.md)

See [versioned work proposals and receipts](api/work-capabilities.md) for private result sets, drafts,
reviewed ChangeSets and write recovery in the upcoming update.
