# Writing in Assign

Assign has one editor. Documents, task descriptions, and comments all use it, so
the same shortcuts, formatting, mentions, and Markdown behave the same way
everywhere.

Markdown links preserve their chosen destination even when the visible label is
another URL containing underscores or parentheses. Read-only editors keep copy
available while shared formatting, link-editing and history actions are disabled.

Pasting a code-only clipboard selection creates a code block, including from
mobile clipboard providers, and keeps a recognized language hint. Mixed rich
content keeps its formatting, including multiple code blocks. If a mobile
clipboard wraps the same fenced Markdown source in plain HTML paragraphs, Assign
reads that source as Markdown. Pasting into an existing code block keeps literal
text, tabs, and line breaks, including Markdown markers and URLs.

Editor body text uses a compact, consistent size across Documents, Task
descriptions, and Comments. Headings remain proportionally larger so the
document structure stays easy to scan.

## Dividers and quotes

Choose **Divider** from the slash menu or type `---` on an empty paragraph to
insert a horizontal rule in a Document, Task description, or Comment. Markdown
imports also accept `***` and `___` and preserve the divider on export.

Type `>` followed by a space at the start of a line to begin a quote. Choosing **Quote** with a
caret formats the current logical line, including a line separated with
Shift+Enter, while retaining surrounding text, links, and references. Selecting
several blocks applies formatting to the selection.

## Finding documents

The **Documents** page uses the same wide layout as Home, My Work, and Projects
and lists top-level documents with the most recently modified first. Up to five
top-level or nested documents also appear in a horizontally scrollable
**Recent documents** row above the list. Recent documents stays independent of
the table filters. Search, Project, and scope filters sit directly above the
table. The table keeps a fixed **Name**, **Modified**, **Scope**, and **Actions**
order; select Name, Modified, or Scope to change sorting. Modified uses your
browser's long date-and-time format.

Your filters, table sort, direction, and current page are kept in the URL, so
browser back/forward and copied links return to the same view. Changing a filter
or sort returns to page one.
Each page shows up to ten documents, with the visible result range beside the
Previous and Next controls. If nothing matches, choose **Clear filters** to
return to the complete list.

Use a row's Actions menu to copy its link or archive it. The Archive page keeps
the same filters, recent row, table, and paging layout and offers Restore for
recoverable documents. Permanent deletion is not currently available.

If live collaboration cannot start for a newly opened document, Assign switches
to **Versioned editing** after two attempts. Your edits then use the same
revision-checked autosave and conflict recovery, and collaboration is tried again
the next time the document is opened.

## Formatting

Type Markdown and it becomes formatting as you go:

| Type this | To get |
| --- | --- |
| `#`, `##`, `###`, followed by a space | Headings |
| `-` or `*`, followed by a space | A bulleted list |
| `1.`, followed by a space | A numbered list |
| `- [ ]`, followed by text | An interactive checklist item |
| `>`, followed by a space | A quote |
| ` ``` ` | A code block |
| `**bold**` | **Bold** |
| `*italic*` | *Italic* |
| `++underlined++` | Underlined |
| `~~struck~~` | ~~Strikethrough~~ |
| `` `code` `` | `Inline code` |
| `---` | A divider (documents only) |

Keyboard shortcuts work too: `Ctrl/Cmd+B` for bold, `Ctrl/Cmd+I` for italic,
`Ctrl/Cmd+U` for underline, `Ctrl/Cmd+E` for inline code, and `Ctrl/Cmd+K` for a
link.

Selecting text opens a small formatting toolbar. If you would rather keep the
controls visible all the time, turn on **Always show editor toolbar** in
**Account settings → Interface**. The choice follows your account and applies
to documents, task descriptions, and comments. It changes nothing about your
content, and every command stays available from the keyboard and the `/` menu
either way.

## Inserting blocks

Formatting controls use one Tab stop. Move between their buttons with Left/Right
Arrow, or use Home/End for the first/last button. Tab leaves the controls; a link
form retains normal text-input navigation.

Press `/` anywhere to search the blocks you can insert: text, headings, lists,
checklists, quote, code block, equation, divider, images, files, and references. The `/`
menu only offers what the surface you are writing in supports — a comment, for
example, has no headings.

When you drag a block, an accent line shows exactly where it will land before
you release it. Keyboard and touch block movement remain available when dragging
isn't practical.

### Checklists

A checklist is a list you can tick off. Start one by typing `- [ ]` and a space,
or choose **Checklist** from the `/` menu. Ticking a box does not move your
cursor, so you can keep typing, and checklists nest like any other list.

Checklists are ordinary content: they export to Markdown as `- [ ]` and `- [x]`,
and anything that reads GFM Markdown reads them correctly.

At the start of a list or checklist item, press `Backspace` to lift it out of
the list. This works the same way for bulleted, numbered, and checklist items,
and you can undo it normally.

### Images and files

Choose **Image** or **File** from the `/` menu to attach something. Images show
in place; files show as a named row you can download.

An attachment is stored as a link to the file, not a copy of it, so it does not
count against the size of the document itself — it counts against your
workspace's attachment storage. Every time someone views an image or downloads a
file, Assign checks that they are still allowed to, so removing someone's access
removes it everywhere the attachment appears.

If a file is deleted, or you lose access to it, the block says so rather than
showing a broken image. Nothing is silently removed from the document.

Images must be attachments. Pasting a link to an image hosted somewhere else
leaves you with a normal link — Assign does not load pictures from other sites
into your documents.

### Equations and code

Choose **Equation** to add a display equation, then enter its LaTeX source.
Equations use KaTeX for their on-page rendering and export as:

```markdown
$$
\\frac{a}{b}
$$
```

Each editable code block uses a light neutral surface with a compact control
panel in its top-right corner. The panel appears when you hover the block, move
the caret or selection into it, tap it, or focus one of its controls; it stays
out of the way at rest and does not add an empty row before your first line. Use
**Code language** to choose Plain text, Bash, CSS, Go, JavaScript,
JSON, Mermaid diagram, PHP, Python, or TypeScript. Recognized syntax is
highlighted immediately with the Tiptap CodeBlockLowlight syntax treatment, and
the selection is retained when the document is converted to and from fenced
Markdown. The adjacent Lucide Copy icon action copies the exact code and briefly
shows whether copying succeeded; duplicate, delete, and other editor actions are
not part of this compact panel. Code remains ordinary
copyable text if the language is not recognized. Empty headings, lists, quotes,
code blocks, and equations keep a visible format-specific hint until you type.

Imported language names remain visible even when they are not in the selector's
standard list. Long code lines scroll within the block; keyboard users can focus
the code region to scroll it. Enter adds a code line, Tab inserts two spaces,
Backspace at the very start keeps the code block in place, and Ctrl/Cmd+Enter
returns to ordinary writing. A corrected Mermaid diagram can
render again after an invalid draft; invalid source remains readable.

## Mentioning people and linking work

Type `@` to search people, projects, documents, tasks, and active Agents you have access to.
Results are grouped and limited to a handful of matches, and you only ever see
targets you are allowed to see.

An inserted mention stores *which* person, project, document, task, or Agent you picked — not a
copy of its name. If the document is renamed or the task moves, the mention
keeps up. If the target is deleted, or someone loses access to it, the mention
shows as unavailable rather than pretending the target is still there.

Agent mentions are available in Task Comments only. Posting the Comment admits
one durable request for that exact Comment occurrence; editing or replaying it
does not silently duplicate the request. Agent instructions and private bindings
are never embedded in the Comment.

## Pasting links

- Paste a link over selected text and the text becomes the link.
- Paste an Assign document or task URL on its own and it becomes a live
  reference to that document or task.
- Paste a Task Comment URL and the live Task reference keeps a visible
  **comment** qualifier plus the exact Comment destination.
- Paste any other link and it stays a normal link.

When Assign is installed as a browser app, links to Assign stay inside the app.
External web links open in a separate browser context so they do not replace the
standalone Assign window.

One `Ctrl/Cmd+Z` undoes the conversion. Nothing about a
paste blocks typing: if a link's title cannot be looked up, you are left with a
working link.

## Markdown in and out

Pasting Markdown keeps its structure. Copying from the editor gives you Markdown
back, which is also what the Assign MCP server and API-based tools read and
write.

Assign's Markdown profile follows CommonMark and adds strikethrough, task lists, display
equations, and automatic linking of bare URLs. Imported `- [ ]` and `- [x]` items become checkboxes;
clicking a checkbox while editing updates the document, and Markdown export
preserves its open or completed state.

Setext headings, literal hashes in headings, tabs and backticks in code, and
escaped reference and attachment labels survive import and export. The profile
does not support every Markdown dialect; complex emphasis and nested-list cases
can differ from other Markdown readers. Named and numeric character entities
decode as text outside code. Ordinary list continuation lines stay in their item,
and whitespace inside formatting marks survives export through numeric entity
spelling when needed.

Underline is written `++like this++`. CommonMark has no underline, so this is an
Assign addition — it means underlining survives a round trip through Markdown
instead of quietly disappearing, at the cost of showing as literal `++` in a
tool that does not know it.

A few things have no equivalent in an Assign document and are kept as readable
text rather than dropped:

| Markdown | What you get |
| --- | --- |
| `![alt](https://other-site/x.png)` | A link with the alt text — images must be attachments |
| `1. [ ] item` | A numbered item whose text starts with `[ ]`; checkboxes work on bulleted lists |
| Tables | The table's text, unchanged |
| Footnotes | The notation and explanation as readable text |
| Code fence metadata | The language and code; additional metadata is omitted |
| Raw HTML | The HTML as literal text; it is never rendered |

Mentions, references, and attachments travel through Markdown as links such as
`[Launch checklist](assign:document/doc-launch)`, `[Platform](assign:project/proj-platform)`,
and `![Q3 chart](assign:attachment/att-q3)`. Another tool reading that Markdown
still sees a sensible label; Assign turns it back into a live reference or
attachment when the content comes home. Those links are identifiers, not
download links — they give nobody access to anything on their own.

## Saving

Documents save on their own as you write. The state beside the title tells you
where you are: *Unsaved changes*, *Saving…*, or *Saved*. **Saved** means the
server has confirmed it, not just that you stopped typing. Task descriptions use
the same editing surface and persist through revision-checked Task updates. If a
description save fails, Assign keeps the local draft and offers a retry instead
of discarding the linked or formatted content. Leaving the Task page flushes a
pending description save; if it still fails, returning to that Task restores
the draft. If another update wins the revision first, compare both summaries,
then choose **Load saved version** or **Retry my draft**.

Documents support live co-editing after the **Live** connection state appears.
While Assign is connecting or reconnecting, the last server-saved body remains
visible and readable, including on mobile, but stays read-only until the live
session has safely synchronized. If the page shows **Reload required**, reload
before continuing to edit so Assign can reconcile the durable document with the
live session.

When another person is actively editing the same live document, their colored
caret, selection, and name appear where they are writing. These indicators are
temporary: they disappear during a reconnect or when that collaborator leaves,
and they are never saved into the document or included in exports.

Metadata changes such as title or properties remain revision-checked. If
someone else saved conflicting metadata while you were editing, Assign does not
overwrite their work. You keep your draft and choose:

- **Keep my version and save** — your text wins, saved on top of theirs.
- **Load their version** — their saved version replaces your conflicting draft.

## Comments

The comment box on a task is the same editor, with the commands that make sense
there. Comments post one at a time; they are not a live shared session. A failed
post keeps your draft so you can try again. Use **Copy link** below any retained
comment—even a deleted-comment placeholder—to share a URL that opens and focuses
that exact place in the Task discussion. If you authored a live comment, its
**Edit** and **Delete** actions appear beside Copy link below the comment body.
Live comments also show reaction counts below the body. Select an existing
reaction to add or remove yours, or use **Add reaction** to choose 👍, ❤️, 🎉,
😄, 😕, or 👀. When the current Task discussion already uses reactions, the
picker places its three most-used choices first without storing a separate
reaction-history preference. Reaction counts update from other connected
clients without reloading the Task.
References in a posted comment remain live: Assign resolves visible people,
Tasks, Projects, and Documents before rendering their links. A deleted or no-longer
accessible target keeps a readable fallback label without becoming a link.

## Collaborating on a Task description

Open an existing Task description to edit with other people who have access. Their carets and
selections show where they are working. Your Task formatting controls and toolbar preference
stay the same. Task creation drafts and Comments use their usual save behavior.

The saved description stays readable while collaboration connects. If collaboration cannot
start, versioned editing may become available; conflicting drafts are retained for comparison. A
session that was already live reconnects automatically and does not switch to a competing save
path. If access is removed or the description is replaced elsewhere, reload the Task to recover
the current version. Carets are temporary and do not appear in exports or description history.

## Collaboration connections

The collaboration client sends its complete initial bootstrap frame within ten
seconds of connecting. A stalled connection closes so it can reconnect. Server
shutdown also closes collaboration connections; supported clients reconnect and
recover from the retained checkpoint and updates.
