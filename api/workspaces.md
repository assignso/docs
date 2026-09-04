# Workspace governance

Creating a Workspace, managing who belongs to it, inviting people by email,
and archiving it. These operations require an authenticated browser session
(see [Browser authentication](authentication.md)) and follow the shared
[API conventions](conventions.md).

Reading your own Workspaces and the current Workspace's member list is
covered in [Account and Workspaces](account.md).

## Roles

Every membership carries exactly one role:

| Role | Read Workspace and work | Write work | Manage members | Manage Workspace |
| --- | --- | --- | --- | --- |
| `owner` | yes | yes | yes | yes |
| `admin` | yes | yes | yes | yes |
| `member` | yes | yes | no | no |
| `viewer` | yes | no | no | no |

`admin` holds the same capabilities as `owner`. The one power that is
owner-only is archiving, and the one invariant that separates them is that a
Workspace must always retain at least one **active owner** — the database
enforces it, so the last owner cannot be demoted, suspended, or removed by any
route.

`viewer` is read-only. It can read the Workspace and its work and nothing
else; every write, including comments, is refused.

## Workspace settings

Any active member may read `GET /api/v1/workspaces/{workspace_id}/settings`.
Owners and administrators update it with `PATCH` plus the returned revision in
`If-Match`. The revisioned resource contains the optional description and the
default locale, timezone, first day of week, Project visibility, Task workflow
category, priority, and assignee policy. An omitted Project or Task creation
field resolves from these defaults in the creation transaction; an explicit
caller value always wins.

Workspace icons use the direct-to-S3 attachment reservation/completion flow.
After cropping to a clean 512 × 512 PNG or JPEG no larger than 5 MiB, an owner
or administrator associates the completed object with `POST
/api/v1/workspaces/{workspace_id}/icon` and its attachment ID. `DELETE` removes
it. Replacement/removal retires the old object and releases quota. The stable
authenticated `/icon/content` operation redirects to a short-lived inline S3
credential.

`GET` and revisioned `PATCH
/api/v1/workspaces/{workspace_id}/knowledge-settings` expose explicit included
Projects, source toggles, session-learning policy, desired enablement, and
acknowledgement status. Enablement requires the `workspace_knowledge`
entitlement and at least one selected Project; without entitlement the response
is truthfully unavailable. Provisioning and disabling remain pending until the
Knowledge worker acknowledges them. The read also carries the last acknowledged
revision, observation and success times, indexed/source sequences, backlog,
bounded entity counts, and a customer-safe failure code. These fields describe
derived Knowledge state only and never override canonical Workspace content.

When the private Knowledge ledger is configured, Workspace Billing includes a
signed, Workspace-scoped balance summary for recurring, promotional,
purchased, reserved, and available credits. If that projection is unavailable,
the UI labels it unavailable rather than inventing a zero balance. The expanded
Workspace settings sidebar links to Billing with a compact plan and
available-credit summary; default Workspace navigation and Account settings do
not duplicate it. In local fake-provider mode only, billing managers may start
unpriced 100, 500, or 1000
credit checkouts with `POST
/api/v1/workspaces/{workspace_id}/billing/knowledge-credit-top-ups`. A browser
return grants nothing; a verified fake event creates one grant, and a verified
full refund creates one compensating ledger transaction. Ordinary Stripe and
production top-ups remain unavailable until their commercial catalog is
accepted.

An owner or administrator with `workspace.billing.manage` may read `GET
/api/v1/workspaces/{workspace_id}/billing-settings` for the provider-neutral
plan, lifecycle, billing cadence, period, customer-presence flag, and a bounded
invoice summary. `provider_available` is authoritative: it remains false until
the current environment has a complete mode-consistent provider key, webhook
secret, four Small/Growth cadence Price mappings, and reviewed return/callback
URLs.

When available, `POST
/api/v1/workspaces/{workspace_id}/checkout-sessions` accepts only a server-known
plan and cadence, for example `{"plan":"small","cadence":"monthly"}`. It
returns a short-lived provider-hosted URL and opaque reference; clients never
send a Price ID or amount. After the Workspace has a verified provider
customer, `POST /api/v1/workspaces/{workspace_id}/billing-portal-sessions`
returns a short-lived hosted portal URL. These billing mutations require the
browser CSRF header and recent authentication.

`GET /api/v1/me/billing-plans` is the Account-level bounded overview. It lists
at most 100 active Workspace relationships with each Workspace's independent
plan/status and whether the current role can manage billing. It includes no
payment, invoice, tax, provider-customer, or cross-Workspace mutation data;
those details remain on Workspace Settings → Billing.

When a Workspace is `billing_restricted`, reads, billing repair, archival, and
safe usage-reduction actions remain available. Ordinary content writes,
capacity increases, write integrations, Agents, and automation fail closed.
Numeric `members.active_humans` entitlements count active human memberships and
reserve one place for every unexpired pending invitation.

Checkout and Portal returns are navigation only. Assign changes the local
subscription projection only after the Stripe callback signature is verified,
the event is durably deduplicated, and the referenced subscription is
reconciled. Exact commercial prices, tax/legal terms, and live activation
remain separate release gates; local sandbox fixture amounts are not public
pricing.

## Control AI and MCP access

```http
GET /api/v1/workspaces/{workspace_id}/ai-access-policy HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Any active member may read whether AI and MCP access is enabled. The response
includes a revision in its `ETag`; enabled is the default until an owner or
admin changes the policy.

```http
PUT /api/v1/workspaces/{workspace_id}/ai-access-policy HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "2"
Content-Type: application/json

{"enabled":false}
```

Changing the policy requires `workspace:manage`. Disabling it immediately
prevents new authorizations and existing MCP grants from accessing that
Workspace, without disconnecting the same grant from other authorized
Workspaces. Re-enabling access restores eligible existing grants. A stale
revision returns `409 revision_conflict`.

## Workspace-wide workflow Statuses

Workspace-wide Statuses are the shared workflow catalog: each has a null
`project_id` and can be used by Tasks in every Project. Any active member can
read a cursor-bounded page; only an owner or admin with `workspace:manage` can
create one, because a new shared Status changes the Workspace's vocabulary for
work rather than one Project's board.

```http
GET /api/v1/workspaces/{workspace_id}/statuses?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Set `include_archived=true` to include archived catalog entries. The response
uses the standard cursor page envelope. A Workspace ID other than the current
session Workspace, a non-member, or an absent Workspace all return `404`.

```http
POST /api/v1/workspaces/{workspace_id}/statuses HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: 6f1b0d5e-1a3c-4f2b-9a4d-2c8e5b7f0a11
Content-Type: application/json

{"label":"Ready for review","category":"in_review","status_type":"started","icon":"circle-dot","color":"#7C3AED"}
```

The new Status appends to the Workspace-wide workflow and returns `201` with
its `ETag`. Clients do not supply a position. Labels are 1–100 characters and
categories are `backlog`, `todo`, `in_progress`, `in_review`, or `done`.
`status_type` carries the canonical lifecycle meaning and accepts `backlog`,
`unstarted`, `started`, `completed`, or `cancelled`; existing clients may omit
it and continue using the compatible category mapping. Icon and six-digit hex
color overrides are optional.
Creation is safely retryable with the same `Idempotency-Key`; callers without
`workspace:manage` are refused.

Shared Statuses use the same `GET`, revisioned `PATCH`, archival `DELETE`, and
neighbour-anchor `POST /api/v1/statuses/{status_id}/move` operations documented
in [Projects and Statuses](projects.md#archive-restore-and-reorder-statuses).
Those operations require `workspace:manage` for a Workspace-wide Status.

## Realtime Workspace events

```http
GET /api/v1/workspaces/{workspace_id}/events HTTP/1.1
Host: api.assign.so
Accept: text/event-stream
Cookie: __Host-assign_session=<session>
Last-Event-ID: <cursor-from-a-previous-frame>
```

Any active Workspace member can open this authenticated Server-Sent Events
stream. It begins with a `hello` frame that declares envelope version `1`, an
opaque stream epoch, a signed current cursor, and heartbeat/retry hints. Send
`envelope_version=1` on supported clients and echo the epoch on reconnect when
available. Each `workspace_event` frame has a signed, opaque SSE `id` that the
client must preserve unchanged through the standard `Last-Event-ID` header or
the `cursor` query parameter. Connections close normally before the request
timeout; reconnecting is expected.

If a cursor is invalid or expired, the requested version is unsupported, or
the epoch no longer matches, the server sends a terminal `resync_required`
frame containing a machine code, a replacement cursor, and the affected
invalidation scopes. Stop applying queued events, reload the current
authorized data for those scopes, replace stale local state, and then
reconnect from the supplied cursor. Do not replay mutations automatically.

The JSON frame contains `id`, `type`, `subject_type`, `subject_id`, optional
`actor_id`, `occurred_at`, `operation_id`, `payload`, and, for versioned
aggregates, a positive `aggregate_version`. The payload is a bounded
reconciliation hint, not a permission grant or complete resource
representation. Apply only deterministic patches the client understands;
otherwise reload the named resource once and reject stale data using
`aggregate_version` when it is present. Treat `operation_id` as opaque
correlation data. Clients must tolerate events without `aggregate_version`
while retained historical events are upgraded.

## My Work

My Work is a personal, read-only Task projection. It always uses the signed-in
member; clients cannot supply another member or actor identifier.

```http
GET /api/v1/workspaces/{workspace_id}/work?view=today&limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>
```

`view` is one of `assigned`, `overdue`, `today`, `upcoming`, or `completed`.
Due dates are date-only values, classified in the persisted IANA timezone
returned by the response. `as_of_date` makes the calendar boundary explicit;
completed Tasks carry the server-written `completed_at` instant and remain in
the completed view for fourteen calendar days. Archived or no-longer-readable
Tasks are never returned.

The response is bounded to 50 Tasks by default and 100 at most. It contains
`items`, `next_cursor`, `has_more`, `as_of_date`, and `timezone`; clients must
use the opaque cursor unchanged and must not rebuild Work buckets from a
general Task collection.

## Create a Workspace

### Create the first Workspace

A newly registered account uses a dedicated bootstrap operation before it has
any Workspace membership:

```http
POST /api/v1/workspaces/bootstrap HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"name": "Acme", "slug": "acme"}
```

The caller must be signed in with an account-only session and have no active
Workspace membership. `name` is trimmed and must be 1–100 characters. `slug`
is the unique canonical URL segment and must use 1–63 lowercase letters,
numbers, and interior hyphens.

Success returns the created Workspace, creates the owner membership and Actor
and the account's unique Free Workspace claim in the same transaction, and
replaces both browser-session cookies with a session scoped to the new
Workspace. Concurrent bootstrap attempts are
serialized per account, so only one can create the first Workspace. A caller
that already has a Workspace receives `409 workspace_already_exists` and
should list its Workspaces and use the normal session-switch operation.

### Create another Workspace

```http
POST /api/v1/workspaces HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: 6f1b0d5e-1a3c-4f2b-9a4d-2c8e5b7f0a11
Content-Type: application/json

{"name": "Acme", "slug": "acme"}
```

```json
{
  "id": "<workspace-id>",
  "name": "Acme",
  "slug": "acme",
  "icon_url": null,
  "revision": 1,
  "archived_at": null,
  "created_at": "2026-08-18T09:30:00Z",
  "updated_at": "2026-08-18T09:30:00Z"
}
```

This account-level command is available even when the caller is a member of
another Workspace: the selected Workspace and its role do not grant or deny
creation. The caller becomes the new Workspace's first `owner`. `name` is
trimmed and must be 1 to 100 characters. `slug` is optional; when supplied it
must be a unique canonical path, and when omitted Core generates one.

Each human account may own one active Free Workspace. Repeating the command
after that claim is occupied returns `409 free_workspace_claim_unavailable`
without creating a Workspace, membership, Actor, or event. The idempotency key
is scoped to the account, so retrying through a different selected Workspace
still replays the same result.

Creating a Workspace does not switch the calling session into it — see
[Switch the session's Workspace](authentication.md#switch-the-sessions-workspace).

Before presenting the form, use `GET /api/v1/workspace-creation-options`. It
returns `free_available`, the claimed Free Workspace summary when applicable,
and the currently purchasable paid choices. Paid creation remains absent while
the billing catalog is inactive; the Web flow explains that state instead of
offering a control Core would reject.

### Create a paid Workspace

Choose one server-issued `quote_id` from the creation-options response. The
identifier is an Assign catalog key, not a Stripe Price ID:

```http
POST /api/v1/workspace-checkouts HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: 6f1b0d5e-1a3c-4f2b-9a4d-2c8e5b7f0a11
Content-Type: application/json

{"name":"Acme Premium","slug":"acme-premium","quote_id":"small_monthly"}
```

The response contains an opaque checkout `id`, `pending` state, expiry, and a
provider-hosted `url`. Redirect the browser to that URL. A Checkout success or
cancel return is navigation only and never proves payment.

After a success return, poll
`GET /api/v1/workspace-checkouts/{checkout_id}`. The resource belongs to the
current account; a foreign identifier returns `404`. States are `pending`,
`activating`, `activated`, `expired`, `canceled`, or `failed`. Only
`activated` includes the created Workspace summary. Assign reaches that state
after verifying and deduplicating the Stripe event and reconciling an effective
subscription. Abandoned, canceled, expired, or ineffective checkouts create no
Workspace.

## Read a Workspace

```http
GET /api/v1/workspaces/{workspace_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Any active member may read it. The `ETag` carries the Workspace revision to
use in a later `If-Match`.

An archived Workspace answers `404` for everyone except an owner, who can
still read it in order to un-archive it.

## Rename, change the URL or icon, or un-archive a Workspace

```http
PATCH /api/v1/workspaces/{workspace_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{"name": "Acme Corporation"}
```

The body carries exactly one of `name`, `slug`, `icon_url`, or `archived`.
Renaming and changing the URL or icon require `workspace:manage` — `owner` or
`admin`. The `slug`
must be a unique 1–63 character segment made of lowercase letters, numbers,
and interior hyphens. A claimed URL returns `409 workspace_url_taken`; an
invalid one returns `400 invalid_workspace_url`.

`icon_url` accepts a bounded HTTPS image URL. An empty string removes the icon
and restores the client's initials fallback.

`archived` accepts only `false`, which un-archives the Workspace and is
owner-only; archiving is the `DELETE` below.

`If-Match` carries the revision the client last observed. A stale revision is
refused with `409 revision_conflict` rather than overwriting a concurrent
edit.

## Archive a Workspace

```http
DELETE /api/v1/workspaces/{workspace_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "4"
```

Answers `204`. Archiving is **owner-only**, requires authentication within the
last 15 minutes (see
[Recent authentication](account.md#recent-authentication)), and is reversible:
nothing is deleted.

Archiving revokes every session scoped to the Workspace in the same
transaction, so access ends immediately rather than at the next expiry, and
every Workspace-scoped route then answers `404` for non-owners. Mutations
inside an archived Workspace are refused for everyone.

A caller's last remaining Workspace cannot be archived — the request is
refused `409 last_workspace` — because it would leave the account with
nowhere to sign in to.

## Add an existing member

```http
POST /api/v1/workspaces/{workspace_id}/members HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"user_id": "<user-id>"}
```

This route **reactivates a membership that already exists** in this
Workspace — someone previously removed, or who left. It cannot add a stranger:
adding a person who has never been a member is the invitation flow below.

That restriction is deliberate. A route that took an email address and either
added or rejected would tell the caller whether that address has an Assign
account, so no endpoint answers that question. A `user_id` that has no
membership here reports the same `404` as an absent resource.

## Change a membership

```http
PATCH /api/v1/workspaces/{workspace_id}/members/{member_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "2"
Content-Type: application/json

{"role": "admin"}
```

Requires `members:manage`. The body may carry `role`, `state`, or both; an
omitted field is unchanged. `state` accepts `active` and `suspended` —
removal is the `DELETE` below.

Suspending a membership revokes that member's sessions in this Workspace
immediately, in the same transaction. Reactivating does not restore them; the
member signs in again.

Callers cannot change their own membership (`422
self_membership_mutation`): self-demotion and self-suspension are accidents
rather than intentions, and locking yourself out is not recoverable from
inside the product. Ask another owner or admin.

Demoting or suspending the last active owner is refused `409 last_owner`.

## Remove a member

```http
DELETE /api/v1/workspaces/{workspace_id}/members/{member_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Answers `204`, and answers `204` again if repeated. Removal revokes the
member's sessions in this Workspace in the same transaction and **retains
their Actor**, so tasks they created, comments they wrote, and activity they
generated stay attributed rather than turning anonymous. Removing the last
active owner is refused `409 last_owner`; removing yourself is refused
`422 self_membership_mutation`.

## Invite someone by email

```http
POST /api/v1/workspaces/{workspace_id}/invitations HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: 0f2c9a71-6f4e-4d8b-8f1a-7b3e6d2c5a04
Content-Type: application/json

{"email": "jane@example.com", "role": "member"}
```

```json
{
  "invitation": {
    "id": "<invitation-id>",
    "workspace_id": "<workspace-id>",
    "email": "jane@example.com",
    "role": "member",
    "state": "pending",
    "invited_by_actor_id": "<actor-id>",
    "expires_at": "2026-08-25T09:30:00Z",
    "accepted_at": null,
    "revoked_at": null,
    "revision": 1,
    "created_at": "2026-08-18T09:30:00Z"
  },
  "token": "<one-time-token>"
}
```

Requires `members:manage`. The address is lowercased. Invitations last
**7 days**.

`role` may be `admin`, `member`, or `viewer` — **not `owner`**. Ownership
carries the archive power and the last-owner invariant, and is conferred by a
deliberate membership change on somebody already present, not by whoever opens
a link in a mailbox.

`token` is returned **once**; only its hash is stored. Assign also sends the
invited address a clickable, single-use Web action link through the configured
email provider. The email does not display a standalone token. The mutation
fails if delivery fails, rather than reporting an invitation that never reached
its recipient. A retried request carrying the same
`Idempotency-Key` replays the same body, token included, without sending a
duplicate message.

A pending invitation for the same address is refused `409 invitation_pending`
rather than silently reissued — revoke it and invite again. An address that
already belongs to an active member is refused `409 already_member`, which
discloses nothing an administrator cannot already read from the member list.

## List invitations

```http
GET /api/v1/workspaces/{workspace_id}/invitations?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Requires `members:manage`; returns one page, newest first, and never contains
a token. `state` is derived rather than stored: `expired` is computed from
`expires_at`, so an invitation that lapsed and one already swept from storage
read the same way.

## Revoke an invitation

```http
DELETE /api/v1/workspaces/{workspace_id}/invitations/{invitation_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Answers `204`, and answers `204` again if repeated. The token stops working
immediately.

## Accept an invitation

Recipients normally open the action link from their email. Opening the page
does not accept the invitation, so mail scanners and browser prefetchers cannot
consume it. The Web client removes the token from the visible URL, asks a
signed-out recipient to log in or create an account with the invited address,
then presents an explicit **Accept invitation** action. On success it switches
the browser session to the joined Workspace and opens that Workspace.

API clients may redeem the same token directly:

```http
POST /api/v1/invitations/accept HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"token": "<one-time-token>"}
```

Returns the joined Workspace. This route is **not** Workspace-scoped: the
caller is by definition not yet a member of the target Workspace.

The caller must be signed in, and their account's email address must match the
invited address. A signed-in caller whose address differs is refused `403
invitation_recipient_mismatch` — a token that worked for whoever held it would
turn a forwarded email into a Workspace membership.

An expired invitation answers `410 invitation_expired`; a revoked or already
accepted one answers `409 invitation_not_pending`. An unknown token answers
`404`.

## Errors

Beyond the shared error codes in [API conventions](conventions.md):

| Status | Code | Meaning |
| --- | --- | --- |
| `409` | `last_owner` | The change would leave the Workspace without an active owner. |
| `409` | `last_workspace` | The caller has no other Workspace to fall back to. |
| `409` | `invitation_pending` | An unaccepted invitation for that address already exists. |
| `409` | `already_member` | That address already belongs to an active member. |
| `409` | `invitation_not_pending` | The invitation was revoked or already accepted. |
| `410` | `invitation_expired` | The invitation passed its `expires_at`. |
| `403` | `invitation_recipient_mismatch` | The signed-in account is not the invited address. |
| `422` | `self_membership_mutation` | The caller tried to change their own membership. |
