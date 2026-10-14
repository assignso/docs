// Bounded compatibility fixes for the pinned framework; re-evaluate when upgrading.
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { root } from "./prepare-pages.mjs"

const directory = join(root, "node_modules/vocs")
const { version } = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"))
if (version !== "2.10.3") throw new Error(`Review Vocs compatibility fixes before upgrading from 2.10.3 to ${version}`)

const patches = [
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
console.log("Applied Vocs 2.10.3 static route and OpenAPI mount fixes")
