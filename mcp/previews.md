---
description: View Task previews and use text, links and structured MCP results.
---

# Interactive previews

## Task previews <Badge type="warning" text="Awaiting deployment" />

In clients that support MCP Apps, `task_get` will show a compact preview with the
Task's code, title and available properties, including labels. If your client offers
an expand control, use it to give the preview more room. Choose **Open in Assign**
to visit the Task page.
Descriptions, Comments and related Tasks remain available through tool results.

Task lists use text, links and structured results without an interactive preview.

Project and Document previews remain paused. Legacy Task previews are unavailable.
Reconnect after deployment to refresh your client's tool catalog. Clients without
interactive previews can use the text, links and structured results from the same tools.
Permissions and tool operations stay the same.

## Task panel <Badge type="warning" text="Awaiting deployment" />

If your conversation has an **Assign Task** tab available, open it and paste a
Task link from Assign. Choose **Open Task** to see its details beside the
conversation. Select **Open another Task** to switch Tasks.

The panel uses the same access as your Assign connection. If a Task is unavailable,
check the link and confirm you can open it in Assign.

## Task context <Badge type="warning" text="Awaiting deployment" />

`task_list` and `task_get` will return readable Project, Status and assignee names,
plus a Milestone name and label names/colors when available. The added fields are
`project_name`, `milestone_name` and `labels`; each label has `id`, `name` and `color`.
Task codes, titles, priorities and due dates remain available in structured results.
