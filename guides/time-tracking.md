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

The public API has operations for the Workspace policy, Task entries, Task and Project totals, bounded Project Task groups, manager-only Project Task entries, contributor groups, your
timesheet and CSV export. See the [endpoint index](../api/endpoints#time-tracking) and the
[OpenAPI document](/openapi.yaml). Before a Workspace saves its first policy, the policy read reports
revision `0`, so send `If-Match: "0"` on the first update. Later updates use the revision from the
preceding read.
The four Project report reads return `X-Assign-Report-Revision`. Compare this
value across totals, Task groups, contributor groups, selected Task entries and
all continuation pages for one range; restart the whole range if it differs.

Running timers, payroll, approvals, Agent-written entries and provider report synchronization aren't
included.
