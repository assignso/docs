---
description: Format, link, mention and collaborate in Assign's single editor for Documents, Task descriptions and Comments, and how it handles Markdown.
---

# Writing in Assign

Documents, Task descriptions and Comments all use the same editor, so shortcuts, formatting, mentions
and Markdown work the same everywhere.

## Formatting

Type Markdown and it becomes formatting as you go.

| Type | Result |
| --- | --- |
| `#`, `##`, `###` and a space | Headings |
| `-` or `*` and a space | Bulleted list |
| `1.` and a space | Numbered list |
| `- [ ]` and text | Checklist item |
| `>` and a space | Quote |
| ` ``` ` | Code block |
| `**bold**`, `*italic*`, `++underlined++`, `~~struck~~` | **Bold**, *italic*, underline, ~~strikethrough~~ |
| `` `code` `` | `Inline code` |
| `---` on an empty line | Divider |

Shortcuts: `Ctrl/Cmd+B` bold, `+I` italic, `+U` underline, `+E` inline code and `+K` link. Selecting
text opens a formatting toolbar. To keep the controls visible, turn on **Always show editor toolbar**
in **Account settings → Interface**. Every command is also available from the keyboard and the `/`
menu.

Press `/` to insert a block: text, headings, lists, checklists, quote, code block, equation, divider,
images, files and references. The menu offers only what the current surface supports, so a Comment has
no headings. Dragging a block shows where it will land, and keyboard and touch block movement are
also available.

- **Checklists:** ticking a box doesn't move your cursor, and they nest. `Backspace` at the start of a
  list item lifts it out of the list.
- **Quotes:** with the caret in a line, **Quote** formats that line and keeps its text, links and
  references.
- **Equations:** **Equation** adds a display equation from LaTeX source, rendered with KaTeX.
- **Code blocks:** choose a language (Plain text, Bash, CSS, Go, JavaScript, JSON, Mermaid, PHP,
  Python or TypeScript) for highlighting. A copy button copies the exact code. Long lines scroll.
  `Tab` inserts two spaces, and `Ctrl/Cmd+Enter` returns to normal writing. Mermaid diagrams render
  when the source is valid, and invalid source stays readable. Pasting code-only content makes a code
  block, and pasting into a code block keeps the text literal.

## Images and files

In an existing Document or Task description, choose **Image** or **File** from the `/` menu. Images
show in the editor and files show as download rows. Creation drafts offer these commands once the
Document or Task exists.

Select an image to reorder it with the grip, or use **Move image up** and **Move image down**. An
attachment is a link to the file and counts toward your Workspace's attachment storage, not the
Document's size. Access is checked whenever someone views or downloads it, so removing access removes
it everywhere. If a file is deleted or you lose access, the block says so. Images must be attachments,
so a link to an image elsewhere stays a normal link.

## Mentions and links

Type `@` to search people, Projects, Documents, Tasks and active Agents you can access. A mention
stores which item you picked, not its name, so it keeps up with renames and moves. If the target is
deleted or you lose access, the mention shows as unavailable.

Agent mentions work in Task Comments only. Posting the Comment sends one request to that Agent, and
editing or replaying it doesn't duplicate the request. Agent instructions are never embedded in the
Comment.

Pasting links:

- Over selected text, the text becomes the link.
- An Assign Document or Task URL on its own becomes a live reference. A Comment URL keeps a visible
  **comment** qualifier and the exact destination.
- Any other link stays a normal link.

`Ctrl/Cmd+Z` undoes the conversion. If a title can't be looked up, you keep a working link. When
Assign is installed as a browser app, Assign links stay in the app and external links open separately.

## Markdown

Pasting Markdown keeps its structure. Copying from the editor gives you Markdown, which the MCP server
and API also read and write. The profile follows CommonMark plus strikethrough, task lists, display
equations and automatic linking of bare URLs. Complex emphasis and nested lists can differ from other
Markdown readers. Underline is written `++like this++`, which is an Assign addition, so it shows as
literal `++` in tools that don't know it.

Some Markdown has no equivalent and stays as readable text:

| Markdown | What you get |
| --- | --- |
| `![alt](https://other-site/x.png)` | A link with the alt text. Images must be attachments. |
| `1. [ ] item` | A numbered item starting with `[ ]`. Checkboxes work on bulleted lists. |
| Tables, footnotes | Their text, unchanged. |
| Code fence metadata | The language and code. |
| Raw HTML | Literal text. It's never rendered. |

Mentions, references and attachments travel as links, such as
`[Launch checklist](assign:document/doc-launch)` and `![Q3 chart](assign:attachment/att-q3)`. Other
tools still see a sensible label, and Assign turns them back into live references. These links are
identifiers and grant no access.

## Saving

Documents save as you write. The indicator beside the title shows *Unsaved changes*, *Saving…* or
*Saved*, and **Saved** means the server confirmed it. Task descriptions save through revision-checked
updates. If a save fails, Assign keeps your draft and offers a retry, and leaving the page tries to
save first. If someone else saved first, compare both versions and choose **Load saved version** or
**Retry my draft**.

Documents support live co-editing once the **Live** state appears. While connecting or reconnecting,
the last saved body stays visible but read-only. If the page shows **Reload required**, reload before
editing. Other people's colored carets and selections appear where they write. They're temporary and
never saved or exported. If live collaboration can't start after two attempts, the Document switches
to **Versioned editing** with the same autosave and conflict handling, and tries live again next time.

Metadata such as the title is revision-checked. On a conflict, choose **Keep my version and save** or
**Load their version**.

## Comments

The Comment box is the same editor with the commands that suit it. Comments post one at a time, and a
failed post keeps your draft. Below each retained Comment:

- **Copy link** opens and focuses that Comment, even a deleted placeholder.
- **Edit** and **Delete** appear on your own Comments.
- Reactions show counts. Select one to add or remove yours, or use **Add reaction** to choose 👍, ❤️,
  🎉, 😄, 😕 or 👀. Counts update live.

References stay live, and a deleted or inaccessible target keeps a plain label without a link.

## Task descriptions

Open an existing Task description to edit with others, with the same carets, selections and toolbar
preference. The saved description stays readable while collaboration connects, and if it can't start,
versioned editing may be available with conflicting drafts kept for comparison. If access is removed or
the description is replaced elsewhere, reload the Task to get the current version.

## Finding Documents

The **Documents** page has three views: **Workspace** for Documents outside Projects, **Projects** for
Documents inside one, and **All documents**. Opening it from the sidebar starts on Workspace. In
Projects, a picker starts on **All projects** and can narrow to one, and when you're looking at
several a **Location** column names each Document's Project.

Documents are sorted by most recently edited, and you can switch to **Title A–Z** or **Oldest edited**.
Search covers titles and text, including nested pages,
and shows each match with its parents. If nothing matches, choose **Clear search** or **Search all
documents**.

### Expand subdocuments <Badge type="warning" text="Awaiting deployment" />

Select **1 subdocument** or **N subdocuments** beside a Document title to expand its children
in place. Select the count again to collapse them. Select the title to open the Document.

Your scope, Project, search, sort and page are kept in the URL, so back and forward and copied links
return to the same view. Changing any of them returns to page one.

**New document** starts where you're looking. On **All projects**, choose a Project first. A row's
actions menu copies its link or archives it. **Archive** shows archived Documents for the current view
with **Restore**, and **Active documents** goes back. Permanent deletion isn't available.

## Dividers after a line break <Badge type="warning" text="Awaiting deployment" />

Type `---` on an empty line after `Enter` or `Shift+Enter` to insert a divider.
The text above stays as written. Undo restores the dashes. Markdown imports
still interpret `Title` followed directly by `---` as a heading.

## Pasting quotes <Badge type="warning" text="Awaiting deployment" />

Paste Markdown beginning with `>` to keep its quote formatting, including when
your clipboard also supplies matching plain HTML wrappers. Quotes copied as
rich text keep their formatting. Text pasted into a code block stays literal.

## Tables <Badge type="warning" text="Awaiting deployment" />

Open the editor command menu and choose Table. With your cursor in a cell, use the table controls to add or remove rows and columns, merge or split cells, or change the header row. Widen column and Narrow column provide keyboard alternatives to dragging a resize handle. Wide tables scroll within the writing area.

You can paste a Markdown pipe table or a table copied from an HTML source. Simple tables export as Markdown pipe tables. Tables with merged cells, stored widths or several paragraphs per cell export in an `assign-table` code fence so Assign can import their full structure again. Other Markdown readers may display that fence as code.

An older editor may show newer table content as read-only. Update to a client that supports its document version before editing. Older clients cannot save a table document back to the older format.

## Leaving Document creation

<Badge type="warning" text="Awaiting deployment" />

Leaving Document creation after entering content asks for confirmation. Your existing local title and body draft stays in this browser when draft storage is available. Selected labels are not part of that local draft.

## Saving during live collaboration <Badge type="warning" text="Awaiting deployment" />

An unchanged collaboration save does not add another content-history revision. If you keep typing
while an earlier save finishes, your newer changes remain unsaved until the server confirms them.
A Document can briefly show **Unsaved changes** while live collaboration initializes, even before
you type. Wait for **Saved** before closing it.
