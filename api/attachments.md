# Attachments

Files can be attached to Tasks and Projects. The browser first reserves a direct
upload, sends file bytes to a short-lived object-storage URL, completes server
verification, and then links the attachment to the chosen resource.
File bytes never pass through Assign's API servers.

> **Pre-launch safety notice:** the current production-configured acceptance
> environment does not malware-scan uploaded files. They report
> `scan_state: not_scanned`; treat them as untrusted. Inline preview and rich-text
> embedding remain disabled, while Task/Project linking and forced download are available.

There is no client-side MIME allowlist. Server-side byte inspection still
rejects executable, script, HTML, and XHTML content. SVG files are supported as
forced downloads only and are never previewed or rendered inside Assign.

Before public launch, Assign will require private malware scanning again. Scanner
unavailability will fail closed; a detected file will be quarantined and cannot
be linked, previewed, or downloaded.

## Attach a completed upload

```http
POST /api/v1/tasks/{task_id}/attachments HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"attachment_id":"<attachment-id>"}
```

Use `/api/v1/projects/{project_id}/attachments` for a Project. Both return `201`
with the attachment metadata. A file may be linked to more than one Task or
Project in the same Workspace.

`GET` on either path returns a bounded, newest-first `items` list (maximum 100 attachments).

## User experience and safety

On a Ticket, attachments appear after the ticket body and before Relations. On
a Project, they appear in the **Attachments** tab immediately after
**Documents**. Use **Add files** or drop files anywhere over the applicable
page. The page shows a drop indicator, keeps queued, uploading, and verifying
files visible, allows cancellation and retry, and gives one success
notification for a multi-file selection or drop. If the saved-file list cannot
be loaded, the Attachments region shows a contextual **Try again** action while
the rest of the Task or Project page remains usable.

Saved Project files appear as a centered responsive grid: one column on smaller
screens and two columns on desktop, with cards filling their grid cells.
Clean raster-image cards load a short-lived thumbnail near the viewport; unscanned files, SVG,
and non-image files remain icon-only. Activating a raster-image or PDF title
displays it in a new browser tab through a separately authorized inline URL.
The card-wide action and separate labelled icon still force a download; another
labelled icon globally deletes the
attachment. Global deletion hides every Task and Project link under the existing
soft-delete rules; it is not a current-parent unlink. Each open, preview, or
download flow uses a short-lived URL that applications must not store. SVG is
always a download—never an inline preview or content embedded in an
authenticated Assign page.
