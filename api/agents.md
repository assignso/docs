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

An explicit independent-work request in Discuss can start one active, ready, Workspace-scoped hired
Agent through this same manual-run lifecycle. It does not create a second Agent execution record.
Discuss exposes its private progress and Stop projection separately; the ordinary Agent run remains
the authoritative execution history and retains the same authorization, scope, credit, approval and
cancellation rules.

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
  "schedule_weekdays": [1, 2, 3, 4, 5],
  "schedule_interval_minutes": 0
}
```

The definition must exist, every trigger family must be supported by it, and additional
instructions may contain at most 2,000 characters. A scheduled definition accepts an IANA timezone,
minute-precision local time, and ISO weekdays. Nonexistent DST times are skipped, a repeated wall
time runs once at the earlier instant, and recovery admits only the latest missed occurrence from
the prior 24 hours. The response exposes the next unambiguous UTC instant. Creating desired state
does not synchronously contact the Knowledge runtime.

Set `schedule_interval_minutes` to `60` through `10080` for a fixed recurrence instead. An hourly
schedule runs on each whole-hour UTC boundary and is not duplicated or skipped by daylight-saving
changes. Zero keeps the local-time weekday schedule. Invalid nonzero values return
`400 invalid_schedule`.

When event execution is enabled for Task Revisor, new or updated Tasks in its current
scope can create runs. Rapid edits to the same Task may be grouped into one queued review.
Historical replay and the Agent's own changes do not initiate another review. Availability
still depends on the Workspace's entitlement and the definition's qualified rollout.

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
publishes one safe terminal state. While a run is still running, the runtime may reconnect to its existing work after an interruption. It preserves the original request and confirmed actions; this is not a new run or a repeated submission. A terminal-projection retry does not re-run the Agent. Poll one
run or page retained history:

```http
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs/{run_id} HTTP/1.1
GET /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs?limit=50&cursor=<cursor> HTTP/1.1
```

History exposes trigger, state, pinned definition version, safe summary, bounded credit totals,
safe error code, and timestamps. It never exposes prompts, retrieved context, raw model output,
chain of thought, provider details, credentials, or private traces. Safe run history retains for
90 days. Resource references are independently authorized and may be redacted.

A failed run with `error_code: "provider_outcome_unknown"` requires reconciliation:
the provider may have processed work before its response was lost. Its reserved credits remain
held while the outcome is checked. The runtime does not automatically repeat that paid attempt;
ordinary collaboration remains available. A completed result can still have pending provider usage: its credit reservation stays held until accounting is reconciled. Completion is not a statement that the final charge is known.

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

Personal, Team, and Growth include canonical/custom Agent execution through the corresponding
entitlements; Free remains preview-only. The current conservative launch safety cap allows up to five
active and 100 non-removed instances while differentiated paid-tier concurrency remains pending.
Workspace Billing presents the entitlement state,
both usage counts, and recurring, promotional, purchased, reserved, available, and current-period
Knowledge Credit facts. Runs also show reserved and settled credits. There is no per-Agent recurring
charge or postpaid overage in the initial release.
Insufficient credits create a visible blocked/skipped outcome without blocking normal collaboration.

The Web interface keeps hiring, Agent detail, Agent Activity, and each run detail on dedicated URLs.
It exposes schedule detail/next occurrence, manual admission, cursor-backed safe history, permitted
cancellation, exact approvals, provenance, lifecycle controls, entitlement/credit state, and
explicit
approval-required and billing-blocked states. Activity and run detail refresh while a visible run is
queued, running, or waiting for approval, then stop once the terminal state and any safe report are
shown. Cancelled and billing-blocked runs with no output explicitly state that no response was
produced.

Scheduled results in Discuss use the Agent name captured with the run. If a scheduled run is cancelled,
blocked by billing, or exhausts managed recovery without a confirmed response, the terminal message
states that outcome instead of presenting an earlier progress phrase such as `Run started.` as the
result.

The optional **Grumpy** library Agent is a read-only reporting definition for manual or scheduled
runs. It posts one brief, evidence-backed grumpy observation about current Workspace work, or a
general complaint when there is no current work. It cannot attack people, invent work, or mutate
Workspace state. Configure it with `schedule_interval_minutes: 60` for hourly Discuss delivery.

## Build custom Agents in Agent Studio

Agent Studio is inside the Workspace **Agents** area. Owners and Admins can create a
bounded custom definition from a name, description, one concrete responsibility,
customer instructions, optional existing Project knowledge, and allowlisted Assign tools.
Backlog Grump and Ticket Comedian are editor-prefill examples; they are not hidden
canonical Agents and do not grant extra authority.

```http
GET /api/v1/workspaces/{workspace_id}/agents/studio/definitions?limit=50&cursor=<cursor>
POST /api/v1/workspaces/{workspace_id}/agents/studio/definitions
GET /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}
GET /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}/profile
PATCH /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}
```

Create and update bodies replace the whole editable definition. Updates require
`If-Match: "<revision>"`; a conflict preserves the newer saved revision so the
editor can reload without overwriting another administrator. Saving never starts
execution. `draft`, `active`, and `paused` are distinct desired states, and every
admitted request pins the exact revision and digest it used.

Project knowledge bindings use `knowledge-binding.v1` with Observe authority.
The initial tool catalog includes versioned `task_comment_create` Communicate and
`task_create` Manage contracts. Core checks current Workspace, private-Project,
integration, capability, and custom-Agent entitlement authority both when the
definition is saved and when a request is admitted. Definitions cannot upload
executables or configure an arbitrary MCP server.

The definition read is a management view. The `profile` read is the safe member
projection used by Agent references: it includes identity, responsibility,
state, revision and bounded latest-run facts, but never instructions, bindings,
raw inputs or prompts. Current Workspace and Task visibility are rechecked when
history and outcomes are read. Member-visible history returns an empty
`instructions` value; Studio managers retain the bounded original request input.

A test is the only preview-only request:

```http
POST /api/v1/workspaces/{workspace_id}/agents/studio/definitions/{definition_id}/requests
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

The durable response starts in `queued` state. A preview may read its selected
knowledge and consumes actual settled Knowledge Credits, but its proposed Comment
or Task cannot commit. Cursor-backed request history and the bounded usage summary
are available at `.../{definition_id}/requests` and
`.../{definition_id}/usage`. Usage separates pending runs, reserved credits, and
settled credits. Task delegation uses
`POST .../{definition_id}/delegations/{task_id}` and adds an Agent responsibility
overlay without replacing the human assignee or changing Task lifecycle state.

Custom-Agent production activation remains subject to the canonical-Agent
qualification, provider, billing, and Workspace enrollment gates. A saved or
active definition does not by itself prove that production execution is ready.

## Execution recovery and retained history

Pausing an Agent or changing its Project scope cancels pending work and
invalidates outstanding approvals. Approval also checks current permissions and
the exact Task revision. A run that could not start before its dispatch deadline
reports `agent_dispatch_expired`; you can request a new run. A dispatch that exhausts
its resolution attempts before execution starts reports `agent_resolution_exhausted` once
reconciled. This failure does not mean an Agent action was performed. A terminal failed run with an uncertain provider outcome remains non-retryable while its credit reservation is reconciled. Running work can reconnect within its original permissions and time limit; revoked or expired authority cannot be renewed by retrying.

Safe summaries, reports and action previews expire after 90 days. Purging a Task
removes its associated retained Agent content and cancels pending actions;
minimal approval and financial history remains. Stalled Work Tracker reacts to
changes to overdue active Tasks, and Documentation Keeper to Task completions,
when their event trigger is enabled.

Canonical Agent versions become available through staged qualification. An
entitlement alone does not guarantee immediate run availability. If a version
is unavailable or quarantined, new runs and pending approved actions cannot
proceed; existing run history remains available.

### Missing evidence and uncertain outcomes

Agents should distinguish missing information from a confirmed absence of
blockers or progress. A suggested change requires approval; it is not a
completed change. When an operation's acknowledgment is uncertain, inspect its
run/action status before starting another operation. Rewording the same request
can create a different action; use the original operation's retry/reconciliation
path.

## Agent Studio definition sections

The dedicated Studio editor keeps one revisioned definition across **Profile**, **Behavior**,
**Knowledge**, **Capabilities**, and **Automation**. Routing text and tags, conversation starters,
approved same-Workspace subagents, trigger types, prohibited actions, and the approval boundary are
ordinary editable draft fields. Saving a draft does not activate, schedule, install, or run it.
Templates and the local guided-draft helper only prefill this same form for review.
One definition-level Save action remains visible below every section; it does not
activate or run the Agent. While you type a new name, the complete generated slug
continues to update until you edit the slug yourself. Saved slugs remain stable.

Member-visible profiles expose responsibility, the managing actor, knowledge categories, safe
capability names, prohibited actions, trigger types, and the approval boundary. They never expose
binding identifiers, private instructions, credentials, platform prompts, or provider traces.

## Agent Studio MCP access

In an Agent definition's **Capabilities** section, select **Enable MCP access** and save the
definition to allow its permitted Assign tools. New custom Agents start with access off. Tools still
obey the Agent's bindings, your Workspace permissions and approval rules. Turning access off
prevents further tool actions; previously committed actions remain in history. Failed saves preserve
your unsaved choice.

The custom Agent definition API accepts optional `mcp_enabled`. Omit it on an existing definition
update to preserve the saved value, or send `false` to disable access. Current response Agents can
publish one permitted Task comment under their own identity; enabling MCP does not add tools or
broader permissions.

## Optional Project Update definition

The unreleased catalog adds optional `project-update@1`, definition ID
`07908f3f-9f46-5233-9ca9-400cdec5af18`. It reports authorized Project activity using read-only
capabilities and supports manual and scheduled runs. It is not installed automatically, requires
the ordinary library entitlement and uses one of the existing five active-Agent slots. The original
five definitions keep their identifiers; Task Revisor keeps its current name. Availability remains
subject to rollout. Consumers should use the catalog rather than assume a fixed definition count.


## Run a saved custom Agent

In Studio, **Run preview** saves the current edits and queues a preview that cannot commit changes. **Run now** uses the saved active revision and may perform its permitted actions; save any edits you want it to use first. Draft and paused Agents cannot run. Requests appear in the existing history with their pinned revision and status. A queued request is not a completed action.
