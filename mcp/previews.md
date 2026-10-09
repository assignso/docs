---
description: View Task previews and use text, links and structured MCP results.
---

# Interactive previews

## Task previews <Badge type="warning" text="Awaiting deployment" />

The next deployment enables Task previews for `task_list` and `task_get` in clients
that support MCP Apps. Each Task item shows its code, title and available properties,
with the same content as Home and My Work. Open an item for details or choose
Open in Assign to visit its Task page. Use Refresh to fetch current details.

Project and Document previews remain paused. Legacy Task previews are unavailable.
Reconnect after deployment to refresh your client's tool catalog. Clients without
interactive previews can use the text, links and structured results from the same tools.
Permissions and tool operations stay the same.

## Task context <Badge type="warning" text="Awaiting deployment" />

`task_list` and `task_get` will return readable Project, Status and assignee names,
plus a Milestone name and label names/colors when available. The added fields are
`project_name`, `milestone_name` and `labels`; each label has `id`, `name` and `color`.
Task codes, titles, priorities and due dates remain available in structured results.
