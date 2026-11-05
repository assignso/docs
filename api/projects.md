---
description: Create and manage Projects, members and visibility, public status pages, workflow Statuses, completion policy and Milestones.
---

# Projects and Statuses

A Project groups Tasks, workflow Statuses, Documents and members in one Workspace. Its immutable
ID identifies the resource; its key identifies human-readable Task codes. Use a returned Project
path or URL for navigation rather than treating a name as an ID.

The rewritten v1 operations are awaiting deployment. Public integrations use each operation's
admitted bearer credential from [Authentication](./authentication), with current Workspace and
Project permissions. Check the [public reference](./reference/) for operation availability.
Public status pages use a separate anonymous share protocol.

## Projects

### List and read

#### Project task totals <Badge type="warning" text="Awaiting deployment" />

[Workspace Projects](./reference/operations/listworkspaceprojects) returns complete Project
metadata, permissions, lifecycle references and Task totals in a bounded `data` page. Preserve
its revisions, Task numbers and totals as decimal strings. Counts are not the length of the Task
page you happen to have loaded. An optional count omitted from another response does not mean
zero.

Obtain the Workspace ID through [credential setup](./authentication#make-your-first-request).
To resolve the Project key shown in Assign, use the collection's exact `code` selector:

```http
GET /api/v1/workspaces/{workspace_id}/projects?code=ASSIGN&limit=1
Authorization: Bearer <token>
Accept: application/json
```

A successful `200` returns a bounded authorized page. Key matching normalizes ASCII case; an
absent or invisible match returns an empty page. Follow any non-null cursor before concluding a
scan is complete. Keep the returned immutable `id` for Task creation and item reads.

[Read a Project](./reference/operations/getproject) by that ID for complete item state and its
opaque `ETag`. A collection tag cannot authorize a Project edit. The overview operation combines
bounded Project sections for a screen; it is not a way to fetch or count every related resource.
Use the appropriate collection when you need to continue one section.

Check `degradation.degraded` and `degradation.unavailable_sections` before displaying overview
sections. Show a named unavailable section as unavailable; do not interpret it as an empty list
or a zero count. Recent Document rows always include `summary`, which can be `null`. In that
case, display the title alone; a derived summary does not replace the Document body.

### Consistent Project pagination <Badge type="warning" text="Awaiting deployment" />

Pages default to 50 Projects and cap at 100. Continue until `next_cursor: null`, retaining the
query and credential, even after a short or empty page. Cursors bind the query and current
visibility. If a continuation expires or is rejected after an authority or ordering change,
discard it and restart from a current first page. Keep a bounded traversal and deduplicate by ID;
see [Pagination](./pagination).

### Create

```http
POST /api/v1/workspaces/{workspace_id}/projects HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"name": "Assign", "key": "ASSIGN"}
```

Returns `201` with the Project, using the Workspace's workflow and creation defaults. Save its
immutable ID before proceeding. The response is a command observation; read the current Project
item before acquiring a tag for another mutation. `key` is the ticket prefix, `^[A-Z][A-Z0-9]{1,7}$`, unique in the Workspace and
permanent. A used key returns `409 project_key_taken`. `path` is generated from the name; build UI
links from the returned value. After a lost response, keep the same key and exact body for
recovery; a new key can create another Project. A key collision never updates the existing one.

### Update

```http
PATCH /api/v1/projects/{project_id} HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
If-Match: <exact-etag-from-project-read>
Content-Type: application/json

{"name": "Assign Core"}
```

Send exactly one of `name`, `path`, `description`, `url`, `visual_identity`, `owner_actor_id`,
`project_state_id`, `visibility` or `show_cancelled_column`, or both `start_on` and `target_on`. A
stale `If-Match` returns `412`; a missing condition returns `428`. `key` never changes. Preserve
the proposed value, reread the current Project and reconcile before a new edit. After an
interrupted write, recover the original key, body and tag before choosing another intent.

Changing a path changes navigation, while the immutable ID and Project key remain stable.
Dates must be supplied together; clearing a nullable property differs from omitting it. A visual
marker supplements the Project name and never replaces it. Refer to the operation schema for
property bounds and accepted values rather than sending a copied read object.

### Archive and reorder

`POST /api/v1/projects/{project_id}/archive` with the current Project item `If-Match` and an
`Idempotency-Key` archives it. This is different from deleting a Document or trashing a Task.
For example cleanup, review the saved ID and archive only a Project the workflow created. Do not
archive an existing Project merely because a later step failed.

Reorder with neighbour anchors. The order is shared by the whole Workspace and the server owns the
rank:

```http
POST /api/v1/projects/{project_id}/move HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-project-read>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"after_id": "<preceding-project-id>", "before_id": "<following-project-id>"}
```

Get adjacent Project IDs from the current Workspace collection. Either anchor can be `null` to
place the Project at an end. Forward the opaque item tag from `getProject`; do not send a numeric
`expected_revision`. A stale condition returns `412`. If an anchor is no longer valid, reread the
order and reconcile the intended position before a new request. After a lost response, recover
the original request rather than issuing another move with guessed anchors.

## Lifecycle states

Project states are an optional Workspace capability, off by default, separate from archive and trash.

- `GET` and `PATCH /api/v1/workspaces/{workspace_id}/project-lifecycle` read and set
  `{"enabled": true}`. Updating needs an owner or admin.
- `GET` and `POST /api/v1/workspaces/{workspace_id}/project-states` list and append custom states (up to 100, labels 1–80
  characters).
- `PATCH /api/v1/project-states/{state_id}` renames or restores a state.
  `POST /api/v1/project-states/{state_id}/archive` archives it;
  `POST /api/v1/project-states/{state_id}/move` reorders it with anchors. Use the operation's
  observed item condition and idempotency requirements. The state list supplies each row's
  `item_validator.etag`; its collection tag or a constructed revision tag cannot authorize a move.
- A state in use can't be archived alone. `POST /api/v1/project-states/{state_id}/archive-and-replace`
  with `{"replacement_state_id": "<id>"}` moves its Projects and archives it.
- Set or clear a Project's state with `project_state_id` in the Project update.

Disabling the capability keeps states and selections but blocks changes to them.

## Members and visibility

Visibility is `workspace`, `private` or `public`.

- **Workspace:** anyone with Workspace access.
- **Private:** only Project members, the Project owner and Workspace owners and admins. Hidden
  Projects and their Tasks, Documents, attachments, search results, My Work and Inbox items are
  omitted or return `404`.
- **Public:** only adds the anonymous status page below.

`GET /api/v1/projects/{project_id}/members?limit=50` lists the roster, owner first, with
`total_count`. Members have `actor_id`, `display_name`, `role` (`manager`, `contributor` or
`viewer`), `is_owner` and a revision. Project managers and Workspace owners and admins manage it:

```http
POST /api/v1/projects/{project_id}/members HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"actor_id": "<active-workspace-actor-id>", "role": "contributor"}
```

`PATCH` and `DELETE /api/v1/projects/{project_id}/members/{actor_id}` with `If-Match` change or
remove a member. The owner stays a manager until ownership is transferred, and these operations never
change Workspace membership. Someone invited to the Workspace has no Project access until a manager
adds them.

Switch access with `{"visibility": "private"}` in a Project update. Project responses include
`owner_actor_id`, `visibility`, `public_id` and `permissions` (`can_manage_members`, `can_publish`);
use the permissions rather than guessing from a role. To transfer ownership, send
`{"owner_actor_id": "<active-workspace-actor-id>"}`. The new owner becomes a manager.

### Public status page

The Project owner or a Workspace owner or admin can publish a read-only status page:

```http
PATCH /api/v1/projects/{project_id} HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
If-Match: <exact-etag-from-project-read>
Content-Type: application/json

{"visibility": "public"}
```

The returned `public_id` forms the page `/p/{public_id}` and the anonymous
`GET /share/v1/projects/{public_id}`. That response has only the Project name, optional
marker, update time, the workflow Statuses (label, type, icon, color, position) and the count of
non-archived Tasks in each. It never exposes the Workspace, people, Task content, Documents, files,
labels, Milestones or history, and it isn't cached.

Set `{"visibility": "workspace"}` to unpublish. Unpublishing or archiving revokes the link, and
publishing again makes a new one. An invalid, revoked, private or archived link returns `404`.

## Statuses

[List Project Statuses](./reference/operations/listprojectstatuses) to choose a valid `status_id`
for a Task create or move. Get `project_id` from Workspace Projects. The expected result is `200`
with the schema shown in the reference. Continue with the returned cursor instead of assuming
the first page is the complete workflow.

`project_id` is `null` for a Workspace-wide Status. `category` is the visual grouping (`backlog`,
`todo`, `in_progress`, `in_review`, `done`). `status_type` is the lifecycle meaning: `backlog`,
`unstarted`, `started`, `completed` or `cancelled`. Completed and cancelled resolve Tasks whatever
the label. `marks_task_resolved` is derived. Lists omit archived Statuses, but one can still be read
by ID so an old Task keeps its label.

### Create

```http
POST /api/v1/projects/{project_id}/statuses HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"label": "Ready for review", "category": "in_review", "status_type": "started", "color": "#7C3AED", "position": "5"}
```

Returns `201` with the Status and its `ETag`. It needs work-write access.

### Update, archive, restore and reorder

- `GET /api/v1/statuses/{status_id}` reads one, archived or not.
- `PATCH /api/v1/statuses/{status_id}` with the current item `If-Match` and `Idempotency-Key` changes
  the label, `status_type`, `category`, `icon` or `color`. Restore with `{"archived": false}`.
- `POST /api/v1/statuses/{status_id}/archive` with the current item `If-Match` archives it. It returns `409 status_in_use`
  while non-archived Tasks use it and `409 required_status` if it's the last active `todo`,
  `in_progress` or `done` Status in its workflow.
- `POST /api/v1/statuses/{status_id}/archive-and-replace` with `{"replacement_status_id": "<id>"}`
  moves every non-archived Task to the replacement and archives the source in one step. The
  replacement must be active, different and in the same workflow, or you get
  `409 replacement_status_unavailable`. Archived Tasks keep their Status.
- `GET /api/v1/statuses/{status_id}/lifecycle-preview?status_type=completed` reports how many Tasks a
  type change affects. Changes run synchronously up to 1,000 Tasks and are rejected above that.
  A successful change updates all affected Tasks together.
- `POST /api/v1/statuses/{status_id}/move` reorders with neighbour anchors, like Projects:
  `after_id` and `before_id` in the body, with the current Status item tag in `If-Match`. Anchors must be in the same workflow or you get
  `409 anchor_not_found`, and bad order returns `422 invalid_anchors`.

## Completion policy

The completion policy sets the Statuses Tasks move to when work starts, goes into review and
finishes.

`GET /api/v1/projects/{project_id}/completion-policy` returns it with an `ETag`. A Project with no
saved policy returns its effective defaults and an opaque item tag. Project managers replace it
using that exact tag, not a quoted revision or the Project resource's tag:

```http
PUT /api/v1/projects/{project_id}/completion-policy HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-completion-policy-read>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "requires_review": true,
  "default_active_status_id": "<active-status-id>",
  "default_review_status_id": "<review-status-id>",
  "default_done_status_id": "<done-status-id>"
}
```

Each Status must be active and apply to the Project, in the `in_progress`, `in_review` and `done`
categories respectively. Turning review off keeps the review selection. A stale ETag returns
`412 precondition_failed`; read the current policy, retain the intended choices and reconcile
before a new request. An invalid Status returns `422 project_completion_policy_invalid`. After
an unknown outcome, recover the original policy request key and exact body before another edit.

## Milestones

Read Milestones from the Workspace collection with `project_id`;
`POST /api/v1/projects/{project_id}/milestones` creates one. A Milestone has
a name, optional description, an optional `due_on` date and a status of `planned`, `active`,
`completed` or `cancelled`. `PATCH /api/v1/milestones/{milestone_id}` with `If-Match` updates one,
and `POST /api/v1/milestones/{milestone_id}/archive` archives it reversibly. Progress is computed from linked Tasks.

### Milestone references <Badge type="warning" text="Awaiting deployment" />

Milestone responses add optional nullable `milestone_number` and `code`, such as `"1"` and `"FRS-M1"`. The number is a decimal string; keep it as text rather than converting it to a JavaScript number. References remain stable when you rename, reorder, archive or restore a Milestone. During backfill or when reading older responses, either field may be null or absent. Keep using the returned UUID `id` for existing endpoint selectors and Task membership; a code does not grant access. If creation exhausts a Project's signed-64-bit number space, it returns HTTP 409 with `milestone_reference_exhausted` and creates nothing.

### Resolve a Milestone code <Badge type="warning" text="Awaiting deployment" />

Use `GET /api/v1/workspaces/{workspace_id}/milestones?project_id={project_id}&code={milestone_code}`.
Get the Project ID from Workspace Projects and the code from the Milestone in Assign. Matching
is exact with ASCII case normalization. A missing or invisible match returns an empty authorized
page; retain its continuation semantics. Read `GET /api/v1/milestones/{milestone_id}` using the
returned ID for the item representation. Credentials must authorize both the Workspace and
Project; a display code never grants access.

### Milestone list progress <Badge type="warning" text="Awaiting deployment" />

Use the Workspace Milestone collection with `project_id` to read one Project. Progress and
revision values are decimal strings. Continue with the opaque `next_cursor` even after an empty
page; current visibility and byte bounds can make a page short. Keep filters and ordering fixed
and restart from the first page if the cursor is rejected.

### CLI bearer Milestone reads <Badge type="warning" text="Awaiting deployment" />

A CLI integration uses the same canonical collection and item operations with an admitted bearer
credential. Obtain the Workspace and Project IDs through supported setup and collection reads;
use the Milestone code only as a selector. Check the installed CLI's supported command and
availability in [CLI commands](../cli/commands) rather than constructing a CLI-specific API route.

## Paid public publishing <Badge type="warning" text="Awaiting deployment" />

Publishing public Documents or Projects requires a paid entitlement in that Workspace. Being a paid member of another Workspace does not qualify. A denied publish returns `403 paid_workspace_required`; your content stays unchanged and authorized users can still unpublish.

Public links and new public Document attachment preview/download requests return the usual unavailable result while the entitlement is absent. Stored content and visibility remain intact, so a still-published, unarchived link can become available again when the entitlement returns. Unpublishing or archiving keeps its existing revocation rules.
