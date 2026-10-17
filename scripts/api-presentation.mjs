// Presentation only: the published OpenAPI document remains the source of API facts.
import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { methods, publicContract } from "./public-contract.mjs"

export const referencePath = "/api/reference"
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const variants = { get: "success", post: "info", put: "warning", patch: "warning", delete: "danger" }
const resourceGroups = [
  ["Account and access", ["Authentication", "Account", "Identity", "People", "Billing"]],
  ["Work management", ["Workspaces", "Projects", "Tasks", "Labels", "Time tracking"]],
  ["Content and knowledge", ["Comments", "Documents", "Attachments", "Search", "Knowledge"]],
  ["Automation and integrations", ["Agents", "Discuss", "Integrations", "Developer clients", "CLI", "Commands"]],
  ["Upcoming", ["Activity", "HomeWork", "Realtime"]],
]

export function apiPresentation(spec, manifest, options) {
  spec = publicContract(spec, manifest, options)
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
      title: operation.summary ?? `${method.toUpperCase()} ${path}`,
      description: operation.description ?? operation.summary ?? `${method.toUpperCase()} ${path}`,
      deprecated: operation.deprecated === true,
      upcoming: tagInfo?.["x-assign-status"] === "upcoming" || /\bupcoming\b/i.test(tagInfo?.description ?? ""),
      link: `${referencePath}/operations/${id}`,
      badge: { text: method.toUpperCase(), variant: variants[method] ?? "note" },
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
      { text: "Quickstart", link: "/get-started/quickstart" },
      { text: "Authentication", link: "/api/authentication" },
      { text: "Conventions & errors", link: "/api/conventions" },
    ] },
    ...[...resourceGroups, ["More resources", remaining]].flatMap(([text, tags]) => {
      const items = tags.flatMap(resourceItem)
      if (!items.length) return []
      return [{ text, items }]
    }),
    { text: "Resources", items: [
      { text: "Integration guides", link: "/api" },
      { text: "Endpoint index", link: "/api/endpoints" },
      { text: "OpenAPI document", link: "/openapi.yaml", external: true },
    ] },
  ]
  return { operations, sidebar }
}

export function loadApiPresentation(root) {
  return apiPresentation(parse(readFileSync(`${root}/public/openapi.yaml`, "utf8")))
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
