---
description: Manage Workspace and Project label definitions, assign labels to work and override how a Project shows a label.
---

# Labels

Labels are defined per Workspace or per Project and assigned to Tasks, Projects and Documents. These
operations use a browser session and the [API conventions](./conventions), with live visibility and
Workspace authorization checks on every call.

| Operation | Route |
| --- | --- |
| List, create Workspace labels | `GET`, `POST /api/v1/workspaces/{workspace_id}/label-definitions` |
| List, create Project labels | `GET`, `POST /api/v1/projects/{project_id}/label-definitions` |
| Update, archive | `PATCH`, `DELETE /api/v1/label-definitions/{label_id}` |
| Read, replace a target's labels | `GET`, `PUT /api/v1/{target_kind}/{target_id}/labels` |
| List, set, clear Project overrides | `GET /api/v1/projects/{project_id}/label-overrides`, `PUT`, `DELETE …/label-overrides/{label_id}` |

- Lists return only active labels unless a settings client passes `include_archived=true`.
- The upcoming paginated list contract accepts `limit` (1–100, default 50) and
  `cursor`. When `has_more` is true, pass `next_cursor` with the same scope and
  filters. A cursor cannot be reused for another Workspace, Project or filter;
  start again at the first page after a catalog change if a complete current
  view is needed. A changed catalog returns `409 catalog_changed`; discard the
  partial traversal and start again at page one. This also applies to definition
  lists. <Badge type="warning" text="Awaiting deployment" />
- Archiving stops future assignment but leaves history intact. Restore with a revision-checked
  `PATCH` of `{"archived": false}`, which keeps the same label.
- Replacing a target's labels sets the complete active set and follows the revision rules in the
  [OpenAPI document](/openapi.yaml). `target_kind` is `task`, `project` or `document`.
- A Project can show a Workspace Task label under a different name or color, only in that Project.
  The label's identity and assignments don't change. `PUT` upserts the override and `DELETE` clears
  it, idempotently, restoring the Workspace default. Only Workspace-scope Task labels can be
  overridden.
- Project override lists accept `limit` (1–100, default 50) and `cursor`. Follow
  `next_cursor` while `has_more` is true; start again after a catalog change
  when you need a complete current view. <Badge type="warning" text="Awaiting deployment" />

## Read one label <Badge type="warning" text="Awaiting deployment" />

`GET /api/v1/label-definitions/{label_id}` returns one current or archived label
using your browser session. You must be able to read its Workspace and, for a
Project label, its Project. Unknown and unavailable labels return `404`. This
operation does not currently admit native credentials.

## Change events <Badge type="warning" text="Awaiting deployment" />

Label definition changes emit `label.created`, `label.updated`, `label.archived`,
`label.restored` or `label.deleted`. Assignment and Project override changes emit
`task.labels_changed`, `project.labels_changed` or `document.labels_changed`.
Refresh the corresponding authorized catalog or target assignments. These
events contain no label names, colors or target content. You receive only
currently readable resources; an older writer may leave `actor_id` absent.
