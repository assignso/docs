---
description: Where to find Account and Workspace settings, including security, sessions, notifications, members, labels, statuses and developer tools.
---

# Settings

Assign has two groups of settings. **Account settings** belong to you and follow you across
Workspaces. **Workspace settings** apply to everyone in the current Workspace, and most of them
require the owner or admin role. Both have **Back to app** at the top of their sidebar.

## Account settings

| Page | What you can do |
| --- | --- |
| **Profile** | Name, username, avatar and other personal details |
| **Security** | Verify your email, change your password, set up an authenticator app and recovery codes, create personal API tokens |
| **Passkeys** | Add, rename or remove passkeys. Assign flags credentials it has disabled for safety |
| **Active sessions** | See your sessions by Workspace and recent activity, then sign out one or all others |
| **Connected accounts** | Link or unlink Google, GitHub or Apple |
| **Notifications** | Choose Inbox, email and push delivery, and immediate, daily or weekly timing, for each category |
| **Billing & plans** | Review Workspace plans and create another Workspace |
| **MCP access** | Review connected AI clients and disconnect them |
| **Project shortcuts** | Assign the `1`–`9` shortcuts to Projects |

Assign won't remove your last usable sign-in method. Keep a password or connected account in case
you lose a passkey or authenticator. Active sessions never show device, browser, IP address or
location, because Assign doesn't collect them.

## Workspace settings

| Group | Pages |
| --- | --- |
| **General** | Name, URL path, icon and archiving |
| **Members** | Invite people, change roles and revoke invitations |
| **Knowledge** | Workspace Knowledge and connected sources |
| **Billing** | Plan and invoices |
| **Work management** | Labels, Task statuses, Project lifecycle and Time tracking |
| **Developer tools** | AI integrations, service credentials and integrations |

### AI access

**Developer tools → AI integrations** controls whether MCP clients and AI features can reach the
Workspace. Turning it off blocks existing and new MCP connections immediately, without
disconnecting the same client from your other Workspaces. See
[Control AI and MCP access](../api/workspaces#control-ai-and-mcp-access).

### Service credentials

Owners and admins can create non-interactive MCP credentials for CI or a trusted service. See
[Scopes and credentials](../mcp/security#service-credentials).

## Project settings

Open **Project actions → Project settings** to change the name, path, description, visual identity,
dates, members and visibility. The Project **key** is shown for reference and can't be changed.
