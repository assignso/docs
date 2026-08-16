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

Returns the authenticated user, the session's current Workspace, the
caller's Actor within it, and their role:

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

`role` is one of `owner`, `admin`, or `member`. To act in a different
Workspace the caller belongs to, switch the session first — see
[Switch the session's Workspace](authentication.md#switch-the-sessions-workspace).

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
