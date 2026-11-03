import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { authoringExportPin, validateAuthoringExport } from "./public-export.mjs"
import { checkPublicExport } from "./check-public-export.mjs"
import { loadDocsContract } from "./authoring-contract.mjs"
import { validatePublicRelease } from "./validate-public-release.mjs"

const fixture = () => JSON.parse(readFileSync(new URL("./fixtures/publication.json", import.meta.url), "utf8")).document

test("public-only authoring pin binds exact content and operation availability without release authority", () => {
  const root = mkdtempSync(join(tmpdir(), "assign-docs-export-"))
  try {
    const document = fixture(), pin = authoringExportPin(document)
    const path = join(root, "openapi.yaml")
    writeFileSync(path, JSON.stringify(document))
    writeFileSync(join(root, "openapi-provenance.json"), JSON.stringify(pin))
    assert.equal(checkPublicExport(root).state, "approved-authoring")
    assert.equal(loadDocsContract(path, "").authoring, true)
    assert.ok(pin.operations.every(({ availability }) => availability === "upcoming"))
    assert.equal(pin.source, undefined)
    assert.equal(pin.contract_version, document.info.version)
    assert.throws(() => validatePublicRelease(path), /release manifest required/)
    document.info.description = "Unreviewed shared prose"
    writeFileSync(path, JSON.stringify(document))
    assert.throws(() => checkPublicExport(root), /differs from its approved pin/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test("pin rejects inventory drift, private metadata, credential alternatives and fabricated release state", () => {
  const document = fixture(), original = authoringExportPin(document)
  for (const change of [
    (pin) => { pin.operations[0].path = "/api/v1/changed" },
    (pin) => { pin.operations[0].availability = "available" },
    (pin) => { pin.source = { repository: "private", revision: "a".repeat(40) } },
    (pin) => { pin.contract_version = "unreviewed" },
    (pin) => { pin.private_receipt = "forbidden" },
    (pin) => { pin.state = "released" },
  ]) {
    const pin = structuredClone(original); change(pin)
    assert.throws(() => validateAuthoringExport(document, pin))
  }
  const privateDocument = structuredClone(document)
  privateDocument.paths["/api/v1/examples"].get.security = [{ browserSession: [] }]
  assert.throws(() => authoringExportPin(privateDocument), /bearer credentials/)
  assert.throws(() => authoringExportPin({ ...document, "x-assign-release-manifest": {} }), /release evidence/)
})
