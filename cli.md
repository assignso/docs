# Assign CLI

## Install and update

Homebrew-managed macOS/Linux installations use `brew upgrade --cask assign`.
After signed stable releases are available, direct user-scoped installers are
also available: macOS/Linux use
`curl https://assign.so/install.sh | sh`,
and Windows PowerShell uses
`irm https://github.com/assignso/assign-cli/releases/latest/download/install.ps1 | iex`.
Both installers verify the published SHA-256 archive checksum and reject an
unsigned macOS or Windows executable. Run `assign update check` to compare the
installed SemVer release with the latest release in its channel. The CLI does
not scan during ordinary interactive or scripted commands, and it never updates
itself without an explicit command.

`https://assign.so/install.sh` is an Assign-owned macOS/Linux wrapper. It
checks the operating system and runs the verified GitHub Release installer; the
release asset remains the only installer implementation.

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

Interactive access tokens last 15 minutes. The CLI refreshes them automatically
with a rotating refresh token; reuse of an already-consumed refresh token
revokes the family and requires `assign login` again. Credentials are
partitioned by API host. The CLI prefers macOS Keychain, Windows Credential
Manager, or the Linux/BSD Secret Service. If the native vault is unavailable,
it uses an atomic user-config file with mode `0600`; it migrates that fallback
into the vault when secure storage later becomes available.

For non-interactive automation, set `ASSIGN_TOKEN` to a personal API token
created in Account settings for the one Workspace you intend to use:

```sh
export ASSIGN_TOKEN='apt_...'
assign
```

Each row uses the same immutable Task code shown in Assign's UI, for example:

```text
PRO-123  Ship the slice
```

`ASSIGN_TOKEN` takes precedence over an interactive credential. The command
sends either token only to `https://api.assign.so` by default. Use `--host`
only with an explicit HTTPS Assign API origin. Tokens are never accepted as
command-line arguments and `assign doctor` reports only the credential source,
never its value.

## Set up Assign MCP in Codex

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

Bare `assign` returns active Tasks assigned to the credential owner in its
bound Workspace. `assign search <query>` searches the bounded Task/Document
projection. `assign start|done|reopen <TASK-CODE> --revision <n>` uses the
canonical revision-checked, idempotent Task workflow. `assign logout` revokes
the interactive refresh family and removes the local credential; it never
revokes `ASSIGN_TOKEN` personal tokens.

## Workspace, Project, and Document navigation

Interactive login is bound to one Workspace at a time. List memberships and
rotate the credential safely when switching:

```sh
assign workspace current
assign workspace list
assign workspace show
assign workspace switch another-workspace
```

`workspace switch` validates the membership, revokes the old access/refresh
family, stores a new Workspace-bound credential, and prints the selected slug.
Personal API tokens remain bound to the Workspace in which they were created,
so `workspace list` and `workspace switch` require interactive login.

Projects use their immutable uppercase key. Selecting one stores only a local
hint, partitioned by API host and Workspace; every later read is authorized by
the server again.

```sh
assign project list
assign project show PRO
assign project switch PRO
assign project current
assign project tasks PRO
assign project documents PRO
assign project url PRO
assign project open PRO
```

When a Project argument is omitted from `project show`, `project tasks`, or
`project documents`, the selected Project is used. Lists show at most the first
100 rows and report on stderr when more are available.

Documents are read-only in this CLI slice and use their canonical path:

```sh
assign document list
assign document list --project PRO
assign document show release-plan
assign document url release-plan
assign document open release-plan
```

`document show` prints metadata followed by server-extracted text. Responses
are bounded to 65,536 characters and carry a visible truncation marker when the
Document is longer. The CLI never prints internal Workspace, Project, Task, or
Document UUIDs.

## Command aliases

Aliases are concise spellings of the same command. They use the same arguments,
permissions, API operations, output, errors, and exit codes as the canonical
form. Scripts may use aliases, but the canonical form is usually clearer in
shared automation. Run `assign aliases` for the table shipped by the installed
binary or `assign <command> --help` to inspect one command.

| Alias | Canonical command |
| --- | --- |
| `signin` | `login` |
| `signout` | `logout` |
| `find` | `search` |
| `t` | `task` |
| `ws` | `workspace` |
| `p` | `project` |
| `doc` | `document` |
| `completions` | `completion` |
| `v` | `version` |
| `diag`, `diagnose` | `doctor` |

The current Task namespace exposes the implemented lifecycle actions, so these
forms are equivalent:

```sh
assign done PRO-123 --revision 7
assign task done PRO-123 --revision 7
assign t done PRO-123 --revision 7
```

One-letter verbs such as `s` are intentionally not aliases because they are
ambiguous across `search`, `show`, `start`, and `switch`. Resource nouns stay
predictable: `workspace/ws`, `project/p`, `task/t`, and `document/doc`.
