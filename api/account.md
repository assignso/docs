---
description: The current user's profile, sessions, personal API tokens, linked identities and connected MCP clients.
---

# Account

These operations use an authenticated browser session (see [Authentication](./authentication)) and
follow the [API conventions](./conventions). Writes need the `X-CSRF-Token` header.

## Current user

```http
GET /api/v1/me HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Returns the user's profile and display preferences plus, once a Workspace is selected, the session's
`workspace`, your `actor_id`, your `role` and an `authorization_revision`:

```json
{
  "id": "<user-id>",
  "email": "jane@example.com",
  "display_name": "Jane Doe",
  "username": "jane",
  "profile_picture_url": null,
  "avatar_initials": null,
  "avatar_color": "indigo",
  "title": "Engineering manager",
  "totp_enabled": true,
  "name_display": "full_name",
  "first_day_of_week": "monday",
  "timezone": "Europe/Budapest",
  "locale": "en-GB",
  "date_format": "day_month_year",
  "time_format": "twenty_four_hour",
  "number_format": "comma_decimal",
  "workspace": { "id": "<workspace-id>", "name": "Acme", "slug": "acme" },
  "actor_id": "<actor-id>",
  "role": "member",
  "authorization_revision": "<opaque-revision>"
}
```

- `role` is `owner`, `admin`, `member` or `viewer`. See [Roles](./workspaces#roles).
- `authorization_revision` is an opaque value you can compare for equality to decide whether cached
  data is still valid. Never infer permissions from it.
- An account without a Workspace omits `workspace`, `actor_id`, `role` and `authorization_revision`.
- The response also includes optional fields such as `phone`, `bio` and `profile_status`, plus
  `*_inherited` flags (below). See the [OpenAPI document](/openapi.yaml) for the full schema.

## Update the profile

```http
PATCH /api/v1/me HTTP/1.1
If-Match: "3"
Content-Type: application/json

{"username": "jane_q", "title": "Staff engineer", "first_day_of_week": "sunday"}
```

Send any of `display_name`, `username`, `title`, `phone`, `bio`, `profile_status`, `name_display`,
`first_day_of_week`, `editor_controls`, `avatar_initials`, `avatar_color`, `timezone`, `locale`,
`date_format`, `time_format` and `number_format`. `If-Match` carries the revision from the last
`ETag`; a stale one returns `409 revision_conflict`. The response is the same body as `GET /me`.

| Field | Rules |
| --- | --- |
| `display_name` | 1–100 characters. |
| `username` | Unique, lowercase, 3–30 characters: letters, numbers, underscores and interior hyphens. It can change but can't be cleared. |
| `name_display` | `username` or `full_name`. Username needs a username set. |
| `first_day_of_week` | `sunday` or `monday`. |
| `editor_controls` | `contextual` or `persistent`. |
| `timezone`, `locale` | IANA identifier, BCP 47 tag. |
| `avatar_initials` | 1–2 characters. Empty derives them from the name. |
| `avatar_color` | A palette name (`slate`, `red`, `indigo`, `rose` …), optionally with a shade suffix such as `amber-400`. Without a suffix, clients pick the shade. |
| Optional text | An empty value removes it. Phone is private profile data only. |

Setting `timezone_inherited`, `locale_inherited` or `first_day_of_week_inherited` to `true` follows
the Workspace default. `GET /me` always returns the effective value.

### Change your email

```http
POST /api/v1/me/email-change
If-Match: "3"
Content-Type: application/json

{"email": "jane.new@example.com"}
```

This needs sign-in within the last 15 minutes and emails a single-use link, valid 30 minutes, to the
new address. The web app completes it with `POST /api/v1/me/email-change/verify`, from the same
browser session. On success the address changes, other sessions are revoked and the old address gets
a security notice.

### Profile picture

Crop to a 512 × 512 PNG or JPEG (5 MiB at most), upload it through the
[attachment flow](./attachments), then:

```http
POST /api/v1/me/profile-picture
If-Match: "3"
Content-Type: application/json

{"attachment_id": "<completed-attachment-id>"}
```

`DELETE /api/v1/me/profile-picture` removes it. `/api/v1/me/profile-picture/content` redirects to a
short-lived URL, so don't store the destination.

## Sessions

`GET /api/v1/me/sessions?limit=50` lists your live sessions across Workspaces, newest first:

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

Sessions don't record IP address, device or location. Tell them apart by Workspace and
`last_seen_at`.

| Operation | Result |
| --- | --- |
| `DELETE /api/v1/me/sessions` | Revokes every session except the current one. Returns `{"revoked_count": 3}`. Needs recent authentication. |
| `DELETE /api/v1/me/sessions/{session_id}` | `204`, also when already revoked. Revoking the current session clears the cookies. |

## Personal API tokens

A personal token authorizes scripts and the CLI in the one Workspace of the session that created it.
It stops working when it expires, is revoked, you leave the Workspace, or the Workspace is archived.

- `GET /api/v1/me/api-tokens` lists metadata (name, scopes, prefix, created, last used, expiry). The
  secret is never returned again.
- `DELETE /api/v1/me/api-tokens/{token_id}` revokes a token (`204`).

```http
POST /api/v1/me/api-tokens HTTP/1.1
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"name": "terminal", "scopes": ["assign:read", "assign:discuss"]}
```

Creating a token needs recent authentication. The `201` response is the only time the `token` value
is shown, so store it in a secret manager or `ASSIGN_TOKEN`, not in a URL or a file you commit. The
default expiry is 90 days, at most one year. Scope and Workspace can't be changed later.

| Scope | Allows |
| --- | --- |
| `assign:read` | Reading, including the CLI's My Work view. |
| `assign:write` | The CLI's supported Task changes. |
| `assign:discuss` | Discuss history, messages and events. Plan and permission checks still apply. |

## Linked identities

- `GET /api/v1/me/identities` lists linked providers (`provider`, `provider_email`,
  `provider_email_verified`, `created_at`).
- `POST /api/v1/me/identities` with `{"provider": "github"}` returns an `authorization_url` to send
  the user to. The provider then returns to Assign, which links the identity without creating a
  session. An identity linked to another account returns `409 identity_already_linked`.
- `DELETE /api/v1/me/identities/{identity_id}` unlinks (`204`). It returns `409 last_sign_in_method`
  if the account would have no way left to sign in.

## Recent authentication

Signing out other sessions, linking or unlinking an identity, changing a password, changing an email
and disabling a second factor need sign-in within the last **15 minutes**. Otherwise you get
`403 reauthentication_required`. Ask for the password or passkey and retry; don't show it as a
permission error.

## Connected MCP clients

`GET /api/v1/me/mcp/grants?limit=50` lists your active MCP connections: client, scopes, authorized
Workspaces and last use. `DELETE /api/v1/me/mcp/grants/{grant_id}` revokes one immediately (`204`).
See [MCP](../mcp/).

## Workspaces and members

`GET /api/v1/me/billing-plans` is a read-only overview of the plan and state of each Workspace you
belong to (up to 100 per page), and whether you can open its billing settings. Payment and invoice
details stay in Workspace billing settings.

```http
GET /api/v1/workspaces?limit=50 HTTP/1.1
```

```json
{
  "items": [
    { "id": "<workspace-id>", "name": "Acme", "slug": "acme", "icon_url": null, "role": "owner" }
  ],
  "next_cursor": null,
  "has_more": false
}
```

This lists your Workspaces by name, regardless of the session's current one.
`GET /api/v1/workspaces/{workspace_id}/members?limit=50` lists the current Workspace's members for
assignee pickers and mentions (`membership_id`, `user_id`, `actor_id`, `display_name`, `role`). Any
other Workspace ID returns `404`.

## Project shortcuts

Each user has nine shortcut slots for their Projects in a Workspace. `GET
/api/v1/workspaces/{workspace_id}/project-shortcuts` returns them as Project IDs or `null`, with
`customized`, `revision` and an `ETag`. Until you customize them, they default to the first nine
active Projects you can read.

`PUT` on the same path replaces all nine:

```http
PUT /api/v1/workspaces/{workspace_id}/project-shortcuts HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "4"
Content-Type: application/json

{"slots": ["<project-id>", null, null, null, null, null, null, null, null]}
```

A Project can occupy one slot. Duplicates are rejected, a stale revision returns
`409 revision_conflict`, and an archived or unreadable Project returns `422 project_unavailable`.
Reads drop Projects you can no longer access.

## Project display preferences

Your Projects-page sort and custom order belong to your Account within one Workspace. They do not
change shared Project ranks or anyone else's order.

```http
GET /api/v1/workspaces/{workspace_id}/project-display-preferences
```

The response includes `workspace_id`, `sort` (`default`, `recent`, `created` or `custom`),
`project_ids`, `revision` and `updated_at`. A new preference starts at `default`, an empty sequence
and revision 1. Projects you can no longer read are removed from the saved sequence.

```http
PUT /api/v1/workspaces/{workspace_id}/project-display-preferences
If-Match: "1"
Idempotency-Key: 80ce2510-8436-438a-aedc-82aa94af58b0
X-CSRF-Token: <session-csrf-token>
Content-Type: application/json

{"sort":"custom","project_ids":["0199a020-1234-7000-8000-000000000001"]}
```

Send the complete preference, with up to 1,000 unique readable Project IDs from the named Workspace.
The body limit is 64 KiB. Use the last `ETag` as `If-Match`; a stale revision returns `409` and a
missing precondition returns `428`. Missing or unavailable Projects return `422` without revealing
private Project details. Retry an identical request with the same idempotency key. Both operations
currently require a browser session; token, native-client and MCP access are not available.

## Private realtime reads <Badge type="warning" text="Upcoming" />

Current-Account, session, identity and passkey reads can opt into private replay
custody using the matching `X-Assign-Realtime-Baseline` scope. This interface is
under development and not deployed. See [Application realtime](./realtime) for
canonical reads, session-bound cursors and applied acknowledgements.
