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
