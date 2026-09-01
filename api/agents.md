# Workspace Agents

Assign Agents are Workspace-owned software workers with one curated project-management
responsibility. Assign Core owns the public definition catalog and desired configuration;
the private Knowledge runtime performs execution. Hiring or updating an Agent records desired
state and does not mean that a run has started or completed.

These operations require an authenticated browser session and follow the shared
[API conventions](conventions.md). Owners, Admins, Members, and Viewers may read definitions,
hired Agents, and resource-authorized safe history. Owners and Admins may hire, configure,
quarantine, roll back, remove, and approve Agents;
Owners, Admins, and Members may start manual runs. A Member may cancel a run they initiated,
while an Owner or Admin may cancel any non-terminal run in the Workspace.

## Browse the Agent Library

```http
GET /api/v1/workspaces/{workspace_id}/agents/definitions HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

The bounded catalog returns stable Assign-owned definition identifiers, names,
responsibilities, supported and default trigger families, display-safe capability summaries,
and action boundaries. It never returns system instructions, prompts, models, providers,
runtime policy, tool configuration, MCP configuration, or traces.

## List and read hired Agents

```http
GET /api/v1/workspaces/{workspace_id}/agents HTTP/1.1
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Each Agent belongs to exactly one Workspace and pins its definition identity and version.
Its configuration contains `active` or `paused` status, Workspace-wide or selected-Projects
scope, enabled trigger families, bounded additional instructions, revision, and timestamps.
Selected Projects must be current, non-archived members of the same Workspace.

## Hire an Agent

```http
POST /api/v1/workspaces/{workspace_id}/agents HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <unique-key>
Content-Type: application/json

{
  "definition_id": "c38d1090-e096-5c0c-bdba-d5c969edb35e",
  "status": "active",
  "scope_kind": "projects",
  "project_ids": ["0198ef21-9fe1-7a44-b323-f45c5ef2827f"],
  "enabled_trigger_types": ["manual", "event"],
  "additional_instructions": "Prefer concise review comments.",
  "schedule_timezone": "Europe/Budapest",
  "schedule_local_time": "09:00",
  "schedule_weekdays": [1, 2, 3, 4, 5]
}
```

The definition must exist, every trigger family must be supported by it, and additional
instructions may contain at most 2,000 characters. A scheduled definition accepts an IANA timezone,
minute-precision local time, and ISO weekdays. Nonexistent DST times are skipped, a repeated wall
time runs once at the earlier instant, and recovery admits only the latest missed occurrence from
the prior 24 hours. The response exposes the next unambiguous UTC instant. Creating desired state
does not synchronously contact the Knowledge runtime.

## Configure or pause an Agent

```http
PATCH /api/v1/workspaces/{workspace_id}/agents/{agent_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{
  "status": "paused",
  "scope_kind": "workspace",
  "project_ids": [],
  "enabled_trigger_types": ["manual"],
  "additional_instructions": "Prefer concise review comments."
}
```

Updates replace the complete editable configuration and require the current revision. A stale
revision returns a conflict so clients can reload without overwriting another administrator's
change. Pausing prevents new manual, event, and scheduled admission; it does not imply rollback of
an already committed action. Use the run cancellation operation for eligible admitted runs.

## Run now and inspect history

An active Agent whose reconciled configuration enables `manual` can be queued with an empty
request object:

```http
POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Idempotency-Key: <unique-key>
Content-Type: application/json

{}
```

The `202` response is the durable Core-owned run, normally in `queued` state. It does not mean
the model has run or an action has committed. The private runtime continuously claims admitted
work, changes the public projection to `running` when execution authority is resolved, and then
publishes one safe terminal state. A terminal-projection retry does not re-run the Agent. Poll one
run or page retained history:

```http
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs/{run_id} HTTP/1.1
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs?limit=50&cursor=<cursor> HTTP/1.1
```

History exposes trigger, state, pinned definition version, safe summary, bounded credit totals,
safe error code, and timestamps. It never exposes prompts, retrieved context, raw model output,
chain of thought, provider details, credentials, or private traces. Safe run history retains for
90 days. Resource references are independently authorized and may be redacted.

Cancel a queued, running, or approval-waiting run idempotently:

```http
POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs/{run_id}/cancel HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <unique-key>
Content-Type: application/json

{}
```

Cancellation never rolls back an action that already committed. Terminal runs return a conflict.

## Review exact actions and provenance

```http
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs/{run_id}/actions HTTP/1.1
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs/{run_id}/outputs HTTP/1.1
```

Every Manage proposal binds the Agent instance, run and definition version, tool contract,
capability, target, canonical request digest, human-readable preview, and idempotency key. Its one
approval expires after 24 hours. Owners/Admins approve or reject the exact proposal at the action's
decision URL; approval reauthorizes live Workspace/Project access and applies the complete reviewed
payload through the normal domain service at the reviewed target revision. A changed target,
expired decision, quarantine, removal, or replay cannot execute it.

Outputs are customer-safe comments, reports, or notifications and identify the automated Actor,
Agent instance, run, definition version, optional target, and timestamp. They are attribution
records, not private reasoning or provider traces.

## Quarantine, roll back, or remove

`POST .../{agent_id}/quarantine` requires the current `If-Match` revision and a 1–200-character
reason. It pauses the instance, clears its next schedule, cancels every unfinished run, and
invalidates pending approvals. `POST .../{agent_id}/rollback` is available only when Core has
stored a prior qualified definition version; it restores that version in paused state for review.
`DELETE .../{agent_id}` soft-removes the instance, stops unfinished work, and preserves retained
audit/history rather than destructively deleting it.

Canonical Agents require the Growth `agents.canonical` entitlement. Up to five may be active and
up to 100 non-removed instances may be retained. Workspace Billing presents the entitlement state,
both usage counts, and recurring, promotional, purchased, reserved, available, and current-period
Knowledge Credit facts. Runs also show reserved and settled credits. There is no per-Agent recurring
charge or postpaid overage in the initial release.
Insufficient credits create a visible blocked/skipped outcome without blocking normal collaboration.

The Web interface keeps hiring, Agent detail, Agent Activity, and each run detail on dedicated URLs.
It exposes schedule detail/next occurrence, manual admission, cursor-backed safe history, permitted
cancellation, exact approvals, provenance, lifecycle controls, entitlement/credit state, and explicit
approval-required and billing-blocked states. Custom Agents remain unavailable until every canonical
definition passes independent provider-backed evaluation and production canary gates.
