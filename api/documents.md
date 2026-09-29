---
description: List, create, edit, restore, delete, export and publish Documents, and the editor's reference picker.
---

# Documents

Document operations use a browser session and the [API conventions](./conventions). Full schemas are
in the [OpenAPI document](/openapi.yaml). For repository mirroring, see
[Git-backed Documents](./git-backed-documents).

Creates need an `Idempotency-Key`. Metadata and content updates need the current `If-Match`, and a
stale revision returns `409` so you can reload and let the person reconcile.

## List and read

A Document's metadata includes its scope (`workspace`, `project` or `public`), optional Project and
parent, direct-child count and, when published, a public ID. Content is read and updated separately
from metadata.

`GET /api/v1/workspaces/{workspace_id}/documents` returns a title-ordered page of active root
Documents.

`GET /api/v1/workspaces/{workspace_id}/documents/by-path/{document_path}` resolves an active
Document's metadata by its canonical path, including a Document outside the current list page.
The caller needs access to the Workspace and, for a Project Document, that Project. A missing,
archived or inaccessible path returns `404`. Read the body through
`GET /api/v1/documents/{document_id}/content` using the returned ID.

| Parameter | Effect |
| --- | --- |
| `q` | Match titles and extracted text (up to 200 characters). |
| `project_id`, `scope` | Restrict to a Project, or to `workspace`, `project` or `public`. |
| `location` | `workspace` for Documents outside every Project, `projects` for those inside one. It describes structure, not access. It can't combine with `project_id` when `workspace`. |
| `sort` | `title` (default), `updated_desc` or `updated_asc`. |
| `include_descendants` | `true` returns nested Documents as rows, each with an `ancestors` array (`id`, `title`, `path`, root first). |
| `archived_only` | `true` lists archived roots for recovery. Active and archived are never mixed. |

A `next_cursor` is valid only with the same filters and sort. `GET
/api/v1/documents/{document_id}/children` lists direct children, cursor-paginated.

Metadata includes a nullable `summary`, a one- or two-sentence aid for bodies of 300 or more
characters, with the `source_revision` it describes. It's `null` while pending, when the body changes
or when the body is shorter. It doesn't replace the content. Anonymous published responses omit it.
Documents, Projects and Tasks share the target-label operations in OpenAPI to replace their label set.

## Attachments

`GET /api/v1/documents/{document_id}/attachments` lists a Document's attachments. Link a completed,
clean upload before inserting its ID into the body:

```http
POST /api/v1/documents/{document_id}/attachments HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"attachment_id": "<attachment-id>"}
```

You need write access to the Document, plus Project membership for Project Documents. The link
survives edits and archiving, so historical revisions still resolve it. Signed preview and download
URLs are short-lived and don't belong in the body.

## Revisions and recovery

Every create, metadata edit, content replacement, collaboration checkpoint, archive and restore saves
an immutable snapshot.

- `GET /api/v1/documents/{document_id}/revisions` lists snapshots, newest first, and `…/revisions/{revision}`
  reads one.
- `GET …/revisions/compare?from=4&to=9` returns both snapshots and the changed fields.
- `POST …/revisions/{revision}/restore` with the current `If-Match` makes a snapshot's content a new
  revision. A concurrent change returns `409 revision_conflict`.
- Archiving removes a Document from navigation and search without deleting anything.
  `POST /api/v1/documents/{document_id}/restore` with the archived Document's `ETag` brings it back.

Access is checked again on every history and recovery request.

## Markdown

`GET /api/v1/documents/{document_id}/markdown` exports deterministic UTF-8 Markdown, and
`?revision={revision}` exports a snapshot. `PUT` on the same path imports up to 2 MiB and replaces
the content under `If-Match`.

The supported profile covers paragraphs, headings, emphasis, inline and fenced code, block quotes,
lists, task lists and horizontal rules. Other valid Markdown is accepted but not interpreted:
schema-1 unsupported blocks such as raw HTML or tables are kept as inert `markdown` code blocks and
unsupported inline syntax as inline code. Raw HTML never runs. Attachments are left out of exports,
because signed URLs shouldn't become portable content.

## Publish

Publishing gives the Document an opaque public ID. Anyone with it can read the page:

```http
GET /api/v1/public/documents/{public_id} HTTP/1.1
Host: api.assign.so
```

The web reader is at `https://assign.so/d/{public_id}`, with no editing, navigation or identity.
Image and file blocks use public attachment access, granted only for attachments linked to the
Document and referenced in its current body.

The endpoint needs no session, is rate-limited and isn't cached. It returns only `public_id`, `title`,
`content` and `updated_at`, with no Workspace, Project, hierarchy, author or revision data. Treat the
ID as the sharing capability. To revoke access, change the Document back to a non-public scope.

## Live editing

`POST /api/v1/documents/{document_id}/collaboration-sessions` opens a short-lived presence lease and
returns an `editor` or `viewer` role. Each tab gets its own session, and `DELETE
…/collaboration-sessions/{session_id}` ends yours safely, even on retry. The browser uses the
returned admission token once to open the same-origin `GET /api/v1/documents/{document_id}/collaboration`
WebSocket. That relay is part of the Assign browser and isn't a public API, SDK or MCP interface. Use
the content operations above for integrations.

## Editor references

`GET /api/v1/workspaces/{workspace_id}/reference-options` feeds the editor's `@` picker. Pass `q` and
optionally repeat `types` with `user`, `document`, `project`, `task` or `agent`. Results are grouped
by type, limited to readable, non-archived resources, with 10 candidates per group by default and 20
at most, and no cursor. An empty or blank `q` returns empty groups.

Each candidate has a stable `assign:` URI to store in rich text, a display label and, where useful,
a `secondary_label` such as an email, Project key or Task code. Agent candidates are active
definitions in the Workspace. Selecting one in a Comment stores an `assign:agent/` reference and
requests the Agent's attention when the Comment is created.

Add `surface=discuss` to get Agents that can take a [Discuss](./discuss) request without a Task-comment
tool. The default `surface=comment` applies Comment rules. Both check current visibility and
entitlement, and choosing an option doesn't grant permission to run it.

For AI-assisted changes, see [Proposals and receipts](./work-capabilities).

## Schema-2 table compatibility

<Badge type="warning" text="Awaiting deployment" />

Schema 2 adds bounded structured tables. Simple tables use GFM Markdown; richer tables use a lossless `assign-table` fenced JSON block. Schema 1 keeps unsupported tables inert. Raw HTML never runs. See [Editor tables](../guides/editor#tables).

For Document or Task collaboration admission, send `X-Assign-Document-Schema: 2` explicitly. Schema-1 admission to schema-2 content returns `409 document_schema_version_unsupported`; upgrade the client rather than downgrade the content. MCP structural content accepts supported schema versions; inspect your connected server’s catalog before writing schema-2 content.

## Paid public publishing <Badge type="warning" text="Awaiting deployment" />

Publishing public Documents or Projects requires a paid entitlement in that Workspace. Being a paid member of another Workspace does not qualify. A denied publish returns `403 paid_workspace_required`; your content stays unchanged and authorized users can still unpublish.

Public links and new public Document attachment preview/download requests return the usual unavailable result while the entitlement is absent. Stored content and visibility remain intact, so a still-published, unarchived link can become available again when the entitlement returns. Unpublishing or archiving keeps its existing revocation rules.

## Permanently delete a Document

In Documents, open a row's actions menu and choose **Delete**, or choose **Delete document** on the document page. The confirmation names the document and warns that its content and revision history cannot be recovered. **Cancel** leaves it intact. Use **Archive** instead when you want to restore it later.

`DELETE /api/v1/documents/{document_id}/permanent` permanently removes an active or archived document. Send the browser-session CSRF token and the current revision in `If-Match`. Workspace write permission and, for a Project document, Project write permission are required. Success returns `204`; later reads return `404`.

A stale revision returns `409 revision_conflict`. Documents with children, including archived children, return `409 document_has_children`; delete the children first. Git-managed documents return `409 document_git_managed`. A conflict preserves the document. Deletion removes its history and resource links; attachment objects follow their existing cleanup policy.

The existing `DELETE /api/v1/documents/{document_id}` still archives a document. The TypeScript and PHP SDKs expose permanent deletion as `deleteDocument`; native credential admission and a CLI/MCP delete action are not included.


## Link Documents to Tasks and Milestones <Badge type="warning" text="Awaiting deployment" />

On an existing Document, choose **Link task or milestone** under Relations. Choose the kind and pick an item; a Workspace Document first asks you to select a Project. Selection saves the link automatically. Tasks and existing Milestone pages show the reciprocal **Linked documents** list with **Link document**. Links open the related item. Choose **Remove relation** and confirm to remove only the link.

You need permission to edit both items. A Project Document links within its Project; a Workspace Document can link to any Project you can access. Links do not grant access or publish related items. Archived items are omitted. A failed save keeps your selection for Retry.

Read associations with `GET /api/v1/documents/{document_id}/links`, `GET /api/v1/tasks/{task_id}/documents` or `GET /api/v1/milestones/{milestone_id}/documents`. Follow `next_cursor` even when an authorized page is empty. Create with `POST /api/v1/documents/{document_id}/links/{target_kind}/{target_id}` and remove with `DELETE` on the same path, using the browser session, CSRF token and Idempotency-Key. `target_kind` is `task` or `milestone`. These operations are not currently exposed through MCP or native credentials. See the [endpoint reference](./endpoints) for schemas.
