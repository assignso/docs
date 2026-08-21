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
      "description": {"type": "doc", "content": []},
      "description_text": "",
      "due_on": null,
      "milestone_id": null,
      "label_ids": [],
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
The web application uses that code in the canonical Workspace-scoped URL
`/app/{workspaceSlug}/tasks/ASSIGN-42`; browser URLs do not expose or nest the
Task below the Project's opaque ID.

## Create a Task

```http
POST /api/v1/projects/{project_id}/tasks HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "status_id": "<status-id>",
  "title": "Wire the Projects endpoint",
  "description": {"type": "doc", "content": []},
  "due_on": "2026-09-01",
  "label_ids": ["<label-id>"]
}
```

Creates a Task with an atomically allocated project-local number and
returns `201` with the created Task and its `ETag`. `status_id` must
reference a Status visible to the Project (see
[List Project Statuses](projects.md#list-project-statuses)); `priority`
defaults to `none` when omitted, and `assignee_actor_id` defaults to
unassigned. `description` is Assign rich-text JSON; `due_on`, `milestone_id`,
and `label_ids` are optional. Labels must be Task labels visible to the
Project.

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

Applies an optimistic compare-and-swap on `project_id`, `status_id`,
`assignee_actor_id`, `title`, `priority`, `description`, `due_on`, and
`milestone_id`. Every field is optional: an omitted field keeps its current
value, while an explicit `null` clears nullable fields. Supplying a different
`project_id` transfers the Task after validating its destination workflow and
membership. `If-Match` must carry the revision last observed by the client; a
stale revision returns `409`. Label assignment is replaced as a complete set
through the target-label endpoint in the OpenAPI contract.

## Manage Task relations

`GET` and `POST /api/v1/tasks/{task_id}/relations` list and create `blocks`,
`duplicates`, `relates`, or `parent` relations. `DELETE
/api/v1/task-relations/{relation_id}` removes one. Both Tasks must belong to the
same Project; the API rejects self-relations, duplicates, invalid parent depth,
and cycles with distinct validation codes. Repeating an existing create returns
the existing relation, which makes optimistic retries safe.

## Edit or delete a comment

Comment authors update their existing comment with `PATCH
/api/v1/comments/{comment_id}` and the last observed revision in `If-Match`.
Authors and Workspace administrators may `DELETE` it. Deletion keeps an inline
tombstone for thread continuity while removing the comment body; comments are
not restorable.
