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

The authenticated product prototype lives under `/app/*`, with the interaction
lab at `/__lab`. The default local workflow uses a persistent PostgreSQL
database and the public generated SDK for the implemented Workspace, Project,
Status, Task, Document, and Comment operations. The separate fixture workflow
remains generated and non-persistent.

Workspace settings provide dedicated General, Labels, and Project shortcuts
routes. Labels are separated into editable global Project, Document, and Task
panels. Project shortcuts assign the sidebar numbers `1` through `9`
permanently for a Workspace in the current browser; reordering Projects does
not renumber them, and each assignment can be changed or cleared from settings.
Project settings show an immutable Project key plus Project-local Task labels
and, in fixture mode, allow a Project-specific name and color override for a
global Task label without changing its shared identity. Account settings
provide keyboard-accessible route navigation for Profile, Notifications,
Connected accounts, Subscription, and MCP access. Connected accounts use the
server-driven linking flow in API mode. Notification preference controls,
Project shortcut synchronization across devices, and Project Task-label
overrides are not persisted through the public API yet.

Projects also have a readable path generated from their name. Authorized
members can edit it in Project settings; Project links use
`/app/{workspaceSlug}/projects/{projectPath}` while the disabled Project key
remains the stable Task-code prefix. Task pages use
`/app/{workspaceSlug}/tasks/{taskCode}` and are not nested beneath a Project.
Legacy opaque-ID links redirect to these canonical routes. Renaming the active
Workspace replaces its slug in the current URL without changing the underlying
Workspace session, and My Work uses the same full-width page frame as Home.

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
load when a Task is opened and post idempotently to the server. Task
descriptions use the same editor and persist through the Task create and update
contract, while unchanged property selections perform no update. See
[Writing in Assign](editor.md) for editor behavior.
