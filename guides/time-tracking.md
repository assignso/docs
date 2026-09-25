# Time tracking

Time tracking is optional for each Workspace. A Workspace administrator enables
it in **Workspace settings → Features**, then opens **Work management → Time tracking**
to choose exact reporting or upward rounding to 15 or 30 minutes. Exact duration is
retained for every entry; the policy only determines its reportable duration.

## Log time on a Task

Open a Task and select **Log time** in its properties. Enter a completed
duration, work date, and optional note. Durations accept combinations of
minutes, hours, days, and weeks, such as `45m`, `1h 15m`, `1d`, or `1w 2d 3h`.

- `1d` is eight hours.
- `1w` is five eight-hour days.
- Time is attached to one Task and rolls up to that Task's Project.
- A disabled Workspace retains prior entries but rejects new ones.

## Timesheets

When time tracking is enabled, **Timesheets** appears in the Workspace sidebar
immediately after Inbox. Press `T` to open it, or select it from the sidebar,
then choose a bounded date range, review your reportable and exact totals, and
download the same range as CSV. The CSV includes the work date, Project, Task,
reportable and exact seconds, and optional note.

The initial range is your current week according to your Account timezone and
first-day-of-week preference. Work dates are shown using your Account locale and
date format. The date field itself remains a calendar date and is never shifted
when you travel or change time zones.

## Toggl Track integration

A Workspace Owner or Admin can open **Integrations → Toggl Track** and connect
the default Toggl Track Workspace with the personal API token shown on their
Toggl Track profile. Toggl does not provide a limited Assign OAuth scope for
this API, so the page clearly identifies that the token carries the connecting
person's Toggl permissions. Assign validates it directly with Toggl, sends it
only in the authenticated connection request, and stores it in the encrypted
server vault; it is never placed in a URL or saved in browser storage.
If a connection attempt fails, the page clears the token and shows Assign's
safe server-reported reason. A provider-unavailable message means the Assign
operator must enable the Toggl adapter and encrypted integration vault; the
personal Toggl token does not belong in server runtime configuration.

After connecting, select an active Toggl Project and bind it to an Assign
Project. A confirmed integration action can then create one completed Toggl
time entry of at most 24 hours against that exact binding. Connecting or binding
does not import history, start a timer, enable a webhook, or synchronize
timesheets. Disconnecting removes Assign's encrypted copy. Rotate the token in
Toggl Track if it may exist anywhere else or if the connecting person's access
changes.

## API

The public API provides Workspace policy, Task-entry, Task/Project-total,
personal-timesheet, and CSV-export operations under `/api/v1`. See the
machine-readable [OpenAPI contract](../api/endpoints.md#time-tracking) for request
and response schemas.

Before a Workspace has stored its first policy, the policy read reports
bootstrap revision `0`; use `If-Match: "0"` for that first policy update.
Later updates use the positive revision returned by the preceding read.

Running timers, payroll workflows, approvals, automatic Agent-written entries,
and provider report synchronization are not part of this release.
