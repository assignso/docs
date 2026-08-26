# Current work

Current work is the signed-in User's account-wide pointer to zero or one Task.
It is independent of the active Workspace, the page currently open, Task
status, and time tracking.

`GET /api/v1/me/current-work` returns the nullable current Task, the
current-work revision, its update time, and whether any eligible Task exists.
The response is private, uses `Cache-Control: no-store`, and returns its
revision in `ETag`.

`GET /api/v1/me/current-work/candidates?limit=25` lists the most recently
updated eligible alternatives. A Task is eligible only while it is active, in
an In progress workflow category, assigned to the current User, and readable
through an active Workspace and Project membership. The list never includes
the selected Task and never exceeds 25 items.

Set the selection with `PUT /api/v1/me/current-work` and
`{"task_id":"..."}`. Clear it with `DELETE /api/v1/me/current-work`. Both
mutations require the browser CSRF header and the last observed current-work
ETag in `If-Match`. A concurrent change returns `409 revision_conflict`; an
ineligible target returns `409 task_not_eligible`. Re-read the summary before
retrying either conflict.

Changing or clearing current work does not change Task status and never starts
or stops a timer. Assign clears a selection when assignment, workflow,
lifecycle, membership, or private-Project access makes it ineligible.
