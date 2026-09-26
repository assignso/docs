---
description: Work with a Task's properties, description, Comments, relations, attachments, history and links.
---

# Tasks

A Task page has a narrow, focused layout. The first line shows the Task **code**, which copies the
code when you select it. Next to it are the participants, **Follow** and **Task actions**. The
title, properties, description, attachments, relations and Comments follow.

## Properties

**Project**, **Status** and **Assignee** are always shown. Priority, Milestone, Due date and Labels
appear once they have a value. Use **Add property** to set an empty one. Edits save as you make
them. If a change is rejected, Assign restores the value and tells you why.

- **Due date** is a calendar day. Use **Now** for today and **Clear** to unset it.
- **Assignee** lists Project members first, then the rest of the Workspace.
- **Labels** accept several values, and you can create a missing label from the search box.
- **Project**: moving a Task to another Project gives it a new URL in that Project.

## Description

The description uses the full [Assign editor](./editor), so several people can edit it at once.
**Task actions → Description history** lists earlier versions. Restoring one asks for confirmation
and creates a new revision, and the text it replaces stays in history.

## Comments

Comments are listed under the description. The **Post** button appears once you start writing.
You can edit, delete and react to Comments. Reactions from other people appear live. Deleting a
Comment removes it from the thread, and links to later Comments keep their numbers.

A Comment link looks like `…/tasks/WEB-42?comment=3`. Opening it scrolls to that Comment and
highlights it. Comments posted through an AI assistant show who posted them and through which
client, for example **Codex · via MCP**.

## Relations

Use **Add** under Relations to choose a relation type, such as *blocks*, *blocked by*, *parent of*
or *subtask of*, and then pick a Task. The relation is saved once both are chosen. Assign rejects
relations that would create a cycle.

## Attachments

Add files under **Attachments**. Uploads go directly to storage, are scanned and count toward the
Workspace's storage. Images and files can also go into the description. See
[Attachments](../api/attachments).

## Lifecycle

**Task actions** can archive, trash, restore or duplicate a Task and move it within its Status
column. Archiving and trashing can be undone, and a Task is never permanently deleted from these
menus.

## Share a Task

- **Copy task link** copies the Task's permanent URL.
- **Copy prompt** copies a short handoff with the Task code, title and URL, ready to paste into an
  AI assistant. Assign never sends private Task content to an outside service when you do this.

## Follow

**Follow** subscribes you to updates in your Inbox. Choose *Mute* to stop notifications while
staying a participant. Following a Task never grants access to it.

## Related

- [Tasks API](../api/tasks)
- [Time tracking](./time-tracking)

### Milestone loading (awaiting deployment)

If milestones fail to load while creating a Task, choose **Retry milestones**. Your draft stays in place. A selected milestone whose name is temporarily unavailable shows **Milestone unavailable** until its details load. Choose **No milestone** to clear a selection.

## Current task control <Badge type="warning" text="Awaiting deployment" />

The Play icon in the top bar opens your Current task chooser. Use a Task’s Play
action to make an eligible Task current. This changes your focus; it does not
start a timer.

## Linked Comment highlight <Badge type="warning" text="Awaiting deployment" />

Opening a Comment link scrolls to and focuses that Comment. A light neutral
background marks the linked row; buttons and links keep their keyboard focus
indicators.

## Task properties on smaller screens

<Badge type="info" text="Awaiting deployment" />

Task properties wrap into as many rows as they need. The description follows
them without reserving space for empty rows.

## Conversation map

<Badge type="info" text="Awaiting deployment" />

On desktop, the Conversation map appears beside the Task when there is enough
space. Select a tick to scroll to its section. Use the arrow keys, Home and End
to move between ticks, then Enter to open the section. The map stays hidden on
phones and in windows that are too narrow or short.

## Following internal references

<Badge type="info" text="Awaiting deployment" />

Follow a reference in a Task description to open its destination within the
current Workspace. Browser Back returns to the Task. Modified clicks and
links that open in another tab keep their usual behavior.

## Load more Project Tasks <Badge type="warning" text="Awaiting deployment" />

When more Tasks are available in Project List, choose **Load more tasks** below
the list. You can focus the button and press Enter. The Tasks already shown stay
in place while the next page loads.

### Create a subtask inline <Badge type="warning" text="Awaiting deployment" />

From the parent Task, choose Link task and Add as subtask. Type a title in the Task search and press Enter or choose Create subtask. If the Task is created but its parent link fails, Assign shows the new Task and lets you retry linking without creating another Task.

## Creation draft protection

<Badge type="warning" text="Awaiting deployment" />

If you leave a new Task after entering content, Assign asks you to confirm. Choose **Keep editing** to return to your draft. Reloading or closing the browser can also show a browser warning. After the Task is created, Assign opens its page.

## Initial label failures

<Badge type="warning" text="Awaiting deployment" />

If a Task is created but its initial labels cannot be saved, Assign opens the Task and shows a warning. Check its labels there before creating another Task.

## Changing a Task’s Project

<Badge type="warning" text="Awaiting deployment" />

Changing a Task’s Project keeps its content visible while the move completes, then opens its new Task address. If the move fails, Assign keeps the original page and shows the error. Your selected tab is preserved after a successful move.
