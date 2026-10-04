---
description: List, create, update, move, relate, follow, duplicate and archive Tasks, and work with Comments and Task suggestions.
---

# Tasks

These operations accept a browser session or a bearer credential listed for the operation in the
[OpenAPI document](/openapi.yaml). They follow the [API conventions](./conventions): `Idempotency-Key`
on creates and commands, and `If-Match` with the `ETag` on updates. Browser writes send
`X-CSRF-Token`; bearer requests don't use cookies or CSRF.

## Task object

```json
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
  "summary": null,
  "description_text": "",
  "due_on": null,
  "milestone_id": null,
  "resolved_at": null,
  "resolved_by": null,
  "resolution": null,
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
```

- `priority` is `none`, `low`, `medium`, `high` or `urgent`.
- The Task code is the Project `key` plus `task_number`, such as `ASSIGN-42`. The web app opens
  Tasks at `/app/{workspaceSlug}/tasks/ASSIGN-42`.
- `resolved_at`, `resolved_by` and `resolution` (`completed`, `cancelled` or `null`) describe the
  current terminal state. Entering a completed or cancelled Status sets them and returning to an
  active Status clears them. Resolving a Task doesn't archive it.
- `description` is Assign rich-text JSON.
- `summary` is an optional one- or two-sentence scanning aid for descriptions of 300 or more
  characters. It's `null` while pending or when the Task changes, so use the canonical fields as
  evidence.

## Read

- `GET /api/v1/tasks/{task_id}` returns a Task with its `ETag`. A Task in another Workspace returns
  `404`.
- `GET /api/v1/workspaces/{workspace_id}/tasks/{task_code}` reads by code, including archived and
  trashed Tasks and the tombstone left after purge. Use it for direct links.

## List

**Project Tasks.** `GET /api/v1/projects/{project_id}/tasks?limit=50` returns Tasks ordered by
`task_number`, plus exact Project `counts` for `active`, `completed`, `cancelled` and `archived`.
Filters: `state` (`active`, `resolved`, `all`), repeatable `status_id`, `assignee_actor_id`,
`resolution` and `include_archived`. A cursor is valid only with the filters it came from.

**Workspace Tasks.**

```http
GET /api/v1/workspaces/{workspace_id}/tasks?status_category=todo&status_category=in_progress&limit=50
```

Results are ordered by `updated_at` descending. Repeated `project_id` and `status_category`
parameters combine with OR. `assignee_actor_id`, `milestone_id`, `include_archived` and an RFC 3339
`updated_since` narrow further. This isn't a text search; use [Search](./search) for that. Pages
default to 50 and cap at 100.

**Followed Tasks.** `GET /api/v1/workspaces/{workspace_id}/subscribed-tasks` returns Tasks the
current user follows, most recently changed subscription first.

**My Work.** `GET /api/v1/workspaces/{workspace_id}/work?view=assigned|overdue|today|upcoming|completed`
is your personal view. See [Workspaces](./workspaces#my-work).

**Board columns.** `GET /api/v1/projects/{project_id}/tasks?status_id={status_id}&order=rank&limit=50`
reads one Status in board order. `rank_desc` reverses it. The response has `column.total` and
`column.can_move_tasks` instead of `counts`. `order=resolved_desc&resolved_since={time}` lists recent
resolved work. `anchor_task_id` starts strictly after that Task, for neighbor reads before a move.
Column orders need exactly one Status and can't combine with the history filters. Moves can shift
Tasks between pages, so deduplicate by ID.

### Milestone filtering <Badge type="warning" text="Awaiting deployment" />

Project Task reads in number order accept up to 100 repeated `milestone_id` values. Values combine
with OR and match before pagination, so matching Tasks can appear even when they fall beyond an
unfiltered first page. Other filters still apply. Continue with `next_cursor` and the same milestone
values. Invalid identifiers, more than 100 values, or combining this filter with a column order
returns `400 invalid_request`. A valid milestone ID outside the Project matches no Tasks.
Project `counts` still describe the whole Project.

### Checked pagination <Badge type="warning" text="Awaiting deployment" />

Send `consistency=checked` to add `query_digest`, `collection_version`, `visibility_revision`,
`observed_at`, `returned_count` and `coverage` to each page. `state` is `active`, `resolved` or `all`,
and `resolution` (`completed` or `cancelled`) can't combine with `active`. Continue with
`next_cursor` and the same filters.

- `complete`: all matching, permitted Tasks were covered.
- `partial`: more pages remain, or the scan limit of ten pages or 1,000 rows was reached.
  `limit_reason` is `more_pages` or `scan_limit`.
- `stale`: data or permissions changed, and the page is empty with
  `limit_reason=collection_or_visibility_changed`. Restart the query.

A partial or stale result doesn't prove that no matching work exists. A changed filter or an expired
cursor returns `invalid_cursor`.

## Create

```http
POST /api/v1/projects/{project_id}/tasks HTTP/1.1
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

Returns `201` with the Task and its `ETag`. `status_id` must be a
[Status of the Project](./projects#statuses). `priority` defaults to `none` and the Task starts
unassigned. `milestone_id` and `assignee_actor_id` are optional, and labels must be Task labels
visible to the Project.

## Update

```http
PATCH /api/v1/tasks/{task_id} HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
If-Match: "1"
Content-Type: application/json

{"status_id": "<new-status-id>"}
```

Every field is optional: `project_id`, `status_id`, `assignee_actor_id`, `title`, `priority`,
`description`, `due_on` and `milestone_id`. An omitted field keeps its value and `null` clears a
nullable one. A different `project_id` moves the Task after validating the destination workflow. A
stale `If-Match` returns `409`. Labels are replaced as a complete set through the target-label
operation in OpenAPI. A Task with relations can't change Project (`422 task_has_relations`); remove
the relations first.

**Undo and redo.** Metadata changes may return a `reversible_command` with an opaque ID, a
description and `undoable_until`.

```http
POST /api/v1/commands/{command_id}/undo HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
```

`…/redo` re-applies it. A command lasts ten minutes and only its creator can use it. Unrelated
edits can coexist with an undo. A later edit to the same field returns `409 command_conflict`, and
so does an expired or already used command. Each reversal is an ordinary new change. Description
edits use the editor's own history.

**Start work.** `POST /api/v1/tasks/{task_id}/start` with `If-Match` and `Idempotency-Key` moves the
Task to the Project's active Status and assigns it to you. The response includes a `reassigned`
flag, which is `true` if it took the Task from someone else. It changes server state only.

**Bulk update.**

```http
POST /api/v1/workspaces/{workspace_id}/tasks/bulk HTTP/1.1
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

This takes 1–100 distinct Tasks. Each is authorized and revision-checked separately. `changes` can
set Status, assignee, priority, due date or milestone, with `null` clearing the last three. The
response has one outcome per Task in request order: `updated`, `not_found`, `conflict`,
`validation_failed` or `failed`. Successful items stay applied when another fails. To retry failures,
send only those Tasks with fresh revisions and a new key. Labels, archive and restore aren't
supported here.

**Move on the board.**

```http
POST /api/v1/tasks/{task_id}/move HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"status_id": "<destination-status-id>", "after_task_id": "<preceding-task-id>", "before_task_id": null, "expected_revision": 7}
```

This changes Status and position in one step. Never send a rank. A stale revision returns
`409 revision_conflict` and an unknown, archived or out-of-column anchor `409 anchor_not_found`; both
include the current Task so you can retry.

## Archive, trash and restore

- `DELETE /api/v1/tasks/{task_id}` with `If-Match` archives a Task (`200`, with an optional undo
  command). It stays readable but leaves Project lists, My Work, references, notifications, public
  counts and default search.
- `POST /api/v1/tasks/{task_id}/trash` with `If-Match` moves it to trash for 30 days. The response has
  `lifecycle: "trashed"`, `trashed_at` and `purge_after`.
- `POST /api/v1/tasks/{task_id}/restore` returns an archived or trashed Task to active, after
  revalidating its Project, Status and assignee. A conflict leaves it unchanged.

Archived and trashed Tasks reject writes with `409 task_inactive`. After the retention period, purge
irreversibly removes the content and leaves a `Purged task` tombstone so Activity, relations,
assignment history and time entries still resolve. Restoring it returns `410 task_purged`.
Task-only Comments, labels, subscriptions, integration links and orphaned attachments are removed.
Archive, trash and restore can be undone while their command is valid. Purge can't.

## Duplicate

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

Title, description and priority always copy, and every `copy_*` flag is required. Comments, Activity,
assignment periods, time entries, subscriptions and integration history never copy. Attachments are
linked, not duplicated, so they share storage.

The destination defaults to the source Project. Across Projects, an omitted `target_status_id` maps
to an active Status in the same category. Workspace labels keep their identity and Project labels
match by name. Anything that doesn't map is reported in `issues`. A copy includes at most 25
descendants and 100 attachment links per Task. The `201` response has the new root Task and counts.
A stale revision returns `409`, and an incompatible Status or an oversized copy `422`.

## Relations

`GET` and `POST /api/v1/tasks/{task_id}/relations` list and create `blocks`, `duplicates`, `relates`
and `parent` relations. `PATCH /api/v1/task-relations/{relation_id}` changes the type and `DELETE`
removes it. Writes need CSRF and idempotency headers, and repeating a create or delete is safe.

- Both Tasks must be in the same Project. Self-relations, duplicates, cycles and invalid parent depth
  are rejected with distinct codes.
- For `parent`, the path Task is the parent and `target_task_id` is the child. A child has one
  parent, and nesting goes three levels deep. Each keeps its own status, assignee and completion.
- Removing a `parent` relation makes the child independent. Archiving one Task doesn't archive the
  other.
- Lists return up to 100 relations, newest first, using `cursor` and `next_cursor`. Each item embeds
  `related_task` (`id`, `code`, `title`, `status_id`).

## Subscriptions

`GET /api/v1/tasks/{task_id}/subscription` returns your follow state in a `subscription` envelope:
`following`, `muted` or `unfollowed`, whether it's `automatic` or `manual`, and its revision. It is
`null` if nothing has applied.

| Command | Request |
| --- | --- |
| Follow | `PUT /api/v1/tasks/{task_id}/subscription` |
| Unfollow | `DELETE /api/v1/tasks/{task_id}/subscription` |
| Mute | `PUT /api/v1/tasks/{task_id}/subscription/mute` |
| Unmute | `DELETE /api/v1/tasks/{task_id}/subscription/mute` |

These are idempotent, need CSRF and an `Idempotency-Key`, ignore the Task's `If-Match` and never
grant access. Creators, new assignees, commenters and people mentioned in a description or Comment
follow automatically, up to 100 mentions per change. A later action never overrides your manual
choice. `GET /api/v1/tasks/{task_id}/subscribers?limit=50` lists active followers, excluding people
who muted, unfollowed or lost access. Notification preferences still apply.

## History and participants

- `GET /api/v1/tasks/{task_id}/assignments?limit=50` returns assignment periods, newest first: the
  assignee, the assigner when known, start and end times, whether it's active and a source (`direct`
  or `imported`). Imported assignments can have unknown start and assigner.
- `GET /api/v1/tasks/{task_id}/participants?limit=100` returns the creator and every current or past
  assignee, with `is_creator`, `is_assigned_now` and `was_previously_assigned`. Commenting or
  reacting doesn't make someone a participant.
- `GET /api/v1/tasks/{task_id}/description-revisions?limit=50` returns description snapshots, newest
  first, with the Task revision, actor, change kind (`baseline`, `created` or `updated`) and the
  content. `POST …/description-revisions/{revision}/restore` with CSRF, `Idempotency-Key` and the
  current `If-Match` restores one as a new revision, keeping the overwritten text in history.

## Files in descriptions

To put an image or file in an existing Task description, upload it through the
[attachment flow](./attachments), link it with `POST /api/v1/tasks/{task_id}/attachments`, then
store the attachment ID in the rich-text node. Resolve fresh preview or download URLs when you
display it; never store signed URLs in content. A Task that doesn't exist yet can't own attachments,
so queue the files and link them after creating it.

## Comments

- `PATCH /api/v1/comments/{comment_id}` edits your comment, with the revision in `If-Match`.
- `DELETE` is available to the author and Workspace admins. It leaves a tombstone in the thread and
  can't be undone.
- `actor` shows how a Comment was created: `user`, or `user:mcp` when made through MCP. `actor_name`
  carries the client label, such as `Codex`. `author_actor_id` is the stable identity.
- Reactions: `PUT /api/v1/comments/{comment_id}/reactions/{reaction}` adds yours and `DELETE`
  removes it. Both are idempotent and return the Comment. Keys are `thumbs_up`, `heart`, `tada`,
  `smile`, `confused` and `eyes`, on live Comments of active Tasks. Responses include each key's count and
  whether you reacted.

## Related context and suggestions <Badge type="warning" text="Awaiting deployment" />

`GET /api/v1/tasks/{task_id}/rich-entities` returns provider objects linked to the Task, without
calling the provider. See [Integrations](./integrations).

When [Workspace Knowledge](./knowledge) is enabled and ready,
`GET /api/v1/workspaces/{workspace_id}/tasks/{task_id}/related-context` returns up to five
permission-filtered related items for the **Suggestions** tab, each with a title, type,
explanation, source time and a `confidence` of `high`, `medium` or `low`. If Knowledge isn't
available, those findings are empty. A retrieval failure shows as unavailable without blocking the Task.

Set `include_commit_mentions=true` to also receive verified GitHub commits mentioned in Task
Comments. The default remains `false` for existing clients. Commit findings use active repositories
connected to the Task's Project and require the Workspace Knowledge entitlement; they can appear
when Knowledge indexing is off. Lookup completes in the background.

`POST /api/v1/workspaces/{workspace_id}/tasks/{task_id}/suggestion-feedback` records a decision:

```json
{"entity_kind": "task", "entity_id": "<id>", "outcome": "confirmed"}
```

`entity_kind` is `task`, `document` or `commit` and `outcome` is `confirmed` or `discarded`. It needs CSRF and
an idempotency key and returns `{"accepted": true}`. Confirming a Task creates a `relates` relation,
confirming a Document links it, and discarding removes that item from this Task's suggestions
permanently.

For a commit, send the finding's `entity_id`. Confirming adds the verified commit to Linked
development after checking current Task write access, the Comment reference and repository
connection. Commit confirmations and dismissals persist in Core.

### Indexed code references <Badge type="warning" text="Awaiting deployment" />

Set `include_code=true` on the Task related-context read to receive read-only code findings from
indexed repositories bound to its Project. The default is false. These results have `kind: code`,
`entity_id: null`, and `code_reference` metadata with repository, path, revision, symbol and line.
Their `identifier` opens a revision-pinned GitHub blob. Code references use deterministic indexed
identifier matching and have no Confirm/Discard feedback operation.

## Live description editing

`POST /api/v1/tasks/{task_id}/collaboration-sessions` opens or renews a browser editing lease, and
`DELETE …/collaboration-sessions/{session_id}` ends it. Both need a browser session and CSRF.
Archived, trashed or inaccessible Tasks are refused. REST, SDK, CLI and MCP keep reading and writing
the structural description. A versioned replacement returns a conflict while live edits await a
checkpoint. Live editing frames aren't a public API.

Proposals and receipts for AI-assisted changes are in [Proposals and receipts](./work-capabilities).

### Read a Comment window <Badge type="warning" text="Awaiting deployment" />

`GET /api/v1/tasks/{task_id}/comments?from_number=0&limit=100` returns the newest
entries in chronological order. Use a positive `from_number` (up to 1,000,000) to
start at that numbered entry. Don't combine it with `cursor`; ordinary cursor
pagination keeps its existing behavior.

Comment responses include an optional `number` in creation order. Deleted
Comments retain their numbered place. A window returns at most 100 entries;
use `next_cursor` to continue or choose another starting number. See the
[OpenAPI document](/openapi.yaml) for parameters and responses.
