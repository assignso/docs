---
description: Manage Workspace and Project label definitions, assign labels to work and override how a Project shows a label.
---

# Labels

Labels are defined per Workspace or per Project and assigned to Tasks, Projects and Documents.
The v1 operations in the [Labels reference](/api/reference/labels) are awaiting deployment.
Use a [product bearer credential](./authentication) with read or write scope for the operation
and current access to the Workspace and resource.

Workspace owners and admins can create, edit, archive and restore Workspace labels.
Project managers, the Project owner and Workspace owners and admins can manage
Project-local labels and overrides. These permissions also apply when recovering
a write response. Assigning existing labels requires label assignment permission and permission to update the target.

| Operation | Route |
| --- | --- |
| List, create Workspace labels | `GET`, `POST /api/v1/workspaces/{workspace_id}/label-definitions` |
| List, create Project labels | `GET`, `POST /api/v1/projects/{project_id}/label-definitions` |
| Update | `PATCH /api/v1/label-definitions/{label_id}` |
| Archive | `POST /api/v1/label-definitions/{label_id}/archive` |
| Read, replace a target's labels | `GET`, `PUT /api/v1/{target_kind}/{target_id}/labels` |
| List, set, clear Project overrides | `GET /api/v1/projects/{project_id}/label-overrides`, `PUT`, `DELETE …/label-overrides/{label_id}` |

- Definition lists return active labels by default. Pass `include_archived=true` to include
  archived definitions. The Workspace list can also filter by `purpose`.
- Definition and override lists accept `limit` (1–100, default 50). Pass each non-null
  `next_cursor` as `cursor` with the same scope, filters, limit, credential and encoding,
  even after a short or empty page. A null cursor ends the traversal. For
  `409 catalog_changed`, discard the partial traversal and start at page one.
- To edit or archive a definition, read its exact item `ETag` from
  [the definition read](/api/reference/operations/getlabeldefinition). Archiving retains existing assignments
  and history. A conditional `PATCH` with `{"archived": false}` restores the same label.
- To replace a target's labels, use the `ETag` from that target's assignment-set read in
  `If-Match`. Send the complete set of up to 20 eligible label IDs. Send `{"label_ids": []}`
  to clear the set. `target_kind` is `task`, `project` or `document`.
- A Project override changes the name and color shown for a Workspace Task label in that
  Project. The label ID and assignments stay the same. Set or clear the override with
  the matching row's `item_validator.etag` and its encoding. Clearing restores the latest
  Workspace presentation, including when the definition is archived and the override is retained.
- For conditional writes, keep the validator's encoding and quotes. Save the original request
  and `Idempotency-Key` so you can [recover an unknown outcome](./writes#recover-an-unknown-outcome).

## Read one label <Badge type="warning" text="Awaiting deployment" />

`GET /api/v1/label-definitions/{label_id}` returns one current or archived label
using your bearer credential. You must be able to read its Workspace and, for a
Project label, its Project. Unknown and unavailable labels return `404`.

## Change events <Badge type="warning" text="Awaiting deployment" />

Label definition changes emit `label.created`, `label.updated`, `label.archived`,
`label.restored` or `label.deleted`. Assignment and Project override changes emit
`task.labels_changed`, `project.labels_changed` or `document.labels_changed`.
Refresh the corresponding authorized catalog or target assignments. These
events contain no label names, colors or target content. You receive only
currently readable resources; an older writer may leave `actor_id` absent.
