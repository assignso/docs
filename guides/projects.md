---
description: Plan work with Projects, including List and Board views, filters, Milestones, Statuses, members and public status links.
---

# Projects

The Project header shows its icon and name, **Settings**, and the **Project actions** menu.
The shell breadcrumb provides the Projects context. Task views offer **Create task** in their
view toolbar; **Copy Project link** and **Project overview** remain in Project actions.

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

## Edit titles on mobile <Badge type="warning" text="Awaiting deployment" />

On mobile List and Backlog views, open the Task to edit its title.
Desktop rows keep the title-edit button, which appears on hover or keyboard focus.

## Empty Task attachments <Badge type="warning" text="Awaiting deployment" />

The Project Attachments view hides **Task attachments** when that collection is empty.
The upload area for the Project's own files stays available.

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

### Board card priority (awaiting deployment)

Use the priority icon beside the assignee avatar to choose a priority without opening the Task. After choosing, focus returns to the card so you can continue navigating the Board with the keyboard.

### Mobile Board scrolling (awaiting deployment)

Swipe horizontally to move between Board columns. Columns settle near the center of the screen, including the first and last column.

### Project sorting (awaiting deployment)

Choose **Default** to use the Workspace collection order, **Recent** for the latest activity, **Created** for newest Projects, or **Custom** for your saved order. The choice and custom order are saved to your Account for this Workspace. Home’s Recent projects always uses recent activity, regardless of your Projects-page choice.

### List Status groups (awaiting deployment)

When List is grouped by Status, active work appears first: In Progress, Review, Todo, then Backlog. Resolved work follows. Your workflow order still determines positions within each group category.

## Project settings header <Badge type="warning" text="Awaiting deployment" />

The **Settings** label stays visible on mobile. Settings pages show the Project
name first, with **Project settings** immediately below it. General, Members,
Tabs, Task labels and Connected tools keep the same navigation.

### Status colors <Badge type="warning" text="Awaiting deployment" />

In Workspace settings, open Task statuses and choose a color family. You can also select a specific shade. Choose Automatic to use the Status's default color. An existing custom hex color stays unchanged until you replace or clear it.

### Project icons <Badge type="warning" text="Awaiting deployment" />

Open Project settings and select the icon beside the Project name. Search the curated choices or choose an emoji. Your existing icon stays visible even if it is no longer offered for new selections. Clear the selection to use the default Project marker.

## Personal Project views

<Badge type="warning" text="Awaiting deployment" />

On a Project’s List, Board or Backlog, **Save view** saves your filters and presentation as a personal tab. **Update view** saves later changes. On a narrow screen, open **Saved view actions**. Rename or delete your views under Project Settings → Tabs. These views belong to your account in the current Workspace; they are not shared Project settings.

API and MCP saved-view records can include an optional `definition` with an opaque `project_id`, `layout`, a non-null `parameters` object and `show_cancelled`. Existing query-only records remain valid. The checked `query` remains required; saving a definition requires access to its Project and revision checks apply to updates. Limits are 100 views per membership and 16 KiB per definition.

### Saved Project ordering

Your Projects-page sort and custom order are saved to your Account for the current Workspace. Other
logged-in Web devices load the same preference; returning to an open page refreshes it. New Projects
follow your saved custom sequence until you reorder them. Home's Recent projects stays independent.

Sort and reorder wait for the saved preference to load. If saving fails, retry the change; if another
device saved first, refresh the current order before trying again. Earlier browser-only choices are
not automatically copied to your Account. Choose your sort again to save it. Grid/list layout remains
a separate browser preference. Native Mobile's current Projects preview does not use this preference.
