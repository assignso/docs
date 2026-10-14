import { test } from "node:test"
import assert from "node:assert/strict"
import { publicContract } from "./public-contract.mjs"

test("publishes public operations, preserves refs/status, and removes private-only data without changing the source", () => {
  const source = {
    servers: [{ url: "https://api.assign.so" }, { url: "http://localhost:8080" }],
    security: [{ bearer: [] }],
    tags: [{ name: "Work", "x-assign-status": "upcoming" }, { name: "Private" }],
    paths: {
      "/work": {
        parameters: [{ $ref: "#/components/parameters/ID" }],
        get: { tags: ["Work"], responses: { 200: { $ref: "#/components/responses/Result" } } },
        post: { description: "Internal callback", tags: ["Private"] },
      },
      "/private": { get: { security: [{ integrationPrivateConnector: [] }] } },
      "/public": { get: { security: [], responses: {} } },
    },
    components: {
      parameters: { ID: { schema: { type: "string" } } },
      responses: { Result: { content: { "application/json": { schema: { $ref: "#/components/schemas/Work" } } } } },
      schemas: { Work: { properties: { child: { $ref: "#/components/schemas/Work" } } }, Private: { type: "string" } },
      securitySchemes: { bearer: { type: "http", scheme: "bearer" }, integrationPrivateConnector: { type: "apiKey" } },
    },
  }
  const before = structuredClone(source)
  const published = publicContract(source)
  assert.deepEqual(source, before)
  assert.equal(published.servers.length, 1)
  assert.equal(published.paths["/private"], undefined)
  assert.equal(published.paths["/work"].post, undefined)
  assert.deepEqual(published.paths["/public"].get.security, [])
  assert.ok(published.components.parameters.ID)
  assert.ok(published.components.schemas.Work)
  assert.equal(published.components.schemas.Private, undefined)
  assert.equal(published.components.securitySchemes.integrationPrivateConnector, undefined)
  assert.ok(published.components.securitySchemes.bearer)
  assert.equal(published.tags.length, 1)
  assert.match(published.tags[0].description, /^Upcoming:/)
})
