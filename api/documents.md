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

This endpoint has no browser-session requirement, is rate limited, and returns
`Cache-Control: no-store`. Its response contains only `public_id`, `title`,
`content`, and `updated_at`; it does not reveal Workspace, Project, parent,
child, author, audit, or revision data. Treat the public identifier as the
sharing capability; change the Document back to a non-public scope to revoke
access.
