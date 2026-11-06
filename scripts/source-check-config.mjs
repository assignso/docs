import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"

const pathVariables = {
  metadata_approval: "ASSIGN_DOCS_METADATA_PRIVATE_PROVENANCE",
  example_workflow: "ASSIGN_DOCS_EXAMPLE_WORKFLOW_PROOF",
  example_provenance: "ASSIGN_DOCS_EXAMPLE_PRIVATE_PROVENANCE",
  example_compatibility: "ASSIGN_DOCS_EXAMPLE_MAIN_COMPATIBILITY",
  authoring_approval: "ASSIGN_DOCS_AUTHORING_APPROVAL",
  authoring_provenance: "ASSIGN_DOCS_PRIVATE_PROVENANCE",
}

// Private source inputs configure this local check only, never builds or release validation.
export function sourceCheckEnvironment(workspace, environment = process.env) {
  const configured = environment.ASSIGN_DOCS_SOURCE_CONFIG
  const path = configured ? resolve(configured) : join(workspace, "architecture/api/documentation-sources.json")
  if (!configured && !existsSync(path)) return { ...environment }
  const configuration = JSON.parse(readFileSync(path, "utf8"))
  if (configuration.schema !== "assign.docs-source-check-inputs.v1" ||
      !configuration.paths || typeof configuration.paths !== "object" || Array.isArray(configuration.paths) ||
      Object.keys(configuration).some(key => !["schema", "paths", "source_revision"].includes(key)))
    throw new Error("Invalid private Docs source-check configuration")
  const result = { ...environment }
  for (const [key, value] of Object.entries(configuration.paths)) {
    if (!Object.hasOwn(pathVariables, key) || typeof value !== "string" || !value.trim())
      throw new Error(`Invalid private Docs source-check path: ${key}`)
    const variable = pathVariables[key]
    if (!Object.hasOwn(result, variable)) result[variable] = resolve(workspace, value)
  }
  if (configuration.source_revision !== undefined) {
    if (!/^[a-f0-9]{40}$/.test(configuration.source_revision))
      throw new Error("Invalid private Docs OpenAPI source revision")
    result.ASSIGN_DOCS_SOURCE_REVISION ??= configuration.source_revision
  }
  return result
}
