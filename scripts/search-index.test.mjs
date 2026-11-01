import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"
import { define } from "../node_modules/vocs/dist/internal/config.js"
import { search } from "../node_modules/vocs/dist/internal/vite-plugins.js"
import { SearchConfig } from "../node_modules/vocs/dist/internal/search.js"
import MiniSearch from "minisearch"

const virtualId = "\0virtual:vocs/search-index"
const scratch = fileURLToPath(new URL("../../.codex/tmp/", import.meta.url))

function fixture() {
  mkdirSync(scratch, { recursive: true })
  const root = mkdtempSync(join(scratch, "docs-search-"))
  const pages = join(root, "src/pages")
  mkdirSync(pages, { recursive: true })
  const file = join(pages, "authentication.md")
  writeFileSync(file, "# Authentication\n\nConfigure bearer credentials.\n\n## Recovery\n\nRotate expired credentials.\n")
  const config = define({ rootDir: root, srcDir: "src", renderStrategy: "full-static",
    topNav: [{ text: "External reference", link: "https://example.com/reference" }] })
  return { root, pages, file, config }
}

async function production(f) {
  const plugin = search(f.config)
  plugin.configResolved({ command: "build" })
  await plugin.buildStart()
  const loader = await plugin.load(virtualId)
  const output = join(f.root, "dist")
  await plugin.writeBundle.call({ environment: { name: "client" } }, { dir: output })
  const name = readdirSync(join(output, "assets")).find(name => name.startsWith("search-index-"))
  const json = readFileSync(join(output, "assets", name), "utf8")
  const expectedHash = createHash("md5").update(json).digest("hex").slice(0, 12)
  assert.equal(name, `search-index-${expectedHash}.json`)
  assert.ok(loader.includes(name), "Search loader must fetch the emitted content hash")
  assert.ok(!json.includes(f.root), "Public search must not contain the source checkout")
  return { json, index: MiniSearch.loadJSON(json, SearchConfig.getIndexOptions(f.config)) }
}

test("actual production search has root-independent IDs, matching asset hashes and usable links", async () => {
  const a = fixture(), b = fixture()
  try {
    const first = await production(a), second = await production(b)
    assert.deepEqual(JSON.parse(first.json).documentIds, JSON.parse(second.json).documentIds)
    const ids = Object.values(JSON.parse(first.json).documentIds)
    assert.ok(ids.includes("page:authentication.md#recovery"))
    assert.ok(ids.some(id => id.startsWith("nav:")), "Navigation identities are preserved")
    const results = first.index.search("expired", SearchConfig.getQueryOptions(a.config))
    assert.equal(results[0].href, "/authentication#recovery")
    assert.equal(results[0].id, "page:authentication.md#recovery")
  } finally { rmSync(a.root, { recursive: true, force: true }); rmSync(b.root, { recursive: true, force: true }) }
})

test("development keeps file identities and actual HMR updates without changing search ranking", { timeout: 5000 }, async () => {
  const f = fixture()
  try {
    const built = await production(f)
    const plugin = search(f.config)
    plugin.configResolved({ command: "serve" })
    let onUpdate = () => {}
    plugin.configureServer({ moduleGraph: { getModuleById: () => ({}), invalidateModule() {} }, ws: { send: () => onUpdate() } })
    const load = async () => {
      const source = (await plugin.load(virtualId)).code
      const json = await new Function(source.replace("export const getSearchIndex =", "return"))()()
      return MiniSearch.loadJSON(json, SearchConfig.getIndexOptions(f.config))
    }
    const dev = await load()
    const options = SearchConfig.getQueryOptions(f.config)
    const comparable = index => index.search("expired", options).map(({ href, title, score }) => ({ href, title, score }))
    assert.deepEqual(comparable(dev), comparable(built.index))
    assert.ok(Object.values(dev.toJSON().documentIds).some(id => id.startsWith(f.file)))
    writeFileSync(f.file, "# Authentication\n\nReplacement content.\n")
    const updated = new Promise(resolve => { onUpdate = resolve })
    plugin.handleHotUpdate({ file: f.file })
    await updated
    const next = await load()
    assert.equal(next.search("expired", options).length, 0)
    assert.equal(next.search("replacement", options)[0].href, "/authentication#authentication")
  } finally { rmSync(f.root, { recursive: true, force: true }) }
})
