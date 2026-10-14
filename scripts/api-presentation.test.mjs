import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { apiPresentation } from "./api-presentation.mjs"
import { methods } from "./public-contract.mjs"

test("every public operation has one unique endpoint route and sidebar link", () => {
  const spec = parse(readFileSync(new URL("../public/openapi.yaml", import.meta.url), "utf8"))
  const before = JSON.stringify(spec)
  const { operations, sidebar } = apiPresentation(spec)
  const count = Object.values(spec.paths).flatMap((item) => methods.filter((method) => item[method])).length
  assert.equal(operations.length, count)
  assert.equal(new Set(operations.map(({ link }) => link)).size, count)
  const flatten = (items) => items.flatMap((item) => [item, ...flatten(item.items ?? [])])
  const links = flatten(sidebar).filter(({ link }) => link?.includes("/operations/"))
  assert.deepEqual(links.map(({ link }) => link).sort(), operations.map(({ link }) => link).sort())
  assert.equal(JSON.stringify(spec), before, "presentation must not mutate the published contract")
  assert.ok(operations.filter(({ tag }) => tag === "HomeWork").every(({ upcoming }) => upcoming))
  assert.equal(sidebar[0].text, "API reference")
  assert.ok(sidebar.find(({ text }) => text === "Work management").items.some(({ text }) => text === "Tasks"))
  assert.ok(sidebar.find(({ text }) => text === "Upcoming").items.every(({ badge }) => badge.text === "Upcoming"))
})

test("unclassified resources remain discoverable", () => {
  const { sidebar } = apiPresentation({ paths: { "/future": { get: { operationId: "future", tags: ["New resource"] } } } })
  assert.equal(sidebar.find(({ text }) => text === "More resources").items[0].items[0].link, "/api/reference/operations/future")
})

test("endpoint route collisions fail rather than overwrite generated content", () => {
  assert.throws(() => apiPresentation({ paths: {
    "/one": { get: { operationId: "same.id" } },
    "/two": { post: { operationId: "same-id" } },
  } }), /Duplicate endpoint route/)
})
