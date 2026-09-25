---
description: The building blocks of Assign and how they relate, including Workspaces, Projects, Tasks, Statuses, Documents, Discuss and Agents.
---

# Core concepts

## Workspace

A **Workspace** is where your team collaborates, and every piece of work belongs to one. Your
Workspace role applies everywhere, including the web app, the CLI, MCP clients and the API.

| Role | Read work | Change work | Manage members | Manage the Workspace |
| --- | --- | --- | --- | --- |
| Owner | Yes | Yes | Yes | Yes, including archiving it |
| Admin | Yes | Yes | Yes | Yes |
| Member | Yes | Yes | No | No |
| Viewer | Yes | No | No | No |

A Workspace always has at least one active owner. You can belong to several Workspaces and switch
between them. Each login, token and MCP authorization is bound to the Workspace it was created
for.

## Project

A **Project** groups related Tasks, Documents and Milestones. Each Project has:

- A **key**, such as `WEB`, which is permanent and prefixes its Task codes.
- A readable **path** used in URLs, generated from the name and editable later.
- A **visibility** setting. *Workspace* Projects are open to every member. *Private* Projects
  are visible only to their members and to Workspace owners and admins. Owners can also publish a
  read-only status link.
- Views: **List**, **Board**, **Backlog**, **Milestones** and an **Overview** with health and
  progress.

## Task

A **Task** is a unit of work. Every Task has a permanent **code**, such as `WEB-42`, that you can
use in the web app, the CLI, MCP and links. Tasks carry a Status, assignee, priority, due date,
Milestone, labels, a rich-text description, attachments, Comments and typed **relations** such as
*blocked by* or *subtask of*.

A Task can be active, archived or in the trash. Archiving and trashing can be undone, and neither
deletes the Task permanently.

## Status

**Statuses** describe a Task's workflow position. You can name them however you like, but each one
belongs to one of five lifecycle types:

| Type | Meaning |
| --- | --- |
| Backlog | Captured, not yet planned |
| Unstarted | Planned, not started |
| Started | In progress or in review |
| Completed | Done, which resolves the Task |
| Cancelled | Won't be done, which also resolves the Task |

Workspace-wide Statuses apply to every Project, and a Project can add its own. Because tools read
the lifecycle type, "done" means the same thing everywhere even when the labels differ.

## Milestone

A **Milestone** is a dated goal inside a Project. Its progress comes from the Tasks assigned to it.

## Document

A **Document** is rich, collaborative text: specs, plans, runbooks and decisions. Documents live
in the Workspace or in a Project, can nest under a parent Document, keep revision history and can
be read or written as Markdown. See [Writing in Assign](../guides/editor).

## Labels

**Labels** are colored tags for Projects, Documents and Tasks. Workspace labels are shared, and a
Project can add labels of its own for its Tasks.

## Inbox and activity

The **Inbox** collects the notifications that matter to you, filtered by your notification
preferences. **Activity** is the history of what happened to a Task, a Project, a person or the
Workspace.

## Discuss

**Discuss** is your private AI conversation in a Workspace. It can search your work, explain
context with cited evidence and propose changes. Changes need your approval, and each approved
change leaves a receipt. See the [Discuss API](../api/discuss).

## Agents

**Agents** are hosted workers with a named responsibility. You hire them from the Agent Library or
build them in Agent Studio. They run on a schedule, on an event or on demand. Every action they
take goes through the same permissions and leaves an audit trail. See
[Workspace Agents](../api/agents).

## Workspace Knowledge

**Workspace Knowledge** is an optional, permission-checked index of your Workspace and connected
repositories. Discuss, Agents and MCP clients use it to find evidence. Results always report their
coverage, so a missing match never claims more than it checked.
