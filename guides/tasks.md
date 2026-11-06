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

### Manage label colors <Badge type="warning" text="Awaiting deployment" />

Choose **Manage label colors** in a Task's label picker to open its Project's Task labels settings.
During Task creation, this link follows the Project you select.

## Description

The description uses the full [Assign editor](./editor), so several people can edit it at once.
**Task actions → Description history** lists earlier versions. Restoring one asks for confirmation
and creates a new revision, and the text it replaces stays in history.

## Comments

Comments are listed under the description. The **Post** button appears once you start writing.
You can edit, delete and react to Comments. Reactions from other people appear live. Deleting a
Comment clears its text and leaves a deleted entry. Links to later Comments keep their numbers.

A Comment link ends in `/tasks/WEB-42?comment=3`. Opening it scrolls to that Comment and
highlights it. Comments posted through an AI assistant show who posted them and through which
client, for example **Codex · via MCP**.

### Native Comment recovery <Badge type="warning" text="Upcoming" />

In the native app, write your Comment and choose **Comment** while online. Your input
stays in place until posting is confirmed. If the outcome is unknown, choose
**Retry same comment** to recover that submission. **Reload comment data** refreshes
what you can read; it does not post another Comment.

After a rejection, your input stays available while you reload and correct it. If
write access is removed while you can still read the Task, your retained input stays
visible and posting is disabled. Unsaved input is kept only while the Task remains
open; leaving asks you before discarding it. Closing the app does not save a draft.

Comment and attachment results are confirmed separately. **Comment posted** does not
mean a file was attached. If a file link is not confirmed, use **Retry same file action**
to recover it without posting your Comment again. Discarding file recovery does not
remove content that was already saved.

## Relations

Use **Link task** under Relations to choose a relation type, such as *blocks*, *duplicates*, *relates to*
or *Add as subtask*, and then pick a Task. The relation is saved once both are chosen. Assign rejects
relations that would create a cycle.

### Linked Documents <Badge type="warning" text="Awaiting deployment" />

Choose **Link document** to select a Document. The link saves on selection and appears on both items. Open a linked Document from its title. **Remove relation** asks for confirmation and preserves both items. Project Documents must belong to the Task's Project; Workspace Documents can link across Projects you can access. [Document links](../api/documents#link-documents-to-tasks-and-milestones) explains permissions and the reciprocal Milestone workflow.

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

## Share content to Assign <Badge type="warning" text="Upcoming" />

Native sharing is upcoming; saving shared content is not available yet. The review
will offer **New Task**, **Add to Task** and **New Document**, with an explicit
Workspace and Project, removable content, a title and an optional note before
**Save**. Adding to a Task preserves its existing description.

Only content supplied by the sending app is included. Sharing a link does not fetch
the page. Document visibility defaults to the selected Project or Workspace, and
cancelling cannot undo content that has already saved. If only part of a share saves,
review the confirmed results and retry **Save** to continue the same share.
On Android, **Open Task** or **Open Document** appears after the whole share is
confirmed. On iOS, **Done** returns you to the app you shared from after the share
is confirmed and its temporary files are cleaned up.

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

From a Task, choose Link task and type a title in the Task search. If no Task matches, press Enter or choose Create task to make a new Task in the same Project and link it with the selected relation. Choose Add as subtask first to make it a subtask. You stay on the current Task; select the new linked Task to fill in the rest. If the Task is created but the link fails, Assign shows the new Task and lets you retry linking without creating another Task.

## Creation draft protection

<Badge type="warning" text="Awaiting deployment" />

If you leave a new Task after entering content, Assign asks you to confirm. Choose **Keep editing** to return to your draft. Reloading or closing the browser can also show a browser warning. After the Task is created, Assign opens its page.

## Initial label failures

<Badge type="warning" text="Awaiting deployment" />

If a Task is created but its initial labels cannot be saved, Assign opens the Task and shows a warning. Check its labels there before creating another Task.

## Changing a Task’s Project

<Badge type="warning" text="Awaiting deployment" />

Changing a Task’s Project keeps its content visible while the move completes, then opens its new Task address. If the move fails, Assign keeps the original page and shows the error. Your selected tab is preserved after a successful move.

## Browse older Comments <Badge type="warning" text="Awaiting deployment" />

Comments open at the newest 100 entries, including places left by deleted Comments.
Use **Previous** or **Next** to browse history. The range below the thread shows
which entries are displayed, and your draft stays in place while you browse.

Opening a Comment link loads the entries around that Comment and focuses it.
Deleted Comments keep their place, so later links keep the same number.
You can browse history on an archived or trashed Task when you still have access.
Printing includes the displayed entries and their range.

## Linked development <Badge type="warning" text="Awaiting deployment" />

Linked GitHub, GitLab and Bitbucket items appear above Attachments on the Task page.
They stay visible when you switch between Comments, Activity and Suggestions.
Select the **Linked development** heading to collapse or expand its items, just like
Attachments and Related tasks. Activity shows the history of development changes.

## Suggestions <Badge type="warning" text="Awaiting deployment" />

The **Suggestions** tab shows a count when findings are waiting, even while Comments is open.
Open it to review related Tasks, Documents and verified GitHub commits mentioned in Comments.
Confirming a commit adds it to **Linked development**. Discarding hides that finding for this Task.

Commit findings use active repositories connected to the Task's Project. Short hashes and older
commits can match; findings appear after lookup completes. Commit matching is available with the
Workspace Knowledge entitlement even when Knowledge indexing is off.

## When Task creation fails <Badge type="warning" text="Awaiting deployment" />

The creation form keeps your title, description, properties and queued attachments when the write is rejected. Read the message beside **Create task**, check your connection and retry from the same form. If the Task was created but its Project view is temporarily unavailable, open **Work** to find it rather than submitting a duplicate.

When repository indexing is enabled for the Task's Project, Suggestions can also show indexed code
references. Each shows the repository, revision, file or symbol, and a reason for the match.
**Open code** opens that exact GitHub revision. Code references are read-only in this first version.

## Change Status in the native app <Badge type="warning" text="Upcoming" />

Status changes require a connection. While **Saving status…** is visible, wait for the result.
**Status saved** confirms the change; a separate refresh error means current data still needs reloading.

If a change is not confirmed, **Reload Task** checks current data. **Retry status change** retries
that original change. Keep the recovery screen open until you resolve it; leaving discards local
recovery details and does not cancel an action already sent. After a rejected change, reload the
Task before choosing another Status. Returning to Work preserves your view and refreshes its
Tasks and counts from saved data.

## Create a Task in the native app <Badge type="warning" text="Upcoming" />

Select **+ (Create task)** in the browsing header. On a Project page, that Project is selected;
elsewhere, choose a Project. Enter a title and select **Create task** to submit. Your configured
creation defaults apply. Read-only, archived or unavailable Project permissions prevent submission.

The form keeps your input if the request is not confirmed. Retry the unchanged form to recover the
original request. Once creation is confirmed, the new Task opens; **Back** returns to your previous
screen. **Cancel** lets you keep editing or discard unsaved input. Opening the form and choosing a
Project do not create a Task.

## Edit Task properties in the native app <Badge type="warning" text="Upcoming" />

Use **Edit Task** for the title, priority, due date, assignee or milestone. Enter due dates as
**YYYY-MM-DD**; leaving the date empty clears it. Date-only values keep the calendar day you choose.
On Task detail, **Add property** offers available optional properties. Saved selections appear in
the property row. Unassigning or clearing an optional property removes its control.

Edits require a connection and current permission. If an edit is not confirmed, **Retry Task edit**
recovers the original request; **Reload Task** checks current data. Keep recovery details until the
outcome is resolved. **Task saved** confirms the write even when current data still needs reloading.
If the form reports an older Task revision, your input stays visible: cancel and reopen **Edit Task**
to start from current data. **Cancel** lets you keep editing or discard unsaved input.

## Choose an assignee and view a person on mobile <Badge type="warning" text="Upcoming" />

Use the assignee menu or **Edit Task** to choose from loaded members. **Load more assignees** requests
another page. **Find assignee** looks up an exact username or display name. If several people match,
choose the intended username; opening or cancelling the lookup does not change the Task.

**View** opens that person's Workspace profile and visible assigned Tasks. An unavailable person
shows an unavailable state. **Edit profile** on your own page opens your Account Profile settings.
Task assignment still requires a connection and permission to edit the Task.
