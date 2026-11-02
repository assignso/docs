// GitHub Pages has no content-negotiation middleware: publish readable Markdown URLs.
import assert from "node:assert/strict"
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { root } from "./prepare-pages.mjs"
import { methods, isInternal } from "./public-contract.mjs"
import { loadDocsContract } from "./authoring-contract.mjs"
import { loadApiPresentation, operationExampleSetup, operationGuideLinks } from "./api-presentation.mjs"
import { docsOrigin, imageEntry } from "./api-og.mjs"
import { developerNavigation, compatibilityPages } from "./api-navigation.mjs"
import { verifyApiImages } from "./render-api-og.mjs"
import { operationExamples } from "./operation-examples.mjs"
import { auditStaticPublication, pageRoute, publicPageSources } from "./publication-audit.mjs"
import { errorCatalog } from "./error-catalog.mjs"
import { parse as parseOpenApi } from "../node_modules/vocs/dist/internal/openapi/parser.js"
import { codeSamples, responseSamples } from "../node_modules/vocs/dist/internal/openapi/sample.js"

const output = join(root, "dist/public")
const searchIndexes = readdirSync(join(output, "assets")).filter(name => /^search-index-.*\.json$/.test(name))
assert.equal(searchIndexes.length, 1, "Expected one current keyword search index")
const searchJson = readFileSync(join(output, "assets", searchIndexes[0]), "utf8")
assert.ok(!searchJson.includes(root), "Keyword search exposes the local checkout")
for (const id of Object.values(JSON.parse(searchJson).documentIds)) {
  assert.match(id, /^(?:page:|nav:|openapi:)/, "Keyword search has an unexpected document identity")
}
verifyApiImages(output, loadApiPresentation(root).operations, docsOrigin)
const markdown = join(output, "assets/md")
// Native embeds render the browser page. Publish their complete Markdown twin
// from Vocs' resource output so schema/example formatting has one owner.
let full = readFileSync(join(output, "llms-full.txt"), "utf8")
const { operations: referenceOperations } = loadApiPresentation(root)
assert.deepEqual(Object.keys(operationExamples).sort(), referenceOperations.map(({ id }) => id).sort(), "Request examples must match the public operation set")
const referenceModel = await parseOpenApi({ path: "/api/reference", spec: loadDocsContract(join(root, "public/openapi.yaml")).document })
const models = new Map(referenceModel.groups.flatMap((group) => group.operations).map((operation) => [operation.id, operation]))
for (const group of new Set(referenceOperations.map((operation) => operation.group))) {
  const page = join(markdown, `api/reference/${group}.md`)
  const original = readFileSync(page, "utf8").trim()
  const sections = original.split(/(?=^## )/m)
  for (const operation of referenceOperations.filter((operation) => operation.group === group)) {
    const index = sections.findIndex((section) => section.split("\n").includes(`\`${operation.method} ${operation.path}\``))
    assert.ok(index >= 0, `Missing Markdown operation: ${operation.id}`)
    if (!sections[index].includes(`<a id="${operation.id}">`))
      sections[index] = sections[index].replace(/^(## [^\n]*\n)/, `$1\n<a id="${operation.id}"></a>\n`)
    const setup = operationExampleSetup(operation, true)
    const model = models.get(operation.id)
    assert.ok(model, `Missing native model: ${operation.id}`)
    const requests = codeSamples(model, referenceModel.servers[0]?.url).map((sample) => `\`\`\`${sample.lang}\n${sample.code.trim()}\n\`\`\``)
    const responses = responseSamples(model).filter((sample) => /^2/.test(sample.status)).map((sample) =>
      `Illustrative HTTP \`${sample.status}\` response:\n\n\`\`\`json\n${sample.code}\n\`\`\``)
    for (const response of model.responses.filter((response) => /^2/.test(response.status) && response.content.length === 0))
      responses.push(`HTTP \`${response.status}\` with no response body.`)
    assert.ok(requests.length && responses.length, `Missing examples: ${operation.id}`)
    const requestStart = sections[index].indexOf("\n### Example request\n")
    assert.ok(requestStart >= 0, `Missing native request section: ${operation.id}`)
    sections[index] = `${sections[index].slice(0, requestStart).trimEnd()}\n\n### Example request\n\n${setup}${requests.join("\n\n")}\n\n### Example response\n\n${responses.join("\n\n")}\n\n`
  }
  const content = sections.join("").trim()
  assert.ok(full.includes(original), `Agent bundle is missing resource ${group}`)
  full = full.replace(original, content)
  writeFileSync(page, `${content}\n`)
}
for (const operation of referenceOperations) {
  const html = readFileSync(join(output, `api/reference/operations/${operation.id}/index.html`), "utf8")
  assert.equal((html.match(/<section data-v-openapi-operation="true"/g) ?? []).length, 1, `Endpoint must render one operation: ${operation.id}`)
  assert.doesNotMatch(html, /No matching operation found|No OpenAPI spec is configured/)
  const page = join(markdown, `api/reference/operations/${operation.id}.md`)
  const original = readFileSync(page, "utf8").trim()
  const resource = readFileSync(join(markdown, `api/reference/${operation.group}.md`), "utf8")
  const sections = resource.split(/(?=^## )/m)
  const target = sections.find((section) => section.split("\n").includes(`\`${operation.method} ${operation.path}\``))
  assert.ok(target, `No native Markdown for ${operation.method} ${operation.path}`)
  const content = `# ${operation.title}\n\n${operation.upcoming ? '> **Upcoming:** This contract is not yet deployed.\n\n' : ''}${target.replace(/^## [^\n]*\n+/, "").trim()}\n\n${operationGuideLinks(operation, true)}\n`
  if (original === content.trim()) continue
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
for (const file of ["cli/index.md", "cli/commands.md", "cli/scripting.md", "api/authentication.md", "api/account.md", "api/realtime.md", "api/versioning.md"]) {
  const route = file.replace(/(?:\/index)?\.md$/, "/index.html")
  const html = readFileSync(join(output, route), "utf8")
  for (const [, markdownId, htmlId] of readFileSync(join(root, file), "utf8").matchAll(/(?:\{#([^}]+)\}|<a id="([^"]+)")/g)) {
    const id = markdownId ?? htmlId
    assert.ok(html.includes(`id="${id}"`), `Legacy anchor is missing: ${file}#${id}`)
  }
}
// Resolve the actual built guide/reference navigation, including fragment links.
const targets = new Set()
function collectNavigation(items) {
  for (const item of items) {
    if (item.link?.startsWith("/")) targets.add(item.link)
    if (item.items) collectNavigation(item.items)
  }
}
collectNavigation(developerNavigation)
collectNavigation(loadApiPresentation(root).sidebar)
for (const target of targets) {
  const [route, fragment] = target.split("#")
  const file = route.endsWith(".yaml") ? route.slice(1) : `${route.replace(/^\/|\/$/g, "")}/index.html`
  assert.ok(existsSync(join(output, file)), `Navigation target is missing: ${target}`)
  if (fragment) assert.ok(readFileSync(join(output, file), "utf8").includes(`id="${fragment}"`), `Navigation fragment is missing: ${target}`)
}
const operationRoutes = referenceOperations.map(({ id }) => id)
assert.deepEqual(readdirSync(join(output, "api/reference/operations")).filter((name) => existsSync(join(output, "api/reference/operations", name, "index.html"))).sort(),
  [...operationRoutes, ...compatibilityPages.map(({ id }) => id)].sort(), "Unexpected operation or compatibility route")
for (const page of compatibilityPages) {
  const route = `api/reference/operations/${page.id}`
  const html = readFileSync(join(output, route, "index.html"), "utf8")
  const md = readFileSync(join(output, `${route}.md`), "utf8")
  assert.ok(html.includes('/api/reference/operations/listworkspacetasks'), `Compatibility target missing: ${page.id}`)
  assert.doesNotMatch(html, /<section data-v-openapi-operation="true"/, `Compatibility page must not restore an operation: ${page.id}`)
  assert.ok(html.includes(imageEntry().src), `Compatibility page must use the generic card: ${page.id}`)
  assert.match(md, /List Workspace Tasks/)
  assert.ok(md.includes(`\`${page.selector}\``), `Compatibility filter missing: ${page.id}`)
  assert.ok(full.includes(md.trim()), `Agent bundle lacks compatibility guidance: ${page.id}`)
  for (const file of ["api/reference/tasks/index.html", "api/reference/tasks.md"]) {
    assert.ok(readFileSync(join(output, file), "utf8").includes(`id="${page.id}"`), `Compatibility fragment missing: ${file}#${page.id}`)
  }
}
console.log(`Resolved ${targets.size} navigation targets and ${compatibilityPages.length} safe Task compatibility pages/fragments`)
const index = readFileSync(join(output, "llms.txt"), "utf8").replace(/\]\((\/[^)]*)\)/g, (_, path) => {
  const download = path.endsWith(".md") ? path : path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`
  assert.ok(existsSync(join(output, download)), `Agent index has no Markdown download: ${path}`)
  return `](${download})`
})
writeFileSync(join(output, "llms.txt"), index)
assert.match(index, /\/api\/reference\/tasks/)
assert.doesNotMatch(index, /AGENTS\.md|README\.md|\.agents\/|\.vocs-src/)
const { document: spec, authoring } = loadDocsContract(join(output, "openapi.yaml"))
const pageCounts = auditStaticPublication(output, [
  ...publicPageSources(root).map(pageRoute),
  ...new Set(referenceOperations.map(({ group }) => `/api/reference/${group}`)),
  ...referenceOperations.map(({ id }) => `/api/reference/operations/${id}`),
  ...compatibilityPages.map(({ id }) => `/api/reference/operations/${id}`),
  ...errorCatalog(spec).map(({ code }) => `/errors/${code}`),
])
console.log(`Verified ${pageCounts.pages} canonical pages across HTML, Markdown, downloads and agent resources`)
let operations = 0
for (const item of Object.values(spec.paths)) for (const method of methods) {
  const operation = item[method]
  if (!operation) continue
  if (!authoring) assert.ok(!isInternal(operation), "Private operation was published")
  operations++
}
console.log(`${authoring ? "Prepared authoring output for" : "Published"} ${count} Markdown downloads; verified static reference, agent index and ${operations} public operations`)
