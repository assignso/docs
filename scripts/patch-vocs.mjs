// Bounded compatibility fixes for the pinned framework; re-evaluate when upgrading.
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { root } from "./prepare-pages.mjs"

const directory = join(root, "node_modules/vocs")
const { version } = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"))
if (version !== "2.10.3") throw new Error(`Review Vocs compatibility fixes before upgrading from 2.10.3 to ${version}`)

const patches = [
  {
    file: "dist/internal/vite-plugins.js",
    before: "        const docs = await SearchDocuments.fromConfig(config);\n        const index = SearchIndex.fromSearchDocuments(docs, config);",
    after: "        const docs = await SearchDocuments.fromConfig(config);\n        // Public production IDs must not expose the local source checkout.\n        // Development retains absolute IDs for file-based HMR bookkeeping.\n        if (mode === 'production') {\n            const prefix = pagesDirPath + path.sep;\n            for (const doc of docs) {\n                if (doc.id.startsWith(prefix))\n                    doc.id = 'page:' + doc.id.slice(prefix.length).split(path.sep).join('/');\n            }\n        }\n        const index = SearchIndex.fromSearchDocuments(docs, config);",
  },
  {
    file: "dist/react/useTopGutterOffset.js",
    before: "function notify() {\n    for (const listener of state.listeners)",
    after: "function notify() {\n    document.documentElement.style.setProperty('--assign-header-offset', `${state.currentOffset}px`);\n    for (const listener of state.listeners)",
  },
  {
    file: "dist/react/useTopGutterOffset.js",
    before: "function init() {",
    after: "function onResize() {\n    state.lastScrollY = window.scrollY;\n    if (window.innerWidth > maxWidth || hasBanner()) {\n        state.currentOffset = 0;\n        state.targetOffset = 0;\n        notify();\n    }\n}\nfunction init() {",
  },
  {
    file: "dist/react/useTopGutterOffset.js",
    before: "    window.addEventListener('scroll', onScroll, { passive: true });",
    after: "    window.addEventListener('scroll', onScroll, { passive: true });\n    window.addEventListener('resize', onResize, { passive: true });",
  },
  {
    file: "dist/internal/config-serializer.js",
    before: "        ogImageUrl: config.ogImageUrl,",
    after: "        openapi: config.openapi?.map(({ path }) => ({ path })),\n        ogImageUrl: config.ogImageUrl,",
  },
  {
    file: "dist/waku/internal/patches/router.js",
    before: "        const { config } = await import('virtual:vocs/config');",
    after: "        const { config } = await import('virtual:vocs/config');\n        const siteRenderStrategy = config.renderStrategy;",
  },
  {
    file: "dist/waku/internal/patches/router.js",
    before: "            const isBuiltIn = file in defaultPages && !(file in modules);",
    after: "            const isBuiltIn = file in defaultPages && !(file in modules);\n            if (isBuiltIn && (file.endsWith('.d.ts') || (siteRenderStrategy === 'full-static' && pathItems.at(0) === apiDir))) continue;",
  },
]
for (const { file, before, after } of patches) {
  const target = join(directory, file)
  const source = readFileSync(target, "utf8")
  if (source.includes(after)) continue
  if (source.split(before).length !== 2) throw new Error(`Vocs compatibility patch no longer matches ${file}`)
  writeFileSync(target, source.replace(before, after))
}
console.log("Applied Vocs 2.10.3 static route, OpenAPI mount, public search ID and header synchronization fixes")
