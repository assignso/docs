---
description: Fix common MCP problems with sign-in, client registration, conflicts, rate limits, Knowledge availability and stale views.
---

# Troubleshooting

- Use the exact endpoint `https://mcp.assign.so/`, including the trailing slash.
- **`Dynamic client registration not supported`:** Codex tried DCR. Remove and re-add the entry with the
  [manual commands](./connect#codex) so it uses CIMD, then run `codex mcp login`. Upgrade Codex if it
  lacks `--oauth-client-registration`.
- **Browser opens at the Assign login:** finish signing in there. Assign returns to the consent screen
  itself, so don't copy callback URLs or tokens between windows.
- **`Auth required` after signing in:** start a new Codex task or restart Codex. Connections created
  before login can keep their old session.
- **Sign-in fails:** approve with an active Assign Workspace, or use a live [service
  credential](./security#service-credentials) as a bearer token.
- **Can't change anything:** request both `assign:read` and `assign:write` when a workflow inspects
  and then changes work.
- **Revision conflict:** read the resource again and decide whether the newer state should be replaced.
  Don't retry with a new revision blindly.
- **Rate limited:** wait for the retry interval, then retry the same operation with the same
  idempotency key.
- **Knowledge or code tool is missing or returns `tool_unavailable`:** refresh the client's tool list,
  then call `knowledge_status`. Its coverage shows what's partial, stale or unavailable, without
  returning content.
- **`knowledge_not_current`:** wait for indexing to catch up, then retry with the same bounds.
- **Asked to authorize again:** that's expected after 90 days unused, a year, or revocation. If it
  happens sooner, reconnect once and report the client name and approximate time to support, who can
  tell refresh failure, revocation, membership loss and replay apart. Old revoked credentials can't be
  restored, so authorize again or create a replacement.
- **Open Assign view looks stale:** Task changes made through MCP appear live, and Assign revalidates
  after a reconnect or when a suspended tab returns. If a manual refresh shows the change but the view
  didn't, report the Task, page and time.

Never send an access token, refresh token or service credential to support or include one in a report.

## Task preview unavailable <Badge type="warning" text="Pause awaiting deployment" />

Interactive previews will be paused in the next deployment. Use the Task link or ask for
Task details in chat. After deployment, reconnect if your client still shows an old preview.
See [Interactive previews](./previews).
