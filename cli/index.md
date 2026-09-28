---
description: Install the Assign CLI on macOS, Linux or Windows and work with Tasks, Projects, Documents and Discuss from your terminal.
---

# Assign CLI

`assign` is a native command-line client for Assign. It shows your current work, searches the
Workspace, moves Tasks through their workflow, reads Projects and Documents, opens Discuss in a
full-screen terminal and sets up Assign MCP in Codex.

```sh
assign login            # sign in through your browser
assign                  # your active Tasks
assign search "release notes"
assign done PRO-123 --revision 7
```

## Install

::: code-group

```sh [Homebrew]
brew install assignso/tap/assign
```

```sh [macOS / Linux]
curl https://assign.so/install.sh | sh
```

```powershell [Windows]
irm https://github.com/assignso/assign-cli/releases/latest/download/install.ps1 | iex
```

:::

The direct installers pick the right archive for your CPU, verify its SHA-256 checksum and refuse
an unsigned macOS or Windows executable. They install into a user-owned directory and don't need
Node.js or a package manager. `https://assign.so/install.sh` is a small Assign-hosted wrapper that
checks your operating system and runs the installer from the GitHub release.

::: warning Release candidates
The CLI is currently published as release candidates. By default, the direct installers install
the latest **stable** release. Until 1.0.0 is published, pin a version from the
[releases page](https://github.com/assignso/assign-cli/releases) with
`curl https://assign.so/install.sh | ASSIGN_VERSION=<version> sh`. The historical
`0.1.0-preview.1` macOS build is not Developer ID signed or notarized, so macOS may block it.
:::

## Update

```sh
assign update check     # compare the installed release with the latest in its channel
assign update install   # print the verified installer command for this platform
brew upgrade --cask assign
```

The CLI never checks for updates while you run ordinary commands, and it never updates itself
unless you run a command to do it.

## First run

```sh
assign login
assign
```

`assign login` opens your browser to sign in. Bare `assign` then lists the active Tasks assigned
to you in the current Workspace. Each row uses the Task code shown in the web app:

```text
PRO-123  Ship the slice
```

## Break down large work <Badge type="warning" text="Upcoming" /> {#break-down-large-work}

Use the CLI with your shell or external Agent tool to work through a large milestone in
small batches. Read a page of Tasks, inspect the selected Task's context, create ordinary
Tasks for smaller pieces, and record progress in comments.

```sh
assign project tasks PRO --limit 50 --format json
assign task context PRO-123 --compact
assign task create "Implement one acceptance criterion" --project PRO --field code
assign task comment PRO-123 "Child work is ready; parent acceptance is still pending."
```

These commands are upcoming and may not appear in your installed binary yet. Check
`assign task --help` and `assign project tasks --help` before using them.

The CLI provides explicit reads and writes. Your external runner chooses the work and
manages each Agent session. Task creation does not automatically link a parent or assign a
Milestone, and command success does not mean the whole milestone is complete.

Follow [Milestone work loops](./scripting#milestone-work-loops) for the batch workflow,
[paged Task output](./commands#project-task-pages) for queue reads, and
[retry handling](./scripting#retries) for uncertain writes.

## Where to next

<div class="next-steps">

- [**Authentication**](./authentication): browser sign-in, credential storage and `ASSIGN_TOKEN` for automation.
- [**Command reference**](./commands): every command, argument, flag and alias.
- [**Discuss in the terminal**](./discuss): the interactive Discuss client.
- [**Set up MCP in Codex**](./mcp): connect Codex to Assign in one command.
- [**Scripting**](./scripting): output streams, exit codes, completion and diagnostics.

</div>
