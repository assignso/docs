---
description: Where to find Account and Workspace settings, including security, sessions, notifications, members, labels, statuses and developer tools.
---

# Settings

Assign has two groups of settings. **Account settings** belong to you and follow you across
Workspaces. **Workspace settings** apply to everyone in the current Workspace, and most of them
require the owner or admin role. Both have **Back to app** at the top of their sidebar.

## Account settings

The upcoming [Account deletion flow](./delete-account.md) belongs to **Security → Delete account**.

| Page | What you can do |
| --- | --- |
| **Profile** | Name, username, avatar and other personal details |
| **Security** | Verify your email, change your password, set up an authenticator app and recovery codes |
| **Access tokens** | Create and manage personal API tokens for your integrations |
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

### Account deletion <Badge type="warning" text="Upcoming" />

Security includes a deletion request with a seven-day cancellation window. The [account deletion guide](account-deletion.md) explains confirmation, ownership and checkout blockers, status recovery, cancellation and retained records.

### Billing & plans refresh <Badge type="warning" text="Awaiting deployment" />

The page refreshes your Free Workspace allowance and the Workspace plans you have loaded when
their account data changes or the connection recovers. It reloads previously loaded pages after
recovery. It loads up to 1,000 Workspaces and states that limit if more exist.

## Workspace settings

| Group | Pages |
| --- | --- |
| **General** | Name, URL path, icon and archiving |
| **Members** | Invite people, change roles and revoke invitations |
| **Knowledge** | Workspace Knowledge and connected sources |
| **Billing** | Plan and invoices |
| **Work management** | Labels, Task statuses, Project lifecycle and Time tracking |
| **Developer tools** | AI integrations, service credentials and integrations |

If you switch Workspaces or lose access while Billing is opening checkout, the billing portal or a sandbox credit top-up, the old page will not send you to that session when it responds. <Badge type="warning" text="Awaiting deployment" />

### Members list recovery <Badge type="warning" text="Awaiting deployment" />

If the Members page cannot refresh its member and invitation lists, it hides both lists and asks you to refresh the page. This prevents an old list from appearing current.

### Status behaviors <Badge type="warning" text="Awaiting deployment" />

In **Work management**, each Task status, Milestone stage and Project stage shows what it does: whether it counts as closed or completed, resolves blockers, sends notifications or accepts new items. Renaming or reordering a status never changes these behaviors.

To change behavior, an administrator moves items to another status with **Move items…**. Assign shows how many items are affected and what changes, and asks you to acknowledge material changes before it applies them. Larger moves run in the background and can be retried if they stop. Cancelled Tasks count as closed but are left out of progress totals.

### AI access

**Developer tools → AI integrations** controls whether MCP clients and AI features can reach the
Workspace. Turning it off blocks existing and new MCP connections immediately, without
disconnecting the same client from your other Workspaces. See
[Control AI and MCP access](../api/workspaces#ai-and-mcp-access).

### Service credentials

Owners and admins can create non-interactive MCP credentials for CI or a trusted service. See
[Scopes and credentials](../mcp/security#service-credentials).

## Project settings

Open **Project actions → Project settings** to change the name, path, description, visual identity,
dates, members and visibility. The Project **key** is shown for reference and can't be changed.

## Theme preference

Under Account Settings → Interface, choose **System**, **Light** or **Dark**. System follows this device’s appearance and responds when it changes. Theme changes save immediately in this browser. Other interface preferences apply across Workspaces and devices.

## Mobile Account settings <Badge type="warning" text="Upcoming" />

On mobile, open **Profile → Settings** to reach your Profile and **Preferences → Interface**. Profile changes save after you finish a valid text edit; Interface choices save when selected. Timezone, Locale and First day of week distinguish your Account override from **Use Workspace default**. These choices do not grant Workspace administration access.

Keep your draft if a save fails. **Recover original change** checks the result of the same change; **Refresh profile** loads the current acknowledged values. Account changes require a connection. Picture replacement depends on your mobile build; when available, choose a PNG or JPEG, review the square crop and select **Use picture**. Your existing picture stays in place until the new one is acknowledged.

## Log in or create an account on mobile <Badge type="warning" text="Upcoming" />

On the Assign welcome screen, choose **Log in** or **Create account**. Enter your email and choose **Continue with email**. You can edit your email while entering your password or account details.

When you create an account, check your inbox for the verification link. If Assign says it could not send the email, choose **Resend verification email**. After you log in, select a Workspace or create your first one.

## Native account recovery <Badge type="warning" text="Upcoming" />

If sign-in fails, Assign keeps your email so you can re-enter your password and try again. If Assign can't load your account after sign-in, choose **Try again** to retry loading it.

After continuing with your email, choose **Forgot password?** to request a recovery email. A request confirmation does not confirm delivery; check your inbox and spam folder, then request another email if needed. An unverified address may receive a verification link first. After verifying it, request a password reset.

When a supported email link opens in Assign, confirm verification or enter your new password and confirmation. An expired or used link offers **Request a new link**. Resetting signs out existing sessions; sign in again with your new password. Verification alone does not sign you in. If the result cannot be confirmed, request a new link before trying again. Reopen the email after leaving or backgrounding the recovery form. Browser recovery remains available when the email opens there.
