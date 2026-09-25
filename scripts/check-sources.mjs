// Local drift check for pages that mirror a private source of truth.
// It needs the sibling Assign workspace checkouts, so it runs locally, not in public CI.
//   npm run check:sources
// Fails when:
//   - an MCP tool registered in assign-core is missing from mcp/tools.md (or vice versa)
//   - an assign-cli command is missing from cli/commands.md
//   - api/endpoints.md is stale relative to openapi-spec/openapi.yaml
import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { resolve, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const workspace = process.env.ASSIGN_WORKSPACE ?? resolve(root, "..")
const problems = []

function goSources(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".go") && !name.endsWith("_test.go"))
    .map((name) => readFileSync(join(dir, name), "utf8"))
    .join("\n")
}

// Tools that the server registers but that are not part of the public catalog:
// MCP resources, the server identity, test fixtures and the hosted-Agent-only action.
const internalTools = new Set([
  "assign", "brief", "fixture", "task_fixture", "task_comment_fixture",
  "discuss_run_event", "discuss_run_trace", "knowledge_evidence",
  "agent_participation_execute_action", "discuss_execute_action",
])

const mcpDir = join(workspace, "assign-core/internal/mcp")
if (existsSync(mcpDir)) {
  const source = goSources(mcpDir)
  const registered = new Set()
  for (const match of source.matchAll(/Name:\s*"([a-z][a-z_]+)"/g)) registered.add(match[1])
  for (const match of source.matchAll(/add(?:Capability|DiscussRule)Tool\(tools, server, "([a-z_]+)"/g)) registered.add(match[1])
  const documented = new Set([...readFileSync(join(root, "mcp/tools.md"), "utf8").matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]))
  const writes = new Set((source.match(/func writeTool[\s\S]*?case ([^:]+):/)?.[1] ?? "").match(/[a-z_]+/g) ?? [])
  const catalog = readFileSync(join(root, "mcp/tools.md"), "utf8")
  for (const tool of registered) {
    if (internalTools.has(tool) || !/_/.test(tool) && tool !== "search" && tool !== "summarize") continue
    if (!documented.has(tool)) problems.push(`mcp/tools.md is missing registered tool \`${tool}\``)
  }
  for (const tool of documented) {
    if (!registered.has(tool)) problems.push(`mcp/tools.md documents \`${tool}\`, which assign-core no longer registers`)
    const access = catalog.match(new RegExp("^\\| `" + tool + "` \\| (Read|Write) \\|", "m"))?.[1]
    if (access && (access === "Write") !== writes.has(tool)) problems.push(`mcp/tools.md marks \`${tool}\` as ${access}, but assign-core classifies it differently`)
  }
} else {
  console.warn(`skip MCP: ${mcpDir} not found`)
}

const cliDir = join(workspace, "assign-cli/internal/cli")
if (existsSync(cliDir)) {
  const source = goSources(cliDir)
  const reference = readFileSync(join(root, "cli/commands.md"), "utf8")
  // `mcp serve` is hidden: clients start it, people don't.
  const skip = new Set(["assign", "setup", "serve"])
  for (const [, command] of source.matchAll(/Use:\s*"([a-z]+)/g)) {
    if (skip.has(command)) continue
    if (!new RegExp(`\\b${command}\\b`).test(reference)) problems.push(`cli/commands.md does not mention the \`${command}\` command`)
  }
} else {
  console.warn(`skip CLI: ${cliDir} not found`)
}

const openapi = join(workspace, "openapi-spec/openapi.yaml")
if (existsSync(openapi)) {
  const before = readFileSync(join(root, "api/endpoints.md"), "utf8")
  execFileSync(process.execPath, [join(root, "scripts/generate-api-endpoints.mjs"), openapi], { stdio: "ignore" })
  const after = readFileSync(join(root, "api/endpoints.md"), "utf8")
  if (before !== after) problems.push("api/endpoints.md was stale and has been regenerated; review and commit it")
} else {
  console.warn(`skip API: ${openapi} not found`)
}

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"))
  process.exit(1)
}
console.log("✓ MCP catalog, CLI reference and endpoint index match their sources")
