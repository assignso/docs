// Public CI needs only committed safe exports, never a sibling private checkout.
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { exportDigest, validateAuthoringExport } from "./public-export.mjs"
import { methods, publicContract } from "./public-contract.mjs"

export function checkPublicExport(directory) {
  const document = parse(readFileSync(resolve(directory, "openapi.yaml"), "utf8"))
  if (document["x-assign-release-manifest"]) {
    const released = publicContract(document)
    if (existsSync(resolve(directory, "openapi-provenance.json"))) throw new Error("Remove stale authoring pin before released publication")
    const graph = structuredClone(released)
    delete graph["x-assign-release-manifest"]
    return { state: "released", release: released["x-assign-release-manifest"].release,
      contract_version: released.info.version, document_sha256: exportDigest(graph),
      operations: Object.values(released.paths).flatMap((item) => Object.keys(item).filter((method) => methods.includes(method))).length }
  }
  const pin = JSON.parse(readFileSync(resolve(directory, "openapi-provenance.json"), "utf8"))
  validateAuthoringExport(document, pin)
  return { state: pin.state, operations: pin.operations.length, document_sha256: pin.document_sha256, contract_version: pin.contract_version }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(checkPublicExport(process.argv[2] ?? fileURLToPath(new URL("../public", import.meta.url))))) }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}
