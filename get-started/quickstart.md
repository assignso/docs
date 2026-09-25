---
description: Create a Workspace, plan your first Project and connect the CLI and an MCP client.
---

# Quickstart

This guide walks you through creating your first Workspace, adding a Project and a Task, and
opening that Task from the terminal and from an AI assistant.

## 1. Create a Workspace

Sign up at [assign.so](https://assign.so) with email and password, Google, GitHub or Apple. After
you verify your email, Assign asks you to name your first Workspace and fills in its URL path for
you. You can change the name, path and icon later in **Workspace settings → General**.

## 2. Create a Project and a Task

1. In the sidebar, open **Projects** and choose **Create Project** (shortcut `C`).
2. Give the Project a name and an uppercase **key** such as `WEB`. The key is permanent and
   prefixes every Task code in the Project.
3. Open the Project and choose **Create task** (shortcut `N`). Your first Task gets the code
   `WEB-1`.

Tasks move through the Project's Statuses. You can view them as a **List**, a **Board** or grouped
by Milestone. See [Projects](../guides/projects) and [Tasks](../guides/tasks).

## 3. Invite your team

Open **Workspace settings → Members** to invite people by email and choose their role. Project
managers can then keep a Project open to the whole Workspace or make it private.

## 4. Work from the terminal

```sh
brew install assignso/tap/assign
assign login
assign                       # your active Tasks
assign project tasks WEB     # every Task in the Project
assign search "onboarding"
```

`assign login` opens your browser and stores the credential in your operating system's vault. See
the [CLI documentation](../cli/) for other install methods and every command.

## 5. Connect an AI assistant

```sh
assign mcp setup codex
```

That command registers `https://mcp.assign.so/` in Codex and starts its browser authorization.
You'll choose the Workspace and approve read, and optionally write, access. Other MCP clients
connect with the same URL. See [Connect a client](../mcp/connect).

## 6. Call the API

Personal API tokens work with the CLI-scoped API operations. Browser integrations use the session
and CSRF flow described in [Authentication](../api/authentication).

```sh
curl https://api.assign.so/api/v1/cli/my-work \
  -H "Authorization: Bearer $ASSIGN_TOKEN" \
  -H "Accept: application/json"
```

Start with the [API overview](../api/) and [conventions](../api/conventions).
