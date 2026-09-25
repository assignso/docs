# Tasks

These operations require an authenticated browser session or a bearer
credential listed for the operation in OpenAPI. First-party IDE credentials use
the developer-client flow in [Authentication](authentication.md). The shared
[API conventions](conventions.md) apply, including `Idempotency-Key` on creates
and `If-Match`/`ETag` on updates. Browser mutations require CSRF; bearer
mutations do not use cookies or CSRF.

## My Work

`GET /api/v1/workspaces/{workspace_id}/work?view=assigned|overdue|today|upcoming|completed`
is the bounded caller-scoped My Work projection. It uses the signed-in actor's
persisted IANA timezone for date buckets, returns the server's `as_of_date`,
defaults to 50 rows, and caps a page at 100. Browser, native mobile, personal
API token, and developer-client credentials all use this canonical projection
with the scopes listed in OpenAPI.

## List followed Tasks

`GET /api/v1/workspaces/{workspace_id}/subscribed-tasks` returns Tasks the
current user follows. The server determines the user from the authenticated
session or bearer credential; the request does not accept an actor ID.

Results are ordered by the time each subscription last changed. Following a
Task again moves it to the front even when the Task itself has not changed.
The default page size is 50 and the maximum is 100. Continue with the returned
`next_cursor`. Archived, trashed, purged, and unreadable Tasks are excluded.

## List Workspace Tasks

```http
<!-- markdownlint-disable-next-line MD013 -->
GET /api/v1/workspaces/{workspace_id}/tasks?status_category=todo&status_category=in_progress&limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns a cursor-bounded activity page ordered by `updated_at` descending,
then Task ID descending. The default page size is 50 and the maximum is 100.
Unarchived Tasks, including resolved Tasks, are returned by default; set
`include_archived=true` to include
archived Tasks. Repeated `project_id` and `status_category` parameters apply
OR filters. `assignee_actor_id`, `milestone_id`, and RFC 3339
`updated_since` further narrow the page. A Project identifier outside the
Workspace contributes no rows, so this endpoint cannot reveal whether that
Project exists. This is not a text-search endpoint; use
[Workspace search](search.md) for matching and ranking.

### Checked pagination <Badge type="warning" text="Awaiting deployment" />

Set `consistency=checked` to receive `query_digest`, `collection_version`,
`visibility_revision`, `observed_at`, cumulative `returned_count`, and `coverage`.
Use `state=active` for unresolved work, `state=resolved` for resolved work, or
`state=all` (the default) for both. The optional `resolution` is `completed` or
`cancelled`; it cannot be combined with `state=active`.

Continue with the returned `next_cursor` and the same filters. `complete` means
all matching, permitted Tasks were covered at the reported observation boundary.
`partial` means more pages remain or the ten-page/1,000-row scan limit was reached;
`limit_reason` distinguishes `more_pages` from `scan_limit`. Changed data or
permissions produces an empty `stale` page with
`limit_reason=collection_or_visibility_changed`; restart explicitly. Neither
partial nor stale results prove that matching work is absent. Changed-filter,
expired or invalid cursors return `invalid_cursor`. Omitting consistency retains
legacy pagination without a completeness claim.

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
  ],
  "next_cursor": null,
  "has_more": false
}
```

The collection accepts `state=active|resolved|all`, repeatable `status_id`,
`assignee_actor_id`, `resolution=completed|cancelled`, and
`include_archived=true|false`. Cursors are bound to the complete filter set and
cannot be reused after a filter changes. Every page also returns exact
Project-level `counts` for `active`, `completed`, `cancelled`, and `archived`
Tasks; item reads remain bounded by `limit` and `next_cursor`.

`priority` is one of `none`, `low`, `medium`, `high`, or `urgent`. The
Project's ticket reference (for example `ASSIGN-42`) is formed by combining
its `key` with `task_number` — see [Projects](projects.md). This exact
immutable value is also the canonical Task code for the bearer-authenticated
CLI contract: `{PROJECT_KEY}-{TASK_NUMBER}`, with a positive decimal number
and no leading zeroes.
The web application uses that code in the canonical Workspace-scoped URL
`/app/{workspaceSlug}/tasks/ASSIGN-42`; browser URLs do not expose or nest the
Task below the Project's opaque ID.

`resolved_at`, `resolved_by`, and `resolution` describe only the current
terminal episode. Entering a completed or cancelled Status records them;
returning to any active Status clears them. `resolution` is `completed`,
`cancelled`, or null. The older `completed_at` field remains as a compatible
completed-only projection. Resolving a Task does not archive it, and references
to resolved or archived Tasks remain readable.

In the supported Web client, List shows active work plus a bounded recent
completion window, Board keeps terminal columns shallow, and the low-prominence
All tasks destination shows complete non-archived Project history. Search
includes resolved Tasks by default; archived Tasks require explicit inclusion.

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

Task reads and bounded Task collections include a nullable `summary`. When
present, it is a one- or two-sentence scanning aid derived from a description
of at least 300 normalized characters. `source_revision` identifies the exact
Task revision it describes. Core returns `null` while generation is pending,
when the description is shorter, or as soon as the Task revision changes.
Always use the canonical Task fields and description as evidence or action
preconditions; the summary is display convenience only.

The same nullable projection is present on My Work results and the bounded Task
rows in Project Overview, so clients can show additional context without a
per-Task body request.

## Images and files in Task descriptions

An existing Task description can insert image and file blocks through the
normal Task attachment operations. Complete the direct upload, link the
attachment with `POST /api/v1/tasks/{task_id}/attachments`, and then store its
opaque attachment ID in the rich-text node. Clients resolve that ID from the
bounded Task attachment collection and request fresh preview or download URLs;
signed URLs never belong in Task content.

Task creation drafts do not have a Task attachment owner yet. They can queue
page-level files for linking after creation, but must not insert unowned image
or file nodes into the draft description.

## Recover a Task description

`GET /api/v1/tasks/{task_id}/description-revisions?limit=50` returns immutable
description snapshots newest first. Pages default to 50 items and cap at 100;
follow `next_cursor` while `has_more` is true. Each snapshot includes its Task
revision, nullable Actor, `baseline`, `created`, or `updated` change kind, exact
rich-text description, plain-text preview, and creation time. Access is checked
against the current Task, and an unreadable Task is indistinguishable from an
absent one.

To restore a snapshot, send `POST
/api/v1/tasks/{task_id}/description-revisions/{revision}/restore` with the
normal CSRF token, `Idempotency-Key`, and current Task `If-Match`. The selected
description becomes a new Task revision; the overwritten description remains
in history. A stale Task revision returns the normal concurrency conflict, so a
client must reload before deciding whether to retry.

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

When one of the supported Task metadata fields changes, the mutation response
also includes an optional `reversible_command`. Its opaque ID, safe description,
state, and `undoable_until` instant can be presented to the user; inverse values
are intentionally never returned. Description-only edits use the editor's own
history and do not return an application command.

Undo and Redo execute the server-owned inverse or forward command:

```http
POST /api/v1/commands/{command_id}/undo HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
```

```http
POST /api/v1/commands/{command_id}/redo HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
```

Commands are available for ten minutes and only to the actor who created them
in the same Workspace. Core checks current permissions and compares only the
fields owned by that command. An unrelated edit can coexist with Undo; a later
edit to the same field returns `409 command_conflict` without changing the
Task. Expired or already-transitioned commands also return a stable `409`.
Each successful reversal is a new ordinary Task mutation and appears through
the normal realtime and Activity paths.

## Start work

`POST /api/v1/tasks/{task_id}/start` moves the Task to the Project's active
Status and assigns it to the calling Actor in one transaction. Send the Task's
last observed revision in `If-Match` and use an `Idempotency-Key`. The response
contains the updated canonical Task and a `reassigned` flag. When that flag is
true, another Actor's open assignment period was closed; the API does not expose
that Actor's identity in this response.

Start Work changes server state only. IDE clients handle branch creation or
switching as a separate, explicit local action.

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

Archives the Task and returns `200` with the updated Task and an optional
reversible command handle. Supply the Task revision most recently
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

Archive, trash, and restore transitions participate in application Undo while
their command remains valid. Permanent purge never does.

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
to 100, `limit` query parameter) and are subject to the current Project's
access policy, including private Projects. Pass the response's `next_cursor`
back as the `cursor` query parameter to fetch the next page; `next_cursor` is
`null` on the last page. Each returned item embeds `related_task` (`id`,
`code`, `title`, `status_id`) describing whichever Task is not the request
path Task, so a client can render the relation without a separate lookup.
Parent and child Tasks retain independent identity, status, assignee, and
completion; a parent has no separately mutable percentage.
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
most five permission-filtered related subjects, each backing the Task detail
page's **Suggestions** tab. Each result includes a display title, type,
explanation, source time, and a `confidence` bucket (`high`, `medium`, or
`low`) computed from fixed score thresholds, so the same kind of relation
always buckets the same way regardless of what else is in the result.
Globally unconfigured, Free or otherwise unentitled, disabled, unacknowledged,
empty-scope, and out-of-scope conditions use the empty state and are omitted
from Task detail. The temporarily unavailable state is reserved for a genuine
retrieval or currentness failure after eligibility; it never blocks the Task,
its canonical Relations, or Comments. Stale successful observations remain
labelled.

`POST /api/v1/workspaces/{workspace_id}/tasks/{task_id}/suggestion-feedback`
records the user's confirm or discard decision on one Suggestions-tab result:
`{"entity_kind": "task"|"document", "entity_id", "outcome": "confirmed"|"discarded"}`,
requiring CSRF and idempotency headers, returns `{"accepted": true}`. Confirming
a Task result creates a `relates` Task relation through the same relation
model as [Manage Task relations](#manage-task-relations); confirming a
Document result links the Document to the Task. Discarding a result
permanently excludes that subject from future Suggestions for this Task —
it does not resurface after the discard.

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

## React to a comment

Comment responses include a bounded `reactions` array with each non-zero
reaction key, its aggregate count, and whether the current Actor contributed.
Use `PUT /api/v1/comments/{comment_id}/reactions/{reaction}` to add your
reaction and `DELETE` on the same path to remove it. Both operations are
idempotent and return the current Comment. Supported reaction keys are
`thumbs_up`, `heart`, `tada`, `smile`, `confused`, and `eyes`. Reactions are
available only on live Comments under active Tasks and do not change the
Comment body revision.

## Browser description collaboration

`POST /api/v1/tasks/{task_id}/collaboration-sessions` admits or renews the
browser user's resource-scoped editor/viewer lease.
`DELETE /api/v1/tasks/{task_id}/collaboration-sessions/{session_id}` ends that
user's lease. Both require the browser session and CSRF token. Missing,
inaccessible, archived or trashed Tasks are not admitted. The response's
generation identifies the current Task replica; a structural description
replacement invalidates the old generation. See the OpenAPI contract for the
complete schema.

Task REST, SDK, CLI and MCP operations continue to read and write structural
descriptions. A versioned replacement returns a conflict while acknowledged
collaborative updates await a checkpoint. Checkpoints preserve description
history. Raw Yjs frames, provider state and caret awareness are
browser-transport internals, not public content representations or MCP tools.

## Read a board column

Use `GET /api/v1/projects/{project_id}/tasks?status_id={status_id}&order=rank&limit=50`
for one Status in shared manual order. `rank_desc` reads the opposite direction.
Follow `next_cursor` with the same Project, Status, order and filters. Concurrent
moves can change which page contains a Task; refresh earlier pages to reconcile
live changes and deduplicate Task IDs when appending.

Column responses include `column.total`, the full non-archived Status count,
and `column.can_move_tasks`, an advisory permission checked again on every move.
They return this column metadata instead of the history view's global `counts`.
Rows and the total describe the same read snapshot. The default `order=number`
retains the existing history response and ordering.

For recent resolved work, use `order=resolved_desc&resolved_since={RFC3339 time}`.
The cutoff limits rows without reducing the full Status total. Exactly one
Status is required for column orders, and history State, resolution, assignee
and include-archived filters cannot be combined with them.

An `anchor_task_id` starts a rank read strictly beyond that Task in the selected
direction. It cannot accompany a cursor or `resolved_desc`. The anchor must
still belong to the requested Project and Status. This supports bounded neighbor
reads for movement; send the resulting neighbor IDs and the Task's current
revision through the existing move operation. Do not submit ranks or array indexes.

See [versioned work proposals and receipts](work-capabilities.md) for private result sets, drafts,
reviewed ChangeSets and write recovery in the upcoming update.
