# Versioned work proposals and receipts

These additive API capabilities are implemented for the upcoming Discuss update. Availability
depends on your server release. The upcoming Web controls include exact-version Task result cards
and page-first draft/proposal review.

A Task result set records a checked query and up to 1,000 Task IDs/revisions. Select from an exact
result-set version; hydration reports current, changed or unavailable entries without replacing
them. Refresh explicitly to obtain a new version. Personal saved views retain the query rather than
frozen results. They are private to you and require an unrestricted Workspace credential.

A ChangeSet proposes up to 100 Task updates, completions, creations or Document draft applications.
Choose `atomic` for all-or-nothing application or `per_item` for explicit individual outcomes. Core
assigns operation IDs; omit them when proposing. Include each current Task revision and, when
setting a Status, its current revision. Requirement references remain attached to created work.

Compound changes, Task creations and Document applications require the initiating person's review.
Review the exact version/digest through its authorized HTTP resource, then approve or reject that
digest. Changing a proposal creates a new version and invalidates approval. Approval lasts 24 hours;
proposals, result sets and Document drafts expire after 30 days. Application always checks current
permissions and revisions again. A draft preserves base/draft content and does not edit a Document
until its reviewed application succeeds.

HTTP endpoints are under `/api/v1/workspaces/{workspace_id}`:

| Resource | Operations |
| --- | --- |
| `/task-result-sets` | POST capture/refresh; GET by ID/version or hydrate by ID/version/offset |
| `/task-selections` | POST selection; GET `/{id}` or `/{id}/hydrate?offset=N` |
| `/task-saved-views` | POST save; GET list; POST `/delete` with ID/revision |
| `/document-patches` | POST create/edit; GET `/{id}?version=N` |
| `/change-sets` | POST propose; GET `/{id}?version=N`; POST `/{id}/review`; POST `/apply` |
| `/operation-receipts` | GET `/{id}`; POST `/undo` for supported conditional compensation |
| `/members/resolve` | GET `?query=...`; ambiguous names return candidates |
| `/tasks/{id}/context` | GET bounded canonical comments and direct related Task context |

These HTTP operations use a browser session. Mutations require CSRF and an `Idempotency-Key`, except
review, which is bound to the exact version/digest. Native bearer support for this workflow ships
with its client controls. The OpenAPI contract defines exact request/response fields and errors.

A successful write returns `operation_id`. Keep it and the original idempotency key. If a response
is lost, resolve the receipt before sending another write. MCP receipt lookup also accepts the exact
original tool name and key. A missing receipt does not prove that an in-flight operation failed.
Partial groups retain individual outcomes; inaccessible targets may become unavailable on later
reads. A supported receipt may be undone only while the affected fields still match the original
result; Undo will not overwrite a later person's edit.

MCP exposes the same domain capabilities through `task_result_set_*`, `task_selection_*`,
`task_saved_view_*`, `document_patch_*`, `change_set_*` and `operation_receipt_*`, plus
`workspace_member_resolve`, `activity_list` and `task_context_get`. New tool inputs contain
`workspace_id` and a typed `request`; writes also require `idempotency_key`. Human approval is never
a model-supplied field or MCP tool. Discovery describes each tool's policy and limits.

Open a saved result to inspect current compact Task fields. Changed and unavailable targets stay
distinct from the original snapshot. Filter or sort the displayed results, select exact targets,
and choose Ask Discuss to prepare context without sending. Refresh creates a new snapshot and
clears selection. Save query as view saves the original query; local display filters and sorting
are not saved.

Open a Document draft or proposed changes from its receipt. Edit and save a new version before
reviewing. The draft comparison shows the complete changed block range against the original
Document revision. Approve or reject that exact version; apply is a separate action. Partial
outcomes identify what committed, and supported committed changes offer conditional Undo.
Unsent edits can survive navigation temporarily in the same signed-in browser session's memory;
save a draft revision to keep it on the server. Archives offer inspection without write controls.

## Evidence collections

Capture exact passages with `POST /api/v1/workspaces/{workspace_id}/evidence-collections`. Supply
`sources` with `entity_type`, `entity_id`, current `revision`, `field` and a unique exact `quote`.
Supported fields are Task title/description, Document title/content, Project name/description and
Comment body. Quotes use plain text extracted from the editor document and may contain at most
1,800 characters. Up to 32 distinct passages can belong to one collection. Missing, ambiguous or
stale passages are rejected.

The response contains a private collection ID/version and source references, with partial coverage
and a thirty-day expiry. `getEvidenceCollection` reads metadata through
`GET /api/v1/workspaces/{workspace_id}/evidence-collections/{id}?version=1`.
`hydrateEvidenceCollection` reads the collection's `/hydrate` subresource with its ID, version and
offset. It returns up to twenty current passages; follow `next_offset`. Changed, unavailable and
excluded references have no passage text. Always hydrate before reusing a reference. A quotation
does not establish that its assertions are true.

`excludeEvidenceCollection` posts to the collection exclusions endpoint. It accepts `id`,
`expected_version` and the complete `excluded_ids` array. It creates a new version with the same
source identities and expiry. An empty array includes all original references again. Exclusions
apply only to this investigation and do not create memory or preferences. Old versions remain
unchanged. Writes require the existing browser session, CSRF token and `Idempotency-Key`; uncertain
outcomes are resolved through the operation receipt. Collections do not grant permission to publish
their content to other people.

Hydration returns the latest investigation version. After an exclusion edit, older versions retain
their immutable references but return `superseded` without passages. Open the current version to
continue with its saved exclusions.

Hydration accepts optional `limit` from 1 to 20 (default 20). For example,
`GET /api/v1/workspaces/{workspace_id}/evidence-collections/{id}/hydrate?version=2&offset=0&limit=1`
returns one reference and its exact next offset when more remain. This supports small contexts
without truncating individual passages. After saving exclusions in Web, **Ask Discuss about this
investigation** attaches its exact version for your next message; display filters do not change it.
