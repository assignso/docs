// GitHub Pages has no content-negotiation middleware: publish readable Markdown URLs.
import assert from "node:assert/strict"
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { parse } from "yaml"
import { root } from "./prepare-pages.mjs"
import { methods, isInternal } from "./public-contract.mjs"
import { loadApiPresentation } from "./api-presentation.mjs"

const output = join(root, "dist/public")
const markdown = join(output, "assets/md")
// Native embeds render the browser page. Publish their complete Markdown twin
// from Vocs' resource output so schema/example formatting has one owner.
let full = readFileSync(join(output, "llms-full.txt"), "utf8")
for (const operation of loadApiPresentation(root).operations) {
  const html = readFileSync(join(output, `api/reference/operations/${operation.id}/index.html`), "utf8")
  assert.equal((html.match(/<section data-v-openapi-operation="true"/g) ?? []).length, 1, `Endpoint must render one operation: ${operation.id}`)
  assert.doesNotMatch(html, /No matching operation found|No OpenAPI spec is configured/)
  const page = join(markdown, `api/reference/operations/${operation.id}.md`)
  const original = readFileSync(page, "utf8").trim()
  if (!original.includes("Full parameters, request schema")) continue // idempotent
  const resource = readFileSync(join(markdown, `api/reference/${operation.group}.md`), "utf8")
  const sections = resource.split(/(?=^## )/m)
  const target = sections.find((section) => section.split("\n").includes(`\`${operation.method} ${operation.path}\``))
  assert.ok(target, `No native Markdown for ${operation.method} ${operation.path}`)
  const content = `# ${operation.title}\n\n${operation.upcoming ? '> **Upcoming:** This contract is not yet deployed.\n\n' : ''}${target.replace(/^## [^\n]*\n+/, "").trim()}\n\n[Authentication](/api/authentication.md) · [Conventions and errors](/api/conventions.md) · [Resource reference](/api/reference/${operation.group}.md#${operation.id})\n`
  assert.ok(full.includes(original), `Agent bundle is missing endpoint ${operation.id}`)
  full = full.replace(original, content.trim())
  writeFileSync(page, content)
}
writeFileSync(join(output, "llms-full.txt"), full)
copyFileSync(join(root, "public/openapi.yaml"), join(output, "openapi.yaml"))
let count = 0
function publish(relative = "") {
  for (const item of readdirSync(join(markdown, relative), { withFileTypes: true })) {
    const path = join(relative, item.name)
    if (item.isDirectory()) publish(path)
    else if (item.name.endsWith(".md")) {
      mkdirSync(dirname(join(output, path)), { recursive: true })
      copyFileSync(join(markdown, path), join(output, path))
      const route = path === "index.md" ? "index.html" : `${path.slice(0, -3)}/index.html`
      assert.ok(existsSync(join(output, route)), `Markdown has no corresponding HTML route: ${path}`)
      count++
    }
  }
}
publish()

for (const path of ["index.html", "api/index.html", "api/search/index.html", "api/reference/index.html", "api/reference/tasks/index.html", "api/reference.md", "llms.txt", "llms-full.txt", "CNAME", "openapi.yaml"]) {
  assert.ok(existsSync(join(output, path)), `Missing static artifact: ${path}`)
}
assert.match(readFileSync(join(output, "index.html"), "utf8"), /Plan the work\. Wire in your tools\./, "Homepage content did not render")
for (const file of ["cli/index.md", "cli/commands.md", "cli/scripting.md"]) {
  const route = file.replace(/(?:\/index)?\.md$/, "/index.html")
  const html = readFileSync(join(output, route), "utf8")
  for (const [, id] of readFileSync(join(root, file), "utf8").matchAll(/\{#([^}]+)\}/g)) {
    assert.ok(html.includes(`id="${id}"`), `Legacy anchor is missing: ${file}#${id}`)
  }
}
const index = readFileSync(join(output, "llms.txt"), "utf8").replace(/\]\((\/[^)]*)\)/g, (_, path) => {
  const download = path.endsWith(".md") ? path : path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`
  assert.ok(existsSync(join(output, download)), `Agent index has no Markdown download: ${path}`)
  return `](${download})`
})
writeFileSync(join(output, "llms.txt"), index)
assert.match(index, /\/api\/reference\/tasks/)
assert.doesNotMatch(index, /AGENTS\.md|README\.md|\.agents\/|\.vocs-src/)
const spec = parse(readFileSync(join(output, "openapi.yaml"), "utf8"))
let operations = 0
for (const item of Object.values(spec.paths)) for (const method of methods) {
  const operation = item[method]
  if (!operation) continue
  assert.ok(!isInternal(operation, operation.security ?? spec.security ?? []), "Private operation was published")
  operations++
}
console.log(`Published ${count} Markdown downloads; verified static reference, agent index and ${operations} public operations`)
