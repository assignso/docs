import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import test from "node:test"
import { exportDigest } from "./public-export.mjs"
import { checkMetadataReference, checkMetadataSource, metadataFiles, validateMetadataReference } from "./protocol-metadata.mjs"

const [original, originalPin] = metadataFiles.map(file => JSON.parse(readFileSync(new URL(`../public/${file}`, import.meta.url))))
const copy = () => [structuredClone(original), structuredClone(originalPin)]
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex")
const rejected = mutate => {
  const [document, pin] = copy()
  mutate(document, pin)
  assert.throws(() => validateMetadataReference(document, pin))
}

test("the approved anonymous source reference remains separate and complete", () => {
  assert.deepEqual(validateMetadataReference(original, originalPin), {
    operationId: "getApiMetadata", availability: "unreleased-authoring",
    sha256: "2e66436301d1c0a07c8ee00b521a908b2a68c9abdf474701f253e501fee95cf4", components: 38,
  })
  assert.deepEqual(original.paths["/api/v1/meta"].get.security, [])
  assert.equal(Object.keys(original.paths).length, 1)
})

test("drift, private pin fields, credentials and additional routes are rejected", () => {
  rejected(document => { document.info.description += " changed" })
  rejected((document, pin) => { pin.private_source = "private checkout" })
  rejected((document, pin) => { pin.availability = "released" })
  rejected((document, pin) => {
    document.paths["/api/v1/meta"].get.security = [{ bearerToken: [] }]
    pin.sha256 = exportDigest(document)
  })
  rejected((document, pin) => {
    document.paths["/api/v1/private-example"] = { get: structuredClone(document.paths["/api/v1/meta"].get) }
    pin.sha256 = exportDigest(document)
  })
  rejected((document, pin) => {
    document.paths["/api/v1/meta"].get.parameters = [{ name: "workspace", in: "query" }]
    pin.sha256 = exportDigest(document)
  })
})

test("license, local references, reachability and public metadata are preserved", () => {
  rejected((document, pin) => { delete document.info.license; pin.sha256 = exportDigest(document) })
  rejected((document, pin) => {
    document.paths["/api/v1/meta"].get.responses[403].$ref = "https://example.invalid/private.json"
    pin.sha256 = exportDigest(document)
  })
  rejected((document, pin) => {
    document.components.schemas.UnusedPrivateModel = { type: "object" }
    pin.sha256 = exportDigest(document)
  })
  rejected((document, pin) => { document.info["x-assign-owner"] = "private owner"; pin.sha256 = exportDigest(document) })
  rejected((document, pin) => { document.info.description = "Source: architecture/private.md"; pin.sha256 = exportDigest(document) })
  rejected((document, pin) => {
    document.paths["/api/v1/meta"].get.responses[200].headers["Cache-Control"].schema.const = "public"
    pin.sha256 = exportDigest(document)
  })
})

test("private source approval checks exact files without private inputs in public checks", () => {
  const temporary = mkdtempSync(join(tmpdir(), "assign-metadata-reference-"))
  const directory = join(temporary, "public")
  const put = (file, bytes) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, bytes) }
  try {
    // Prepared approval fixture only; no released or actual source approval is manufactured.
    const [document, pin] = copy(), sourcePins = {}
    const files = ["src/openapi.yaml", "src/paths/metadata.yaml", "src/components/comments.yaml", "src/components/contract.yaml",
      "src/components/errors.yaml", "src/components/problems.yaml", "src/components/shared.yaml"]
    for (const file of files) {
      const bytes = `prepared source fixture: ${file}\n`
      put(join(temporary, "openapi-spec", file), bytes)
      sourcePins[`openapi-spec/${file}`] = sha256(bytes)
    }
    pin.source_sha256 = sourcePins["openapi-spec/src/paths/metadata.yaml"]
    const pinBytes = JSON.stringify(pin) + "\n"
    put(join(directory, metadataFiles[0]), JSON.stringify(document))
    put(join(directory, metadataFiles[1]), pinBytes)
    const approval = { schema: "assign.r006.anonymous-metadata-root-review.v1", status: "approved-source-reference-only",
      sha256: pin.sha256, publicPinSha256: sha256(pinBytes), sourcePins }
    const approvalPath = join(temporary, "private-approval.json")
    put(approvalPath, JSON.stringify(approval))
    const sourceRepository = join(temporary, "openapi-spec")
    const git = args => execFileSync("git", ["-C", sourceRepository, "-c", "core.hooksPath=/dev/null", ...args], { stdio: ["ignore", "pipe", "pipe"] })
    git(["init", "--quiet"])
    git(["add", "--", "src"])
    git(["-c", "commit.gpgsign=false", "-c", "user.name=Prepared metadata test", "-c", "user.email=metadata@example.invalid", "commit", "--quiet", "-m", "Prepare metadata source fixture"])
    assert.equal(checkMetadataReference(directory).components, 38)
    assert.equal(checkMetadataSource(directory, temporary, approvalPath).components, 38)
    put(join(temporary, "openapi-spec/src/paths/metadata.yaml"), "source drift\n")
    assert.throws(() => checkMetadataSource(directory, temporary, approvalPath), /source drift/i)
    sourcePins["openapi-spec/src/paths/metadata.yaml"] = sha256("source drift\n")
    pin.source_sha256 = sourcePins["openapi-spec/src/paths/metadata.yaml"]
    const updatedPinBytes = JSON.stringify(pin) + "\n"
    put(join(directory, metadataFiles[1]), updatedPinBytes)
    approval.publicPinSha256 = sha256(updatedPinBytes)
    put(approvalPath, JSON.stringify(approval))
    assert.throws(() => checkMetadataSource(directory, temporary, approvalPath), /not committed/)
    // Public CI remains independent of unavailable private source files.
    rmSync(join(temporary, "openapi-spec"), { recursive: true })
    assert.equal(checkMetadataReference(directory).components, 38)
    const view = join(directory, metadataFiles[0])
    rmSync(view)
    const outside = join(temporary, "elsewhere.json")
    put(outside, JSON.stringify(document))
    symlinkSync(outside, view)
    assert.throws(() => checkMetadataReference(directory), /ordinary file/)
  } finally { rmSync(temporary, { recursive: true, force: true }) }
})
