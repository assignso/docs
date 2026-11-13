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

Project files show as a grid. Raster images permitted for preview show a thumbnail. SVG and
non-image files show an icon; scan restrictions can also prevent a thumbnail.

### API upload workflow <Badge type="warning" text="Upcoming" /> {#api-upload-workflow}

Use the [credential setup](./quickstart) to get a bearer credential admitted for file writes.
[Copy the Workspace ID](./account#copy-workspace-id). Create the parent Task, Project or
Document first and save its immutable ID. These requests describe the upcoming resource flow;
check [operation availability](./reference/) before using it.

Reserve the exact byte count of the file you are sending. Check the filename and file size
against the [reservation request](./reference/operations/reserveattachmentupload) before
starting the upload.

An optional `content_type` is advisory. Completion detects the stored type from the file bytes;
changing the declared type does not bypass the [safety rules](#safety).

1. **Reserve.** Choose one local file and determine its exact byte length. For this example,
   `printf 'hello\n' > hello.txt` creates a six-byte UTF-8 file. Reserve those bytes with a fresh
   key, retaining the request until the result is known. Replace the fictitious Workspace ID
   with your own.

   ```http
   POST /api/v1/attachment-uploads
   Authorization: Bearer <token>
   Idempotency-Key: <key-for-this-reservation>
   Content-Type: application/json

   {"workspace_id":"0198ac5e-f9b7-7000-8000-000000000002","filename":"hello.txt","content_length":6}
   ```

   The first committed [reservation](./reference/operations/reserveattachmentupload) returns
   `201 Created`. This example uses a fictitious storage URL.

   ```json
   {
     "upload_id": "0198ac5e-f9b7-7000-8000-000000000010",
     "expires_at": "2026-01-01T12:15:00Z",
     "content_length": 6,
     "upload_url": "https://storage.example.com/upload/example",
     "method": "PUT",
     "required_headers": {
       "Content-Length": "6",
       "If-None-Match": "*"
     }
   }
   ```

   Save the upload ID and expiry for recovery. Use the temporary URL and its headers for
   the transfer, and keep the URL out of logs and durable receipts.

2. **Transfer.** Send the six file bytes to `upload_url` using its returned method and exact
   storage headers. This request goes to storage, not the Assign API. Never send your Assign
   bearer credential or browser cookies to that URL. Keep redirects disabled when sending
   the file. With the example headers above, set `UPLOAD_URL` from the first response and send
   the file this way.

   ```sh
   curl -q --fail --request PUT \
     --header 'Content-Length: 6' \
     --header 'If-None-Match: *' \
     --upload-file hello.txt "$UPLOAD_URL"
   ```

3. **Complete.** After the transfer succeeds, use the saved upload ID and a key for completion:

   ```http
   POST /api/v1/attachment-uploads/{upload_id}/complete
   Authorization: Bearer <token>
   Idempotency-Key: <key-for-this-completion>
   Content-Type: application/json

   {}
   ```

   [Completion](./reference/operations/completeattachmentupload) verifies the stored object
   and applicable scan state. A successful `201` returns attachment metadata. Save the
   returned `id` for the next step.

   ```json
   {
     "id": "0198ac5e-f9b7-7000-8000-000000000011",
     "workspace_id": "0198ac5e-f9b7-7000-8000-000000000002",
     "filename": "hello.txt",
     "content_length": 6,
     "content_type": "text/plain; charset=utf-8",
     "scan_state": "clean",
     "created_by_actor_id": "0198ac5e-f9b7-7000-8000-000000000012",
     "created_at": "2026-01-01T12:00:06Z"
   }
   ```

   If completion rejects the stored bytes, check the length and any digest you supplied.
   Resolve the failed upload before reserving space for corrected bytes. An unverified or
   quarantined object is unavailable for embedding.

4. **Link.** Use the completed attachment ID and the saved parent ID. For the Task created in
   [the Task recipe](./tasks#create), replace `{task_id}` and the example attachment ID
   with your saved values.

   ```http
   POST /api/v1/tasks/{task_id}/attachments
   Authorization: Bearer <token>
   Idempotency-Key: <key-for-this-attachment-link>
   Content-Type: application/json

   {"attachment_id":"0198ac5e-f9b7-7000-8000-000000000011"}
   ```

   [Linking to a Task](./reference/operations/attachtaskattachment) returns `201` with attachment
   metadata. Confirm the link before storing its ID in rich text. If linking is denied, check
   your access to the parent and the completed attachment. You can reuse that object for
   another permitted parent without uploading its bytes again.

### Recover or cancel an upload

Keep the reservation, completion and link keys separate, with each exact request and target ID.
After a lost API response, recover that original request before moving to another step. A lost
completion or link response does not mean you should upload the file again.

Replaying the reservation with the original key and body returns the original `201` receipt.
The recovered body omits `upload_url`, `method` and `required_headers`.

```json
{
  "upload_id": "0198ac5e-f9b7-7000-8000-000000000010",
  "expires_at": "2026-01-01T12:15:00Z",
  "content_length": 6
}
```

If the storage PUT was interrupted, keep the upload ID. Try completion for that reservation
when the transfer may have succeeded. Completion checks the stored bytes before returning an
attachment. If the reservation is incomplete and you are abandoning it, [cancel the upload](./reference/operations/cancelattachmentupload)
with a key for cancellation. A `204` confirms release of the reservation. After a lost
cancellation response, recover that same request. If the first URL was lost or has expired,
resolve the old reservation before starting another upload. If you cannot recover the ID
or outcome, stop and use the request ID for support.

For a completed upload, [read the attachment](./reference/operations/getattachment) by the ID
from completion. Verify that your workflow created the file and that deleting it is appropriate
for every linked resource. [Delete it](./reference/operations/deleteattachment) with the item's
tag in `If-Match` and a new idempotency key. Success is `204`. Leave pre-existing or shared files
available. A `412` requires a fresh read and review. After an uncertain delete, preserve the
original key and condition for recovery.

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
- A file that has not been scanned remains untrusted; `not_scanned` never means `clean`. The
  pre-launch environment does not malware-scan files. Its temporary policy permits linking,
  forced downloads, allowlisted previews and file/image references in Task, Document and Comment
  rich text. Settings media and clean-only duplication still require a clean scan result. Public
  launch requires malware scanning and removal of this exception.
- Pending or quarantined files cannot be linked, previewed or downloaded.

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
