# Documents

Document operations use the authenticated browser session and the shared
[API conventions](conventions.md). The complete request and response schemas,
including examples and error codes, are in the versioned OpenAPI contract.

## Authenticated Documents

Use the Workspace Document collection to list or create root Documents. A
Document's metadata includes its scope (`workspace`, `project`, or `public`),
optional Project and parent Document, direct-child count, and public identifier
when it is published. Read and update an individual Document separately from
its versioned rich-text content.

`GET /api/v1/workspaces/{workspace_id}/documents` returns a bounded,
title-ordered page of active root Documents. Use `q` (up to 200 characters) to
match titles and extracted text, `project_id` to restrict the Project, and
`scope` for `workspace`, `project`, or `public`. A returned `next_cursor` is
valid only with the same filters; start a new request when a filter changes.
Set `archived_only=true` to browse the same bounded, authorized collection of
archived roots for recovery; active and archived Documents are never mixed in
one traversal.

## Collaboration admission and browser relay

`POST /api/v1/documents/{document_id}/collaboration-sessions` admits you to a
short-lived presence lease. It returns an `editor` role when you can edit the
Document and `viewer` when you can only read it. Repeat the request at the
returned heartbeat interval to remain present; reconnecting renews your one
lease rather than adding a duplicate collaborator. End your own lease with
`DELETE /api/v1/documents/{document_id}/collaboration-sessions/{session_id}`;
a retried successful end is safe.

The returned admission token is scoped to that Document and session and is not
an API credential. The Assign browser uses it once to open the same-origin
`GET /api/v1/documents/{document_id}/collaboration` WebSocket relay. The
relay performs durable acknowledgement, checkpoint/reconnect recovery, and
current-access rechecks; permission loss or lease expiry closes the connection.

That binary Yjs relay is an Assign browser implementation boundary, not a
general public HTTP, SDK, or MCP API. Do not depend on its frames, pass the
admission token through a URL, or use it as an alternative credential. Public
Document content APIs remain the supported integration surface.

## Editor references and mentions

`GET /api/v1/workspaces/{workspace_id}/reference-options` supplies candidates
for the editor’s `@` picker. Provide `q` and optionally repeat `types` with
`user`, `document`, `project`, or `task`. Results are grouped by type, filtered
to resources you can read, and exclude archived resources. Each group defaults
to 10 candidates and never exceeds 20; there is no cursor or total count.

Every candidate includes its stable `assign:` URI for storing in rich text,
with a display label and, when useful, an email, Project name, Project key, or
Task ticket reference as `secondary_label`. Blank or whitespace-only `q`
returns empty groups rather than a Workspace directory.

Direct children are available from `GET /api/v1/documents/{document_id}/children`.
The response is cursor-paginated; clients should retain the next cursor rather
than assuming a Document tree is returned in one response. Documents, Projects,
and Tasks use the generic target-label operations in the OpenAPI contract to
replace their complete label set.

Creates require `Idempotency-Key`; metadata and content updates require the
current `If-Match` value. A stale revision returns `409`, so clients should
reload and let the person decide how to reconcile their changes.

## Revision history and recovery

Every successful create, metadata edit, content replacement, collaboration
checkpoint, archive, and restore records an immutable snapshot. List snapshots
newest first with `GET /api/v1/documents/{document_id}/revisions`, read one at
`GET /api/v1/documents/{document_id}/revisions/{revision}`, or compare two with
`GET /api/v1/documents/{document_id}/revisions/compare?from=4&to=9`. Comparison
returns both authorized snapshots and a stable list of changed fields; it does
not expose the collaboration update log.

Restore a snapshot with
`POST /api/v1/documents/{document_id}/revisions/{revision}/restore`. The source
snapshot remains immutable and its contents become a new active revision, so
the restore itself can be reviewed or reversed. Send the current Document ETag
in `If-Match`; a concurrent change returns `409 revision_conflict`.

Archiving removes a Document from ordinary navigation and search without
deleting its content or history. Recover it with
`POST /api/v1/documents/{document_id}/restore` and the archived Document's
current ETag. Authorization is re-evaluated for history, comparison, and every
recovery operation.

## Markdown interchange

`GET /api/v1/documents/{document_id}/markdown` exports the current canonical
content as deterministic UTF-8 Markdown. Add `?revision={revision}` to export a
historical snapshot. `PUT /api/v1/documents/{document_id}/markdown` imports up
to 2 MiB and replaces the current content under `If-Match`.

The interchange format is a safe CommonMark/GFM subset covering paragraphs,
headings, emphasis, inline and fenced code, block quotes, ordered and unordered
lists, task lists, and horizontal rules. Raw HTML, external images, tables,
footnotes, and definition lists are rejected with `400 invalid_markdown` rather
than executed or silently flattened. Assign attachments are omitted from
Markdown export because signed download URLs must not become portable content.

## Published Documents

Publishing returns an opaque public identifier. Anyone holding it may read the
minimal rendered source through:

```http
GET /api/v1/public/documents/{public_id} HTTP/1.1
Host: api.assign.so
```

The Assign web reader is available at `https://assign.so/d/{public_id}`. It
renders the same public-safe title and body for people without an Assign
account; it has no editing, Workspace navigation, or identity metadata.

This endpoint has no browser-session requirement, is rate limited, and returns
`Cache-Control: no-store`. Its response contains only `public_id`, `title`,
`content`, and `updated_at`; it does not reveal Workspace, Project, parent,
child, author, audit, or revision data. Treat the public identifier as the
sharing capability; change the Document back to a non-public scope to revoke
access.
