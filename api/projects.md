# Projects and Statuses

These operations require an authenticated browser session (see
[Browser authentication](authentication.md)) and follow the shared
[API conventions](conventions.md), including `Idempotency-Key` on creates and
`If-Match`/`ETag` on updates.

## List Workspace Projects

```http
GET /api/v1/workspaces/{workspace_id}/projects?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one page of the Workspace's Projects, ordered by name. `workspace_id`
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
      "next_task_number": 43,
      "revision": 1,
      "created_at": "2026-08-15T12:00:00Z",
      "updated_at": "2026-08-15T12:00:00Z"
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

## Rename a Project or change its path

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

Send exactly one of `name` or `path`. A path change uses the same request with,
for example, `{"path":"assign-core"}`. `path` must match
`^[a-z0-9]+(?:-[a-z0-9]+)*$`, be at most 63 characters, and be unique within
the Workspace. `key` cannot be changed by this or any other operation.
`If-Match` must carry the revision last observed by the client; a stale
revision returns `409`.

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
      "updated_at": "2026-08-15T12:00:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

`project_id` is `null` for a Workspace-wide Status applicable to every
Project. `category` is one of `backlog`, `todo`, `in_progress`, `in_review`,
or `done`. Creating, updating, deleting, or reordering a Status is not yet a
public operation.
