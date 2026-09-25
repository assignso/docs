---
description: Every Assign CLI command, argument, flag and alias.
outline: [2, 3]
---

# Command reference

Every command accepts the global `--host <https-origin>` flag. It defaults to
`https://api.assign.so` and accepts HTTPS only. Run `assign <command> --help` to see the help
shipped with your installed binary.

## Overview

| Command | Purpose |
| --- | --- |
| `assign` | List your active Tasks in the current Workspace |
| [`login`](#login) / [`logout`](#logout) | Sign in through the browser, or revoke the interactive credential |
| [`search <query>`](#search) | Search Tasks and Documents |
| [`start`, `done`, `reopen`](#task-workflow) | Move a Task through its workflow |
| [`workspace`](#workspace) | List, show and switch Workspaces |
| [`project`](#project) | List, select and inspect Projects, their Tasks and Documents |
| [`document`](#document) | List, read and open Documents |
| [`discuss`](#discuss) | Open Discuss in the terminal |
| [`mcp setup codex`](#mcp) | Configure Assign MCP in Codex |
| [`update`](#update) | Check for and install CLI updates |
| [`doctor`](#doctor) | Run redacted local diagnostics |
| [`completion`](#completion) | Generate shell completion |
| [`aliases`](#aliases) | List command aliases |
| [`version`](#version) | Print version and build information |

## Account

### login

```sh
assign login
```

Sign in through the system browser with Authorization Code and PKCE. See
[Authentication](./authentication).

### logout

```sh
assign logout
```

Revoke the interactive refresh family and remove the local credential. Doesn't affect
`ASSIGN_TOKEN`.

## Work

### Your Tasks

```sh
assign
```

Lists active Tasks assigned to you in the credential's Workspace, one `CODE  Title` row per Task.

### search

```sh
assign search "<query>"
```

Searches Tasks and Documents in the credential's Workspace.

### Task workflow

```sh
assign start  <TASK-CODE> --revision <n>
assign done   <TASK-CODE> --revision <n>
assign reopen <TASK-CODE> --revision <n>
```

| Command | Effect |
| --- | --- |
| `start` | Start the Task and assign it to you |
| `done` | Complete the Task |
| `reopen` | Reopen a completed Task |

`--revision` is required and must be the Task's current revision. It is the `revision` field
that the [Tasks API](../api/tasks#read-a-task) returns. The CLI doesn't print Task revisions yet. Each request sends a fresh
`Idempotency-Key` and `If-Match`, so a stale revision fails with exit code `5` instead of
overwriting a newer change. The same actions are available as `assign task <action>`.

## Navigation

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

### workspace

| Subcommand | Aliases | Purpose |
| --- | --- | --- |
| `workspace current` | `cur` | Print the current Workspace |
| `workspace list` | `ls` | List available Workspaces |
| `workspace show` | `view` | Show the current Workspace |
| `workspace switch <slug>` | `use`, `sw` | Switch the interactive credential to another Workspace |

### project

| Subcommand | Aliases | Purpose |
| --- | --- | --- |
| `project list` | `ls` | List Projects in the current Workspace |
| `project current` | `cur` | Print the selected Project key |
| `project show [KEY]` | `view` | Show a Project |
| `project switch <KEY>` | `use`, `sw` | Select the current Project |
| `project tasks [KEY]` | `t` | List a Project's Tasks |
| `project documents [KEY]` | `docs`, `doc` | List a Project's Documents |
| `project url [KEY]` | | Print the Project's browser URL |
| `project open [KEY]` | | Open the Project in the browser |

### document

| Subcommand | Aliases | Purpose |
| --- | --- | --- |
| `document list [--project KEY]` | `ls` | List Documents, optionally for one Project (`-p`) |
| `document show <path>` | `view` | Print metadata and extracted text |
| `document url <path>` | | Print the Document's browser URL |
| `document open <path>` | | Open the Document in the browser |

## Integrations

### discuss

```sh
assign discuss
```

Opens the current Workspace's Discuss thread. Requires a TTY. See
[Discuss in the terminal](./discuss).

### mcp

```sh
assign mcp setup codex [--transport remote|stdio] [--scopes assign:read[,assign:write]]
```

| Flag | Default | Description |
| --- | --- | --- |
| `--transport` | `remote` | `remote` registers `https://mcp.assign.so/` with OAuth; `stdio` runs a local bridge |
| `--scopes` | `assign:read,assign:write` | Requested MCP scopes |

See [Set up MCP in Codex](./mcp).

## Maintenance

### update

```sh
assign update           # same as update check
assign update check
assign update install
```

`check` compares the installed release with the latest release in its channel. `install` prints
the verified installer command for your platform.

### doctor

```sh
assign doctor
```

Prints one redacted line each for the host, credential source, Git repository detection and
runtime. It exits with code `3` when no credential is configured:

```text
host ok https://api.assign.so
credential ok browser login
repository optional unavailable
runtime ok darwin/arm64
```

### completion

```sh
assign completion bash|zsh|fish
```

Writes a completion script to stdout. For example, `assign completion zsh > "${fpath[1]}/_assign"`.

### version

```sh
assign version
```

Prints the release, commit and build date.

## Aliases

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
