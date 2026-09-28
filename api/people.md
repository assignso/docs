---
description: Read a Workspace member's public profile and activity.
---

# People

People profiles are Workspace-scoped. Any member who can see a member can open their profile. It shows
the title, bio and status they chose to publish, and never their email, phone or other account
settings.

## Read a profile

```http
GET /api/v1/workspaces/{workspace_id}/people/{username}
```

The response has the display name, current username, Workspace role, active status, a Workspace
`actor_id`, an `is_you` flag and the optional `title`, `bio` and `profile_status` (each `null` if
unset). It also has `profile_picture_url`, `avatar_initials` (`null` derives them from the name) and
`avatar_color`. Use the actor ID as `assignee_actor_id` in [Task lists](./tasks#list) to show their
work.

The picture URL is an Assign route,
`/api/v1/workspaces/{workspace_id}/people/{user_id}/profile-picture/content`. It rechecks membership
and redirects to a short-lived URL, or returns `404` if unavailable.

Usernames are globally unique, lowercase, 3–30 characters. They can change, but every claimed handle
keeps resolving to the same account. Legacy UUID references still resolve and the web app replaces
them with the current username. A username never grants access.

## Read activity

`GET /api/v1/workspaces/{workspace_id}/people/{username}/activity?limit=50` returns a cursor-paginated
feed with the same redaction and access rules as [Activity](./activity). An inactive or invisible
person returns `404`.
