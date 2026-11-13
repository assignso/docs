---
description: Result sets, saved views, ChangeSets, Document drafts, evidence collections and operation receipts for reviewed, AI-assisted changes.
---

# Proposals and receipts <Badge type="warning" text="Upcoming" />

These capabilities support the upcoming Discuss update. Availability depends on your server release.
They let a person or assistant capture a set of work, propose changes to it and apply them only after
review, with receipts for committed changes. The [OpenAPI document](/openapi.yaml) defines the exact
fields and errors.

## Concepts

- **Task result set.** A checked query and up to 1,000 Task IDs and revisions. Selecting works from an
  exact version. Hydrating reports each entry as current, changed or unavailable without replacing it,
  and refreshing creates a new version.
- **Saved view.** Keeps the query, not frozen results. It's private to you and needs an unrestricted
  Workspace credential.
- **ChangeSet.** Up to 100 Task updates, completions or creations, or Document draft applications.
  `atomic` applies all or nothing, and `per_item` reports each outcome. The response supplies operation IDs, so
  omit them. Include each Task's current revision, and a Status's current revision when setting one.
- **Document draft.** Keeps the base and draft content and changes nothing until its reviewed
  application succeeds.
- **Receipt.** Identifies a committed operation and records its historical outcome.

The initiating person reviews the ChangeSet in Assign. Review
an exact version and digest, then approve or reject that digest. Editing a proposal creates a new
version and voids approval. Approval lasts 24 hours, and proposals, result sets and drafts expire
after 30 days. Applying rechecks current permissions and revisions.

## Endpoints

The following routes describe the upcoming resource contract. Use the
[published reference](./reference/) for each available operation's credential bindings and schemas.

| Resource | Operations |
| --- | --- |
| Task result sets | `POST /api/v1/workspaces/{workspace_id}/task-result-sets`; `GET /api/v1/workspaces/{workspace_id}/task-result-sets/{id}?version=<version>` |
| Task selections | `POST /api/v1/workspaces/{workspace_id}/task-selections`; `GET /api/v1/workspaces/{workspace_id}/task-selections/{id}` |
| Saved views | `POST` or `GET /api/v1/workspaces/{workspace_id}/task-saved-views`; `PATCH` or `DELETE /api/v1/workspaces/{workspace_id}/task-saved-views/{view_id}` |
| Document drafts | `POST /api/v1/workspaces/{workspace_id}/document-patches`; `GET /api/v1/workspaces/{workspace_id}/document-patches/{id}?version=<version>` |
| ChangeSets | `POST /api/v1/workspaces/{workspace_id}/change-sets`; `GET /api/v1/workspaces/{workspace_id}/change-sets/{id}?version=<version>`; `POST /api/v1/workspaces/{workspace_id}/change-sets/{change_set_id}/apply` |
| ChangeSet outcomes | After a per-item apply returns `202`, poll its Operation until terminal, then call `GET /api/v1/workspaces/{workspace_id}/change-set-operations/{operation_id}/result`. |
| Operation receipts | `GET /api/v1/workspaces/{workspace_id}/operation-receipts/{id}`; `POST /api/v1/workspaces/{workspace_id}/operation-receipts/undo` |
| Member lookup | `GET /api/v1/workspaces/{workspace_id}/members/resolve?query=<query>` returns permitted candidates for an ambiguous name. |
| Task context | `GET /api/v1/tasks/{task_id}/context` returns bounded canonical Comments and direct related Tasks. |
| Evidence collections | See [Evidence collections](#evidence-collections). |

### Task result sets and selections

[Capture a result set](./reference/operations/createtaskresultset) and check its coverage before
treating the query as complete. [Read the captured version](./reference/operations/gettaskresultset)
and follow its `items_url` to find Task IDs for
[a selection](./reference/operations/createtaskselection).

A result-set or [selection summary](./reference/operations/gettaskselection) points to the same
resource's `view=items`. Follow `items.next_cursor` until it is null. Pages default to 50 entries
and allow up to 100. Keep the result-set version as an exact decimal string. Each page checks
your current access to Task previews.

### Personal saved views

[Save a Task query](./reference/operations/createtasksavedview) using an unrestricted human
Workspace credential. Opening the view runs the query with current access. For
[edits](./reference/operations/updatetasksavedview) or
[deletion](./reference/operations/deletetasksavedview), first
[list your views](./reference/operations/listtasksavedviews) and send the target's
`item_validator.etag` unchanged in `If-Match`. If the condition is stale, read the view again
and reconcile your intended change.

Keep an `Idempotency-Key` for writes and follow the operation's conditions. Review a ChangeSet in
Assign against its exact version and digest before applying it. Review is the initiating person's
action; an integration cannot supply its own approval.

## Receipts and recovery

Keep the original command, idempotency key and credential family, plus the `operation_id` when
the response supplies one. Read the original receipt under current access before sending another
write. If you lose the response before saving the ID, use the operation's [write recovery
instructions](./writes#recover-an-unknown-outcome). A missing receipt leaves the original outcome
uncertain.

Per-item ChangeSets retain committed effects. Read the terminal result to identify the items that
can be retried. Use their original `client_item_id` values and fresh resource observations in a new
review version. If access changes, individual outcomes can become unavailable.

The initiating human can undo a reversible receipt with current write access while the affected
fields still match the committed result. The response returns a separate receipt for the inverse
operation.

## Evidence collections

In Discuss, select exact passages to collect evidence for an investigation. Source access is
checked when you use the collection. Review changed or unavailable passages before relying on
them; a quotation does not establish that its claims are true. Excluding a passage changes only
that investigation. A collection does not grant permission to publish its content.

Use the supported `evidence_collection_*` MCP tools in the [tool catalog](../mcp/tools) for
programmatic access.

## MCP

MCP exposes the same capabilities as `task_result_set_*`, `task_selection_*`, `task_saved_view_*`,
`document_patch_*`, `change_set_*` and `operation_receipt_*`, plus `workspace_member_resolve`,
`activity_list`, `summarize` and `task_context_get`. Inputs take `workspace_id` and a typed `request`,
and writes also need `idempotency_key`. Human approval is never a tool or a model-supplied field.
Receipt lookup also accepts the original tool name and key. See the [tool catalog](../mcp/tools).

- `activity_list` reads Task, Project, Workspace or member activity from the 90-day window, with
  optional RFC 3339 `from` (inclusive) and `before` (exclusive). A cursor works only for the same
  scope and interval. Results report the applied boundaries in UTC and `retained_days`. An interval
  past retention doesn't prove older activity didn't exist.
- `summarize` reads one exact Task, Project or Document by `resource_id`, and a Project summary can
  include checked Task highlights. Use the list tools for collections.

## In the web app

Open a saved result to see current Task fields, with changed and unavailable targets kept apart from
the original snapshot. You can filter or sort what's displayed, select exact targets and choose
**Ask Discuss** to prepare context without sending. Refreshing creates a new snapshot and clears the
selection. **Save query as view** saves the query, not display filters or sorting.

Open a Document draft or proposal from its receipt. Edit and save a new version before reviewing. The
comparison shows the whole changed range against the original revision, and you approve or reject
that exact version. Applying is a separate step. Partial outcomes show what committed, and supported
changes offer conditional Undo. Unsent edits can survive navigation within the same signed-in browser
session, but save a draft revision to keep them on the server. Archives are read-only.

After saving exclusions, **Ask Discuss about this investigation** attaches its exact version to your
next message.

## Personal Project views

<Badge type="warning" text="Awaiting deployment" />

On a Project’s List, Board or Backlog, **Save view** saves your filters and presentation as a personal tab. **Update view** saves later changes. On a narrow screen, open **Saved view actions**. Rename or delete your views under Project Settings → Tabs. These views belong to your account in the current Workspace; they are not shared Project settings.

API and MCP saved-view records can include an optional `definition` with an opaque `project_id`, `layout`, a non-null `parameters` object and `show_cancelled`. Existing query-only records remain valid. The checked `query` remains required; saving a definition requires access to its Project and revision checks apply to updates. Limits are 100 views per membership and 16 KiB per definition.

### Label selection in personal Project views <Badge type="warning" text="Awaiting deployment" />

A Project view definition's `parameters` accepts `label: [UUID, ...]` with up to
100 unique values. This matches any selected assigned Task label alongside the
other Project filters on Tasks loaded in that view. It does not change the Task
list endpoint's pagination or aggregate totals. The separate `labels` parameter
continues to accept `shown` or `hidden` for badge visibility. HTTP and MCP saved
views use the same validation and private access rules.
