---
description: Upcoming application subscriptions, canonical reads and applied acknowledgements.
---

# Application realtime <Badge type="warning" text="Upcoming" />

This interface is under development and is not deployed or qualified for supported
client use. Existing integrations should keep their deployed transport until the
migration is announced. The upcoming contract removes the Workspace and private
Discuss SSE endpoints; clients using those endpoints must migrate to authorized
WebSocket subscriptions and canonical reads when the cutover is released. Native
client adoption and lifecycle handling have a separately owned migration.

The browser application connects to `/api/v1/realtime` using the WebSocket
subprotocol `assign.realtime.v1` and its existing session cookie. The handshake
requires the configured browser origin. Tokens in URLs and bearer authentication
are not accepted by this browser adapter. Generated HTTP SDK methods describe the
upgrade but do not implement a WebSocket connection.

## Migration from SSE

The upcoming contract removes these two event-stream operations:

| Removed operation | Replacement subscription | Recovery read |
| --- | --- | --- |
| `GET /api/v1/workspaces/{workspace_id}/events` | `workspace` and any required named private scopes on `/api/v1/realtime` | Authorized Workspace resource reads |
| `GET /api/v1/workspaces/{workspace_id}/discuss/events/stream` | `discuss` on `/api/v1/realtime` | `GET /api/v1/workspaces/{workspace_id}/discuss/events` and retained message/run reads |

At the announced cutover, replace SSE connection and retry code with one
authenticated application WebSocket owner. Capture a new baseline for each scope,
read and apply the currently retained resources, then subscribe and acknowledge
each checkpoint only after its required reads publish. SSE cursor and
`Last-Event-ID` values cannot be used as WebSocket cursors. On a gap, lost access
or reconnect, obtain new authorized baseline custody; do not infer currentness
from a connected socket. The bounded Discuss HTTP events page remains an ordinary
recovery read, not an SSE subscription. Generated HTTP SDKs expose the canonical
reads but do not manage socket lifecycle or applied acknowledgements.

The CLI terminal's Discuss view uses the removed private Discuss stream through
its local broker. It needs a separately owned WebSocket transport update before
the upcoming contract can support that view; this page does not indicate that
the CLI migration has shipped.

A native client may instead send its mobile OAuth access token in
`Authorization: Bearer mob_at_…`. It must omit `Origin` and cookies. For a
Workspace scope, send the selected Workspace UUID in `X-Assign-Workspace-ID`
on the socket handshake and baseline request. Account scopes omit that header.
The server checks current Workspace membership and token validity at admission
and while the subscription remains active. A revoked or expired access token
ends its subscriptions; reconnect with a valid token and obtain a new baseline.
Do not put a token in the URL. Native app migration and qualification remain
separate from this upcoming Core contract.

## IDE authentication

The upcoming socket also accepts a developer OAuth access token issued to
`assign-jetbrains` or `assign-vscode` with `assign:read`. Use
`Authorization: Bearer cli_at_…`, omit `Origin` and cookies, and request
`assign.realtime.v1`. The OAuth grant fixes the Workspace; if supplied,
`X-Assign-Workspace-ID` must match that Workspace on both the handshake and
baseline request. CLI, MCP and personal API tokens are not admitted.

IDE credentials support only `workspace`, `projects`, and `task_comments`.
Account and Discuss scopes are unavailable. Sign in through the system browser
using the host's registered client and loopback PKCE flow; store refresh tokens
in the host credential store and keep access tokens in memory. Never copy browser
cookies or put credentials in a URL. The extension host must support handshake
headers; browser WebSocket APIs cannot authenticate this way.

Expiry, grant revocation, Workspace switching and membership loss invalidate
socket authority. Refresh through the same IDE client, capture fresh baseline
custody and reconcile canonical reads before acknowledging events. A transport
connection alone does not establish current data. IDE owners and host
qualification remain pending; this contract is not deployed.

## Subscribe to a scope

After the server's `hello`, choose a supported scope and a unique subscription ID.
Each subscription has its own opaque cursor and applied acknowledgement.

| Scope | Context | Canonical reads |
| --- | --- | --- |
| `account` | Current User; no Workspace required | Current Account |
| `account_security` | Current User; no Workspace required | Account, sessions, linked identities, passkeys |
| `inbox` | Current User and selected Workspace | Inbox and notification preferences |
| `personal_projects` | Current User and selected Workspace | Project shortcuts and display preferences |
| `workspace` | Selected Workspace | Required authorized Workspace resources |
| `projects` | Selected Workspace | Project catalog |
| `task_comments` | Selected Workspace and Task | Task Comments |
| `discuss` | Current User and selected Workspace | Private Discuss transcript and run state |

Account subscriptions omit `workspace_id`. Other scopes require the selected
Workspace. Private collection updates are delivered through their named scopes;
ordinary Workspace subscriptions do not include them.

The `discuss` scope has its own session-bound private sequence. Its `discuss_hints`
contain message IDs and sequence numbers, without text or tool payloads. Obtain
its cursor from `/api/v1/realtime/baseline?scope=discuss`, then read and apply
the authorized bounded transcript and retained run state before acknowledging a
checkpoint. This cursor cannot be used as a Workspace journal position.

## Read, apply and acknowledge

For a private canonical read, set `X-Assign-Realtime-Baseline` to the matching
scope in the table. A successful response includes `X-Assign-Realtime-Cursor` and
`X-Assign-Realtime-Position`. Keep the cursor opaque and the position as a decimal
string. `/api/v1/realtime/baseline` also supplies routing cursors; its content-free
responses do not replace canonical resource reads.

Time policy, Task entry lists and totals, Project totals and personal timesheet
reads accept `X-Assign-Realtime-Baseline: 1` for the Workspace subscription. The
same header applies to Agent instance lists/details, Studio catalog, definition,
profile, request and usage reads, hosted Agent run history/detail/action/output
reads, and private Discuss specialist collection/detail reads. These upcoming
reads return their content and cursor from one
snapshot. A `time_tracking` or `agents` hint identifies the Workspace collection;
read the authorized resources your application currently displays. Time policy
changes use a `workspace` hint.

An `agent_runs` hint identifies changed hosted Agent run activity for a current
`agents:read` Workspace member. It contains the Workspace ID, so read the
authorized run list and any open run, action, approval or output view to learn
what changed. Studio request/profile/usage and Discuss specialist views also
reconcile through their authorized canonical reads; a specialist read retains
its current private recipient and Task access checks. The hint does not identify
a run or reveal its content. Keep terminal runs subscribed while their actions or
outputs remain open: a later receipt can change those views. For a retained
specialist missing from the newest collection page, read its detail by ID;
absence from one page does not establish deletion.

An `integrations` hint asks you to refresh the integration views you currently
display. It contains only the Workspace ID. Reads of installations, resources,
your personal identities, Project bindings, subscriptions, action definitions and
action status accept `X-Assign-Realtime-Baseline: 1`. Apply each retained page and
open detail before acknowledging. Personal-identity changes are sent only to the
affected User; shared installation changes can also affect that User's list.
Reading action status never repeats the provider action. The provider catalog is
loaded at startup and does not use a database baseline. An invalid baseline
request returns `realtime_baseline_invalid`; an unavailable snapshot returns
`realtime_baseline_unavailable` without a cursor.

A `billing` or `credits` hint contains only the Workspace ID. Refresh the
currently displayed authorized billing, credit balance, and feature-availability
reads before acknowledging it. Billing-account and invoice changes are released
only to Workspace billing managers. The hint never contains payment-provider or
credit-ledger details.

A `knowledge` hint asks you to refresh the Knowledge results and related Task
context you currently display. It contains only the Workspace ID and can follow
summary application, indexing progress or suggestion feedback. Knowledge search,
answer and Task related-context reads accept `X-Assign-Realtime-Baseline: 1` and
return an optional cursor and position on success. Core captures the replay
boundary before calling Knowledge; a `stale` response still means the derived
index has not caught up. Apply the currently displayed results before ACK.

An event is an invalidation signal. Reread and apply all required retained state
before sending an `ack` with the exact cursor received for that subscription.
Receiving a frame, completing one page or opening the socket does not establish
that the application is current. Each subscription allows one outstanding
checkpoint.

While your application remains visible and caught up, send `presence_renew`
with the Workspace subscription ID and its last applied cursor at most once
every 15 seconds. A transport pong does not renew Workspace presence. Stop
renewing when the application is hidden, loses access or falls behind.

After applying a Workspace checkpoint, send `presence_observe` with the same
subscription ID and cursor and up to 256 distinct active member User IDs. An
empty `users` list clears observation. A `presence` frame is a complete snapshot
for that selection, with an epoch and revision; update the selected members
together. Treat `presence_unknown` or a lost application connection as unknown,
not offline. Renew the eligible application session as above while visible; a
recovered observer receives a fresh snapshot before showing member status.

On `baseline_required`, discard old custody and obtain fresh authorized reads.
On `authentication_required`, end the connection and reauthenticate through the
existing sign-in flow. Never reuse private cursors across sessions or scopes.
Source-health messages describe the server's source connection, independently of
whether your client has applied its updates.

The [OpenAPI document](/openapi.yaml) describes HTTP parameters and responses.
