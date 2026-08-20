# Writing in Assign

Assign has one editor. Documents, task descriptions, and comments all use it, so
the same shortcuts, formatting, mentions, and Markdown behave the same way
everywhere.

## Finding documents

The **Documents** page lists top-level documents with the most recently edited
first. Search checks both the title and document text. You can combine it with
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
| `>`, followed by a space | A quote |
| ` ``` ` | A code block |
| `**bold**` | **Bold** |
| `*italic*` | *Italic* |
| `~~struck~~` | ~~Strikethrough~~ |
| `` `code` `` | `Inline code` |
| `---` | A divider (documents only) |

Keyboard shortcuts work too: `Ctrl/Cmd+B` for bold, `Ctrl/Cmd+I` for italic,
`Ctrl/Cmd+E` for inline code, and `Ctrl/Cmd+K` for a link.

Selecting text opens a small formatting toolbar. If you would rather keep the
controls visible all the time, turn on **Formatting controls** on a document
page. That is a display preference — it changes nothing about your content, and
every command stays available from the keyboard and the `/` menu either way.

## Inserting blocks

Press `/` anywhere to search the blocks you can insert: text, headings, lists,
quote, code block, divider, and references. The `/` menu only offers what the
surface you are writing in supports — a comment, for example, has no headings.

## Mentioning people and linking work

Type `@` to search people, documents, and tasks you have access to. Results are
grouped and limited to a handful of matches, and you only ever see targets you
are allowed to see.

An inserted mention stores *which* person, document, or task you picked — not a
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

Assign's Markdown is CommonMark, plus strikethrough and automatic linking of
bare URLs. A few things have no equivalent in an Assign document and are kept as
readable text rather than dropped:

| Markdown | What you get |
| --- | --- |
| `![alt](image-url)` | A link carrying the alt text — images have their own upload path |
| Tables | The table's text, unchanged |
| `- [ ] item` | A list item beginning `[ ]` |
| Raw HTML | The HTML as literal text; it is never rendered |

Mentions and references travel through Markdown as links such as
`[Launch checklist](assign:document/doc-launch)`. Another tool reading that
Markdown still sees a sensible label; Assign turns it back into a live reference
when the content comes home.

## Saving

Documents save on their own as you write. The state beside the title tells you
where you are: *Unsaved changes*, *Saving…*, or *Saved*. **Saved** means the
server has confirmed it, not just that you stopped typing. Task descriptions use
the same editing surface, but the current public Task API does not yet persist
them; API-mode clients must not present a task description as server-saved.

If someone else saved the same document while you were editing, Assign does not
overwrite their work or silently merge it. You keep your draft and choose:

- **Keep my version and save** — your text wins, saved on top of theirs.
- **Load their version** — their text replaces what is in your editor.

Documents are not yet co-editable in real time. Two people editing the same
document at the same time will meet the choice above.

## Comments

The comment box on a task is the same editor, with the commands that make sense
there. Comments post one at a time; they are not a live shared session. A failed
post keeps your draft so you can try again.
