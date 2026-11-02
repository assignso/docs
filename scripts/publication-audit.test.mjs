import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import test from "node:test"
import { auditStaticPublication, pageRoute, privateWireReferences, publicPageSources, publicSections } from "./publication-audit.mjs"

const registry = () => ({ operations: Object.fromEntries([
  ["listExamples", "GET", "/api/v1/examples", "product-reference"],
  ["getExample", "GET", "/api/v1/examples/{example_id}", "product-reference"],
  ["createExampleEntry", "POST", "/api/v1/examples/entry", "first-party"],
  ["receiveExampleCallback", "POST", "/internal/example-callback", "internal"],
  ["authorizeExample", "POST", "/api/v1/example-authorization", "protocol-reference"],
].map(([operation_id, method, path, publication]) => [operation_id, { operation_id, method, path, publication: { value: publication } }])) })
const scan = (content, source = registry()) => privateWireReferences([{ file: "api/examples.md", content }], source)

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "assign-docs-parity-"))
  const put = (path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  try { run(root, put) } finally { rmSync(root, { recursive: true, force: true }) }
}

test("private-source audit distinguishes methods, concrete paths and supported protocols", () => {
  assert.deepEqual(scan("GET /api/v1/examples\nGET /api/v1/examples/$EXAMPLE_ID\nPOST /api/v1/example-authorization").privateReferences, [])
  const result = scan("POST https://example.invalid/api/v1/examples/entry?mode=example\nPOST /internal/example-callback\nPOST …/examples/entry")
  assert.equal(result.privateReferences.length, 3)
  assert.deepEqual(result.privateReferences.map(({ line }) => line), [1, 2, 3])
  assert.equal(result.unresolved.length, 0)
  // GET on the same literal path remains the public item read, not the private POST.
  assert.equal(scan("GET /api/v1/examples/entry").privateReferences.length, 0)
})

test("missing sources and unclassified operations fail; unknown and ambiguous references remain visible", () => {
  assert.throws(() => scan("", {}), /registry is missing/)
  assert.throws(() => scan("", { operations: {} }), /registry is missing/)
  const source = registry()
  delete source.operations.listExamples.publication
  assert.throws(() => scan("", source), /Missing canonical publication/)
  assert.equal(scan("GET /api/v1/unknown").unresolved.length, 1)
  assert.equal(scan("/api/v1/examples/entry").unresolved.length, 1)
})

test("wildcard protocol mounts retain their classification for each HTTP method", () => {
  const source = registry()
  source.operations.exampleMount = { operation_id: "exampleMount", method: "*", path: "/api/v1/example-mount", publication: { value: "protocol-reference" } }
  assert.equal(scan("POST /api/v1/example-mount", source).unresolved.length, 0)
  source.operations.exampleMount.publication.value = "internal"
  assert.equal(scan("GET /api/v1/example-mount", source).privateReferences.length, 1)
})

test("publication source inventory excludes nested maintenance and preserves canonical index routes", () => fixture((root, put) => {
  for (const section of publicSections) mkdirSync(join(root, section))
  put("index.md", "# Home")
  put("api/index.md", "# API")
  put("api/tutorial.mdx", "# Tutorial")
  put("api/agents.md", "# Agents")
  put("api/nested/AGENTS.md", "Maintenance")
  put("api/README.md", "Maintenance")
  put("api/.private/example.md", "Maintenance")
  assert.deepEqual(publicPageSources(root), ["api/agents.md", "api/index.md", "api/tutorial.mdx", "index.md"])
  assert.deepEqual(publicPageSources(root).map(pageRoute), ["/api/agents", "/api", "/api/tutorial", "/"])
}))

function staticFixture(run) {
  fixture((root, put) => {
    const pages = { "index.md": "# Home\n", "api/example.md": "# Example\n\nUpcoming example.\n" }
    for (const [path, content] of Object.entries(pages)) {
      put(`assets/md/${path}`, content)
      put(path, content)
      put(path === "index.md" ? "index.html" : `${path.slice(0, -3)}/index.html`, "<html>Example</html>")
    }
    put("llms.txt", "[Home](/index.md)\n[Example](/api/example.md)\n")
    put("llms-full.txt", Object.values(pages).join("\n"))
    run(root, put)
  })
}
const expected = ["/", "/api/example"]

test("every canonical page has exact HTML, Markdown, download and agent coverage", () => staticFixture((root) => {
  assert.deepEqual(auditStaticPublication(root, expected), { pages: 2, html: 2, markdown: 2, downloads: 2, agentEntries: 2 })
}))

for (const [name, mutate, error] of [
  ["stale extra HTML", (root, put) => put("old/index.html", "Old"), /HTML pages differ/],
  ["missing Markdown", (root) => rmSync(join(root, "assets/md/api/example.md")), /Markdown pages differ/],
  ["changed download", (root, put) => put("api/example.md", "Old"), /download differs/],
  ["incomplete agent body", (root, put) => put("llms-full.txt", "# Home\n"), /lacks complete Markdown/],
  ["missing agent entry", (root, put) => put("llms.txt", "[Home](/index.md)\n"), /Agent index differs/],
  ["maintenance artifact", (root, put) => put("README.md", "Private maintenance"), /Maintenance artifact/],
]) test(`publication rejects ${name}`, () => staticFixture((root, put) => {
  mutate(root, put)
  assert.throws(() => auditStaticPublication(root, expected), error)
}))
