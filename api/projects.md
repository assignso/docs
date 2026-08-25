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

Send exactly one of `name`, `path`, `description`, `url`, or
`visual_identity`. A path change uses the same request with, for example,
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

## Publish a read-only Project status

Every Project response identifies its immutable creating `owner_actor_id`, its
`workspace` or `public` visibility, nullable opaque `public_id`, and explicit
`permissions.can_publish`. Only the Project owner or a current Workspace
owner/admin may publish or unpublish; clients must use the permission response
rather than infer this from a locally cached role.

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
workflow Status labels with aggregate non-archived Task counts. It does not
expose the Workspace or owner, members, Task content, Documents, attachments,
labels, milestones, revisions, or audit data. The route is anonymously
rate-limited and returns `Cache-Control: no-store`.

Unpublish with `{"visibility":"workspace"}`. Unpublish and archive revoke the
opaque link immediately; publishing again creates a different link. Invalid,
private, revoked, and archived links all return the same `404`.

## List Project Statuses

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
Project. `category` is one of `backlog`, `todo`, `in_progress`, `in_review`,
or `done`. Active lists omit archived Statuses; an individual archived Status
remains readable so a historical Task can retain its workflow label.

## Archive, restore, and reorder Statuses

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
