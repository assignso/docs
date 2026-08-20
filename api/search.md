# Search

`GET /api/v1/workspaces/{workspace_id}/search` searches Project and Task
titles in the caller's current Workspace. Browser-session authentication is
required. The Workspace boundary and read authorization are enforced by the
server, so a result never confirms the existence of an inaccessible resource.

## Request

The `q` query parameter is required. It accepts 1–200 characters after leading
and trailing whitespace are ignored. The operation supports the standard
bounded pagination parameters `limit` (1–100) and `cursor`, plus two optional
filters:

- `project_id` limits results to one Project.
- `resource_type` is either `project` or `task`.

For example:

```http
GET /api/v1/workspaces/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11/search?q=launch&resource_type=task&limit=20
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

Results are ordered by most recently updated, then identifier. This is a
bounded asynchronous projection, not a relevance-ranked index: it does not
return a score or exact total, and newly written content can take a short time
to appear. Documents, comments, snippets, fuzzy matching, relevance ranking,
and archived-content exclusion are not part of this operation yet.
