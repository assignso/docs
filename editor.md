# Writing in Assign

Assign has one editor. Documents, task descriptions, and comments all use it, so
the same shortcuts, formatting, mentions, and Markdown behave the same way
everywhere.

Editor body text uses a compact, consistent size across Documents, Task
descriptions, and Comments. Headings remain proportionally larger so the
document structure stays easy to scan.

## Finding documents

The **Documents** page lists top-level documents in a stable title order.
Search checks both the title and document text. You can combine it with
the **Project** and **scope** filters to narrow the list further.

Your filters and current page are kept in the URL, so browser back/forward and
copied links return to the same view. Changing a filter returns to page one.
Each page shows up to ten documents, with the visible result range beside the
Previous and Next controls. If nothing matches, choose **Clear filters** to
return to the complete list.

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
controls visible all the time, turn on **Formatting controls** on a document
page. That is a display preference — it changes nothing about your content, and
every command stays available from the keyboard and the `/` menu either way.

## Inserting blocks

Press `/` anywhere to search the blocks you can insert: text, headings, lists,
checklists, quote, code block, divider, images, files, and references. The `/`
menu only offers what the surface you are writing in supports — a comment, for
example, has no headings.

### Checklists

A checklist is a list you can tick off. Start one by typing `- [ ]` and a space,
or choose **Checklist** from the `/` menu. Ticking a box does not move your
cursor, so you can keep typing, and checklists nest like any other list.

Checklists are ordinary content: they export to Markdown as `- [ ]` and `- [x]`,
and anything that reads GFM Markdown reads them correctly.

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

## Mentioning people and linking work

Type `@` to search people, projects, documents, and tasks you have access to.
Results are grouped and limited to a handful of matches, and you only ever see
targets you are allowed to see.

An inserted mention stores *which* person, project, document, or task you picked — not a
copy of its name. If the document is renamed or the task moves, the mention
keeps up. If the target is deleted, or someone loses access to it, the mention
shows as unavailable rather than pretending the target is still there.

## Pasting links

- Paste a link over selected text and the text becomes the link.
- Paste an Assign document or task URL on its own and it becomes a live
  reference to that document or task.
- Paste any other link and it stays a normal link.

One `Ctrl/Cmd+Z` undoes the conversion. Nothing about a
paste blocks typing: if a link's title cannot be looked up, you are left with a
working link.

## Markdown in and out

Pasting Markdown keeps its structure. Copying from the editor gives you Markdown
back, which is also what the Assign MCP server and API-based tools read and
write.

Assign's Markdown is CommonMark, plus strikethrough, task lists, and automatic
linking of bare URLs. Imported `- [ ]` and `- [x]` items become checkboxes;
clicking a checkbox while editing updates the document, and Markdown export
preserves its open or completed state.

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
the same editing surface, but the current public Task API does not yet persist
them; API-mode clients must not present a task description as server-saved.

Documents support live co-editing after the **Live** connection state appears.
While Assign is connecting or reconnecting, the last server-saved body remains
visible and readable, including on mobile, but stays read-only until the live
session has safely synchronized. If the page shows **Reload required**, reload
before continuing to edit so Assign can reconcile the durable document with the
live session.

Metadata changes such as title or properties remain revision-checked. If
someone else saved conflicting metadata while you were editing, Assign does not
overwrite their work. You keep your draft and choose:

- **Keep my version and save** — your text wins, saved on top of theirs.
- **Load their version** — their saved version replaces your conflicting draft.

## Comments

The comment box on a task is the same editor, with the commands that make sense
there. Comments post one at a time; they are not a live shared session. A failed
post keeps your draft so you can try again.
