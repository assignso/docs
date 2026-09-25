---
description: Register and authorize Assign MCP in Codex with one command, using a separate revocable credential.
---

# Set up MCP in Codex

After installing the Codex CLI, configure and authorize Assign MCP with one
command:

```sh
assign mcp setup codex
```

If you have not run `assign login`, setup starts that browser flow first. It
then registers `https://mcp.assign.so/` in Codex and starts Codex's own OAuth
authorization. Your existing browser session normally means you do not enter
your Assign credentials again, although Assign still shows the MCP Workspace
and scope consent.

CLI and MCP credentials remain separate. The command never copies or exposes
the CLI access or refresh token; Codex stores and refreshes its own revocable,
MCP-scoped credential. Use a read-only grant when writes are unnecessary:

```sh
assign mcp setup codex --scopes assign:read
```

Setup reuses a compatible existing `assign` server entry. If that name points
to another URL, a local process, or an environment bearer token, setup refuses
to overwrite it; inspect it with `codex mcp get assign` and remove it explicitly
before retrying. The command currently supports only the production Assign host.

If the client needs a local stdio server instead of direct remote OAuth, select
that transport explicitly:

```sh
assign mcp setup codex --transport stdio --scopes assign:read
```

Codex starts `assign mcp serve` when it needs the connection. The process uses
the CLI's secure credential to request a short-lived, non-refreshable MCP token;
it does not print or copy the CLI credential into client configuration. The
token cannot outlive or outscope its parent, and parent logout, expiry, or
revocation invalidates it immediately. One running bridge stays pinned to the
Workspace selected when it first connects. After `assign workspace switch`,
restart the MCP connection so a new process can bind to the new Workspace.

Direct remote OAuth remains the default. Use `--transport remote` when a script
should state that choice explicitly. Setup refuses to replace an existing entry
whose transport differs.

See [Connect a client](../mcp/connect) for manual Codex setup and the full
[MCP tool catalog](../mcp/tools).
