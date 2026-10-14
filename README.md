# Assign documentation

Source for [docs.assign.so](https://docs.assign.so), the public documentation for Assign. It
covers the web app, the Assign CLI, the MCP server and the public HTTP API.

The site is built with [Vocs](https://vocs.dev) and deployed to GitHub Pages from `main`.
The API reference at `/api/reference` is generated from the published OpenAPI contract.

## Develop

```sh
npm ci
npm run dev        # http://localhost:5173
npm test           # offline checks for the public OpenAPI projection
npm run check      # lint, Markdown audit and a static build with dead-link checks
```

The API sidebar groups resources and links to dedicated endpoint pages, for example
`/api/reference/operations/listprojecttasks`. Vocs renders the parameters, nested schemas,
request examples and responses from `public/openapi.yaml`. Existing resource pages remain
available. Restart `npm run dev` after regenerating the contract to refresh endpoint navigation.

## Structure

| Path | Content |
| --- | --- |
| `index.md` | Home page |
| `get-started/` | Introduction, quickstart and core concepts |
| `guides/` | Web app guides: Projects, Tasks, editor, settings, shortcuts, time tracking and privacy |
| `cli/` | Install, authentication, command reference, Discuss, MCP setup and scripting |
| `mcp/` | MCP overview, client setup, tool catalog, previews, security and troubleshooting |
| `api/` | API overview, conventions, versioning, authentication and resource guides |
| `api/endpoints.md`, `public/openapi.yaml` | Generated endpoint index and the published OpenAPI document; don't edit by hand |
| `vocs.config.ts`, `styles/` | Vocs navigation, OpenAPI mounting and the Assign theme |
| `.agents/resources/vocs.md` | Vocs maintenance guidance and official references |
| `.vocs-src/` | Prepared Vocs pages; generated from the authored Markdown |
| `public/` | Static files: favicons, `CNAME` and `robots.txt` |

## Keeping the docs current

The CLI, MCP and API reference pages mirror a source of truth elsewhere, and
[AGENTS.md](AGENTS.md) describes which source owns each page. Before merging a change that
touches one of those sources, update the matching page and run:

```sh
npm run generate:api     # regenerate api/endpoints.md and public/openapi.yaml from openapi-spec
npm run check:sources    # local drift check for the MCP catalog, CLI reference and endpoint index
npm run check
```

`check:sources` needs the sibling Assign workspace checkouts, so it runs locally rather than in
public CI. It checks generated files without rewriting them. The OpenAPI download excludes
private operations, their unused components and local development servers.

Vocs builds Markdown downloads plus `/llms.txt` and `/llms-full.txt` for agent readers.
The site uses keyword search. Builds skip embeddings and require no AI credentials.

## Deployment

`.github/workflows/ci.yml` lints and builds every pull request. Pushes to `main` also deploy the
static `dist/public` output to GitHub Pages. The custom domain comes from `public/CNAME` (`docs.assign.so`).

Content here must be safe for public readers. Internal architecture, security analysis,
unreleased strategy and credentials don't belong in this repository.
