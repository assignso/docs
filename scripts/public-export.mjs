import assert from "node:assert/strict"
import { createHash } from "node:crypto"

const methods = new Set(["get", "put", "post", "patch", "delete", "head", "options", "trace"])
const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === "object"
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])])) : value
export const exportDigest = (document) => createHash("sha256").update(JSON.stringify(sorted(document), null, 2) + "\n").digest("hex")

function operationInventory(document) {
  const operations = Object.entries(document.paths ?? {}).flatMap(([path, item]) => Object.entries(item)
    .filter(([method]) => methods.has(method)).map(([method, operation]) => {
      assert.match(path, /^\/api\/v1\//, "Product export requires canonical API paths")
      assert.match(operation.operationId ?? "", /^[A-Za-z][A-Za-z0-9]*$/, "Stable operation identity required")
      const security = operation.security ?? document.security
      assert.ok(Array.isArray(security) && security.length === 1 && Object.keys(security[0]).length === 1,
        "Product export requires one bearer credential without alternatives")
      const [name] = Object.keys(security[0]), scheme = document.components?.securitySchemes?.[name]
      assert.ok(scheme?.type === "http" && scheme.scheme === "bearer" && Array.isArray(security[0][name]) && security[0][name].length === 0,
        "Product export requires bearer credentials")
      return { operationId: operation.operationId, method: method.toUpperCase(), path, availability: "upcoming" }
    })).sort((a, b) => a.operationId.localeCompare(b.operationId))
  assert.ok(operations.length && new Set(operations.map(({ operationId }) => operationId)).size === operations.length,
    "Nonempty unique public operation inventory required")
  return operations
}

// Created only after the local private-source/independent-approval check succeeds.
// Public CI checks these exact approved bytes; this is never a release receipt.
export function authoringExportPin(document) {
  assert.equal(document["x-assign-release-manifest"], undefined, "Authoring pin cannot carry release evidence")
  return { schema: "assign.docs-public-export.v1", state: "approved-authoring",
    contract_version: document.info.version,
    document_sha256: exportDigest(document), operations: operationInventory(document) }
}

export function validateAuthoringExport(document, pin) {
  assert.deepEqual(Object.keys(pin ?? {}).sort(), ["contract_version", "document_sha256", "operations", "schema", "state"], "Unknown public export receipt fields")
  assert.equal(pin.schema, "assign.docs-public-export.v1", "Public export receipt required")
  assert.equal(pin.state, "approved-authoring", "Explicit authoring availability required")
  const expected = authoringExportPin(document)
  assert.deepEqual(pin, expected, "Public export differs from its approved pin")
  return document
}
