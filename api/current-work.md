---
description: Read and set the one Task you're working on, across Workspaces.
---

# Current work

Current work is your account-wide pointer to zero or one Task. It's independent of the open Workspace
or page, Task status and time tracking.

- `GET /api/v1/me/current-work` returns the current Task (or `null`), its decimal-string revision,
  the update time and whether any eligible Task exists. Responses use private, no-store caching
  policy and an opaque item `ETag`; a numeric revision is not that validator.
- `GET /api/v1/me/current-work/candidates?limit=25` lists up to 25 eligible alternatives, most recently
  updated first, never including the current Task. A Task is eligible if it's active, in an In
  progress category, assigned to you and readable through your Workspace and Project membership.
- `PUT /api/v1/me/current-work` with `{"task_id": "..."}` sets it, and `DELETE` clears it. Both need
  a product bearer credential, the exact opaque item `ETag` from the current read in `If-Match`
  with its original encoding, and an `Idempotency-Key`. Clearing takes no request body.

A stale condition returns `412`, a missing one `428`, and a malformed or weak one `400`.
An ineligible Task returns `409 task_not_eligible`. Recover an uncertain write using its original
body, condition and key before making a new deliberate command. A credential cannot disclose or
select a Task outside its authorized Workspace and resource access.

Changing current work never changes Task status or starts a timer. Assign
clears it when assignment, workflow, lifecycle, membership or Project access makes it ineligible.
