# Assign documentation

Source for [docs.assign.so](https://docs.assign.so), the public documentation for Assign. It
covers the web app, the Assign CLI, the MCP server and the public HTTP API.

The site is built with [VitePress](https://vitepress.dev) and deployed to GitHub Pages from `main`.

## Develop

```sh
npm ci
npm run dev        # http://localhost:5173
npm run check      # markdownlint and a production build; the build fails on dead links
```

## Structure

| Path | Content |
| --- | --- |
| `index.md` | Home page |
| `get-started/` | Introduction, quickstart and core concepts |
| `guides/` | Web app guides: Projects, Tasks, editor, settings, shortcuts, time tracking and privacy |
| `cli/` | Install, authentication, command reference, Discuss, MCP setup and scripting |
| `mcp/` | MCP overview, client setup, tool catalog, previews, security and troubleshooting |
| `api/` | API overview, conventions, versioning, authentication and resource guides |
| `api/endpoints.md` | Generated endpoint index; don't edit by hand |
| `.vitepress/` | Site config and the Assign theme |
| `public/` | Static files: favicons, `CNAME` and `robots.txt` |

## Keeping the docs current

The CLI, MCP and API reference pages mirror a source of truth elsewhere, and
[AGENTS.md](AGENTS.md) describes which source owns each page. Before merging a change that
touches one of those sources, update the matching page and run:

```sh
npm run generate:api     # regenerate api/endpoints.md from openapi-spec
npm run check:sources    # local drift check for the MCP catalog, CLI reference and endpoint index
npm run check
```

`check:sources` needs the sibling Assign workspace checkouts, so it runs locally rather than in
public CI.

## Deployment

`.github/workflows/ci.yml` lints and builds every pull request. Pushes to `main` also deploy the
build to GitHub Pages. The custom domain comes from `public/CNAME` (`docs.assign.so`).

Content here must be safe for public readers. Internal architecture, security analysis,
unreleased strategy and credentials don't belong in this repository.
