# Attachments

Files can be attached to Tasks and Projects. The browser first reserves a direct upload, sends file bytes to short-lived object-storage URL, completes server verification, and then links the completed attachment to the chosen resource. File bytes never pass through Assign's API servers.

There is no client-side MIME allowlist. Server-side byte inspection still rejects executable, script, HTML, and XHTML content; SVG files are supported as forced downloads only and are never previewed or rendered inside Assign.

## Attach a completed upload

```http
POST /api/v1/tasks/{task_id}/attachments HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <opaque-client-key>
Content-Type: application/json

{"attachment_id":"<attachment-id>"}
```

Use `/api/v1/projects/{project_id}/attachments` for a Project. Both return `201` with the attachment metadata. A file may be linked to more than one Task or Project in the same Workspace.

`GET` on either path returns a bounded, newest-first `items` list (maximum 100 attachments).

## User experience and safety

On a Ticket, attachments appear after the ticket body and before Relations. On a Project, they appear in the **Attachments** tab immediately after **Documents**. Use **Add files** or drop files anywhere over the applicable page. The page shows a drop indicator, keeps queued/uploading/verifying files visible, allows cancellation and retry, and gives one success notification for a multi-file selection or drop.

Saved files have a download action. Each action requests a fresh short-lived URL; applications must not store that URL. SVG is allowed as an attachment but is always a download—never an inline preview or content embedded in an authenticated Assign page.
