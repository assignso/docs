# People profiles

People are workspace-scoped collaboration profiles. Any member who can see a
workspace member can open that person’s profile; profiles never expose account
email or personal account settings.

## Read a profile

```http
GET /api/v1/workspaces/{workspace_id}/people/{user_id}
```

The response includes the person’s display name, current workspace role,
active status, a workspace actor ID, and an `is_you` flag. Use the actor ID
with the normal Workspace Task list (`assignee_actor_id`) to show that
person’s permitted assigned work.

## Read person activity

```http
GET /api/v1/workspaces/{workspace_id}/people/{user_id}/activity?limit=50
```

This is a cursor-paginated collaboration feed, not an audit log. It uses the
same redaction and current-access rules as Workspace activity. If a person is
not an active visible member, both requests return the normal `404` response.
