# Workspace Knowledge

Workspace Knowledge is an optional evidence layer across authorized Assign
work, Documents, integrations, repository facts, and code. It does not replace
canonical resources or ordinary lexical [Search](search.md).

The Web client uses Knowledge in contextual features such as related Task
evidence. A standalone Knowledge search destination is not part of the
supported production navigation.

## Search evidence

Knowledge updates asynchronously after changes to included Projects, Tasks,
Documents and enabled Comments. A rebuild or temporary service outage can delay
new evidence. Retrieval checks current access and source visibility; moved,
deleted or excluded content may disappear before replacement evidence is ready.
Turning off a source option removes its derived content asynchronously while
preserving the original Assign resources.

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
items and never blocks the Task workflow. Globally unconfigured, disabled,
unentitled, unacknowledged, empty-scope, and out-of-scope conditions use the
empty state so Task detail renders no error or placeholder. The unavailable
state is reserved for genuine retrieval/currentness failures after eligibility.

Indexed Tasks can discover Documents through shared distinctive title terms,
including function identifiers, without an explicit saved relation. The result
explains the shared terms and links to the authorized Document. These are inferred
suggestions, not proof of a dependency; they never create or modify Task relations.
No matching evidence produces an empty result. Pure paraphrases without shared
terms are not guaranteed to match.

Assign MCP clients use the existing `knowledge_search`, `knowledge_context`,
`knowledge_related`, `knowledge_path`, and `knowledge_impact` tools rather than
this browser-session route.

Optional MCP session memory is separate from this shared evidence layer.
`memory_remember` stores a bounded note in an explicitly consented 30-day scope
bound to the current Workspace, Actor and OAuth client; `memory_recall` searches
only that scope, `memory_export` returns its unexpired notes and `memory_forget`
purges and revokes it. Notes never appear in this HTTP response, shared
`knowledge_*`/`code_*` tools or automatic Agent learning. Production
availability is staged separately from the local P8 contract.
