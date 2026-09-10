# Inbox

Inbox is the caller's personal, Workspace-scoped notification feed. It uses
browser-session authentication and the shared [API conventions](conventions.md).
The published native OAuth contract also defines native-bearer access for this
read and update, but that alternative is not yet served; mobile clients must
keep Inbox API mode disabled until it is released. The server never returns
another user's Inbox items.

## List Inbox items

```http
GET /api/v1/workspaces/{workspace_id}/inbox?limit=50&unread_only=true&category=mention HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

`limit` defaults to 50 and accepts 1 through 100. `cursor` continues the same
ordered feed; it is opaque and must not be reused for another Workspace.
`unread_only=true` filters the page to unread items. `category` accepts one of
the twelve category values below. A cursor is bound to the Workspace, unread
mode, and category that created it. `unread_count` always counts all unread
Inbox items, not only those in the returned page or category.

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

The typed categories are `assignment`, `mention`, `comment`, `due`,
`dependency`, `agent`, `integration`, `invitation`, `security`,
`import_export`, `billing`, and `administrative`. An item appears only when its
asynchronous projection emits it and its Inbox preference permits delivery.
Rapid ordinary activity can update one grouped item; `aggregation_count` and
`last_event_at` report that grouping without copying customer content. The
server hides archived items and items whose Task is inactive, no longer
accessible, or no longer followed.
Notification delivery is asynchronous, so a just-completed action does not
guarantee that its Inbox item is already present in the next read.

Discuss creates `agent` Inbox items only for meaningful lifecycle transitions: when a response needs
your input, completes, or fails. Core supplies short safe preview text and a relative link back to the
originating Workspace Discuss conversation; generated answer text, prompts, source excerpts, and raw
provider output are not copied into the notification. Progress, token updates, and cancellation do not
create another item. Delivery requires the initiating user's membership to remain active, and replaying
the same canonical event does not duplicate the notification.

## Notification preferences

`GET /api/v1/workspaces/{workspace_id}/notification-preferences` returns every
category with its description, Inbox, email, and push state; `email_available`
and `push_available` policy facts; delivery policy; mandatory flag; and
revision. Revision `0` is the category default rather than a persisted
override. Update one category through
`PATCH /api/v1/workspaces/{workspace_id}/notification-preferences/{category}`:

```json
{
  "web_enabled": true,
  "email_enabled": false,
  "push_enabled": true,
  "delivery_policy": "daily_digest",
  "expected_revision": 0
}
```

Use the returned positive revision on later updates. A stale revision returns
`409 revision_conflict`. Security, billing, and administrative notifications
are mandatory and cannot disable Inbox delivery. Their email channel is also
mandatory when `email_available` is `true`; when it is `false`, email is shown
as unavailable and an attempt to enable it returns `422 email_not_entitled`.
Push is available only while the account has a current confirmed browser or
native endpoint. Delivery policy is `immediate`, `daily_digest`, or
`weekly_digest`; digest policies schedule channel work for the recipient's next
08:00 daily or Monday window in their configured timezone.

Email delivery requires the source Workspace's locally materialized
`notifications.email` paid entitlement, a verified recipient, active Workspace
membership, current resource access, and (for Task notifications) a currently
following Task subscription. These conditions are rechecked when delivery is
claimed, so losing access or muting a Task suppresses already queued mail.
It is durably queued, leased to one worker, retried with bounded exponential
backoff, and dead-lettered after the configured attempt limit. Provider errors
are stored and logged as safe error codes; notification content and recipient
addresses are not emitted as observability labels.

## Browser push lifecycle

Browser push is opt-in and uses the browser's permission prompt. Read the
public VAPID key from `GET /api/v1/me/push-endpoints/browser/config`, subscribe
through the active service worker, then register that exact subscription with
`PUT /api/v1/me/push-endpoints/browser`. The mutation uses browser-session and
CSRF protection and replaces the current session's prior browser endpoint.
`DELETE /api/v1/me/push-endpoints/browser` removes that session's endpoint and
is idempotent.

Subscriptions are encrypted at rest with a notification-specific keyring,
confirmed for 45 days, and removed on logout, user disablement, expiry, or a
permanent provider rejection. The server retains only an irreversible token
hash for 30 days after provider suppression. Push payloads contain the Assign
title, one approved category phrase, an opaque notification ID, and a relative
authenticated deep link; they contain no Workspace, resource, Actor, customer
content, provider URL, or endpoint material.

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

Marking a notification read also suppresses its pending or deferred email and
push deliveries. Already delivered external messages cannot be recalled; those
adapters do not claim read acknowledgement.
