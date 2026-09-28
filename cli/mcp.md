---
description: Register and authorize Assign MCP in Codex with one command, using a separate revocable credential.
---

# Set up MCP in Codex

With the Codex CLI installed, run:

```sh
assign mcp setup codex
```

If you haven't run `assign login`, setup starts that flow first. It then registers
`https://mcp.assign.so/` in Codex and starts Codex's own authorization. Your existing browser session
usually saves you from signing in again, but Assign still asks you to approve the Workspace and scopes.

CLI and MCP credentials are separate: Codex stores and refreshes its own revocable MCP credential, and
the CLI's tokens are never copied. For read-only access:

```sh
assign mcp setup codex --scopes assign:read
```

- Setup reuses a compatible existing `assign` entry. If that name points to another URL, a local
  process or an environment bearer token, setup refuses to overwrite it. Inspect it with
  `codex mcp get assign` and remove it first.
- Only the production Assign host is supported.
- For a local stdio server instead of remote OAuth, pass `--transport stdio`. Codex then starts
  `assign mcp serve`, which uses the CLI's credential to request a short-lived, non-refreshable token
  that can't exceed its parent. Logging out or revoking the parent ends it. The bridge stays on the
  Workspace it first connected to, so restart the connection after `assign workspace switch`.
- `--transport remote` is the default. Setup won't replace an entry that uses a different transport.

See [Connect a client](../mcp/connect) for manual setup and the [tool catalog](../mcp/tools).
