# Activity

Activity is Assign's access-filtered collaboration history. It is distinct
from the security and compliance audit log: sign-in, identity, restricted, and
administrative membership-change events are not included.

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
    "summary": {}
  }],
  "next_cursor": null,
  "has_more": false
}
```

`action` is a stable localization key, not a sentence. `summary` contains
only bounded scalar metadata; it never returns comment text, Document content,
or other free-form content. Visibility is evaluated at read time using current
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
