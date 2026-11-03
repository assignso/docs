import { createHmac, timingSafeEqual } from "node:crypto"

// Select secrets from the configured receiving route, not an unverified payload.
export function verifyAssignWebhook(rawBody, headers, secrets, now = Math.floor(Date.now() / 1000)) {
  if (!Buffer.isBuffer(rawBody) || rawBody.length > 8192) throw new Error("Invalid webhook body")
  const id = headers.get("webhook-id"), timestamp = headers.get("webhook-timestamp")
  const signatures = headers.get("webhook-signature")
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id ?? "") ||
      !/^[0-9]{1,12}$/.test(timestamp ?? "") || !signatures || signatures.length > 1024 ||
      !Number.isSafeInteger(now) || Math.abs(now - Number(timestamp)) > 300)
    throw new Error("Invalid webhook metadata or timestamp")
  if (!Array.isArray(secrets) || secrets.length < 1 || secrets.length > 2) throw new Error("Configure current signing secrets")
  const candidates = signatures.split(" ").filter((value) => /^v1,[A-Za-z0-9+/]{43}=$/.test(value))
    .map((value) => Buffer.from(value.slice(3), "base64"))
  let valid = false
  for (const secret of secrets) {
    if (typeof secret !== "string" || !/^whsec_[A-Za-z0-9+/]{43}=$/.test(secret)) throw new Error("Invalid signing secret")
    const key = Buffer.from(secret.slice(6), "base64")
    const expected = createHmac("sha256", key).update(`${id}.${timestamp}.`).update(rawBody).digest()
    for (const candidate of candidates) valid = timingSafeEqual(expected, candidate) || valid
  }
  if (!valid) throw new Error("Invalid webhook signature")
  const event = JSON.parse(rawBody.toString("utf8"))
  if (!event || event.delivery_id !== id) throw new Error("Webhook delivery identity mismatch")
  return event
}
