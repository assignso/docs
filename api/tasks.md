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
      "updated_at": "2026-08-15T12:00:00Z",
      "archived_at": null,
      "trashed_at": null,
      "purge_after": null,
      "purged_at": null,
      "lifecycle": "active"
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

## Read assignment history and participants

```http
GET /api/v1/tasks/{task_id}/assignments?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns durable primary-assignment periods newest first. The default page is
50 and the maximum is 100; follow `next_cursor` while `has_more` is true. Each
period identifies the assigned Actor, the assigning Actor when known, nullable
assignment and unassignment instants, whether it is active, and a `direct` or
`imported` source. An imported legacy current assignment can have null
`assigned_at` and `assigned_by`; those facts are intentionally unknown.

`GET /api/v1/tasks/{task_id}/participants?limit=100` returns the distinct Task
creator and every current or former primary assignee, capped at 100. Each item
contains only factual `is_creator`, `is_assigned_now`, and
`was_previously_assigned` flags plus the most recent known assignment instant.
Commenting, subscribing, mentioning, or reacting does not make someone a Task
participant. Both reads apply current Task access and return the same `404` for
an absent or unreadable Task.

## Follow, mute, and list Task subscribers

`GET /api/v1/tasks/{task_id}/subscription` returns the current user's durable
Task subscription in a `subscription` envelope. `subscription` is `null` when the user has not
made a decision and no automatic default has applied. The relationship reports
`following`, `muted`, or `unfollowed` state, `automatic` or `manual` authority,
its revision, and an automatic reason when applicable.

Use these idempotent desired-state commands with the normal CSRF token and an
`Idempotency-Key`:

| Command | Request |
| --- | --- |
| Follow | `PUT /api/v1/tasks/{task_id}/subscription` |
| Unfollow | `DELETE /api/v1/tasks/{task_id}/subscription` |
| Mute | `PUT /api/v1/tasks/{task_id}/subscription/mute` |
| Unmute | `DELETE /api/v1/tasks/{task_id}/subscription/mute` |

Each command returns the current relationship. Repeating it does not increment
the subscription revision or create another Activity event. These commands do
not use the Task's `If-Match` value and never grant access to the Task.

Task creators, new primary assignees, commenters, and users named by canonical
mentions in a Task description or Comment follow automatically when they have
no existing relationship. A later assignment, Comment, or mention never
overrides a manual follow, mute, or unfollow. A rich-text mutation can activate
at most 100 distinct canonical mention targets.

`GET /api/v1/tasks/{task_id}/subscribers?limit=50` returns a newest-first,
cursor-bounded page of active users currently following the Task. The default
page is 50 and the maximum is 100. Muted, unfollowed, removed, suspended, and
users who no longer have access are excluded. Subscription state is only the
first notification-eligibility check; category preferences, verified channel
state, and Workspace entitlement still apply.

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

## Bulk-update selected Tasks

```http
POST /api/v1/workspaces/{workspace_id}/tasks/bulk HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "items": [
    {"task_id": "<task-id>", "expected_revision": 7},
    {"task_id": "<another-task-id>", "expected_revision": 3}
  ],
  "changes": {"priority": "high"}
}
```

This synchronous command accepts 1–100 distinct explicit Task IDs. Every Task
is re-authorized against its Project and checked against its supplied revision;
selection itself grants no access. The supported common changes are Status,
assignee (including `null` to clear), priority, due date (including `null`),
and milestone (including `null`).

The response contains one item per requested Task in request order, with an
`updated`, `not_found`, `conflict`, `validation_failed`, or `failed` outcome.
An inaccessible Task is reported as `not_found`. Successful siblings are kept
when another item fails. Replay the same key to recover the exact original
result; to retry failures, submit only those Task IDs with their newly observed
revisions under a fresh idempotency key. Commands over 100 items, query
snapshots, background jobs, progress/cancellation, label changes, and
archive/restore are not part of this operation.

## Archive, trash, and restore a Task

Canonical Task pages resolve by stable code rather than requiring a UUID:

```http
GET /api/v1/workspaces/{workspace_id}/tasks/{task_code} HTTP/1.1
```

This authorized read includes archived and trashed Tasks during recovery and
the safe tombstone after purge. Active Task collections still exclude those
states. Use it for direct browser loads and retained Activity or relation links.

```http
DELETE /api/v1/tasks/{task_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "7"
Idempotency-Key: <opaque-client-key>
```

Archives the Task and returns `204`. Supply the Task revision most recently
returned in its `ETag`; stale revisions return `409`. Retrying the same request
with the same idempotency key replays the original result. Archive is reversible
organization: the Task remains readable but leaves active Project lists, My
Work, reference options, notification delivery, public counts, and default
search.

Move a Task into trash with the same CSRF, revision, and idempotency headers:

```http
POST /api/v1/tasks/{task_id}/trash HTTP/1.1
If-Match: "8"
Idempotency-Key: <opaque-client-key>
```

Trash starts a fixed 30-day retention window. The `200` response includes the
updated Task, `ETag`, `lifecycle: "trashed"`, `trashed_at`, and `purge_after`.
Archived and trashed Tasks reject ordinary writes with `409 task_inactive`.

Restore either state before purge with:

```http
POST /api/v1/tasks/{task_id}/restore HTTP/1.1
If-Match: "9"
Idempotency-Key: <opaque-client-key>
```

Restore returns `200` with the active Task after the server revalidates its
Project, Status, and current assignee. A dependency conflict leaves the Task
unchanged. After the retention deadline, asynchronous purge irreversibly
redacts content but retains a safe `Purged task` tombstone for Activity,
relations, assignment history, time entries, and notification references;
restore then returns `410 task_purged`. Task-only comments, labels,
subscriptions, integration links, and orphan attachment content are removed.

## Duplicate a Task

Duplicate an active Task with its last observed revision and a stable command
identity:

```http
POST /api/v1/tasks/{task_id}/duplicate HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "7"
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "target_project_id": "<optional-destination-project-id>",
  "target_status_id": null,
  "copy_assignee": true,
  "copy_dates": true,
  "copy_milestone": false,
  "copy_labels": true,
  "copy_subtasks": true,
  "copy_attachments": true
}
```

Title, description, and priority always copy. Every Boolean option is required
and states whether to copy the current assignee, due date, milestone, labels,
active subtask tree, or clean attachment links. Comments, Activity,
notification history, assignment periods, time entries, subscriptions, and
integration execution history never copy. Every copied Task has a new ID,
number, revision stream, and independent history.

The destination defaults to the source Project. Across Projects, omit
`target_status_id` to map each Task to an active Status in the same semantic
category. Workspace labels retain identity; Project labels map by normalized
name; milestones stay Project-local. Incompatible optional resources are
reported in `issues` instead of being linked incorrectly. The synchronous
command accepts at most 25 active descendants and 100 attachment links per
copied Task. Attachment objects and stored-byte quota are shared, not copied.
The `201` result returns the canonical new root Task plus Task, subtask, label,
and attachment counts. A stale source revision returns `409`; an incompatible
destination Status or exceeded copy bound returns `422`.

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
`duplicates`, `relates`, or `parent` relations. `PATCH
/api/v1/task-relations/{relation_id}` changes only the relation type and keeps
both related Tasks fixed. `DELETE /api/v1/task-relations/{relation_id}` removes
one. Both mutations require CSRF and idempotency headers. Both Tasks must belong
to the same Project; the API rejects self-relations, duplicates, invalid parent
depth, and cycles with distinct validation codes. Repeating an existing create
returns the existing relation, and repeating a delete returns `204`, which makes
optimistic retries safe.

For a `parent` relation, the request path Task is the parent and the request
body's `target_task_id` is its child. A child has at most one parent and nesting
is limited to three levels. Relation reads are newest-first bounded pages (up
to 100) and are subject to the current Project's access policy, including
private Projects. Parent and child Tasks retain independent identity, status,
assignee, and completion; a parent has no separately mutable percentage.
Removing a `parent` relation promotes the child to an independent Task without
copying or changing its identity. To move a related Task to another Project,
remove its relations first: the update is otherwise rejected with
`422 task_has_relations`, preventing cross-Project edges. Archiving a parent or
child never archives the other Task.

## Read linked external context

`GET /api/v1/tasks/{task_id}/rich-entities` returns the bounded, structured
provider objects linked to an ordinary Task. The Task remains usable when a
provider is stale or unavailable, and the read performs no inline provider
request. See [Integrations and Rich Entities](integrations.md) for the snapshot,
freshness, action, and pagination contract.

When Workspace Knowledge is enabled and ready, `GET
/api/v1/workspaces/{workspace_id}/tasks/{task_id}/related-context` returns at
most five permission-filtered, read-only related subjects. Each result includes
a display title, type, explanation, and source time. The response explicitly
distinguishes ready, empty, and temporarily unavailable state and labels stale
observations. Empty results are omitted from Task detail; unavailable Knowledge
never blocks the Task, its canonical Relations, or Comments and never creates a
Task relation.

## Edit or delete a comment

Comment authors update their existing comment with `PATCH
/api/v1/comments/{comment_id}` and the last observed revision in `If-Match`.
Authors and Workspace administrators may `DELETE` it. Deletion keeps an inline
tombstone for thread continuity while removing the comment body; comments are
not restorable. Comment responses also include immutable creation `actor` and
nullable `actor_name`. The stable identity remains `author_actor_id`; `actor`
uses the base Actor type for direct creation and appends a mediated origin after
a colon. For example, a user creating through MCP is `user:mcp`, with the safe
client label such as `Codex` in `actor_name`. This lets clients render mediated
creation without guessing from the author name and without exposing credentials,
prompts, or request content.
