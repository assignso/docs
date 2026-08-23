# Tasks

These operations require an authenticated browser session (see
[Browser authentication](authentication.md)) and follow the shared
[API conventions](conventions.md), including `Idempotency-Key` on creates and
`If-Match`/`ETag` on updates.

## My Work (published native-bearer contract; not yet served)

`GET /api/v1/workspaces/{workspace_id}/work?view=assigned|overdue|today|upcoming|completed`
is the bounded caller-scoped My Work projection. It uses the signed-in actor's
persisted IANA timezone for date buckets, returns the server's `as_of_date`,
defaults to 50 rows, and caps a page at 100. The browser-session route is
already contracted; its native-bearer alternative is published but unavailable
until the mobile credential backend is released. Mobile apps must not derive
these buckets from a general Task listing while they wait.

## List Workspace Tasks

```http
<!-- markdownlint-disable-next-line MD013 -->
GET /api/v1/workspaces/{workspace_id}/tasks?status_category=todo&status_category=in_progress&limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns a cursor-bounded activity page ordered by `updated_at` descending,
then Task ID descending. The default page size is 50 and the maximum is 100.
Active Tasks are returned by default; set `include_archived=true` to include
archived Tasks. Repeated `project_id` and `status_category` parameters apply
OR filters. `assignee_actor_id`, `milestone_id`, and RFC 3339
`updated_since` further narrow the page. A Project identifier outside the
Workspace contributes no rows, so this endpoint cannot reveal whether that
Project exists. This is not a text-search endpoint; use
[Workspace search](search.md) for matching and ranking.

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
its `key` with `task_number` — see [Projects](projects.md). This exact
immutable value is also the canonical Task code for the bearer-authenticated
CLI contract: `{PROJECT_KEY}-{TASK_NUMBER}`, with a positive decimal number
and no leading zeroes.
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

## Move a Task on the board

```http
POST /api/v1/tasks/{task_id}/move HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"status_id":"<destination-status-id>","after_task_id":"<optional-preceding-task-id>","before_task_id":null,"expected_revision":7}
```

Moves the Task to a Status and between its optional neighbour anchors in one
atomic operation. Do not send a rank or split the move into a Task update and
a separate reorder. A stale revision returns `409 revision_conflict`; a
missing, archived, or out-of-column anchor returns `409 anchor_not_found`.
Both responses include the current Task representation and `ETag`, so the
client can re-anchor and retry without a preliminary read. Task representations
include the server-owned `rank` and `revision`; render the rank as canonical
order but continue to submit only neighbour anchors. The Workspace event
for a successful move contains an `operation_id` that identifies the optimistic
mutation in the realtime stream.

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
