// Public recovery copy; wire facts come only from the filtered OpenAPI schemas.
const guidance = {
  malformed_request: ["The request has malformed JSON, query syntax, headers or ambiguous input.", "Correct the syntax and remove duplicate scalar fields. Preserve the original intent if a write outcome is uncertain."],
  unauthenticated: ["The operation has no valid admitted credential.", "Inspect WWW-Authenticate and use the documented credential acquisition or renewal flow. Do not repeatedly send an expired or revoked credential."],
  payment_required: ["An entitlement or paid allowance does not admit the operation.", "Check the stated account or plan requirement. Do not retry automatically when account action is required."],
  forbidden: ["The authenticated caller lacks a required permission or policy condition.", "Check the operation's scope, role and resource access. Request access through the supported workflow; a new retry key does not grant permission."],
  not_found: ["The resource is absent or its existence is protected from this caller.", "Check the identifier and current Workspace access. Do not infer that a resource exists from this response or use it as proof that an uncertain write failed."],
  method_not_allowed: ["The route does not support the requested method.", "Check Allow and the operation reference. Use the declared method without probing alternative write methods."],
  not_acceptable: ["The selected response representation or content encoding is unacceptable.", "Use the operation's supported selectors and Accept or Accept-Encoding values. Accept does not override an explicit format selector."],
  conflict: ["Current domain state conflicts with the requested action.", "Read the operation's reason and current authorized state. Resolve that conflict before preparing another intent; do not retry the same refusal blindly."],
  idempotency_key_conflict: ["A retry key conflicts with retained request intent or cannot safely recover its original result.", "Establish the original outcome before deciding on another change. Keep the original request and key for recovery; do not replace the key merely to bypass the conflict."],
  operation_in_progress: ["The original keyed operation is still pending.", "Honor Retry-After within a finite deadline and recover or retry the same request with the same key. Do not start a second intent to escape the wait."],
  gone: ["The requested resource or capability has expired or is no longer available.", "Use the operation's documented renewal or replacement flow where one exists. Retrying an expired capability does not restore it."],
  precondition_failed: ["The supplied HTTP condition does not hold for the selected resource representation.", "Read the declared current item representation and reconcile the change. A new edit uses its exact opaque validator and a new key; an uncertain committed request retains its original key and condition."],
  content_too_large: ["The request exceeds an operation's encoded body or content limit.", "Reduce the request within all declared limits. Use a separate upload or job only where documented; do not split an atomic edit into blind retries."],
  unsupported_media_type: ["The request body media type or content coding is unsupported.", "Send the declared Content-Type and an accepted request coding. Changing Accept does not change the request body's media type."],
  validation_failed: ["The input is syntactically valid but violates the operation's field or limit rules.", "Correct the fields identified in errors or the safe detail. Distinguish omitted fields from explicit null; do not silently clamp an invalid limit."],
  locked: ["A lifecycle lock prevents the requested action.", "Inspect the operation's reason and supported lifecycle actions. Resolve the lock through that workflow before another attempt."],
  precondition_required: ["The mutation omits a required HTTP condition.", "Read the item using the operation's declared validator recipe, then copy its exact tag into the required condition header. Never construct a tag from revision."],
  rate_limited: ["The request exceeds its admitted rate or cost budget.", "Honor Retry-After with bounded backoff and jitter. Stop when the next retry exceeds your deadline; preserve a keyed write's original request."],
  internal_error: ["The service could not complete the request because of an unexpected error.", "Keep the request ID for support. Establish an uncertain write's outcome using its documented recovery before another mutation; do not assume rollback."],
  not_implemented: ["The requested capability is not implemented by the responding service.", "Check the operation's availability and supported request. Do not repeatedly retry an unavailable capability."],
  bad_gateway: ["An upstream service returned an unusable response.", "Retry only within a finite budget where the operation permits it. Recover an uncertain write with its original key and request before another intent."],
  service_unavailable: ["The service cannot currently admit or complete the request, including a documented maintenance or overload condition.", "Honor Retry-After within a finite deadline. Check reason for the specific refusal and preserve original write intent; retry guidance does not guarantee admission."],
  gateway_timeout: ["The request exceeded an upstream time budget.", "A timeout does not prove rollback. Recover an uncertain write using its original key and request; retry safe reads only within your remaining deadline."],
}

export function errorCatalog(document) {
  const entries = new Map()
  for (const schema of Object.values(document.components?.schemas ?? {})) {
    if (!schema.allOf?.some((part) => part.$ref === "#/components/schemas/ProblemDetails")) continue
    const properties = schema.allOf.find((part) => part.properties?.code)?.properties
    const code = properties?.code?.const
    // Domain refinements without a fixed code retain the operation's own guidance.
    if (code === undefined) continue
    const status = properties.status?.const, type = properties.type?.const
    const retryable = properties.retryable?.const
    if (!Object.hasOwn(guidance, code) || !Number.isInteger(status) || status < 400 || status > 599 ||
        type !== `https://docs.assign.so/errors/${code}` || typeof retryable !== "boolean") {
      throw new Error(`Missing or invalid public error guidance: ${code}`)
    }
    const entry = { code, status, type, retryable, trigger: guidance[code][0], recovery: guidance[code][1] }
    if (entries.has(code) && JSON.stringify(entries.get(code)) !== JSON.stringify(entry))
      throw new Error(`Conflicting public error schema: ${code}`)
    entries.set(code, entry)
  }
  return [...entries.values()].sort((a, b) => a.status - b.status || a.code.localeCompare(b.code))
}

export function errorTable(entries) {
  return "| Error | Trigger | Recovery |\n| --- | --- | --- |\n" + entries.map((entry) =>
    `| [\`${entry.status} ${entry.code}\`](/errors/${entry.code}) | ${entry.trigger} | ${entry.recovery} |`
  ).join("\n")
}

export function errorPage(entry) {
  return `---\ntitle: ${JSON.stringify(entry.code)}\ndescription: ${JSON.stringify(entry.trigger)}\n---\n\n# ${entry.code}\n\n**Awaiting deployment:** This page describes the rewritten v1 contract.\n\nHTTP status: \`${entry.status}\`. Problem type: \`${entry.type}\`.\n\n## Trigger\n\n${entry.trigger}\n\n## Recovery\n\n${entry.recovery}\n\nThe contract declares \`retryable: ${entry.retryable}\`. This flag does not authorize a new mutation after an unknown outcome. Follow the operation's recovery and retry limits.\n\nSee [Errors and recovery](/api/errors) for Problem Details fields and correlation headers, and [Writes and retries](/api/writes) for conditional edits and interrupted requests. OAuth, MCP and other retained protocols use their own errors.\n`
}
