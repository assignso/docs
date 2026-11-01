import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { parse } from "yaml"
import { publicContract } from "./public-contract.mjs"

// Authoring approval proves exact reviewed content, never released availability.
export function approvedAuthoringSource(document, path) {
  const approval = JSON.parse(readFileSync(path, "utf8"))
  if (approval.schema !== "assign.api-safe-projection.v1" || approval.projection !== "public-product-sdk")
    throw new Error("Explicit public product authoring approval required")
  const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])])) : value
  const canonical = (value) => JSON.stringify(sorted(value), null, 2) + "\n"
  const bytes = canonical(document)
  const expected = parse(readFileSync(resolve(dirname(path), approval.independent_expectation), "utf8"))
  if (createHash("sha256").update(bytes).digest("hex") !== approval.document_sha256 || bytes !== canonical(expected))
    throw new Error("Public authoring source differs from independent approval")
  return document
}

export function loadDocsContract(path, approvalPath = process.env.ASSIGN_DOCS_AUTHORING_APPROVAL) {
  const document = parse(readFileSync(path, "utf8"))
  return approvalPath
    ? { document: approvedAuthoringSource(document, approvalPath), authoring: true }
    : { document: publicContract(document), authoring: false }
}
