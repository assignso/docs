# Vocs maintenance resources

## Official documentation

The installed version is pinned in `package.json`. Consult the current official docs and
installed types before changing framework options:

- [Getting started](https://vocs.dev/introduction/getting-started)
- [Site configuration](https://vocs.dev/reference/site-config)
- [Project structure](https://vocs.dev/introduction/project-structure)
- [OpenAPI references and embeds](https://vocs.dev/features/openapi)
- [Agent resources and Markdown audit](https://vocs.dev/features/agent-support)
- [Static versus server rendering](https://vocs.dev/features/render-strategies)
- [Navigation](https://vocs.dev/features/navigation)
- [Fonts](https://vocs.dev/features/fonts)
- [Documentation index](https://vocs.dev/llms.txt)

Request `Accept: text/markdown` when fetching official Vocs pages. Vocs also offers a read-only
`search_docs` tool through its docs MCP endpoint, `https://vocs.dev/api/mcp`; feedback submission
is a separate write and requires the user's instruction.

## Sidebar and endpoint references

The requester supplied these references on 2026-10-14. Use them when refining the sidebar or
operation presentation. They guide layout and explanation; Assign's OpenAPI contract and
released requirements own API facts.

- [shadcn.io API docs sidebar](https://www.shadcn.io/blocks/sidebar-api-docs): resource groups,
  compact HTTP method badges and separate navigation for authentication and supporting guides.
  Adapt these patterns within Vocs's generated sidebar, keeping active-operation links, readable
  labels, collapsible groups and usable mobile navigation. Review the rendered result before
  claiming visual alignment. This is a third-party block reference, not a requirement to adopt
  its Next.js implementation.
- [Resend Send Email reference](https://resend.com/docs/api-reference/emails/send-email): a
  focused operation page with language-specific request examples, a success response, and input
  descriptions that expose types, required fields, nested properties and concrete constraints.
  Use that hierarchy for Assign: action and outcome, method/path and availability, credentials,
  minimal request and response, parameters, operation-specific constraints, errors and recovery,
  and related guides. Add SDK variants only after checking actual method/version support.

Reuse Vocs OpenAPI rendering and supported operation embeds. Improve contract descriptions and
examples at their owner, then regenerate consumers. Use Assign's own credentials, schemas,
limits, status codes and lifecycle semantics; reference products' email behavior is not an
Assign contract. Maintain deployment labels and stable operation anchors.

## Operation share images

The requester supplied the [API endpoint Open Graph image reference](https://www.shadcn-ui-blocks.com/open-graph-images/api-endpoint) on 2026-10-16, then requested implementation against the current public contract. It illustrates a 1200×630 card with an HTTP method badge, endpoint path and description. The implementation uses independent Assign artwork; the reference's license-gated Next.js source is not used.

`prepare-pages.mjs` generates cards and the public route-to-image manifest under ignored `public/og/api/`. `api-og.mjs` supplies the matching [per-route head metadata](https://vocs.dev/reference/site-config#head) in `vocs.config.ts`, including a generic fallback. `render-api-og.mjs` outlines bundled Geist/Geist Mono fonts with fontkit and rasterizes them with resvg-js; no system fonts, runtime server or network image service is involved. Image filenames include source/font/content fingerprints, unchanged PNGs are reused and stale files are removed within the generator-owned directory. Keep these inputs and metadata coupled when changing the renderer.

Vocs serializes configuration callbacks by source, without their closures. Keep `operationImageHead` self-contained and pass each operation's generated metadata through `assignOpenGraph` frontmatter. The callback serialization round-trip fixture protects this boundary; a direct function invocation alone misses the static-render failure.

`publish-static.mjs` checks every operation's built image and initial HTML metadata plus the generic API-page fallback. Run `npm test` for filtering, layout, metadata and asset lifecycle fixtures, then `npm run check` for lint, Markdown and the static build. Inspect generated PNGs for long paths, descriptions and availability labels. Keep the complete textual reference in HTML and Markdown and preserve canonical operation URLs. Local checks do not establish hosted publication or third-party social-cache refresh.

## Source and generation

`vocs.config.ts` mounts the published contract at `/api/reference`. The download and generated
endpoint index are projections of the canonical contract, not a second contract owner.
`npm run generate:api -- path/to/openapi.yaml` accepts an explicit contract when the normal
sibling checkout is unavailable. `npm run check:sources` checks drift without rewriting files.

Page preparation copies only the public content sections into `.vocs-src/pages`; it converts
Vue status badges, HTML comments and explicit heading anchors for MDX. Index pages are staged
as MDX to preserve HTML wrappers. The two CLI pages with explicit anchors also use MDX.
Their edit links point to the authored Markdown; the build checks the original anchors. The dev command watches
the authored content. Maintenance files, agent instructions and sibling repositories are never
staged as site content. `styles/root.css` owns the self-hosted Geist fonts and Assign theme.

For an OpenAPI guide embed, use an MDX file in the authored `api/` directory:

```mdx
import { OpenApi } from 'vocs'

<OpenApi.Operation operationId="listProjectTasks" />
```

Resolve the operation ID from `public/openapi.yaml`; keep any deployment qualification from the
contract when embedding upcoming operations. `OpenApi.Endpoints` can reuse the
whole reference, with `path="/api/reference"`. Generated tag pages and operation anchors come
from the spec; do not hand-maintain copies of their schemas or examples.

## Pinned compatibility fixes

`postinstall` applies version-checked fixes to Vocs 2.10.3: retain mount paths in the config
used by the OpenAPI router, and omit unused runtime endpoints/declaration files from the static
router. The latter preserves the existing `/api/search` guide. Review these patches against
upstream when upgrading; unknown versions or changed patch sites fail rather than silently drift.
The frontmatter override replaces the vulnerable TOML dependency with the compatible newer
plugin. The complete build validates that integration.

## Agent and hosting boundaries

The header compatibility patch publishes Vocs' animated offset as `--assign-header-offset`
in the same frame as navigation updates and resets it when widening beyond 748px. The outline
CSS applies that offset as a transform without an extra transition, preserving the original disappearing
header and fade while keeping the lower bar attached. Heading links retain clearance.
The outline stays sticky at the unshifted header edge, then transforms with the navigation;
changing sticky `top` alone would leave a gap near the page's natural top during reversal.
The outline `!important` overrides its React inline top; 748px is the framework's scroll-hide
threshold and 1376px its outline breakpoint. Recheck downward/upward scroll,
resize, top return, search/menu/outline controls and desktop behavior when updating Vocs;
remove the patch and override if upstream supplies equivalent behavior.

`scripts/api-presentation.mjs` derives grouped resource navigation and one URL per public operation.
Keep the section labeled “API reference” and organize resources under Account and access,
Work management, Content and knowledge, Automation and integrations, and Upcoming. Put new
unclassified tags in More resources until their group is chosen; never omit their operations.
`prepare-pages.mjs` stages those pages with Vocs' native `OpenApi.Operation` embed. Preserve
generated resource routes and anchors. The scoped `/api/reference/` sidebar key deliberately
outranks Vocs 2.10's normalized mount key; verify this after framework upgrades.
Restart the development server after regenerating the public OpenAPI projection so navigation
and staged endpoint pages both reload the contract. Do not hand-edit `.vocs-src`.

Native operation embeds have no Markdown hook. The output plugin provides a reference link;
`postbuild` replaces each endpoint Markdown download and its `llms-full.txt` entry with the
complete operation section from Vocs' generated resource Markdown. Development Markdown links
to the full resource reference; published endpoint Markdown contains the schema and examples.

Vocs generates `/llms.txt`, `/llms-full.txt` and Markdown page downloads. `npm run check:markdown`
checks custom components for readable agent output. Inspect built API-reference Markdown too;
an HTML build alone does not establish agent-resource coverage.

`postbuild` publishes the generated Markdown assets at their readable root-relative `.md` URLs
and checks that the API HTML, Markdown, download and agent indexes exist. GitHub Pages receives
`dist/public`, including `CNAME`, OpenAPI and the agent resources.
The full-static site has no Vocs MCP server, feedback backend or semantic-search endpoint.
The Assign product MCP endpoint described in the guides is a separate service. Keep runtime
features disabled unless hosting is deliberately changed. Do not configure credentials or
AI retrievers for builds and checks; the build script passes `--no-embeddings`.

Verify publication filtering with `npm test`, source drift with `npm run check:sources`, and
lint, Markdown conversion and dead links with `npm run check`. Browser checks inspect local
pages, examples, search, navigation and responsive layouts without sending live API requests.
