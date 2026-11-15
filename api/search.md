---
description: Search Projects, Tasks, Documents, Comments and People in a Workspace, with filters and pagination.
---

# Search <Badge type="warning" text="Upcoming" />

The updated Search contract is under development and is not deployed. Keep your
existing integration until its migration is announced.

`GET /api/v1/workspaces/{workspace_id}/search` searches Projects, Tasks, Documents,
Comments and active People in one Workspace. Supply a Workspace-scoped bearer
credential with read permission and current access to the resources you want to
find. Browser cookies do not authenticate this route.

[Search Workspace content](/api/reference/operations/searchworkspace) has the complete
request and response examples. Get your `workspace_id` from
[Workspace settings](/api/account#copy-workspace-id).

## Request

`q` is required, 2–200 characters after trimming. Other parameters:

| Parameter | Effect |
| --- | --- |
| `limit`, `cursor` | Page size 1–50 (default 20) and the cursor from the previous page. Keep the same credential, Workspace, query, filters and page size. |
| `project_id` | Limit results to one Project. If you cannot access the Project, Search returns an empty page. |
| `resource_type` | `project`, `task`, `document`, `comment` or `person`. People show their Workspace role as `subtitle`, never email. |
| `include_archived` | `true` includes archived Projects, Tasks, Documents and Comments. Excluded by default. |

```http
GET /api/v1/workspaces/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11/search?q=launch&resource_type=task&limit=20
```

Send `Accept: application/json` with an acceptable `identity` or `gzip` encoding.
Unsupported media or encoding returns `406 not_acceptable`. Responses use
`Cache-Control: no-store` and vary by `Accept` and `Accept-Encoding`. An oversized
page returns `413` without partial results; request a smaller `limit`.

## Response

Response excerpt showing the page envelope and selected display fields:

```json
{
  "data": [
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

Follow every non-null `next_cursor`, even after a short or empty page. A null
cursor ends pagination. Each page is authorized again. A changed credential,
membership, Workspace content/visibility checkpoint or contract can invalidate
continuation. On `400 invalid_cursor`, discard the cursor and restart with the
same intended search. Old signed cursors cannot resume the updated contract.

Ranking prefers exact IDs and titles, then title prefixes, full-text relevance, typo-tolerant matches
and recency. Documents and Comments also match their text, and People match display names. Snippets
are plain text of up to 240 characters, centered on a match where possible. The index catches up in
the background, and Search withholds rows whose source is no longer available.

Rate limits return `429`. Query timeout or temporary Search unavailability returns
`503 search_unavailable`. Wait for the `Retry-After` delay before retrying.

## Search in the native app <Badge type="warning" text="Upcoming" />

Open **Search** from a main screen and enter at least two characters. Native Search finds Project
and Task titles and codes in your current Workspace. Document, Comment and People results aren't
available there yet.

Choose a result to open it; **Back** returns to Search. **Load more** requests another page. If Search
fails, **Try again** starts from the first page for your current query. Removed results and content
you can no longer access are withheld. Changing accounts or Workspaces clears your search.

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
