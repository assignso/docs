---
description: Use Workspace Knowledge in Assign and connect supported MCP tools for bounded evidence and cited answers.
---

# Workspace Knowledge

Workspace Knowledge is an optional evidence layer across the work, Documents, integrations, repository
facts and code you can access. It doesn't replace your resources or [Search](./search). The web app
uses it for related Task evidence, Search questions and private [Discuss](./discuss) answers.

## Paid-plan defaults <Badge type="warning" text="Awaiting deployment" />

Workspace Knowledge is enabled by default on paid plans. Select included Projects to
start indexing; an empty selection indexes nothing. Turning Knowledge off preserves
your choice when your plan renews or changes.

## Background updates

Knowledge updates in the background after changes to included Projects, Tasks, Documents and, if
enabled, Comments. A rebuild or outage can delay new evidence. Access is checked on every read, so
moved, deleted or excluded content can disappear before replacement evidence is ready. Turning off a
source option removes its derived content but not the original resources.

Knowledge views need current Workspace and Project access and an active Knowledge entitlement
and policy. Upcoming [live updates](./realtime) refresh the views you have open. Results can still
be stale while background indexing catches up.

## Search

Use Knowledge search in Assign to find evidence across your included sources. Each result carries
source context and a bounded excerpt. Access changes can remove a result. An empty or incomplete
result does not establish that the source does not exist. Use ordinary [Search](./search) to find
canonical resources.

<a id="answers"></a>

## Answers <Badge type="warning" text="Awaiting deployment" />

Ask a question in Assign or use the supported MCP tools below. Answers include citations and
state when evidence is partial, conflicting or missing. Check the cited sources before acting.

## Related Task context

Task [Suggestions](./tasks#related-context-and-suggestions-awaiting-deployment) offer bounded,
permission-filtered evidence. Use the Task operations in that guide to read Suggestions and submit
an explicit confirmation or discard. Code references identify a repository, revision and path;
they are read-only evidence and cannot be confirmed as a Task relation.

## MCP

MCP clients can use `gather_information` for the same bounded answer, plus `knowledge_search`,
`knowledge_context`, `knowledge_related`, `knowledge_path` and `knowledge_impact`. Each response
states its coverage (`ready`, `partial`, `stale` or `unavailable`) and a `match_status`. `no_match`
means nothing was found within that coverage, not that nothing exists. `knowledge_status` gives a
content-free diagnostic. See the [tool catalog](../mcp/tools).
