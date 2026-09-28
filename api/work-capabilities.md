---
description: Result sets, saved views, ChangeSets, Document drafts, evidence collections and operation receipts for reviewed, AI-assisted changes.
---

# Proposals and receipts <Badge type="warning" text="Upcoming" />

These capabilities support the upcoming Discuss update. Availability depends on your server release.
They let a person or assistant capture a set of work, propose changes to it and apply them only after
review, with a receipt for every write. The [OpenAPI document](/openapi.yaml) defines the exact
fields and errors.

## Concepts

- **Task result set.** A checked query and up to 1,000 Task IDs and revisions. Selecting works from an
  exact version. Hydrating reports each entry as current, changed or unavailable without replacing it,
  and refreshing creates a new version.
- **Saved view.** Keeps the query, not frozen results. It's private to you and needs an unrestricted
  Workspace credential.
- **ChangeSet.** Up to 100 Task updates, completions or creations, or Document draft applications.
  `atomic` applies all or nothing, and `per_item` reports each outcome. Core assigns operation IDs, so
  omit them. Include each Task's current revision, and a Status's current revision when setting one.
- **Document draft.** Keeps the base and draft content and changes nothing until its reviewed
  application succeeds.
- **Receipt.** Every write returns an `operation_id`.

Compound changes, Task creations and Document applications need the initiating person's review. Review
an exact version and digest, then approve or reject that digest. Editing a proposal creates a new
version and voids approval. Approval lasts 24 hours, and proposals, result sets and drafts expire
after 30 days. Applying rechecks current permissions and revisions.

## Endpoints

All are under `/api/v1/workspaces/{workspace_id}`:

| Resource | Operations |
| --- | --- |
| `/task-result-sets` | `POST` capture or refresh. `GET` by ID and version, or hydrate by ID, version and offset. |
| `/task-selections` | `POST` a selection. `GET /{id}` or `/{id}/hydrate?offset=N`. |
| `/task-saved-views` | `POST` save. `GET` list. `POST /delete` with ID and revision. |
| `/document-patches` | `POST` create or edit. `GET /{id}?version=N`. |
| `/change-sets` | `POST` propose. `GET /{id}?version=N`. `POST /{id}/review`. `POST /apply`. |
| `/operation-receipts` | `GET /{id}`. `POST /undo` for supported conditional compensation. |
| `/members/resolve` | `GET ?query=...`. Ambiguous names return candidates. |
| `/tasks/{id}/context` | `GET` bounded canonical Comments and direct related Tasks. |
| `/evidence-collections` | See below. |

They use a browser session. Writes need CSRF and an `Idempotency-Key`, except review, which is bound to
the exact version and digest.

## Receipts and recovery

Keep the `operation_id` and the original idempotency key. If a response is lost, resolve the receipt
before sending another write. A missing receipt doesn't prove an in-flight operation failed. Partial
groups keep individual outcomes, and targets you lose access to may become unavailable. A supported
receipt can be undone only while the affected fields still match the original result, so Undo never
overwrites someone's later edit.

## Evidence collections

An evidence collection captures exact passages for an investigation.

```http
POST /api/v1/workspaces/{workspace_id}/evidence-collections
```

Send `sources`, each with `entity_type`, `entity_id`, the current `revision`, a `field` and a unique
exact `quote`. Fields are Task title or description, Document title or content, Project name or
description and Comment body. Quotes are plain text of up to 1,800 characters, and a collection holds
up to 32 passages. Missing, ambiguous or stale passages are rejected.

- The response has a private collection ID and version, source references and a 30-day expiry.
- `GET …/evidence-collections/{id}?version=1` reads metadata.
- `GET …/evidence-collections/{id}/hydrate?version=2&offset=0&limit=1` returns up to 20 current
  passages (`limit` 1–20, default 20). Follow `next_offset`. Changed, unavailable and excluded
  references have no text, so hydrate before reusing one. A quotation doesn't make its claims true.
- Post to the collection's exclusions endpoint with `id`, `expected_version` and the complete
  `excluded_ids` array to create a new version with those references left out. An empty array
  includes everything again. Older versions stay unchanged and hydrate as `superseded`, so open the
  current one. Exclusions apply only to this investigation.

Writes need a browser session, CSRF and an `Idempotency-Key`. Resolve an uncertain result through the
receipt. A collection doesn't grant permission to publish its content.

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
