---
description: Roles, Workspace settings, creation, archiving, members, invitations, AI access, workflow Statuses, realtime events and My Work.
---

# Workspaces

Use Workspace settings to manage your Workspace and its members. Create another Workspace through
[Account settings](./account#workspaces-and-members). For integration credentials, supported
operations and availability, see [Authentication](./authentication) and the
[public API reference](./reference/). Resource requests follow the [API conventions](./conventions).
The rewritten v1 resource routes below are awaiting deployment.

## Roles

Each membership has one role.

| Role | Read | Write work | Manage members | Manage Workspace |
| --- | --- | --- | --- | --- |
| `owner` | yes | yes | yes | yes |
| `admin` | yes | yes | yes | yes |
| `member` | yes | yes | no | no |
| `viewer` | yes | no | no | no |

`admin` has every `owner` power except archiving. A Workspace always keeps at least one active owner,
so the last one can't be demoted, suspended or removed. A `viewer` is read-only, including comments.

## Create a Workspace

When you sign up, Assign asks you to name your first Workspace and fills in its URL path.
You become its owner. See the [quickstart](../get-started/quickstart).

To create another, open **Account settings → Billing & plans** and choose an available Workspace
option. Your account can own up to three Free Workspaces. Assign shows your remaining allowance
and the available paid plans. After creation, select the new Workspace in the Workspace chooser.

### Paid Workspace <Badge type="warning" text="Awaiting deployment" />

Choose the plan in Assign and continue to the hosted checkout. Returning from checkout does not
confirm payment or activate a Workspace.
Wait for Assign to show the completed purchase and the new Workspace before opening it.
If confirmation is delayed or the connection is interrupted, check the existing checkout's status
in Assign before starting another purchase.

<a id="read-update-and-archive"></a>

## Read and update

`GET /api/v1/workspaces/{workspace_id}` returns a Workspace for any active member. Keep the
canonical response's opaque item `ETag` for an edit, using the same credential and content
encoding. A revision number is not a valid condition. An archived Workspace returns `404` to
everyone but its owners.

```http
PATCH /api/v1/workspaces/{workspace_id} HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-canonical-read>
Idempotency-Key: <unique-key-retained-for-this-command>
Content-Type: application/json

{"name": "Acme Corporation"}
```

Send exactly one of `name` or `slug`. Renaming or changing the URL needs an owner or admin.
A name has 1–100 characters; a slug has 1–63 lowercase letters, numbers and interior hyphens.
A taken `slug` returns `409 workspace_url_taken` and an invalid one `400 invalid_workspace_url`.
Retain the original body, condition and key when recovering an unknown write outcome.

### Workspace icon

An owner or admin can upload a 512 × 512 PNG or JPEG of at most 5 MiB through the
[attachment flow](./attachments). After the upload completes and passes scanning, send its
`attachment_id` in `POST /api/v1/workspaces/{workspace_id}/icon`. The attachment must belong to
the current Workspace and have been uploaded by the current Actor. `DELETE` on the same path
removes the association without a request body. Both commands require the Workspace's exact
opaque item `ETag` in `If-Match` and an `Idempotency-Key`; an image URL is not accepted as input.

## Archive <Badge type="warning" text="Awaiting deployment" />

Archiving and restoration are first-party Account actions managed in Assign. An owner needs a
sign-in within the last 15 minutes. Integration bearer credentials do not provide that proof;
these actions are outside the public integration operations.

Archiving deletes nothing, ends the Workspace's sessions, hides it from non-owners and stops
writes. Your last Workspace cannot be archived. Manage restoration through Assign's supported
Workspace controls rather than adding an archive field to an integration update.

## Settings

Any active member can read `GET /api/v1/workspaces/{workspace_id}/settings`. Owners and admins update
it with `PATCH` and `If-Match`. It holds the description and the defaults for locale, timezone, first
day of week, Project visibility and Task workflow category, priority and assignee. New Projects and
Tasks use these defaults unless the request says otherwise.

Use the declared read's opaque item validator and an `Idempotency-Key` for a conditional update.
Keep its credential and encoding unchanged; a numeric revision is not a valid `If-Match` value.

Configure [Workspace Knowledge](./knowledge) in Assign, choosing the included Projects and sources.
Enabling it needs an active Knowledge entitlement and at least one included Project. Check its
setup progress and readiness in the application.

### Features <Badge type="warning" text="Awaiting deployment" />

Read `GET /api/v1/workspaces/{workspace_id}/features` to see registered features, their state and
whether you can manage them. Update a feature with
`PATCH /api/v1/workspaces/{workspace_id}/features/{feature}` and an `enabled` boolean. Send that
feature row's exact `item_validator.etag` in `If-Match`, preserving its `encoding`, plus an
`Idempotency-Key`. A collection ETag or numeric revision cannot authorize the edit.

Time tracking uses `time:manage`; other features use `workspace:manage`. Planned features are
read-only. A disabled feature retains its data. Prerequisites must be enabled first, and enabled
dependents must be disabled before their prerequisite. After `workspace.feature.updated`, reread
the feature list. Enabling a feature preserves the permission checks for each operation.

Use the [endpoint reference](./endpoints) for each feature and policy operation's current fields.

### Billing

Open **Workspace settings → Billing** to review the plan and invoices. Plan changes, the billing
portal and credit purchases require billing-management permission. Assign may ask you to sign in
again before a sensitive change. Choose the plan and billing period in Assign, then use the hosted
checkout or portal it opens.

Returning from checkout or the portal does not confirm a change; the plan updates after Assign
verifies the payment. If a purchase is pending, check its status before paying again. While a
Workspace has restricted billing, you can
still read, repair billing, archive and reduce usage, but content writes, capacity increases, write
integrations, Agents and automation are blocked. Active members and unexpired invitations both count
toward member limits.

## AI and MCP access

Any member can read `GET /api/v1/workspaces/{workspace_id}/ai-access-policy`. It's enabled by default.

```http
PUT /api/v1/workspaces/{workspace_id}/ai-access-policy HTTP/1.1
Authorization: Bearer <token>
If-Match: <exact-etag-from-canonical-read>
Idempotency-Key: <unique-key-retained-for-this-command>
Content-Type: application/json

{"enabled": false}
```

Changing it needs an owner or admin. Disabling it immediately blocks new MCP authorizations and
existing MCP connections for this Workspace only. Enabling restores them. Use the AI policy
read's opaque item ETag; a stale condition returns `412`, a missing condition `428`, and a malformed
or weak condition `400`.

## Workspace-wide Statuses

Workspace-wide Statuses (with `project_id: null`) are the shared workflow every Project can use.

```http
GET /api/v1/workspaces/{workspace_id}/statuses?limit=50
```

Any member can read this, with `include_archived=true` for archived entries. Creating needs an owner
or admin:

```http
POST /api/v1/workspaces/{workspace_id}/statuses HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: 6f1b0d5e-1a3c-4f2b-9a4d-2c8e5b7f0a11
Content-Type: application/json

{"label": "Ready for review", "category": "in_review", "status_type": "started", "color": "#7C3AED"}
```

The Status is appended and returned with `201`. `label` is 1–100 characters. `category` is
`backlog`, `todo`, `in_progress`, `in_review` or `done`. `status_type` (optional) is `backlog`,
`unstarted`, `started`, `completed` or `cancelled`. `icon` and a six-digit hex `color` are optional.
Update, archive and reorder them as described in
[Projects and Statuses](./projects#update-archive-restore-and-reorder).

## Members

| Operation | Notes |
| --- | --- |
| `POST /api/v1/workspaces/{workspace_id}/members` with `{"user_id": "<existing-user-id>"}` | Reactivates someone who was previously a member. It can't add a stranger; use an invitation. |
| `PATCH …/members/{member_id}` with `If-Match` | Send `role` and/or `state` (`active` or `suspended`). Suspending ends their sessions in this Workspace. |
| `DELETE …/members/{member_id}` with `If-Match` | Returns `204`; same-key recovery returns the original outcome. Ends their sessions. Past Tasks and Comments stay attributed to them. |

Each command needs an `Idempotency-Key`. For a member update or removal, use that member's
`item_validator.etag` from the member list with its original encoding, rather than the collection
ETag or a numeric revision.

These commands need an owner or admin, but only an owner can grant, change, reactivate or remove
an owner membership. You can't change or remove your own membership
(`422 self_membership_mutation`), and the last owner can't be demoted, suspended or removed
(`409 last_owner`).

## Invitations

### Verify with the invitation <Badge type="warning" text="Awaiting deployment" />

The invitation itself verifies the invited email address. New users can
[register with the invitation](./authentication#register-from-an-invitation)
without a second verification email. Existing unverified users verify their
address when they accept. You must sign in with the invited address and explicitly
accept; opening the email link does not join the Workspace.

```http
POST /api/v1/workspaces/{workspace_id}/invitations HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: 0f2c9a71-6f4e-4d8b-8f1a-7b3e6d2c5a04
Content-Type: application/json

{"email": "jane@example.com", "role": "member"}
```

The response carries the `invitation` (`id`, `email`, `role`, `state`, `expires_at`, `revision` …)
and a one-time `token`, which is returned only once. Assign also emails the address a single-use
link. If the email can't be sent, the request fails with `503 delivery_unavailable` and creates
nothing.

- `role` is `admin`, `member` or `viewer`, never `owner`. The address is lowercased and the
  invitation lasts 7 days.
- An unexpired invitation for the same address returns `409 invitation_pending`, and an existing
  member returns `409 already_member`.
- `GET /api/v1/workspaces/{workspace_id}/invitations?limit=50` lists them, newest first, without tokens. `state` is `pending`,
  `accepted`, `revoked` or `expired`.
- `POST …/invitations/{invitation_id}/resend` revokes the old link and sends a fresh 7-day one. If
  delivery fails, the original stays valid. Forward the invitation row's opaque `item_validator.etag`
  in `If-Match`, preserving its encoding.
- `DELETE …/invitations/{invitation_id}` revokes it (`204`).

All need an owner or admin. Creation, resend and revocation require an `Idempotency-Key` retained
with the original request for recovery.

### Accept an invitation

Open the emailed link, sign in with the invited address and confirm **Accept invitation**.
Opening the link alone does not join the Workspace. A new account can register through the
invitation; accepting also verifies that invited address as described above.

If the invitation has expired or been revoked, ask a Workspace administrator for a new one. If you
are signed in with another address, switch accounts before accepting. After an interrupted
acceptance, check the Workspace chooser before trying the same invitation again.

## Realtime events

Upcoming [live updates](./realtime) refresh Workspace views when saved data changes. Let a view
finish refreshing before relying on its current state. External integrations should use the
supported operations in the [public reference](./reference/) and read collections with
[bounded pagination](./pagination).

### Rank rebalance events <Badge type="warning" text="Awaiting deployment" />

Reordering a Task or Project may also change the ordering values of nearby items. Refresh the
affected collection to see its current order. A delayed update does not establish that the reorder
failed; check the saved result before repeating it.

### Project state replacement events <Badge type="warning" text="Awaiting deployment" />

Archiving a Project lifecycle state with a replacement moves the affected Projects to that
replacement. Let those Project views refresh to show their current state.

## My Work

A personal, read-only projection of your own Tasks:

```http
GET /api/v1/workspaces/{workspace_id}/work?view=today&limit=50
```

`view` is `assigned`, `overdue`, `today`, `upcoming` or `completed`. Due dates are dates, evaluated
in the timezone returned in the response. Completed Tasks stay in `completed` for 14 days. The
response has `items`, `next_cursor`, `has_more`, `as_of_date` and `timezone`. Default page size is
50, maximum 100.

## Errors

In addition to the [shared errors](./conventions):

| Status | Code | Meaning |
| --- | --- | --- |
| `409` | `last_owner` | The change would leave no active owner. |
| `409` | `invitation_pending` | An unexpired invitation for that address exists. |
| `409` | `already_member` | The address belongs to an active member. |
| `409` | `invitation_not_pending` | The invitation was revoked or already accepted. |
| `410` | `invitation_expired` | The invitation has expired. |
| `403` | `invitation_recipient_mismatch` | The signed-in account isn't the invited address. |
| `403` | `email_verification_required` | The account hasn't verified its email. |
| `422` | `self_membership_mutation` | You tried to change your own membership. |
