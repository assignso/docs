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
  "workspace": {
    "id": "<workspace-id>",
    "name": "Acme",
    "slug": "acme"
  },
  "actor_id": "<actor-id>",
  "role": "member"
}
```

`role` is one of `owner`, `admin`, `member`, or `viewer`; see
[Roles](workspaces.md#roles). To act in a different
Workspace the caller belongs to, switch the session first — see
[Switch the session's Workspace](authentication.md#switch-the-sessions-workspace).

A newly registered account-only session has no selected Workspace. Its response
contains only `id`, `email`, and `display_name`; `workspace`, `actor_id`, and
`role` are omitted until the first Workspace is created.

## Update the current profile

```http
PATCH /api/v1/me HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{"display_name": "Jane Q. Doe"}
```

`display_name` is the only editable profile field. It is trimmed before
validation and must be 1 to 100 characters. Changing an email address is a
verification flow that has to prove control of the new mailbox, not a profile
edit, and it is not available in this version.

`If-Match` carries the user revision the client last observed, taken from the
`ETag` of a previous `GET` or `PATCH` of `/api/v1/me`. A stale revision is
refused with `409 revision_conflict` rather than overwriting a concurrent
edit. The response is the same body `GET /api/v1/me` returns, with the new
revision in its `ETag`.

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
address the provider disclosed, if any, and may be `null`; it never
establishes ownership of an Assign account on its own.

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
`409 identity_already_linked` and is never transferred; matching email
addresses never establish ownership. Linking an identity already linked to
the caller changes nothing.

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
    {"id": "<workspace-id>", "name": "Acme", "slug": "acme", "role": "owner"}
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
