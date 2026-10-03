---
description: Create and manage Projects, members and visibility, public status pages, workflow Statuses, completion policy and Milestones.
---

# Projects and Statuses

These operations use a browser session (see [Authentication](./authentication)) and the
[API conventions](./conventions): `Idempotency-Key` on creates and `If-Match` with the `ETag` on
updates. Send `X-CSRF-Token` on writes. The public status read is the only anonymous operation.

## Projects

### List and read

#### Project task totals <Badge type="warning" text="Awaiting deployment" />

Workspace Project lists include optional read-only `task_count` and `last_task_updated_at` fields. `task_count` counts every Task except archived, trashed and purged Tasks, including completed and cancelled Tasks, independently of Task pagination. A Project with no such Tasks reports zero and omits `last_task_updated_at`. Other private Project responses may omit both fields; a missing count does not mean zero. The public Project response also includes optional `task_count` for its full total, independently of the returned Status rows.

`GET /api/v1/workspaces/{workspace_id}/projects?limit=50` returns Projects in the Workspace's shared
manual order. `workspace_id` must be the session's Workspace, otherwise `404`.

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

`GET /api/v1/projects/{project_id}` returns one Project with its `ETag`. A Project outside your
Workspace or that you can't read returns `404`.

`GET /api/v1/projects/{project_id}/overview` returns everything an overview screen needs in one
non-cacheable call: metadata, the first three members and the member count, Task counts, Milestone
progress, the Status distribution and up to five recent Tasks, activity items, Documents and files,
plus up to five active Tasks each in `in_progress` and `in_review`. `freshness` says when it was
generated, and `degradation` names any section that's missing. Use it instead of listing and
counting yourself.

### Consistent Project pagination <Badge type="warning" text="Awaiting deployment" />

Continue with `next_cursor` to read more Projects. If the order or access changes
between pages, the next request returns `409 catalog_changed` with no items.
Discard the partial traversal and restart at the first page.

### Create

```http
POST /api/v1/workspaces/{workspace_id}/projects HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"name": "Assign", "key": "ASSIGN"}
```

Returns `201` with the Project, its `ETag` and the default `Backlog`, `Todo`, `In Progress` and
`Done` workflow. `key` is the ticket prefix, `^[A-Z][A-Z0-9]{1,7}$`, unique in the Workspace and
permanent. A used key returns `409 project_key_taken`. `path` is generated from the name; build UI
links from the returned value.

### Update

```http
PATCH /api/v1/projects/{project_id} HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
If-Match: "1"
Content-Type: application/json

{"name": "Assign Core"}
```

Send exactly one of `name`, `path`, `description`, `url`, `visual_identity`, `owner_actor_id`,
`project_state_id`, `visibility` or `show_cancelled_column`, or both `start_on` and `target_on`. A
stale `If-Match` returns `409`. `key` never changes.

| Field | Rules |
| --- | --- |
| `path` | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, at most 63 characters, unique in the Workspace. |
| `description` | Plain text, at most 500 characters. |
| `url` | Absolute HTTP or HTTPS link, at most 2,048 characters. |
| `start_on`, `target_on` | ISO dates or `null`, sent together. The target can't precede the start. |
| `visual_identity` | `{"kind":"icon","value":"rocket"}` or `{"kind":"emoji","value":"🚀"}`. `null` restores the folder marker. |
| `show_cancelled_column` | Board presentation only. Project managers can change it. |

Clear `description` or `url` with `null` or an empty string. Description, URL and dates are visible
only to signed-in readers. The icon names are listed in the [OpenAPI document](/openapi.yaml). The
marker supplements the Project name and never replaces it.

### Archive and reorder

`DELETE /api/v1/projects/{project_id}` with `If-Match` and an `Idempotency-Key` archives a Project
(`204`).

Reorder with neighbour anchors. The order is shared by the whole Workspace and the server owns the
rank:

```http
POST /api/v1/projects/{project_id}/move HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"after_id": "<preceding-project-id>", "before_id": "<following-project-id>", "expected_revision": 4}
```

Either anchor can be `null` to place the Project at an end. A stale revision returns
`409 revision_conflict`, an unknown or archived anchor `409 anchor_not_found` (both include the
current Project so you can retry), and reversed anchors `422 invalid_anchors`.

## Lifecycle states

Project states are an optional Workspace capability, off by default, separate from archive and trash.

- `GET` and `PATCH /api/v1/workspaces/{workspace_id}/project-lifecycle` read and set
  `{"enabled": true}`. Updating needs an owner or admin.
- `GET` and `POST …/project-states` list and append custom states (up to 100, labels 1–80
  characters).
- `PATCH` and `DELETE /api/v1/project-states/{state_id}` rename, restore (`{"archived": false}`) or
  archive one. `POST …/move` reorders with anchors.
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
X-CSRF-Token: <csrf-token>
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
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
If-Match: "4"
Content-Type: application/json

{"visibility": "public"}
```

The returned `public_id` forms the page `/p/{public_id}` and the anonymous
`GET /api/v1/public/projects/{public_id}`. That response has only the Project name, optional
marker, update time, the workflow Statuses (label, type, icon, color, position) and the count of
non-archived Tasks in each. It never exposes the Workspace, people, Task content, Documents, files,
labels, Milestones or history, and it isn't cached.

Set `{"visibility": "workspace"}` to unpublish. Unpublishing or archiving revokes the link, and
publishing again makes a new one. An invalid, revoked, private or archived link returns `404`.

## Statuses

`GET /api/v1/projects/{project_id}/statuses?limit=50` returns the Project's own Statuses and the
applicable [Workspace-wide ones](./workspaces#workspace-wide-statuses) in workflow order.

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

`project_id` is `null` for a Workspace-wide Status. `category` is the visual grouping (`backlog`,
`todo`, `in_progress`, `in_review`, `done`). `status_type` is the lifecycle meaning: `backlog`,
`unstarted`, `started`, `completed` or `cancelled`. Completed and cancelled resolve Tasks whatever
the label. `marks_task_resolved` is derived. Lists omit archived Statuses, but one can still be read
by ID so an old Task keeps its label.

### Create

```http
POST /api/v1/projects/{project_id}/statuses HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"label": "Ready for review", "category": "in_review", "status_type": "started", "color": "#7C3AED", "position": 5}
```

Returns `201` with the Status and its `ETag`. It needs work-write access.

### Update, archive, restore and reorder

- `GET /api/v1/statuses/{status_id}` reads one, archived or not.
- `PATCH /api/v1/statuses/{status_id}` with `If-Match`, `X-CSRF-Token` and `Idempotency-Key` changes
  the label, `status_type`, `category`, `icon` or `color`. Restore with `{"archived": false}`.
- `DELETE /api/v1/statuses/{status_id}` with `If-Match` archives it. It returns `409 status_in_use`
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
  `{"after_id", "before_id", "expected_revision"}`. Anchors must be in the same workflow or you get
  `409 anchor_not_found`, and bad order returns `422 invalid_anchors`.

## Completion policy

The completion policy sets the Statuses Tasks move to when work starts, goes into review and
finishes.

`GET /api/v1/projects/{project_id}/completion-policy` returns it with an `ETag`. A Project with no
saved policy returns defaults with `ETag: "0"` and review disabled. Project managers replace it:

```http
PUT /api/v1/projects/{project_id}/completion-policy HTTP/1.1
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

Each Status must be active and apply to the Project, in the `in_progress`, `in_review` and `done`
categories respectively. Turning review off keeps the review selection. A stale ETag returns
`409 revision_conflict` and an invalid Status `422 project_completion_policy_invalid`.

## Milestones

`GET` and `POST /api/v1/projects/{project_id}/milestones` list and create Milestones. A Milestone has
a name, optional description, an optional `due_on` date and a status of `planned`, `active`,
`completed` or `cancelled`. `PATCH /api/v1/milestones/{milestone_id}` with `If-Match` updates one,
and `DELETE` archives it reversibly. Progress is computed from linked Tasks.

### Milestone references <Badge type="warning" text="Awaiting deployment" />

Milestone responses add optional nullable `milestone_number` and `code`, such as `"1"` and `"FRS-M1"`. The number is a decimal string; keep it as text rather than converting it to a JavaScript number. References remain stable when you rename, reorder, archive or restore a Milestone. During backfill or when reading older responses, either field may be null or absent. Keep using the returned UUID `id` for existing endpoint selectors and Task membership; a code does not grant access. If creation exhausts a Project's signed-64-bit number space, it returns HTTP 409 with `milestone_reference_exhausted` and creates nothing.

### Resolve a Milestone code <Badge type="warning" text="Awaiting deployment" />

Use `GET /api/v1/projects/{project_id}/milestones/by-code/{milestone_code}` with the Project UUID and a code such as `FRS-M1`. The response contains the canonical Milestone UUID, reference fields, current Task-derived progress and ETag. ASCII casing may vary; canonical output is uppercase. No whitespace, signs, leading zeros or values above `9223372036854775807` are accepted. Malformed codes return 400 `invalid_milestone_code`; missing, inaccessible and wrong-Project codes return 404. Browser sessions and authorized native access tokens use their existing read permissions. Existing UUID endpoints remain valid, including for archived Milestones. The TypeScript and PHP Project API clients provide `getMilestoneByCode`.

### Milestone list progress <Badge type="warning" text="Awaiting deployment" />

Each item from `GET /api/v1/projects/{project_id}/milestones` includes `progress` with
`total_tasks`, `completed_tasks`, `incomplete_tasks` and `tasks_by_category`. Counts cover the
milestone's Tasks independently of which Task pages you have loaded; archived, trashed and purged
Tasks are excluded. The existing `done` category determines completed Tasks. Use these values
instead of counting a partial Task list. Treat absent progress as unavailable, not zero.

### CLI bearer Milestone reads <Badge type="warning" text="Awaiting deployment" />

API/developer bearer credentials with the existing read scope use `GET /api/v1/cli/milestones/{milestone_code}`. The code's Project key resolves within the token's Workspace under normal Project access, then returns the canonical Milestone/progress/ETag. Missing and inaccessible resources return 404; malformed or overflowing codes return 400 `invalid_milestone_code`. ASCII casing normalizes and numbers remain decimal text. Browser/native endpoints and UUID operations retain their credential rules. Generated TypeScript/PHP CLI API clients provide `getCliMilestone`.

## Paid public publishing <Badge type="warning" text="Awaiting deployment" />

Publishing public Documents or Projects requires a paid entitlement in that Workspace. Being a paid member of another Workspace does not qualify. A denied publish returns `403 paid_workspace_required`; your content stays unchanged and authorized users can still unpublish.

Public links and new public Document attachment preview/download requests return the usual unavailable result while the entitlement is absent. Stored content and visibility remain intact, so a still-published, unarchived link can become available again when the entitlement returns. Unpublishing or archiving keeps its existing revocation rules.
