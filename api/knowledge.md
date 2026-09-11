# Workspace Knowledge

Workspace Knowledge is an optional evidence layer across authorized Assign
work, Documents, integrations, repository facts, and code. It does not replace
canonical resources or ordinary lexical [Search](search.md).

The Web client uses Knowledge in contextual features such as related Task
evidence, committed ordinary Search questions, and private Discuss responses.

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
from a bounded result. Available domains may still return results when the code index is
unavailable; such a result is marked incomplete. External source citation references are opaque
identities, not reusable download URLs. Use authorized resource navigation metadata when present.

Responses are `private, no-store`. The API never exposes raw Knowledge scores,
prompts, provider/model identity, graph identifiers, topology, credentials, or
traces.

## Concise answers

`GET /api/v1/workspaces/{workspace_id}/knowledge/answer?q=...` runs only after
an explicit submission. It returns an extractive one-sentence answer and at
most five current, authorized sources. `supported`, `partial`, `conflicting`,
and `none` make uncertainty and abstention explicit. Assign does not call this
route for each keystroke, and ordinary lexical Search remains usable when the
Knowledge service is unavailable.

## Related Task context

`GET /api/v1/workspaces/{workspace_id}/tasks/{task_id}/related-context` remains
the smaller fail-open Task-detail projection. It returns at most five related
items and never blocks the Task workflow. Globally unconfigured, disabled,
unentitled, unacknowledged, empty-scope, and out-of-scope conditions use the
empty state so Task detail renders no error or placeholder. The unavailable
state is reserved for genuine retrieval/currentness failures after eligibility.

Task context contains only direct, permission-filtered canonical neighbors such as
the owning Project, parent, explicit dependencies and Task relations, Comments, and
explicit Task/Document references. It does not treat a shared title, assignee,
status, Project, semantic similarity, or graph proximity as proof that two Tasks
concern the same work. A shared Project may appear as context, but Assign does not
expand through it to every Task in that Project. The requested result limit is a
maximum; when there is no supported connection, the result is empty.

A Task with only a title remains searchable and keeps its real canonical links.
Similar Tasks and Documents can still be discovered through Knowledge search, but
similarity is not returned as a factual relationship or promoted to a Task
dependency.

Assign MCP clients may use `gather_information` for the same concise bounded
answer. They may also use the existing `knowledge_search`, `knowledge_context`,
`knowledge_related`, `knowledge_path`, and `knowledge_impact` tools rather than
this browser-session route.

Optional MCP session memory is separate from this shared evidence layer.
`memory_remember` stores a bounded note in an explicitly consented 30-day scope
bound to the current Workspace, Actor and OAuth client; `memory_recall` searches
only that scope, `memory_export` returns its unexpired notes and `memory_forget`
purges and revokes it. Notes never appear in this HTTP response, shared
`knowledge_*`/`code_*` tools or automatic Agent learning. Production
availability is staged separately from the local P8 contract.
