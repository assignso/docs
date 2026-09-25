# Task queries and result sets

## Filtered Task queries <Badge type="warning" text="Awaiting deployment" />

`task_list` can query the authorized Workspace when Project is omitted, or accept
up to 100 `project_ids`. Do not combine `project_ids` with `project_id`. Filter by
`assignee_actor_id`, `status_categories`, `milestone_id`, `updated_since`, `state`
and `resolution`; `include_archived` defaults to false. To find unresolved work,
use `state=active`, not a text mention or a missing completion date. Resolved work
can have `resolution=completed` or `resolution=cancelled`. Task results expose
canonical resolution and archival fields when present.

Workspace and filtered queries use newest-updated-first ordering and checked
coverage. An existing Project-only call keeps its Task-number order; opt it into
the new behavior with `consistency=checked`. The page default is 50, maximum 100,
with ten pages/1,000 rows per checked scan. A restricted credential only sees its
permitted Project scope.

Inspect `coverage`: only `complete` proves the filtered authorized scan finished.
Continue `partial` results using `next_cursor`; if `limit_reason=scan_limit`,
narrow the query. Restart `stale` results explicitly. Keep filters unchanged
while paging. [Coverage fields and HTTP equivalent](../api/tasks.md#checked-pagination).

See [versioned work proposals and receipts](../api/work-capabilities.md) for private result sets, drafts,
reviewed ChangeSets and write recovery in the upcoming update.

### Saved Task query conditions <Badge type="warning" text="Upcoming" />

`task_result_set_create` and `task_saved_view_save` accept optional query `filter_terms` (at most four
conjunctive title/code substrings, each 200 characters) and `order: "title"`. Saved views retain those
conditions. List your current personal views and create a new result set from a view's query to
reopen it. Core checks at most 1,000 current permitted Tasks; inspect `coverage` before claiming
completeness or absence. A capped filtered scan may return no rows with partial coverage.

### Versioned lexical results <Badge type="warning" text="Upcoming" />

Call `search` with `page_size:20` and no Project/type/cursor filter to receive optional
`result_version` for its first work-result page. Versions bind the query and current member/Workspace.
They do not grant access or establish complete coverage. Current source lifecycle and Project scope
are checked even when the search index has not caught up. Read entities before acting; private
Discuss Send and human approval remain outside model-visible tools.
