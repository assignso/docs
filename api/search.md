---
description: Search Projects, Tasks, Documents, Comments and People in a Workspace, with filters and pagination.
---

# Search

`GET /api/v1/workspaces/{workspace_id}/search` searches Projects, Tasks, Documents, Comments and
active People in the current Workspace. It accepts browser sessions, scoped personal API tokens and
developer-client credentials. Results never reveal that an inaccessible resource exists.

## Request

`q` is required, 2–200 characters after trimming. Other parameters:

| Parameter | Effect |
| --- | --- |
| `limit`, `cursor` | Page size 1–50 and the cursor from the previous page. A cursor works only with the same Workspace, query and filters. |
| `project_id` | Limit results to one Project. |
| `resource_type` | `project`, `task`, `document`, `comment` or `person`. People show their Workspace role as `subtitle`, never email. |
| `include_archived` | `true` includes archived Projects, Tasks, Documents and Comments. Excluded by default. |

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

`project_id` is `null` for a Project. Results are bounded and have no score or exact total.

Ranking prefers exact IDs and titles, then title prefixes, full-text relevance, typo-tolerant matches
and recency. Documents and Comments also match their text, and People match display names. Snippets
are plain text of up to 240 characters, centered on a match where possible. The index catches up in
the background, and Search withholds rows whose source is no longer available.

If a request is rate-limited or slow, you get `503 search_unavailable`. Wait for the `Retry-After`
delay instead of retrying immediately.

## Ask Discuss about results <Badge type="warning" text="Upcoming" />

Search stays deterministic, including on Enter. **Use work results in Discuss** shows your query, the
Workspace scope and the page version, and **Ask Discuss about work results** opens Discuss with a
removable context chip. Nothing is sent, and no AI credits are used, until you send a message. People
aren't included.

The first unfiltered, non-archived page at `limit=20` may include `result_version`, identifying the
observed results, not complete coverage or current content. Normal reads remain authoritative.

## Result navigation fields <Badge type="warning" text="Awaiting deployment" />

Results may include `identifier`, `project_path` and `project_code`. Use `identifier` to display a
Task or Comment's ticket number, or to identify a Document's path. Project results include their
canonical `project_path`. These fields let you build links without loading the whole collection.
Clients should continue to accept responses that omit these optional fields.
