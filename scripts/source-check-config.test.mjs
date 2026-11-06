import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { sourceCheckEnvironment } from "./source-check-config.mjs"

function fixture(run) {
  const workspace = mkdtempSync(join(tmpdir(), "assign-docs-sources-"))
  const path = join(workspace, "architecture/api/documentation-sources.json")
  mkdirSync(join(workspace, "architecture/api"), { recursive: true })
  const write = configuration => writeFileSync(path, JSON.stringify(configuration))
  try { run({ workspace, path, write }) }
  finally { rmSync(workspace, { recursive: true, force: true }) }
}

test("local source checks resolve private workspace inputs without changing caller environment", () => fixture(({ workspace, write }) => {
  write({ schema: "assign.docs-source-check-inputs.v1", source_revision: "a".repeat(40), paths: {
    metadata_approval: "private/metadata.json", example_workflow: "private/workflow.json",
    example_provenance: "private/examples.json", example_compatibility: "private/compatibility.json",
    authoring_approval: "private/approval.json", authoring_provenance: "private/export.json",
  } })
  const environment = { PATH: "/prepared/bin", ASSIGN_DOCS_AUTHORING_APPROVAL: "/explicit/approval.json" }
  const result = sourceCheckEnvironment(workspace, environment)
  assert.equal(result.PATH, environment.PATH)
  assert.equal(result.ASSIGN_DOCS_AUTHORING_APPROVAL, "/explicit/approval.json")
  assert.equal(result.ASSIGN_DOCS_SOURCE_REVISION, "a".repeat(40))
  assert.equal(result.ASSIGN_DOCS_METADATA_PRIVATE_PROVENANCE, join(workspace, "private/metadata.json"))
  assert.equal(result.ASSIGN_DOCS_EXAMPLE_WORKFLOW_PROOF, join(workspace, "private/workflow.json"))
  assert.equal(result.ASSIGN_DOCS_EXAMPLE_PRIVATE_PROVENANCE, join(workspace, "private/examples.json"))
  assert.equal(result.ASSIGN_DOCS_EXAMPLE_MAIN_COMPATIBILITY, join(workspace, "private/compatibility.json"))
  assert.equal(result.ASSIGN_DOCS_PRIVATE_PROVENANCE, join(workspace, "private/export.json"))
  assert.deepEqual(environment, { PATH: "/prepared/bin", ASSIGN_DOCS_AUTHORING_APPROVAL: "/explicit/approval.json" })
}))

test("missing configuration preserves explicit inputs; an explicit missing file fails", () => fixture(({ workspace }) => {
  const environment = { ASSIGN_DOCS_METADATA_PRIVATE_PROVENANCE: "/explicit/metadata.json" }
  assert.deepEqual(sourceCheckEnvironment(workspace, environment), environment)
  assert.throws(() => sourceCheckEnvironment(workspace, { ASSIGN_DOCS_SOURCE_CONFIG: join(workspace, "missing.json") }), /ENOENT/)
}))

test("unknown configuration, arbitrary environment inputs and invalid revisions fail closed", () => fixture(({ workspace, write }) => {
  for (const configuration of [
    { schema: "unapproved", paths: {} },
    { schema: "assign.docs-source-check-inputs.v1", paths: { NODE_OPTIONS: "unsafe" } },
    { schema: "assign.docs-source-check-inputs.v1", paths: { metadata_approval: "" } },
    { schema: "assign.docs-source-check-inputs.v1", paths: {}, source_revision: "main" },
  ]) {
    write(configuration)
    assert.throws(() => sourceCheckEnvironment(workspace, {}), /Invalid private Docs/)
  }
}))
