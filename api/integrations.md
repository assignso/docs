---
description: Provider catalog, installations, Project bindings, ongoing behavior, remote actions and Rich Entities linked to Tasks.
---

# Integrations and Rich Entities

The integration API covers the provider catalog, Workspace installations, personal identities, Project
bindings, ongoing behavior, remote actions and the Rich Entities linked to Tasks. Installing a
provider, binding a resource and enabling behavior are separate steps, and none implies the next.
Writing back to a provider stays off until an administrator configures it.

These operations use a browser session and the [API conventions](./conventions).

## Read

All reads return display-safe data from Assign's own records and never call the provider. They don't
include credentials, granted scopes, provider tenant IDs or raw provider payloads. A Workspace you
don't belong to returns `404`.

| Operation | Returns |
| --- | --- |
| `GET /api/v1/integration-catalog` | The provider catalog: key, display copy, categories, capabilities, availability (`preview` or `planned` is product readiness, not your Workspace's state) and whether it supports several installations or personal connections. |
| `GET /api/v1/workspaces/{workspace_id}/integration-installations?limit=20` | Current installations: ID, provider, name, lifecycle, derived health, revision and timestamps. |
| `GET /api/v1/integration-installations/{installation_id}` | One installation. Disconnected ones return `404`. |
| `GET /api/v1/me/integration-identities?limit=20` | Your provider identities in this Workspace, with the passive identity state and your delegated-authorization state kept separate, so `not_authorized` can be a valid state. |
| `GET /api/v1/projects/{project_id}/integration-bindings?limit=20` | The remote resources bound to a Project, with lifecycle, capability group, optional HTTPS link and counts of total, enabled and attention-needed behaviors. A binding with no behaviors is valid. |

Lists default to 20 items and cap at 100. Pass `next_cursor` back unchanged.

## Who can do what

Owners and admins install, reconnect and remove Workspace authority, discover resources, bind
Projects and configure behavior. Members can request a permitted remote action if they can also write
to the target work. Viewers are read-only. Any member can authorize or disconnect their own provider
identity.

## Manage installations, bindings and behavior

| Operation | Purpose |
| --- | --- |
| `POST /api/v1/workspaces/{workspace_id}/integration-authorizations`, then `GET /api/v1/integration-authorizations/callback` | Start and complete a one-use provider authorization. |
| `POST …/integration-authorizations/credential` | Complete setup for providers with no scoped OAuth grant, such as Toggl Track. The CSRF-protected body carries the state and credential, which are never returned or logged. |
| `POST /api/v1/workspaces/{workspace_id}/integration-private-connectors` | Enroll a private connector and return a one-time token (GitLab Self-Managed). |
| `DELETE /api/v1/integration-installations/{installation_id}` | Remove Workspace authority. |
| `DELETE /api/v1/me/integration-identities/{identity_id}` | Remove your own authority. |
| `POST /api/v1/integration-installations/{installation_id}/management-link` | Owner and admin hand-off to the provider's own settings, with a safe permission summary. |
| `GET /api/v1/integration-installations/{installation_id}/resources`, `POST …/resources/refresh` | Read or refresh discovered resources. |
| `POST /api/v1/projects/{project_id}/integration-bindings`, `DELETE /api/v1/integration-bindings/{binding_id}` | Bind or unbind a resource to a Project. |
| `GET` and `POST /api/v1/integration-bindings/{binding_id}/subscriptions`, `PATCH /api/v1/integration-subscriptions/{subscription_id}` | List, create and revise behavior. Updates need `If-Match`. |
| `GET /api/v1/integration-installations/{installation_id}/actions`, `POST /api/v1/integration-actions`, `GET /api/v1/integration-actions/{action_id}` | List typed remote actions, request one and read its durable status. Requests need an `Idempotency-Key`. |

Connecting a GitHub repository, GitLab project or Bitbucket repository to a Project enables incoming development activity automatically. Branches and pull or merge requests that reference a Task code appear in its Activity tab after ingestion or backfill. Existing paused or customized behavior is preserved when reconnecting. Task status changes and provider writeback require separate configuration.

New behavior defaults to `incoming`. Outgoing and bidirectional behavior can change provider data, so
choose it explicitly. Removing an installation stops new work, revokes authority where the provider
supports it, disconnects bindings, disables behavior and fails pending actions. Tasks, Documents and
history stay.

Provider webhooks are delivered by the provider to `/api/v1/webhooks/integrations/{provider_key}`
(with `/{installation_id}` for providers that use one per installation). Assign verifies each
signature, deduplicates deliveries, retries transient failures and reconciles missed state. Clients
don't call these endpoints.

## GitHub development event lists <Badge type="warning" text="Awaiting deployment" />

When you create or update incoming or bidirectional GitHub development behavior with a nonempty
`event_types` list, Assign includes `github.pull.request.review` and `github.workflow.run` in the
saved, sorted list. An empty list continues to receive all event types. The saved list can contain
at most 32 unique entries, including those two; a larger list returns `400 invalid_request`.

Update existing explicit lists using the current subscription revision to include the new events.
This applies to `github.development_activity` and legacy `development.activity` on GitHub bindings.
Other providers and behavior types keep their current event selection.

## In the web app

- **Integrations** (`/app/{workspaceSlug}/integrations`) lists providers with search, category
  filters and installation health. A provider page opens its installations.
- **Connected accounts** manages your own delegated authority. It doesn't install anything, bind a
  resource or start synchronization.
- **Project settings → Connected tools** groups bound resources by category and lets administrators
  bind resources and configure behavior. Permitted members can run remote actions after Assign
  explains what it will do and asks for confirmation.
- **Request an integration** records feedback in Assign only. It doesn't contact the provider. Don't
  include credentials or private content in the use case.

For GitHub, **Manage access in GitHub** opens the organization's installation settings, where an
owner changes repository access. Assign can't grant GitHub permissions itself.

## Providers

| Provider | Behaviors and actions |
| --- | --- |
| GitHub, GitLab, Bitbucket Cloud | `github.development_activity`, `gitlab.development_activity`, `bitbucket.development_activity`: branches, commits, pull or merge requests, checks or pipelines and deployments, linked to Tasks by Task code. |
| Slack | `slack.conversation_to_task` (**Create Assign Task** message action), `slack.thread_sync` (`link_only`, `incoming`, `outgoing`, `bidirectional`) and `slack.notifications` (Task code, title and event only). |
| Discord | `discord.conversation_to_task` (**Apps → Create Assign Task**) and the confirmed `discord.message.post` action. Assign doesn't read ambient messages. |
| Telegram | `telegram.thread_sync` (incoming messages) and the confirmed `telegram.message.post` action. Link your identity from the installation page. |
| Sentry | `sentry.error_updates` (a bounded summary per issue), `sentry.alert_to_task` (at most one Task per issue), `sentry.resolution_sync` and the confirmed `sentry.issue.resolve` action. |
| Toggl Track, Clockify | `toggl.time_entry.create` and `clockify.time_entry.create`: one confirmed time entry of up to 24 hours on the bound project. Nothing else is synchronized. |
| GitHub Gist | `github.gist.import`, `github.gist.export` and `github.gist.link`. See below. |

Rules that apply across providers:

- A connection or binding alone starts nothing. An administrator enables each behavior separately.
- Incoming Git behaviors link activity to Tasks by canonical Task code, case-insensitively, only in
  the bound Project. Merging a pull request never completes a Task unless an administrator configures
  it. To map pull request states to Statuses, set `configuration.pull_request_status_mappings` to a
  list of `{"provider_state": "merged", "status_id": "<id>"}` entries (`open`, `draft`, `merged`,
  `closed` or `reopened`). A manual Task move pauses further automated moves for that Task until the
  behavior is saved again.
- Slack `thread_sync` and Discord import only explicitly selected messages, with
  `privacy_mode: selected_snippet`. Slack notifications use `privacy_mode: access_safe_notification`
  and an allowlist of `task.created`, `task.updated`, `task.moved` and `comment.created`.
- Sentry alert Tasks use `privacy_mode: error_aggregate` and an active `task_creation_status_id`.
  Stack traces, request data and user samples are never stored.
- Provider outages never block Task or Comment operations.

### GitLab Self-Managed

Self-Managed needs GitLab 19 or newer. On the GitLab provider page choose **Self-Managed**, enter the
instance's HTTPS origin and the ID and secret of a confidential OAuth application, then choose
**Public HTTPS** for an internet-reachable instance or **Private connector** for one inside your
network. The connector, `assign-gitlab-connector`, makes only outbound requests, so it needs no
inbound firewall rule.

To create the OAuth application, open **Admin → Applications → New application**, paste the redirect
URI shown on Assign's page, select the `api` and `read_user` scopes and keep it confidential. GitLab
shows the secret once. Put the connector enrollment token directly in the connector process, not in
browser storage or source control.

### GitHub Gist actions

These need your personal GitHub connection with the Gist permission. Send each with
`POST /api/v1/integration-actions` and a unique `Idempotency-Key`, then poll the action.

- `github.gist.import` creates a Document from one named `.md` or `.markdown` file.
- `github.gist.export` creates a new Gist from a Document. `visibility` is `public` or `secret`, and
  secret also needs `secret_visibility_ack: secret_gists_are_not_private`, because secret Gists are
  unlisted but reachable by link. It never updates an existing Gist.
- `github.gist.link` links a Gist to a Task as a Rich Entity, without storing its content.

If Assign can't tell whether a remote create succeeded, the action reports
`integration.action_outcome_unknown` and isn't retried, so you don't get a hidden duplicate.

### Time entry providers

For Toggl Track, an owner or admin pastes a personal API token on the provider page. It carries that
person's Toggl permissions and is stored encrypted. Rotate it in Toggl if their access changes. For
Clockify, the Marketplace connection needs `PROJECT_READ`, `TIME_ENTRY_WRITE`, `USER_READ` and
`WORKSPACE_READ`. The time entry action takes `description`, RFC 3339 `start` and `end`, and, for
Clockify, an optional `billable` of `"true"` or `"false"`. The provider remains authoritative for the
entry. Setup and actions are available only through the API and web app.

## Request an integration

```http
POST /api/v1/workspaces/{workspace_id}/integration-requests HTTP/1.1
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"provider_name": "Jira", "use_case": "Link customer tickets to Assign Tasks."}
```

Any member can submit one. `provider_name` is 2–80 characters and `use_case` is optional, up to 500.
Repeating the same name from the same member returns `200` with the same request ID and updates the
use case. A provider already in the catalog returns `409 integration_already_available`.

## Task Rich Entities

A Rich Entity is Assign's stable reference to one object owned by a provider, such as an error, pull
request, deployment or support conversation. Assign owns the Task workflow and the provider owns the
external facts.

```http
GET /api/v1/tasks/{task_id}/rich-entities?limit=20
```

This returns stored snapshots and never calls a provider. Pages default to 20 and cap at 100. A
snapshot can hold a title, summary, semantic status, up to eight metrics, twelve typed properties
(each optionally with an HTTPS `url`) and eight `open_external` actions. `sync_status`, `sync_message`
and `last_synced_at` tell you whether the context is current, stale, degraded or unavailable. Stored
snapshots that are malformed or unsupported are omitted.

```json
{
  "items": [
    {
      "id": "<rich-entity-id>",
      "installation_id": "<installation-id>",
      "provider_key": "sentry",
      "entity_type": "sentry.error",
      "external_id": "ISSUE-94821",
      "human_identifier": "CHECKOUT-42",
      "canonical_url": "https://sentry.io/organizations/example/issues/94821/",
      "display_name": "Checkout request timed out",
      "snapshot_schema_version": 1,
      "snapshot": {
        "title": "Checkout request timed out",
        "summary": "TimeoutError in POST /api/checkout.",
        "status": {"label": "Unresolved", "tone": "danger"},
        "metrics": [{"id": "events", "label": "Events", "value": "1284"}],
        "properties": [
          {"id": "environment", "label": "Environment", "type": "text", "value": "production"}
        ],
        "actions": [{"id": "open", "label": "Open in Sentry", "kind": "open_external", "url": "https://sentry.io/organizations/example/issues/94821/"}]
      },
      "sync_status": "current",
      "sync_message": null,
      "last_synced_at": "2026-08-25T09:18:00Z",
      "last_changed_at": "2026-08-25T09:16:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

The generated TypeScript and PHP SDKs expose these operations in `IntegrationsApi`.

## Realtime reads <Badge type="warning" text="Upcoming" />

The [application realtime interface](./realtime) adds an `integrations` hint for
changes to the integration views you display. Installation lists/details,
resources, personal identities, Project bindings, subscriptions, action definitions
and action status accept `X-Assign-Realtime-Baseline: 1`. Successful responses
include a cursor and decimal position for the Workspace subscription. Reread and
apply all retained pages and details before acknowledging the update. Reading an
action's status does not submit it again. An unchanged resource refresh preserves
its revision and update timestamp.

This interface is under development and is not deployed or qualified for
supported client use.

### Live connection views <Badge type="warning" text="Upcoming" />

Installation details, personal identities and Connected tools will update while
open. Action-status updates and **Retry status** only read the result; they do not
submit the action again. Unsaved behavior edits stay in place when another
administrator saves a change. Choose **Use latest saved values** to discard your
edits and load that version. A list that reaches its read limit says that more
items remain; it does not present the loaded rows as the complete list.
