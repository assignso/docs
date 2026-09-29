---
description: Search Workspace Knowledge for evidence across Tasks, Documents, integrations and code, and get short cited answers.
---

# Workspace Knowledge

Workspace Knowledge is an optional evidence layer across the work, Documents, integrations, repository
facts and code you can access. It doesn't replace your resources or [Search](./search). The web app
uses it for related Task evidence, Search questions and private [Discuss](./discuss) answers.

Knowledge updates in the background after changes to included Projects, Tasks, Documents and, if
enabled, Comments. A rebuild or outage can delay new evidence. Access is checked on every read, so
moved, deleted or excluded content can disappear before replacement evidence is ready. Turning off a
source option removes its derived content but not the original resources.

These operations need a browser session and an active Knowledge entitlement and policy for the
Workspace. Responses are private and never include scores, prompts, model details or traces.
For an upcoming application WebSocket subscription, the three GETs below accept
`X-Assign-Realtime-Baseline: 1` and return a replay cursor and position on a
successful canonical read. See [Application realtime](./realtime); this is not
deployed yet.

## Search

```http
GET /api/v1/workspaces/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11/knowledge/search?q=launch%20readiness&limit=20
```

| Parameter | Rules |
| --- | --- |
| `q` | Required, 2–200 characters after trimming. |
| `project_id` | Limits results to one authorized, included Project plus permitted shared material. |
| `limit` | Default and maximum 20. |

The response state is `ready`, `empty` or `unavailable`. When Knowledge is disabled, unentitled or not
ready, you get `unavailable` so ordinary work carries on. Unexpected failures can return
`503 knowledge_unavailable`.

Each result has a kind, title, bounded excerpt, explanation, provenance (`authoritative`, `extracted`
or `inferred`), source time and, where available, navigation metadata. Code results can include a
repository, path and symbol. If the code index is unavailable, other results are marked incomplete.
Source citations are opaque identities, not download URLs. Treat `stale` and `truncated` as warnings,
and never conclude that something doesn't exist from a bounded result.

Passage excerpts quote source content. When a result includes separate retrieval context, use its
source, Project and section labels to locate the work; those labels do not add requirements or facts
to the quoted passage. Search can remain available while background evidence is being rebuilt.

## Answers

`GET /api/v1/workspaces/{workspace_id}/knowledge/answer?q=...` runs only on an explicit submission,
never per keystroke. It returns a one-sentence extractive answer and up to five current, authorized
sources. Its `supported`, `partial`, `conflicting` and `none` states make uncertainty explicit, and
Search still works when Knowledge is down.

## Related Task context

`GET /api/v1/workspaces/{workspace_id}/tasks/{task_id}/related-context` returns up to five related
items for a Task's **Suggestions** tab, with a `confidence` of `high`, `medium` or `low`. It never
blocks the Task. When Knowledge is off or not ready, it's empty, and `unavailable` means a genuine
retrieval failure. Results are direct, permission-filtered neighbors such as the Project, parent,
dependencies, relations, Comments and explicit references. A shared title, assignee, status or
Project, or similarity, isn't treated as proof of a relationship. Users confirm or discard results
with the feedback operation in [Tasks](./tasks#related-context-and-suggestions).

## MCP

MCP clients can use `gather_information` for the same bounded answer, plus `knowledge_search`,
`knowledge_context`, `knowledge_related`, `knowledge_path` and `knowledge_impact`. Each response
states its coverage (`ready`, `partial`, `stale` or `unavailable`) and a `match_status`. `no_match`
means nothing was found within that coverage, not that nothing exists. `knowledge_status` gives a
content-free diagnostic. See the [tool catalog](../mcp/tools).
