import assert from "node:assert/strict"
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { checkBranding, checkBuiltBranding } from "./branding.mjs"
const root = new URL("../", import.meta.url).pathname

test("reviewed public branding projection is complete and unchanged", () => {
  assert.equal(checkBranding(root), 14)
})
test("public branding rejects extra private artifacts and edited mirrors", () => {
  const fixture = mkdtempSync(join(tmpdir(), "assign-public-brand-"))
  try {
    mkdirSync(join(fixture, "public"))
    cpSync(join(root, "branding"), join(fixture, "branding"), { recursive: true })
    cpSync(join(root, "public/branding"), join(fixture, "public/branding"), { recursive: true })
    assert.equal(checkBuiltBranding(root, join(fixture, "public")), 10)
    const asset = join(fixture, "public/branding/assign-mark-oil.svg")
    writeFileSync(asset, "Changed built asset")
    assert.throws(() => checkBuiltBranding(root, join(fixture, "public")), /Built branding differs/)
    cpSync(join(root, "public/branding/assign-mark-oil.svg"), asset)
    const extra = join(fixture, "public/branding/approval-history.json")
    writeFileSync(extra, "{}")
    assert.throws(() => checkBranding(fixture), /Unexpected branding artifact/)
    rmSync(extra)
    writeFileSync(join(fixture, "branding/index.md"), "Changed mirror")
    assert.throws(() => checkBranding(fixture), /Branding digest differs/)
  } finally { rmSync(fixture, { recursive: true, force: true }) }
})
