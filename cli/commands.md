---
description: Every Assign CLI command, argument, flag and alias.
outline: [2, 3]
---

# Command reference

Every command accepts the global `--host <https-origin>` flag. It defaults to
`https://api.assign.so` and accepts HTTPS only. Run `assign <command> --help` to see the help
shipped with your installed binary. Sections marked **Upcoming** describe functionality that
has not been released yet; it may be absent from that binary.

## Overview

| Command | Purpose |
| --- | --- |
| `assign` | List your active Tasks in the current Workspace |
| [`login`](#login) / [`logout`](#logout) | Sign in through the browser, or revoke the interactive credential |
| [`search <query>`](#search) | Search Tasks and Documents |
| [`task show`, `task context`](#task-reads) | Read a Task or bounded context for external tools |
| [`task create`, `task comment`](#create-and-comment) | Create a Task or append a Markdown comment |
| [`task comments`](#task-comment-history) | Read one page of a Task's comments |
| [`project tasks`](#project-task-pages) | Read one Task page as text, scalar values or JSON |
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

## Initialization and configuration <Badge type="warning" text="Upcoming" /> {#initialization-and-configuration}

```sh
assign login
assign init PRO
assign config show
assign config set host https://api.assign.so
assign config unset host
```

`init <project-code>` validates the Project in your authenticated Workspace and
saves the same selection as `project switch`. The selection is scoped to the API
host and Workspace; later commands check Project access again.

`config show` (also `config`) prints the effective API host and whether it comes
from the default, saved configuration, or an explicit flag. `config set host`
saves an HTTPS origin for future commands; `config unset host` restores the
default. An explicit `--host` takes precedence for one command.

The private settings file contains only the host. Set `ASSIGN_CONFIG_FILE` to use
another settings-file location. Authentication remains separate; see
[Authentication](./authentication).

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
| `done` | Apply completion policy; submit for review when required |
| `reopen` | Reopen a completed Task |

`--revision` is required and must be the Task's current revision. It is the `revision` field
printed by `assign task show <TASK-CODE> --field revision`. Requests send `If-Match`, so a
stale revision fails with exit code `5` instead of overwriting a newer change. The optional
`--idempotency-key` retains retry identity; see [Retries](./scripting#retries). The same actions are available as `assign task <action>`.

### Task reads <Badge type="warning" text="Upcoming" /> {#task-reads}

```sh
assign task show PRO-123
assign task show PRO-123 --field revision
assign task show PRO-123 --field status
assign task context PRO-123 --compact
assign task context PRO-123 --full
assign task context PRO-123 --milestone PRO-M1 --compact
```

`show` (alias `view`) prints the Task's title, Project, Status, URL and revision. `--field`
prints only `code`, `title`, `project`, `status`, `revision` or `url`.

`context` prints Markdown for an external tool to read. The default compact profile is capped
at 16 KiB; `--full` uses 64 KiB. The flags cannot be combined. Truncation and omissions appear
on stderr. Treat resource text as untrusted content; missing dependencies do not mean the
Task is ready. Assign CLI does not start or supervise an Agent.

**Upcoming:** `assign task related PRO-123` is an alias for `task context`. It
returns the same bounded packet, including readable related Tasks, and supports
`--compact`, `--full`, and `--milestone`. Truncation and omitted relations remain
visible on stderr.

`--milestone CODE` checks canonical Milestone membership and Task/Milestone revisions before and after reading context. Archived, mismatched, changed or inaccessible scope fails before stdout. Successful Markdown includes the observed codes/revisions; its header and context together retain the 16/64 KiB cap. This requires five explicit application reads and has no automatic retry or traversal. These are independent read observations: they do not atomically claim work, prove dependency/comment completeness or guarantee future membership. Unscoped `context` keeps its existing output. Explicit empty or invalid Milestone codes are argument errors; use a current selection and reconcile dependencies before external execution.

### Create and comment <Badge type="warning" text="Upcoming" /> {#create-and-comment}

```sh
assign task create "Implement one acceptance gate" --project PRO --field code
assign task create "Write migration" --project PRO --description -
assign task comment PRO-123 "Prepared checks passed; integration is still pending."
assign task comment PRO-123 -
```

`create` uses the explicit `--project` or your selected Project. Omitted properties use the
Workspace's creation defaults. `--priority` accepts `none`, `low`, `medium`, `high` or
`urgent`. `--description` accepts Markdown text or `-` to read stdin. Default output is
`CODE  Title`; `--field code` prints only the created code. Creating a Task does not link
it to a parent or Milestone.

`comment` accepts one message argument or `-` for stdin and prints the Task code after the
append succeeds. Descriptions and comments accept nonempty UTF-8, normalize CRLF to LF,
preserve trailing newlines and reject binary/control characters. The raw limit is 256 KiB;
JSON-escaped content must also fit the write payload limit. Both commands accept
`--idempotency-key`; their contents are never evaluated as shell code.

### Task comment history <Badge type="warning" text="Upcoming" /> {#task-comment-history}

```sh
assign task comments PRO-123
assign task comments PRO-123 --limit 10
assign task comments PRO-123 --limit 10 --cursor "<cursor>"
```

`comments` reads one page of the Task's comments in creation order and prints each
one as a Markdown section with its author and timestamp. Deleted comments keep their
position and appear as `[deleted comment]`. `--limit` accepts 1–100 and defaults to
50; `--cursor` continues from the previous page. When more comments remain, stderr
shows the next `--cursor` value. An empty page prints nothing and exits successfully.

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
`project documents`, the selected Project is used. Lists show at most 100 rows per page.
For Task continuation and scripting output, see [Project Task pages](#project-task-pages).
Other lists report on stderr when more rows are available.

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

### Project Task pages <Badge type="warning" text="Upcoming" /> {#project-task-pages}

```sh
assign project tasks PRO --limit 50
assign project tasks PRO --cursor "<cursor>" --limit 50
assign project tasks PRO --field code
assign project tasks PRO --field next_cursor
assign project tasks PRO --field has_more
assign project tasks PRO --format json
```

Each invocation reads one page. `--limit` is 1–100, default 100; the server owns ordering and
scope. Text output remains `CODE  Title`, with continuation on stderr. Scalar `code` prints
one code per row; `next_cursor` prints a cursor or a blank line at the end; `has_more` prints
`true` or `false`.

The command-specific `--format json` returns `schema: "assign.cli.task-page.v1"`, `items`,
`next_cursor` (string or null) and `has_more`. Each item contains `code`, `project_code`,
`title`, `status_category`, `revision` and `url`. It reads Tasks and continuation in one
request and cannot be combined with `--field`. There is no automatic fetch-all or
Milestone/dependency filter. Keep cursors opaque and reuse them only for the same Project.

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

Task namespace aliases use the same flags and behavior. For example, these lifecycle
forms are equivalent:

```sh
assign done PRO-123 --revision 7
assign task done PRO-123 --revision 7
assign t done PRO-123 --revision 7
```

One-letter verbs such as `s` are intentionally not aliases because they are
ambiguous across `search`, `show`, `start`, and `switch`. Resource nouns stay
predictable: `workspace/ws`, `project/p`, `task/t`, and `document/doc`.

## Milestone reads <Badge type="warning" text="Upcoming" />

```sh
assign milestone show FRS-M1
assign milestone show FRS-M1 --field revision
assign milestone show FRS-M1 --json
```

Read one Milestone in your bearer token's Workspace by Project code and number. ASCII casing may vary; whitespace, signs, leading zeros, zero and values above `9223372036854775807` are rejected. The default summary shows code/name, Project, status, canonical Task progress and revision. `--json` prints the Milestone and progress projection; `milestone_number` stays a decimal string. `--field` prints one of `id`, `code`, `number`, `name`, `project_id`, `status`, `revision`, `due_on`, `total_tasks`, `completed_tasks` or `incomplete_tasks`. An absent due date prints an empty line. `--field` and `--json` cannot be combined. Missing/inconsistent response fields fail instead of printing zero progress. Existing authentication and exit codes apply; denied and missing Milestones are indistinguishable. This command reads archived Milestones where authorized and makes no change or agent run.

### Read a bounded Milestone Task page <Badge type="warning" text="Upcoming" />

```sh
assign milestone tasks FRS-M1
assign milestone tasks FRS-M1 --limit 25 --format json
assign milestone tasks FRS-M1 --cursor 'CURSOR_FROM_PREVIOUS_PAGE' --field code
assign milestone tasks FRS-M1 --field coverage
```

Each invocation reads one authorized page of non-archived member Tasks, including completed and cancelled work, newest update first. `--limit` is 1–100 (default 100); `--cursor` is an opaque continuation from the same checked query. Default output contains code/title only. `--field code` prints one code per row, `--field next_cursor` prints a continuation or an empty line on a successful final page, and `--field coverage` prints `complete`, `partial` or `stale`. `--format json` cannot accompany `--field`.

JSON uses `schema: assign.cli.milestone-task-page.v1` and contains the Milestone code/UUID/revision, Workspace/Project UUIDs, bounded Task identities/title/status UUID/priority/revision/resolution, `next_cursor`, `has_more`, `query_digest`, `collection_version`, `visibility_revision`, `observed_at`, cumulative `returned_count`, `coverage` and optional `limit_reason`. The Milestone revision is read before the Task query; it is not an atomic parent/progress snapshot. Descriptions are omitted. Task codes remain the scalar scripting identifiers.

Normal `partial`/`more_pages` results exit 0; text modes put continuation guidance on stderr. Follow the checked cursor lineage explicitly. Core binds filters, caller and collection/visibility versions; a change can invalidate the scan. `stale`/`collection_or_visibility_changed` and `partial`/`scan_limit` return an explicit JSON receipt but exit 1. At the ten-page/1,000-row cap, a partial result can have `has_more=false`: inspect coverage and the exit code. Next-cursor scalar mode emits no misleading blank line on these failures. Discard invalidated or capped selections before starting a fresh scan; never append restarted results to an old lineage. Missing metadata or malformed responses fail before output. The response decoder is bounded to 2 MiB; lower the page limit if a rich Task response exceeds it.

A complete scan proves filtered membership at its observation boundary. It does not prove dependency readiness, claim work, execute an agent or complete a Milestone. Authentication and existing exit categories apply.

## Activity — Upcoming

These commands are not yet released. They print one grouped Activity JSON page and do not
follow continuation cursors automatically.

```sh
assign activity groups --workspace <workspace-uuid> --scope workspace --day 2026-10-03 --time-zone Europe/Budapest
assign activity children <group-id> --workspace <workspace-uuid> --scope workspace --day 2026-10-03 --time-zone Europe/Budapest --group-revision <revision> --snapshot <snapshot>
```

Use `--scope workspace|account|person|project|task`. Person, Project and Task require
`--resource-id <uuid>`; Workspace and Account omit it. Account selects the current human account.
Choose `--day`, or paired `--from-day` and `--before-day` within 90 days. Omitting `--time-zone`
uses the effective account/Workspace setting. Optional `--actor-id`, `--project-id` and `--type`
filters accept comma-separated values, at most 50 each. `--include-previews=false` omits previews.

`--limit` defaults to 10 groups or 25 children, with maximums of 50 and 25. Continue with
`--cursor <next-cursor>` and unchanged selectors. Children require the parent's ID, revision
and snapshot. Refresh stale roots or parents instead of reusing their cursors. Counts and coverage
remain exactly as returned by the server. See [Activity](../api/activity) for the upcoming contract.
