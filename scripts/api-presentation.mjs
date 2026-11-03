// Presentation only: the published OpenAPI document remains the source of API facts.
import { methods, publicContract } from "./public-contract.mjs"
import { loadDocsContract } from "./authoring-contract.mjs"
import { protocolNavigation } from "./api-navigation.mjs"
import { operationTitle } from "./operation-examples.mjs"

export const referencePath = "/api/reference"
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const variants = { get: "success", post: "info", put: "warning", patch: "warning", delete: "danger" }
const resourceGroups = [
  ["Account and access", ["Authentication", "Account", "Identity", "People", "Billing"]],
  ["Work management", ["Workspaces", "Projects", "Tasks", "Labels", "Time tracking"]],
  ["Content and knowledge", ["Comments", "Documents", "Attachments", "Search", "Knowledge"]],
  ["Automation and integrations", ["Agents", "Discuss", "Integrations", "Webhooks", "Operations", "Developer clients", "CLI", "Commands"]],
  ["Upcoming", ["Activity", "HomeWork", "Realtime"]],
]

export { operationTitle } from "./operation-examples.mjs"

function operationGuides(spec, item, operation, method) {
  const parameter = (value) => value.$ref
    ? spec.components?.parameters?.[value.$ref.split("/").at(-1)] : value
  const parameters = [...(item.parameters ?? []), ...(operation.parameters ?? [])].map(parameter)
  const has = (location, name) => parameters.some((entry) => entry?.in === location && entry.name.toLowerCase() === name.toLowerCase())
  const links = [
    ["Authentication", "/api/authentication"],
    ["Conventions", "/api/conventions"],
  ]
  if (operation.tags?.includes("Operations")) links.push(["Follow background work", "/api/operations"])
  if (operation.operationId === "bulkUpdateTasks") links.push(["Change several Tasks", "/api/bulk"])
  if (/Webhook/.test(operation.operationId ?? "")) links.push(["Receive Task webhooks", "/api/webhooks"])
  if (has("query", "cursor")) links.push(["Pagination", "/api/pagination"])
  if (method === "get" && (has("header", "If-None-Match") || has("header", "If-Match")))
    links.push(["Conditional reads", "/api/conventions#cache-and-conditional-reads"])
  if (method !== "get" && has("header", "If-Match"))
    links.push(["Conditional edits", "/api/writes#make-an-edit"])
  if (has("header", "Idempotency-Key"))
    links.push(["Recover an unknown outcome", "/api/writes#recover-an-unknown-outcome"])
  links.push(["Errors and recovery", "/api/errors"])
  return links
}

export function operationGuideLinks(operation, markdown = false) {
  const resource = `${referencePath}/${operation.group}#${operation.id}`
  return [...operation.guides, ["Resource reference", resource]].map(([label, link]) => {
    const [path, fragment] = link.split("#")
    return `[${label}](${path}${markdown ? ".md" : ""}${fragment ? `#${fragment}` : ""})`
  }).join(" · ")
}

export function operationExampleSetup(operation, markdown = false) {
  if (!operation.bearerExample) return ""
  const notes = [`Set \`ASSIGN_TOKEN\` to a [supported bearer credential](/api/authentication${markdown ? ".md" : ""}). The TypeScript examples read environment variables through Node.js. Replace the fictitious resource IDs with IDs you can access.`]
  if (operation.guides.some(([label]) => label === "Recover an unknown outcome"))
    notes.push("Set `IDEMPOTENCY_KEY` to a new unique key for this intended write. Keep that key and the exact request after an unknown outcome.")
  if (operation.guides.some(([label]) => label === "Conditional edits"))
    notes.push("Set `ITEM_ETAG` to the exact opaque ETag from the current item read required by this operation, including its quotes.")
  if (operation.id === "listactivitygroupchildren")
    notes.push("Replace the example group ID, `group_revision` and `snapshot` with locators from the parent Activity response, and keep its original scope and day selectors.")
  return `${notes.join("\n\n")}\n\n`
}

export function apiPresentation(spec, manifest, options) {
  return presentApi(publicContract(spec, manifest, options))
}

function presentApi(spec, authoring = false) {
  const operations = []
  const seen = new Set()
  for (const [path, item] of Object.entries(spec.paths)) for (const method of methods) {
    const operation = item[method]
    if (!operation) continue
    const id = slug(operation.operationId ?? `${method}-${path}`)
    if (!id || seen.has(id)) throw new Error(`Duplicate endpoint route: ${id}`)
    seen.add(id)
    const tag = operation.tags?.[0] ?? "Other"
    const tagInfo = spec.tags?.find((entry) => entry.name === tag)
    operations.push({ id, path, method: method.toUpperCase(), tag, group: slug(tag),
      title: operationTitle(operation, `${method.toUpperCase()} ${path}`),
      description: operation.description ?? operation.summary ?? `${method.toUpperCase()} ${path}`,
      deprecated: operation.deprecated === true,
      upcoming: authoring || tagInfo?.["x-assign-status"] === "upcoming" || /\bupcoming\b/i.test(tagInfo?.description ?? ""),
      link: `${referencePath}/operations/${id}`,
      badge: { text: method.toUpperCase(), variant: variants[method] ?? "note" },
      guides: operationGuides(spec, item, operation, method),
      bearerExample: operation.security?.length === 1 && Object.keys(operation.security[0]).length === 1 && Object.hasOwn(operation.security[0], "bearerToken"),
    })
  }
  const resourceItem = (tag) => {
    const items = operations.filter((operation) => operation.tag === tag)
    if (!items.length) return []
    return [{ text: tag, collapsed: true,
      badge: items.every((operation) => operation.upcoming) ? { text: "Upcoming", variant: "note" } : undefined,
      items: items.map(({ title, link, badge }) => ({ text: title, link, badge })),
    }]
  }
  const grouped = new Set(resourceGroups.flatMap(([, tags]) => tags))
  const remaining = [...new Set(operations.map(({ tag }) => tag))].filter((tag) => !grouped.has(tag))
  const sidebar = [
    { text: "API reference", items: [
      { text: "Overview", link: referencePath },
      { text: "Developer guides", link: "/api/" },
      { text: "First API request", link: "/api/authentication#make-your-first-request" },
      { text: "Authentication", link: "/api/authentication" },
      { text: "Conventions & errors", link: "/api/conventions" },
    ] },
    ...[...resourceGroups, ["More resources", remaining]].flatMap(([text, tags]) => {
      const items = tags.flatMap(resourceItem)
      if (!items.length) return []
      return [{ text, items }]
    }),
    protocolNavigation,
    { text: "Reference downloads", items: [
      { text: "Integration guides", link: "/api" },
      { text: "Endpoint index", link: "/api/endpoints" },
      { text: "OpenAPI document", link: "/openapi.yaml", external: true },
    ] },
  ]
  return { operations, sidebar }
}

export function loadApiPresentation(root, approvalPath) {
  const { document, authoring } = loadDocsContract(`${root}/public/openapi.yaml`, approvalPath)
  return presentApi(document, authoring)
}

// Native operation embeds have no Markdown hook. Keep a resolvable link to Vocs'
// complete generated resource reference in Markdown downloads and the agent index.
export function endpointMarkdown() {
  return (tree) => {
    const walk = (parent) => {
      if (!parent.children) return
      parent.children = parent.children.map((node) => {
        if (node.name !== "OpenApi.Operation") { walk(node); return node }
        const attributes = Object.fromEntries((node.attributes ?? []).map(({ name, value }) => [name, value]))
        return { type: "paragraph", children: [{ type: "link", url: attributes["data-reference"], children: [
          { type: "text", value: "Full parameters, request schema, examples and responses in the resource reference." },
        ] }] }
      })
    }
    walk(tree)
  }
}
