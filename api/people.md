# People profiles

People are workspace-scoped collaboration profiles. Any member who can see a
workspace member can open that person’s profile; profiles never expose account
email or personal account settings.

## Read a profile

```http
GET /api/v1/workspaces/{workspace_id}/people/{username}
```

The response includes the person’s display name, current username, current workspace role,
active status, a workspace actor ID, and an `is_you` flag. Use the actor ID
with the normal Workspace Task list (`assignee_actor_id`) to show that
person’s permitted assigned work.

## Read person activity

```http
GET /api/v1/workspaces/{workspace_id}/people/{username}/activity?limit=50
```

This is a cursor-paginated collaboration feed, not an audit log. It uses the
same redaction and current-access rules as Workspace activity. If a person is
not an active visible member, both requests return the normal `404` response.

Usernames are globally unique, lowercase 3–30 character handles. They may
change, but every previously claimed handle remains reserved to the same
account and continues to resolve. Legacy UUIDv7 profile references are accepted
during migration; the Web app replaces an authorized legacy URL with the
person's current username. A username is never an authorization credential.

The authenticated person profile loads this feed independently from the
identity and assigned-work sections. Loading, empty, failure, and continuation
states therefore do not replace or disclose data from the rest of the profile.
