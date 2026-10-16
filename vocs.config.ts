import { defineConfig } from "vocs/config"
import { loadApiPresentation, endpointMarkdown } from "./scripts/api-presentation.mjs"
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

const api = [
  {
    text: "Foundations",
    items: [
      { text: "Overview", link: "/api/" },
      { text: "Conventions", link: "/api/conventions" },
      { text: "Versioning", link: "/api/versioning" },
      { text: "Authentication", link: "/api/authentication" },
      { text: "API reference", link: "/api/reference" },
      { text: "Endpoint index", link: "/api/endpoints" },
      { text: "OpenAPI document", link: "/openapi.yaml", external: true },
    ],
  },
  {
    text: "Work",
    items: [
      { text: "Account", link: "/api/account" },
      { text: "Application realtime (upcoming)", link: "/api/realtime" },
      { text: "Workspaces", link: "/api/workspaces" },
      { text: "Projects and Statuses", link: "/api/projects" },
      { text: "Tasks", link: "/api/tasks" },
      { text: "Documents", link: "/api/documents" },
      { text: "Git-backed Documents", link: "/api/git-backed-documents" },
      { text: "Attachments", link: "/api/attachments" },
      { text: "Labels", link: "/api/labels" },
      { text: "Current work", link: "/api/current-work" },
      { text: "Search", link: "/api/search" },
      { text: "Inbox", link: "/api/inbox" },
      { text: "Activity", link: "/api/activity" },
      { text: "People", link: "/api/people" },
    ],
  },
  {
    text: "AI and integrations",
    items: [
      { text: "Integrations", link: "/api/integrations" },
      { text: "Workspace Knowledge", link: "/api/knowledge" },
      { text: "Discuss", link: "/api/discuss" },
      { text: "Agents", link: "/api/agents" },
      { text: "Proposals and receipts", link: "/api/work-capabilities" },
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
    "/api": api,
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
  editLink: { link: (path) => `https://github.com/assignso/docs/edit/main/${path.includes("api/reference/operations/") ? "public/openapi.yaml" : path.replace(/^\.vocs-src\/pages\//, "").replace(/(^|\/)index\.mdx$/, "$1index.md").replace(/^(cli\/(?:commands|scripting))\.mdx$/, "$1.md")}` },
  socials: [{ icon: "github", link: "https://github.com/assignso/docs" }],
})
