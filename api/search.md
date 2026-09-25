# Search

`GET /api/v1/workspaces/{workspace_id}/search` searches Project, Task,
Document, Comment, and active workspace People in the caller's current
Workspace. Browser sessions, scoped personal API tokens, and registered
developer-client credentials are accepted. The Workspace boundary and read
authorization are enforced by the server, so a result never confirms the
existence of an inaccessible resource.

## Request

The `q` query parameter is required. It accepts 2–200 characters after leading
and trailing whitespace are ignored. The operation supports the standard
bounded pagination parameters `limit` (1–50) and `cursor`, plus three optional
filters:

- `project_id` limits results to one Project.
- `resource_type` is `project`, `task`, `document`, `comment`, or `person`.
  Person results include the workspace role as `subtitle`, never email.
- `include_archived=true` explicitly includes archived Projects, Tasks,
  Documents, and Comments. Archived resources are excluded by default; active
  People are unaffected.

For example:

```http
GET /api/v1/workspaces/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11/search?q=launch&resource_type=task&include_archived=true&limit=20
```

## Response

```json
{
  "items": [
    {
      "resource_type": "task",
      "resource_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc12",
      "project_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc13",
      "title": "Launch checklist",
      "updated_at": "2026-08-20T10:00:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

`project_id` is `null` for a Project result. Use `next_cursor` only with the
same Workspace, query, and filters that produced it.

## Current scope

Results are bounded and do not return a score or exact total. Content results
are backed by the search projection; People are a live active-membership
projection, so removed members do not remain discoverable through search.

Exact immutable identifiers and exact titles rank first, followed by title
prefixes, weighted full-text relevance, typo-tolerant matches, and recency.
Documents and Comments use their authorized extracted text as well as titles;
People match active members by display name and return only their Workspace
role. Result snippets are plain text, centered near a matching term when
possible, stripped of control characters, and bounded to 240 Unicode
characters.

Projection rebuilds replay the durable Workspace event log into an isolated
replacement generation before activation. Callers keep reading the prior
generation until the replacement catches up, so rebuilds do not create a
partially empty index. Search also has a dedicated request rate limit and a
short database query deadline. When workload protection trips, retry after the
`Retry-After` delay from `503 search_unavailable`; do not loop immediately.

## Inspect and ask Discuss <Badge type="warning" text="Upcoming" />

Search remains deterministic, including Enter. **Inspect work-result context** shows your query,
Workspace work scope and the returned page version. **Ask Discuss about work results** opens the
Discuss page with a removable context chip. Write a message and explicitly Send to continue; opening
Discuss does not use AI credits. People remain searchable and are excluded from this work handoff.

The first unfiltered, non-archived page with `limit=20` may include `result_version`. Other filters,
limits and later pages omit it. It identifies the observed work results, not exhaustive coverage or
current entity content. Search withholds stale index rows when the source is no longer available in
its indexed scope. Normal entity reads remain authoritative.
