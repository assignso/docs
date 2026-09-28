---
description: Open your Workspace's Discuss conversation in an interactive terminal client.
---

# Discuss in the terminal

```sh
assign discuss
```

The command needs a terminal (TTY). It checks Discuss availability first. Full access shows history and
a composer, read-only access shows history without a composer, and preview access shows the plan
boundary without loading private messages.

The terminal shows Task cards, action and operation receipts, clarifications, approvals, evidence
references and tool activity. Unknown parts get a compact fallback rather than raw data. Reply in the
composer to answer a clarification or approval, and use `/undo <action-group-id>` to request a reversal.
Press Escape or Ctrl+C to leave.

- Responses stream in and recover from routine reconnects without starting another conversation.
- Task cards and receipts print exact URLs, which recheck your web access when opened.
- Assign is the only source of messages and changes. The client runs no local model and keeps no
  separate thread.
- While a response is queued or running, focus **Stop** and activate it to cancel. Completed actions
  and receipts stay completed and are never shown as rolled back.
- Sessions created before `assign:discuss` existed need one `assign login`. A personal token used as
  `ASSIGN_TOKEN` must include `assign:discuss`. Workspace plan and permission checks still apply.

See [Discuss](../api/discuss) for what you can ask.
