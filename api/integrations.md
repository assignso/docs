# Integrations and Rich Entities

The integration API exposes Assign's provider catalog, secure provider
authorization, display-safe Workspace installations and personal identities,
resource discovery, explicit Project bindings, revisioned ongoing behavior,
verified provider deliveries, typed remote actions, and Task-linked Rich
Entities. Installation, binding, and ongoing behavior are independent: none
implies the next, and writeback remains off until an administrator explicitly
configures it.

These operations require an authenticated browser session and follow the shared
[API conventions](conventions.md).

## List integration providers

```http
GET /api/v1/integration-catalog HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

The response describes Assign's server-owned catalog. Each item includes its
stable key, display copy, categories, capabilities, availability, official
status, and whether the provider model supports multiple Workspace
installations or personal user connections. `preview` or `planned` describes
product readiness; it does not mean that the current Workspace has installed
or authorized that provider.

## List current Workspace installations

```http
GET /api/v1/workspaces/{workspace_id}/integration-installations?limit=20 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Active Workspace members can read this cursor-bounded collection. It contains
only current installation identifiers, provider key, display name, lifecycle,
safe derived health, revision, and timestamps. It excludes disconnected
history, credential references, external provider tenant identifiers, granted
scopes/capabilities, provider metadata, personal connections, and raw provider
payloads. The endpoint never contacts a provider. A different Workspace and an
absent Workspace both return `404`.

## Read one current installation

```http
GET /api/v1/integration-installations/{installation_id} HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

This operation returns the same display-safe schema as one collection item and
uses the same active-Workspace authorization. It never contacts the provider.
An absent, disconnected, or different-Workspace installation returns `404`.

## List personal integration identities

```http
GET /api/v1/me/integration-identities?limit=20 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

This cursor-bounded operation returns only the signed-in User's current
provider identities in the session Workspace. Each row identifies its Assign
installation, provider, installation display name, remote display name,
passive-identity lifecycle, derived delegated-authorization lifecycle,
revision, and timestamps. Passive identity and optional personal authority are
separate: `not_authorized` can therefore be a valid identity state rather than
a missing Workspace installation.

The response excludes provider-stable remote user IDs, credential references,
granted scopes, raw provider payloads, other Users, and disconnected identity
or installation history. It never contacts a provider and grants no new
authority. Continue with `next_cursor` exactly as returned; the cursor is bound
to both the current Workspace and User.

## List a Project's connected tools

```http
GET /api/v1/projects/{project_id}/integration-bindings?limit=20 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

Project readers can list the persisted remote resources connected to that
Project. Each item includes display-safe installation, provider, resource, and
binding lifecycle; a server-derived capability group; an optional HTTPS
resource link; and total, enabled, and attention-needed behavior counts. The
default page size is 20 and the maximum is 100. Continue with the opaque
`next_cursor` exactly as returned; it is bound to the current Workspace and
Project.

The operation never contacts a provider. It excludes provider-stable resource
and tenant identifiers, credential references, scopes, raw subscription
configuration, provider payloads, personal identities, and disconnected
history. A connected resource with zero behaviors is valid: binding does not
enable synchronization, notifications, or automation implicitly.

## Browse the catalog in Assign

Authenticated members can browse the same bounded catalog at
`/app/{workspaceSlug}/integrations` and open a provider overview at
`/app/{workspaceSlug}/integrations/{providerKey}`. A current installation opens
at `/app/{workspaceSlug}/integrations/{providerKey}/installations/{installationId}`.
The current web experience supports provider search, category filters, current
Workspace installation filtering/health summaries, preview-provider
authorization, resource refresh, reconnect, and consequence-confirmed removal.
Provider marks may use version-pinned Simple Icons
assets or separately reviewed checked-in provider SVGs as a visual aid across
catalog, provider, installation, and Rich Entity surfaces. Slack uses its
reviewed four-color inline mark; the provider name remains visible and brand
color does not communicate health or trust. Connect normally opens a single-use
provider authorization flow. Toggl Track is the documented exception because
its API exposes no scoped OAuth grant: its dedicated provider page accepts a
personal API token through the authenticated completion operation, never a URL
or browser store. Catalog cards never collect credentials or treat visibility
as authorization.

**Connected accounts** shows the same safe personal integration identity and
authorization state grouped by eligible Workspace installation. It can
authorize, reconnect, or disconnect only the signed-in User's delegated
authority. It does not install/remove Workspace authority, bind a resource, or
enable synchronization.

Project settings provides **Connected tools** at
`/app/{workspaceSlug}/projects/{projectPath}/settings/connected-tools`. The page
groups bound resources by Development, Communication, Error tracking, Customer
support, and Other; shows semantic lifecycle and behavior state; and links to
the owning installation or safe provider resource. Authorized administrators
can discover and bind a resource explicitly, then use a dedicated configuration
route to create, revise, pause, or resume behavior. Permitted members can run
schema-derived remote actions after Assign explains the authority and asks for
confirmation.

The **Request an integration** action opens the stable
`/app/{workspaceSlug}/integrations/request` page. It records product feedback
inside Assign; it does not contact, authorize, or install the named provider.
Do not include credentials, secrets, or private provider content in the
optional use-case field.

## Manage provider authority and behavior

Owners and Admins can install/reconnect/remove Workspace provider authority,
discover resources, bind/unbind Projects, and configure ongoing behavior.
Members can request a permitted typed remote action when they also have write
access to the target work. Viewers are read-only. Any active member can
authorize or disconnect only their own delegated provider identity. Telegram
is the non-delegated exception: its one-time bot ceremony maps the immutable
Telegram user ID to the current Assign user without creating a user credential.

The lifecycle operations are:

- `POST /api/v1/workspaces/{workspace_id}/integration-authorizations` and
  `GET /api/v1/integration-authorizations/callback` for one-use provider
  authorization with PKCE where supported or confidential client authentication
  where required. OAuth callbacks provide `code`; a provider-native installation
  callback, such as a GitHub App installation, instead provides its matching
  `installation_id` while retaining the same one-use state;
- `POST /api/v1/workspaces/{workspace_id}/integration-authorizations/credential`
  for providers such as Toggl Track that expose no scoped OAuth grant. The
  CSRF-protected JSON body carries the one-use state and credential, both bound
  to the initiating Workspace Actor; neither value is returned, logged, placed
  in a URL, or saved by the browser;
- `DELETE /api/v1/integration-installations/{installation_id}` and
  `DELETE /api/v1/me/integration-identities/{identity_id}` for Workspace or
  self-only authority removal;
- `GET /api/v1/integration-installations/{installation_id}/resources` and
  `POST .../resources/refresh` for persisted or explicit provider discovery;
- `POST /api/v1/projects/{project_id}/integration-bindings` and
  `DELETE /api/v1/integration-bindings/{binding_id}` for audited binding;
- `GET`/`POST /api/v1/integration-bindings/{binding_id}/subscriptions` and
  `PATCH /api/v1/integration-subscriptions/{subscription_id}` for revisioned
  behavior; and
- `GET /api/v1/integration-installations/{installation_id}/actions`,
  `POST /api/v1/integration-actions`, and
  `GET /api/v1/integration-actions/{action_id}` for typed, confirmed,
  idempotent remote actions and durable status.

Subscription update requires `If-Match`; action request requires
`Idempotency-Key`. New behavior defaults to `incoming`. Outgoing and
bidirectional behavior can change provider data and must be selected explicitly.
Removing an installation stops new work, revokes authority where supported,
disconnects bindings, disables subscriptions, and fails pending actions; it
does not delete canonical Assign Tasks/Documents or historical attribution.

Installation-addressed provider webhooks arrive at
`POST /api/v1/webhooks/integrations/{provider_key}/{installation_id}`. Providers
that operate one application-wide webhook, currently Telegram and Slack, use
`POST /api/v1/webhooks/integrations/{provider_key}`; Assign verifies the global
secret before returning a Slack URL-verification challenge, completing a
matching one-use setup, or resolving the active logical installation from an
immutable remote tenant/resource ID. Assign
verifies the provider signature before accepting any payload-derived command,
discards the raw body, stores only a bounded normalized envelope, deduplicates
deliveries, retries transient failures durably, dead-letters exhausted work, and
reconciles missed state. The webhook receiver is for configured providers, not
for browser clients to invoke.

### Toggl Track preview

An Owner or Admin copies the personal API token from their Toggl Track profile
into the dedicated provider page. The token carries that person's effective
Toggl permissions rather than a limited Assign scope. Assign validates the
identity and default Toggl Workspace, stores the credential in the encrypted
integration vault, and returns only display-safe installation data. Rotate the
token in Toggl if the person's access changes or any other copy may exist.

Discovery lists at most 100 active Projects per page. A Project binding is
inert until a member requests and confirms `toggl.time_entry.create`, which
creates one completed entry of at most 24 hours against the exact bound Toggl
Project. No history, running timer, webhook, report, subscription, or timesheet
synchronization is enabled by installation or binding. Disconnecting removes
Assign's vault reference; Toggl does not offer per-application revocation for a
personal API token.

### Telegram preview

Choose **Open Telegram** on the Telegram provider page. Telegram prompts an
Owner or Admin to select a group and sends the single-use start parameter to the
globally operated Assign bot. Adding the bot without that ceremony does not
connect an Assign Workspace. The linked group is discovered as a chat resource;
verified forum messages also discover their topic as a separately bindable
resource. A Project binding alone
starts no messages, notifications, or thread synchronization.

From an installation page, any active member can choose **Link my Telegram
identity** and complete the private bot ceremony. Assign stores only the
Workspace-scoped mapping to Telegram's immutable numeric user ID. It stores no
delegated Telegram user token. Removing the mapping leaves the chat
installation, bindings, and subscriptions unchanged.

`telegram.thread_sync` is the incoming communication behavior for verified
message updates, and `telegram.message.post` is the confirmed installation-
authority action for a bound chat or forum topic. Message text is normalized and
bounded before durable storage; the raw Telegram update is discarded. Bot API
history is not treated as a reconciliation source, so reconciliation checks
current chat access rather than silently polling or importing prior messages.

### Slack communication and notifications

A Slack channel binding is inert until an administrator creates a separate
behavior. `slack.conversation_to_task` lets a mapped, active Assign member use
the **Create Assign Task** message action; the route stores only the selected
message snippet and provider link and creates the Task in the configured active
Status. Channel presence alone grants no Assign permission, and an unmapped or
write-denied Slack user creates no Task.

`slack.thread_sync` is independently configured as `link_only`, `incoming`,
`outgoing`, or `bidirectional`. Incoming replies are imported only for an
explicitly linked thread, under the mapped member's canonical Assign authority,
and with `privacy_mode: selected_snippet`. Bot/app echoes, message history,
files, reactions, profile data, and arbitrary Slack blocks are not mirrored.
Losing private-channel membership degrades access without deleting historical
Task links, and Slack outages never block core Task or Comment commands.

`slack.notifications` is a separate outgoing route. It requires an explicit
allowlist of `task.created`, `task.updated`, `task.moved`, and/or
`comment.created` events plus `privacy_mode: access_safe_notification`.
Deliveries contain only the Task code, title, and event label; Comment and
Document content are excluded. They are queued, retried, rate-limited, and
dead-lettered outside the originating Assign command.

### GitHub Gist Document interchange

GitHub Gist operations require the current member's active GitHub user
connection with the Gist permission. Repository-installation authority and a
repository binding cannot substitute for that personal grant. The installation
action catalog exposes three durable, idempotent action types:

- `github.gist.import` reads one explicitly named `.md` or `.markdown` file and
  creates a normal Assign Document. Truncated, non-Markdown, invalid UTF-8,
  oversized, raw-HTML, remote-image, and unsupported structural input is
  rejected; Assign does not follow a Gist file's `raw_url`.
- `github.gist.export` reads one authorized Document and creates a new Gist.
  `visibility` is `public` or `secret`. Secret creation also requires
  `secret_visibility_ack: secret_gists_are_not_private`; secret Gists are
  unlisted and link-accessible, not private. The operation never updates an
  existing Gist.
- `github.gist.link` reads bounded metadata for one Gist and links a
  `github.gist` Rich Entity to one authorized Task. The Rich Entity stores no
  Gist file content.

These are one-shot operations and create no synchronization subscription. Each
request uses `POST /api/v1/integration-actions` with a unique
`Idempotency-Key`; poll the returned action through
`GET /api/v1/integration-actions/{action_id}`. If Assign cannot determine
whether a remote create succeeded, it reports
`integration.action_outcome_unknown` and does not retry the create
automatically, avoiding an invisible duplicate.

### Clockify project time entries

Clockify is installed as a CAKE Marketplace external add-on. Assign receives a
provider-issued add-on token through the authorization continuation and stores
it only in the encrypted installation credential vault. The browser never
collects or displays a Clockify API key or add-on token.

The Marketplace connection must grant `PROJECT_READ`, `TIME_ENTRY_WRITE`,
`USER_READ`, and `WORKSPACE_READ`. These permissions let Assign identify the
connected Workspace, list projects, and create the explicitly confirmed time
entry; the initial integration requests no report, timer, approval, or webhook
permission.

An explicit resource refresh discovers active Clockify projects in bounded
pages. An administrator may bind one of those projects to an Assign Project;
installation and binding import no historical time entries and start no timer,
webhook, report transfer, or background synchronization.

The bound installation exposes the confirmed `clockify.time_entry.create`
action. Its input contains `description`, RFC 3339 `start` and `end`, and the
optional string `billable` (`true` or `false`). Assign requires a positive
duration of at most 24 hours and targets the exact bound Clockify project. The
successful result returns display-safe entry, Workspace, Project, and acting
user identifiers. Clockify remains authoritative for the entry, billable
settings, rates, approval, reports, edits, and deletion. Provider failure does
not block Assign's own time tracking or Task operations.

Clockify setup, resources, and actions remain REST/browser-only for this slice.
MCP exposure is deferred until the shared integration scope/schema, security,
idempotency, and supported-client qualification gates pass.

### Sentry errors and alert-created Tasks

An incoming `sentry.error_updates` behavior stores one bounded Rich Entity per
stable Sentry issue. The aggregate can include title, culprit, status,
first/last seen, event/user counts, level, and platform plus the provider link.
It excludes stack traces, request data, breadcrumbs, user samples, tags, and raw
events. Repeated occurrences update that canonical aggregate instead of
creating occurrence records.

An administrator may separately enable `sentry.alert_to_task` with an active
`task_creation_status_id` and `privacy_mode: error_aggregate`. A created or
regressed issue creates at most one Task in the bound Project, attributed to the
active member who configured the route. Existing Task-code references are
linked first; later occurrences refresh the Rich Entity without duplicating the
Task. `sentry.resolution_sync` and the confirmed `sentry.issue.resolve` action
remain separate write authority—read/link consent never implies resolution.

The preview Git providers use these provider-specific behaviors:

- GitHub uses `github.development_activity` for repository branches, commits,
  pull requests, checks, and deployments.
- GitLab.com uses `gitlab.development_activity` for numeric GitLab Project
  branches, commits, merge requests, pipelines, and deployments.
- Bitbucket Cloud uses `bitbucket.development_activity` for repository UUID and
  full-name branches, commits, pull requests, build statuses, pipelines, and
  deployments.

An explicitly enabled incoming Git-provider development behavior can link its
activity context to Tasks referenced by canonical Task code in accepted
provider text. Codes are matched case-insensitively at identifier boundaries
and resolve only inside the Assign Project bound to that resource. A connection
or Project/repository binding alone starts no webhook behavior. Duplicate or
older deliveries cannot replace a newer snapshot or its links; deleted branches
remain visible as stale context and reopened pull requests can return to Open.
Assign never completes a Task merely because a pull or merge request merged
unless a separate administrator-owned automation is explicitly configured.

Reconciliation checks only the resource attached to the subscription and uses
the same Task-link and ordering rules as webhooks. It runs in bounded pages; it
does not scan every repository or Project in an installation on each pass.
Bitbucket pipeline and deployment state is reconciled through REST because its
webhook catalog is not treated as a complete lifecycle feed.

GitLab and Bitbucket installation credentials are distinct from optional
personal authority. Assign refreshes expiring provider access credentials on
the server and stores only protected credential references; browsers and API
responses never receive provider access or refresh tokens. Signed inbound
webhooks continue to use the provider-specific webhook secret rather than a
person's delegated access token.

Bitbucket Cloud native Issues are not supported: Bitbucket removed those APIs
on 2026-08-20. The integration uses OAuth and REST, not new Connect app
registration. GitLab Self-Managed is also outside the current GitLab.com
preview because its network, certificate, base-URL, and version-support policy
requires separate qualification.

For optional pull-request automation, set
`configuration.pull_request_status_mappings` on an incoming
GitHub, GitLab, or Bitbucket development-activity behavior. Each entry contains `provider_state`
(`open`, `draft`, `merged`, `closed`, or `reopened`) and an active `status_id`
available to the bound Project. Omit the array, or leave it empty, to keep all
Task status changes off. Multiple provider states may use the same Status. If a
person moves a linked Task after automation, Assign preserves that manual move
and pauses further PR-driven moves for the Task until an administrator saves a
new behavior revision.

## Request an integration provider

```http
POST /api/v1/workspaces/{workspace_id}/integration-requests HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{
  "provider_name": "Jira",
  "use_case": "Link customer tickets to Assign Tasks."
}
```

Any active member of the current Workspace can submit a request. The provider
name is required and limited to 2–80 trimmed Unicode characters. The optional
use case is limited to 500 characters; whitespace runs are normalized to a
single paragraph. A retry with the same case-folded provider name by the same
member returns `200` with the same request identifier. It updates a newly
supplied use case instead of increasing demand. Requests by different members
remain distinct demand signals.

If the provider name or key already exists in the current Assign catalog, the
operation returns `409 integration_already_available`. A different Workspace
returns the same `404 not_found` shape as an absent Workspace. The response
contains the request identifier, Workspace identifier, normalized display
input, optional use case, and timestamps; no requester or aggregate demand list
is exposed.

## List a Task's Rich Entities

```http
GET /api/v1/tasks/{task_id}/rich-entities?limit=20 HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
```

A Rich Entity is Assign's stable reference to one provider-owned object, such
as a production error, pull request, deployment, or support conversation. It
does not replace or redefine the Task. Assign continues to own Task workflow;
the provider continues to own the external facts.

The endpoint returns persisted, structured snapshots and never calls a
provider API while serving the request. The default page size is 20 and the
maximum is 100. Continue with the opaque `next_cursor` exactly as returned.
Cursors are bound to the current Workspace and Task. An absent Task and a Task
outside the current Workspace both return `404`.

Version 1 snapshots can contain a title, summary, semantic status, up to eight
metrics, up to twelve typed scalar properties, and up to eight explicit
`open_external` actions. Links and actions use HTTPS. `sync_status`, the
optional safe `sync_message`, and `last_synced_at` let clients distinguish
current, stale, degraded, and unavailable provider context. Unsupported or
malformed stored snapshots are omitted rather than rendered as arbitrary
markup.

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

Generated TypeScript and PHP SDKs expose these operations through their
`IntegrationsApi` clients.
