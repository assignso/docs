import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { lstatSync, readFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const privateSchema = /["']?schema["']?\s*:\s*["']?assign\.(?:private-[\w.-]+|docs-(?:private|example-private|source-check-inputs)[\w.-]*|api-safe-projection|canonical-(?:registry|decisions)|r006\.anonymous-metadata-root-review)\.v\d+\b/
const contractDownloads = new Set([
  "openapi.yaml",
  "protocols/api-metadata/openapi.json",
  "protocols/api-metadata/provenance.json",
])
const publicArchive = /^(?:public\/)?examples\/task-workflow\/(?:typescript|php)\.zip$/

export function auditPublicationFiles(root, files, { staticOutput = false } = {}) {
  for (const file of files) {
    const path = join(root, file)
    const stat = lstatSync(path, { throwIfNoEntry: false })
    if (!stat) continue // A removed file can still be in the Git index.
    assert.ok(stat.isFile(), `Non-regular file in publication: ${file}`)
    assert.ok(!/^(?:\.secrets|\.env(?:\..+)?|\.npmrc)$/i.test(basename(file)) || basename(file) === ".env.example",
      `Private configuration in publication: ${file}`)
    assert.ok(!/\.(?:map|zip|tgz|tar(?:\.gz)?)$/i.test(file) || publicArchive.test(file),
      `Unexpected archive or source map in publication: ${file}`)
    if (/\.(?:json|ya?ml|mdx?|html|txt)$/i.test(file) || /^assets\/.*\.js$/.test(file)) {
      const content = readFileSync(path, "utf8")
      assert.ok(!privateSchema.test(content), `Private source record in publication: ${file}`)
      if ((staticOutput || file.startsWith("public/")) && /\.(?:json|ya?ml)$/i.test(file) &&
          /(?:^|[{,])\s*["']?openapi["']?\s*:\s*["']?3\.\d+/m.test(content)) {
        const download = staticOutput ? file : file.slice("public/".length)
        assert.ok(contractDownloads.has(download), `Unexpected OpenAPI download in publication: ${file}`)
      }
    }
  }
}

function publicationFiles(root, packaging) {
  if (packaging) {
    const [pack] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--offline", "--json"], {
      cwd: root, encoding: "utf8",
    }))
    return pack.files.map(({ path }) => path)
  }
  const inventory = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root, encoding: "utf8",
  })
  // Two development skill links are maintained by the workspace and excluded from downloads.
  const skillLinks = new Set([".agents/skills/browser-visual-qa", ".agents/skills/humanizer"])
  return inventory.split("\0").filter((file) => file && !skillLinks.has(file))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("..", import.meta.url))
  try {
    const files = publicationFiles(root, process.argv.includes("--package"))
    auditPublicationFiles(root, files)
    console.log(`Checked ${files.length} publication files`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
