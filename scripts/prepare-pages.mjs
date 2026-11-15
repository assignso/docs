import { checkBranding } from "./branding.mjs"
// Keep the existing public Markdown paths authoritative; stage only site content for Vocs.
import { existsSync, readdirSync, readFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadApiPresentation, operationExampleSetup, operationGuideLinks, referencePath } from "./api-presentation.mjs"
import { generateApiImages } from "./render-api-og.mjs"
import { imageMetadata, plainText } from "./api-og.mjs"
import { loadDocsContract } from "./authoring-contract.mjs"
import { compatibilityPages, compatibilityPage } from "./api-navigation.mjs"
import { errorCatalog, errorPage, errorTable } from "./error-catalog.mjs"
import { publicPageSources, publicSections as sections } from "./publication-audit.mjs"
import { metadataFiles } from "./protocol-metadata.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const pages = join(root, ".vocs-src/pages")
let expected
let errors

function writeGenerated(target, content) {
  expected.add(target)
  const bytes = Buffer.from(content)
  if (existsSync(target) && readFileSync(target).equals(bytes)) return
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, bytes)
}

function copyPage(relative) {
  let source = readFileSync(join(root, relative), "utf8")
  if (relative === "api/errors.md") {
    if (source.split("<!-- assign:error-catalog -->").length !== 2)
      throw new Error("Expected one public error catalog marker")
    source = source.replace("<!-- assign:error-catalog -->", errorTable(errors))
  }
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
  const asMdx = relative.endsWith("index.md") || /^<a id="/m.test(source)
  const target = join(pages, asMdx ? relative.replace(/\.md$/, ".mdx") : relative)
  writeGenerated(target, source)
}

export function preparePages() {
  checkBranding(root)
  expected = new Set()
  errors = errorCatalog(loadDocsContract(join(root, "public/openapi.yaml")).document)
  for (const source of publicPageSources(root)) copyPage(source)
  for (const entry of errors) writeGenerated(join(pages, "errors", `${entry.code}.md`), errorPage(entry))
  const { operations } = loadApiPresentation(root)
  generateApiImages(join(root, "public"), operations)
  for (const operation of operations) {
    const reference = `${referencePath}/${operation.group}#${operation.id}`
    const source = `---\ntitle: ${JSON.stringify(operation.title)}\ndescription: ${JSON.stringify(plainText(operation.description))}\nassignOpenGraph: ${JSON.stringify(imageMetadata(operation))}\n---\n\nimport { OpenApi } from "vocs"\n\n<div className="assign-endpoint-page">\n\n# ${operation.title}\n\n${operation.upcoming ? '**Upcoming:** This contract is not yet deployed.\n\n' : ''}${operationExampleSetup(operation)}<OpenApi.Operation spec="${referencePath}" method="${operation.method}" path=${JSON.stringify(operation.path)} data-reference="${reference}" />\n\n<div className="assign-endpoint-guides">\n\n${operationGuideLinks(operation)}\n\n</div>\n\n</div>\n`
    writeGenerated(join(pages, "api/reference/operations", `${operation.id}.mdx`), source)
  }
  for (const page of compatibilityPages)
    writeGenerated(join(pages, "api/reference/operations", `${page.id}.md`), compatibilityPage(page, operations))
  writeGenerated(join(pages, "_root.css"), readFileSync(join(root, "styles/root.css")))
  // Vocs 2.10's dead-link checker resolves downloads against pages, not public/.
  // These are not page routes; the served downloads remain in public/.
  const brandDownloads = Object.keys(JSON.parse(readFileSync(join(root, "public/branding/files.json"), "utf8")).files)
    .filter(path => path.startsWith("public/")).map(path => path.slice("public/".length))
  const downloads = ["openapi.yaml", ...metadataFiles, ...brandDownloads,
    ...["manifest.json", "typescript.zip", "php.zip"].map(file => `examples/task-workflow/${file}`)]
  for (const file of downloads)
    writeGenerated(join(pages, file), readFileSync(join(root, "public", file)))
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
