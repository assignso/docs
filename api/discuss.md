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

The Web uses `POST .../turns`, which returns `202` after the turn is saved. It requires
an `Idempotency-Key` and the session CSRF token. Generation continues if you navigate
away or reload. Send `{ "content": "Your question", "reference_ids": [] }`; optional
references contain up to five IDs from your own private message history. Reusing a
key with different content or references returns `409`. You can send another turn while
a response is active. Assign saves it as an ordered successor and still runs only one
foreground response at a time.

The request may also include `context` with a surface and canonical Project, active-entity,
or selected-entity handles. The Web supplies this when you open Discuss from a Project,
Task, Document, or a selection of up to 20 Tasks. Discuss shows the inherited context as
removable chips before sending. Core resolves every handle again with your current
Workspace permissions; labels and IDs do not grant access.

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
automatically. **Retry response** explicitly creates a new turn and preserves history.

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
not imply rollback. A completed specialist posts one Agent result back to the originating branch.
At most two specialists may be active in one private conversation; specialist work cannot recursively
delegate another specialist. All responses are membership-private and `no-store`.

The compatible synchronous `POST .../messages` requires the session CSRF token and an `Idempotency-Key`.
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

When Discuss uses an internal read or change operation, the assistant message can show one compact
activity row. The row updates in place from **Working** to completed, failed or cancelled. Expand it
for bounded status, result-count and duration details. This activity is an audit-friendly summary,
not model reasoning or a raw tool transcript, and a refresh does not duplicate it.

### Clarifications, approvals, and branches

When Discuss needs a missing detail, the saved response shows a clarification prompt with bounded
choices or a labelled answer field. An approval uses explicit **Approve** and **Reject** choices;
ordinary prose is not approval. The first valid current decision wins and queues one continuation.
If the request, policy, tool catalog, expiry, or another device's decision made the prompt stale,
Discuss asks you to reload rather than applying the old decision.

Choose **Edit** on a final user message to save replacement text as a new private branch. Choose
**Regenerate** on a final assistant response to branch from its original prompt. Assign preserves
the former history and shows the active branch in the same single conversation; it does not create
named chats. Branching waits until current queued/running/stopping work is terminal. Regenerating a
successful action explanation reuses its saved receipt and explicitly says no action was repeated.

API clients use `POST .../messages/{message_id}/branch` with `operation`, `expected_revision` and
an `Idempotency-Key`. Use `POST .../interactions/{interaction_id}/decision` with
`expected_revision`, `decision` and an `Idempotency-Key`. Conflicting/stale revisions return `409`.
Message responses may include `branch_id`, `supersedes_message_id` and
`reuses_receipt_message_id`; history may include `active_branch_id`.

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

Open the **…** menu at the upper right and choose **Search Discuss history**, enter a phrase, and press
**Search** or Enter. Search runs only when submitted. **Back to conversation**
returns to the current transcript. **Load earlier messages** retrieves older
history in pages; after ten pages, use search to locate older material.

The composer grows as you write, up to a bounded height. Enter sends; Shift+Enter
adds a line. Suggested prompts fill the composer without sending. While waiting
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

Discuss does not show conversation or message Copy link actions. Existing private message
links and structured references still reveal the exact saved message, loading up to ten
history pages when needed. Unavailable or older targets show a clear fallback to Archives
search. Links do not grant access to another person.

Choose **Reference** on a saved message to add a reference to your next prompt. Remove
it from the composer before sending if it is no longer relevant. **Stop response**
requests cancellation of active work; it shows **Stopping…** until Assign confirms the
terminal result. If no response is active, it cancels the earliest queued response.
Your unsent text remains editable. Reconnection and another open tab retrieve saved updates
automatically. A stopped or failed answer offers **Retry response**.

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

Use **Attach files**, paste files, or drop them into the composer. Files count toward your
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
