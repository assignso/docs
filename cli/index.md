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

## Where to next

<div class="next-steps">

- [**Authentication**](./authentication): browser sign-in, credential storage and `ASSIGN_TOKEN` for automation.
- [**Command reference**](./commands): every command, argument, flag and alias.
- [**Discuss in the terminal**](./discuss): the interactive Discuss client.
- [**Set up MCP in Codex**](./mcp): connect Codex to Assign in one command.
- [**Scripting**](./scripting): output streams, exit codes, completion and diagnostics.

</div>
