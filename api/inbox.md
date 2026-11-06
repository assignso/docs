---
description: Read and manage your Inbox notifications, notification preferences and browser push.
---

# Inbox

Inbox is your personal, Workspace-scoped notification feed. Use a human product bearer credential
under the [API conventions](./conventions). Current membership and resource access apply, and you
never see another user's items. Browser cookies do not authenticate these integration requests.

## List items

```http
GET /api/v1/workspaces/{workspace_id}/inbox?limit=50&unread_only=true&category=mention
```

`limit` is 1–100 (default 50). `cursor` is opaque and bound to the current credential, Workspace,
unread mode and category. Follow `next_cursor` until it is `null`, including after a short or empty
page. `unread_only=true` returns unread items. The decimal-string `unread_count` counts all unread
items under the current visibility rules, not just the page.

```json
{
  "data": [
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
      "revision": "1",
      "created_at": "2026-08-20T10:00:00Z"
    }
  ],
  "next_cursor": null,
  "unread_count": "1"
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

First read `GET /api/v1/inbox-items/{inbox_item_id}` and retain its opaque item `ETag`.
The Inbox collection validator cannot authorize this write.

```http
PATCH /api/v1/inbox-items/{inbox_item_id} HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-item-read>
Idempotency-Key: <unique-key-retained-for-this-command>
Content-Type: application/json

{"read": true}
```

Forward the exact item validator for its original credential and encoding, rather than the numeric
revision. A stale condition returns `412`, a missing one `428`, and a malformed or weak one `400`.
An absent, expired or inaccessible item returns `404`. Recover an unknown outcome with the original
body, condition and key before issuing another command.

To sync across devices, `POST /api/v1/workspaces/{workspace_id}/inbox/read-state` with
`{"cutoff": "2026-08-20T10:00:00Z", "read": true}` marks visible deliveries up to the cutoff read and
seen (`read: false` marks them seen only). Supply an `Idempotency-Key`; this command takes no
`If-Match`. The original key preserves the chosen cutoff for recovery. The cutoff is monotonic, so
late updates from another device cannot regress state. The response gives decimal-string `changed`
and `unread_count` values.
Reading an item also cancels its pending email and push, but messages already sent can't be recalled.

## Use Inbox in the native app <Badge type="warning" text="Upcoming" />

Open **Inbox** from a main screen, then choose **Open item** to view its Task, Project or Document.
**Back** returns to Inbox. Removed items and content you can no longer access show an unavailable state.
Use **Load more** for older notifications; the unread badge includes notifications beyond the loaded page.
Inbox works even when device push notifications are unavailable or denied.

**Mark read** and **Mark unread** require a connection. Wait while **Saving read state…** appears.
If the result is uncertain, **Reload Inbox** checks current data and **Retry read state change**
recovers the original action. Keep recovery details until the outcome is resolved; leaving discards
those details without cancelling an action already sent. After a rejected change, reload before
trying another action. **Read state saved** confirms the change even if a separate refresh error appears.

## Notification preferences

`GET /api/v1/workspaces/{workspace_id}/notification-preferences` returns each category with its
description, Inbox, email and push state, `email_available` and `push_available`, delivery policy, a
mandatory flag and a decimal-string revision. Revision `"0"` is the default, not a saved choice.
Read `GET /api/v1/workspaces/{workspace_id}/notification-preferences/{category}` to obtain the
effective category's opaque item `ETag`; a collection tag or revision number cannot authorize an edit.

```http
PATCH /api/v1/workspaces/{workspace_id}/notification-preferences/{category} HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-category-read>
Content-Type: application/json

{"web_enabled": true, "email_enabled": false, "push_enabled": true, "delivery_policy": "daily_digest"}
```

Preserve the read's credential and encoding when forwarding its validator. A stale condition returns
`412`. This observed-state patch does not use an `Idempotency-Key`: after an uncertain response,
read the current authorized singleton and review your intent before making another conditional patch.
Omitted fields keep their effective values; `null` is invalid.

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

Open **Account settings → Notifications** to enable push delivery for the categories you want.
Allow notifications when your browser asks. If you previously blocked them, review the browser's
site permission before trying again. The Assign application manages the browser subscription.

Subscriptions are stored encrypted and remain confirmed for 45 days. Signing out or disabling the
account removes the subscription. An expired or rejected subscription may need to be enabled again.
Push notifications contain an Assign title, a category phrase and a link you open after signing in.
They do not include Workspace, resource, person or customer content.
