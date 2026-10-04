---
description: Connect Codex or another remote MCP client to Assign with OAuth, or use a local bridge, and review or disconnect clients.
---

# Connect a client

Add `https://mcp.assign.so/` as a remote MCP server in a client that supports OAuth. The client opens
Assign in a browser where you approve Workspace access and read and, if needed, write access.

## Select Workspaces <Badge type="warning" text="Awaiting deployment" />

Consent lets you select the Workspaces this connection can access. Only your active memberships
with AI integrations enabled are offered; you can narrow the selection before approving.

## Codex

Codex needs only the server URL. Assign identifies it through its published client metadata (CIMD) and
accepts the temporary localhost callback port Codex opens. You don't need to supply a client ID or secret.

```sh
assign mcp setup codex
```

This signs in to the Assign CLI if needed, then registers the server and starts authorization through
Codex's own commands. Codex gets its own revocable MCP credential, and your CLI token is never shared.

To do the same steps by hand:

```sh
codex mcp add assign --url https://mcp.assign.so/ \
  --oauth-resource https://mcp.assign.so/ \
  --oauth-client-registration cimd
codex mcp login assign --scopes assign:read,assign:write \
  --oauth-client-registration cimd
codex mcp list
```

Use only `assign:read` to keep the client read-only, or run
`assign mcp setup codex --scopes assign:read`. Codex desktop, CLI and IDE share one MCP configuration.
A trusted repository can declare the server in `.codex/config.toml`, but never commit a bearer value.
For a service, set `bearer_token_env_var` and keep the secret in your secret manager.

### Local stdio bridge

If a client needs stdio:

```sh
assign mcp setup codex --transport stdio --scopes assign:read
```

The local process forwards MCP traffic to the same remote catalog. It exchanges your CLI credential for a
short-lived, non-refreshable MCP token with equal or narrower scopes and lifetime. It stays bound to
its first Workspace, so reconnect after switching. Remote OAuth is the default and usually simpler.

## Native OAuth clients <Badge type="warning" text="Awaiting deployment" />

Clients that support Dynamic Client Registration can register a public native client during sign-in.
The callback must be an HTTP loopback address, and the client must use Authorization Code with S256
PKCE and `token_endpoint_auth_method: none`. Approve the requested Workspaces and scopes in Assign.
A registered client receives no access until you approve it. Its name appears as **Unverified**.
If registration is temporarily unavailable, wait for the server’s retry interval before trying again.

Hosted web clients with HTTPS callbacks need a reviewed registration. Registration support alone
doesn't establish compatibility with a particular client. [Interactive previews](./previews) will be paused in the next deployment; clients will use
the normal text and structured responses.

## Permissions and lifetime

Every request uses your current Assign permissions. Disconnecting a client, revoking a service
credential, disabling Workspace AI access or losing membership takes effect immediately.

Clients renew 15-minute access tokens in the background, so normal expiry needs no new sign-in. You
authorize again only if the connection is disconnected, invalidated for security, unused for 90 days,
left without any authorized Workspace or past its one-year lifetime.

## Review or disconnect

Open **Account settings → MCP access** to see each client's scopes, authorized Workspaces, last use
and expiry. The page shows up to 100 connections at a time; use **Next page** to see more or
**Back to first page** to start again. The visible page updates when a connection changes.
**Disconnect** revokes its access immediately.

Workspace owners and admins can turn off **AI integrations** in **Workspace settings → Developer
tools**. That blocks existing and new MCP access to that Workspace without disconnecting the client
from others.
The policy and service-credential list update when Workspace access changes.
Expired credentials disappear from the list at their expiry time.

## Reviewed native metadata <Badge type="warning" text="Awaiting deployment" />

A reviewed native client can identify itself through published OAuth client metadata.
You still approve access through Assign consent. A metadata identity does not grant
access by itself, and hosted clients may require a separate registration.
