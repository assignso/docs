# Workspace Knowledge

Workspace Knowledge is an optional evidence layer across authorized Assign
work, Documents, integrations, repository facts, and code. It does not replace
canonical resources or ordinary lexical [Search](search.md).

The supported Web client exposes a first-class **Knowledge** destination.
Queries run only after explicit submission. Results identify why they matched,
their provenance and source time, and whether the Knowledge index is stale or
the bounded result was truncated. A result links to Assign only when Core can
resolve a current canonical resource; code or external evidence may remain
read-only.

## Search evidence

`GET /api/v1/workspaces/{workspace_id}/knowledge/search` requires
browser-session authentication and the current Workspace's active Knowledge
entitlement and policy.

Parameters:

- `q` is required and contains 2–200 characters after trimming.
- `project_id` optionally restricts retrieval to one currently authorized
  included Project plus permitted shared material.
- `limit` is optional, defaults to 20, and cannot exceed 20.

Example:

```http
GET /api/v1/workspaces/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11/knowledge/search?q=launch%20readiness&limit=20
```

The response state is `ready`, `empty`, or `unavailable`. Known disabled,
unentitled, unready, not-current, and temporary service conditions use the
explicit `unavailable` projection so callers can keep ordinary Workspace work
available. Unexpected service failures may return `503 knowledge_unavailable`.

Each result includes a display-safe kind, title, bounded excerpt, explanation,
`authoritative`, `extracted`, or `inferred` provenance, source time, and nullable
current-resource navigation metadata. Code evidence may also carry a repository
identifier, repository path, and symbol. Treat `stale` and `truncated` as
warnings that the projection may be behind or incomplete; never infer absence
from a bounded result.

Responses are `private, no-store`. The API never exposes raw Knowledge scores,
prompts, provider/model identity, graph identifiers, topology, credentials, or
traces.

## Related Task context

`GET /api/v1/workspaces/{workspace_id}/tasks/{task_id}/related-context` remains
the smaller fail-open Task-detail projection. It returns at most five related
items and never blocks the Task workflow.

Assign MCP clients use the existing `knowledge_search`, `knowledge_context`,
`knowledge_related`, `knowledge_path`, and `knowledge_impact` tools rather than
this browser-session route.
