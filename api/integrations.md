---
description: Connect provider accounts, configure Project behavior and recover remote actions without repeating their effects.
---

# Integrations and Rich Entities

Use Integrations in the web app to connect providers, bind remote resources to Projects and
work with the Rich Entities linked to Tasks. Installing a provider, binding a resource and
enabling behavior are separate steps, and none implies the next.
Writing back to a provider stays off until an administrator configures it.

For external automation, use operations and credentials listed in the [public API reference](./reference/).

## Required Workspace features <Badge type="warning" text="Awaiting deployment" />

The provider catalog includes an optional `required_features` list. Clockify and Toggl Track
require `time_tracking` for their time behavior. Enable it in **Workspace settings → Features**;
connecting a provider leaves the feature setting unchanged.

While the feature is off, new dependent actions return `409 time_tracking_disabled`. Queued
work pauses and resumes after you enable the feature again. Installation, credentials,
bindings and history are retained. See [Workspace Features](./workspaces#features-awaiting-deployment).

## Read

The installation page and **Project settings → Connected tools** show the data Assign has
already synchronized. Reading these views does not make a live request to the provider.

You can inspect installation health, your personal connection and the resources bound to a
Project. A binding with no enabled behaviors is valid. A personal connection that has not yet
authorized a behavior can also be valid; it is separate from the shared installation.

Keep provider credentials private. Displayed health reports the last stored state, so it may lag
behind a provider outage or recovery.

## Who can do what

Owners and admins install, reconnect and remove Workspace authority, discover resources, bind
Projects and configure behavior. Members can request a permitted remote action if they can also write
to the target work. Viewers are read-only. Any member can authorize or disconnect their own provider
identity.

## Manage installations, bindings and behavior

1. Open **Integrations** and choose the provider. An owner or administrator connects the
   Workspace installation.
2. Connect your own account when the behavior needs your delegated provider authority.
3. Open **Project settings → Connected tools** and bind the remote resource to the Project.
4. Review the behaviors and their direction before saving.

Connecting a GitHub repository, GitLab project or Bitbucket repository to a Project enables
incoming development activity automatically. Branches and pull or merge requests that reference
a Task code appear in its Activity tab after ingestion or backfill. Reconnecting preserves paused
or customized behavior. Task status changes and provider writeback require separate configuration.

Other new behavior defaults to incoming. Outgoing and bidirectional behavior can change provider
data, so choose it explicitly. Removing an installation stops new work, revokes authority where
the provider supports it, disconnects bindings, disables behavior and fails pending actions.
Tasks, Documents and history stay.

Provider connections receive incoming activity from the provider. Configuring one does not
register your application to receive events sent by Assign. Provider callback addresses and the
Assign application's live connection are not integration endpoints for your own receiver.

## GitHub development event lists <Badge type="warning" text="Awaiting deployment" />

When you create or update incoming or bidirectional GitHub development behavior with an explicit
event selection, Assign includes pull request review and workflow run events in the saved list.
An empty selection receives all event types. The list can contain at most 32 distinct entries,
including those two.

Edit and save existing explicit selections to include the new events. This applies to GitHub
development activity; other providers and behavior types keep their current event selection.

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

These actions need your personal GitHub connection with the Gist permission. Run an offered
action from the connected tool and review its effects before confirming.

- Import creates a Document from one named `.md` or `.markdown` file.
- Export creates a new public or secret Gist from a Document. A secret Gist is unlisted but
  reachable by link, so export requires an explicit acknowledgment. Export never updates an
  existing Gist.
- Link adds a Gist to a Task as a Rich Entity without storing its content.

An accepted action may still be pending. Check its status before submitting another request.
If Assign cannot tell whether a remote create succeeded, the action reports
`integration.action_outcome_unknown` and is not automatically retried. Check the provider before
deciding what to do next; an unknown result is not proof that nothing was created.

### Time entry providers

For Toggl Track, an owner or admin pastes a personal API token on the provider page. It carries that
person's Toggl permissions and is stored encrypted. Rotate it in Toggl if their access changes. For
Clockify, the Marketplace connection needs `PROJECT_READ`, `TIME_ENTRY_WRITE`, `USER_READ` and
`WORKSPACE_READ`. The time entry action takes `description`, RFC 3339 `start` and `end`, and, for
Clockify, an optional `billable` of `"true"` or `"false"`. The provider remains authoritative for the
entry. Use the web app to set up the connection and request actions.

## Request an integration

Use **Request an integration** on the Integrations page. Any Workspace member can submit a
provider name and an optional use case. Names are 2–80 characters; the use case is limited to
500 characters. Do not include credentials or private content.

Submitting the same provider name again updates your existing request. A provider already in the
catalog does not need another request. This records feedback in Assign; it does not contact the
provider.

## Task Rich Entities

A Rich Entity is Assign's stable reference to an object owned by a provider, such as an error,
pull request, deployment or support conversation. Assign owns the Task workflow and the provider
owns the external facts.

A Task displays the synchronized title, summary, status, metrics, properties and external actions
available for that object. Reading it does not call the provider. Check its freshness indication
and last synchronization time before relying on it: context can be stale, degraded or unavailable.
Malformed or unsupported snapshots are omitted.

An external action can open the object at its provider. A link is not a copy of the provider's
permissions; you still need access there.

## Realtime reads <Badge type="warning" text="Upcoming" />

The upcoming [live updates](./realtime) refresh open installation details, personal connections,
Project bindings and action status. Reading an action's status does not submit the action again.
An unchanged resource refresh preserves its saved revision and update time.

This behavior is under development.

### Live connection views <Badge type="warning" text="Upcoming" />

Installation details, personal identities and Connected tools will update while
open. Action-status updates and **Retry status** only read the result; they do not
submit the action again. Unsaved behavior edits stay in place when another
administrator saves a change. Choose **Use latest saved values** to discard your
edits and load that version. A list that reaches its read limit says that more
items remain; it does not present the loaded rows as the complete list.
