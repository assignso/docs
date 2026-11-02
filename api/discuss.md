---
description: "Use Discuss in Assign: messages, approvals, files, specialists, reminders, voice and recovery after an interruption."
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

Upcoming [live updates](./realtime) refresh availability and specialist results in the views
you have open.

Assign shows whether Discuss is available before loading your history. If it requires a plan
change or more credits, review the message and ask a Workspace billing manager to resolve it.

Operations that start work can return `402` with `discuss_entitlement_required` or
`discuss_credits_exhausted`. See the [public reference](./reference/) for each supported
integration operation and its availability.

## Messages and turns

Write a message in Discuss and choose **Send**. A saved turn can keep running after you navigate
away. Turns queue, with one foreground response at a time; you can send another message while a
response is active.

If sending is interrupted, check the conversation for the saved turn before sending the same
message again. Closing the viewer or interrupting its connection does not cancel work. Use the
run's cancellation action to request that it stop, then check its final state. Cancellation does
not roll back changes already committed.

Opening Discuss from a Project, Task, Document or a selection of up to 20 Tasks adds that context.
Assign checks your current permissions when using references. Review a changed Search selection
or evidence collection before sending it; an earlier selection does not establish its current
contents. See [Search](./search) and [Proposals and receipts](./work-capabilities).

### Events and live updates

Discuss shows saved messages and the current run state, including queued, running,
cancellation requested, completed, failed or cancelled. Closing a viewer does not stop the run.

Upcoming [live updates](./realtime) refresh open conversations after saved changes. If an update
is interrupted, check the current conversation and run state before submitting another turn.

### Approvals and questions

Answer a question using its choices or text field. For an approval, choose **Approve** or **Reject**;
writing approval in a message does not confirm it. A waiting interaction expires after 24 hours.
If a prompt has changed or expired, review the current prompt before deciding.

A Discuss-bound ChangeSet approval applies to the exact proposal version you reviewed. An edited
proposal needs a new review. If a decision is interrupted, check the current interaction and its
receipts before submitting it again.

### Saved response failures <Badge type="warning" text="Awaiting deployment" />

A failed response may still have saved work. Use **Check status** to review the current message
and its receipts when an outcome or decision is unknown. Reconnecting restores delivery; it does
not submit another turn. Restoring a retry draft sends nothing. Review its context and any
committed work before choosing **Send**.

### Receipts

Receipts identify the operation, its state and any affected resource. They survive recovery and
regeneration, and regenerating does not repeat a committed change. Inspect receipts and ChangeSets
to see what happened, including partial or refused work. Answer text or a completed tool call
alone does not confirm that a change was saved.

### Specialists

For an explicit independent-work request, Discuss can start a hired built-in specialist.
Specialists are Task Revisor, Backlog Curator, Daily Standup Agent, Stalled Work Tracker and
Documentation Keeper, and they use their own Agent identity.

Open a specialist's run to review its status and result. It may be queued, running, waiting for
input or reconciliation, completed, failed, cancelled or expired. Answer a waiting question in its
current prompt. If the question has changed or is already answered, review the current run before
trying again. Cancelling asks the run to stop without rolling back saved changes.

At most two specialists run in one conversation, and a specialist cannot delegate to another.
A completed run posts one result against the turn that started it; an empty no-action run adds no
message. Access changes can make a result unavailable.

Upcoming specialist attribution identifies results delivered directly by an Agent; supporting
results appear as Discuss. A generic Agent label means no more specific identity is available.
Do not infer identity from message text. <Badge type="warning" text="Upcoming" />

## Preferences and reminders

Use Discuss preferences to choose your timezone, work hours and days, wording personality, push
delivery and up to three ceremonies: start day, end day and end week. The timezone can follow your
Account timezone. A plan change never turns on ceremonies or push delivery for you.

Confirm a reminder's due time and timezone before saving it. You can complete, cancel or snooze
an existing reminder. If its saved values have changed, review them before applying another change.
Your history, settings, reminders and references are removed with the membership and never appear
in Workspace administrator totals.

## Files and references

Attach a file through the composer and wait for its upload to complete before sending. Cancel an
upload you no longer need. Deleting a file makes it unavailable to later reads. See the limits and
supported formats under [The conversation](#the-conversation).

Type `@` to choose a reference from the suggestions. Assign checks your access when resolving it.
An Agent suggestion does not grant permission to run that Agent.

## Live voice <Badge type="warning" text="Upcoming" />

With **Browser dictation + Live voice** on in Preferences → Voice, **Start voice conversation** stays
in the current thread. An action completes only when Assign confirms its result.
Interrupting voice doesn't cancel running work, and text Discuss works if voice can't connect.

Wait for the connection to be ready before speaking. Session expiry, sign-out or access changes
can end a voice conversation, and a session still closing can briefly delay starting another.

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
