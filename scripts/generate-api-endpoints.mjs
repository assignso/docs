// Regenerates api/endpoints.md and public/openapi.yaml from the accepted public OpenAPI contract.
// Usage: npm run generate:api [-- path/to/openapi.yaml]
// Defaults to the sibling openapi-spec checkout used in the Assign workspace.
// Pin the canonical source with --source-revision COMMIT --private-provenance PATH.
// Select --authoring-approval PATH or a release manifest.
// The emitted public pin supports static authoring, never release publication.
import { readFileSync, writeFileSync, mkdirSync, realpathSync, existsSync, lstatSync, unlinkSync } from "node:fs"
import { resolve, dirname, relative, basename, isAbsolute, sep } from "node:path"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { parse, stringify } from "yaml"
import { publicContract } from "./public-contract.mjs"
import { approvedAuthoringSource } from "./authoring-contract.mjs"
import { endpointIndex } from "./endpoint-index.mjs"
import { authoringExportPin, exportDigest } from "./public-export.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2).filter((arg) => arg !== "--check")
const outputIndex = args.indexOf("--output-root")
const outputRoot = outputIndex === -1 ? root : resolve(args.splice(outputIndex, 2)[1])
// Local source preparation uses an independently approved authoring graph.
// It never supplies release evidence to publicContract or package validation.
const approvalIndex = args.indexOf("--authoring-approval")
const approvalPath = approvalIndex === -1 ? process.env.ASSIGN_DOCS_AUTHORING_APPROVAL : resolve(args.splice(approvalIndex, 2)[1])
const revisionIndex = args.indexOf("--source-revision")
const sourceRevision = revisionIndex === -1 ? process.env.ASSIGN_DOCS_SOURCE_REVISION : args.splice(revisionIndex, 2)[1]
const privateIndex = args.indexOf("--private-provenance")
const privatePath = privateIndex === -1 ? process.env.ASSIGN_DOCS_PRIVATE_PROVENANCE : args.splice(privateIndex, 2)[1]
const source = resolve(args[0] ?? process.env.ASSIGN_OPENAPI ?? resolve(root, "../openapi-spec/openapi.yaml"))
const input = parse(readFileSync(source, "utf8"))
if (!/^[a-f0-9]{40}$/.test(sourceRevision ?? "")) throw new Error("Pinned canonical OpenAPI source revision required")
const repository = execFileSync("git", ["-C", dirname(source), "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim()
const committed = parse(execFileSync("git", ["-C", repository, "show", `${sourceRevision}:${relative(repository, realpathSync(source))}`], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }))
if (JSON.stringify(committed) !== JSON.stringify(input)) throw new Error("Canonical source differs from the pinned committed revision")
const manifest = process.env.ASSIGN_PUBLIC_RELEASE_MANIFEST
  ? JSON.parse(readFileSync(process.env.ASSIGN_PUBLIC_RELEASE_MANIFEST, "utf8")) : undefined
if (approvalPath && manifest) throw new Error("Choose one authoring approval or release manifest")
const spec = approvalPath ? approvedAuthoringSource(input, approvalPath) : publicContract(input, manifest)

const { markdown, total } = endpointIndex(spec, Boolean(approvalPath))
const outputs = {
  "api/endpoints.md": markdown,
  "public/openapi.yaml": stringify(approvalPath ? spec : publicContract(spec), { lineWidth: 0 }),
}
if (approvalPath) {
  outputs["public/openapi-provenance.json"] = JSON.stringify(authoringExportPin(spec), null, 2) + "\n"
}

if (!privatePath) throw new Error("Private source-to-export receipt path required")
const within = (base, path) => { const part = relative(base, path); return part === "" || (!isAbsolute(part) && part !== ".." && !part.startsWith(`..${sep}`)) }
const destination = resolve(privatePath)
if (within(root, destination) || within(outputRoot, destination)) throw new Error("Private provenance must stay outside Docs and safe output")
if (!process.argv.includes("--check")) {
  mkdirSync(dirname(destination), { recursive: true })
  mkdirSync(outputRoot, { recursive: true })
}
const canonical = resolve(realpathSync(dirname(destination)), basename(destination))
if (within(realpathSync(root), canonical) || within(realpathSync(outputRoot), canonical) ||
    (existsSync(destination) && lstatSync(destination).isSymbolicLink()))
  throw new Error("Private provenance must stay outside Docs and safe output")
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex")
const release = spec["x-assign-release-manifest"]
const { ["x-assign-release-manifest"]: _, ...graph } = spec
const qualification = approvalPath
  ? { approval_sha256: hash(readFileSync(approvalPath)) }
  : { release: release.release, release_manifest_sha256: exportDigest(release) }
const receipt = JSON.stringify({ schema: "assign.docs-private-source-export.v1",
  source: { revision: sourceRevision, document_sha256: exportDigest(input) },
  ...qualification,
  export: { state: approvalPath ? "approved-authoring" : "released", document_sha256: exportDigest(graph),
    files: Object.fromEntries(Object.entries(outputs).map(([file, bytes]) => [file, hash(bytes)])) } }, null, 2) + "\n"
if (process.argv.includes("--check") || existsSync(destination)) {
  if (readFileSync(destination, "utf8") !== receipt) throw new Error("Immutable private source-to-export receipt differs; use a new receipt path")
} else writeFileSync(destination, receipt, { flag: "wx", mode: 0o600 })

if (release) {
  const oldPin = resolve(outputRoot, "public/openapi-provenance.json")
  if (existsSync(oldPin)) {
    if (process.argv.includes("--check")) throw new Error("Stale authoring pin must be removed for released output")
    if (lstatSync(oldPin).isSymbolicLink()) throw new Error("Authoring pin symlink rejected")
    const pin = JSON.parse(readFileSync(oldPin, "utf8"))
    if (pin.schema !== "assign.docs-public-export.v1" || pin.state !== "approved-authoring") throw new Error("Unexpected provenance file")
    unlinkSync(oldPin)
  }
}
for (const [file, output] of Object.entries(outputs)) {
  if (process.argv.includes("--check")) {
    if (readFileSync(resolve(outputRoot, file), "utf8") !== output) throw new Error(`${file} is stale; run npm run generate:api`)
  } else {
    mkdirSync(dirname(resolve(outputRoot, file)), { recursive: true })
    writeFileSync(resolve(outputRoot, file), output)
  }
}
console.log(`${process.argv.includes("--check") ? "Checked" : "Generated"} ${total} public operations`)
