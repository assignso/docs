import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { parse } from "yaml"
import { errorCatalog, errorPage, errorTable } from "./error-catalog.mjs"

const document = () => parse(readFileSync(new URL("../public/openapi.yaml", import.meta.url), "utf8"))
const problem = (code, status = 400) => ({ allOf: [
  { $ref: "#/components/schemas/ProblemDetails" },
  { properties: { code: { const: code }, status: { const: status },
    type: { const: `https://docs.assign.so/errors/${code}` }, retryable: { const: false } } },
] })

test("all public fixed-code errors have one type route, trigger and recovery", () => {
  const entries = errorCatalog(document())
  assert.equal(entries.length, 23)
  assert.equal(new Set(entries.map(entry => entry.type)).size, entries.length)
  for (const entry of entries) {
    assert.ok(entry.trigger.length > 20)
    assert.ok(entry.recovery.length > 20)
    assert.ok(errorTable(entries).includes(`](/errors/${entry.code})`))
    const page = errorPage(entry)
    assert.ok(page.includes(entry.type))
    assert.ok(page.includes(`HTTP status: \`${entry.status}\``))
    assert.ok(page.includes(`retryable: ${entry.retryable}`))
    assert.match(page, /Awaiting deployment/)
    assert.match(page, /## Trigger[\s\S]+## Recovery/)
  }
})

test("a new code cannot be published without recovery copy", () => {
  assert.throws(() => errorCatalog({ components: { schemas: { New: problem("new_error") } } }), /Missing or invalid public error guidance/)
})

test("invalid public type URLs and incomplete metadata fail generation", () => {
  for (const [field, value] of [["type", "https://private.example/error"], ["status", 200], ["retryable", "yes"]]) {
    const schema = problem("malformed_request")
    schema.allOf[1].properties[field].const = value
    assert.throws(() => errorCatalog({ components: { schemas: { Invalid: schema } } }), /Missing or invalid/)
  }
})

test("conflicting schemas cannot overwrite an existing error route", () => {
  assert.throws(() => errorCatalog({ components: { schemas: {
    One: problem("malformed_request"), Two: problem("malformed_request", 422),
  } } }), /Conflicting public error schema/)
})

test("ordinary code fields and protocol-native errors do not become product errors", () => {
  assert.deepEqual(errorCatalog({ components: { schemas: {
    Task: { properties: { code: { const: "TASK-1" } } },
    OAuth: { properties: { error: { const: "invalid_grant" } } },
  } } }), [])
})

test("recovery distinguishes committed retries, new edits and unknown write outcomes", () => {
  const entries = new Map(errorCatalog(document()).map(entry => [entry.code, entry]))
  assert.match(entries.get("precondition_failed").recovery, /new edit.*new key.*uncertain committed request.*original key/s)
  assert.match(entries.get("idempotency_key_conflict").recovery, /do not replace the key/)
  assert.match(entries.get("gateway_timeout").recovery, /does not prove rollback.*original key/)
  assert.match(entries.get("operation_in_progress").recovery, /finite deadline.*same key/)
  assert.match(entries.get("payment_required").recovery, /Do not retry automatically/)
})
