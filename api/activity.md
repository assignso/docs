# Activity

Activity is Assign's access-filtered record of meaningful changes to work. It
is distinct from the security and compliance audit log: sign-in, identity,
restricted, and administrative membership-change events are not included.

## What appears

The Workspace, Project, and person feeds show changes that affect progress,
ownership, commitments, or shared understanding: a Task created, completed, or
reopened; a changed status, assignee, due date, priority, or Milestone; a
blocking dependency added or removed; a new comment; a saved Document change;
and Project or Milestone lifecycle changes. They leave out personal
preferences (following or muting a Task), ordinary emoji reactions, ordinary
title corrections, workspace configuration, and integration or Agent execution
detail. Ordinary property changes stay available in the item's own history:
the Task endpoint returns them in addition to the feed's entries.

Activity does not decide notifications. Whether someone is notified about a
change is governed separately by their Inbox settings.

## Grouped entries

One action produces one entry. A bulk change, such as moving 18 Tasks to a
Milestone, is a single item whose `count` is 18 and whose `affected` array
lists up to 25 of the resources it touched. Consecutive saves of one Document,
comments on one Task, and routine priority, due-date or Milestone edits by one
person collapse into a bounded editing session while nobody else acts on the
resource. The fallback session ends after 90 seconds idle, after five minutes,
or at a UTC date boundary. Routine Task sessions report only the lasting
oldest-to-newest differences and disappear when all three properties return to
their starting values. Grouping never merges different people. Workflow and
lifecycle changes remain separate, so a Task that went In progress, Done, then
Reopened keeps three entries. Every resource listed in `affected` is one the
caller can currently read.

## Read Workspace activity

```http
GET /api/v1/workspaces/{workspace_id}/activity?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

## Read Task activity

```http
GET /api/v1/tasks/{task_id}/activity?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

## Read Project activity

```http
GET /api/v1/projects/{project_id}/activity?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

This returns the same admitted entries as the Workspace feed, limited to one
Project: its own changes plus its Tasks, comments, Documents, and Milestones.
Project read access is checked on every request, so a Project the caller
cannot read answers `404` rather than an empty page.

## Read a person's activity

```http
GET /api/v1/workspaces/{workspace_id}/people/{username}/activity?limit=50 HTTP/1.1
```

This returns activity authored by that active workspace member, using the
same safe collaboration projection and cursor behavior. A current or former
username resolves to the same immutable User; legacy UUID references remain
accepted only for link migration.

All endpoints return newest-first opaque cursor pages. `limit` defaults to
50 and accepts 1 through 100. A cursor is scoped to the resource it came from.
The Task feed includes the Task's comment and relation activity as well as its
own updates.

```json
{
  "items": [{
    "id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11",
    "occurred_at": "2026-08-22T10:00:00Z",
    "actor": {"id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc12", "display_name": "Ada", "automation": false},
    "provenance": {"kind": "mcp", "name": "Codex"},
    "action": "task.moved",
    "resource_type": "task",
    "resource_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc13",
    "deep_link": "/tasks/018f0d5a-ef50-7fa3-8c11-2ddc6b30dc13",
    "summary": {},
    "count": 1,
    "operation_id": null,
    "affected": []
  }],
  "next_cursor": null,
  "has_more": false
}
```

`limit` bounds the events examined for a page, so a page can hold fewer items
than `limit` once events are grouped; `has_more` alone says whether more
history exists. `count`, `operation_id`, and `affected` are additive: a
missing `count` means 1 and a missing `affected` means none. The item's `id`
and `occurred_at` are those of its newest event.

`action` is a stable localization key, not a sentence. `summary` contains
only bounded scalar metadata; it never returns comment text, Document content,
or other free-form content. A grouped routine Task session can set
`group_kind` to `session`, mark `priority_changed`, `due_changed`, or
`milestone_changed`, and include their scalar previous/current values; explicit
JSON `null` means no value while a missing key means historical evidence was
unavailable. Visibility is evaluated at read time using current
access, so removed access immediately removes affected activity from reads.
Workspace feeds apply private-Project access before pagination, so inaccessible
events do not affect returned items, `has_more`, or cursors.

`provenance` is `null` for a direct Assign browser or first-party API action.
Otherwise it identifies the bounded, presentation-safe invocation channel:
`delegated_connection`, `mcp`, `automation`, or `external_actor`, plus a safe
client/provider name. It supplements rather than replaces `actor`; for example,
an action by Ada through Codex remains attributed to Ada and is presented as
“Performed via MCP by Codex.” Credentials, prompts, tool arguments, and private
provider metadata are never returned.

### Task development history (upcoming)

Task history can return `task.development_updated` for a linked GitHub, GitLab or Bitbucket item.
Its bounded scalar summary can include `provider`, `rich_entity_id`, `entity_type`,
`human_identifier`, `title`, `url` and `provider_state`. The timestamp records Assign's observation;
it does not establish when the original provider action occurred. The actor may be absent, with
`external_actor` provenance naming the provider. Repeated observations of the same state are omitted.
These entries appear in Task history, while delivery and retry events remain excluded.

Task history also includes `attachment.linked`. A boolean `description_changed` flag identifies
description edits without returning the description itself. Existing paging and access rules apply.
