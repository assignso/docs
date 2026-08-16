# Tasks

These operations require an authenticated browser session (see
[Browser authentication](authentication.md)) and follow the shared
[API conventions](conventions.md), including `Idempotency-Key` on creates and
`If-Match`/`ETag` on updates.

## List Project Tasks

```http
GET /api/v1/projects/{project_id}/tasks?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one page ordered by the Task's immutable project-local number:

```json
{
  "items": [
    {
      "id": "<task-id>",
      "workspace_id": "<workspace-id>",
      "project_id": "<project-id>",
      "task_number": 42,
      "status_id": "<status-id>",
      "assignee_actor_id": null,
      "title": "Wire the Projects endpoint",
      "priority": "medium",
      "revision": 1,
      "created_at": "2026-08-15T12:00:00Z",
      "updated_at": "2026-08-15T12:00:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

`priority` is one of `none`, `low`, `medium`, `high`, or `urgent`. The
Project's ticket reference (for example `ASSIGN-42`) is formed by combining
its `key` with `task_number` — see [Projects](projects.md).

## Create a Task

```http
POST /api/v1/projects/{project_id}/tasks HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"status_id": "<status-id>", "title": "Wire the Projects endpoint"}
```

Creates a Task with an atomically allocated project-local number and
returns `201` with the created Task and its `ETag`. `status_id` must
reference a Status visible to the Project (see
[List Project Statuses](projects.md#list-project-statuses)); `priority`
defaults to `none` when omitted, and `assignee_actor_id` defaults to
unassigned.

## Read a Task

```http
GET /api/v1/tasks/{task_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns the Task with its current `ETag`. A Task outside the caller's
Workspace is indistinguishable from an absent one (`404`).

## Update a Task

```http
PATCH /api/v1/tasks/{task_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
If-Match: "1"
Content-Type: application/json

{"status_id": "<new-status-id>"}
```

Applies an optimistic compare-and-swap on `status_id`, `assignee_actor_id`,
`title`, and `priority`. Every field is optional: an omitted field keeps its
current value, while an explicit `"assignee_actor_id": null` clears the
assignee — the two are not equivalent. `If-Match` must carry the revision
last observed by the client; a stale revision returns `409`.
