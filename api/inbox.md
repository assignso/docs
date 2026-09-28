---
description: Read and manage your Inbox notifications, notification preferences and browser push.
---

# Inbox

Inbox is your personal, Workspace-scoped notification feed. It uses a browser session and the
[API conventions](./conventions). You never see another user's items. Native-token access is
published for planning only, so mobile clients shouldn't use it yet.

## List items

```http
GET /api/v1/workspaces/{workspace_id}/inbox?limit=50&unread_only=true&category=mention
```

`limit` is 1–100 (default 50). `cursor` is opaque and bound to the Workspace, unread mode and
category that created it. `unread_only=true` returns unread items. `unread_count` always counts all
unread items, not just the page.

```json
{
  "items": [
    {
      "id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc11",
      "workspace_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc12",
      "category": "assignment",
      "urgency": "high",
      "resource_type": "task",
      "resource_id": "018f0d5a-ef50-7fa3-8c11-2ddc6b30dc13",
      "summary": {},
      "deep_link": "/app/example-workspace/inbox",
      "aggregation_count": 1,
      "last_event_at": "2026-08-20T10:00:00Z",
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

Categories: `assignment`, `mention`, `comment`, `due`, `dependency`, `agent`, `integration`,
`invitation`, `security`, `import_export`, `billing` and `administrative`.

- Items are created in the background and only when your preferences allow them, so a just-completed
  action may not appear on the very next read.
- Rapid activity can update one grouped item. `aggregation_count` and `last_event_at` report it.
- Archived items, and items whose Task is inactive, inaccessible or no longer followed, are hidden.
### Discuss notices <Badge type="warning" text="Awaiting deployment" />

Read generated Discuss message notices in Discuss. They are excluded from Inbox items and unread totals, including older notices. Other Agent notifications remain in Inbox. Your configured email and push preferences still apply.

## Mark read or unread

```http
PATCH /api/v1/inbox-items/{inbox_item_id} HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "1"
Content-Type: application/json

{"read": true}
```

`If-Match` is the item's `revision`. The response is the updated item with its `ETag`. Repeating the
same state is safe, a stale revision returns `409 revision_conflict` and an item that's absent or
isn't yours returns `404`.

To sync across devices, `POST /api/v1/workspaces/{workspace_id}/inbox/read-state` with
`{"cutoff": "2026-08-20T10:00:00Z", "read": true}` marks visible deliveries up to the cutoff read and
seen (`read: false` marks them seen only). The cutoff is monotonic and idempotent, so late updates
from another device can't regress state. The response gives `changed` and the current `unread_count`.
Reading an item also cancels its pending email and push, but messages already sent can't be recalled.

## Notification preferences

`GET /api/v1/workspaces/{workspace_id}/notification-preferences` returns each category with its
description, Inbox, email and push state, `email_available` and `push_available`, delivery policy, a
mandatory flag and a revision. Revision `0` is the default, not a saved choice.

```http
PATCH /api/v1/workspaces/{workspace_id}/notification-preferences/{category}
Content-Type: application/json

{"web_enabled": true, "email_enabled": false, "push_enabled": true, "delivery_policy": "daily_digest", "expected_revision": 0}
```

Use the returned revision next time. A stale one returns `409 revision_conflict`.

- **Delivery policy** is `immediate`, `daily_digest` (08:00 in your timezone) or `weekly_digest`
  (Monday 08:00).
- **Security, billing and administrative** notifications can't disable Inbox delivery, and email is
  mandatory for them when `email_available` is `true`. Enabling email when it's unavailable returns
  `422 email_not_entitled`.
- **Email** needs the paid `notifications.email` entitlement, a verified address, active membership
  and current access to the resource, and for Tasks a current follow. These are rechecked when the
  email is sent, so losing access or muting a Task stops queued email. Failed sends are retried, then
  dropped.
- **Push** needs a confirmed browser endpoint.

## Browser push

Push is opt-in through the browser's permission prompt.

1. `GET /api/v1/me/push-endpoints/browser/config` returns the public VAPID key.
2. Subscribe through the active service worker.
3. `PUT /api/v1/me/push-endpoints/browser` registers that subscription (browser session and CSRF).
   It replaces the session's earlier endpoint.
4. `DELETE /api/v1/me/push-endpoints/browser` removes it, idempotently.

Subscriptions are encrypted, confirmed for 45 days and removed on logout, account disablement, expiry
or permanent rejection by the provider. A push contains the Assign title, an approved category
phrase, an opaque notification ID and a relative link, with no Workspace, resource, person or
customer content.
