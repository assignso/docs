// Public navigation and URL continuity. API semantics stay in the approved contract.
import { applyResponseExamples } from "./operation-examples.mjs"

export const protocolNavigation = {
  text: "Public protocols",
  items: [
    { text: "Product OAuth", link: "/api/oauth" },
    { text: "MCP", link: "/mcp/" },
  ],
}

export const developerNavigation = [
  { text: "Start", items: [
    { text: "Overview", link: "/api/" },
    { text: "Make your first request", link: "/api/quickstart" },
    { text: "Choose a credential", link: "/api/authentication" },
    { text: "SDKs and examples", link: "/api/#openapi-and-sdks" },
  ] },
  { text: "Integration guides", items: [
    { text: "List and filter Tasks", link: "/api/tasks#list" },
    { text: "Edit a Task safely", link: "/api/writes#make-an-edit" },
    { text: "Work with Documents", link: "/api/documents" },
    { text: "Upload and download files", link: "/api/attachments" },
    { text: "Connect a provider", link: "/api/integrations" },
  ] },
  { text: "Concepts and conventions", items: [
    { text: "Shared rules", link: "/api/conventions" },
    { text: "Workspace scope and permissions", link: "/api/authentication#product-api-credentials" },
    { text: "Pagination and filtering", link: "/api/pagination" },
    { text: "Revisions, writes and retries", link: "/api/writes" },
    { text: "Limits", link: "/api/errors#rate-limits-and-availability" },
  ] },
  { text: "Resources", collapsed: true, items: [
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
    { text: "Integrations", link: "/api/integrations" },
    { text: "Workspace Knowledge", link: "/api/knowledge" },
    { text: "Discuss", link: "/api/discuss" },
    { text: "Agents", link: "/api/agents" },
    { text: "Proposals and receipts", link: "/api/work-capabilities" },
  ] },
  { text: "API reference", items: [
    { text: "Browse operations", link: "/api/reference" },
    { text: "Endpoint index", link: "/api/endpoints" },
    { text: "Download OpenAPI", link: "/openapi.yaml", external: true },
  ] },
  { text: "Troubleshooting", items: [
    { text: "Authentication failures", link: "/api/authentication#recover-from-an-access-error" },
    { text: "Conflicting edits", link: "/api/writes#recover-a-failed-condition" },
    { text: "Unknown write outcomes", link: "/api/writes#recover-an-unknown-outcome" },
    { text: "Errors and recovery", link: "/api/errors" },
  ] },
  { text: "Migrations", items: [
    { text: "Versioning and client releases", link: "/api/versioning" },
    { text: "Product authentication", link: "/api/versioning#authentication-migration" },
  ] },
  protocolNavigation,
  { text: "Using Assign", items: [
    { text: "Account settings", link: "/api/account" },
    { text: "Application realtime", link: "/api/realtime", badge: { text: "Upcoming", variant: "note" } },
  ] },
]

// Only these supported public links have moved. Excluded interfaces get no aliases.
export const compatibilityPages = [
  { id: "gettaskbycode", title: "Find a Task by code", selector: "code" },
  { id: "listprojecttasks", title: "List Tasks in a Project", selector: "project_id" },
]

export function compatibilityPage(page, operations) {
  const target = operations.find(({ id }) => id === "listworkspacetasks")
  if (!target) throw new Error("Task URL compatibility requires the approved Task collection")
  if (operations.some(({ id }) => id === page.id)) throw new Error(`Compatibility route conflicts with ${page.id}`)
  return `---
title: ${JSON.stringify(page.title)}
description: ${JSON.stringify(`Use List Workspace Tasks with the ${page.selector} filter.`)}
---

# ${page.title}

${target.upcoming ? '> **Upcoming:** This contract is not yet deployed.\n\n' : ''}Use [List Workspace Tasks](${target.link}) with the \`${page.selector}\` filter.
Keep the Workspace and credential fixed while following every non-null continuation.

${page.selector === 'code' ? 'The result is a bounded collection, including when no visible Task matches. Use [Read a Task](/api/reference/operations/gettask) for complete Task content when needed.\n\n' : ''}See [authentication](/api/authentication) for setup and
[pagination](/api/pagination) for continuation and recovery.
`
}

// Preserve the corresponding resource fragments in native HTML and Markdown.
export function applyOperationPresentation(operation) {
  const presented = applyResponseExamples(operation)
  if (operation.id !== "listworkspacetasks") return presented
  const anchors = compatibilityPages.map(({ id }) => `<a id="${id}"></a>`).join("\n")
  return { ...presented, description: `${anchors}\n\n${presented.description ?? ""}` }
}
