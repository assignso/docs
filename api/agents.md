---
description: Hire, configure, run and review Workspace Agents, approve their proposed actions and build custom Agents in Agent Studio.
---

# Agents

Agents are Workspace-owned workers, each with one project-management responsibility. Hiring or
configuring an Agent records the desired setup; it doesn't mean a run has started or finished.

These operations use a browser session and the [API conventions](./conventions).

| Role | Can |
| --- | --- |
| Owner, Admin | Hire, configure, pause, quarantine, roll back, remove and approve Agents. Cancel any run. |
| Member | Start manual runs and cancel their own. |
| Viewer | Read definitions, hired Agents and history. |

Everyone can read history you're authorized to see. A request in [Discuss](./discuss) can also start a
ready, hired Agent through the same run lifecycle, with the same permission, credit, approval and
cancellation rules.

## Library and hired Agents

- `GET /api/v1/workspaces/{workspace_id}/agents/definitions` is the library: definition IDs, names,
  responsibilities, supported and default triggers, capability summaries and action boundaries. It
  never returns prompts, models or runtime configuration.
- `GET /api/v1/workspaces/{workspace_id}/agents` and `…/agents/{agent_id}` list and read hired Agents.
  Each pins its definition and version, and has a status (`active` or `paused`), scope (Workspace or
  selected Projects), enabled triggers, additional instructions, revision and timestamps.

Use the library rather than assuming a fixed set of definitions.

## Hire

```http
POST /api/v1/workspaces/{workspace_id}/agents HTTP/1.1
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
  "schedule_weekdays": [1, 2, 3, 4, 5],
  "schedule_interval_minutes": 0
}
```

- Each trigger must be supported by the definition. Additional instructions are at most 2,000
  characters. Selected Projects must be active Projects in the Workspace.
- A schedule uses an IANA timezone, a local time and ISO weekdays. A time skipped by a daylight-saving
  change doesn't run, a repeated time runs once at the earlier instant, and after an outage only the
  latest missed occurrence from the past 24 hours runs. The response shows the next run in UTC.
- `schedule_interval_minutes` from `60` to `10080` gives a fixed recurrence in UTC instead, unaffected
  by daylight saving. `0` keeps the weekday schedule, and other values return `400 invalid_schedule`.
- With event triggers on, new or updated Tasks in scope can start runs, and rapid edits to a Task can
  be grouped into one review. An Agent's own changes and historical replay don't start runs.
  Availability depends on your Workspace's entitlement.

## Configure, pause and remove

```http
PATCH /api/v1/workspaces/{workspace_id}/agents/{agent_id} HTTP/1.1
X-CSRF-Token: <csrf-token>
If-Match: "3"
Content-Type: application/json

{"status": "paused", "scope_kind": "workspace", "project_ids": [], "enabled_trigger_types": ["manual"], "additional_instructions": "Prefer concise review comments."}
```

An update replaces the whole editable configuration, and a stale revision returns a conflict.
Pausing stops new manual, event and scheduled runs, but doesn't undo committed actions. Pausing or
narrowing the scope also cancels pending work and pending approvals.

- `POST …/{agent_id}/quarantine` with `If-Match` and a 1–200 character reason pauses the Agent,
  clears its schedule, cancels unfinished runs and voids pending approvals.
- `POST …/{agent_id}/rollback` restores the previous qualified version, paused, when one exists.
- `DELETE …/{agent_id}` removes the Agent and stops unfinished work, keeping retained history.

## Run and inspect

An active Agent with `manual` enabled starts with an empty body:

```http
POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <unique-key>
Content-Type: application/json

{}
```

The `202` response is the queued run. That doesn't mean the model ran or an action was applied. The
run moves to `running` and then a terminal state; work interrupted while running resumes without a
new run. Read one run with `…/runs/{run_id}` or page history with `…/runs?limit=50&cursor=<cursor>`.

History shows the trigger, state, pinned version, a safe summary, credit totals, a safe error code
and timestamps, never prompts, retrieved context, model output or traces. It is kept for 90 days, and
resource references are re-authorized when read, so they may be redacted.

| Error code | Meaning |
| --- | --- |
| `provider_outcome_unknown` | The provider may have done the work before the reply was lost. Credits stay held, the paid attempt isn't repeated automatically and the run needs reconciliation. |
| `agent_dispatch_expired` | The run couldn't start in time. Start a new run. |
| `agent_resolution_exhausted` | The run couldn't start after repeated attempts. No Agent action was performed. |

A completed run can still have provider usage pending, so its final charge may not be known yet.
Insufficient credits produce a visible blocked or skipped run without blocking normal collaboration.

`POST …/runs/{run_id}/cancel` with `Idempotency-Key` and an empty body cancels a queued, running or
approval-waiting run. It doesn't undo committed actions, and a terminal run returns a conflict.

## Actions and outputs

`GET …/runs/{run_id}/actions` and `…/runs/{run_id}/outputs` list what a run proposed and produced.

A proposed change binds the exact target, request, preview and idempotency key. It has one approval,
valid for 24 hours. Owners and admins approve or reject it at the action's decision URL. Approval
rechecks current access and applies the reviewed change to the reviewed revision. If the target
changed, the decision expired, or the Agent was quarantined or removed, it won't run. Outputs are
comments, reports or notifications attributed to the automated actor, Agent, run and version.

A suggestion is not a completed change. If an acknowledgment is uncertain, check the original run or
action status before starting another. Rewording the request can create a different action.

## Limits and availability

Personal, Team and Growth plans include Agent runs, and Free is preview only. A Workspace can have a
limited number of active Agents. Workspace Billing shows the entitlement, usage counts and Knowledge
Credit balance, and runs show reserved and settled credits. There's no per-Agent recurring charge.

Agent versions roll out in stages, so an entitlement doesn't guarantee a version is available. If
one is unavailable or quarantined, new runs and pending approvals stop and history stays readable.

## Agent Studio

Owners and admins build custom Agents in **Agents → Studio** from a name, description, one
responsibility, instructions, optional Project knowledge and allowlisted tools. Saving never starts
execution. `draft`, `active` and `paused` are separate states, and each run pins the revision it used.

```http
GET   /api/v1/workspaces/{workspace_id}/agents/studio/definitions?limit=50&cursor=<cursor>
POST  /api/v1/workspaces/{workspace_id}/agents/studio/definitions
GET   /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}
GET   /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}/profile
PATCH /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}
```

- Create and update bodies replace the whole definition. Updates need `If-Match`, and a conflict
  keeps the newer saved revision.
- Studio definition pages use a signed cursor tied to the Workspace catalog position. If a
  definition changes between pages, the next page returns `409 catalog_changed`; restart from
  the first page. Studio retries one bounded traversal, then offers **Retry**.
- Each Studio list item includes its current `updated_at` UTC catalog position. Items are ordered
  by `updated_at` descending, then `definition_id` descending. Detail reads omit this list position.
- Each hired Agent list item includes `catalog_updated_at`, the full-precision UTC catalog position.
  Items are ordered by that position descending, then Agent ID descending. Detail and mutation
  responses omit the list position.
- Project knowledge is read-only. The tool catalog includes `task_comment_create` (communicate) and
  `task_create` (manage). Access is checked when a definition is saved and again when a request runs.
  Definitions can't upload code or add an arbitrary MCP server.
- The definition read is for managers. The `profile` read is the safe member view, with identity,
  responsibility, state and latest-run facts but never instructions or bindings.
- `mcp_enabled` (optional) turns on MCP access, matching **Enable MCP access** in the Capabilities
  section. Omit it on updates to keep the value, or send `false` to disable. Tools still follow the
  Agent's bindings, your permissions and approval rules, and access is off for new Agents.

A test run runs without committing changes:

```http
POST /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}/requests HTTP/1.1
X-CSRF-Token: <csrf-token>
Idempotency-Key: <unique-key>
Content-Type: application/json

{
  "source_kind": "test",
  "source_id": "0198ef21-9fe1-7a44-b323-f45c5ef2827f",
  "instructions": "Review the current backlog and show what you would do.",
  "preview_only": true
}
```

A preview can read the selected knowledge and uses settled credits, but its proposed Comment or Task
can't commit. In Studio, **Run preview** saves your edits and queues a preview, while **Run now** runs
the saved active revision and may take permitted actions. Draft and paused Agents can't run.
If Studio cannot refresh a definition or catalog, use **Retry**. The editor hides
the previous definition details until the current read succeeds and keeps
unsaved fields in the open tab.

- `…/{definition_id}/requests` pages request history and `…/{definition_id}/usage` gives the usage
  summary, separating pending runs, reserved credits and settled credits.
- `POST …/{definition_id}/delegations/{task_id}` gives an Agent a responsibility on a Task without
  replacing the human assignee or changing its state.
- Production use of custom Agents depends on rollout and billing, so a saved or active definition
  doesn't prove it can run.
