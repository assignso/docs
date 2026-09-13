# Workspace governance

Creating a Workspace, managing who belongs to it, inviting people by email,
and archiving it. The browser operations below require an authenticated browser session
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

{"label":"Ready for review","category":"in_review"}
```

The new Status appends to the Workspace-wide workflow and returns `201` with
its `ETag`. Clients do not supply a position. Labels are 1–100 characters and
categories are `backlog`, `todo`, `in_progress`, `in_review`, or `done`.
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
in the same transaction, and replaces both browser-session cookies with a
session scoped to the new Workspace. Concurrent bootstrap attempts are
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

{"name": "Acme"}
```

```json
{
  "id": "<workspace-id>",
  "name": "Acme",
  "slug": "acme",
  "revision": 1,
  "archived_at": null,
  "created_at": "2026-08-18T09:30:00Z",
  "updated_at": "2026-08-18T09:30:00Z"
}
```

The caller becomes its first `owner`. `name` is trimmed and must be 1 to 100
characters. `slug` is derived from the name and made unique. An owner or admin
can later choose a different canonical URL segment.

Creating a Workspace does not switch the calling session into it — see
[Switch the session's Workspace](authentication.md#switch-the-sessions-workspace).

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

## Rename, change the URL, or un-archive a Workspace

```http
PATCH /api/v1/workspaces/{workspace_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{"name": "Acme Corporation"}
```

The body carries exactly one of `name`, `slug`, or `archived`. Renaming and
changing the URL require `workspace:manage` — `owner` or `admin`. The `slug`
must be a unique 1–63 character segment made of lowercase letters, numbers,
and interior hyphens. A claimed URL returns `409 workspace_url_taken`; an
invalid one returns `400 invalid_workspace_url`.

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
one-time token to the invited address through the configured email provider.
The mutation fails if delivery fails, rather than reporting an invitation that
never reached its recipient. A retried request carrying the same
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

```http
POST /api/v1/invitations/accept HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"token": "<one-time-token>"}
```

Returns the created membership. This route is **not** Workspace-scoped: the
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

## Native Workspace creation

First-party native clients can use `GET /api/v1/mobile/workspace-creation-options`
to read account Free Workspace eligibility and `POST /api/v1/mobile/workspaces`
with `{ "name": "My workspace", "slug": "my-workspace" }` to create it. Send the
native access token as a Bearer token and a unique `Idempotency-Key` for creation;
reuse that key for retries of the same payload. These endpoints reject browser
cookies and do not require CSRF. The slug is optional in the API.

Membership in another Workspace does not consume Free eligibility. An existing
active Free claim returns `409 free_workspace_claim_unavailable`. Creation returns
the Workspace without changing the current selection; select it explicitly.
The mobile profile menu's **Switch Workspace** opens a drawer with **Create Workspace**;
the form shows **Open Workspace** after success. Paid creation is not yet supported
natively. The existing browser creation and checkout workflows are unchanged.
