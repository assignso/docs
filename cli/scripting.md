---
description: Use the Assign CLI in scripts and CI with predictable output, exit codes and token handling.
---

# Scripting

The CLI is built to work in pipelines. Data goes to stdout and diagnostics go to stderr, so
`grep`, `awk`, `fzf` and other shell tools keep working.

```sh
export ASSIGN_TOKEN='apt_...'      # from your secret manager, never a literal in a script
assign project tasks PRO | grep -i release
assign search "on-call" | fzf
```

## Output

- Rows are plain text: a code or key, two spaces, then a title. For example, `PRO-123  Ship the slice`.
- Lists print at most the first 100 rows. When more exist, the CLI says so on stderr.
- `document show` prints at most 65,536 characters of text and marks any truncation.
- The CLI never prints internal Workspace, Project, Task or Document UUIDs, or credential values.
- A closed pipe (for example `assign project tasks | head -1`) exits successfully.

## Exit codes

| Code | Meaning | Typical cause |
| --- | --- | --- |
| `0` | Success | |
| `1` | Operation failed | Network failure or an unexpected HTTP status |
| `2` | Invalid arguments | Unknown command, missing argument, bad `--host` or a non-positive `--revision` |
| `3` | Authentication required or rejected | No credential, or the token was revoked or expired |
| `4` | Context not found | Unknown Workspace, Project or Document, or no Project selected |
| `5` | Conflict | The Task changed; read its revision again before retrying |
| `6` | Cancelled | The operation was cancelled |
| `130` | Interrupted | Ctrl+C |

```sh
if ! assign done "$CODE" --revision "$REV"; then
  case $? in
    5) echo "Task changed, refresh and decide again" >&2 ;;
    3) echo "Token missing or revoked" >&2 ;;
  esac
fi
```

## Tokens in automation

- Create a personal API token in **Account settings → Security** for the one Workspace the job
  needs. Store it in your CI secret store and expose it as `ASSIGN_TOKEN`.
- The CLI never accepts a token as a command-line argument, so it can't end up in shell history
  or process listings.
- The token is sent only to `https://api.assign.so` unless you pass an explicit HTTPS `--host`.
- `assign doctor` reports which credential source is in use, never its value.

## Retries

Task workflow commands send a new idempotency key and the `--revision` you supply on every run. A
retry after a network failure is safe. After a conflict (`5`), read the Task again and decide
whether the change still applies. Don't just retry with the newer revision.

## Shell completion

```sh
assign completion bash > ~/.local/share/bash-completion/completions/assign
assign completion zsh  > "${fpath[1]}/_assign"
assign completion fish > ~/.config/fish/completions/assign.fish
```
