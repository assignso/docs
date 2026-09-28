---
description: Filter Task queries in MCP, page through checked results and use saved views and versioned search results.
---

# Task queries and result sets

For private result sets, drafts and reviewed changes, see
[Proposals and receipts](../api/work-capabilities).

## Filtered Task queries <Badge type="warning" text="Awaiting deployment" />

`task_list` queries the whole authorized Workspace when Project is omitted, or up to 100 `project_ids`.
Don't combine `project_ids` with `project_id`. Filters: `assignee_actor_id`, `status_categories`,
`milestone_id`, `updated_since`, `state`, `resolution` (`completed` or `cancelled`) and
`include_archived` (default false). For unresolved work, use `state=active`, not a text match or a
missing completion date. Results include resolution and archive fields when present.

Workspace and filtered queries return the most recently updated first, with checked coverage. A
Project-only call keeps Task-number order unless you pass `consistency=checked`. Pages default to 50
(maximum 100), and a checked scan covers ten pages or 1,000 rows. Restricted credentials see only
their permitted Projects.

Inspect `coverage` before concluding anything:

- `complete` is the only value that proves the scan finished.
- For `partial`, continue with `next_cursor`. If `limit_reason=scan_limit`, narrow the query.
- For `stale`, restart explicitly.

Keep filters unchanged while paging. See [checked pagination](../api/tasks#checked-pagination).

## Saved Task query conditions <Badge type="warning" text="Upcoming" />

`task_result_set_create` and `task_saved_view_save` accept optional `filter_terms`, at most four title
or code substrings of up to 200 characters that must all match, and `order: "title"`. Saved views keep
these conditions. List your personal views, then create a result set from a view's query to reopen it.
Core checks at most 1,000 current permitted Tasks, so inspect `coverage` before claiming completeness
or absence. A capped scan can return no rows with partial coverage.

## Versioned search results <Badge type="warning" text="Upcoming" />

Call `search` with `page_size: 20` and no Project, type or cursor filter to get an optional
`result_version` on the first page of work results. A version binds the query, member and Workspace. It
doesn't grant access or prove complete coverage. Source lifecycle and Project scope are checked even if
the index is behind, so read entities before acting. Private Discuss sends and human approval aren't
available to models.

## Personal Project views

<Badge type="warning" text="Awaiting deployment" />

On a Project’s List, Board or Backlog, **Save view** saves your filters and presentation as a personal tab. **Update view** saves later changes. On a narrow screen, open **Saved view actions**. Rename or delete your views under Project Settings → Tabs. These views belong to your account in the current Workspace; they are not shared Project settings.

API and MCP saved-view records can include an optional `definition` with an opaque `project_id`, `layout`, a non-null `parameters` object and `show_cancelled`. Existing query-only records remain valid. The checked `query` remains required; saving a definition requires access to its Project and revision checks apply to updates. Limits are 100 views per membership and 16 KiB per definition.
