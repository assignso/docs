---
description: Plan work with Projects, including List and Board views, filters, Milestones, Statuses, members and public status links.
---

# Projects

## Project task totals <Badge type="warning" text="Awaiting deployment" />

Home Project cards and the Projects grid and list show the Project's full Task count, including completed and cancelled Tasks. Archived, trashed and purged Tasks are excluded. The count stays independent of how many Tasks you have loaded; **Task count unavailable** means the total could not be read.

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

### Task Milestones <Badge type="warning" text="Awaiting deployment" />

A flag after a Task title shows that it belongs to a Milestone. Hover over or focus the flag
to see the Milestone name. This works in grouped and ungrouped Task lists.

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

## Edit Task titles <Badge type="warning" text="Awaiting deployment" />

In List and Backlog, open the Task to edit its title. Rows will no longer offer an inline title editor; Status and assignee controls remain in the row.

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

### Milestone autosave <Badge type="warning" text="Awaiting deployment" />

Milestone forms save the name on Enter or when you leave the field, the description when you
leave the field, and the target date and Status when you change them. A valid name creates the
Milestone; further edits save to that Milestone while the form stays open. **Back to milestones**
saves your current edits before returning to the list. If saving fails, your edits stay in the
form and you can choose **Retry**.

### Update a Milestone's Tasks <Badge type="warning" text="Awaiting deployment" />

Open a Milestone card's menu to move its Tasks to Todo or Backlog, set their priority, or set their assignee. Choose the value and confirm the displayed Task count. Archived and deleted Tasks are excluded; resolved Tasks are included. These actions change Tasks, not the Milestone's own stage.

One operation supports up to 1,000 Tasks. For larger Milestones, choose **View milestone tasks** and update selections of up to 100 from the List's **Modify** menu, which also offers Backlog and priority. Updates run in batches, so some may succeed while others fail. Review the result and choose **Reload tasks** before another attempt; changed Tasks and later additions may produce a different selection.

## Statuses

Workspace owners and admins manage Statuses in **Workspace settings → Task statuses**. Statuses are
grouped into five lifecycle bands: Backlog, Unstarted, Started, Completed and Cancelled. Drag to
reorder them, or use **Move earlier** and **Move later**. Changes save immediately and apply to
every Project that uses the Status.

## Members and visibility

A Project's owner and managers can switch it between **Workspace** access, which includes every
member, and **Private** access, which includes only Project members plus Workspace owners and
admins. Project roles are *manager*, *contributor* and *viewer*.

Open **Project settings → Members** to review or change Project access. The list refreshes when
another manager changes it. If the list cannot be refreshed, it is hidden until you select
**Retry**. Removing someone from a Private Project also removes that Project and its Tasks from
their available work.

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

In **Custom** grid order, drag the grip at the bottom right of a Project card to move it. Swipe the rest of the card to scroll, or tap it to open the Project. Tap the grip for **Move earlier** and **Move later**, or focus the card and use `Alt`+arrow keys.

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

### List group header scrolling (awaiting deployment)

As you scroll a grouped Task List, the next group heading pushes the current heading upward and replaces it below the toolbar. Scrolling back restores the previous heading.

## Show Task labels <Badge type="warning" text="Awaiting deployment" />

Project List and Backlog keep Status and assignee controls at the right of each row.
When a row is too narrow, open the Task to edit these properties.
Labels sit beside short Task titles. Long titles keep room to read when space is tight, while label badges give way to a count.

Open **Display → Show labels** to show or hide assigned labels in List, Backlog
and Board. On a narrow screen, use **View options**. Labels are shown by default.
In Task rows, labels appear immediately after the title; narrow screens keep
these badges hidden. Board labels appear below the title. Your List choice is
remembered in this browser, and saved views keep their own choice.

## Filter by Task labels <Badge type="warning" text="Awaiting deployment" />

In List, Board or Backlog, open **Filter → Labels** and select one or more labels.
Tasks with any selected label match; your other filters still apply. Remove a
Label chip or choose **Clear all** to clear the selection. Filtering works even
when **Show labels** is off. Your List choice is remembered in this browser, and
saved views retain it.

This filters Tasks loaded in the current view. Load more Tasks to include them
in the results; collection totals keep their existing meaning.

## Milestone forms and stages <Badge type="warning" text="Awaiting deployment" />

Milestone create and edit pages use inline name and description fields, with compact Status and Target date pickers. The issued Milestone code appears on the form. Press Enter or leave the name field to save; leave the description field to save it. Status/date choices save immediately, and the date picker supports clearing. Failed saves keep your draft and show Retry. Back to milestones saves valid pending edits before leaving.

Workspace owners and administrators configure **Workspace settings → Work management → Milestone lifecycle**. Add named stages within Planned, Active, Completed and Cancelled; rename, reorder, archive or restore them. Each category needs an active stage. If active Milestones use a stage being archived, choose a replacement in the same category. Progress remains derived from Tasks. Task statuses and Project lifecycle retain their own rules while using the same editing controls.
