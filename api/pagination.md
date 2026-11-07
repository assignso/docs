---
description: Traverse bounded Assign API pages, preserve cursor queries and distinguish page results from complete collections.
---

# Pagination

## Bounded collections <Badge type="warning" text="Awaiting deployment" />

Product REST collections return `data` and `next_cursor`. Request one page at a time and
continue until `next_cursor` is `null`. A short or empty `data` array can still have a
continuation. Some responses also include `has_more`; do not use page length to infer it.

The shared `limit` default is 50 and maximum is 100. The operation reference defines overrides,
item and byte limits, supported filters and ordering. There is no unlimited value. Zero,
negative, fractional, malformed or over-maximum limits fail validation; callers must not depend
on silent clamping. Malformed query syntax returns `400`; semantic field violations return
`422`, with the applicable parameter identified in the error.

| Collection | Default / maximum | Reference |
| --- | --- | --- |
| Workspace Projects and Tasks | 50 / 100 | [Projects](./reference/operations/listworkspaceprojects), [Tasks](./reference/operations/listworkspacetasks) |
| Project Statuses and My Work | 50 / 100 | [Statuses](./reference/operations/listprojectstatuses), [My Work](./reference/operations/listmywork) |
| Task Comments | 50 / 100 | [Comments](./reference/operations/listtaskcomments) |
| Workspace search | 20 / 50 | [Search](./reference/operations/searchworkspace) |
| Activity groups | 10 / 50 | [Groups](./reference/operations/listactivitygroups) |
| Activity group children | 25 / 25 | [Children](./reference/operations/listactivitygroupchildren) |
| Reference options, per requested type | 10 / 20 | [Reference options](./reference/operations/listworkspacereferenceoptions); candidates have no cursor or total |

These limits apply to the current public reference. Protocols such as
[MCP](../mcp/task-queries) retain their own cursor fields and termination rules. Do not translate
their responses into the product REST envelope.

## Continue the same query

Copy a cursor unchanged from the preceding response. Keep the same credential, Workspace,
filters, ordering, projection and page size. Encode the cursor as a query value; do not parse,
edit or construct it. Cursors are bound to their query and current access and may expire.

For example, list Tasks in an authorized Workspace using `listWorkspaceTasks`. Obtain a bearer
credential using [Authentication](./authentication) and copy your Workspace ID from Assign.
Set `ASSIGN_TOKEN` and `WORKSPACE_ID` in your environment. This read requests at most 50 rows:

```sh
curl --fail-with-body --get \
  "https://api.assign.so/api/v1/workspaces/${WORKSPACE_ID}/tasks" \
  --header "Authorization: Bearer ${ASSIGN_TOKEN}" \
  --header 'Accept: application/json' \
  --data-urlencode 'limit=50'
```

The expected response is `200` with a Task page. Copy a non-null `next_cursor` into `CURSOR`
before requesting another page:

```sh
curl --fail-with-body --get \
  "https://api.assign.so/api/v1/workspaces/${WORKSPACE_ID}/tasks" \
  --header "Authorization: Bearer ${ASSIGN_TOKEN}" \
  --header 'Accept: application/json' \
  --data-urlencode 'limit=50' \
  --data-urlencode "cursor=${CURSOR}"
```

This JavaScript traversal uses the same endpoint. It accepts a caller's cancellation signal,
stops at an explicit page budget and yields each page separately. If it reaches the budget,
it reports incomplete traversal instead of returning a complete-list result.

```js
async function* taskPages({ token, workspaceId, signal, maxPages = 20 }) {
  if (!Number.isInteger(maxPages) || maxPages < 1) throw new Error('Invalid page budget')
  let cursor = null
  for (let pageNumber = 0; pageNumber < maxPages; pageNumber++) {
    const url = new URL(`https://api.assign.so/api/v1/workspaces/${workspaceId}/tasks`)
    url.searchParams.set('limit', '50')
    if (cursor !== null) url.searchParams.set('cursor', cursor)
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'omit', signal,
    })
    if (!response.ok) throw new Error(`Task page failed: ${response.status}`)
    const page = await response.json()
    if (!Array.isArray(page.data) ||
        !(page.next_cursor === null || typeof page.next_cursor === 'string')) {
      throw new Error('Invalid Task page')
    }
    yield page.data
    if (page.next_cursor === null) return
    if (!page.next_cursor || page.next_cursor === cursor) throw new Error('Cursor did not advance')
    cursor = page.next_cursor
  }
  throw new Error('Page budget reached; traversal is incomplete')
}
```

The function does not retry failures. Use the [error guidance](./errors) to decide whether to
retry the same page or restart. For example, search's `invalid_cursor` reason requires a new
traversal with the original selectors. Ordinary Task pages do not promise a snapshot across
concurrent changes. When using checked consistency, inspect `coverage` and `limit_reason`;
`partial` or `stale` coverage cannot establish absence.

## Nested data and windows

Page-scoped `included` references describe only the returned rows. Their `completeness` reports
whether those references resolved; it does not mean the whole collection was loaded. A total
has the scope stated by its schema: for example, a Task column total can include rows outside
the page and recent-resolution cutoff. Preserve exact decimal-string counts as strings.

Comments support a numbered `from_number` window, which cannot accompany `cursor`. A Comment
page is bounded to 1 MiB, so continue even if byte limits yield fewer rows than requested.
Activity groups expose expansion locators for their child pages. Copy the parent group,
revision and snapshot fields into the declared child operation along with the original scope
and window selectors. Locators expire after five minutes. Refresh the parent on
`activity_group_stale`; restart the same selection on `activity_cursor_stale`.

Use a documented nested continuation or collection operation for more data. A preview, a
bounded candidate list or one file page is not a complete export. See
[CSV pages and complete exports](./conventions#csv-pages-and-complete-exports).

## Project group metadata <Badge type="warning" text="Upcoming" />

Request Project group headers separately using the projection operation's optional `group_limit` or `group_cursor`. Use the returned scope and `next_cursor` for continuation while `has_more` is true. Group pages contain at most100 headers; counts and positions are decimal strings, which preserve values beyond JavaScript's safe integer range.

A `project_groups` result contains group IDs and matching counts, with empty `row_ids` and `window_state=not_loaded`. Fetch the admitted Task projection separately for actual rows and actions. A completed group window does not mean Task rows are loaded. An unassigned group can have a null ID.

Keep the original scope with its cursor. If the source changes, a409 response requires refreshing the scope rather than continuing an old group cursor. The existing scope lifetime and authorization still apply. See `CanonicalProjectionProjectGroups` in the [OpenAPI document](/openapi.yaml).
