---
description: Log time on Tasks, review timesheets and export CSV, and connect Toggl Track or Clockify.
---

# Time tracking

Time tracking is optional per Workspace. An administrator turns it on in **Workspace settings →
Features**, then chooses exact reporting or upward rounding to 15 or 30 minutes under **Work management
→ Time tracking**. Every entry keeps its exact duration, and the policy only sets the reportable one.

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

The selected range can contain up to 800 entries. If a wider range exceeds that
limit, choose shorter dates and retry the report or CSV export.

Task time ledgers can show up to 800 entries. If a Task exceeds that limit, its
time ledger and totals show an error with a retry action instead of a partial list.

The initial range is your current week according to your Account timezone and
first-day-of-week preference. Work dates are shown using your Account locale and
date format. The date field itself remains a calendar date and is never shifted
when you travel or change time zones.

## Project reports

When Time tracking is on, open a Project's **Reports** tab and select a date
range. The report shows exact and reportable totals and Task and contributor
breakdowns. Contributor details are available to Project managers; other Project
readers see a redacted contributor section. Project managers can open a Task's
recorded entries to see their dates, contributors, durations, and notes. Time
remains attributed to the Project where it was recorded if a Task later moves.
If a Task is no longer available, its recorded time remains in the totals.
If the selected range changes while its pages load, the report refreshes the
whole range before showing it. An incomplete or changing range stays unavailable
until a consistent read succeeds.

## Toggl Track and Clockify

Owners and admins can connect Toggl Track or Clockify under **Integrations** and bind a provider
project to an Assign Project. A confirmed action then creates one completed time entry of at most 24
hours on that project. Connecting or binding imports no history and starts no timer or synchronization.
See [Integrations](../api/integrations#providers).

## API

The [Time tracking API reference](/api/reference/time-tracking) is Upcoming. Use it to plan
an integration with the Workspace policy, Task time entries, Project reports and personal
timesheets. The [endpoint index](../api/endpoints#time-tracking) links to the OpenAPI download.

- [Read the policy](/api/reference/operations/gettimetrackingpolicy) before
  [changing it](/api/reference/operations/updatetimetrackingpolicy). Keep the opaque ETag
  and its response encoding for `If-Match`. A Workspace with no saved policy reports revision `"0"`.
- [Record time](/api/reference/operations/createtasktimeentry) against a Task.
  To correct or void an entry, get its item validator from the
  [entry list](/api/reference/operations/listworkspacetimeentries).
  Keep the original idempotency key, request and condition for recovery after a lost response.
- [Read your timesheet as JSON](/api/reference/operations/getmytimesheet) and copy its
  `report_revision` into the [CSV export request](/api/reference/operations/createtimesheetexport)
  for the same dates. The response includes a download link. The snapshot expires after seven days.
- Compare `X-Assign-Report-Revision` across Project totals, groups and entry pages for the same date
  range. Restart the range if the value changes.

Running timers, payroll, approvals, Agent-written entries and provider report synchronization aren't
included.
