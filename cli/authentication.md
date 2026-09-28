---
description: Sign in to the Assign CLI with your browser, where credentials are stored, and how to use a personal API token in automation.
---

# Authentication

## Sign in with your browser

```sh
assign login
assign
```

`assign login` opens your system browser and waits up to two minutes. If the browser can't open, the
CLI prints a safe URL to visit instead. It never prints a code, token or verifier.

## Credential storage

Interactive access tokens last 15 minutes, and the CLI refreshes them automatically. If a refresh
token is reused, the sign-in is revoked and you run `assign login` again. Credentials are kept per API
host in macOS Keychain, Windows Credential Manager or the Linux and BSD Secret Service. Without a
native vault, the CLI uses a user-only file (mode `0600`) and moves it into the vault when one becomes
available.

## Automation with `ASSIGN_TOKEN`

For non-interactive use, create a personal API token in **Account settings → Security** for the one
Workspace you need:

```sh
export ASSIGN_TOKEN='apt_...'
assign
```

`ASSIGN_TOKEN` takes precedence over an interactive credential. Tokens are never accepted as
command-line arguments and are sent only to `https://api.assign.so`. Use `--host` only with an HTTPS
Assign API origin. `assign doctor` reports which credential source is in use, never its value.

## Sign out

`assign logout` revokes the interactive sign-in and removes the local credential. It doesn't revoke an
`ASSIGN_TOKEN`, so revoke those in **Account settings → Security**. A personal token is bound to its
Workspace, so `workspace list` and `workspace switch` need an interactive login.
