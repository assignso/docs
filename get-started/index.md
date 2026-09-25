---
description: What Assign is, how it is organized and which interface to use for what.
---

# Introduction

Assign is one workspace for projects, documents, developers and agents. Your team plans and tracks
work in Projects and Tasks and keeps operating context in Documents. Engineers pick up the same
work from the terminal, the editor or an AI assistant. Every interface goes through one set of
permissions and one audit history.

## Choose an interface

| Interface | Use it for | Start here |
| --- | --- | --- |
| **Web app** | Planning, Boards and Lists, writing Documents, Workspace settings | [Using the web app](../guides/web-app) |
| **CLI** | Checking your work, searching, moving Tasks and reading Documents from the terminal | [Assign CLI](../cli/) |
| **MCP server** | Letting Codex or another MCP client read and change work on your behalf | [MCP server](../mcp/) |
| **HTTP API** | Building integrations and automations on the public, versioned contract | [API overview](../api/) |

These interfaces are all views of the same Workspace. A Task you complete from the CLI shows up
as completed in an open browser tab, in an MCP client and in the API. Each interface also enforces
the same Workspace roles, Project visibility and revision checks.

## Principles you can rely on

- **The Workspace is the boundary.** Every request is scoped to one Workspace. A resource outside
  your Workspace can't be discovered by guessing its identifier.
- **Changes are explicit and recoverable.** Writes carry an idempotency key, concurrent edits are
  checked against the current revision, and many changes offer Undo or keep their history.
- **Credentials stay separate.** The web session, CLI login, personal API tokens, MCP connections
  and service credentials are distinct and can each be revoked on their own.
- **AI works under your permissions.** Assistants and hosted Agents act through the same
  authorized operations as a person. Workspace owners can turn AI access off at any time.

## Next

<div class="next-steps">

- [**Quickstart**](./quickstart): sign in, create work and connect a tool in a few minutes.
- [**Core concepts**](./concepts): Workspaces, Projects, Tasks, Documents and how they relate.

</div>
