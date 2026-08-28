# Assign frontend prototype

The current Assign 3.0 web build is an interaction prototype. Its public pages are available at:

- `/` — Home
- `/features` — implemented foundation features
- `/pricing` — pricing principles and a clear pre-launch notice
- `/about` — product thesis and principles
- `/login` — prototype login
- `/forgot-password` — request password reset instructions
- `/reset-password` — redeem a reset token and choose a new password
- `/verify-email` — redeem the token from a verification email link
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

Workspace settings provide dedicated General, Members, and Labels routes.
Authorized member managers can invite people, change
membership roles, and revoke pending invitations from Members. Labels are
separated into editable global Project, Document, and Task panels. Project
shortcuts assign the sidebar numbers `1` through `9` permanently for a
Workspace in the current browser; reordering Projects does not renumber them.
Account settings provide the numbered Project-shortcut manager for the selected
Workspace, also reachable from the sidebar Project-section settings action. A
new Project takes the first open number without changing existing assignments
or restoring Projects the user intentionally left unassigned.
Project settings show an immutable Project key, an owner-first Members page
with manager/contributor/viewer controls, plus Project-local Task labels
and, in fixture mode, allow a Project-specific name and color override for a
global Task label without changing its shared identity. Project managers can
switch between Workspace and private access. The explicit Project owner or a
Workspace administrator can
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
results. One selected label shows its color circle and name. When several labels
are selected, the closed control stays the same size and shows overlapping color
circles and a count instead of one chip per label; the picker does not maintain
a frequently-used section.
Authenticated breadcrumbs retain the v2-style `Assign` home action. On compact
desktop widths, the path to a Project or Document remains clickable. Project
collection pages end at the Project path and omit the redundant view label such
as List or Board; other pages retain a non-interactive current-page label. On
narrow phones intermediate path segments collapse before the header controls do.
Task detail retains its narrow centered reading canvas. Its 28px property controls,
including Log time when enabled, use intrinsic widths, share a solid visible
border, and wrap together as an inline row; they do not stretch into full-width
fields. Project, Status, and Assignee remain visible. Populated Priority,
Milestone, Due date, and Labels remain directly editable, while empty optional
properties are available through one compact **Add property** menu. Task creation
continues to show the complete property row. An authorized Project change lists
only Projects in the current Workspace
and moves the Task to its updated canonical URL. The Due date calendar provides
**Clear** to unset the date and **Now** to choose today's local calendar date.
The assignee mark is smaller
than the standard property icon so its circular identity treatment does not
appear oversized.
The Task page surrounds that compact property row with a simpler document
hierarchy: **Assign → Project name → Task name**. Assign links to Workspace Home,
the Project name links to its List, and the Task name identifies the current page.
An adjacent labelled copy action preserves access to the immutable Task code.
These share a line with the
avatar-only **Participants** group, Follow control, and compact outlined
Task-actions menu; these lead into the title. The participant group appears
before Follow and shows up to three avatars plus `+N`, with no visible label or
surrounding border; the actions menu is wide enough to keep its labels on one
line. Description, attachments, relations, and comments stay compact when empty.
On Task detail, Attachments and Relations are flat separator rows with counts and
Add actions rather than rounded panels. Each saved relation is one inline row;
Add opens one inline relation-type dropdown and Task picker with a cancel control
instead of a modal or collapsible list. Once both selections are available, Assign
creates the relation automatically without a separate save action. Comments uses
an unpanelled heading and
full-width composer; its submit action appears after the composer receives focus
or content.
The top bar's **Current task** control selects at most one active, in-progress
Task assigned to you across all of your Workspaces. Choosing another Task
replaces the selection, clearing removes it, and the Task page offers the same
action when that Task is eligible. A short **Undo** action follows a successful
change. When selected, it shows the Task title and code without a visible
**Current** prefix, plus a colorful focus icon; its accessible name still
identifies the current-task state. Assign automatically clears a selection that
stops being eligible.
Document scope, Project, parent, and Labels use the same compact 24px,
intrinsic-width, visibly bordered inline presentation without changing the
Document canvas.
Project settings show Visual identity as a 64px square selector with one enlarged
selected icon or emoji; its accessible name identifies the marker without
repeating it visually.
The Project tab strip keeps List as the bare Project-route default and omits
Overview. **Project overview** is the first item in the top-right Project-actions
menu and retains its direct URL without displaying or handling an `O` shortcut.
Overview makes one bounded API request for Project health,
owner-first membership, lifecycle-aware Task and Milestone progress, Status
distribution, and capped recent resources. Current Tasks in the authoritative
In progress and In review categories appear under Ongoing work; immutable recent
Activity remains a separate section.
Every authenticated Project route starts with the same compact header: one
Project icon and one-line name, the Create task action and Project-actions menu,
a description summary of at most two lines, then Project key, Task count,
owner-first member avatars, and a shortened external hostname. **More** appears
only when the summary overflows; the full description remains available with
**Less** after its final text. On the narrowest phones Create task is shown as an
accessible `+`, and the metadata and tab strips scroll horizontally instead of
wrapping or pushing actions off screen. Project settings and Copy Project link
are available from the end-aligned Project-actions menu rather than a separate
gear. The menu sizes to its item content and keeps every item on one line.

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
selected resource. People matches appear when that server capability is
available; a People-only failure does not hide otherwise valid results. On
phones, the Search dialog and its internally scrolling results remain inside
the visible viewport. Search never performs a client-side scan of Workspace
content in API mode.

Documents are available at `/app/{workspace}/documents`;
`/app/{workspace}/documents/new` creates one, and each Document opens at
`/app/{workspace}/documents/{documentPath}`. The permanent path is generated
from the creation title; duplicate titles receive `-1`, `-2`, and subsequent
numeric suffixes. In API mode, Document metadata and versioned content load
from and save to Assign Core, including stale-version recovery, direct-child
loading, labels, search indexing, and published-document links. Task comments
load when a Task is opened, post idempotently, and expose revision-gated edit
and tombstone deletion to authorized actors. Task details also create, change
the type of, and remove typed Task relations. The Project Milestones view links
to dedicated create and
edit pages; its progress cards open the existing Project List with a shareable
milestone filter, while card overflow actions copy the filtered link or archive
the milestone. Project List can group Tasks by Status, assignee, or milestone;
Status is the default, while selecting another grouping or no grouping remains
shareable in the URL. List and Backlog rows reuse the same compact Status and
assignee controls as Task properties. Their title-edit pencil appears on row
hover or focus, including after a touch activates the row. Selected Tasks can
be managed from the shared bottom bar on both views: it shows the selected
count, stays centered against the browser viewport, opens Actions with its
visible `A` keycap, and clears selection with its labelled control and visible
Backspace keycap. Actions retain the existing Status, assignee, and milestone
changes and add selected-Task CSV export, archive, and recoverable delete.
Archive and delete ask for confirmation; successful Tasks leave the selection,
while failures remain selected for review or retry. Milestones continue to
appear in the Task property selector. Task descriptions use the same editor
and persist through the Task create and update contract, while unchanged
property selections perform no update. See
[Writing in Assign](editor.md) for editor behavior.

Browser printing uses a print-only document layout on Task detail, Project
List, the Documents listing, and Document detail. The header identifies Assign,
the active Workspace, and the current User ID. Navigation, editing controls,
menus, and action buttons are omitted; property inputs and editor content print
as plain text. Project List prints the complete current result with its active
grouping and filter context rather than only the rows visible on screen.
