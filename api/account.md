# Account and Workspaces

These operations require an authenticated browser session (see
[Browser authentication](authentication.md)) and follow the shared
[API conventions](conventions.md).

## Read the current user and Workspace

```http
GET /api/v1/me HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns the authenticated user and, when selected, the session's current
Workspace, the caller's Actor within it, and their role:

```json
{
  "id": "<user-id>",
  "email": "jane@example.com",
  "display_name": "Jane Doe",
  "username": "jane",
  "profile_picture_url": "https://cdn.example.com/jane.jpg",
  "avatar_initials": null,
  "avatar_color": "indigo",
  "title": "Engineering manager",
  "phone": "+36 30 123 4567",
  "bio": "Building calm collaboration tools.",
  "profile_status": "Heads-down until 15:00",
  "totp_enabled": true,
  "name_display": "full_name",
  "first_day_of_week": "monday",
  "first_day_of_week_inherited": false,
  "editor_controls": "contextual",
  "timezone": "Europe/Budapest",
  "timezone_inherited": false,
  "locale": "en-GB",
  "locale_inherited": false,
  "date_format": "day_month_year",
  "time_format": "twenty_four_hour",
  "number_format": "comma_decimal",
  "workspace": {
    "id": "<workspace-id>",
    "name": "Acme",
    "slug": "acme"
  },
  "actor_id": "<actor-id>",
  "role": "member",
  "authorization_revision": "<opaque-revision>"
}
```

`role` is one of `owner`, `admin`, `member`, or `viewer`; see
[Roles](workspaces.md#roles). To act in a different
Workspace the caller belongs to, switch the session first — see
[Switch the session's Workspace](authentication.md#switch-the-sessions-workspace).
`authorization_revision` is an opaque cache-admission value for this exact Actor
and Workspace. It changes when the Actor's visible private projection may change.
Clients may compare it for equality before displaying persisted data, but must
never infer permissions from it; every request remains server-authorized.

A newly registered account-only session has no selected Workspace. Its response
contains the account and interface-preference fields shown above;
`workspace`, `actor_id`, `role`, and `authorization_revision` are omitted until the first
Workspace is created. The username is allocated from the full name during registration.
Optional `profile_picture_url` and `title` values may be `null`.
`avatar_initials` (1–2 characters, `null` derives letters from the full name)
and `avatar_color` (a Tailwind color family name such as `indigo`, from the
same vocabulary as label colors, random at registration) drive the two-letter SVG avatar shown without a picture.
`totp_enabled` is read-only and true only after an authenticator-app setup has
been confirmed; clients use it to render the correct setup, recovery-code, or
disable state and must still rely on the security endpoints for authorization.

## Review Workspace plans

`GET /api/v1/me/billing-plans` returns a cursor-paginated Account → Billing & plans
overview with at most 100 active Workspace memberships per page. Each row contains the
Workspace identity, the current user's relationship, that Workspace's
independent plan and canonical lifecycle state, and whether the relationship
may navigate to Workspace billing management. The response also reports
whether another slot in the account's three-Free-Workspace allowance is available.

This is a read-only overview, not an account subscription. It omits payment,
invoice, tax, billing-contact, provider-customer, and entitlement detail and
never becomes a cross-Workspace mutation boundary. Sensitive controls remain
under Workspace Settings → Billing and require `workspace.billing.manage` plus
recent authentication.

## Synchronize Project shortcuts

`GET /api/v1/workspaces/{workspace_id}/project-shortcuts` returns the current
user's nine Project-shortcut slots for the session's selected Workspace. Each
slot is either a Project UUID or `null`; a Project can occupy only one slot.
The response includes `customized`, a positive `revision`, `updated_at`, and an
`ETag`. When no custom value exists, the server creates a default from the first
nine active Projects the user can read and reports `customized: false`.

`PUT /api/v1/workspaces/{workspace_id}/project-shortcuts` replaces all nine
slots. Send the previous response revision in `If-Match`, the browser CSRF
token, and exactly nine UUID-or-null values:

```http
PUT /api/v1/workspaces/{workspace_id}/project-shortcuts HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "4"
Content-Type: application/json

{"slots":["<project-id>",null,null,null,null,null,null,null,null]}
```

The server rejects duplicate or malformed assignments, returns
`409 revision_conflict` for a stale revision, and returns
`422 project_unavailable` when a selected Project is archived or no longer
readable. Reads remove inaccessible, archived, or deleted Projects before
returning the current set, so every device receives the same authorized view.

## Update the current profile

```http
PATCH /api/v1/me HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{"username": "jane_q", "title": "Staff engineer", "first_day_of_week": "sunday"}
```

The request may contain one or more of `display_name`, `username`, `title`,
`phone`, `bio`, `profile_status`, `name_display`, `first_day_of_week`,
`editor_controls`, `avatar_initials`, `avatar_color`,
`timezone`, `locale`, `date_format`, `time_format`, `number_format`, and the
synchronized Voice preferences. Full names are 1–100 characters. Usernames are
globally unique,
lowercase, 3–30 characters, and use letters, numbers, underscores, or interior
hyphens. A username may change, but every successfully claimed value remains
reserved to the same account so old profile links cannot be transferred. The
username cannot be cleared. An empty optional profile text value removes it.
An empty `avatar_initials` clears the letters override; `avatar_color` always
carries one of `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`,
`amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`,
`indigo`, `violet`, `purple`, `fuchsia`, `pink`, or `rose`; clients choose the
rendered shade.
`name_display` is `username` or `full_name`, and username display requires a
selected username. `first_day_of_week` is `sunday` or
`monday`. `editor_controls` is `contextual` or `persistent` and changes only
the formatting-control presentation across Document, Task-description, and
Comment editors. `timezone` uses an IANA identifier and `locale` uses BCP 47.
Phone is private, unverified profile metadata: it is not used for sign-in,
MFA, recovery, SMS, or notification delivery.

`timezone_inherited`, `locale_inherited`, and
`first_day_of_week_inherited` explicitly select the current Workspace's
corresponding default. Existing Accounts retain concrete preferences until a
User enables inheritance. A `GET /me` response always returns the effective
timezone, locale, and first day plus the inheritance flags, so presentation
consumers do not need to fetch Workspace settings separately. Setting a flag
false keeps the supplied concrete Account value.

Changing the primary email is deliberately separate from profile editing:

```http
POST /api/v1/me/email-change
If-Match: "3"
Content-Type: application/json

{"email":"jane.new@example.com"}
```

The request requires authentication within the last 15 minutes and sends a
30-minute, single-use link to the new inbox. The old address remains active.
The link opens the supported Web client, which removes its token from browser
history and calls `POST /api/v1/me/email-change/verify` with that token. Only
the same browser session can complete it. Success changes the verified address,
invalidates pending identity/password tokens, revokes other sessions, and
sends a security notice to the old address.

`If-Match` carries the user revision the client last observed, taken from the
`ETag` of a previous `GET` or `PATCH` of `/api/v1/me`. A stale revision is
refused with `409 revision_conflict` rather than overwriting a concurrent
edit. The response is the same body `GET /api/v1/me` returns, with the new
revision in its `ETag`.

## Profile picture uploads

Profile pictures use the normal direct-to-S3 attachment reservation and
completion flow. Crop the image to a 512 × 512 PNG or JPEG before upload; the
completed object must be clean and no larger than 5 MiB. Associate it with:

```http
POST /api/v1/me/profile-picture
If-Match: "3"
Content-Type: application/json

{"attachment_id":"<completed-attachment-id>"}
```

`DELETE /api/v1/me/profile-picture` removes it. Replacement and removal
soft-delete the previous object and release its storage quota. The stable
authenticated `/api/v1/me/profile-picture/content` URL redirects to a short-lived
inline S3 credential; clients must not persist the signed destination URL.

## List current-user sessions

```http
GET /api/v1/me/sessions?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns the caller's live sessions across every Workspace, newest first.
Revoked and expired sessions are omitted:

```json
{
  "items": [
    {
      "id": "<session-id>",
      "workspace_id": "<workspace-id>",
      "current": true,
      "created_at": "2026-08-18T09:30:00Z",
      "authenticated_at": "2026-08-18T09:30:00Z",
      "last_seen_at": "2026-08-18T10:05:00Z",
      "idle_expires_at": "2026-08-25T10:05:00Z",
      "absolute_expires_at": "2026-09-17T09:30:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

Sessions carry no IP address, user agent, device name, or location: none is
recorded. An account-only onboarding session omits `workspace_id`. Otherwise,
distinguish sessions by Workspace and `last_seen_at`, and use `current`
to identify the session making the request.

`authenticated_at` is when credentials were last actually presented. Staying
signed in does not move it, and it is the value the 15-minute
recent-authentication window below is measured against.

## Manage personal API tokens

Personal API tokens authorize non-interactive API and CLI use in the one
Workspace selected by the current browser session. They are separate from
browser sessions and MCP connections. A token stops working if it expires, is
revoked, the user loses that Workspace membership, or the Workspace is
archived.

List active tokens with `GET /api/v1/me/api-tokens`. The response contains
only metadata (name, scopes, prefix, creation, last-use, and expiry times),
never a token secret.

Create one with recent authentication and CSRF protection:

```http
POST /api/v1/me/api-tokens HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"name":"terminal","scopes":["assign:read","assign:discuss"]}
```

The `201` response is the only time the raw `token` is returned. Store it in a
secret manager or `ASSIGN_TOKEN`; do not place it in a URL, terminal command,
or checked-in file. The default expiry is 90 days and the maximum requested
expiry is one year. `assign:read` permits the shipped CLI My Work view;
`assign:write` permits the CLI's supported Task mutations; and
`assign:discuss` permits canonical Discuss history, messages, events,
cancellation, and interaction decisions. The Discuss availability and
Workspace authorization checks still apply.

Revoke a token with `DELETE /api/v1/me/api-tokens/{token_id}` and the same
CSRF header. It returns `204`; future API-host bearer requests fail
immediately. Revoke a token rather than sharing it or trying to rename its
scope or Workspace (those properties are immutable).

## Sign out everywhere else

```http
DELETE /api/v1/me/sessions HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Revokes every session belonging to the caller except the one making the
request, and reports how many changed:

```json
{"revoked_count": 3}
```

Revocation takes effect immediately everywhere. Repeating the call revokes
nothing further and reports `0`. To end the current session as well, call
[sign out](authentication.md) afterwards.

This operation requires authentication within the last 15 minutes; see
[Recent authentication](#recent-authentication).

## Revoke one session

```http
DELETE /api/v1/me/sessions/{session_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Answers `204`. Revoking the calling session is allowed, and the response then
also expires the session and CSRF cookies. Revoking a session that is already
revoked also answers `204`, so a retried request is safe. A session that is
not the caller's reports the same `404` used for an absent resource.

## List linked identities

```http
GET /api/v1/me/identities HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

```json
{
  "items": [
    {
      "id": "<identity-id>",
      "provider": "google",
      "provider_email": "jane@example.com",
      "provider_email_verified": true,
      "created_at": "2026-08-18T09:30:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

The provider's subject identifier is never returned. `provider_email` is the
address the provider disclosed, if any, and may be `null`. During ordinary
provider sign-in, a verified provider email matching the account's normalized
address can establish ownership and attach a previously unseen provider
identity. An unverified address cannot.

## Link an external identity

```http
POST /api/v1/me/identities HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"provider": "github"}
```

```json
{
  "authorization_url": "https://github.com/login/oauth/authorize?...",
  "expires_at": "2026-08-18T09:45:00Z"
}
```

Send the user to `authorization_url`. The endpoint never accepts a provider
token or identity assertion — the ceremony state is created server-side and
bound to the calling user and session, so no client-supplied credential can
decide who owns an account. The provider then returns to Assign's existing
callback, which completes the link and redirects to the identity settings
page rather than issuing a new session.

An identity already linked to a different account is refused with
`409 identity_already_linked` and is never transferred. This explicit ceremony
is bound to the already authenticated account and does not choose its target
from the provider email. Linking an identity already linked to the caller
changes nothing. Ordinary sign-in may separately attach a previously unseen
identity when its provider verifies the same normalized account email; see
[Sign in with an identity provider](authentication.md#sign-in-with-an-identity-provider).

This operation requires authentication within the last 15 minutes; see
[Recent authentication](#recent-authentication).

## Unlink an external identity

```http
DELETE /api/v1/me/identities/{identity_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Answers `204`. If removing the identity would leave the account with no way
to sign in — counting a password, each registered passkey, and each remaining
linked identity — the request is refused with `409 last_sign_in_method`.
Repeating a delete that already succeeded answers `204`; an identity that is
not the caller's reports `404`.

This operation requires authentication within the last 15 minutes; see
[Recent authentication](#recent-authentication).

## Recent authentication

Some operations change how an account can be accessed, and require that
credentials were presented within the last **15 minutes**: signing out every
other session, linking an identity, unlinking an identity, changing a
password, and disabling a second factor.

Staying signed in does not satisfy this; only a fresh sign-in does. When it is
not satisfied the response is `403` with the code
`reauthentication_required`, which is deliberately distinct from an ordinary
permission error — prompt for the password or passkey and retry rather than
telling the user they lack access.

## Manage connected MCP clients

```http
GET /api/v1/me/mcp/grants?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns a cursor-bounded list of the current user's active MCP connections,
including the reviewed client family, granted scopes, authorized Workspaces,
last use, and refresh-grant expiry. Assign clients refresh short-lived access
tokens silently, so an active connection does not require frequent browser
reauthorization.

```http
DELETE /api/v1/me/mcp/grants/{grant_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Answers `204` and immediately revokes the connection's access and refresh
tokens. A grant belonging to another user reports the same `404` as an absent
grant. See [Connect an MCP client](../mcp/index.md) for the client authorization and
session lifecycle.

## List current-user Workspaces

```http
GET /api/v1/workspaces?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one page of the caller's active Workspace memberships, ordered by
Workspace name:

```json
{
  "items": [
    {"id": "<workspace-id>", "name": "Acme", "slug": "acme", "icon_url": null, "role": "owner"}
  ],
  "next_cursor": null,
  "has_more": false
}
```

Follow `next_cursor` per the pagination rules in [API conventions](conventions.md).
This list is scoped to the caller, not to the session's current Workspace.

## List Workspace members

```http
GET /api/v1/workspaces/{workspace_id}/members?limit=50 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns one page of the Workspace's active memberships, for assignee
pickers and mention candidates:

```json
{
  "items": [
    {
      "membership_id": "<membership-id>",
      "user_id": "<user-id>",
      "actor_id": "<actor-id>",
      "display_name": "Jane Doe",
      "role": "owner"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

`workspace_id` must match the caller's current session Workspace; any other
value — including a Workspace the caller belongs to under a different
session — reports the same `404` used for an absent Workspace, per the
conventions' discoverability rule.
