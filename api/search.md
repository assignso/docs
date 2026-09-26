# Search

`GET /api/v1/workspaces/{workspace_id}/search` returns bounded authorized matches from exactly one Workspace. Browser sessions search Projects, Tasks, Documents, Comments and active people. Native mobile bearer credentials search Project and Task titles and identifiers only; native requests must specify exactly one `resource_type` of `project` or `task`, exclude archived resources and receive empty snippets. Unsupported or omitted native type filters return `400 invalid_request`. Invalid bearer credentials never fall back to browser cookies.

## Request

`q` requires 2–200 characters after trimming whitespace. `limit` is 1–50 (default 20), and `cursor` resumes a page. Optional `project_id` narrows the Project; inaccessible Projects return no matches. Browser callers may specify `resource_type` (`project`, `task`, `document`, `comment`, `person`) and `include_archived` (default false). Resolved Tasks remain searchable; trashed and purged resources are excluded.

```http
GET /api/v1/workspaces/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11/search?q=launch&resource_type=task&limit=20
```

## Response

```json
{
  "items": [{
    "resource_type": "task",
    "resource_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc12",
    "project_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc13",
    "task_id": null,
    "title": "Launch checklist",
    "snippet": "",
    "updated_at": "2026-08-20T10:00:00Z"
  }],
  "next_cursor": null,
  "has_more": false
}
```

Exact identifiers and titles precede title prefixes, lexical relevance, typo tolerance and recency. Results have deterministic opaque cursors and no raw score or exact total. Browser snippets are sanitized and bounded; native snippets are empty. Indexing is asynchronous, so new writes can take a short time to appear. Direct resource reads remain authoritative.

Reuse a cursor only with its original credential surface, Workspace, query and filters. Native cursors are bound to their query, type and Project filter and cannot resume browser content pages. Search enforces live membership, resource visibility, rate limits and a database deadline. Temporary overload returns `503 search_unavailable` with `Retry-After`; clients should show an error and avoid automatic request amplification.
