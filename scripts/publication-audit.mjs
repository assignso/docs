import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

export const publicSections = ["get-started", "guides", "cli", "mcp", "api", "branding"]
const maintenance = /^(?:AGENTS|CLAUDE|README)\.md$/

export function publicPageSources(root) {
  const pages = ["index.md"]
  function collect(relative) {
    for (const entry of readdirSync(join(root, relative), { withFileTypes: true })) {
      if (entry.name.startsWith(".") || maintenance.test(entry.name)) continue
      const path = join(relative, entry.name)
      if (entry.isDirectory()) collect(path)
      else if (entry.isFile() && /\.mdx?$/.test(entry.name)) pages.push(path)
    }
  }
  for (const section of publicSections) collect(section)
  return pages.sort()
}

export function pageRoute(source) {
  const path = source.replace(/\.mdx?$/, "").replace(/(?:^|\/)index$/, "")
  return `/${path}`.replace(/\/$/, "") || "/"
}

// The private caller supplies the registry. No private inventory is copied into Docs.
// Unrecognized references remain diagnostics; this is not a semantic source review.
export function privateWireReferences(pages, registry) {
  assert.ok(registry?.operations && Object.keys(registry.operations).length, "Required canonical publication registry is missing or empty")
  const operations = Object.values(registry.operations).map((entry) => {
    const publication = entry.publication?.value
    assert.ok(["product-reference", "protocol-reference", "first-party", "internal"].includes(publication),
      `Missing canonical publication classification: ${entry.operation_id}`)
    assert.ok(typeof entry.path === "string" && /^(?:[A-Z]+|\*)$/.test(entry.method) && entry.operation_id,
      "Invalid canonical request identity")
    return { ...entry, publication, parts: entry.path.split("/"),
      specificity: entry.path.split("/").filter((part) => !/^\{[^}]+\}$/.test(part)).length }
  })
  const privateReferences = [], unresolved = []
  for (const { file, content } of pages) {
    for (const [index, line] of content.split("\n").entries()) {
      const requests = /(?:(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE)\s+(?:https?:\/\/[^/\s]+)?)?(\/(?:api\/v1|internal)\/[^\s`<>"'\])]+|…\/[^\s`<>"'\])]+)/g
      for (const match of line.matchAll(requests)) {
        const method = match[1], path = match[2].split("?")[0].replace(/[.,;:]+$/, "")
        const suffix = path.startsWith("…/"), parts = (suffix ? path.slice(2) : path).split("/")
        let candidates = operations.filter((operation) => {
          if (method && operation.method !== "*" && method !== operation.method) return false
          const expected = suffix ? operation.parts.slice(-parts.length) : operation.parts
          return expected.length === parts.length && expected.every((part, i) => part === parts[i] || /^\{[^}]+\}$/.test(part))
        })
        if (!suffix && method) {
          const specificity = Math.max(...candidates.map((operation) => operation.specificity))
          candidates = candidates.filter((operation) => operation.specificity === specificity)
        }
        const reference = { file, line: index + 1, method: method ?? null, path }
        if (!candidates.length) unresolved.push({ ...reference, reason: "No matching canonical request" })
        else if (candidates.every((operation) => ["first-party", "internal"].includes(operation.publication)))
          privateReferences.push({ ...reference, operationIds: candidates.map((operation) => operation.operation_id).sort() })
        else if (candidates.some((operation) => ["first-party", "internal"].includes(operation.publication)))
          unresolved.push({ ...reference, reason: "Request method or path suffix has mixed publication" })
      }
    }
  }
  return { privateReferences, unresolved }
}

function filesBelow(root, relative = "") {
  return readdirSync(join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    const path = join(relative, entry.name)
    return entry.isDirectory() ? filesBelow(root, path) : [path]
  })
}

export function auditStaticPublication(output, expectedRoutes) {
  assert.equal(new Set(expectedRoutes).size, expectedRoutes.length, "Duplicate canonical page route")
  const expected = [...expectedRoutes].sort(), files = filesBelow(output)
  for (const file of files) assert.ok(!file.split("/").some((part) => part.startsWith(".") || maintenance.test(part)),
    `Maintenance artifact entered public output: ${file}`)
  const html = files.filter((file) => /(?:^|\/)index\.html$/.test(file))
    .map((file) => pageRoute(file.replace(/\.html$/, ".md"))).sort()
  assert.deepEqual(html, expected, "HTML pages differ from the canonical publication inventory")
  const markdownFiles = files.filter((file) => file.startsWith("assets/md/") && file.endsWith(".md"))
  const markdownRoutes = markdownFiles.map((file) => pageRoute(file.slice("assets/md/".length))).sort()
  assert.deepEqual(markdownRoutes, expected, "Markdown pages differ from the canonical publication inventory")
  const full = readFileSync(join(output, "llms-full.txt"), "utf8")
  for (const file of markdownFiles) {
    const relative = file.slice("assets/md/".length), content = readFileSync(join(output, file))
    assert.ok(existsSync(join(output, relative)), `Missing Markdown download: ${relative}`)
    assert.deepEqual(readFileSync(join(output, relative)), content, `Markdown download differs: ${relative}`)
    assert.ok(full.includes(content.toString().trim()), `Agent bundle lacks complete Markdown page: ${relative}`)
  }
  const index = readFileSync(join(output, "llms.txt"), "utf8")
  const indexRoutes = [...index.matchAll(/\]\((\/[^)\s]+)\)/g)].map(([, link]) => {
    assert.ok(link.endsWith(".md"), `Agent index must link to Markdown: ${link}`)
    return pageRoute(link.slice(1))
  }).sort()
  assert.deepEqual(indexRoutes, expected, "Agent index differs from the canonical publication inventory")
  return { pages: expected.length, html: html.length, markdown: markdownFiles.length, downloads: markdownFiles.length, agentEntries: indexRoutes.length }
}

export function auditVersionedReferenceLinks(output, operations, expectedLinks) {
  const guide = new URL("https://docs.assign.so/api/versioning")
  const targets = new Map(operations.map((operation) => [operation.link, operation]))
  const html = readFileSync(join(output, "api/versioning/index.html"), "utf8")
  const markdown = readFileSync(join(output, "api/versioning.md"), "utf8")
  const referenceLinks = (links) => new Set([...links].map(([, link]) => new URL(link, guide))
    .filter((url) => url.origin === guide.origin && url.pathname.startsWith("/api/reference/operations/"))
    .map((url) => url.pathname.replace(/\.md$/, "") + url.hash))
  const htmlLinks = referenceLinks(html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g))
  const markdownLinks = referenceLinks(markdown.matchAll(/\]\(([^)\s]+)\)/g))
  assert.deepEqual(markdownLinks, htmlLinks, "Versioning guide reference links differ between HTML and Markdown")
  for (const link of expectedLinks)
    assert.ok(htmlLinks.has(link), `Versioning guide is missing reference: ${link}`)
  for (const link of htmlLinks) {
    const [route, fragment] = link.split("#")
    const operation = targets.get(route)
    assert.ok(operation?.path.startsWith("/api/v1/"), `Versioning guide points outside the approved v1 reference: ${link}`)
    const endpoint = readFileSync(join(output, route, "index.html"), "utf8")
    const download = readFileSync(join(output, `${route}.md`), "utf8")
    assert.ok(endpoint.includes(`data-v-openapi-operation-title="true" id="${operation.id}"`), `Wrong HTML operation: ${link}`)
    assert.ok(endpoint.includes(`>${operation.method}</span><code data-v-openapi-endpoint-path="true">${operation.path}</code>`),
      `Wrong HTML method or versioned path: ${link}`)
    assert.ok(download.split("\n").includes(`\`${operation.method} ${operation.path}\``), `Wrong Markdown method or versioned path: ${link}`)
    assert.equal(endpoint.includes("This contract is not yet deployed."), operation.upcoming, `Wrong HTML availability: ${link}`)
    assert.equal(download.split("\n").includes("> **Upcoming:** This contract is not yet deployed."), operation.upcoming,
      `Wrong Markdown availability: ${link}`)
    if (fragment) {
      assert.ok(endpoint.includes(`id="${fragment}"`), `Missing HTML fragment: ${link}`)
      assert.ok(download.includes(`<a id="${fragment}"></a>`), `Missing Markdown fragment: ${link}`)
    }
  }
  return htmlLinks.size
}
