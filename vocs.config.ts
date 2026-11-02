import { defineConfig } from "vocs/config"
import { loadApiPresentation, endpointMarkdown } from "./scripts/api-presentation.mjs"
import { developerNavigation } from "./scripts/api-navigation.mjs"
import { docsOrigin, imageEntry, operationImageHead } from "./scripts/api-og.mjs"

const apiReference = loadApiPresentation(import.meta.dirname)

const getStarted = [
  {
    text: "Get started",
    items: [
      { text: "Introduction", link: "/get-started/" },
      { text: "Quickstart", link: "/get-started/quickstart" },
      { text: "Core concepts", link: "/get-started/concepts" },
    ],
  },
  {
    text: "Guides",
    items: [
      { text: "Using the web app", link: "/guides/web-app" },
      { text: "Projects", link: "/guides/projects" },
      { text: "Tasks", link: "/guides/tasks" },
      { text: "Writing in Assign", link: "/guides/editor" },
      { text: "Time tracking", link: "/guides/time-tracking" },
      { text: "Settings", link: "/guides/settings" },
      { text: "Keyboard shortcuts", link: "/guides/keyboard-shortcuts" },
      { text: "Privacy and cookies", link: "/guides/privacy-and-cookies" },
    ],
  },
]

const cli = [
  {
    text: "Assign CLI",
    items: [
      { text: "Install and update", link: "/cli/" },
      { text: "Authentication", link: "/cli/authentication" },
      { text: "Command reference", link: "/cli/commands" },
      { text: "Discuss in the terminal", link: "/cli/discuss" },
      { text: "Set up MCP in Codex", link: "/cli/mcp" },
      { text: "Scripting", link: "/cli/scripting" },
    ],
  },
]

const mcp = [
  {
    text: "MCP server",
    items: [
      { text: "Overview", link: "/mcp/" },
      { text: "Connect a client", link: "/mcp/connect" },
      { text: "Tool catalog", link: "/mcp/tools" },
      { text: "Interactive previews", link: "/mcp/previews" },
      { text: "Scopes and credentials", link: "/mcp/security" },
      { text: "Troubleshooting", link: "/mcp/troubleshooting" },
    ],
  },
  {
    text: "Advanced",
    items: [
      { text: "Discuss and evidence tools", link: "/mcp/discuss" },
      { text: "Task queries and result sets", link: "/mcp/task-queries" },
      { text: "Task events and execution", link: "/mcp/events" },
    ],
  },
]


export default defineConfig({
  title: "Assign Docs",
  description: "Guides and CLI, MCP and HTTP API references for Assign.",
  baseUrl: docsOrigin,
  srcDir: ".vocs-src",
  renderStrategy: "full-static",
  checkDeadlinks: true,
  logoUrl: { light: "/docs-logo-light.svg", dark: "/docs-logo-dark.svg" },
  iconUrl: { light: "/favicon-light.svg", dark: "/favicon-dark.svg" },
  accentColor: "light-dark(oklch(0.47 0.18 259.815), oklch(0.75 0.12 259.815))",
  // GitHub Pages serves static files; runtime-only features stay disabled.
  mcp: { enabled: false },
  ogImageUrl: `${docsOrigin}${imageEntry().src}`,
  head: operationImageHead,
  topNav: [
    { text: "Get started", link: "/get-started", match: (path) => /^\/(get-started|guides)/.test(path ?? "") },
    { text: "CLI", link: "/cli" },
    { text: "MCP", link: "/mcp" },
    { text: "API reference", link: "/api/reference", match: "/api" },
    { text: "Assign", link: "https://assign.so", external: true },
  ],
  sidebar: {
    "/": getStarted,
    "/get-started": getStarted,
    "/guides": getStarted,
    "/cli": cli,
    "/mcp": mcp,
    "/api": developerNavigation,
    // Vocs 2.10 normalizes this key for matching, then prefers its longer length
    // over the auto-generated mount key. Preserve native routes with our resource nav.
    "/api/reference/": apiReference.sidebar,
  },
  markdown: { outputRemarkPlugins: [endpointMarkdown] },
  openapi: [{
    spec: "./public/openapi.yaml",
    path: "/api/reference",
    sidebar: {
      collapsed: true,
      top: [
        { text: "API guides", link: "/api" },
        { text: "Authentication", link: "/api/authentication" },
        { text: "Conventions", link: "/api/conventions" },
      ],
      bottom: [{ text: "Download OpenAPI", link: "/openapi.yaml", external: true }],
    },
  }],
  editLink: { link: (path) => {
    let source = path.replace(/^\.vocs-src\/pages\//, "").replace(/\.mdx$/, ".md")
    if (/api\/reference\/operations\/(?:gettaskbycode|listprojecttasks)\.md$/.test(source))
      source = "scripts/api-navigation.mjs"
    else if (source.includes("api/reference/operations/")) source = "public/openapi.yaml"
    else if (/(?:^|\/)errors\//.test(source)) source = "scripts/error-catalog.mjs"
    return `https://github.com/assignso/docs/edit/main/${source}`
  } },
  socials: [{ icon: "github", link: "https://github.com/assignso/docs" }],
})
