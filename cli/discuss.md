---
description: Open your Workspace's Discuss thread in an interactive terminal client.
---

# Discuss in the terminal

Open the current Workspace's Discuss thread in an interactive terminal:

```sh
assign discuss
```

The command checks Discuss availability before loading history. Full access
shows history and a composer. Read-only access shows canonical history without
a composer. Preview access shows the plan boundary and does not load private
messages.

The terminal renders typed Task, action receipt, operation receipt,
clarification, approval, evidence-reference, and tool-activity widgets. Unknown
parts use a compact safe fallback instead of printing their raw payload. Reply
in the composer to resolve an open clarification or approval. Use
`/undo <action-group-id>` to request reversal through the same canonical
Discuss thread. Press Escape or Ctrl+C to leave.

Responses update over the private Discuss stream and recover from routine
connection rotation without creating another conversation. Task cards print the
exact Task URL; saved work receipts print an exact versioned review URL when the
receipt contains one. Opening either URL rechecks your current Web access.

`assign discuss` requires a TTY. It uses Assign Core as the only source of
messages, interactions, and work changes; it does not run a local model or
maintain a separate thread store. The Go CLI retains the credential and exposes
only a narrow, process-lifetime loopback broker to the bundled terminal
renderer. The renderer receives no access or refresh token. Release archives
include its standalone executable, so users do not need Node.js or Bun.

While a response is queued or running, move focus to **Stop** and activate it
to request canonical cancellation. A completed action and its receipt remain
completed; Stop does not present them as rolled back.

CLI sessions issued before `assign:discuss` was added must run `assign login`
once to receive the new grant. A personal API token used through
`ASSIGN_TOKEN` must include `assign:discuss`. Workspace plan and authorization
checks still apply.
