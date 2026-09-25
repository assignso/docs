import { defineConfig, type DefaultTheme } from "vitepress"

const site = "https://docs.assign.so"

const getStarted: DefaultTheme.SidebarItem[] = [
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

const cli: DefaultTheme.SidebarItem[] = [
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

const mcp: DefaultTheme.SidebarItem[] = [
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
    ],
  },
]

const api: DefaultTheme.SidebarItem[] = [
  {
    text: "Foundations",
    items: [
      { text: "Overview", link: "/api/" },
      { text: "Conventions", link: "/api/conventions" },
      { text: "Versioning", link: "/api/versioning" },
      { text: "Authentication", link: "/api/authentication" },
      { text: "Endpoint index", link: "/api/endpoints" },
    ],
  },
  {
    text: "Work",
    items: [
      { text: "Account", link: "/api/account" },
      { text: "Workspaces", link: "/api/workspaces" },
      { text: "Projects and Statuses", link: "/api/projects" },
      { text: "Tasks", link: "/api/tasks" },
      { text: "Documents", link: "/api/documents" },
      { text: "Git-backed Documents", link: "/api/git-backed-documents" },
      { text: "Attachments", link: "/api/attachments" },
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
      { text: "Supplemental operations", link: "/api/operation-reference" },
    ],
  },
]

export default defineConfig({
  lang: "en-US",
  title: "Assign Docs",
  titleTemplate: ":title · Assign Docs",
  description:
    "Documentation for Assign: guides for the web app, the Assign CLI, the MCP server and the public HTTP API.",
  cleanUrls: true,
  lastUpdated: true,
  metaChunk: true,
  srcExclude: ["README.md", "AGENTS.md", "CONTRIBUTING.md", "scripts/**"],
  sitemap: { hostname: site },
  markdown: {
    theme: { light: "github-light", dark: "github-dark-dimmed" },
  },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon-light.svg", media: "(prefers-color-scheme: light)" }],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)" }],
    ["link", { rel: "apple-touch-icon", href: "/brand/apple-touch-icon.png" }],
    ["meta", { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" }],
    ["meta", { name: "theme-color", content: "#1b1b1b", media: "(prefers-color-scheme: dark)" }],
    ["meta", { property: "og:site_name", content: "Assign Docs" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { name: "twitter:card", content: "summary" }],
  ],
  transformPageData(pageData) {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "")
    const canonical = `${site}/${path}`
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:title", content: pageData.title ? `${pageData.title} · Assign Docs` : "Assign Docs" }],
      ["meta", { property: "og:description", content: pageData.description || pageData.frontmatter.description || "Documentation for Assign." }],
    )
  },
  themeConfig: {
    logo: { light: "/favicon-light.svg", dark: "/favicon-dark.svg", alt: "" },
    siteTitle: "Assign Docs",
    nav: [
      { text: "Get started", link: "/get-started/", activeMatch: "^/(get-started|guides)/" },
      { text: "CLI", link: "/cli/", activeMatch: "^/cli/" },
      { text: "MCP", link: "/mcp/", activeMatch: "^/mcp/" },
      { text: "API", link: "/api/", activeMatch: "^/api/" },
      {
        text: "Resources",
        items: [
          { text: "Assign", link: "https://assign.so" },
          { text: "Blog", link: "https://blog.assign.so" },
          { text: "CLI releases", link: "https://github.com/assignso/assign-cli/releases" },
          { text: "Documentation source", link: "https://github.com/assignso/docs" },
        ],
      },
    ],
    sidebar: {
      "/get-started/": getStarted,
      "/guides/": getStarted,
      "/cli/": cli,
      "/mcp/": mcp,
      "/api/": api,
    },
    outline: { level: [2, 3], label: "On this page" },
    search: { provider: "local" },
    editLink: {
      pattern: "https://github.com/assignso/docs/edit/main/:path",
      text: "Suggest a change to this page",
    },
    lastUpdated: { text: "Updated", formatOptions: { dateStyle: "medium" } },
    socialLinks: [{ icon: "github", link: "https://github.com/assignso" }],
    footer: {
      message:
        '<a href="https://assign.so">Assign</a> · <a href="https://blog.assign.so">Blog</a> · <a href="/guides/privacy-and-cookies">Privacy and cookies</a>',
      copyright: `© ${new Date().getFullYear()} Assign`,
    },
    docFooter: { prev: "Previous", next: "Next" },
    externalLinkIcon: true,
  },
})
