import assert from "node:assert/strict"
import test from "node:test"
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { openSync } from "fontkit"
import { apiPresentation } from "./api-presentation.mjs"
import { docsOrigin, fontPaths, imageEntry, imageMetadata, imageManifest, operationImageHead } from "./api-og.mjs"
import { serializeFunctions, deserializeFunctions } from "../node_modules/vocs/dist/internal/config-serializer.js"
import { cardSvg, generateApiImages, layoutText, verifyApiImages } from "./render-api-og.mjs"

const spec = { tags: [{ name: "Future", "x-assign-status": "upcoming" }], paths: {
  "/api/v1/tasks": { get: { operationId: "listTasks", summary: "List Tasks", description: "Lists **Tasks** in a Workspace." },
    post: { operationId: "createTask", summary: "Create a Task", deprecated: true } },
  "/api/v1/future": { get: { operationId: "future", tags: ["Future"], summary: "Upcoming operation" } },
  "/private": { get: { operationId: "privateSecret", description: "Internal callback" } },
  "/connector": { get: { operationId: "privateConnector", security: [{ integrationPrivateConnector: [] }] } },
} }

test("only public operations receive cards; metadata retains method, path and availability", () => {
  const { operations } = apiPresentation(spec)
  assert.equal(operations.length, 3)
  const manifest = imageManifest(operations)
  assert.equal(Object.keys(manifest).length, 4)
  assert.doesNotMatch(JSON.stringify(manifest), /privateSecret|privateConnector/)
  assert.equal(new Set(Object.values(manifest).map(({ src }) => src)).size, 4)
  assert.match(manifest[operations[0].link].alt, /GET \/api\/v1\/tasks/)
  assert.match(manifest[operations[1].link].alt, /Deprecated/)
  assert.match(manifest[operations[2].link].alt, /Upcoming/)
  const { head } = deserializeFunctions(serializeFunctions({ head: operationImageHead }))
  const result = head(`${operations[0].link}/`, { frontmatter: { assignOpenGraph: imageMetadata(operations[0]) } })
  assert.equal(result.canonical, `${docsOrigin}${operations[0].link}`)
  assert.equal(result.meta.ogImage, `${docsOrigin}${manifest[operations[0].link].src}`)
  assert.equal(result.meta.twitterImage, result.meta.ogImage)
  assert.equal(result.meta.twitterCard, "summary_large_image")
  assert.equal(head("/guides/tasks", {}).meta.twitterCard, "summary_large_image")
  assert.notEqual(imageEntry({ ...operations[0], title: "Changed summary" }).src, imageEntry(operations[0]).src)
  assert.notEqual(imageEntry({ ...operations[0], upcoming: true }).src, imageEntry(operations[0]).src)
})

test("long and unbroken text fits the card, with explicit truncation and no external SVG content", () => {
  const font = openSync(fontPaths.mono.pathname)
  for (const value of ["/api/v1/" + "long-resource/".repeat(40), "word ".repeat(200), "x".repeat(500), "🙂東京é ".repeat(80)]) {
    const lines = layoutText(value, font, 34, 1072, 3)
    assert.equal(lines.length, 3)
    assert.ok(lines.at(-1).endsWith("…"))
    for (const line of lines) {
      const advance = font.layout(line).positions.reduce((sum, position) => sum + position.xAdvance, 0)
      assert.ok(advance * 34 / font.unitsPerEm <= 1072, "text crosses the card's content boundary")
    }
  }
  const svg = cardSvg({ ...apiPresentation(spec).operations[0], description: '<script>alert(1)</script> [remote](https://example.test/font)' })
  assert.doesNotMatch(svg, /<script|<foreignObject|<image|href=/)
})

test("static generation emits valid PNGs, reuses unchanged images and removes withdrawn operations", () => {
  const root = mkdtempSync(join(tmpdir(), "assign-docs-og-"))
  try {
    const { operations } = apiPresentation(spec)
    assert.deepEqual(generateApiImages(root, operations), { images: 4, rendered: 4 })
    const first = join(root, imageEntry(operations[0]).src)
    const bytes = readFileSync(first)
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a")
    assert.equal(bytes.readUInt32BE(16), 1200)
    assert.equal(bytes.readUInt32BE(20), 630)
    const before = statSync(first).mtimeMs
    assert.deepEqual(generateApiImages(root, operations), { images: 4, rendered: 0 })
    assert.equal(statSync(first).mtimeMs, before)
    writeFileSync(join(root, "keep.txt"), "outside the generated directory")
    generateApiImages(root, [operations[2]])
    assert.equal(readdirSync(join(root, "og/api")).length, 3, "only fallback, remaining card and manifest survive")
    assert.equal(readFileSync(join(root, "keep.txt"), "utf8"), "outside the generated directory")
    assert.doesNotMatch(readFileSync(join(root, "og/api/manifest.json"), "utf8"), /listtasks|createtask/)
    assert.throws(() => verifyApiImages(root, operations, docsOrigin), /AssertionError/, "missing coverage must fail publication")
  } finally { rmSync(root, { recursive: true, force: true }) }
})
