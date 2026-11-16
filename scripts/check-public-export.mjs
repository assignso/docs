// Public CI needs only committed safe exports.
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { isDeepStrictEqual } from "node:util"
import { parse } from "yaml"
import { endpointIndex } from "./endpoint-index.mjs"
import { exportDigest, validateAuthoringExport } from "./public-export.mjs"
import { publicContract } from "./public-contract.mjs"

export function validateReleasedExport(document) {
  const projected = publicContract(document)
  assert.ok(isDeepStrictEqual(document, projected), "Released download differs from its approved public projection")
  return projected["x-assign-release-manifest"]
}

export function checkPublicExport(directory, { indexPath } = {}) {
  const document = parse(readFileSync(resolve(directory, "openapi.yaml"), "utf8"))
  const pinPath = resolve(directory, "openapi-provenance.json")
  const authoring = !document["x-assign-release-manifest"]
  let pin
  if (authoring) {
    pin = JSON.parse(readFileSync(pinPath, "utf8"))
    validateAuthoringExport(document, pin)
  } else {
    assert.ok(!existsSync(pinPath), "Remove stale authoring pin before released publication")
    const manifest = validateReleasedExport(document)
    const { ["x-assign-release-manifest"]: _, ...graph } = document
    pin = {
      state: manifest.state, release: manifest.release, operations: manifest.operations,
      contract_version: document.info.version, document_sha256: exportDigest(graph),
    }
  }
  if (indexPath) {
    assert.ok(readFileSync(indexPath, "utf8") === endpointIndex(document, authoring).markdown,
      "Generated endpoint index is stale")
  }
  return {
    state: pin.state, ...(pin.release ? { release: pin.release } : {}), operations: pin.operations.length,
    document_sha256: pin.document_sha256, contract_version: pin.contract_version,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = process.argv[2]
  const root = fileURLToPath(new URL("..", import.meta.url))
  try {
    console.log(JSON.stringify(directory
      ? checkPublicExport(directory)
      : checkPublicExport(resolve(root, "public"), { indexPath: resolve(root, "api/endpoints.md") })))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
