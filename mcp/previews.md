# Interactive previews

When your connected Assign server and MCP client support MCP Apps, `task_list`
can display compact Task rows and `task_get` can display a Task detail preview.
Lists initially show three rows; **Show N more** expands the current page without making
another request. Select a row to fetch current details. **Back to Tasks** returns to the list;
**Next page** replaces it with the next bounded page.

Each preview starts with the same compact header: a Task, Project or Document icon, the title,
key properties directly underneath, and the available actions. On narrow clients the actions wrap
below the title instead of squeezing or hiding it. The icon identifies the resource rather than
repeating the Assign app mark already shown by the client.

Details show the Task code, title, meaningful Status/priority/assignee/due metadata,
and a read-only description only when it exists. They also include the exact authorized
Comment and related-Task counts plus up to three recent Comment excerpts and three direct
relations. Verified agent provenance can appear as **Codex · via MCP**; Assign never infers
authorship from Comment wording. **Refresh** reads the same Task again. **Open in Assign**
opens its full page when your client supports opening links. Longer threads and relation
sets remain available through their normal paginated tools.

Project lists also offer compact references. Project details show the name, key,
visibility, archive status and last update; they do not include task counts or progress.
Document references open a metadata preview. Select **Load content** to request the
read-only body, limited to 128 KiB. Content already requested in chat appears immediately;
Markdown results appear as readable source. Refresh retains the selected content mode.
Some rich blocks require opening the full Document in Assign.

Long Task descriptions and loaded Document bodies provide **Show more** and **Show less**
without changing the stored content or asking the server again.

All previews use Assign's shadcn neutral styling, compact controls and light/dark themes.

Previews use the permissions already granted to the connection. An unavailable
or denied read hides the old preview and offers a retry. Some rich content is
available only on the full resource page. Clients without embedded UI support retain
the same structured results, text and resource links. Widget availability depends on
the client and server version; it does not establish support for every desktop
or mobile client. [Claude web/Desktop](https://modelcontextprotocol.io/extensions/apps/overview#client-support)
and [current Cursor editor releases](https://cursor.com/help/customization/mcp#does-cursor-support-mcp-apps)
document MCP Apps support. Claude Code, Cursor CLI, Google Antigravity and other
MCP-only surfaces still receive the structured result, text and links; treat
embedded rendering on those exact surfaces as unsupported until their vendor
documents it and Assign verifies it.

## Numbering and keyboard retry

Task and Document previews preserve numbered-list starting values. If opening
or refreshing a preview fails, **Try again** receives keyboard focus when you
have stayed in the preview. Moving back to your assistant while a read is
pending keeps focus there. Consent buttons also show a visible keyboard focus
outline.
