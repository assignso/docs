# Connect a client

Assign provides a remote Model Context Protocol server at
`https://mcp.assign.so/`. Add that exact URL as a remote MCP server in a
supported client. The client opens Assign in a browser, where you choose a
Workspace and approve read and, when needed, write access.

## Codex

Codex users only need that server URL. Assign discovers Codex through its
published client metadata (CIMD) and accepts the temporary localhost callback
port that Codex opens for the sign-in. No client ID or client secret is
required, and Assign intentionally does not offer open dynamic client
registration (DCR).

With the Codex CLI, register the server and complete browser authorization:

```sh
assign mcp setup codex
```

This convenience command first ensures interactive Assign CLI login, then uses
Codex's own supported MCP registration and OAuth commands. The existing browser
session normally avoids another credential entry, but Codex still receives a
separate, revocable MCP credential; the Assign CLI token is never shared.

### Local stdio bridge

For a client that needs stdio, opt in explicitly:

```sh
assign mcp setup codex --transport stdio --scopes assign:read
```

The local process forwards MCP JSON and streaming responses to the same remote
Assign MCP catalog. It exchanges the CLI credential for a short-lived,
non-refreshable MCP token whose scopes and lifetime can only be narrower than
the parent. The process remains bound to its first Workspace; reconnect after a
Workspace switch. Direct remote OAuth remains the default and is usually the
simplest choice.

### Manual Codex setup

You can also perform the same Codex steps directly:

```sh
codex mcp add assign --url https://mcp.assign.so/ \
  --oauth-resource https://mcp.assign.so/ \
  --oauth-client-registration cimd
codex mcp login assign --scopes assign:read,assign:write \
  --oauth-client-registration cimd
codex mcp list
```

Use only `assign:read` in the login command when the client should remain
read-only, or run `assign mcp setup codex --scopes assign:read`. Codex desktop,
the Codex CLI, and the Codex IDE integration share
the same MCP configuration. A trusted repository may instead declare the
remote server in `.codex/config.toml`; do not commit a bearer value. For a
non-interactive service, reference an environment variable with
`bearer_token_env_var` and store the secret in the service's approved secret
manager.

## Permissions at request time

Every request uses current Assign permissions. Disconnecting a client,
revoking a service credential, disabling Workspace AI access, or losing
Workspace membership takes effect immediately.

## Connection lifetime

Supported clients renew 15-minute access tokens in the background with a
rotating refresh credential. Normal access-token expiry does not require
another browser sign-in. A connection asks you to authorize again only after it
is disconnected, its credential is replayed or invalidated for security, it
remains unused for 90 days, every authorized Workspace membership is lost, or
the one-year authorization lifetime ends.

## Review or disconnect clients

Open **Account settings → MCP access**. Each connected client shows its scopes,
authorized Workspaces, last use, and authorization expiry. Choose
**Disconnect** to revoke its access and refresh credentials immediately.

Workspace owners and admins can open **Workspace settings → Developer tools**
and disable **AI integrations**. This immediately blocks existing and new MCP
access to that Workspace without disconnecting the same client from another
authorized Workspace.
