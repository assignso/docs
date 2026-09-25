---
description: Connect Codex, Claude, Cursor and other Model Context Protocol clients to Assign with OAuth, scoped access and the same permissions as the web app.
---

# MCP server

Assign runs a remote [Model Context Protocol](https://modelcontextprotocol.io) server. With it, an
AI assistant can read and change your Projects, Tasks, Documents and Knowledge. It works under
the same permissions you have in the web app.

```text
https://mcp.assign.so/
```

Add that URL as a remote MCP server in your client. The client opens Assign in a browser, where
you choose a Workspace and approve read access, and write access when you need it. You don't need
a client ID, client secret or API key.

<div class="next-steps">

- [**Connect a client**](./connect): Codex, Claude, Cursor and any client that supports remote OAuth.
- [**Tool catalog**](./tools): every tool, whether it reads or writes, and how to use it well.
- [**Scopes and credentials**](./security): read/write ceilings and service credentials for CI.
- [**Troubleshooting**](./troubleshooting): sign-in prompts, conflicts, rate limits and Knowledge readiness.

</div>

## What an assistant can do

| Area | Capabilities |
| --- | --- |
| Work | List, read, create and update Projects, Milestones, Tasks, Comments, relations, labels and subscriptions |
| Documents | Read Documents as structured content or Markdown and write them with revision checks |
| Files | Upload attachments directly to storage, list them and get short-lived download links |
| Search | Search Projects, Tasks, Documents, Comments and People in one Workspace |
| Summaries | Summarize a Task, Project, Document, filtered collection or activity interval, with coverage stated |
| Knowledge | Search, traverse and cite indexed Workspace Knowledge and connected code, when the Workspace has it enabled |
| Discuss | Post replies, recall your private Discuss history, manage explicit rules and inspect or stop runs |
| Inbox | Read your personal Inbox and mark items read or unread (interactive connections only) |

The catalog doesn't expose any of the following: deleting a Workspace, Project or Document,
permanently purging a Task, billing, member administration, credential management, arbitrary
HTTP, SQL, filesystem access or shell access.

## How access works

- **The scope is a ceiling.** `assign:read` and `assign:write` cap what a connection can do. Every
  call still checks your current Workspace membership, role, Project visibility, Workspace AI
  policy and the resource's state.
- **Changes are safe to retry.** Every write takes an idempotency key. Task and Document updates
  also take the current revision, so a retry can't overwrite a newer change made by someone else.
- **Revoking access works immediately.** Disconnecting a client, disabling AI access for the
  Workspace or losing membership blocks the next call, including tools the client has cached.
- **Your Assign credentials stay in Assign.** A client gets its own revocable MCP credential. The
  Assign CLI, the web session and service credentials are never shared with it.

## Supported clients

Assign identifies clients through their published Client ID Metadata Document (CIMD). It does
not offer open dynamic client registration, so a client needs to support remote servers with OAuth
and CIMD.

| Client | Setup |
| --- | --- |
| Codex (CLI, desktop and IDE) | `assign mcp setup codex`, or the [manual Codex steps](./connect#codex) |
| Other remote MCP clients | Add `https://mcp.assign.so/` as a remote server and complete the browser sign-in |
| Headless services and CI | A [service credential](./security#service-credentials) sent as a bearer token |

Codex is the client with a documented, verified setup path. Instructions for other clients will
be added here once each one has been tested against Assign.

Clients that support [MCP Apps](./previews) also show interactive Task, Project and Document
previews. Other clients get the same structured results, text and links.
