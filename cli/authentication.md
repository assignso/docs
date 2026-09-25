---
description: How the Assign CLI signs in with PKCE, stores credentials in your OS vault and uses personal API tokens for automation.
---

# Authentication

## Sign in with your browser

Sign in interactively with the system browser:

```sh
assign login
assign
```

`assign login` binds a local callback on `127.0.0.1` before opening the browser,
uses Authorization Code with PKCE `S256`, and waits for at most two minutes.
If the browser cannot be opened, the CLI prints a safe URL that contains state
and a PKCE challenge but no code, verifier, access token, or refresh token.
The callback accepts the exact state once and renders only a short completion
page.

## Credential storage and refresh

Interactive access tokens last 15 minutes. The CLI refreshes them automatically
with a rotating refresh token; reuse of an already-consumed refresh token
revokes the family and requires `assign login` again. Credentials are
partitioned by API host. The CLI prefers macOS Keychain, Windows Credential
Manager, or the Linux/BSD Secret Service. If the native vault is unavailable,
it uses an atomic user-config file with mode `0600`; it migrates that fallback
into the vault when secure storage later becomes available.

## Automation with `ASSIGN_TOKEN`

For non-interactive automation, set `ASSIGN_TOKEN` to a personal API token
created in Account settings for the one Workspace you intend to use:

```sh
export ASSIGN_TOKEN='apt_...'
assign
```

## Precedence and hosts

`ASSIGN_TOKEN` takes precedence over an interactive credential. The command
sends either token only to `https://api.assign.so` by default. Use `--host`
only with an explicit HTTPS Assign API origin. Tokens are never accepted as
command-line arguments and `assign doctor` reports only the credential source,
never its value.

## Sign out

`assign logout` revokes the interactive refresh family and removes the local credential. It never
revokes an `ASSIGN_TOKEN` personal token; revoke those in **Account settings → Security**.

Personal API tokens are bound to the Workspace in which they were created. `workspace list` and
`workspace switch` therefore require interactive login.
