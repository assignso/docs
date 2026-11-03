import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { lstatSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { exportDigest } from "./public-export.mjs"

export const metadataFiles = ["protocols/api-metadata/openapi.json", "protocols/api-metadata/provenance.json"]
const sourceFiles = ["src/openapi.yaml", "src/paths/metadata.yaml", "src/components/comments.yaml",
  "src/components/contract.yaml", "src/components/errors.yaml", "src/components/problems.yaml", "src/components/shared.yaml"]
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex")
const read = path => {
  assert.ok(lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink(), "Protocol input must be an ordinary file")
  return readFileSync(path)
}

export function validateMetadataReference(document, pin) {
  assert.deepEqual(Object.keys(document).sort(), ["components", "info", "openapi", "paths", "servers"])
  assert.deepEqual(Object.keys(document.info).sort(), ["description", "license", "title", "version"])
  assert.deepEqual(Object.keys(document.components).sort(), ["headers", "responses", "schemas"])
  assert.deepEqual(Object.keys(pin).sort(), ["availability", "contract_version", "limits", "openapi", "operation", "protocol", "schema", "sha256", "source_sha256"])
  assert.equal(pin.schema, "assign.public-protocol-reference.v1")
  assert.equal(pin.protocol, "anonymous-api-metadata")
  assert.equal(pin.availability, "unreleased-authoring", "Metadata pin is source-only, never release evidence")
  assert.deepEqual(pin.operation, { credentials: "none", id: "getApiMetadata", method: "GET", path: "/api/v1/meta" })
  assert.equal(pin.limits, "Source authoring reference only; advisory metadata is never authorization or released compatibility evidence.")
  assert.match(pin.source_sha256, /^[a-f0-9]{64}$/)
  assert.equal(pin.openapi, "3.1.1")
  assert.equal(document.openapi, pin.openapi)
  assert.equal(document.info.version, pin.contract_version)
  assert.deepEqual(document.info.license, { identifier: "LicenseRef-Proprietary", name: "Proprietary" })
  assert.equal(exportDigest(document), pin.sha256, "Anonymous protocol view differs from approved public pin")
  assert.deepEqual(Object.keys(document.paths), ["/api/v1/meta"], "Only the finite anonymous metadata operation is admitted")
  const path = document.paths["/api/v1/meta"]
  assert.deepEqual(Object.keys(path), ["get"])
  const operation = path.get
  assert.equal(operation.operationId, "getApiMetadata")
  assert.deepEqual(operation.security, [], "Metadata must remain credential-free")
  assert.equal(document.security, undefined)
  assert.equal(operation.requestBody, undefined)
  assert.ok(!operation.parameters || operation.parameters.length === 0)
  assert.equal(operation.responses[200].headers["Cache-Control"].schema.const, "no-store")
  assert.deepEqual(operation.responses[200].content["application/json"].schema.required,
    ["api_major", "contract_epoch", "schema_epoch", "server_version", "capabilities", "supported_clients", "minimum_version_enforcement"])
  const reachable = new Set()
  function walk(value) {
    if (Array.isArray(value)) { value.forEach(walk); return }
    if (!value || typeof value !== "object") return
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!key.startsWith("x-assign-"), "Private contract metadata cannot enter this protocol view")
      if (key === "$ref") {
        assert.match(child, /^#\/components\/(headers|responses|schemas)\/[A-Za-z0-9_.-]+$/, "Protocol references must be local")
        if (!reachable.has(child)) {
          reachable.add(child)
          const [, , section, name] = child.split("/")
          assert.ok(document.components[section]?.[name], "Protocol reference must resolve")
          walk(document.components[section][name])
        }
      } else walk(child)
    }
  }
  walk(operation)
  const all = Object.entries(document.components).flatMap(([section, entries]) => Object.keys(entries).map(name => `#/components/${section}/${name}`))
  assert.deepEqual([...reachable].sort(), all.sort(), "Only reachable public protocol components may be included")
  const bytes = JSON.stringify({ document, pin })
  assert.doesNotMatch(bytes, /"x-assign-[^"]*":/, "Private contract annotations cannot enter protocol metadata")
  assert.doesNotMatch(bytes, /(?:architecture\/|assign-core\/|openapi-spec\/|\/Users\/|private\.source-pins|root-review\.json|github\.com\/assignso\/(?:openapi-spec|typescript-sdk|php-sdk))/i,
    "Private source locations cannot enter public protocol files")
  return { operationId: "getApiMetadata", availability: pin.availability, sha256: pin.sha256, components: reachable.size }
}

export function checkMetadataReference(directory) {
  const [document, pin] = metadataFiles.map(file => JSON.parse(read(join(directory, file))))
  return validateMetadataReference(document, pin)
}

export function checkMetadataSource(directory, workspace, approvalPath) {
  const report = checkMetadataReference(directory)
  const pinBytes = read(join(directory, metadataFiles[1]))
  const pin = JSON.parse(pinBytes), approval = JSON.parse(read(approvalPath))
  assert.equal(approval.schema, "assign.r006.anonymous-metadata-root-review.v1")
  assert.equal(approval.status, "approved-source-reference-only")
  assert.equal(approval.sha256, report.sha256)
  assert.equal(approval.publicPinSha256, sha256(pinBytes), "Protocol pin differs from independent approval")
  assert.deepEqual(Object.keys(approval.sourcePins).sort(), sourceFiles.map(file => `openapi-spec/${file}`).sort())
  const sourceRepository = join(workspace, "openapi-spec")
  const sourceRevision = execFileSync("git", ["-C", sourceRepository, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
  for (const [file, hash] of Object.entries(approval.sourcePins)) {
    assert.equal(sha256(read(join(workspace, file))), hash, `Protocol source drift: ${file}`)
    const committed = execFileSync("git", ["-C", sourceRepository, "show", `${sourceRevision}:${file.slice("openapi-spec/".length)}`], { stdio: ["ignore", "pipe", "pipe"] })
    assert.equal(sha256(committed), hash, `Protocol source is not committed at ${sourceRevision}: ${file}`)
  }
  assert.equal(pin.source_sha256, approval.sourcePins["openapi-spec/src/paths/metadata.yaml"])
  return { ...report, sourceRevision }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
  const value = flag => { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1] }
  const directory = resolve(value("--directory") ?? join(root, "public"))
  const approval = value("--private-approval")
  const report = approval ? checkMetadataSource(directory, resolve(value("--workspace") ?? join(root, "..")), resolve(approval))
    : checkMetadataReference(directory)
  console.log(JSON.stringify(report))
}
