---
description: Read the access-filtered activity feeds for a Workspace, Project, Task or person, with grouping and provenance.
---

# Activity

Activity is the access-filtered record of meaningful changes to work. It's separate from the security
audit log, so sign-ins, identity changes and membership administration don't appear.

## What appears

Feeds show changes that affect progress, ownership, commitments or shared understanding: Tasks
created, completed or reopened; changes to status, assignee, due date, priority or Milestone;
dependencies; new Comments; saved Document changes; and Project and Milestone lifecycle. They leave
out personal preferences (follow or mute), emoji reactions, title corrections, Workspace
configuration and integration or Agent execution detail. A Task's own history includes the ordinary
property changes too.

Activity doesn't decide notifications. Those follow each person's [Inbox](./inbox) settings.

## Grouping

One action is one entry. A bulk change such as moving 18 Tasks to a Milestone is a single item with
`count` 18 and an `affected` array of up to 25 resources you can read.

Consecutive saves of a Document, Comments on a Task and routine priority, due-date or Milestone edits
by one person collapse into one session while nobody else acts on the resource. A session ends after
90 seconds idle, five minutes or a UTC date change. Task sessions show only the lasting differences
and vanish if the values return to where they started. Grouping never merges different people, and
workflow changes stay separate, so In progress, Done and Reopened are three entries.

## Read

| Feed | Request |
| --- | --- |
| Workspace | `GET /api/v1/workspaces/{workspace_id}/activity?limit=50` |
| Project | `GET /api/v1/projects/{project_id}/activity?limit=50` (a Project you can't read returns `404`) |
| Task | `GET /api/v1/tasks/{task_id}/activity?limit=50` (includes Comment and relation activity) |
| Person | `GET /api/v1/workspaces/{workspace_id}/people/{username}/activity?limit=50` (a current or former username resolves to the same user) |

Feeds are newest first with opaque cursors that only work on the feed they came from. `limit` accepts
1–100 and defaults to 50. It bounds the events examined, so a page can hold fewer items once they're
grouped. Rely on `has_more`.

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

- `id` and `occurred_at` belong to the item's newest event. A missing `count` means 1 and a missing
  `affected` means none.
- `action` is a stable localization key, not a sentence. `summary` holds bounded scalar metadata and
  never Comment text or Document content. Routine Task sessions set `group_kind` to `session` and can
  include `priority_changed`, `due_changed` and `milestone_changed` with previous and current values.
  An explicit `null` means no value, and a missing key means the history isn't available.
- Access is checked on read, so removing access removes the activity, and private Projects are
  filtered before pagination.
- `provenance` is `null` for direct Assign or first-party API actions. Otherwise it names the channel
  (`delegated_connection`, `mcp`, `automation` or `external_actor`) and a safe client name. It adds to
  `actor` rather than replacing it, so Ada acting through Codex stays Ada, shown as "Performed via
  MCP by Codex".

### Task development history <Badge type="warning" text="Upcoming" />

Task history can include `task.development_updated` for a linked GitHub, GitLab or Bitbucket item,
with `provider`, `rich_entity_id`, `entity_type`, `human_identifier`, `title`, `url` and
`provider_state`. The time is when Assign observed it, not when it happened at the provider, and the
actor can be absent, with `external_actor` provenance. Repeated observations of the same state are
omitted.

Task history also includes `attachment.linked`, and a boolean `description_changed` marks description
edits without returning the text.

## Read one day <Badge type="warning" text="Awaiting deployment" />

For Workspace activity, pass `day=2026-09-18&time_zone=Europe%2FBudapest` to read that calendar day.
Supply both parameters. The timezone determines midnight boundaries, including daylight-saving changes.
Follow `next_cursor` with the same parameters until `has_more` is false. A cursor from another day
or timezone interval is invalid. The existing 90-day retention limit still applies.

The Day page retrieves the selected day's activity automatically. Its date follows your Account
timezone, and an empty result appears only after retrieval completes.

## Grouped reads — Upcoming

The next grouped Activity contract adds two companion reads:

- `GET /api/v1/workspaces/{workspace_id}/activity/groups`
- `GET /api/v1/workspaces/{workspace_id}/activity/groups/{group_id}/children`

The existing event-shaped reads above keep their response formats. Grouped reads use
`assign.activity.groups.v1` and `assign.activity.children.v1` envelopes and are not yet released.

Supply `scope=workspace`, `account`, `person`, `project` or `task`. Person, Project and Task
scopes require `resource_id`; Workspace and Account scopes omit it. Account scope selects the
current human account. Browser sessions and API read credentials use their existing authorization.

Choose `day=YYYY-MM-DD`, or a paired inclusive `from_day` and exclusive `before_day` range of at most
90 days. `time_zone` accepts an IANA timezone; omitting it uses the effective account/Workspace
setting. Optional `actor_ids`, `project_ids` and `activity_types` are comma-separated sets of at
most 50 values each. Group pages default to 10 and allow 1–50 groups; child pages default to 25
and allow 1–25 children. `include_previews` defaults to true.

Counts report their accuracy explicitly. Previews describe currently readable resources;
unknown historical facts and history before the retained 90 days remain unknown. A snapshot does
not grant access. Continue with `next_cursor` and the same selectors. Expansion also requires the
parent's `group_revision` and `snapshot`. Refresh the root after `activity_cursor_stale`; refresh
the parent after `activity_group_stale`. Retry `activity_read_budget_exceeded` manually.

See the [endpoint reference](./endpoints) for the upcoming request and response schemas.
