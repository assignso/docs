// Keep the existing public Markdown paths authoritative; stage only site content for Vocs.
import { existsSync, readdirSync, readFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadApiPresentation, referencePath } from "./api-presentation.mjs"
import { generateApiImages } from "./render-api-og.mjs"
import { imageMetadata, plainText } from "./api-og.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const pages = join(root, ".vocs-src/pages")
const sections = ["get-started", "guides", "cli", "mcp", "api"]
let expected

function writeGenerated(target, content) {
  expected.add(target)
  const bytes = Buffer.from(content)
  if (existsSync(target) && readFileSync(target).equals(bytes)) return
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, bytes)
}

function copyPage(relative) {
  let source = readFileSync(join(root, relative), "utf8")
  source = source.replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}")
  source = source.replace(/^(#{1,6} .*?) \{#([^}]+)\}$/gm,
    '<a id="$2" />\n\n$1')
  // Preserve the existing deployment labels without a Vue component dependency.
  source = source.replace(/<Badge type="[^"]+" text="([^"]+)"\s*\/>/g,
    '<span className="assign-status">$1</span>')
  source = source.replaceAll('class="', 'className="')
  if (relative === "index.md") {
    source = source.replace("layout: page", "layout: minimal\ncontent:\n  width: full\nshowSidebar: false\noutline: false")
      // GFM must not turn a URL inside a linked card's <code> into a nested link.
      .replace(/(<code\b[^>]*>)(https?:[^<]+)(<\/code>)/g,
        (_, open, url, close) => `${open}{${JSON.stringify(url)}}${close}`)
  }
  // Plain Markdown drops raw HTML blocks and explicit anchor elements.
  const asMdx = relative.endsWith("index.md") || ["cli/commands.md", "cli/scripting.md"].includes(relative)
  const target = join(pages, asMdx ? relative.replace(/\.md$/, ".mdx") : relative)
  writeGenerated(target, source)
}

function copySection(relative) {
  for (const item of readdirSync(join(root, relative), { withFileTypes: true })) {
    const path = join(relative, item.name)
    if (item.isDirectory()) copySection(path)
    else if (/\.mdx?$/.test(item.name)) copyPage(path)
  }
}

export function preparePages() {
  expected = new Set()
  copyPage("index.md")
  for (const section of sections) copySection(section)
  const { operations } = loadApiPresentation(root)
  generateApiImages(join(root, "public"), operations)
  for (const operation of operations) {
    const reference = `${referencePath}/${operation.group}#${operation.id}`
    const source = `---\ntitle: ${JSON.stringify(operation.title)}\ndescription: ${JSON.stringify(plainText(operation.description))}\nassignOpenGraph: ${JSON.stringify(imageMetadata(operation))}\n---\n\nimport { OpenApi } from "vocs"\n\n<div className="assign-endpoint-page">\n\n# ${operation.title}\n\n${operation.upcoming ? '**Upcoming:** This contract is not yet deployed.\n\n' : ''}<OpenApi.Operation spec="${referencePath}" method="${operation.method}" path=${JSON.stringify(operation.path)} data-reference="${reference}" />\n\n<div className="assign-endpoint-guides">\n\n[Authentication](/api/authentication) · [Conventions and errors](/api/conventions) · [API guides](/api) · [Resource reference](${reference})\n\n</div>\n\n</div>\n`
    writeGenerated(join(pages, "api/reference/operations", `${operation.id}.mdx`), source)
  }
  writeGenerated(join(pages, "_root.css"), readFileSync(join(root, "styles/root.css")))
  // Vocs 2.10's dead-link checker resolves downloads against pages, not public/.
  // YAML is not a page route; the served download remains public/openapi.yaml.
  writeGenerated(join(pages, "openapi.yaml"), readFileSync(join(root, "public/openapi.yaml")))
  function removeStale(directory) {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, item.name)
      if (item.isDirectory()) removeStale(path)
      else if (!expected.has(path)) rmSync(path)
    }
  }
  removeStale(pages)
}

export { root, sections }
if (process.argv[1] === fileURLToPath(import.meta.url)) preparePages()
