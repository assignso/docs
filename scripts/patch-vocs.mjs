// Bounded compatibility fixes for the pinned framework; re-evaluate when upgrading.
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { root } from "./prepare-pages.mjs"

const directory = join(root, "node_modules/vocs")
const { version } = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"))
if (version !== "2.10.3") throw new Error(`Review Vocs compatibility fixes before upgrading from 2.10.3 to ${version}`)

const patches = [
  {
    "file": "dist/internal/openapi/parser.js",
    "before": "        example: value?.example,",
    "after": "        example: value?.example ?? Object.values(value?.examples ?? {}).find((example) => example && Object.hasOwn(example, 'value'))?.value,"
  },
  {
    "file": "dist/internal/openapi/parser.js",
    "before": "import GithubSlugger from 'github-slugger';",
    "previous": "import GithubSlugger from 'github-slugger';\nimport { applyResponseExamples } from '../../../../../scripts/operation-examples.mjs';",
    "after": "import GithubSlugger from 'github-slugger';\nimport { applyOperationPresentation } from '../../../../../scripts/api-navigation.mjs';"
  },
  {
    "file": "dist/internal/openapi/parser.js",
    "before": "    return {\n        id: slugger.slug(idSource),",
    "previous": "    return applyResponseExamples({\n        id: slugger.slug(idSource),",
    "after": "    return applyOperationPresentation({\n        id: slugger.slug(idSource),"
  },
  {
    "file": "dist/internal/openapi/parser.js",
    "before": "        security: operation.security,\n    };\n}\nfunction buildBody(body)",
    "after": "        security: operation.security,\n    });\n}\nfunction buildBody(body)"
  },
  {
    "file": "dist/internal/openapi/sample.js",
    "before": "import { snippetz } from '@scalar/snippetz';",
    "after": "import { snippetz } from '@scalar/snippetz';\nimport { applyRequestExample, environmentSample } from '../../../../../scripts/operation-examples.mjs';"
  },
  {
    "file": "dist/internal/openapi/sample.js",
    "before": "    return {\n        method: operation.method,\n        url: `${base}${path}`,\n        headers,\n        queryString,\n        ...(postData ? { postData } : {}),\n    };",
    "after": "    return applyRequestExample(operation, {\n        method: operation.method,\n        url: `${base}${path}`,\n        headers,\n        queryString,\n        ...(postData ? { postData } : {}),\n    });"
  },
  {
    "file": "dist/internal/openapi/sample.js",
    "before": "const code = generator.print(client.target, client.client, request);",
    "after": "const code = environmentSample(generator.print(client.target, client.client, request), client.lang);"
  },
  {
    "file": "dist/internal/openapi/sample.js",
    "before": "const collapsedCode = generator.print(client.target, client.client, collapsedRequest);",
    "after": "const collapsedCode = environmentSample(generator.print(client.target, client.client, collapsedRequest), client.lang);"
  },
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
for (const { file, before, after, previous } of patches) {
  const target = join(directory, file)
  const source = readFileSync(target, "utf8")
  if (source.includes(after)) continue
  const from = previous && source.includes(previous) ? previous : before
  if (source.split(from).length !== 2) throw new Error(`Vocs compatibility patch no longer matches ${file}`)
  writeFileSync(target, source.replace(from, after))
}
console.log("Applied Vocs 2.10.3 static route, OpenAPI mount, public search ID, bearer example and header synchronization fixes")
