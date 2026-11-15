import assert from "node:assert/strict"
import { operationExampleSetup } from "./api-presentation.mjs"
import { renderGroup } from "../node_modules/vocs/dist/internal/openapi/markdown.js"
import { codeSamples, responseSamples } from "../node_modules/vocs/dist/internal/openapi/sample.js"

export function renderReferenceMarkdown(ir, group, operations) {
  const heading = renderGroup(ir, { ...group, operations: [] }).trimEnd()
  const sections = new Map()
  for (const model of group.operations) {
    const operation = operations.get(model.id)
    assert.ok(operation, `Unexpected native Markdown operation: ${model.id}`)
    assert.equal(model.method, operation.method, `Markdown method differs: ${model.id}`)
    assert.equal(model.path, operation.path, `Markdown path differs: ${model.id}`)
    const native = renderGroup(ir, { ...group, operations: [model] }).slice(heading.length + 2).trimEnd()
    sections.set(model.id, renderOperation(ir, model, operation, native))
  }
  const resource = [heading, ...[...sections.values()].map(({ resource }) => resource)].join("\n\n")
  return { resource, sections }
}

function renderOperation(ir, model, operation, native) {
  const requests = codeSamples(model, ir.servers[0]?.url).map((sample) => `\`\`\`${sample.lang}\n${sample.code.trim()}\n\`\`\``)
  const responses = responseSamples(model).filter((sample) => /^2/.test(sample.status) && sample.lang === "json").map((sample) =>
    `Illustrative HTTP \`${sample.status}\` response:\n\n\`\`\`json\n${sample.code}\n\`\`\``)
  for (const response of model.responses.filter((response) => /^2/.test(response.status))) {
    for (const media of response.content.filter((media) => media.mediaType !== "application/json")) {
      if (media.mediaType === "text/csv" && typeof media.example === "string")
        responses.push(`Illustrative HTTP \`${response.status}\` response (\`text/csv\`):\n\n\`\`\`csv\n${media.example}\`\`\``)
      else if (media.schema?.type === "string" && media.schema.format === "binary")
        responses.push(`HTTP \`${response.status}\` returns a binary \`${media.mediaType}\` body.`)
    }
  }
  for (const response of model.responses.filter((response) => /^2/.test(response.status) && response.content.length === 0))
    responses.push(`HTTP \`${response.status}\` with no response body.`)
  assert.ok(requests.length && responses.length, `Missing examples: ${operation.id}`)

  const header = `## ${model.summary ?? `${operation.method} ${operation.path}`}`
  const method = `\`${operation.method} ${operation.path}\``
  const intro = [header, method]
  if (model.deprecated) intro.push("> **Deprecated**")
  if (model.description) intro.push(model.description.trim())
  const preamble = intro.join("\n\n")
  const nativeSamples = `### Example request\n\n${requests.join("\n\n")}`
  assert.ok(native.startsWith(`${preamble}\n\n`), `Unexpected native introduction: ${operation.id}`)
  assert.ok(native.endsWith(`\n\n${nativeSamples}`), `Unexpected native examples: ${operation.id}`)
  const details = native.slice(preamble.length, -nativeSamples.length).trim()
  const availability = operation.upcoming ? ["> **Upcoming:** This contract is not yet deployed."] : []
  const setup = operationExampleSetup(operation, true).trim()
  const body = [...intro.slice(1), setup, nativeSamples, `### Example response\n\n${responses.join("\n\n")}`, details]
    .filter(Boolean)
  return {
    resource: [header, ...availability, `<a id="${operation.id}"></a>`, ...body].join("\n\n"),
    endpoint: [`# ${operation.title}`, ...availability, `<a id="${operation.id}"></a>`, ...body].join("\n\n"),
  }
}
