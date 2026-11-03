import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { execFileSync, spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import test from "node:test"
import { approvedAuthoringSource, loadDocsContract } from "./authoring-contract.mjs"
import { loadApiPresentation } from "./api-presentation.mjs"
import { validatePublicRelease } from "./validate-public-release.mjs"

const fixture = () => JSON.parse(readFileSync(new URL("./fixtures/publication.json", import.meta.url), "utf8"))

function authoringFixture(run) {
  const root = mkdtempSync(join(tmpdir(), "assign-docs-authoring-"))
  try {
    const { document } = fixture()
    const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])])) : value
    const bytes = JSON.stringify(sorted(document), null, 2) + "\n"
    const approval = { schema: "assign.api-safe-projection.v1", projection: "public-product-sdk",
      independent_expectation: "expected.json", document_sha256: createHash("sha256").update(bytes).digest("hex") }
    const approvalPath = join(root, "approval.json")
    mkdirSync(join(root, "public"))
    writeFileSync(join(root, "public/openapi.yaml"), JSON.stringify(document))
    writeFileSync(join(root, "expected.json"), bytes)
    writeFileSync(approvalPath, JSON.stringify(approval))
    const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim()
    git(["init", "--quiet"])
    git(["remote", "add", "origin", "https://example.invalid/private-upstream"])
    git(["add", "public/openapi.yaml"])
    git(["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "-c", "user.name=Prepared fixture", "-c", "user.email=fixture@example.invalid", "commit", "--quiet", "-m", "Prepare public export fixture"])
    const revision = git(["rev-parse", "HEAD"])
    run({ root, document, approval, approvalPath, revision })
  } finally { rmSync(root, { recursive: true, force: true }) }
}

test("approved authoring routes share the exact contract and all remain upcoming", () => {
  authoringFixture(({ root, document, approvalPath }) => {
    assert.deepEqual(loadDocsContract(join(root, "public/openapi.yaml"), approvalPath), { document, authoring: true })
    const { operations } = loadApiPresentation(root, approvalPath)
    assert.equal(operations.length, 1)
    assert.equal(operations[0].path, "/api/v1/examples")
    assert.ok(operations.every(operation => operation.upcoming))
    assert.throws(() => loadApiPresentation(root, ""), /release manifest required/)
    assert.throws(() => validatePublicRelease(join(root, "public/openapi.yaml")), /release manifest required/)
  })
})

test("changed shared prose, independent expectation and non-product approvals fail closed", () => {
  authoringFixture(({ document, approval, approvalPath, root }) => {
    const changed = structuredClone(document)
    changed.components.schemas.Example.description = "Unreviewed prose"
    assert.throws(() => approvedAuthoringSource(changed, approvalPath), /differs from independent approval/)
    writeFileSync(join(root, "expected.json"), JSON.stringify(changed))
    assert.throws(() => approvedAuthoringSource(document, approvalPath), /differs from independent approval/)
    approval.projection = "first-party"
    writeFileSync(approvalPath, JSON.stringify(approval))
    assert.throws(() => approvedAuthoringSource(document, approvalPath), /public product authoring approval required/)
  })
})

test("authoring environment works for actual generation but cannot promote its output to a release", () => {
  authoringFixture(({ root, document, approvalPath, revision }) => {
    const generator = fileURLToPath(new URL("./generate-api-endpoints.mjs", import.meta.url))
    const source = join(root, "public/openapi.yaml")
    const output = join(root, "export"), receipt = join(root, "private/source.json")
    const env = { PATH: process.env.PATH, ASSIGN_DOCS_AUTHORING_APPROVAL: approvalPath,
      ASSIGN_DOCS_SOURCE_REVISION: revision, ASSIGN_DOCS_PRIVATE_PROVENANCE: receipt }
    for (const extra of [[], ["--check"]]) {
      const result = spawnSync(process.execPath, [generator, source, "--output-root", output, ...extra], { encoding: "utf8", env })
      assert.equal(result.status, 0, result.stderr)
    }
    assert.equal(loadApiPresentation(root, approvalPath).operations.length, 1)
    const validator = fileURLToPath(new URL("./validate-public-release.mjs", import.meta.url))
    const rejected = spawnSync(process.execPath, [validator, source], { encoding: "utf8", env })
    assert.equal(rejected.status, 1)
    assert.match(rejected.stderr, /release manifest required/)
    assert.deepEqual(loadDocsContract(source, approvalPath).document, document)
    const pin = JSON.parse(readFileSync(join(output, "public/openapi-provenance.json"), "utf8"))
    assert.equal(pin.source, undefined)
    assert.ok(!JSON.stringify(pin).includes(revision))
    assert.equal(JSON.parse(readFileSync(receipt, "utf8")).source.revision, revision)
    const unsafe = spawnSync(process.execPath, [generator, source, "--output-root", output], {
      encoding: "utf8", env: { ...env, ASSIGN_DOCS_PRIVATE_PROVENANCE: join(output, "leak.json") } })
    assert.equal(unsafe.status, 1)
    assert.match(unsafe.stderr, /Private provenance must stay outside/)
    const originalReceipt = readFileSync(receipt, "utf8")
    writeFileSync(receipt, "different private binding")
    const immutable = spawnSync(process.execPath, [generator, source, "--output-root", output], { encoding: "utf8", env })
    assert.equal(immutable.status, 1)
    assert.match(immutable.stderr, /Immutable private source-to-export receipt differs/)
    assert.equal(readFileSync(receipt, "utf8"), "different private binding")
    writeFileSync(receipt, originalReceipt)
    writeFileSync(source, JSON.stringify({ ...document, info: { ...document.info, title: "Uncommitted change" } }))
    const drifted = spawnSync(process.execPath, [generator, source, "--output-root", output], { encoding: "utf8", env })
    assert.equal(drifted.status, 1)
    assert.match(drifted.stderr, /differs from the pinned committed revision/)
  })
})

test("released contracts keep the normal loader and availability behavior", () => {
  authoringFixture(({ root, document }) => {
    const { manifest } = fixture()
    writeFileSync(join(root, "public/openapi.yaml"), JSON.stringify({ ...document, "x-assign-release-manifest": manifest }))
    assert.equal(loadDocsContract(join(root, "public/openapi.yaml"), "").authoring, false)
    assert.equal(loadApiPresentation(root, "").operations[0].upcoming, false)
  })
})
