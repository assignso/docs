# Docs repository rules

This repository is public. Everything in it, including Git history, can be read by anyone.

## Audience and boundary

- Write for people using Assign and for public API consumers. Describe released behavior, plus
  clearly badged upcoming behavior when the owning architecture record accepts it.
- Never add internal architecture, implementation reasoning, security analysis, capacity plans,
  incident notes, internal routes, fixture or test modes, credentials, customer data or
  unreleased strategy. Those belong in the private `architecture/` repository.
- Don't claim compatibility, conformance, security or performance properties without current
  evidence. Name only clients and platforms whose support has been verified.

## Source-of-truth map

| Page | Source of truth | How to keep it current |
| --- | --- | --- |
| `api/endpoints.md` | `openapi-spec/openapi.yaml` | `npm run generate:api` (never edit by hand) |
| `api/*.md` | `openapi-spec` + owning `architecture/` specification | Update in the same change as the contract |
| `mcp/tools.md` catalog | `assign-core/internal/mcp` (registrations and `writeTool`) | Update tables; `npm run check:sources` |
| `mcp/*.md` | `architecture/api/mcp.md` and the MCP roadmap | Update with every exposed MCP capability |
| `cli/commands.md` | `assign-cli/internal/cli` (cobra commands, flags, aliases, exit codes) | Update tables; `npm run check:sources` |
| `cli/*.md` | `assign-cli` README and release notes | Update with each CLI release |
| `guides/*.md` | `assign-web` behavior and `architecture/frontend/` | Update with user-visible UI changes |

## Status badges

Mark behavior that is accepted but not yet deployed on its heading:

```md
## Filtered Task queries <Badge type="warning" text="Awaiting deployment" />
### Saved views <Badge type="warning" text="Upcoming" />
```

Remove the badge in the same change that promotes the behavior to released. Don't write
release-candidate numbers or deployment dates into pages; they go stale.

## Style

- Task-first headings, short paragraphs, second person and present tense.
- Use Assign's canonical terms: Workspace (never Organization), Project, Task, Status, Document.
- Code blocks are copy-ready: no prompts (`$`) and no inline output.
- Every page has a `description` in its frontmatter for search and link previews.
- Link between pages with relative paths. `npm run build` fails on dead internal links.

## Before you push

```sh
npm run check:sources   # local only; needs the sibling Assign checkouts
npm run check           # markdownlint + production build
```

Commit subjects are plain imperative English without Conventional Commit prefixes.
