---
description: Find your way around the Assign web app, including Home, My Work, search, navigation, the current Task, Undo and printing.
---

# Using the web app

Assign runs in any current browser at [assign.so](https://assign.so). Signing in opens your
current Workspace. If you don't have a Workspace yet, Assign asks you to create one.

## Install it as an app

In browsers that support installing web apps, use **Install** or **Add to Home Screen**. The
installed app opens in its own window and goes straight to your Workspace or the sign-in page. It
can reopen after a short network interruption. Your data, uploads and account actions still need
a connection, and Assign doesn't store authenticated data for offline use.

## Home and My Work

**Home** shows up to ten Tasks each in *Upcoming*, *In progress*, *Todo* and *Following*. Your
assigned work is sorted by priority (urgent, high, medium, low, then none), with the most recently
updated first within each priority.

### Home Task details <Badge type="warning" text="Awaiting deployment" />

Priority appears after the Task title. A flag identifies a Task's Milestone; hover over or focus
it to see the Milestone name. The next line separates the Project, Status and assignee with `·`.
Following also shows the latest update on that line.

**My Work** lists the Tasks assigned to you with their priority, Status, code, title and due date.

### My Work pagination <Badge type="warning" text="Awaiting deployment" />

Tasks are grouped by Status on each page, with the highest priority and most recently updated
first inside each group. Group counts show how many tasks are on that page; a Status may continue
on another page.

Page controls show your current page and the total, such as **Page 2 of 8**. Use **Next**, **Previous**
or an available numbered page to browse. Some lists unlock pages as you advance. Changing the view
returns you to its first page. If a page fails to load, your current tasks stay visible; try again.

## Navigate

<Badge type="warning" text="Awaiting deployment" />

The small dot on your account picture in the sidebar shows live updates for this browser and Workspace. Green means updates are current, amber means Assign is connecting or catching up, and red means live updates are unavailable. Open the account menu for a text description of the current state.

- **Breadcrumbs** show *Assign → Project → Task*. On desktop the ellipsis opens the full trail. On
  phones, tap the page title.
- **Project shortcuts.** Press `1`–`9` to open a numbered Project. A new Project takes the first
  free number. Reordering Projects doesn't renumber them, and your numbers follow you across
  devices. Manage them in **Account settings**.
- **URLs are readable and stable.** Projects open at `/app/{workspace}/projects/{path}`, Tasks at
  `/app/{workspace}/tasks/{CODE}` and Documents at `/app/{workspace}/documents/{path}`. Older
  links redirect to these.

## Search

Choose **Search** in the header, or press `/` or `Cmd/Ctrl+K`. Results include
Projects, Tasks, Documents and, when available, People from the current Workspace. Search runs on
the server, so results always reflect your current access.

## Current task

The **Current task** control in the top bar marks the one in-progress Task you're working on now,
across all your Workspaces. Pick another Task to replace it, or clear it. Assign clears the
selection automatically when the Task is no longer in progress or no longer assigned to you.

## Undo and Redo

Supported Task property and lifecycle changes show a short toast with **Undo**.

| Action | Shortcut |
| --- | --- |
| Undo | `Cmd/Ctrl+Z` |
| Redo | `Cmd/Ctrl+Shift+Z` or `Ctrl+Y` |

Undo history belongs to you and the current Workspace, and it's shared across your open tabs.
While you're typing in a text field or the editor, these shortcuts undo text instead.

## When something can't load

If one area can't refresh, it offers **Retry** and the rest of the page stays usable. If Assign
can't save a draft locally, it warns you so you can copy your text before leaving. If Assign asks
the browser to slow down, live updates pause and resume on their own. Keep your text and try again
after the pause.

## Print

Printing a Task, a Project List, the Documents list or a Document produces a clean layout without
navigation or controls. A Project List prints every Task in the current filter and grouping, not
just the rows on screen.

## Related

- [Projects](./projects) · [Tasks](./tasks) · [Settings](./settings)
- [Keyboard shortcuts](./keyboard-shortcuts)
- [Writing in Assign](./editor)

### List motion <Badge type="warning" text="Awaiting deployment" />

Lists gently acknowledge added items and keep nearby rows visually continuous when items are removed. Assign respects your device's reduced-motion preference. Removed items disappear immediately.

## Mark Inbox notifications read <Badge type="warning" text="Awaiting deployment" />

**Mark all read** includes the newest notification in the displayed Inbox. Notifications arriving
after the read cutoff remain unread. You can still mark individual notifications read or unread.
