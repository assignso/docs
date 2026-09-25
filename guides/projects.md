---
description: Plan work with Projects, including List and Board views, filters, Milestones, Statuses, members and public status links.
---

# Projects

Every Project page starts with a **Projects** link, the Project's icon and name, **Create task**
and the **Project actions** menu. Project settings, **Copy Project link** and **Project overview**
are in that menu.

## Views

| View | Shortcut | Use it for |
| --- | --- | --- |
| **List** | `L` | The default view. Group by Status, assignee or Milestone, and sort manually, by recent or oldest update, or by priority |
| **Board** | `G` | Move Tasks between Status columns |
| **Backlog** | `B` | Triage Tasks waiting to be scheduled |
| **Milestones** | `M` | Track delivery targets and their progress |
| **Documents** | `U` | Documents that belong to the Project |
| **Activity** | | Recent changes across the Project |
| **Attachments** | | Files attached across the Project |
| **Overview** | | Health, members, Task and Milestone progress, Status distribution and ongoing work, opened from **Project actions** |

On small screens three views stay visible and the rest are under **More**. The view you're on is
always shown.

## Filter and sort

**Filters** opens Milestone, Status, assignee and priority filters. The sort icon next to it
changes order and grouping. Filters, grouping and sort are saved in the URL, so you can share
the exact view.

## Work in the List

- Click or tap a Task once to open it. Scrolling or using a control in the row doesn't open it.
- Change a Status or assignee inline. Assignee menus list Project members first.
- Select several Tasks to open the bottom bar. Press `A` or choose **Actions** to change the
  Status, assignee or Milestone, export CSV, archive or delete. Press `Backspace` to clear the
  selection. Tasks that fail stay selected so you can retry them.

## Use the Board

- Drag a card, or focus it and use `Shift`+arrow keys to move it. `Shift+Home` and `Shift+End`
  move it to the top or bottom of its column.
- Arrow keys move between cards, and `Enter` opens the focused card.
- The avatar on a card changes its assignee.
- Moves appear right away. If a move can't be saved, the card goes back and Assign tells you why.
- **Display → Show done tasks** hides completed columns in your view without changing the Project.
- Completed and cancelled columns show recent Tasks. Choose **View all** to see older ones.
- On touch screens, scroll normally and change the Status from the Task page. You can also use
  **Task actions → Move to status**.

## Milestones

Create and edit Milestones on their own pages. A Milestone's card links to the List filtered to
that Milestone. Use the card menu to copy the filtered link or archive the Milestone.

## Statuses

Workspace owners and admins manage Statuses in **Workspace settings → Task statuses**. Statuses are
grouped into five lifecycle bands: Backlog, Unstarted, Started, Completed and Cancelled. Drag to
reorder them, or use **Move earlier** and **Move later**. Changes save immediately and apply to
every Project that uses the Status.

## Members and visibility

A Project's owner and managers can switch it between **Workspace** access, which includes every
member, and **Private** access, which includes only Project members plus Workspace owners and
admins. Project roles are *manager*, *contributor* and *viewer*.

## Public status link

The Project owner or a Workspace admin can publish an unlisted, read-only status link. Visitors see
only the Project's name and icon plus Task counts by workflow category. Unpublishing or archiving
the Project revokes the link immediately.

## Related

- [Projects and Statuses API](../api/projects)
- [Tasks](./tasks)
