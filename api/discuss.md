# Discuss

Discuss is one persistent, private Discuss conversation for each of your
Workspace memberships. It has no thread list or provider selector. Visible
messages are stored by Assign Core; raw reasoning, prompts, credentials, and
provider payloads are never returned.

The Web app opens Discuss from the primary navigation above Inbox. Typing is
local: a message reaches Knowledge only when you explicitly send it. Answers
show their current Workspace sources and can abstain when evidence is missing.
If Knowledge is unavailable, your submitted message remains saved and ordinary
Workspace work remains available.

Press `G` outside a text field or editor to open the current Workspace's Discuss
page. While an input, composer, selector, or editor has focus, global letter and
number shortcuts stay off so every typed character remains in that control.
Discuss remains visible in navigation when the Workspace has not unlocked
it. A subtle lock then leads to a deterministic product preview with an inert,
blurred decorative conversation behind a sharp preview and fade; it never shows
the ordinary empty-conversation startup screen. The preview does not read
Workspace data or consume AI credits. Personal and higher plans
can include Discuss according to the current Workspace catalog.

If a Workspace loses Discuss access, authorized existing history remains
read-only. New messages and actions are disabled, but running work can still be
stopped safely. A separate exhausted-credit state keeps history visible and
directs a billing manager to add credits; members without billing permission are
asked to contact the Workspace owner.

`GET /api/v1/workspaces/{workspace_id}/discuss/availability` returns the
membership-authorized access decision before clients load private history.
Branch on `access` and `reason`, not `minimum_plan_key` or
`minimum_plan_label`; those plan fields are presentation metadata. Premium
mutation endpoints return HTTP 402 with `discuss_entitlement_required` or
`discuss_credits_exhausted` when the current Workspace cannot start new work.

Discuss can read tickets, move a ticket to an exact workflow status, add supplied comments, and
undo a receipt-backed status change when its revision still matches. Those changes are authored
by **Discuss agent** under your current permissions; receipts retain the initiating actor. Hired
specialists use their own Agent identity and post results to the originating private
conversation.

## Asking about work

Ask “Summarize my projects” for an overview of the Projects you can access, or name one
Project for a summary of its current Tasks. Discuss reports when results cover only a page.

Send a Task code on its own to read and explain that Task. Ask to clarify a ticket to identify
missing requirements before proposing changes. When the ticket needs supporting context, Discuss
searches visible Documents, reads the relevant source, and explains how it relates to the ticket.
A clarification request does not itself apply an edit; proposed changes require review.

## Message history

`GET /api/v1/workspaces/{workspace_id}/discuss/messages` returns a bounded
chronological page from only the current membership's stream. Use `before` for
older pages. `GET .../messages/search?q=...` searches retained private raw
history without placing it in shared Workspace Search or Knowledge.

For long conversations, Assign builds disposable private context capsules over exact message
ranges. The latest five messages remain raw. Older history is segmented at a 75-minute inactivity
gap, a local-date change in your effective Discuss timezone, or bounded size limits. Changing the
timezone or a retained source invalidates affected capsules before rebuild. Capsules never replace
raw history, prove an action, or override current Task/Project/Document state; exact wording still
comes from retained messages and current facts from canonical Workspace records. Private Discuss
history is never added to shared Workspace Knowledge.

You can ask about a Task or Project by its visible
name or code. Discuss looks up the permitted match and reads its current canonical fields before
giving feedback. If the name matches more than one visible item, Discuss asks which one you mean;
it does not guess. Search snippets are discovery hints, not current Project or Task state.

Authorized Task and Project mentions in an answer appear as compact clickable links with distinct
icons. The upcoming Web refinement uses underlines with the same text color and line height as
the surrounding message, without a badge. If your paired prompt contains the exact Task code that
the answer resolved, that code also becomes clickable after the response arrives; typing and sending
the prompt performs no extra lookup. Generated URLs, ambiguous names, partial codes, and text inside
code or existing links are not promoted to trusted Assign navigation.

An answer about exactly one Task shows one read-only **Current Task** card. A successful request that
creates or updates exactly one Task shows the same card after the change commits. It links to the Task
and reflects its current Project, Status, Priority, Assignee, Due date, optional Milestone and Labels,
plus completed or archived state when applicable. The card refreshes from canonical Workspace state;
if it changed after the answer, the card says so, and if it was deleted or you lost access it becomes
unavailable. Project summaries, comparisons, bulk work, pending approvals, and failed or uncertain
changes do not show a single-Task success card.

The Web uses `POST .../turns`, which returns `202` after the turn is saved. It requires
an `Idempotency-Key` and the session CSRF token. Generation continues if you navigate
away or reload. Send `{ "content": "Your question" }`. Reusing a key with different
content or typed context returns `409`. You can send another turn while
a response is active. Assign saves it as an ordered successor and still runs only one
foreground response at a time.

The request may also include `context` with a surface and canonical Project, active-entity,
or selected-entity handles. The Web supplies this when you open Discuss from a Project,
Task, Document, or a selection of up to 20 Tasks. Discuss shows the inherited context as
one compact counted row before sending; expand it to inspect or remove individual handles.
Core resolves every handle again with your current
Workspace permissions; labels and IDs do not grant access.

API clients may include optional `parts` with up to one `task_selection`, one `search_result` and one
`turn_preferences` entry when sending a queued turn:

```json
{
  "content": "Explain these three Tasks",
  "parts": [
    {"type": "task_selection", "selection_id": "<saved-selection-id>"},
    {"type": "turn_preferences", "locale": "en-GB", "timezone": "Europe/Budapest"}
  ]
}
```

Assign resolves the selection under your current permissions and stores its original
`result_set_id` and `version`. Optional supplied values must match or the request conflicts.
This does not refresh the selection or apply changes. Locale/timezone applies only to this
turn and does not change saved preferences. Other part types, extra fields, duplicate entries,
or invalid locale/timezone values are rejected by queued Send. Remove a metadata entry before
sending to omit it; previous page context is not a new explicit selection.

In the upcoming update, Project **Ask Discuss** prepares a saved selection before opening Discuss.
The chip shows its version. Remove it to omit those Tasks or choose another selection to replace it
without losing your draft. Preparation does not send a message or use AI credits. If preparation
fails, the selection remains available to retry. Retrying a failed Send uses its original selection
and text while preserving newer edits in the composer.

Pending assistant content may grow as newer message revisions arrive. Older clients may display it
as plain text until finalization. The upcoming Web update formats complete blocks while keeping
incomplete Markdown inert; unfinished links must not become active. A clarification pauses
work for your answer. Submitting the current question's answer continues with the conversation's
remaining budget; an expired or changed question requires refreshed state.

Use `GET .../events?after=N` to follow saved changes. Start from the history page's
`event_cursor`, apply newer message revisions, then advance to the returned `cursor`.
Follow `has_more` to drain additional bounded pages. Events contain current message
state, not individual provider tokens. Assistant messages can include optional `run_state`:
`queued`, `running`, `cancel_requested`, `completed`, `failed`, or `cancelled`. Older clients
can ignore it. `GET .../messages/{message_id}` resolves an exact saved message.
`GET .../messages/{message_id}/run-events?after=N&limit=100` returns a bounded user-visible
run timeline for that assistant message. Tool events include only a public label, state, safe
summary, optional duration/result count and whether reauthorized detail exists. Prompts, hidden
reasoning, credentials, raw arguments/results and provider payloads are never returned.
`POST .../messages/{message_id}/cancel` cancels queued work immediately. For running work it
records the request and returns `cancel_requested`; keep reconciling until the message is terminal.
Stop does not roll back an already committed change. An interrupted response is not retried
automatically. **Restore retry draft** restores the full request for review without sending it.
Review any work that may already have completed, then choose Send to create a new turn. History is
preserved.

### Specialist work

For an explicit independent-work request, Discuss may start a hired built-in specialist and attach
a `specialist_run` part to its acknowledgement. The initial catalog is Task Revisor, Backlog
Curator, Daily Standup Agent, Stalled Work Tracker and Documentation Keeper. `GET
.../discuss/specialist-runs?limit=20` returns
the caller's latest private specialist work (maximum 50), and `GET
.../discuss/specialist-runs/{specialist_run_id}` returns one current projection. States are
`queued`, `running`, `input_required`, `reconciliation_required`, `completed`, `failed`, `cancelled`
or `expired`. Only safe summaries and safe pending interaction prompts are returned.

`POST .../discuss/specialist-runs/{specialist_run_id}/cancel` requests cooperative Stop through the
underlying canonical Agent/work-session journal. It is idempotent for already terminal work and does
not imply rollback. A completed specialist posts one Agent result against its immutable initiating turn.
At most two specialists may be active in one private conversation; specialist work cannot
recursively
delegate another specialist. All responses are membership-private and `no-store`.

The compatible synchronous `POST .../messages` requires the session CSRF token and an
`Idempotency-Key`.
Retries with the same key return the existing turn and do not repeat Knowledge
work. Allow up to 130 seconds for a synchronous assessment response. Cancelling a
request stops answer generation; the submitted message remains saved.
`POST .../read-state` advances the private read position monotonically.
All responses are `private, no-store`.

## Personal settings and reminders

`GET` and `PATCH .../discuss/preferences` manage the current membership's IANA
timezone, work hours/days, exactly three optional ceremonies (start day, end
day, end week), conservative push opt-in, and wording personality. Updates use
the returned revision. Plan changes never enable ceremonies or push.

`GET` and `POST .../discuss/reminders` list or create explicitly confirmed work
reminders with a concrete due instant and timezone. `PATCH
.../discuss/reminders/{reminder_id}` completes, cancels, or snoozes an exact
revision. Snooze creates the next occurrence; delivery is not completion.

Private history, settings, reminders, and references are removed with the
membership lifecycle and never appear in Workspace administrator aggregates.

## Using the conversation

You can ask “What should I work on today?”, “Explain ASG-123”, “What happened
recently?” or “What are recent tasks?”. Task answers include authorized clickable
references and support simple Markdown. Recent lists show a bounded selection and
say when more results are available.

To change work, send an explicit request such as “Move ASG-123 to Done.” or
“Comment on ASG-123: Task delivered.” The status must resolve to one available
workflow label. A comment request without text asks what to write. Successful
changes produce a saved `action_result` receipt with the actor, target, operation,
before/after state and resulting version; a response never confirms an
uncommitted change. Cancelling before execution prevents the change; cancelling
after it completed preserves its saved result. Replaying the same turn does not
repeat the change. Ambiguous or compound instructions may require clarification.

A reversible Task status receipt shows **Undo**. Undo performs a new compensating
Core operation and creates its own receipt; it does not erase history. If the Task
changed after the original action, Discuss refuses the stale inverse and asks you to
review the current state. After an inverse completes, the original receipt shows
**Undone** and cannot submit that inverse again. Comment receipts are not currently
reversible. Compound actions, shared app-wide Undo/Redo, and recurring automations remain future
capabilities rather than implied behavior. Specialist delegation is limited to the documented
built-in catalog and hired/ready Workspace Agents.

The upcoming Web correction shows a pending response status once: in the empty response body,
then below partial text while the response continues. Completion removes that pending status.

When Discuss uses internal reads, changes, specialists or recorded evidence, the assistant message
shows at most one compact activity row. The row updates in place from **Working** to completed, failed
or cancelled. The upcoming Web refinement expands this disclosure into plain single-line activity
and evidence summaries, without borders, backgrounds, timestamps, pagination controls or a nested
scroll area. Dedicated recorded-activity inspection retains its paginated history and timing.
This activity is an audit-friendly summary,
not model reasoning or a raw tool transcript, and a refresh does not duplicate it.

When a response uses implementation or test evidence, its activity detail can show evidence references.
A code reference names an exact commit, repository-relative path, optional symbol, and line range. **Verified
CI** means a passed record from Assign's canonical integration or work-session journal for that exact
repository commit. **Reported tests** means an external Agent or tool reported the result; Assign has
not verified it. Missing, stale, malformed, denied, deleted, ambiguous-symbol, or commit-mismatched
records are withheld rather than relabelled. These references do not grant source access.

### Clarifications and approvals

When Discuss needs a missing detail, the saved response shows a clarification prompt with bounded
choices or a labelled answer field. An approval uses explicit **Approve** and **Reject** choices;
ordinary prose is not approval. The first valid current decision wins and queues one continuation.
If the request, policy, tool catalog, expiry, or another device's decision made the prompt stale,
Discuss asks you to reload rather than applying the old decision.

API clients use `POST .../interactions/{interaction_id}/decision` with
`expected_revision`, `decision` and an `Idempotency-Key`. Conflicting/stale revisions return `409`.

Discuss has one chronological private stream. Correct an earlier statement with a normal new message.
Failed or cancelled delivery may be retried; completed responses are not regenerated, and committed
actions are never repeated by retry.

“What did we discuss about the launch?” searches your retained private history.
Earlier-message excerpts provide conversation context, not current Workspace facts.
When broader language processing is unavailable, Discuss says so and provides
examples of supported direct requests. It cannot fetch external weather information.

Scheduled reminders can start a conversation when due. Each occurrence appears once
in your private stream; snoozing schedules the next occurrence. Delivery does not
complete the reminder or change its referenced task, and does not enable push.

Messages are grouped by date and show their time. Use **Sources** beside **Copy**
to open the evidence popover. Its references
link to the corresponding Workspace documents, tasks, and projects. Each reference
is a single line with a distinct document, folder, or checklist icon; hover over
a shortened title to see its full text. Sources without
a supported reference show “Link unavailable”. Use **Copy** to copy message text; the
button changes to **Copied** without adding a second confirmation sentence. Scroll freely
through the conversation; the scrollbar stays at the page edge while messages retain their
readable narrow width. **Latest messages** brings you back to the newest reply. Saved
history opens near the latest user turn. Sending a new prompt keeps the transcript at the
end of its scroll container while the prompt is accepted and the response appears.

Open the **…** menu at the upper right and choose **Search Discuss history**, enter a phrase, and
press
**Search** or Enter. Search runs only when submitted. **Back to conversation**
returns to the current transcript. **Load earlier messages** retrieves older
history in pages; after ten pages, use search to locate older material.

The empty composer keeps its normal white surface while its Send button is unavailable, so the
editable field does not appear disabled. It grows as you write, up to a bounded height. Enter sends;
Shift+Enter adds a line. Suggested prompts fill the composer without sending. While waiting
for a response, you can keep typing and send an ordered follow-up; only a duplicate
submission awaiting acknowledgement is blocked. A failed request keeps its original message and
offers Retry message; retrying does not replace a newer draft. Messages support up to 8,000
characters.

Choose **Archives** at the upper right to open your dedicated private history
page. Browse saved messages by date, load earlier pages, or search a phrase.
**Clear search** restores the history view; **Back to Discuss** returns to the
composer. Archives browses the same saved stream and does not move or delete
messages. The Discuss page uses the same content width as Task detail and a
single **Discuss** breadcrumb.

Extractive answers select relevant sentences from retrieved evidence. They can
still abstain when the question's terms do not match indexed content; source
links let you inspect the full referenced document.

Source excerpts may include the opening text and matching passages from later in
a document. Open the source to read the complete context.

Knowledge responses may be partial when evidence is incomplete or answer generation
is unavailable. A partial evidence digest is not a confirmed readiness assessment.
Use Sources beside Copy to inspect the referenced records; the popover can show up
to 20 references. Unavailable links are labeled explicitly.

Discuss may distinguish verified gaps in a task from missing evidence needed to
assess it. Conflicting sources remain visible unless their authority supports a
resolution. Related search results alone do not establish that a task is ready.

## Draft recovery and message navigation

Unsent text survives Archives navigation and reloads in the same browser tab.
Recovery is private to your account, Workspace and Discuss stream, expires after
24 hours, and ends with the tab session. If browser storage is unavailable,
Discuss tells you to keep the page open. A response clears only an unchanged
submitted draft; anything typed afterward remains. Cmd/Ctrl+Enter also sends,
and composing text with an input method does not accidentally submit it.

Responses render Markdown lists, emphasis, links, quotes, code and tables.
Code includes Copy code and a language label; wide code and tables scroll within
the message. Generated HTML is displayed as text. Image URLs appear as links
rather than loading automatically. Native Workspace evidence remains in Sources.

Discuss does not show conversation or message Copy link or manual message-reference actions.
In the upcoming cognitive update, ask about earlier context naturally: Discuss supplies up to four
preceding canonical messages before interpretation and can supplement them with authorized private
history recall. A required clarification keeps the original objective and known arguments through a
restart, so a short answer such as a Task code continues that request. This is locally implemented
and is not yet a deployed-behavior claim. **Stop response**
requests cancellation of active work; it shows **Stopping…** until Assign confirms the
terminal result. If no response is active, it cancels the earliest queued response.
Your unsent text remains editable. Reconnection and another open tab retrieve saved updates
automatically. A stopped or failed answer offers **Restore retry draft**. This restores the original
request, clarification answers, files, references and saved context into an empty composer. It does
not replace a draft you are already writing or send automatically. Removing a restored attachment
only removes it from your draft. If original context is unavailable, restore stops with an error;
responses following an approval require reviewing the original change and its outcome first.

## Evidence assessment

Discuss distinguishes a documented gap from evidence it could not verify. Sources
can disagree even when both are relevant; a newer edit alone does not establish
which requirement is authoritative. An answer may remain partial while a recently
edited source is being indexed.

Answer parts can include an assessment with coverage, conflict decisions and
source-linked findings, plus diagnostic state. Treat these as optional metadata.
Unmeasured quality metrics are null. A changed or inaccessible source can invalidate
an answer before it is saved. An insufficient assessment does not establish readiness.

## Private files and references

Use **Attach files**, paste files, or drop them anywhere on the writable Discuss page in the upcoming
Web update. Dropped files upload into your private draft without sending a message; review them and
choose **Send** when ready. The upcoming Web refinement places
**Attach files** inside the input bar and removes its decorative Workspace context label; actual
selected context remains available above the input. Files count toward your
workspace storage and are private to your Discuss stream; they do not appear in project or
task attachment lists. Use up to five files, 10 MiB each and 20 MiB combined. A file must pass
its safety checks before sending. Upload errors retain the draft and offer retry/removal.
Unsent completed files expire after 24 hours. Sent files remain with the private stream;
deleting a file makes it unavailable for later downloads and context reads.

Type `@` to find a person, task, document or project. Tab to a suggestion and press Enter
to select it, or paste a task/document link from the same workspace. Discuss saves a
reference and retrieves context with current permissions. A user reference can supply their
workspace profile; private account details are excluded. Reference changes or revoked access
can make old references unavailable.

File context is bounded to 4,000 characters. Discuss can extract PDF, DOCX, PPTX, CSV
and XLSX content; spreadsheet formulas use saved values and are not recalculated.
With the OpenAI transport, supported images and PDFs of up to four pages can also be
read visually, using the turn's normal call and credit limits. Visual interpretations
may be incomplete. Larger PDFs use local text extraction up to 20 pages; scanned PDF
OCR is limited to four pages and requires the configured extraction tools. Unsupported,
encrypted or oversized inputs report unavailable context. Audio/video processing is
not supported. Private files are not added to shared Knowledge indexing.

The browser-session API adds `POST /workspaces/{workspace_id}/discuss/uploads`, completion
and cancellation under `/uploads/{upload_id}`, private operations under `/files/{file_id}`,
and `POST /references/resolve`. Turn requests accept `entity_references` and `attachment_ids`;
empty `content` requires at least one clean file. Consult the OpenAPI contract and generated
clients for exact schemas. Every operation authorizes the current private stream.

## Following answer sources

Where a response includes a recognized task, project or document, its name or
identifier can link to that resource. The Sources menu also links comments to their
parent task and comment. Repeated references share one source entry. Links open with
your current permissions; unavailable resources are not granted access by a citation.

The answer explains material gaps or disagreements directly. **Context** provides
additional information when completeness has not been established, sources disagree,
or there was not enough information to answer.

Discuss may combine supported findings into a concise answer while retaining important
conditions and uncertainty. Knowing that one task is not blocking does not establish
that the whole project is ready. When the relevant scope or assignment is unclear,
the answer should say so rather than imply that every item has been checked.

Standalone greetings such as “hi” or “hello” receive a short greeting without
searching workspace content. A greeting followed by a question routes according
to that question’s intent.

## Replies from connected assistants

An authorized external MCP assistant can use `discuss_post_message` with `workspace_id`, `content`
and a
stable `idempotency_key` to post supplied text to your own private Discuss conversation. It requires
`assign:write`; it cannot choose another recipient or impersonate the hosted Discuss Agent. Reusing
a key
with identical text is safe, while different text requires a new key. Posting supplied text does not
start
an AI response or consume Assign AI credits. The message retains the connected application's
identity.

See [versioned work proposals and receipts](work-capabilities.md) for private result sets, drafts,
reviewed ChangeSets and write recovery in the upcoming update.

## Durable reviews and operation references

### Unread activity and questions (upcoming Web update)

Discuss shows an unread count in the sidebar and a dot when the sidebar is collapsed.
The badge displays `99+` for larger counts. It refreshes while the app is visible and
clears after the latest settled messages are viewed. Scrolling through older messages,
searching history, opening Archives or leaving the browser in the background does not
mark the latest conversation read. A **New messages** divider keeps your return point
visible in the conversation; date dividers separate days.

When Discuss needs clarification or approval, choose an offered response or write your
own when permitted, then submit explicitly. Selecting a choice does not send it. A
failed submission keeps your answer so you can retry; a changed or expired question
requires refreshing it. Answered questions remain in history. Archives remains read-only.

### Versioned decisions

A durable approval refers to the exact ChangeSet ID, version and digest being reviewed. Use the
canonical interaction revision when answering; cached approval cannot authorize an edited proposal.
Review and apply are separate operations. Clarifications accept free text where allowed; approvals
accept only approve or reject. A waiting interaction expires after 24 hours. Stop requests cancellation
and does not imply that already committed work was undone.

Clients may receive an extensible `operation_receipts` part with a `receipts` array of canonical
operation references (`operation_id`, `tool`, `state`, and optional resource identity/revision).
Receipts survive response recovery and regeneration; regenerating an existing committed result does
not repeat its action. Continue to handle unknown message-part types safely. Use canonical receipt
and ChangeSet controls to inspect outcomes, including partial or refused work, instead of inferring
success from answer text. See [MCP](../mcp.md#recall-private-discuss-history-and-manage-explicit-rules)
for exact private-message recall and explicit rule controls.

While an assistant message is pending, an extensible `runtime_status` part can carry an allowlisted
Core status (`working`, `reading`, `waiting`, `speaking` or `needs_input`). Clients must derive visible
copy from that code rather than render producer text. A newer message revision replaces the prior
status. The membership-private recorded-activity feed can additionally expose `status.changed`,
`run.terminal`, `interaction.required`, `interaction.resolved` and `result.available`; their summaries
are Core-owned, while work details are resolved from the canonical operation receipt.

## Private live updates (upcoming update)

In the upcoming Web update, **Inspect task**, **Inspect project** and **Inspect document** load current
authorized metadata from Sources. Changed or archived resources are labeled; unavailable resources
withhold the preview. Only one preview is open at a time. The response's Activity disclosure groups
exact repeated terminal summaries with a count. **Recorded activity** opens separately on request,
shows 20 records per page up to 200 records, and shows a duration only when both start and finish are
recorded. These inspection controls do not send another AI request. Archives remain read-only.

An extensible `runtime_text` part may include `part_id`, `run_id`, `step_id`, `generation`, `revision`,
`producer_fence`, `producer_sequence` and a UTF-8 byte `offset` for the accompanying full text.
Treat it as a materialized snapshot, not a delta to concatenate. Snapshots may skip offsets after
reconnection. A conflicting same revision or invalid text offset requires an authorized refresh.
Final canonical content replaces provisional parts.

`GET /api/v1/workspaces/{workspace_id}/discuss/events/stream?envelope_version=1` opens a
cookie-authenticated private SSE subscription. It starts with `hello`; subsequent frames are
`discuss_event`, `heartbeat` or terminal `resync_required`. A `discuss_event` contains `stream_id`,
`sequence` and the existing `message` projection. Apply only newer message revisions and replace
provisional content on finalization.

Save each event's opaque SSE `id` in memory. Resume with `Last-Event-ID`, or the `cursor` query
parameter; the header takes precedence. A new connection without a cursor begins at the current
watermark. After hello, catch up through the existing HTTP event endpoint from your last acknowledged
numeric cursor before displaying current state. On resync, refresh authorized snapshots and reconnect
with the returned cursor. Never replay approval or mutation requests during recovery. Cursors belong
to one private membership stream and cannot be transferred to another Workspace or member.

Connections periodically close and should reconnect with bounded backoff. A clean close after a
successful `hello` is routine rotation and does not mean the response stopped. Heartbeats occur every
15 seconds. Authentication/access loss clears private cached content. Closing or backgrounding a viewer
does not Stop the run. Generated clients include the endpoint and payload types; use the platform's
incremental streaming transport for SSE.

In the Web update, complete formatting blocks can appear before the response finishes. Unfinished
links, code and tables remain plain text until ready. **Work receipts** distinguishes saved results,
drafts and proposals from applied work. Expand a receipt to inspect current authorized outcomes,
including committed, conflicted and excluded changes. Unavailable receipts do not establish success.

Clients supporting provisional text can add `text_deltas=true` to the private stream request. Wait
for `hello.text_deltas=true` before accepting a `discuss_event` with `text_delta`. This object contains
`kind` (`text_delta` or `text_snapshot`), `run_id`, `message_id`, `part_id`, `producer_fence`,
`producer_sequence`, `generation`, `revision`, `offset` and `text`. These frames have no SSE `id` and
do not advance your durable cursor. Offsets count UTF-8 bytes; snapshots have offset zero. Text is
bounded to 2 KiB per delta and 64 KiB per part, with a 512 KiB encoded-frame limit.

Keep provisional text separate from saved message snapshots and drafts. On a gap or changed
fence/generation, refresh authorized snapshots; a reconnect supplies current provisional text where
available. Discard it when the viewer detaches or loses access. A final canonical message always
replaces provisional text. Older clients can omit the option and continue receiving canonical message
updates.

For a Discuss-bound proposal, **Review proposed changes** opens its exact review page. Saving edits
creates a new version without approving it. **Approve and continue Discuss** reviews that version and
returns to the conversation. The interaction decision request accepts an optional `proposal` object
containing the same ChangeSet `id` and the current `version` and `digest`. Core rejects stale or
unrelated versions. Retry with the identical request and idempotency key; changing the reviewed
identity is a new request. Standalone proposal pages retain separate review and apply actions.

### Personal Task views (upcoming update)

Filter a Task result card by title/code, choose title order, then **Save query as view**. A view keeps
its original scope plus up to four title/code filters. **Saved personal views** lists your views;
opening one queries current Tasks and opens a new result snapshot. The previous snapshot and its
selections remain unchanged. Filtering is limited to the checked 1,000-Task scan; partial coverage,
even with no matches, does not establish that no other matching Tasks exist.

### Search context (upcoming update)

The Search handoff opens Discuss with the visible query and result version. Remove the chip to omit
it; opening Discuss never sends automatically. API clients send
`{"type":"search_result","query":"release","result_version":"<version from Search>"}` in `parts`.
Core rechecks the first 20 unfiltered Workspace work results before accepting a new turn. Changed
results return `409 revision_conflict`; reopen Search and inspect the new version. An identical retry
of an already-saved Send recovers its original acknowledgement. Results are bounded lexical findings,
not complete coverage or permission to act. People are outside this work-results context.

Tool activity reports recorded start and response states with factual duration when available.
A completed tool response does not itself confirm a change; inspect the operation receipt for the
committed outcome. Late or unconfirmed tool responses are never presented as successful changes.

## Inspecting evidence

A saved evidence receipt opens the collection's current authorized passages. The evidence page lets
you filter by source type or Project and exclude references from that investigation. Saving creates
a new exact version; it does not modify the sources or remember a global preference. Changed,
unavailable and excluded references withhold their text. Normal controls make no model request.
See [evidence collection operations](work-capabilities.md#evidence-collections).

## Agent result attribution

An unreleased compatible extension adds optional `delivery_mode` and `author` to existing
`specialist_result` parts. For `direct` delivery, `author` contains the admitted Agent's `actor_id`,
`definition_id`, `version`, `revision`, `name`, `initiator_actor_id` and `parent_run_id`. Its identity
survives later configuration edits. For `supporting` delivery, present the result as Discuss.
If attribution is absent or invalid, retain the generic Agent label. Never derive identity from
message prose. Clients that do not recognize these optional properties can ignore them.

Later results remain attached to their immutable initiating turn in the private stream. A
configuration or access change can make an Agent result unavailable. Stop preserves actions already
committed. A successful scheduled report can still be useful when it made no changes; an empty
no-action completion creates no extra message.

### Evidence follow-up context (upcoming update)

On the evidence page, save any changed exclusions, then choose **Ask Discuss about this investigation**.
The existing conversation opens with an **Evidence · Version N** chip. Remove it to omit the context;
nothing is sent until you Send. Display filters do not change which sources belong to the investigation.

Queued Send accepts `{"type":"evidence_collection","id":"<collection-id>","version":2}` in `parts`.
Up to four metadata entries are allowed, one each for evidence, Task selection, Search and preferences.
Only the current private collection version is admitted. A stale pin returns `409 revision_conflict`;
reopen the investigation and attach its current version. Identical acknowledged retries retain the
original historical handle without granting current source access. Exclusions remain local to this
investigation, and a collection does not authorize sharing its content with other people.
In the upcoming Web refinement, **New messages** appears above the new turn's user prompt instead
of separating the prompt from its reply. This divider placement does not change unread counts.

### Required answers and optional follow-ups

When Discuss needs your answer to finish the current request, it posts an interactive question.
For example, it may need to know which task to move. Your answer continues that request with its
context. Optional follow-ups, such as offering a shorter summary after answering, remain ordinary
message text. They do not leave the response waiting. Approving an action still uses its dedicated
review and approval controls.
When proposing a task status change, Discuss reads the applicable Project statuses and their
current revisions. Invalid or stale proposals return a recoverable error; they do not authorize
a change. A failed response alone does not prove that work was committed. Review the current task
and any available operation result before sending a restored retry draft.

### Composer actions and clearing the page

Use **+** in the message bar to attach files, add a reference or search your conversation. You can
also drop files anywhere on the Discuss page; attachments stay in the draft until you send.

Use **Dictate message** to capture one utterance on a supported browser. **Stop dictation** ends the
capture; finalized words are inserted into your draft for review and editing, and are never sent
automatically. The control is disabled when browser recognition is unavailable and hidden when Voice
is turned off for the device.

**Clear page** hides previous messages from the main view on this browser. They remain available
in **Archives** and history search. Your unsent draft and attachments stay in place, and new messages
appear normally. **Undo** brings the earlier messages back. Clearing survives reloads and is scoped
to your account, Workspace and conversation on this browser; it does not delete history or reset
Discuss's context. Finish active responses and open questions before clearing the page.

### Live voice (upcoming update)

Enable **Browser dictation + Live voice** under Preferences → Voice, then use **Start voice
conversation** in Discuss. The compact conversation stays in the current thread, keeps the text
composer usable, and shows connecting, listening, speaking, muted and ending states. **Mute
microphone** and **End voice conversation** wait for the service to acknowledge the change.

The browser sends audio directly over WebRTC to the configured Live provider. Assign's API key never
reaches the browser, provider recording storage is disabled, and a Voice/public action is not treated
as successful until the ordinary Discuss backend returns its canonical result. Voice interruption
does not cancel work already running; its result remains in the private Discuss conversation after
Voice ends. If Voice cannot connect, typed Discuss remains available.

API clients create the browser transport with
`POST /api/v1/workspaces/{workspace_id}/discuss/voice/sessions`, sending the ICE-complete SDP offer
and optional locale. The response contains the SDP answer, opaque Live session ID and client session
duration bound. Browser clients wait for `session.started` before reporting that Voice is ready.

### Voice session continuity

The Voice session response may include `context_cursor`, the Discuss event cursor associated with startup history. Clients that keep Voice context current should catch up from that cursor through the existing Discuss event API and deduplicate message revisions against their live event feed. Canonical updates provide context; they must not be submitted as new user requests.

Voice sessions are bound to the authenticated session that created them. Expiry, sign-out, access changes or inactivity can end Voice. A session whose closure is still being confirmed can temporarily prevent another session from starting; continue in text while confirmation is pending.
