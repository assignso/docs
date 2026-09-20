# Projects and Statuses

These operations require an authenticated browser session (see
[Browser authentication](authentication.md)) and follow the shared
[API conventions](conventions.md), including `Idempotency-Key` on creates and
`If-Match`/`ETag` on updates. The anonymous public-status read is the explicit exception described below.

## List Workspace Projects

```http
GET /api/v1/workspaces/{workspace_id}/projects?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one page of the Workspace's Projects in their shared manual order. `workspace_id`
must match the caller's current session Workspace; any other value reports
the same `404` used for an absent Workspace.

```json
{
  "items": [
    {
      "id": "<project-id>",
      "workspace_id": "<workspace-id>",
      "name": "Assign",
      "key": "ASSIGN",
      "path": "assign",
      "description": null,
      "url": null,
      "project_state_id": null,
      "visual_identity": null,
      "next_task_number": 43,
      "revision": 1,
      "created_at": "2026-08-15T12:00:00Z",
      "updated_at": "2026-08-15T12:00:00Z",
      "archived_at": null
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

## Create a Project

```http
POST /api/v1/workspaces/{workspace_id}/projects HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"name": "Assign", "key": "ASSIGN"}
```

Creates a Project with its default `Backlog`/`Todo`/`In Progress`/`Done`
workflow and returns `201` with the created Project and its `ETag`.

`key` is the uppercase-normalized ticket prefix, `^[A-Z][A-Z0-9]{1,7}$`,
unique per Workspace and immutable after creation. It is not a substitute
for the opaque `id`. A key already used in the Workspace returns
`409 project_key_taken`.

The server generates `path` from `name`. It is a lowercase, hyphen-separated
browser path unique within the Workspace; the returned Project is the source
of truth when constructing its UI URL.

## Read a Project

```http
GET /api/v1/projects/{project_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns the Project with its current `ETag`. A Project outside the caller's
Workspace is indistinguishable from an absent one (`404`).

## Read a Project overview

```http
GET /api/v1/projects/{project_id}/overview HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one private, non-cacheable Project summary for overview screens. The
response combines Project metadata, the first three owner-first Project
members and exact member count, lifecycle-aware Task counts, Milestone
progress, the authoritative Status distribution, and bounded recent data.
Each Status distribution row includes its stable identifier, lifecycle type,
optional icon and color, position, and Task count so clients do not infer
semantics or appearance from the label.
Recent Tasks, Activity items, Documents, and files each contain at most five
items. Ongoing work contains at most five active Tasks in each of the stored
`in_progress` and `in_review` Status categories; Status display names do not
control that classification, and ongoing work is separate from historical
Activity.

`freshness` reports when the projection was generated and the newest source
update it observed. If a nonessential section is unavailable, `degradation`
names it so a client can show a partial state without downloading full
collections. Clients should use this operation once rather than listing and
aggregating Tasks, members, events, Documents, or files themselves. A Project
that is absent or unreadable returns the same `404` response.

## Update Project identity

```http
PATCH /api/v1/projects/{project_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
If-Match: "1"
Content-Type: application/json

{"name": "Assign Core"}
```

Send exactly one of `name`, `path`, `description`, `url`, `visual_identity`,
`owner_actor_id`, or `project_state_id`, or send the complete nullable
`start_on`/`target_on` pair.
A path change uses the same request with, for example,
`{"path":"assign-core"}`. `path` must match
`^[a-z0-9]+(?:-[a-z0-9]+)*$`, be at most 63 characters, and be unique within
the Workspace. `key` cannot be changed by this or any other operation.
`If-Match` must carry the revision last observed by the client; a stale
revision returns `409`.

`description` is optional plain text, capped at 500 characters. `url` is an
optional absolute HTTP or HTTPS link, capped at 2,048 characters. Send either
field as `null` (or an empty string) to clear it. Both are returned only to
authenticated Project readers; they never appear in the anonymous public
Project status response.

`start_on` and `target_on` are date-only planning metadata. Send both keys in
one revision-checked update, each as an ISO date or `null`; a target date may
not precede a start date. They are authenticated-only and never appear in the
anonymous public Project-status response.

Set a decorative Project marker with either an allowlisted icon or one
fully-qualified Unicode Emoji 17.0 sequence:

```json
{"visual_identity":{"kind":"icon","value":"rocket"}}
```

```json
{"visual_identity":{"kind":"emoji","value":"🚀"}}
```

Send `{"visual_identity":null}` to restore the default folder marker. The
marker supplements the Project name and never replaces it. New Projects have
`visual_identity: null`.

The icon values in this API version are: `activity`, `alarm-clock`, `anchor`,
`archive`, `award`, `badge-check`, `bell`, `bike`, `blocks`, `book-open`,
`bookmark`, `box`, `boxes`, `briefcase`, `bug`, `building-2`, `calendar`,
`camera`, `castle`, `chart-column`, `circle-check-big`, `circuit-board`,
`cloud`, `code-2`, `coffee`, `compass`, `construction`, `cpu`, `credit-card`,
`crown`, `database`, `diamond`, `dumbbell`, `earth`, `eye`, `factory`,
`feather`, `file-text`, `flag`, `flame`, `flask-conical`, `flower-2`, `folder`,
`folder-kanban`, `gamepad-2`, `gauge`, `gem`, `gift`, `git-branch`, `globe-2`,
`graduation-cap`, `hammer`, `handshake`, `headphones`, `heart`, `home`, `image`,
`key-round`, `landmark`, `laptop`, `layers-3`, `leaf`, `library`, `lightbulb`,
`link-2`, `list-todo`, `mail`, `map`, `map-pin`, `medal`, `megaphone`,
`message-square`, `microscope`, `monitor`, `mountain`, `music-2`, `package`,
`palette`, `pen-tool`, `pie-chart`, `puzzle`, `rocket`, `scale`, `search`,
`settings`, `shield`, `shopping-bag`, `smile`, `sparkles`, `star`, `tags`,
`target`, `terminal`, `timer`, `trophy`, `users`, `video`, `wallet`,
`wand-sparkles`, and `zap`.

In the app, members with Project write access can change this marker from
Project settings. It is shown with the Project name in cards, navigation,
headers, search results, and Project selectors.

## Project lifecycle and states

Project lifecycle is an optional Workspace capability. It starts disabled and
does not replace Project archive, trash, restore, or purge. Read its policy with
`GET /api/v1/workspaces/{workspace_id}/project-lifecycle`; Workspace owners and
administrators update it with revision headers and
`PATCH /api/v1/workspaces/{workspace_id}/project-lifecycle`:

```json
{"enabled":true}
```

When enabled, `GET`/`POST
/api/v1/workspaces/{workspace_id}/project-states` reads or appends to the
maximum-100 custom-label catalog. `PATCH` and `DELETE
/api/v1/project-states/{state_id}` rename, restore with `{"archived":false}`,
or archive a state; `POST /api/v1/project-states/{state_id}/move` uses neighbour
anchors and an expected revision. Labels are 1–80 characters and have no
required defaults or semantic categories.

An in-use state cannot be archived alone. Move its active Projects atomically
and archive it with:

```http
POST /api/v1/project-states/{state_id}/archive-and-replace
If-Match: "4"
Idempotency-Key: <opaque-client-key>

{"replacement_state_id":"<active-state-id>"}
```

Set or clear a Project's state through the normal revision-checked Project
update with `{"project_state_id":"<active-state-id>"}` or
`{"project_state_id":null}`. Disabling the capability preserves the catalog
and existing selections, but refuses catalog/selection mutations and clients
hide the selector until it is enabled again.

## Archive a Project

```http
DELETE /api/v1/projects/{project_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "4"
Idempotency-Key: <opaque-client-key>
```

Archives the Project and returns `204`. Supply the Project revision most
recently returned in its `ETag`; stale revisions return `409`. Retrying the
same request with the same idempotency key replays the original result.

## Move a Project

Move a Project between its current neighbours using opaque Project IDs. The
manual order is shared by the Workspace: one member's move changes the list
for every other member. The server owns the fractional rank, so clients must
not send a position or rank.

```http
POST /api/v1/projects/{project_id}/move HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"after_id":"<preceding-project-id>","before_id":"<following-project-id>","expected_revision":4}
```

Either anchor may be `null` to place the Project at an end. With both anchors
`null`, the server places it at the head of a non-empty collection. The
response is `200` with the moved Project and its new `ETag`. A stale
`expected_revision` returns `409 revision_conflict` and a missing, archived,
or foreign-workspace anchor returns `409 anchor_not_found`; both `409`
responses carry the current Project and `ETag` so a client can re-anchor
without a separate read. Anchors in reverse order return `422
invalid_anchors`. Retrying the same request with the same `Idempotency-Key`
replays the original result.

## Manage Project members and visibility

Project visibility is `workspace`, `private`, or `public`. Workspace Projects
follow normal Workspace capabilities. Private Projects are returned only to
their explicit Project members, Project owner, and Workspace owners/admins;
denied Projects and their Tasks, Documents, attachments, search/reference
results, My Work entries, and Inbox items are omitted or use the same `404` as
an absent resource. Public affects only the sanitized anonymous status view
described below.

List the actual Project roster, owner first, in pages of at most 100:

```http
GET /api/v1/projects/{project_id}/members?limit=50 HTTP/1.1
```

The response includes `items`, `next_cursor`, `has_more`, and exact
`total_count`. Each member has `actor_id`, `display_name`, a `manager`,
`contributor`, or `viewer` role, `is_owner`, and a revision. Project managers
and Workspace owners/admins may add an active Workspace Actor:

```http
POST /api/v1/projects/{project_id}/members HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"actor_id":"<active-workspace-actor-id>","role":"contributor"}
```

Change a non-owner role with `PATCH
/api/v1/projects/{project_id}/members/{actor_id}` and `If-Match`, or remove it
with `DELETE` and the same revision header. The current owner remains a manager
and cannot be demoted or removed before ownership is transferred. These
operations change only Project access; they never create or remove Workspace
membership.

In the web app, Project settings lists active Workspace members you can add to
the Project. Workspace owners and admins can also send a Workspace invitation
from this page. An invited person receives no Project access until they accept
the invitation and a Project manager adds them with a Project role.

Project responses expose `permissions.can_manage_members`. A manager can use
the revisioned Project update to switch between Workspace and private access:

```json
{"visibility":"private"}
```

## Publish a read-only Project status

Every Project response identifies its current `owner_actor_id`, its `workspace`,
`private`, or `public` visibility, nullable opaque `public_id`, and explicit
`permissions.can_publish` and `permissions.can_manage_members`. The creating
owner is initially the Project lead;
a later audited transfer may change this identifier. Only the current Project
owner or a current Workspace owner/admin may publish or unpublish; clients
must use the permission response rather than infer this from a locally cached
role.

Transfer ownership (and therefore the Project lead) with the same revisioned
update. The current owner or a Workspace owner/admin may nominate an active
Workspace member; the recipient becomes a Project manager atomically:

```json
{"owner_actor_id":"<active-workspace-actor-id>"}
```

Publish with the existing revisioned Project update:

```http
PATCH /api/v1/projects/{project_id} HTTP/1.1
Host: api.assign.so
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
If-Match: "4"
Content-Type: application/json

{"visibility":"public"}
```

The returned `public_id` forms the app URL `/p/{public_id}` and the anonymous
`GET /api/v1/public/projects/{public_id}` API read. The public representation
contains the Project name, optional visual identity, updated time, and ordered
workflow Status identifiers, labels, lifecycle types, optional icons/colors,
positions, and aggregate non-archived Task counts. It does not
expose the Workspace or owner, members, Task content, Documents, attachments,
labels, milestones, revisions, or audit data. The route is anonymously
rate-limited and returns `Cache-Control: no-store`.

Unpublish with `{"visibility":"workspace"}`. Unpublish and archive revoke the
opaque link immediately; publishing again creates a different link. Invalid,
private, revoked, and archived links all return the same `404`.

## List Project Statuses

The authenticated Project representation includes
`show_cancelled_column`. Project managers update that revisioned Board
preference through the ordinary Project `PATCH` operation with
`{"show_cancelled_column":true}`. It changes only Board presentation; it never
changes Task resolution, All tasks history, Search, or direct-link access.

## Read and update the completion policy

Read the Project's completion defaults:

```http
GET /api/v1/projects/{project_id}/completion-policy HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

The response carries an `ETag`. A Project without a stored policy returns the
server-selected active and done defaults with `ETag: "0"`; an applicable review
Status is included when available, while review remains disabled.

Project managers replace the complete policy with the observed ETag:

```http
PUT /api/v1/projects/{project_id}/completion-policy HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "0"
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "requires_review": true,
  "default_active_status_id": "<active-status-id>",
  "default_review_status_id": "<review-status-id>",
  "default_done_status_id": "<done-status-id>"
}
```

Every selected Status must be active and applicable to the Project. The
active, review, and done selections currently use the `in_progress`,
`in_review`, and `done` categories respectively. Disabling review retains the
review selection. A stale ETag returns `409 revision_conflict`; an invalid or
archived Status returns `422 project_completion_policy_invalid`.

```http
GET /api/v1/projects/{project_id}/statuses?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one workflow-ordered page combining the Project's own Statuses and
the Workspace-wide Statuses applicable to it:

```json
{
  "items": [
    {
      "id": "<status-id>",
      "workspace_id": "<workspace-id>",
      "project_id": null,
      "label": "Backlog",
      "category": "backlog",
      "status_type": "backlog",
      "icon": null,
      "color": null,
      "marks_task_resolved": false,
      "position": 1,
      "is_required": true,
      "revision": 1,
      "created_at": "2026-08-15T12:00:00Z",
      "updated_at": "2026-08-15T12:00:00Z",
      "archived_at": null
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

`project_id` is `null` for a Workspace-wide Status applicable to every
Project. `category` is the compatible visual grouping. `status_type` is the
canonical lifecycle meaning: `backlog`, `unstarted`, `started`, `completed`,
or `cancelled`. Completed and cancelled types resolve Tasks regardless of the
custom label. `icon` and `color` are optional presentation overrides, and
`marks_task_resolved` is derived. Active lists omit archived Statuses; an
individual archived Status remains readable so a historical Task can retain
its workflow label.

## Create a Project Status

```http
POST /api/v1/projects/{project_id}/statuses HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"label":"Ready for review","category":"in_review","status_type":"started","icon":"circle-dot","color":"#7C3AED","position":5}
```

Creates a Project-scoped Status and returns `201` with the Status and its
`ETag`. The caller needs `work:write` access in the Workspace. The server
validates the lifecycle category and position; repeating the same idempotency
key replays the original response.

## Archive, restore, and reorder Statuses

Read one active or archived Status when rendering a historical Task:

```http
GET /api/v1/statuses/{status_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

The response includes the Status and its current `ETag`. A Status outside the
caller's Workspace is indistinguishable from an absent one (`404`).

Archive a Status with its current `ETag`:

```http
DELETE /api/v1/statuses/{status_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "4"
Idempotency-Key: <opaque-client-key>
```

Archival is reversible and never repoints Tasks. It returns `409 status_in_use`
when non-archived Tasks still reference the Status and `409 required_status`
when it would remove the final active `todo`, `in_progress`, or `done` Status
from its Workspace-wide or Project-specific workflow. Restore an archived
Status with the normal revisioned update:

```json
{"archived":false}
```

When active Tasks must move with the retiring Status, use the deliberate
replacement command instead. It checks the source revision, moves every
non-archived Task to the active replacement in the same Workspace-wide or
Project-specific workflow, and then archives the source in one transaction:

```http
POST /api/v1/statuses/{status_id}/archive-and-replace HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "4"
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"replacement_status_id":"<active-status-id>"}
```

The replacement cannot be the source, archived, absent, or in another
workflow scope; those cases return `409 replacement_status_unavailable`.
The required-category safeguard still applies, so a replacement cannot remove
the final active `todo`, `in_progress`, or `done` Status. Archived Tasks retain
their existing historical Status.

Before changing a Status lifecycle type, request the authoritative impact:

```http
GET /api/v1/statuses/{status_id}/lifecycle-preview?status_type=completed HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

The preview reports the current and target type, affected Task count, the
1,000-Task synchronous migration limit, and whether the change can run
synchronously. Update a Status label, lifecycle type, compatible category,
icon, or color with `PATCH /api/v1/statuses/{status_id}` and its current
`If-Match`, `X-CSRF-Token`, and `Idempotency-Key` headers. A lifecycle change
above that limit is rejected rather than partially applied. A successful
change updates every affected Task atomically and returns the revised Status
and a new `ETag`.

Move a Status using neighbour anchors, not numeric positions:

```http
POST /api/v1/statuses/{status_id}/move HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"after_id":"<preceding-status-id>","before_id":"<following-status-id>","expected_revision":4}
```

Either anchor may be `null` to place the Status at an end. Anchors must belong
to the same Workspace-wide or Project-specific workflow; a stale, absent, or
cross-scope anchor returns `409 anchor_not_found`. Invalid anchor order returns
`422 invalid_anchors`.

## Manage milestones

`GET` and `POST /api/v1/projects/{project_id}/milestones` list and create
Project milestones. A milestone has a name, optional plain-text description,
optional date-only `due_on`, and a `planned`, `active`, `completed`, or
`cancelled` status. `PATCH /api/v1/milestones/{milestone_id}` updates it with
`If-Match`; `DELETE` archives it reversibly. Progress is computed from linked
Tasks rather than stored on the milestone.
