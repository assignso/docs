---
description: Roles, Workspace settings, creation, archiving, members, invitations, AI access, workflow Statuses, realtime events and My Work.
---

# Workspaces

Create a Workspace, manage who belongs to it and configure it. These operations use a browser session
(see [Authentication](./authentication)) and the [API conventions](./conventions). Reading your own
Workspaces and members is covered in [Account](./account#workspaces-and-members).

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

**First Workspace.** A new account with no Workspace calls the bootstrap operation:

```http
POST /api/v1/workspaces/bootstrap HTTP/1.1
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"name": "Acme", "slug": "acme"}
```

`name` is 1–100 characters. `slug` is the unique URL segment: 1–63 lowercase letters, numbers and
interior hyphens. The caller becomes owner and the session switches to the new Workspace. An account
that already has one gets `409 workspace_already_exists`.

**Another Workspace.**

```http
POST /api/v1/workspaces HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: 6f1b0d5e-1a3c-4f2b-9a4d-2c8e5b7f0a11
Content-Type: application/json

{"name": "Acme", "slug": "acme"}
```

`slug` is optional and generated if omitted. The session doesn't switch; use
[Switch Workspace](./authentication#switch-workspace). An account can own up to three Free Workspaces;
past that you get `409 free_workspace_claim_unavailable`.

`GET /api/v1/workspace-creation-options` tells a client what to offer: `free_available` and the
currently purchasable paid options.

**Paid Workspace** <Badge type="warning" text="Awaiting deployment" />. Send a `quote_id` from the creation options:

```http
POST /api/v1/workspace-checkouts HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: 6f1b0d5e-1a3c-4f2b-9a4d-2c8e5b7f0a11
Content-Type: application/json

{"name": "Acme Premium", "slug": "acme-premium", "quote_id": "personal_monthly"}
```

Redirect the browser to the returned `url`. Returning from checkout proves nothing. The Assign
browser reads the checkout and waits for Account realtime updates; it offers the Workspace
only after `state` is `activated`. API clients can read
`GET /api/v1/workspace-checkouts/{checkout_id}` on demand. Other states are `pending`,
`activating`, `expired`, `canceled`, and `failed`. Only `activated` includes the Workspace.

## Read, update and archive

`GET /api/v1/workspaces/{workspace_id}` returns a Workspace for any active member, with its revision
in `ETag`. An archived Workspace returns `404` to everyone but its owners.

```http
PATCH /api/v1/workspaces/{workspace_id} HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{"name": "Acme Corporation"}
```

Send exactly one of `name`, `slug`, `icon_url` or `archived`. Renaming and changing the URL or icon
need an owner or admin. A taken `slug` returns `409 workspace_url_taken` and an invalid one
`400 invalid_workspace_url`. `icon_url` is an HTTPS image URL; an empty string removes it.
`archived` accepts only `false`, which lets an owner un-archive.

Workspace icons can also be uploaded through the [attachment flow](./attachments) (512 × 512 PNG or
JPEG, 5 MiB at most) and set with `POST /api/v1/workspaces/{workspace_id}/icon`. `DELETE` removes
it.

`DELETE /api/v1/workspaces/{workspace_id}` with `If-Match` archives the Workspace (`204`). Only an
owner can archive, after signing in within the last 15 minutes
([recent authentication](./account#recent-authentication)). Nothing is deleted, but every session in
the Workspace ends, it returns `404` to non-owners and all writes stop. Your last Workspace can't be
archived (`409 last_workspace`).

## Settings

Any active member can read `GET /api/v1/workspaces/{workspace_id}/settings`. Owners and admins update
it with `PATCH` and `If-Match`. It holds the description and the defaults for locale, timezone, first
day of week, Project visibility and Task workflow category, priority and assignee. New Projects and
Tasks use these defaults unless the request says otherwise.

`GET` and `PATCH /api/v1/workspaces/{workspace_id}/knowledge-settings` control
[Workspace Knowledge](./knowledge): the included Projects, sources and whether it's enabled. Enabling
needs the `workspace_knowledge` entitlement and at least one Project. The response reports setup
progress and readiness.

### Billing

Billing managers (`workspace.billing.manage`) use these operations. Changes need the CSRF header and
recent authentication.

- `GET …/billing-settings` returns the plan, billing cadence, period and a summary of recent
  invoices. `provider_available` says whether checkout can start.
- `POST …/checkout-sessions` with a plan and cadence, such as `{"plan":"personal","cadence":"monthly"}`,
  returns a hosted checkout URL. Clients never send prices.
- `POST …/billing-portal-sessions` returns a hosted portal URL once the Workspace has a billing
  customer.
- `POST …/billing/knowledge-credit-top-ups` starts a credit purchase.

Returning from checkout or the portal changes nothing by itself; the plan updates after Assign
verifies the payment provider's notification. While a Workspace is `billing_restricted`, you can
still read, repair billing, archive and reduce usage, but content writes, capacity increases, write
integrations, Agents and automation are blocked. Active members and unexpired invitations both count
toward member limits.

## AI and MCP access

Any member can read `GET …/ai-access-policy`. It's enabled by default.

```http
PUT /api/v1/workspaces/{workspace_id}/ai-access-policy HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "2"
Content-Type: application/json

{"enabled": false}
```

Changing it needs an owner or admin. Disabling it immediately blocks new MCP authorizations and
existing MCP connections for this Workspace only. Enabling restores them. A stale revision returns
`409 revision_conflict`.

## Workspace-wide Statuses

Workspace-wide Statuses (with `project_id: null`) are the shared workflow every Project can use.

```http
GET /api/v1/workspaces/{workspace_id}/statuses?limit=50
```

Any member can read this, with `include_archived=true` for archived entries. Creating needs an owner
or admin:

```http
POST /api/v1/workspaces/{workspace_id}/statuses HTTP/1.1
X-CSRF-Token: <csrf-token>
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
| `POST …/members` with `{"user_id"}` | Reactivates someone who was previously a member. It can't add a stranger; use an invitation. |
| `PATCH …/members/{member_id}` with `If-Match` | Send `role` and/or `state` (`active` or `suspended`). Suspending ends their sessions in this Workspace. |
| `DELETE …/members/{member_id}` | `204`, also if repeated. Ends their sessions. Their past Tasks and Comments stay attributed to them. |

All need an owner or admin. You can't change or remove your own membership
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
X-CSRF-Token: <csrf-token>
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
- `GET …/invitations?limit=50` lists them, newest first, without tokens. `state` is `pending`,
  `accepted`, `revoked` or `expired`.
- `POST …/invitations/{invitation_id}/resend` revokes the old link and sends a fresh 7-day one. If
  delivery fails, the original stays valid.
- `DELETE …/invitations/{invitation_id}` revokes it (`204`).

All need an owner or admin.

### Accept an invitation

Recipients open the emailed link. The web app then asks them to sign in with the invited address and
confirm **Accept invitation**. API clients can redeem the token directly:

```http
POST /api/v1/invitations/accept HTTP/1.1
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"token": "<one-time-token>"}
```

This returns the joined Workspace. It isn't Workspace-scoped, so a new account can use it. The
account must have a verified email matching the invited address.

## Realtime events

Use the [application WebSocket](./realtime) <Badge type="warning" text="Upcoming" /> for Workspace changes. Its versioned scopes deliver content-free hints; apply canonical reads before acknowledging a checkpoint. The former Workspace SSE endpoint has been removed from the upcoming API contract.

### Rank rebalance events <Badge type="warning" text="Awaiting deployment" />

Reordering a Task or Project may also update neighboring ranks. A rare rebalance sends
`task.updated` or `project.updated` for each changed neighbor, with `source: rank_rebalance` in the
payload. Reload each named resource before showing its order.

### Project state replacement events <Badge type="warning" text="Awaiting deployment" />

When a Project lifecycle state is archived with a replacement, each reassigned Project sends
`project.updated` with `source: project_state_replacement`. Reload each named Project to show its
current state.

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
| `409` | `last_workspace` | It's the caller's only Workspace. |
| `409` | `invitation_pending` | An unexpired invitation for that address exists. |
| `409` | `already_member` | The address belongs to an active member. |
| `409` | `invitation_not_pending` | The invitation was revoked or already accepted. |
| `410` | `invitation_expired` | The invitation has expired. |
| `403` | `invitation_recipient_mismatch` | The signed-in account isn't the invited address. |
| `403` | `email_verification_required` | The account hasn't verified its email. |
| `422` | `self_membership_mutation` | You tried to change your own membership. |
