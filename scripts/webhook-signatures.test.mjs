import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import test from "node:test"
import { verifyAssignWebhook } from "../examples/webhooks/verify.mjs"

const id = "0198ac5e-f9b7-7000-8000-000000000001", now = 1767225600
const secret = `whsec_${Buffer.alloc(32, 1).toString("base64")}`
const previous = `whsec_${Buffer.alloc(32, 2).toString("base64")}`
const body = JSON.stringify({ delivery_id: id, event_id: "prepared-event", event_type: "task.updated", event_version: 1 })
function signed(rawBody = body, timestamp = now, key = secret, deliveryId = id) {
  const signature = createHmac("sha256", Buffer.from(key.slice(6), "base64"))
    .update(`${deliveryId}.${timestamp}.${rawBody}`).digest("base64")
  return { "webhook-id": deliveryId, "webhook-timestamp": String(timestamp), "webhook-signature": `v1,${signature}` }
}
const original = signed()
const cases = [
  { name: "original", body, headers: original, secrets: [secret], valid: true },
  { name: "rotation accepts previous key", body, headers: signed(body, now, previous), secrets: [secret, previous], valid: true },
  { name: "rotation accepts multiple signatures", body, headers: { ...original, "webhook-signature": `${signed(body, now, previous)["webhook-signature"]} ${original["webhook-signature"]}` }, secrets: [secret], valid: true },
  { name: "body bytes changed", body: body + "\n", headers: original, secrets: [secret], valid: false },
  { name: "timestamp too old", body, headers: signed(body, now - 301), secrets: [secret], valid: false },
  { name: "timestamp in future", body, headers: signed(body, now + 301), secrets: [secret], valid: false },
  { name: "wrong signing key", body, headers: original, secrets: [previous], valid: false },
  { name: "missing signature", body, headers: { ...original, "webhook-signature": "" }, secrets: [secret], valid: false },
  { name: "malformed signature", body, headers: { ...original, "webhook-signature": "v1,invalid" }, secrets: [secret], valid: false },
  { name: "signed delivery identity mismatch", body, headers: signed(body, now, secret, "0198ac5e-f9b7-7000-8000-000000000002"), secrets: [secret], valid: false },
  { name: "oversized body", body: "x".repeat(8193), headers: original, secrets: [secret], valid: false },
]

test("Node webhook recipe verifies raw bytes, rotation, freshness and delivery identity", () => {
  for (const item of cases) {
    const verify = () => verifyAssignWebhook(Buffer.from(item.body), new Headers(item.headers), item.secrets, now)
    if (item.valid) assert.equal(verify().delivery_id, id, item.name)
    else assert.throws(verify, undefined, item.name)
  }
})

test("PHP webhook recipe accepts and rejects the same prepared signature cases", () => {
  const source = fileURLToPath(new URL("../examples/webhooks/verify.php", import.meta.url))
  const code = `require $argv[1]; $cases=json_decode(stream_get_contents(STDIN),true,32,JSON_THROW_ON_ERROR);
    $results=[]; foreach($cases as $case) { try { verifyAssignWebhook($case['body'],$case['headers'],$case['secrets'],${now}); $results[]=true; }
    catch(Throwable $error) { $results[]=false; } } echo json_encode($results,JSON_THROW_ON_ERROR);`
  const result = spawnSync("php", ["-r", code, source], { input: JSON.stringify(cases), encoding: "utf8", env: { PATH: process.env.PATH } })
  assert.equal(result.status, 0, result.error?.message ?? result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(({ valid }) => valid))
})
