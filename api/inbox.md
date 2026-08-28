# Inbox

Inbox is the caller's personal, Workspace-scoped notification feed. It uses
browser-session authentication and the shared [API conventions](conventions.md).
The published native OAuth contract also defines native-bearer access for this
read and update, but that alternative is not yet served; mobile clients must
keep Inbox API mode disabled until it is released. The server never returns
another user's Inbox items.

## List Inbox items

```http
GET /api/v1/workspaces/{workspace_id}/inbox?limit=50&unread_only=true HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

`limit` defaults to 50 and accepts 1 through 100. `cursor` continues the same
ordered feed; it is opaque and must not be reused for another Workspace.
`unread_only=true` filters the page to unread items. `unread_count` always
counts all unread Inbox items, not only those in the returned page.

```json
{
  "items": [
    {
      "id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11",
      "workspace_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc12",
      "category": "assignment",
      "resource_type": "task",
      "resource_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc13",
      "summary": {},
      "read_at": null,
      "seen_at": null,
      "archived_at": null,
      "revision": 1,
      "created_at": "2026-08-20T10:00:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false,
  "unread_count": 1
}
```

The typed categories are `assignment`, `mention`, `comment`, `due`,
`dependency`, `agent`, `integration`, `invitation`, `security`,
`import_export`, `billing`, and `administrative`. An item appears only when its
asynchronous projection emits it and its web preference permits delivery.
Notification delivery is asynchronous, so a just-completed action does not
guarantee that its Inbox item is already present in the next read.

## Notification preferences

`GET /api/v1/workspaces/{workspace_id}/notification-preferences` returns every
category with its description, web and email state, mandatory flag, and
revision. Revision `0` is the category default rather than a persisted
override. Update one category through
`PATCH /api/v1/workspaces/{workspace_id}/notification-preferences/{category}`:

```json
{"web_enabled": true, "email_enabled": false, "expected_revision": 0}
```

Use the returned positive revision on later updates. A stale revision returns
`409 revision_conflict`. Security, billing, and administrative notifications
are mandatory and cannot disable either channel.

Email delivery requires a verified recipient and active Workspace membership.
It is durably queued, leased to one worker, retried with bounded exponential
backoff, and dead-lettered after the configured attempt limit. Provider errors
are stored and logged as safe error codes; notification content and recipient
addresses are not emitted as observability labels.

## Mark one item read or unread

```http
PATCH /api/v1/inbox-items/{inbox_item_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "1"
Content-Type: application/json

{"read": true}
```

`If-Match` contains the item's last `revision`, quoted as an HTTP ETag. The
response is the updated Inbox item and includes its current `ETag`. Repeating the
same state is idempotent. A stale revision returns `409 revision_conflict`; an
absent item or one owned by another user returns `404 not_found`.

When native bearer admission is released, the request instead uses
`Authorization: Bearer <native-access-token>` and omits browser cookies and
`X-CSRF-Token`. It has the same caller-only ownership, ETag, pagination, and
error behavior; an invalid native credential never falls back to a browser
session.

## Converge state across devices

Use `POST /api/v1/workspaces/{workspace_id}/inbox/read-state` after rendering a
batch or choosing “mark all read”:

```json
{"cutoff": "2026-08-20T10:00:00Z", "read": true}
```

`read: true` marks visible web deliveries through the cutoff read and seen;
`read: false` marks them seen only. The cutoff is monotonic and idempotent, so
late or reordered updates from another device cannot mark newer notifications
or regress older state. The response includes `changed` and the authoritative
`unread_count` for immediate badge reconciliation.
