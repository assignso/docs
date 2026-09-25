# Troubleshooting

- Use the exact HTTPS endpoint, including the trailing slash.
- If Codex reports `Dynamic client registration not supported`, its automatic
  selection attempted DCR. Remove and re-add the entry with the exact command
  above so Codex uses CIMD, then run the explicit `codex mcp login` command.
  Current Codex versions accept `--oauth-client-registration` on both `add` and
  `login`; upgrade Codex if that option is unavailable.
- If the browser opens at Assign login, finish signing in in that tab. Assign
  returns to the pending consent screen automatically; do not copy the callback
  URL or any token between windows.
- If OAuth succeeds but an already-running Codex task still reports
  `Auth required`, start a new task (or restart Codex). MCP transports created
  before login may retain their pre-authentication session until recreated.
- Complete browser approval with an active Assign Workspace, or use a live
  Workspace service credential in the bearer header.
- Request both `assign:read` and `assign:write` when a workflow needs to inspect
  and then change work.
- If an update reports a revision conflict, read the resource again and decide
  whether the newer state should be replaced. Do not blindly retry with a new
  revision.
- If a tool is rate limited, wait for the returned retry interval and retry the
  same operation with the same idempotency key.
- If a Knowledge or code tool disappears or returns `tool_unavailable`, refresh
  the client's tool list, then call `knowledge_status`. Its coverage shows
  whether a family is partial, stale, or unavailable without returning customer
  content. Confirm Project/repository scope or Workspace settings only when the
  diagnostic asks for that action.
- If a Knowledge call returns `knowledge_not_current`, wait for indexing to
  reach the requested source sequence, then retry with the same bounds.
- If a connection was unused for 90 days or reached one year, authorize it
  again from the client.
- If a client asks you to authorize again sooner, reconnect once, then report
  the client name and approximate time of the prompt. Do not send credentials;
  Assign support can distinguish refresh failure, revocation, membership loss,
  and refresh replay from safe server-side identifiers.
- If the settings page shows that a client or service credential is revoked,
  start a new authorization or create a replacement. Old credentials cannot be
  restored.

Assign never asks you to send an access token, refresh token, or service
credential to support.

## Task updates in open Assign views

Task changes made through MCP are saved by the same service as changes in
Assign. Open Task views and Project Lists are expected to update automatically,
including Status and list counts. After a connection interruption or returning
to a suspended tab, Assign revalidates the visible data. If a value remains
stale but a manual refresh shows the saved change, report the affected Task,
page, and approximate time; never include access tokens.
