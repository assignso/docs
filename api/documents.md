---
description: Find a Document, read and replace its content, recover conflicts and distinguish archiving from permanent deletion.
---

# Documents

A Document has metadata, a content body and revision history. It can belong to the Workspace or
a Project and can have child Documents. A link to a Task or Milestone relates existing items;
it does not move, copy or publish the Document.

The rewritten v1 resource flow is awaiting deployment. Check the [public reference](./reference/)
for operation availability. Integrations use the operation's admitted bearer credential from
[Authentication](./authentication), while Assign manages browser sign-in and live editing.
For repository mirroring, see [Git-backed Documents](./git-backed-documents).

## List and read

`GET /api/v1/workspaces/{workspace_id}/documents?limit=50` returns active root metadata, ordered
by title by default. Obtain the Workspace ID through
[credential setup](./authentication#make-your-first-request). To resolve an exact Document path,
use that collection's `path` query parameter. Take the path from the Document in Assign or saved
metadata and URL-encode it as a query value; a name alone is not necessarily its canonical path.

A successful `200` contains a bounded `data` page. An absent or inaccessible exact path produces
an empty authorized page. Use the returned immutable ID for `GET /api/v1/documents/{document_id}`
and `GET /api/v1/documents/{document_id}/content`. Metadata never includes the rich content body.
Metadata revisions and child counts are exact decimal strings; preserve them without rounding.
A summary, when present, is a scanning aid bound to a content revision and does not replace it.

For direct children, query the same Workspace collection with `parent_document_id`. For linked
Documents, use `task_id` or `milestone_id`; each related item and Document must be accessible.
`parent_document_id` cannot combine with `include_descendants=true`. `q` searches titles and
extracted text; `project_id`, `scope` and `location` narrow the selection. `location` describes
structure, not permission. Use `archived_only=true` for archived roots; active and archived
Documents are not mixed. See [Workspace Documents](./reference/operations/listworkspacedocuments)
for accepted filter combinations and pagination limits.

Pages default to 50 and cap at 100. Follow every non-null `next_cursor`, including after an empty
or short page, with the original filters, order and credential. Traversal is live rather than a
snapshot. If a cursor expires or no longer matches the query or visibility, discard it and
restart from a current first page; do not treat a partial scan as proof that a Document is absent.

### Create a Document

This creates a Workspace-visible Document, not a public link. Choose a fresh key and retain the
exact request until the result is known:

```http
POST /api/v1/workspaces/{workspace_id}/documents
Authorization: Bearer <token>
Idempotency-Key: <key-for-this-document>
Content-Type: application/json
Accept: application/json

{"title":"Review onboarding notes","visibility":"workspace"}
```

[Create a Document](./reference/operations/createdocument) returns `201` with the created
metadata. Save its `id` for content reads and cleanup. After a lost response, recover with the
original key and body. A list page can omit a Document whose create already committed.

### Edit metadata or content

To [edit metadata](./reference/operations/updatedocument), first
[read the metadata item](./reference/operations/getdocument) with `view=canonical`.
Forward its tag in `If-Match` with a key for that edit.
To [replace content](./reference/operations/replacedocumentcontent), first
[read the canonical content](./reference/operations/getdocumentcontent) with
`format=json&view=canonical`. Use its tag and `format=json` on the replacement request.

The expected result is `200` with the new metadata or content. Keep the same content format and
encoding; metadata, JSON content, Markdown content and historical revision validators cannot
substitute for one another. Never construct a tag from a revision number.

A missing condition returns `428`. Read the appropriate representation to obtain its tag.
A stale condition returns `412`. Compare the current state with your draft before preparing
another write. After an interrupted metadata edit, recover the original keyed request. Content
replacement takes only a condition. After a timeout or cancellation, reread the current content
and compare it with the draft. If the draft is already saved, continue from the current result.
If the content differs, review the differences before choosing whether to save again. If access
is lost, stop with the local draft intact.

## Attachments

[List Document attachments](./reference/operations/listdocumentattachments) to find linked
files. Follow the cursor through the final page. Complete
the [upload flow](./attachments#upload-and-attach) before linking a clean attachment:

```http
POST /api/v1/documents/{document_id}/attachments
Authorization: Bearer <token>
Idempotency-Key: <key-for-this-link>
Content-Type: application/json

{"attachment_id":"<completed-attachment-id>"}
```

The [link operation](./reference/operations/attachdocumentattachment) uses the immutable ID from
upload completion. You need write access to the Document and access to
the file. Confirm the link before inserting its ID in the body. After a lost response, recover
the original link request; do not upload the bytes again automatically. A Document's historical
revisions can still use its linked files. Store attachment IDs in content, never temporary URLs.
Removing a file block is different from deleting a shared attachment object.

## Revisions and recovery

Creates, metadata edits, content replacements, collaboration checkpoints, archive and restore
retain revision snapshots. `GET /api/v1/documents/{document_id}/revisions` lists them newest first;
`GET /api/v1/documents/{document_id}/revisions/{revision}` reads one. Use returned revision
identities without numeric conversion. To compare two known revisions, use
`GET /api/v1/documents/{document_id}/revisions/compare?from={from_revision}&to={to_revision}`.

`POST /api/v1/documents/{document_id}/revisions/{revision}/restore` creates a new revision from
the selected snapshot. Obtain the current metadata item tag, retain the restore key and use
`If-Match`; a `412` requires a fresh read and reconciliation. Restoration preserves intervening
history rather than replacing it silently.

`POST /api/v1/documents/{document_id}/archive` removes the Document from navigation and search
without permanently deleting it. `POST /api/v1/documents/{document_id}/restore` brings an archived
Document back. Use each command's current item condition and idempotency key. Verify the restored
metadata and content before discarding a recovery draft. Access is checked on history and
recovery requests as well as ordinary reads.

## Markdown

Use `GET /api/v1/documents/{document_id}/content?format=markdown` with `Accept: text/markdown` to
export UTF-8 Markdown. Add a returned `revision` to export a historical snapshot. A successful
response is `200` with Markdown and its format-specific validator; it is not a JSON content DTO.

To replace current content with Markdown, read its current Markdown representation first, then
send `PUT /api/v1/documents/{document_id}/content?format=markdown` with that tag in `If-Match`,
`Content-Type: text/markdown; charset=utf-8` and an acceptable Markdown response type. Use the same
encoding. The limit is 2 MiB of UTF-8 bytes; unsupported or lossy conversion returns `422` rather
than silently dropping content. This replacement has the same unkeyed interruption recovery as
JSON content. A historical export tag cannot authorize a current edit.

The supported profile includes paragraphs, headings, emphasis, code, block quotes and lists.
Raw HTML never runs. Keep attachment identities in structural content instead of expecting
short-lived file URLs to form a portable export. See [Editor tables](../guides/editor#tables)
for table compatibility.

## Publish

Publishing gives the Document an opaque public ID. The public reader is a separate share
protocol, not a bearer-authenticated product resource:

```http
GET /share/v1/documents/{public_id}
Host: api.assign.so
```

The ID comes from publishing the Document in Assign. Anyone holding it can read the public page
at `https://assign.so/d/{public_id}`. The public representation contains `public_id`, `title`,
`content` and `updated_at`, without Workspace, Project, hierarchy, author or revision data. It is
rate-limited and does not grant editing or navigation access. Treat the ID as a sharing
capability; change to a non-public scope to revoke access.

Public file access requires both a link to this Document and a reference in its current body.
Unpublishing prevents new file links from being issued; a storage link already issued may remain
usable until expiry. See [Attachments](./attachments#read-download-and-delete).

## Live editing

Assign's editor manages presence, live editing and saved checkpoints. Integrations use the
content operations above. After an editing conflict or interrupted connection, retain the local
draft and read current content before replacing it; a disconnect does not prove a save failed.
The live editor connection is not a public REST, SDK or MCP content interface.

## Editor references

[Reference options](./reference/operations/listworkspacereferenceoptions) supplies candidates for
mentions and links. Send a query and supported types, with an optional per-type limit. Results
are permission-filtered groups with no cursor or total; a blank query returns empty groups.
A reference does not grant access or permission to run an Agent. Selecting an Agent in a Comment
requests its attention when the Comment is created.

Store the returned stable `assign:` URI in rich text. `surface=comment` and `surface=discuss`
apply their respective selection rules. For assisted changes, see
[Proposals and receipts](./work-capabilities).

## Schema-2 table compatibility

<Badge type="warning" text="Awaiting deployment" />

Schema 2 adds bounded structured tables. Simple tables use GFM Markdown; richer tables use a
lossless `assign-table` fenced JSON block. Schema 1 keeps unsupported tables inert. Raw HTML never
runs. Preserve the content's schema version; upgrade an incompatible client rather than
converting newer content to an older schema. See [Editor tables](../guides/editor#tables).

## Paid public publishing <Badge type="warning" text="Awaiting deployment" />

Publishing public Documents or Projects requires a paid entitlement in that Workspace. Being a
paid member of another Workspace does not qualify. A denied publish returns
`403 paid_workspace_required`; content stays unchanged and authorized users can still unpublish.

Public links and new public Document file requests return the usual unavailable result while the
entitlement is absent. Stored content and visibility remain intact, so a still-published,
unarchived link can become available again when the entitlement returns. Unpublishing and
archiving preserve their revocation effects.

## Permanently delete a Document

For example cleanup, verify the saved ID belongs to the Document your workflow created.
[Archive it](./reference/operations/archivedocument) with its current metadata item tag and a
fresh key, then verify the archived state in the `200` result. After a lost archive response,
recover the original keyed request before taking another action.

Permanent deletion removes the Document, its history and resource links and cannot be undone.
Leave pre-existing or shared Documents available to their users.

[Permanently delete a Document](./reference/operations/deletedocument) requires the current metadata item's opaque
`If-Match` and an `Idempotency-Key`. Success returns `204` without a body; later reads return
`404`. After a lost response, recover the original key and condition before another intent.
A stale condition returns `412` and leaves the Document unchanged.

Documents with children, including archived children, return `409 document_has_children`;
Git-managed Documents return `409 document_git_managed`. Preserve them and resolve the reason
rather than deleting children as an automatic cleanup step. Attachment objects follow their own
retention and link rules; deleting a Document is not permission to delete shared files.

<a id="link-documents-to-tasks-and-milestones"></a>

## Link Documents to Tasks and Milestones <Badge type="warning" text="Awaiting deployment" />

Use **Link work** in a Document, or **Link document** on a Task or Milestone. A Project Document
links within its Project; a Workspace Document can link to a Project you can access. Both items
must be editable. Links do not publish items or grant access. A failed save keeps your selection
for retry.

Read links with `GET /api/v1/documents/{document_id}/links`. For the reciprocal view, query the
Workspace Document collection with `task_id` or `milestone_id`. Follow every non-null cursor.
Create a link with `POST /api/v1/documents/{document_id}/links/{target_kind}/{target_id}` and an
idempotency key; `target_kind` is `task` or `milestone`. Get the target ID from the accessible
Task or Milestone, not its display code. The expected result is `201`; an existing pair under a
new key returns `409`, so recover the original request after uncertainty instead of recreating it.

To remove only the association, send `DELETE` to the same link path with its observed item
validator and a key for removal. The link list supplies each link's item validator; its collection
tag cannot authorize deletion. Success is `204` without a body. Neither item is deleted. Stop
and reconcile a failed condition or lost access rather than expanding the removal to either
resource.
