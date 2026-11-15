---
description: Read a Workspace member's profile, picture and visible activity.
---

# People

<Badge type="warning" text="Awaiting deployment" />

Use a [supported bearer credential](./authentication) with current Workspace access and permission
to view the active member. Profile and picture reads require `people:read` or general read. Activity
reads require `activity:read` or general read.

For `401`, renew your credential. For `404`, check the Workspace, the person's identifier and your
current access. Hidden, inactive and unavailable members also return `404`.

## Read a profile

Use [Get a person's profile](./reference/operations/getworkspacepersonprofile) with the member's
`username` from [List Workspace members](./reference/operations/listworkspacemembers).
Current and historical usernames resolve to the same account. Legacy links can use a User UUIDv7.

Use the returned `actor_id` as `assignee_actor_id` in [Task lists](./tasks#list). The optional
`title`, `bio` and `profile_status` are `null` when unset. The profile omits private account
information such as email and phone.

## Read a profile picture

For an uploaded picture, request the profile's Assign `profile_picture_url` or supply its
`user_id` to [Get a profile picture](./reference/operations/getworkspacepersonprofilepicture).
The Assign response is a bodyless `302` with a short-lived `Location` and
`Cache-Control: private, no-store`. Follow `Location` without the Assign credential. If the URL
expires, request a fresh redirect from Assign.

If the profile supplies an external HTTPS image URL, request it without the Assign credential.
When no picture is available, use the avatar fields. If `avatar_initials` is `null`, derive the
initials from the display name.

## Read activity

Use [List a person's visible Activity](./reference/operations/listworkspacepersonactivity) with
the member's `username`. The page contains human-readable [Activity](./activity) that you have
permission to see. Each response contains `data` and `next_cursor`.

Keep the same credential, Workspace, username and page size while following `next_cursor`. Continue
after short or empty pages when a cursor is present. If Assign returns `400 invalid_cursor`, restart
from the first page without a cursor.
