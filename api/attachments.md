---
description: Upload files directly to storage and attach them to Tasks, Projects and Documents, with previews, downloads and safety rules.
---

# Attachments

Files can be attached to Tasks, Projects and Documents. The client reserves a direct upload, sends
the bytes to a short-lived storage URL, completes verification and then links the attachment to a
resource. File bytes never pass through Assign's API servers.

## Upload and attach

| Step | Operation |
| --- | --- |
| Reserve | `POST /api/v1/attachment-uploads` returns a short-lived upload URL. |
| Send | Upload the bytes to that URL. |
| Complete | `POST /api/v1/attachment-uploads/{upload_id}/complete` verifies the file. `DELETE` on the upload cancels a reservation. |
| Link | `POST /api/v1/tasks/{task_id}/attachments`, `/api/v1/projects/{project_id}/attachments` or `/api/v1/documents/{document_id}/attachments` |

```http
POST /api/v1/tasks/{task_id}/attachments HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"attachment_id": "<attachment-id>"}
```

Linking returns `201` with the attachment's metadata. A file can belong to several resources in the
same Workspace. `GET` on any of these paths lists up to 100 attachments, newest first. A Document
keeps its link when a block is removed, because saved revisions may still use it. The link ends when
the Document is purged or the attachment is deleted.

## Resolve older linked files <Badge type="warning" text="Awaiting deployment" />

To resolve files outside the newest-100 window, add `attachment_id` to a Task, Project or Document
attachment-list request. Repeat the key for multiple IDs, up to 100 values per request:

```http
GET /api/v1/documents/{document_id}/attachments?attachment_id={first_id}&attachment_id={second_id}
```

The result includes only files linked to that parent that you can read. Deleted, unlinked and
private Discuss files are omitted. An empty or invalid ID, or more than 100 values, returns `400`.
Omit the filter to read the ordinary newest-file list.

## Read, download and delete

- `GET /api/v1/attachments/{attachment_id}` reads metadata.
- `POST /api/v1/attachments/{attachment_id}/download` and `…/preview` return short-lived URLs. Don't
  store them.
- `DELETE /api/v1/attachments/{attachment_id}` deletes the attachment everywhere. It hides every
  Task, Project and Document link, and isn't a removal from one parent.

Published Documents use anonymous equivalents:
`POST /api/v1/public/documents/{public_id}/attachments/{attachment_id}/preview` (or `download`). It
returns a five-minute URL only if the attachment is linked to that Document and its current body
references it. Unpublishing or archiving revokes access.

## Safety

- Assign inspects the stored bytes and rejects executable, script, HTML and XHTML content, whatever
  the filename or MIME type says. It recognizes common image formats, including PNG, JPEG, GIF, WebP,
  AVIF, HEIC and TIFF, for previews.
- SVG is supported only as a forced download and is never rendered inside Assign.
- `scan_state` reports malware scanning. A deployment without scanning reports `not_scanned`. Treat
  those files as untrusted: they can be linked and force-downloaded, but not previewed inline or
  embedded in rich text. A file detected as malicious is quarantined and can't be linked, previewed or
  downloaded.

## In the web app

In an existing Document or Task description, use the image or file command in the toolbar or slash
menu. The editor stores the attachment ID, not a signed URL, so blocks can move without
re-uploading. On a Task, attachments appear after the description and before Relations. On a Project,
they're in the **Attachments** tab after **Documents**.

Use **Add files** or drop files onto the page. Queued, uploading and verifying files stay visible with
cancel and retry, and a multi-file drop gives one success notice. Project files show as a grid.
Clean raster images show a thumbnail, and unscanned files, SVG and non-image files show an icon.
Selecting a raster image or PDF title opens it in a new tab, and the card and its download icon force
a download.

## Attachment preview modal <Badge type="warning" text="Awaiting deployment" />

Select a Task or Project attachment to open its preview. Images and PDFs display in the modal,
Markdown is rendered, and code and text preserve their formatting. HTML stays visible as source;
it never renders as a web page. The upload safety rules above still apply.

Use **Download** to save the file. Text previews are limited to 1 MiB; larger or unsupported files
remain available to download. Press Escape to close the preview and return to the file card.
