---
description: Use Discuss, your private AI conversation in each Workspace, and the API for messages, turns, events, approvals, files, specialists and voice.
---

# Discuss

Discuss is one persistent, private conversation for each of your Workspace memberships. It has no
thread list or provider selector. Assign stores the visible messages; raw reasoning, prompts,
credentials and provider payloads are never returned. Your history never enters shared Workspace
Search or Knowledge.

## Using Discuss

Open Discuss from the main navigation above Inbox, or press `G` outside a text field. Typing is local,
and a message reaches Knowledge only when you send it. If Knowledge is unavailable, your message stays
saved and normal work is unaffected. Personal and higher plans can include Discuss. When a Workspace
hasn't unlocked it, the navigation shows a lock that leads to a static preview, which reads no
Workspace data and uses no AI credits. If access is lost, existing history stays read-only and running
work can still be stopped. When credits run out, history stays visible and billing managers are asked
to add more.

### What you can ask

- Overviews: "What should I work on today?", "Summarize my projects", "What happened recently?".
  Recommendations use active Tasks assigned to you, and other people's Tasks appear only as
  blockers, with the assignee named. Lists say when more results are available.
- A Task or Project by name or code, such as "Explain ASG-123" or a bare Task code. Discuss reads its
  current fields. If a name matches several items it asks which one, and it never guesses. Ask it to
  clarify a Task to find missing requirements. It searches visible Documents for context and doesn't
  edit anything without review.
- Changes, when you ask explicitly: "Move ASG-123 to Done." or "Comment on ASG-123: Task delivered."
  Discuss acts under your permissions as **Discuss agent**, and the receipt names you as the
  initiator. It can also undo a status change if the Task hasn't changed since.
- Your own history: "What did we discuss about the launch?" searches your retained messages, which
  give context, not current facts.
- Public web search with `/search`, and private notes with `/remember` (up to 1,000 characters, 32
  notes), `/memories` and `/forget <id>`. Notes are personal, not shared Knowledge.
- An Agent: type `@` and pick it. The request runs through that exact Agent, keeping its instructions
  and permissions, and the answer appears under its name. Choose one Agent per request. If it's
  unavailable Discuss says so and doesn't pick another. Discuss can also start a hired specialist for
  explicit independent-work requests.

Answers show their sources, and Discuss can abstain when evidence is missing. Partial or conflicting
evidence is labeled, and one Task not being blocked doesn't prove a Project is ready. Task and Project
mentions are links. A successful change to exactly one Task shows a **Current Task** card that refreshes
from the Workspace and says if it changed afterwards.

### The conversation

- **Composer:** Enter sends, Shift+Enter adds a line, and messages can be 8,000 characters. You can
  keep typing while a response runs, and follow-ups queue in order. Use **+** to attach files, add a
  reference or search. **Dictate message** fills your draft without sending. Unsent drafts survive
  reloads in the same tab for 24 hours.
- **Stop response** cancels active work (or the earliest queued response) and doesn't undo anything
  already committed. After a stopped or failed answer, **Restore retry draft** puts the original
  request back in an empty composer without sending it. Check whether earlier work completed before
  you retry.
- **Sources** beside **Copy** shows up to 20 references. Sources that can't link say "Link unavailable".
- **Search Discuss history** and **Archives** (upper right) browse the same saved messages by date.
  **Clear page** hides earlier messages in this browser only, and **Undo** brings them back.
- Responses render Markdown, with Copy on code. Generated HTML shows as text, and images appear as
  links. Tool activity appears in a collapsible timeline of up to 20 calls, with a safe summary and
  duration. It never shows reasoning or raw tool data.
- Scheduled reminders start a conversation when due. Snoozing schedules the next one, and delivery
  doesn't complete the reminder.

**Questions and approvals.** When Discuss needs a detail, it posts a question with choices or a text
field. An approval uses explicit **Approve** and **Reject** buttons, and prose never counts. The first
valid decision wins. A stale or expired prompt asks you to reload.

**Files and references.** Attach up to five files (10 MiB each, 20 MiB total). They're private to your
stream, count toward Workspace storage, aren't shared with Knowledge and expire after 24 hours if
unsent. Discuss reads PDF, DOCX, PPTX, CSV and XLSX text (spreadsheets use saved values), supported
images and PDFs up to four pages visually, and up to 20 PDF pages as text. Context is capped at 4,000
characters. Audio, video and encrypted files aren't supported. Type `@` to reference a person, Task,
Document or Project. Permissions are rechecked and revoked access makes a reference unavailable.

## Availability

The upcoming browser realtime contract lets `GET …/discuss/availability`,
`GET …/discuss/specialist-runs`, and
`GET …/discuss/specialist-runs/{specialist_run_id}` accept
`X-Assign-Realtime-Baseline: 1`. Successful reads then return the signed
Workspace cursor and position alongside the authorized body. Availability returns
the access decision from that same snapshot. This is not yet deployed; see [application realtime](/api/realtime).

`GET /api/v1/workspaces/{workspace_id}/discuss/availability` returns the access decision before you
load history. Branch on `access` and `reason`, not `minimum_plan_key` or `minimum_plan_label`, which
are display text. Operations that start work return `402` with `discuss_entitlement_required` or
`discuss_credits_exhausted`.

## Messages and turns

These use a browser session (or a token with `assign:discuss`). Everything is `private, no-store`.

| Operation | Purpose |
| --- | --- |
| `GET …/discuss/messages` | A chronological page of your stream, older with `before`. |
| `GET …/discuss/messages/search?q=...` | Search your retained history. |
| `GET …/discuss/messages/{message_id}` | One exact message. |
| `POST …/discuss/turns` | Send a message. Returns `202` after saving. |
| `POST …/discuss/messages` | Compatible send that behaves like `turns`. |
| `POST …/discuss/messages/{message_id}/cancel` | Cancel queued work now, or request cancellation of running work (`cancel_requested`). Keep polling until terminal. |
| `GET …/discuss/messages/{message_id}/run-events?after=N&limit=100` | The user-visible run timeline. |
| `POST …/discuss/read-state` | Move your read position forward. |

Paths are under `/api/v1/workspaces/{workspace_id}`. Sends need an `Idempotency-Key` and the CSRF token.
Retrying with the same key returns the existing turn, and reusing a key with different content or
context returns `409`. Generation continues if you navigate away. You can send while a response is
active. Turns queue and one foreground response runs at a time. Cancelling the HTTP request doesn't
cancel the turn.

```json
{
  "content": "Explain these three Tasks",
  "context": {"surface": "project"},
  "parts": [
    {"type": "task_selection", "selection_id": "<saved-selection-id>"},
    {"type": "turn_preferences", "locale": "en-GB", "timezone": "Europe/Budapest"}
  ]
}
```

- `context` carries a surface and Project, active-entity or selected-entity handles, which the web
  app sends when you open Discuss from a Project, Task, Document or selection of up to 20 Tasks.
  Handles are re-resolved under your permissions.
- `parts` accepts at most one each of `task_selection`, `search_result` and `turn_preferences`, plus
  `evidence_collection`, with up to four metadata entries in all. Other types, extra fields,
  duplicates and invalid locales are rejected. `turn_preferences` applies to that turn only.
  Selections keep their original `result_set_id` and `version`, and the request conflicts if
  supplied values don't match.
- `entity_references` and `attachment_ids` attach references and files. Empty `content` needs at least
  one clean file.
- A `search_result` part, `{"type":"search_result","query":"release","result_version":"<version>"}`,
  is rechecked against the first 20 Search results, and changed results return
  `409 revision_conflict`. An `evidence_collection` part pins one current version, and a stale pin
  returns `409 revision_conflict`. Both are labeled **Upcoming** with their features in
  [Search](./search) and [Proposals and receipts](./work-capabilities).

### Events and live updates

Follow saved changes with `GET …/discuss/events?after=N`. Start from the history page's
`event_cursor`, apply newer message revisions, advance to the returned `cursor` and follow `has_more`.
Events carry current message state, not provider tokens. Assistant messages can include `run_state`:
`queued`, `running`, `cancel_requested`, `completed`, `failed` or `cancelled`. Ignore parts you don't
recognize.

Private Discuss updates use the [application WebSocket](/api/realtime) <Badge type="warning" text="Upcoming" />. Read the HTTP events page for canonical recovery after a gap. Closing a viewer does not stop the run.

### Approvals and questions

`POST …/discuss/interactions/{interaction_id}/decision` takes `expected_revision`, `decision` and an
`Idempotency-Key`. A stale revision returns `409`. Clarifications accept free text where allowed and
approvals accept only approve or reject. A waiting interaction expires after 24 hours. For a
Discuss-bound ChangeSet, the request can also include a `proposal` object with the ChangeSet `id` and
current `version` and `digest`. Approval refers to exactly that version, and an edited proposal needs a
new review. Retry with the identical request and key.

### Saved response failures <Badge type="warning" text="Awaiting deployment" />

A failed message can include a `response_failure` part with schema
`assign.discuss.response_failure.v1` and a safe `code`. Check the current message and its
receipts when an outcome is unknown or a decision could not be confirmed. Check status
reads saved state; reconnect restores delivery. Restoring a retry draft sends nothing.
Review its context and any committed work before an explicit Send. Treat unknown failure
codes or schema versions as requiring a status check.

### Receipts

Messages can carry an `operation_receipts` part listing `operation_id`, `tool`, `state` and any
resource identity and revision. Receipts survive recovery and regeneration, and regenerating doesn't
repeat a committed change. Inspect receipts and ChangeSets, not answer text, to see what happened,
including partial or refused work. A completed tool call doesn't confirm a change either.

### Specialists

For an explicit independent-work request, Discuss can start a hired built-in specialist and attach a
`specialist_run` part. Specialists are Task Revisor, Backlog Curator, Daily Standup Agent, Stalled
Work Tracker and Documentation Keeper, and they use their own Agent identity.

- `GET …/discuss/specialist-runs?limit=20` returns your latest runs (up to 50), and `…/{specialist_run_id}`
  one run. States: `queued`, `running`, `input_required`, `reconciliation_required`, `completed`,
  `failed`, `cancelled` and `expired`.
- `POST …/{specialist_run_id}/cancel` asks it to stop, idempotently, without rollback.
- `POST …/{specialist_run_id}/resume` answers an `input_required` run with the current AG-UI
  `interruptId`, the status `resolved` and a payload containing one `answer`. Stale, foreign or
  already-resolved interrupts are rejected.
- At most two specialists run in one conversation, and a specialist can't delegate to another.

`specialist_result` parts may carry `delivery_mode` and `author` <Badge type="warning" text="Upcoming" />.
For `direct`, `author` has `actor_id`, `definition_id`, `version`, `revision`, `name`,
`initiator_actor_id` and `parent_run_id`. For `supporting`, present the result as Discuss. If
attribution is missing, use the generic Agent label, and never infer identity from message text. A
completed run posts one result against the turn that started it, and access changes can make a result
unavailable. An empty no-action run adds no message.

## Preferences and reminders

- `GET` and `PATCH …/discuss/preferences` manage your IANA timezone (and whether it follows your
  Account timezone), work hours and days, up to three ceremonies (start day, end day, end week), push
  opt-in and wording personality. Updates use the returned revision. Plan changes never turn on
  ceremonies or push.
- `GET` and `POST …/discuss/reminders` list and create confirmed reminders with a due time and
  timezone. `PATCH …/discuss/reminders/{reminder_id}` completes, cancels or snoozes a revision.

Your history, settings, reminders and references are removed with the membership and never appear in
Workspace administrator totals.

## Files and references

`POST …/discuss/uploads` reserves a private upload, with completion and cancellation under
`…/uploads/{upload_id}`. `…/files/{file_id}` manages a file, and `POST …/references/resolve` resolves
`@` references. Deleting a file makes it unavailable to later reads. See the
[OpenAPI document](/openapi.yaml) for schemas. To get `@` suggestions, call
`GET /api/v1/workspaces/{workspace_id}/reference-options?q=grumpy&types=agent&surface=discuss`. A
suggestion isn't permission to run an Agent.

## Live voice <Badge type="warning" text="Upcoming" />

With **Browser dictation + Live voice** on in Preferences → Voice, **Start voice conversation** stays
in the current thread. The browser streams audio over WebRTC to the Live provider, and Assign's API key
never reaches it. A voice action isn't treated as done until the Discuss backend returns its result.
Interrupting voice doesn't cancel running work, and text Discuss works if voice can't connect.

`POST …/discuss/voice/sessions` takes the SDP offer and an optional locale and returns the SDP answer,
a Live session ID and the session duration limit. Wait for `session.started` before showing voice as
ready. `context_cursor` marks where startup history ended. Catch up from it through the events API and
dedupe by message revision, and don't submit canonical updates as new requests. Voice sessions are tied
to the session that made them. Expiry, sign-out or access changes can end one, and a session still
closing can briefly block starting another.

## Connected assistants

An MCP assistant with `assign:write` can call `discuss_post_message` with `workspace_id`, `content` and
an `idempotency_key` to post text to your own conversation. It can't choose another recipient or act as
the Discuss Agent. The message keeps the app's identity and doesn't start an AI response or use credits.
Reusing a key with the same text is safe, and different text needs a new key. See
[MCP Discuss](../mcp/discuss).

## Evidence in answers

A code reference names a commit, path, optional symbol and line range. **Verified CI** means Assign
recorded a passing run for that exact commit. **Reported tests** means an external tool reported it and
Assign hasn't verified it. Missing, stale or mismatched records are withheld, and references don't
grant source access. A saved evidence receipt opens the collection's current passages, where you can
filter and exclude references and choose **Ask Discuss about this investigation**, which adds an
**Evidence · Version N** chip. Nothing sends until you press Send. See
[evidence collections](./work-capabilities#evidence-collections).

## Read state on entry <Badge type="warning" text="Awaiting deployment" />

Opening Discuss marks the loaded, settled messages as read after confirmation. You can keep the latest prompt in view without scrolling through a long reply to clear the sidebar badge. Pending replies and messages that have not loaded stay unread. Later messages stay unread while you read earlier history. Search, Archives and direct message links do not trigger this entry acknowledgement. If the update fails, use **Retry updating read status**.
