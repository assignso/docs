# Assign frontend prototype

The current Assign 3.0 web build is an interaction prototype. Its public pages are available at:

- `/` — Home
- `/features` — implemented foundation features
- `/pricing` — pricing principles and a clear pre-launch notice
- `/about` — product thesis and principles
- `/login` — prototype login
- `/forgot-password` — request password reset instructions
- `/reset-password` — redeem a reset token and choose a new password
- `/signup` — prototype signup
- `/create-workspace` — guarded first-Workspace onboarding

In the default local API mode, login and signup call Assign Core and establish
its browser session. Existing password users can request a four-hour,
single-use reset link from login and choose a new 12–128-character password.
The emailed link opens `/reset-password` with the token already supplied, the
request confirmation does not reveal whether an address is registered, and a
successful reset signs out every existing session. Accounts without a
Workspace continue to the guarded first-Workspace page, where the editable
path is filled automatically from the name; accounts with one open it directly.
Explicit fixture mode simulates the same transitions without storing an
account. Google and GitHub hand off to Assign Core when those providers are
configured.

Compatible browsers also show **Sign in with a passkey** on the login page.
Signed-in users manage passkeys under Account settings → Passkeys: they can add
a device credential, rename or remove it, review whether it is synced or
device-bound, and see when Assign disabled an unsafe credential. Keep a
password or connected Google, GitHub, or Apple account as a recovery method if
an authenticator is lost; Assign refuses removal of the last usable sign-in
method.

The authenticated product prototype lives under `/app/*`. Opening `/app`
verifies the browser session and forwards a signed-in account to its current
Workspace, sends an account without a Workspace to first-Workspace setup, or
returns an unauthenticated visitor to login. The interaction lab is at
`/__lab`. The default local workflow uses a persistent PostgreSQL
database and the public generated SDK for the implemented Workspace, Project,
Status, Task, Document, and Comment operations. The separate fixture workflow
remains generated and non-persistent.

## Installing the web app

On browsers that support web-app installation, use the browser's **Install** or
**Add to Home Screen** action for Assign. The installed app opens in its own
window and can reopen its interface after a short network interruption. Your
Workspace data, uploads, and account actions still require a connection; Assign
does not store authenticated data or upload credentials for offline use.

Workspace settings provide dedicated General, Members, Labels, and Project
shortcuts routes. Authorized member managers can invite people, change
membership roles, and revoke pending invitations from Members. Labels are
separated into editable global Project, Document, and Task panels. Project
shortcuts assign the sidebar numbers `1` through `9`
permanently for a Workspace in the current browser; reordering Projects does
not renumber them, and each assignment can be changed or cleared from settings.
Project settings show an immutable Project key plus Project-local Task labels
and, in fixture mode, allow a Project-specific name and color override for a
global Task label without changing its shared identity. Project settings also
let the explicit Project owner or a Workspace administrator
publish an unlisted read-only status link after confirmation. Visitors see only
the Project name/marker and aggregate workflow Task counts; unpublishing or
archiving revokes the link immediately. Account settings
provide keyboard-accessible route navigation for Profile, Active sessions,
Notifications, Connected accounts, Passkeys, Subscription, and MCP access.
Active sessions uses the existing account-security API to list active sessions
by Workspace and recent activity, mark the current session, and revoke another
session or all other sessions after confirmation; Assign does not collect or
show device, browser, IP-address, or location data. Connected accounts use the
server-driven linking flow in API mode. Notification preferences, Project
shortcut synchronization across devices, and Project Task-label overrides are
not persisted through the public API yet.

Task, Project, and Document properties share a compact label picker. It supports
selecting several labels and creating a missing applicable label from the search
results. When several labels are selected, the closed control stays the same
size and shows their color indicators and count instead of one chip per label;
the picker does not maintain a frequently-used section.

Projects also have a readable path generated from their name. Authorized
members can edit it in Project settings; Project links use
`/app/{workspaceSlug}/projects/{projectPath}` while the disabled Project key
remains the stable Task-code prefix. Task pages use
`/app/{workspaceSlug}/tasks/{taskCode}` and are not nested beneath a Project.
Legacy opaque-ID links redirect to these canonical routes. Renaming the active
Workspace replaces its slug in the current URL without changing the underlying
Workspace session, and My Work uses the same full-width page frame as Home.
Home’s Assigned to me rows show Task code, title, and Status; Recently updated
rows show Task code, title, and assignee. My Work shows each Task’s priority and
Status alongside its code, title, and view-relevant due date.

The Search control in the application header (or `/` when focus is not in a
text field) opens a Workspace-scoped modal. It queries the server after a short
debounce, shows Project, Task, and Document title matches, and opens the
selected resource. Search never performs a client-side scan of Workspace
content in API mode.

Documents are available at `/app/{workspace}/documents`;
`/app/{workspace}/documents/new` creates one, and each Document opens at
`/app/{workspace}/documents/{documentPath}`. The permanent path is generated
from the creation title; duplicate titles receive `-1`, `-2`, and subsequent
numeric suffixes. In API mode, Document metadata and versioned content load
from and save to Assign Core, including stale-version recovery, direct-child
loading, labels, search indexing, and published-document links. Task comments
load when a Task is opened, post idempotently, and expose revision-gated edit
and tombstone deletion to authorized actors. Task details also create and remove
typed Task relations. The Project Milestones view links to dedicated create and
edit pages; its progress cards open the existing Project List with a shareable
milestone filter, while card overflow actions copy the filtered link or archive
the milestone. Project List can group Tasks by Status, assignee, or milestone;
the selected grouping is shareable in the URL, and selected Tasks can still be
bulk-assigned to a milestone. Milestones continue to appear in the Task property selector. Task
descriptions use the same editor and persist through the Task create and update
contract, while unchanged property selections perform no update. See
[Writing in Assign](editor.md) for editor behavior.
