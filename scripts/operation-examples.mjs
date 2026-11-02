// Editorial labels only. Operation IDs, routes and contract descriptions stay unchanged.
const actionTitles = {
  getproject: "Read a Project",
  listworkspaceprojects: "List Workspace Projects",
  listworkspacetasks: "List Workspace Tasks",
  listworkspacereferenceoptions: "Find reference and mention candidates",
  listmywork: "Read My Work",
}

export function operationTitle(operation, fallback) {
  return actionTitles[(operation.operationId ?? operation.id)?.toLowerCase()] ?? operation.summary ?? fallback
}

// Request examples only. The approved OpenAPI document owns fields and behavior.
const keyed = { "Idempotency-Key": "${IDEMPOTENCY_KEY}" }
const conditional = { ...keyed, "If-Match": "${ITEM_ETAG}" }
const comment = { mediaType: "text/markdown", body: "Please review the release checklist." }
export const operationExamples = {
  getcomment: { query: { format: "markdown" } },
  updatecomment: { ...comment, headers: conditional, query: { format: "markdown" } },
  deletecomment: { headers: conditional },
  addcommentreaction: {},
  removecommentreaction: {},
  getproject: {},
  listprojectstatuses: { query: { limit: "50" } },
  createtask: { headers: keyed, body: { title: "Plan the next release", priority: "medium", description_markdown: "Review the release checklist." } },
  gettask: { query: { view: "canonical" } },
  updatetask: { headers: conditional, body: { title: "Review the release plan" } },
  listtaskcomments: { query: { limit: "50", format: "markdown" } },
  createcomment: { ...comment, headers: keyed, query: { format: "markdown" } },
  listactivitygroups: { query: { scope: "workspace", day: "2026-10-27", limit: "10" } },
  listactivitygroupchildren: { query: { scope: "workspace", day: "2026-10-27", limit: "25", group_revision: "example_revision", snapshot: "example_snapshot" } },
  listworkspaceprojects: { query: { limit: "50" } },
  listworkspacereferenceoptions: { query: { q: "release", limit: "10" } },
  searchworkspace: { query: { q: "release checklist", limit: "20" } },
  listworkspacetasks: { query: { limit: "50" } },
  listmywork: { query: { view: "assigned", limit: "50" } },
}

// The pinned Vocs sampler uses this hook for HTML, Markdown and copied examples.
export function applyRequestExample(operation, request) {
  const headers = request.headers.map((header) => ({ ...header }))
  if (operation.security?.length === 1 && Object.keys(operation.security[0]).length === 1 && Object.hasOwn(operation.security[0], "bearerToken") && !headers.some(({ name }) => name.toLowerCase() === "authorization"))
    headers.unshift({ name: "Authorization", value: "Bearer ${ASSIGN_TOKEN}" })
  const example = operationExamples[operation.id]
  if (!example) return { ...request, headers }
  for (const [name, value] of Object.entries(example.headers ?? {})) {
    const existing = headers.find((header) => header.name.toLowerCase() === name.toLowerCase())
    if (existing) existing.value = value
    else headers.push({ name, value })
  }
  const result = { ...request, headers, queryString: Object.entries(example.query ?? {}).map(([name, value]) => ({ name, value })) }
  const url = new URL(request.url), parts = url.pathname.split("/"), path = operation.path.split("/")
  const values = { workspace_id: workspace, project_id: projectId, task_id: taskId, comment_id: commentRecord.id, reaction: "thumbs_up", group_id: "example_group" }
  for (const [index, segment] of path.entries()) {
    const name = segment.match(/^\{([^}]+)\}$/)?.[1]
    if (name && values[name]) parts[parts.length - path.length + index] = encodeURIComponent(values[name])
  }
  url.pathname = parts.join("/")
  result.url = url.toString()
  if (example.body !== undefined) {
    const mediaType = example.mediaType ?? "application/json"
    result.headers = headers.filter(({ name }) => name.toLowerCase() !== "content-type")
    result.headers.push({ name: "Content-Type", value: mediaType })
    result.postData = { mimeType: mediaType, text: typeof example.body === "string" ? example.body : JSON.stringify(example.body, null, 2) }
  }
  return result
}

export function environmentSample(code, lang) {
  if (!code || !["bash", "ts"].includes(lang)) return code
  return code.replace(/'([^'\n]*\$\{(?:ASSIGN_TOKEN|IDEMPOTENCY_KEY|ITEM_ETAG)\}[^'\n]*)'/g, (_, value) =>
    lang === "bash" ? `"${value}"` : "`" + value.replace(/\$\{(ASSIGN_TOKEN|IDEMPOTENCY_KEY|ITEM_ETAG)\}/g, "${process.env.$1}") + "`")
}

const workspace = "0198ac5e-f9b7-7000-8000-000000000001"
const projectId = "0198ac5e-f9b7-7000-8000-000000000002"
const taskId = "0198ac5e-f9b7-7000-8000-000000000003"
const actorId = "0198ac5e-f9b7-7000-8000-000000000004"
const statusId = "0198ac5e-f9b7-7000-8000-000000000005"
const timestamp = "2026-10-27T10:00:00Z"
const richText = (text) => ({ type: "doc", schema_version: 1, content: [{ type: "paragraph", content: [{ type: "text", text }] }] })
const commentText = "Please review the release checklist."
const commentRecord = {
  id: "0198ac5e-f9b7-7000-8000-000000000006", workspace_id: workspace, task_id: taskId,
  author_actor_id: actorId, actor: "user", actor_name: null, number: 1, revision: 1,
  created_at: timestamp, updated_at: timestamp, edited_at: null, deleted_at: null, reactions: [],
}
const markdownComment = { ...commentRecord, body_markdown: commentText }
const jsonComment = { ...commentRecord, body: richText(commentText) }
const projectRecord = {
  id: projectId, workspace_id: workspace, owner_actor_id: actorId, name: "Release planning",
  key: "APP", path: "release-planning", description: "Plan the next release.", url: null,
  start_on: null, target_on: null, project_state_id: null, visual_identity: null,
  visibility: "workspace", public_id: null, permissions: { can_update: true, can_publish: false, can_manage_members: false },
  show_cancelled_column: false, next_task_number: "43", revision: "1", created_at: timestamp, updated_at: timestamp,
}
const canonicalTask = {
  id: taskId, workspace_id: workspace, project_id: projectId, task_number: "42", status_id: statusId,
  rank: "a0", title: "Plan the next release", priority: "medium", revision: "1", description: richText("Review the release checklist."),
  created_at: timestamp, updated_at: timestamp, archived_at: null, trashed_at: null,
  purge_after: null, purged_at: null, lifecycle: "active", resolved_at: null, resolved_by: null, resolution: null,
}
// Command results and canonical item reads retain their declared numeric distinctions.
const taskCommand = { ...canonicalTask, task_number: 42, code: "APP-42", revision: 1, summary: null }
const included = { assignees: [], statuses: [], milestones: [], labels: [], completeness: "complete", unavailable: [] }
const successBodies = {
  getcomment: markdownComment,
  updatecomment: { ...markdownComment, revision: 2, edited_at: "2026-10-27T10:01:00Z", updated_at: "2026-10-27T10:01:00Z" },
  addcommentreaction: { ...jsonComment, reactions: [{ reaction: "thumbs_up", count: 1, reacted_by_viewer: true }] },
  removecommentreaction: jsonComment,
  listtaskcomments: { data: [markdownComment], next_cursor: null, has_more: false, total_count: 1 },
  createcomment: markdownComment,
  getproject: projectRecord,
  listprojectstatuses: { data: [{
    id: statusId, workspace_id: workspace, project_id: projectId, label: "To do", category: "todo", status_type: "unstarted",
    icon: null, color: null, marks_task_resolved: false, position: "1", is_required: true, revision: "1",
    created_at: timestamp, updated_at: timestamp, archived_at: null,
  }], next_cursor: null },
  listworkspaceprojects: { data: [{ ...projectRecord, archived_at: null, task_count: "1" }], next_cursor: null },
  createtask: taskCommand,
  gettask: canonicalTask,
  updatetask: { ...taskCommand, title: "Review the release plan", revision: 2, updated_at: "2026-10-27T10:01:00Z" },
  listworkspacetasks: { data: [], included, next_cursor: null },
  listmywork: { data: [], included, next_cursor: null, total_count: "0", as_of_date: "2026-10-27", timezone: "UTC" },
  searchworkspace: { data: [], has_more: false, next_cursor: null },
  listworkspacereferenceoptions: { users: [], agents: [], documents: [], projects: [], tasks: [] },
}

export function applyResponseExamples(operation) {
  const body = successBodies[operation.id]
  const presented = { ...operation, summary: operationTitle(operation, `${operation.method} ${operation.path}`) }
  if (!body) return presented
  const status = ["createtask", "createcomment"].includes(operation.id) ? "201" : "200"
  return { ...presented, responses: operation.responses.map((response) => response.status === status
    ? { ...response, content: response.content.map((media) => media.mediaType === "application/json" ? { ...media, example: body } : media) }
    : response) }
}
