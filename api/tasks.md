---
description: Find Tasks by code or Project, read complete content, create a Task and recover a conditional edit without repeating its effects.
---

# Tasks

A Task belongs to one Project in a Workspace. Its Status records workflow progress; archiving or
trashing it changes its lifecycle. Use the [operation reference](./reference/) for request fields
and response schemas, and the [Task guide](../guides/tasks) for actions in the application.

The rewritten v1 operations below are awaiting deployment. Public integrations use a bearer
credential from [Authentication](./authentication); each operation lists its admitted credentials
and access requirements. Use [writes and retries](./writes) for conditional changes and uncertain
outcomes.

## Task object

Keep the immutable Task `id` for later reads and edits. The human-readable `code`, such as
`ASSIGN-42`, combines the Project key and Task number. Use a returned `web_url` when opening a
collection result in Assign rather than constructing a URL from the code.

A collection row contains metadata and page-scoped display references in `included`; it omits the
description, summary, history and commands. Read the item for complete content. Collection rows
and canonical items represent `task_number` and `revision` as decimal strings; retain those
strings without converting them to JavaScript numbers. An item validator is a separate opaque
value, not a revision number.

Resolution and lifecycle answer different questions. A completed or cancelled Task can remain
active and readable. Reopening clears its current terminal resolution; it does not restore an
archived or trashed Task. A generated summary is a convenience for scanning, not a substitute for
the description. The [Task read reference](./reference/operations/gettask) defines the complete
item and canonical representations.

## Read

[Read a Task](./reference/operations/gettask) by its immutable ID. The default `detail` view
includes display projections. Before changing it, request `view=canonical` and retain that
response's strong `ETag`; a collection, detail or create-response tag cannot authorize the edit.
Keep the same representation and content encoding when sending `If-Match`.

To resolve a code, use [Workspace Tasks](./reference/operations/listworkspacetasks) with `code`:

```http
GET /api/v1/workspaces/{workspace_id}/tasks?code=ASSIGN-42&limit=1
Authorization: Bearer <token>
Accept: application/json
```

A successful `200` contains a bounded `data` array. Code matching is exact and case-insensitive,
with uppercase normalization. Take the returned row's `id` into `getTask` when you need its body.
An absent or invisible code returns an empty page, not a Task or a permission diagnosis. Follow
any non-null `next_cursor`; an empty page alone does not establish absence. An item outside your
authority returns `404`, as does a missing item. Check the selected Workspace and your access before continuing.

## List

One [Workspace Task collection](./reference/operations/listworkspacetasks) covers Project,
followed and exact-code reads. For one Project:

```http
GET /api/v1/workspaces/{workspace_id}/tasks?project_id={project_id}&limit=50
Authorization: Bearer <token>
Accept: application/json
```

Get the Workspace ID through [credential setup](./authentication#make-your-first-request).
Get a permitted Project ID from [Workspace Projects](./reference/operations/listworkspaceprojects).
Repeated `project_id` values combine with OR; other filters narrow the selection. Number order is
the default; choose `order=updated_at` explicitly for newest changes. Results default to 50 rows
and allow at most 100 per page. The operation reference lists supported filters and combinations.

**Followed Tasks.** Use the same collection with `subscribed=true`. It filters the effective
human actor's subscriptions; it does not let a caller choose another subscriber or gain access.

**My Work.** Use [My Work](./reference/operations/listmywork) for personal assigned, overdue,
today, upcoming or completed views. See [Workspaces](./workspaces#my-work).

**Board columns.** Add `project_id`, exactly one `status_id` and `order=rank` to the Workspace
collection. `rank_desc` reverses the order; `resolved_desc` selects recent resolutions. The
Project column result includes `column.total` and `column.can_move_tasks`. Keep its documented
filter restrictions and anchor rules. Deduplicate by Task ID when a move changes page membership.

### Milestone filtering <Badge type="warning" text="Awaiting deployment" />

Use repeated `milestone_id` values on the Workspace collection, with `project_id` when you need
one Project. Matching happens before pagination. Continue with the same filters and the returned
cursor; a short page does not end traversal. The reference specifies the supported combinations,
identifier bounds and Project count semantics.

### Checked pagination <Badge type="warning" text="Awaiting deployment" />

Send `consistency=checked` for coverage and version-bound traversal. `complete` describes this
filtered, authorized scan at its observation boundary. `partial` means more pages or the scan
limit remain; `stale` means the collection or visibility changed. Partial or stale coverage cannot
prove absence. Restart a stale query and discard its old cursor. Treat cursor values as opaque,
retain the original filters and stop only at `next_cursor: null`. See [Pagination](./pagination)
for a bounded traversal and invalid-cursor recovery.

### Due Task filters <Badge type="warning" text="Awaiting deployment" />

Use `due_on=2026-11-10` for an exact civil due date. Repeated `assignee_actor_ids` select People;
repeated `project_id` selects Projects. Values within each filter combine with OR; different
filters combine with AND. Do not combine singular `assignee_actor_id` with `assignee_actor_ids`.
For active due work, use `state=active&consistency=checked&order=priority_updated_at`. Omit `order`
for number order. See the reference for limits and the ordering within each mode.

## Create

This example creates one Task in an existing Project. Choose a Project where you may create
Tasks; get its ID from [Workspace Projects](./reference/operations/listworkspaceprojects). Obtain
a credential authorized for writes through [Authentication](./authentication). A read-only token
cannot perform this workflow.

Choose a unique `Idempotency-Key` for this create and keep it with the exact request body until
you know the result. The example sets priority explicitly; omitted assignment, Status and other
defaults follow the Workspace's configured creation policy. To choose a Status, read
[Project Statuses](./reference/operations/listprojectstatuses) first.

```http
POST /api/v1/projects/{project_id}/tasks
Authorization: Bearer <token>
Idempotency-Key: <key-for-this-create>
Content-Type: application/json
Accept: application/json

{"title":"Review onboarding example","priority":"low"}
```

[Create Task](./reference/operations/createtask) returns `201` with the Task. Record its immutable
`id` so later edits and cleanup address this Task. Before editing it, read the current canonical
item as shown below. A create receipt's tag is not an item mutation validator.

If the response is lost, the Task may already exist. Retain the original key and exact body;
follow [uncertain-outcome recovery](./writes#recover-an-unknown-outcome) before sending another
request. A new key can create a second Task. A replay reports the original outcome and requires
current access; read current state before another change. A validation or permission failure
needs correction or renewed authority, not an automatic retry loop.

## Update

This example changes only the created Task's title. Use its saved `id` as `task_id`:

```http
GET /api/v1/tasks/{task_id}?view=canonical
Authorization: Bearer <token>
Accept: application/json
Accept-Encoding: identity
```

The expected result is `200` with the canonical Task and an opaque strong `ETag`. Keep the tag
unchanged. Choose a new key for this edit, then [update the Task](./reference/operations/updatetask):

```http
PATCH /api/v1/tasks/{task_id}
Authorization: Bearer <token>
Accept: application/json
Accept-Encoding: identity
Content-Type: application/json
Idempotency-Key: <key-for-this-edit>
If-Match: <exact-etag-from-canonical-read>

{"title":"Reviewed onboarding example"}
```

The expected result is `200` with the updated Task. Omitted fields retain their values; `null`
clears only a nullable field. An empty patch is invalid. Use the generated reference for the
writable fields instead of copying the read object into a request.

- `412 precondition_failed`: another change invalidated the observed version. Read the canonical
  Task again, compare the current title with your intended edit and reconcile explicitly. Use the
  new tag and a new key for a newly agreed edit; do not replace the tag and resubmit blindly.
- `428 precondition_required`: obtain a canonical item tag before retrying the intended edit.
- Lost response or cancellation: the write may have committed. Preserve the original body, key,
  tag and representation selection for recovery; a cancelled request does not undo its effect.
- `404` or revoked access: stop. Do not treat an unavailable Task as permission to recreate it.

After the outcome is known, read the current canonical Task to verify the title. Keep the saved
created Task ID if you stop partway through. When the example is finished, use the Task's
[archive action](../guides/tasks#lifecycle) in Assign to clean up only the record you created.
Review it before archiving; never remove pre-existing Tasks or issue cleanup while a create's
outcome is still unknown. Archive and trash have different retention and restoration effects.

A Project move is an [update](./reference/operations/updatetask) with a permitted destination
`project_id` and a Status applicable to that Project. The move clears the Project-scoped
Milestone. Reconcile a failed condition before moving; a Task with relations cannot change
Project (`422 task_has_relations`). Remove relations only when that separate action is intended.

**Undo and redo.** Metadata changes may return a `reversible_command` with an opaque ID, a
description and `undoable_until`.

```http
POST /api/v1/commands/{command_id}/undo HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
```

`POST /api/v1/commands/{command_id}/redo` re-applies it. A command lasts ten minutes and only its creator can use it. Unrelated
edits can coexist with an undo. A later edit to the same field returns `409 command_conflict`, and
so does an expired or already used command. Each reversal is an ordinary new change. Description
edits use the editor's own history.

**Start work.** `POST /api/v1/tasks/{task_id}/start` with `If-Match` and `Idempotency-Key` moves the
Task to the Project's active Status and assigns it to you. The response includes a `reassigned`
flag, which is `true` if it took the Task from someone else. It changes server state only.

**Bulk update (awaiting deployment).**

```http
POST /api/v1/workspaces/{workspace_id}/tasks/bulk HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "items": [
    {"item_id": "priority-1", "task_id": "<task-id>", "expected_revision": "7"},
    {"item_id": "priority-2", "task_id": "<another-task-id>", "expected_revision": "3"}
  ],
  "changes": {"priority": "high"}
}
```

This synchronous command accepts 1–100 distinct Tasks and at most 5 MiB of JSON. Give each item a
unique `item_id` and retain the exact decimal `expected_revision` from an authorized read; the
numbers shown above are illustrative. Do not send `If-Match` on this bulk request. Status,
assignee, priority, due date and Milestone changes are supported; labels, archive and restore
are separate operations.

A `200` contains outcomes in request order: `updated`, `not_found`, `conflict`,
`validation_failed` or `item_conflict`. Known per-item failures allow successful items to commit;
an unexpected database or cancellation failure aborts the command. Each successful outcome has
its original committed revision and receipt identity, not a fresh Task body.

If the response is lost, preserve and recover the original key and complete body. Once that
outcome is known, review failed items and submit only the intended corrections under a new
request key, retaining their item IDs and fresh server-authored revisions. A successful item ID
cannot be reused with a changed effect: it returns `item_conflict`. Do not silently assign new
item IDs to bypass that result.

**Move on the board (awaiting deployment).**

```http
POST /api/v1/tasks/{task_id}/move HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-canonical-read>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"status_id": "<destination-status-id>", "after_task_id": "<preceding-task-id>", "before_task_id": null}
```

This changes Status and position in one step. Get the destination Status from
[Project Statuses](./reference/operations/listprojectstatuses), and an adjacent Task ID from the
[board column](#list) you intend to use. Read the Task's canonical item tag before the move.
Never send a rank or a numeric `expected_revision`. A stale item tag returns `412`; an invalid
anchor returns a conflict. Reread the Task and destination column, reconcile the intended position
and prepare a new request rather than guessing a new anchor. After a lost response, recover the
original key and exact request before deciding whether another move is needed.

## Archive, trash and restore

These lifecycle operations are awaiting deployment. Read [the canonical Task](./reference/operations/gettask) first and send
its opaque `ETag` in `If-Match`, with an `Idempotency-Key` for the intended change:

- `POST /api/v1/tasks/{task_id}/archive` archives the Task (`200`). It stays readable but leaves
  default active lists and work views. A response may include an undo command.
- `DELETE /api/v1/tasks/{task_id}` moves the Task to trash for 30 days. It does not merely archive
  it. Read `trashed_at` and `purge_after` from the result.
- `POST /api/v1/tasks/{task_id}/restore` restores an archived or trashed Task after revalidating
  its Project, Status and assignee. It accepts no request body. A failed condition leaves the Task
  unchanged; a successful no-op on an already active Task still requires the observed tag.

A missing condition returns `428`; a stale one returns `412`. Read current canonical state and
reconcile before preparing a new intent. After a timeout, retain the original request for
recovery; repeating it with a different key is not an undo. Do not use an old receipt tag for the
next change.

Archived and trashed Tasks reject ordinary edits with `409 task_inactive`. After the retention
period, purge irreversibly removes content and leaves a tombstone for historical references.
Restoring a purged Task returns `410 task_purged`; Task-only Comments, labels, subscriptions,
integration links and orphaned attachments are removed. Archive, trash and restore can be undone
while their command is valid; purge cannot. Verify the target ID before cleanup, and clean up
only records created by your workflow.

## Duplicate

```http
POST /api/v1/tasks/{task_id}/duplicate HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-canonical-read>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{
  "target_project_id": null,
  "target_status_id": null,
  "copy_assignee": true,
  "copy_dates": true,
  "copy_milestone": false,
  "copy_labels": true,
  "copy_subtasks": true,
  "copy_attachments": true
}
```

Read the source Task's canonical tag before this command. A null destination keeps the copy in
the same Project; get another permitted destination ID from Workspace Projects when needed.
The expected result is `201` with a new root Task and copy counts. Record all created Task IDs.
After a lost response, recover the original key and exact options before requesting another copy;
do not delete shared attachment objects as duplicate cleanup.

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
removes it. Use each operation's condition and idempotency requirements. Recover a lost response with the
original request before preparing another change.

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

These desired-state commands require an `Idempotency-Key` and accept no Task `If-Match`, query
or body. They never grant access. After recovering an old response, read the subscription again
for its current state; the original outcome may predate a later opposite command. Creators, new assignees, commenters and people mentioned in a description or Comment
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
  content. `POST /api/v1/tasks/{task_id}/description-revisions/{revision}/restore` with
  `Idempotency-Key` and a current canonical item `If-Match` restores one as a new revision, keeping
  the overwritten text in history. Recover the original intent after a lost response.

## Files in descriptions

To put an image or file in an existing Task description, upload it through the
[attachment flow](./attachments), link it with `POST /api/v1/tasks/{task_id}/attachments`, then
store the attachment ID in the rich-text node. Resolve fresh preview or download URLs when you
display it; never store signed URLs in content. A Task that doesn't exist yet can't own attachments,
so queue the files and link them after creating it.

## Comments

- [Edit a Comment](./reference/operations/updatecomment) with the opaque tag from
  [its current item read](./reference/operations/getcomment), not a revision number. Keep the
  original edit body, key and tag after a lost response; reconcile a `412` before a new edit.
- [Delete a Comment](./reference/operations/deletecomment) is available to the author and Workspace admins. It leaves a tombstone in the thread and
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

`entity_kind` is `task`, `document` or `commit` and `outcome` is `confirmed` or `discarded`. It needs an idempotency key and returns `{"accepted": true}`. Confirming a Task creates a `relates` relation,
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

Assign's editor manages the live editing connection and saves checkpoints. Archived, trashed or
inaccessible Tasks cannot be edited. Integrations read and write the structural description
through the Task resource; live editor frames are not a public API. If a replacement conflicts
with live edits, retain your intended content and reread the canonical Task after the editor has
saved. Do not overwrite the description using an old version.

Proposals and receipts for assisted changes are in [Proposals and receipts](./work-capabilities).

### Read a Comment window <Badge type="warning" text="Awaiting deployment" />

`GET /api/v1/tasks/{task_id}/comments?from_number=0&limit=100` returns the newest
entries in chronological order. Use a positive `from_number` (up to 1,000,000) to
start at that numbered entry. Don't combine it with `cursor`; ordinary cursor
pagination keeps its existing behavior.

Comment responses include an optional `number` in creation order. Deleted
Comments retain their numbered place. A window returns at most 100 entries;
use `next_cursor` to continue or choose another starting number. See the
[OpenAPI document](/openapi.yaml) for parameters and responses.
