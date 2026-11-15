// Local drift check for pages that mirror a private source of truth.
// It needs the sibling Assign workspace checkouts, so it runs locally, not in public CI.
//   npm run check:sources
// Fails when:
//   - an MCP tool registered in assign-core is missing from mcp/tools.md (or vice versa)
//   - an assign-cli command is missing from cli/commands.md
//   - api/endpoints.md or public/openapi.yaml is stale relative to openapi-spec/openapi.yaml
import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { resolve, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { publicPageSources, privateWireReferences } from "./publication-audit.mjs"
import { checkMetadataSource } from "./protocol-metadata.mjs"
import { sourceCheckEnvironment } from "./source-check-config.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const workspace = process.env.ASSIGN_WORKSPACE ?? resolve(root, "..")
const sourceEnvironment = sourceCheckEnvironment(workspace)
const problems = []

try {
  const pin = JSON.parse(readFileSync(join(workspace, "architecture/frontend/branding-docs-source.json"), "utf8"))
  if (!/^[a-f0-9]{40}$/.test(pin.revision)) throw new Error("Exact branding revision required")
  execFileSync("python3", [join(workspace, "branding/scripts/export-docs.py"), "--docs", root, "--check", "--revision", pin.revision], { stdio: "pipe" })
  console.log("Checked public branding against its exact canonical source")
} catch (error) {
  problems.push(`Branding source check failed: ${error.message.split("\n")[0]}`)
}

try {
  const approval = sourceEnvironment.ASSIGN_DOCS_METADATA_PRIVATE_PROVENANCE
  if (!approval) throw new Error("Private anonymous metadata approval path is required")
  const report = checkMetadataSource(join(root, "public"), workspace, resolve(approval))
  console.log(`Checked anonymous metadata source reference: ${report.components} reachable components`)
} catch (error) {
  problems.push(`Anonymous metadata source check failed: ${error.message.split("\n")[0]}`)
}

try {
  const proof = sourceEnvironment.ASSIGN_DOCS_EXAMPLE_WORKFLOW_PROOF
  const receipt = sourceEnvironment.ASSIGN_DOCS_EXAMPLE_PRIVATE_PROVENANCE
  if (!proof || !receipt) throw new Error("Private example workflow proof and source receipt paths are required")
  const compatibility = sourceEnvironment.ASSIGN_DOCS_EXAMPLE_MAIN_COMPATIBILITY
  execFileSync("python3", [join(root, "scripts/export-example-sources.py"), "check-source", "--workspace", workspace,
    "--workflow-proof", proof, "--private-receipt", receipt, ...(compatibility ? ["--main-compatibility", compatibility] : [])], { stdio: "pipe" })
} catch (error) {
  problems.push(`Example source export check failed: ${error.message.split("\n")[0]}`)
}

const publicationRegistry = join(workspace, "assign-core/contracts/api/metadata/canonical-registry.json")
try {
  const pages = publicPageSources(root).map((file) => ({ file, content: readFileSync(join(root, file), "utf8") }))
  const { privateReferences, unresolved } = privateWireReferences(pages, JSON.parse(readFileSync(publicationRegistry, "utf8")))
  for (const reference of privateReferences)
    problems.push(`${reference.file}:${reference.line} documents a private request (${reference.operationIds.join(", ")}); use supported UI guidance`)
  console.log(`Checked ${pages.length} authored pages against canonical publication decisions; ${privateReferences.length} private request references`)
  if (unresolved.length) console.warn(`${unresolved.length} request references need separate canonical path review; this check does not qualify their publication`)
} catch (error) {
  problems.push(`Required private publication source check failed: ${error.message}`)
}

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
  // Read the actual typed registrations, including conditional capabilities.
  // The exporter is offline: it does not open a database or invoke any tool.
  const exported = JSON.parse(execFileSync("go", ["run", "./cmd/agent-tool-catalog"], {
    cwd: join(workspace, "assign-core"), encoding: "utf8", maxBuffer: 4 * 1024 * 1024,
  }))
  const registered = new Set(exported.tools.map((tool) => tool.name))
  // Discuss/hosted adapters are conditionally registered outside this exporter.
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
  try {
    execFileSync(process.execPath, [join(root, "scripts/generate-api-endpoints.mjs"), openapi, "--check"], { stdio: "pipe", env: sourceEnvironment })
  } catch (error) {
    const detail = error.stderr?.toString().split("\n").find(line => /^Error: /.test(line))
    problems.push(`OpenAPI source check failed: ${detail ?? error.message.split("\n")[0]}`)
  }
} else {
  console.warn(`skip API: ${openapi} not found`)
}

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"))
  process.exit(1)
}
console.log("✓ MCP catalog, CLI reference and endpoint index match their sources")
