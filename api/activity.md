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

Both endpoints return newest-first opaque cursor pages. `limit` defaults to
50 and accepts 1 through 100. A cursor is scoped to the resource it came from.
The Task feed includes the Task's comment and relation activity as well as its
own updates.

```json
{
  "items": [{
    "id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11",
    "occurred_at": "2026-08-22T10:00:00Z",
    "actor": {"id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc12", "display_name": "Ada", "automation": false},
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
