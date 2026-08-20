# Time tracking

Time tracking is optional for each Workspace. A Workspace administrator enables it in **Preferences → Time tracking**, then chooses exact reporting or upward rounding to 15 or 30 minutes. Exact duration is retained for every entry; the policy only determines its reportable duration.

## Log time on a Task

Open a Task and select **Log time** in its properties. Enter a completed duration, work date, and optional note. Durations accept combinations of minutes, hours, days, and weeks, such as `45m`, `1h 15m`, `1d`, or `1w 2d 3h`.

- `1d` is eight hours.
- `1w` is five eight-hour days.
- Time is attached to one Task and rolls up to that Task's Project.
- A disabled Workspace retains prior entries but rejects new ones.

## Timesheets

When time tracking is enabled, **Timesheets** appears in the Workspace sidebar immediately after Inbox. Press <kbd>T</kbd> to open it, or select it from the sidebar, then choose a bounded date range, review your reportable and exact totals, and download the same range as CSV. The CSV includes the work date, Project, Task, reportable and exact seconds, and optional note.

## API

The public API provides Workspace policy, Task-entry, Task/Project-total, personal-timesheet, and CSV-export operations under `/api/v1`. See the machine-readable [OpenAPI contract](../openapi-spec/openapi.yaml) for request and response schemas.

Before a Workspace has stored its first policy, the policy read reports
bootstrap revision `0`; use `If-Match: "0"` for that first policy update.
Later updates use the positive revision returned by the preceding read.

Running timers, payroll workflows, approvals, and automatic Agent-written entries are not part of this manual-entry release.
