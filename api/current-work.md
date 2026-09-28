---
description: Read and set the one Task you're working on, across Workspaces.
---

# Current work

Current work is your account-wide pointer to zero or one Task. It's independent of the open Workspace
or page, Task status and time tracking.

- `GET /api/v1/me/current-work` returns the current Task (or `null`), its revision, the update time and
  whether any eligible Task exists. It isn't cached, and the revision is in `ETag`.
- `GET /api/v1/me/current-work/candidates?limit=25` lists up to 25 eligible alternatives, most recently
  updated first, never including the current Task. A Task is eligible if it's active, in an In
  progress category, assigned to you and readable through your Workspace and Project membership.
- `PUT /api/v1/me/current-work` with `{"task_id": "..."}` sets it, and `DELETE` clears it. Both need
  `X-CSRF-Token` and the last `ETag` in `If-Match`.

A concurrent change returns `409 revision_conflict` and an ineligible Task `409 task_not_eligible`.
Re-read before retrying. Changing current work never changes Task status or starts a timer. Assign
clears it when assignment, workflow, lifecycle, membership or Project access makes it ineligible.
