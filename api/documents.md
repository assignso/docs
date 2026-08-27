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
