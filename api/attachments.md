---
description: Attach files to Tasks, Projects and Documents, handle incomplete uploads and use temporary download links safely.
---

# Attachments

Files can be attached to Tasks, Projects and Documents. A file can belong to several resources in
the same Workspace. Assign stores the attachment identity so you can move a file block without
uploading its bytes again.

## Upload and attach

In an existing Document or Task description, use the image or file command in the toolbar or slash
menu. On a Task, attachments appear after the description and before Relations. On a Project,
they appear in the **Attachments** tab after **Documents**.

Use **Add files** or drop files onto the page. Queued, uploading and verifying files stay visible
with cancel and retry. A multi-file drop gives one success notice. Wait for verification to finish
before treating a file as attached.

Project files show as a grid. Clean raster images show a thumbnail. Unscanned files, SVG and
non-image files show an icon.

### API upload workflow <Badge type="warning" text="Upcoming" />

Use a bearer credential admitted for file writes and obtain the Workspace ID through
[Authentication](./authentication#make-your-first-request). Create the parent Task, Project or
Document first and save its immutable ID. These requests describe the upcoming resource flow;
check [operation availability](./reference/) before using it.

Reserve the exact byte count from 1 through 52,428,800 bytes (50 MiB). The display filename must
fit within 255 UTF-8 bytes after NFC normalization. It cannot contain a path separator, null or
control character, be `.` or `..`, or start or end with whitespace or a dot. Invalid filenames
are rejected rather than rewritten.

An optional `content_type` is advisory. Completion detects the stored type from the file bytes;
changing the declared type does not bypass the [safety rules](#safety).

1. **Reserve.** Choose one local file and determine its exact byte length. For this example,
   `printf 'hello\n' > hello.txt` creates a six-byte UTF-8 file. Reserve those bytes with a fresh
   key, retaining the request until the result is known:

   ```http
   POST /api/v1/attachment-uploads
   Authorization: Bearer <token>
   Idempotency-Key: <key-for-this-reservation>
   Content-Type: application/json

   {"workspace_id":"<workspace-id>","filename":"hello.txt","content_length":6}
   ```

   The expected result is `201` with `upload_id`, `expires_at` and `content_length`. Only the first
   committed response includes `upload_url`, its `method` and `required_headers`. Save the upload
   ID separately from the temporary URL. A recovered reservation has no new upload capability.

2. **Transfer.** Send the six file bytes to `upload_url` using its returned method and exact
   storage headers. This request goes to storage, not the Assign API. Never send your Assign
   bearer credential or browser cookies to that URL. Sending bytes does not create a completed
   attachment or link it to the parent.

3. **Complete.** After the transfer succeeds, use the saved upload ID and a key for completion:

   ```http
   POST /api/v1/attachment-uploads/{upload_id}/complete
   Authorization: Bearer <token>
   Idempotency-Key: <key-for-this-completion>
   Content-Type: application/json

   {}
   ```

   The expected result is `201` with the attachment's immutable `id`. Completion verifies the
   stored object and applicable scan state. An optional `sha256` is the actual file's digest as
   64 lowercase hexadecimal characters. Do not send a guessed digest. An unverified or
   quarantined object is not ready to embed.

4. **Link.** Use the completed attachment ID and the saved parent ID. For the Task created in
   [the Task recipe](./tasks#create):

   ```http
   POST /api/v1/tasks/{task_id}/attachments
   Authorization: Bearer <token>
   Idempotency-Key: <key-for-this-attachment-link>
   Content-Type: application/json

   {"attachment_id":"<completed-attachment-id>"}
   ```

   The expected result is `201` with attachment metadata. Confirm the link before storing its
   ID in rich text. The same stored object can be linked to other permitted parents without
   uploading its bytes again.

### Recover or cancel an upload

Keep the reservation, completion and link keys separate, with each exact request and target ID.
After a lost API response, recover that original request before moving to another step. A lost
completion or link response does not mean you should upload the file again.

Reservation recovery returns the original safe metadata without a fresh `upload_url`. If the
first URL was lost or expired, do not automatically create another reservation. Retain the upload
ID and establish the original outcome. When abandoning a known incomplete upload, use
`DELETE /api/v1/attachment-uploads/{upload_id}` with a key for cancellation; success is `204`
without a body. Confirm cancellation before explicitly starting another upload. If you cannot
recover the ID or outcome, stop and use the request ID for support rather than accumulating
untracked reservations.

A completed attachment needs its own cleanup decision. `GET /api/v1/attachments/{attachment_id}`
returns metadata and an opaque item `ETag`. To delete a file your workflow created, read and review
that exact item, then send `DELETE /api/v1/attachments/{attachment_id}` with its tag in `If-Match`
and an idempotency key. Deletion affects every linked resource; do not use it to undo just one
link or remove a pre-existing shared file. A `412` requires reconciliation; after an uncertain
delete, preserve the original key and condition for recovery.

## Resolve older linked files <Badge type="warning" text="Awaiting deployment" />

Documents can resolve files they reference even when those files are outside the newest-file
window. Resolution includes only files linked to that parent that you can read. Deleted, unlinked
and private Discuss files are omitted.

## Read, download and delete

A Document keeps an attachment link when a block is removed because saved revisions may still
use it. The link ends when the Document is purged or the attachment is deleted.

Deleting an attachment deletes it everywhere, including its links to Tasks, Projects and Documents.
It is different from removing a file block from one Document.

An attachment in a published Document is available to a reader only while the Document is
published and its current body references that attachment. Historical links alone do not grant
access. Unpublishing or archiving prevents new download links; an already issued storage link may
remain usable until it expires.

## Safety

- Assign inspects stored bytes and rejects executable, script, HTML and XHTML content, whatever
  the filename or declared media type says. It recognizes common image formats, including PNG,
  JPEG, GIF, WebP, AVIF, HEIC and TIFF, for previews.
- SVG is supported as a forced download and is never rendered inside Assign.
- A file that has not been scanned remains untrusted. It can be linked and force-downloaded, but
  cannot be previewed inline or embedded in rich text. A file detected as malicious is quarantined
  and cannot be linked, previewed or downloaded.

## In the web app

Selecting a raster image or PDF title opens it in a new tab. The card and its download icon force a
download. The upcoming preview modal below changes this interaction when it becomes available.

## Attachment preview modal <Badge type="warning" text="Awaiting deployment" />

Select a Task or Project attachment to open its preview. Images and PDFs display in the modal,
Markdown is rendered, and code and text preserve their formatting. HTML stays visible as source;
it never renders as a web page. The upload safety rules above still apply.

Use **Download** to save the file. Text previews are limited to 1 MiB; larger or unsupported files
remain available to download. Press Escape to close the preview and return to the file card.

## Upload and download links <Badge type="warning" text="Upcoming" />

File transfers use temporary storage links. Upload grants last fifteen minutes; download and
preview grants last five minutes. Keep attachment IDs for later use, and obtain a fresh authorized
link when needed. Treat each link as a credential and keep it out of logs and shared messages.
Send only the storage headers supplied for that transfer. Never forward an Assign bearer token
or browser cookie to a storage URL.

An upload sends bytes directly to storage, then completes verification of the expected size,
checksum, type, ownership and scan state. Sending the bytes alone does not finish the upload.
After an interruption, recover the original API outcome before retrying. A replay does not
renew an upload URL. Follow [upload recovery](#recover-or-cancel-an-upload) to abandon a known
incomplete reservation before an explicit new attempt; repeatedly sending bytes to an expired
link cannot renew it.

Download links are scoped to the object, method and disposition for which they were issued.
Removing access prevents new issuance, but does not promise immediate invalidation of a link
already issued. Use the [public API reference](./reference/) to check file-operation availability.
