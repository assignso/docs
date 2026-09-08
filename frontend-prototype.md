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
- `/create-workspace` — first-Workspace onboarding and account-level additional Workspace creation

In the default local API mode, login and signup call Assign Core and establish
its browser session. Existing password users can request a four-hour,
single-use reset link from login and choose a new 12–128-character password.
The emailed link opens `/reset-password` with the token already supplied, the
request confirmation does not reveal whether an address is registered, and a
successful reset signs out every existing session. Accounts without a
Workspace continue to the guarded first-Workspace page, where the editable
path is filled automatically from the name. Signed-in accounts can also reach
the same page from the Workspace switcher or Account Billing & plans. The page
reads account-level eligibility, permits one claim-backed Free Workspace even
when the account already has other memberships, and leaves the current session
selected until the user explicitly opens the created Workspace.
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
window, briefly shows **Opening Assign…** while checking the saved session, and
then opens the active Workspace or Login as appropriate. It can reopen its
interface after a short network interruption. Your
Workspace data, uploads, and account actions still require a connection; Assign
does not store authenticated data or upload credentials for offline use.

Workspace settings replace the default app sidebar with grouped, icon-labelled
navigation for General, Members, Knowledge, Billing, Time tracking, Labels,
Task statuses, Project lifecycle, and Developer tools. Time tracking has a dedicated page in the
**Work management** group. Account settings use a separate contextual sidebar
for all account destinations. Both sidebars include **Back to app**, which
returns to the active Workspace Home; settings pages do not repeat the
destinations as tabs. Account and Workspace settings use a centered `max-w-2xl`
column with standard responsive page padding.
Account settings additionally show the current avatar, display name, and email
as rounded, bordered static context at the top of the scrollable sidebar content,
below the header's **Back to app** link and without opening the main profile menu.
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
provide keyboard-accessible sidebar navigation for Profile, Security, Active
sessions, Notifications, Connected accounts, Passkeys, Billing & plans, and MCP
access. Security contains email verification, password, authenticator-app, and
personal API-token controls; Profile contains personal details only.
Active sessions uses the existing account-security API to list active sessions
by Workspace and recent activity, mark the current session, and revoke another
session or all other sessions after confirmation; Assign does not collect or
show device, browser, IP-address, or location data. Connected accounts use the
server-driven linking flow in API mode. Notifications uses the persisted
twelve-category Workspace matrix: Inbox, email, push, and immediate/daily/weekly
delivery timing changes save independently, email remains read-only Off when
the Workspace has no paid entitlement, and push remains unavailable until a
confirmed browser or native endpoint exists. The Browser notifications action
uses the browser-owned permission prompt and service-worker subscription; its
unsupported, denied, enabled, disabled, and failed states are explicit. Inbox
supports server-side category filtering, grouped-activity counts, bounded
pagination, and the shared empty-state composition. Project shortcut
synchronization across devices and Project Task-label overrides are not
persisted through the public API yet.

Task, Project, and Document properties share a compact label picker. It supports
selecting several labels and creating a missing applicable label from the search
results. One selected label shows its color circle and name. When several labels
are selected, the closed control stays the same size and shows overlapping color
circles and a count instead of one chip per label; the picker does not maintain
a frequently-used section. On a phone-width Project List, grouping remains visible
beside one **Filters** button; Milestone, Status, assignee, and priority filters
open vertically in that popover instead of creating a horizontally scrolling row.
Desktop breadcrumbs keep the **Assign** home action and up to two nearest
clickable ancestors. The ellipsis opens the complete trail, including the
current page. On narrow phones, the current page title opens that trail in an
anchored popover. Links preserve the known Project and Document context; Escape
closes the popover and returns focus to its trigger.

Project List keeps the current group header visible while scrolling. Tap a
Task once to open it; scrolling or using an embedded control does not open it.
A successfully created Task refreshes the current list and its counts, and
previously visited lists refresh when reopened.

Workspace owners and administrators can reorder **Task statuses** by selecting
a destination **Position** or using **Move earlier** and **Move later**. Icon
choices show their symbols and names; Color offers named Tailwind colors and
an **Automatic** option. Existing custom colors remain selectable. Changes save
immediately and appear in the shared Status catalog.

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
The authenticated shell keeps the **Assign → Project name → Task name** hierarchy.
Inside the narrow Task canvas, Assign does not repeat that trail: the first line
above the title starts with the visible immutable Task code as a labelled copy
action. It shares the line with the
avatar-only **Participants** group, Follow control, and compact outlined
Task-actions menu; these lead into the title. The participant group appears
before Follow and shows up to three avatars plus `+N`, with no visible label or
surrounding border; the actions menu is wide enough to keep its labels on one
line. Description, attachments, relations, and comments stay compact when empty.
For active Tasks, **Description history** in the Task-actions menu opens retained
description snapshots only when requested. Each entry previews its saved text;
restoring an earlier entry asks for confirmation, creates a new Task revision,
and keeps the overwritten description available in history.
On Task detail, Attachments and Relations are flat separator rows with counts and
Add actions rather than rounded panels. Each saved relation is one inline row;
Add opens one inline relation-type dropdown and Task picker with a cancel control
instead of a modal or collapsible list. Once both selections are available, Assign
creates the relation automatically without a separate save action. Type in the
Task picker to search the bounded available Tasks. Comments uses
an unpanelled heading and
full-width composer; its submit action appears after the composer receives focus
or content. Pasted Comment permalinks keep a visible comment qualifier and their
exact `comment` query pointer; previously issued `#comment-*` fragments remain
compatible. Following one waits for the destination Task's bounded Comment
load, then centers, focuses, and highlights that Comment. Reaction changes from
other connected clients reconcile automatically without a page reload.
Deleted Comments disappear from the discussion and print view. Links to later
Comments keep their original numbers; a deleted Comment link never selects a
different Comment.
Comment authors and other roster-resolved human identities open their Workspace
profiles. User, Task, Project, and Document references inside posted Comments open
their authorized destinations; unavailable references remain non-clickable.
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
Project icon and one-line name, with the Create task action and Project-actions
menu aligned to the title. A uniformly small-text metadata row shows the
immutable Project key as code and a shortened external hostname with a reduced
link icon when configured. The header omits Task count and member avatars, then
shows a description summary of at most two lines.
**More** appears only when the summary overflows; the full description remains
available with **Less** after its final text. On the narrowest phones Create task
is shown as an accessible `+`, and the tab strip scrolls horizontally instead of
wrapping or pushing actions off screen. Project settings and Copy Project link
are available from the end-aligned Project-actions menu rather than a separate
gear. The menu sizes to its item content and keeps every item on one line.
On layouts with room for keyboard hints, Create task entry buttons show `N` and
the Projects collection's Create Project button shows `C`. These hints navigate
to the dedicated creation pages; submit buttons inside those pages do not repeat
the global shortcuts.

Ordinary Task edits use their local pending and settled state without showing a
**Saving**, **Saved**, or spinner indicator. A rejected edit still restores
or reconciles the affected value and shows actionable rollback feedback; Task
creation, Project moves, lifecycle actions, copying, and bulk operations retain
their contextual result messages.

Projects also have a readable path generated from their name. Authorized
members can edit it in Project settings; Project links use
`/app/{workspaceSlug}/projects/{projectPath}` while the disabled Project key
remains the stable Task-code prefix. Task pages use
`/app/{workspaceSlug}/tasks/{taskCode}` and are not nested beneath a Project.
Use **Copy task link** in the Task actions menu to copy that canonical absolute
URL; clipboard success or failure is shown without navigating away.
Use **Copy prompt** to copy a short agent handoff containing the visible Task
code, title, and canonical URL. Assign does not open an external provider or put
private Task content into an outbound URL.
Legacy opaque-ID links redirect to these canonical routes. Renaming the active
Workspace replaces its slug in the current URL without changing the underlying
Workspace session, and My Work uses the same full-width page frame as Home.
Home’s Assigned to me rows show Task code, title, and Status; Recently updated
rows show Task code, title, and assignee. My Work shows each Task’s priority and
Status alongside its code, title, and view-relevant due date. Home does not
show an Activity feed; historical changes stay on their contextual resource
surfaces.

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
and tombstone deletion to authorized actors.
Comments created through MCP or another mediated channel retain the author,
snapshot a compound creation Actor such as `user:mcp`, and show the same
accessible provenance badge as Activity. Task Activity links each
Comment event to the matching Comment or tombstone instead of showing an
unreferenced repeated action. Task details also create, change
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
grouping and filter context rather than only the rows visible on screen. Detail
pages request portrait orientation. Task printing also omits empty attachment,
relationship, and Comment regions and uses the available page space before
continuing onto another sheet.

### Project Board controls

Open a Task by clicking its card or pressing Enter while the card is focused.
The title is also a Task link: Ctrl/Cmd-click or middle-click opens it in a new
tab. Arrow keys navigate between cards; Shift plus an arrow moves a Task, while
Shift+Home and Shift+End move it to the top or bottom. Keys inside an editable
control retain their normal editing behavior.

Moves appear immediately. If saving fails, the board restores the acknowledged
placement and explains the failure. Updates from other clients preserve newer
edits, and a delayed response does not undo an already confirmed move. Cards
remain in place while unrelated Tasks update. On touch screens, ordinary
scrolling remains browser-native; the Task page also provides status editing.

Project Board columns load independently. Active columns offer **Show more**;
completed and cancelled columns show a bounded recent snapshot with a full count
and **View all** for older Tasks. A failed column read retains visible content
and offers **Retry**. Movement stays unavailable until permission is resolved.

Open a Task and use **Task actions** for **Move up**, **Move down**, **Move to top**,
**Move to bottom**, or **Move to status**. These controls use the shared Task
order, including neighbors outside the loaded Board page. Keyboard menu
navigation and ordinary touch activation provide alternatives to dragging.
