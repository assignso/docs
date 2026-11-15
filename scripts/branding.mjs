import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { lstatSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

export function checkBranding(root) {
  const pages = ["index.md", "logos.md", "color-and-type.md", "usage.md"].map(p => `branding/${p}`)
  const assets = ["oil", "black", "white"].flatMap(c => [`assign-mark-${c}.svg`, `assign-mark-${c}-512.png`])
    .concat(["favicon.svg", "favicon-light.svg", "favicon-dark.svg", "colors.json"])
    .map(p => `public/branding/${p}`)
  const expected = [...pages, ...assets].sort()
  const manifest = JSON.parse(readFileSync(join(root, "public/branding/files.json"), "utf8"))
  assert.equal(manifest.schema, 1)
  assert.deepEqual(Object.keys(manifest).sort(), ["files", "schema"])
  assert.deepEqual(Object.keys(manifest.files).sort(), expected, "Unreviewed branding publication")
  for (const [directory, admitted] of [["branding", pages], ["public/branding", [...assets, "public/branding/files.json"]]]) {
    assert.ok(lstatSync(join(root, directory)).isDirectory(), "Branding directory must not be a symlink")
    assert.deepEqual(readdirSync(join(root, directory)).map(p => `${directory}/${p}`).sort(), admitted.sort(), "Unexpected branding artifact")
  }
  for (const path of expected) {
    assert.ok(lstatSync(join(root, path)).isFile(), "Branding file must not be a symlink")
    const content = readFileSync(join(root, path))
    assert.equal(createHash("sha256").update(content).digest("hex"), manifest.files[path], `Branding digest differs: ${path}`)
  }
  return expected.length
}

export function checkBuiltBranding(root, output) {
  checkBranding(root)
  const manifest = JSON.parse(readFileSync(join(root, "public/branding/files.json"), "utf8"))
  const assets = Object.keys(manifest.files).filter(path => path.startsWith("public/"))
  for (const source of assets) {
    const built = readFileSync(join(output, source.slice("public/".length)))
    assert.equal(createHash("sha256").update(built).digest("hex"), manifest.files[source], `Built branding differs: ${source}`)
  }
  return assets.length
}
