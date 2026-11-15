// Scalar removes $ref during parsing. Keep names out of the serialized IR and schema.
const schemaNames = new WeakMap()

export function rememberSchemaName({ schema, ref }) {
  const match = /^#\/components\/schemas\/([^/]+)$/.exec(ref)
  if (match && !schemaNames.has(schema)) schemaNames.set(schema, match[1])
}

export function responseSelection(operation, response, media) {
  if (operation.id === "gettask" && response.status === "200" && media.mediaType === "application/json")
    return 'The default `view=detail` returns `Task`. Use `view=canonical` to return `CanonicalTask`.'
}

// An allOf branch can constrain a shared object with a constant selector.
function intersectionMembers(schema, depth) {
  if (!schema || depth < 0) return []
  return [schema, ...(schema.allOf ?? []).flatMap(member => intersectionMembers(member, depth - 1))]
}

export function responseVariantLines(schema, depth, indentDepth, schemaLines, typeLabel, maxDepth) {
  const indent = "  ".repeat(indentDepth)
  const members = schema.oneOf ?? schema.anyOf
  if (Array.isArray(members) && members.length) {
    const lines = [`${indent}- ${schema.oneOf ? "Exactly one of" : "At least one of"}`]
    if (depth === maxDepth) return [`${lines[0]} (nested fields omitted)`]
    for (const [index, member] of members.entries()) {
      const parts = intersectionMembers(member, maxDepth - depth)
      const fields = parts.flatMap(part => Object.entries(part.properties ?? {}))
      const selector = fields.find(([field, property]) =>
        property && Object.hasOwn(property, "const") &&
        (schema.discriminator ? field === schema.discriminator.propertyName : typeof property.const === "string"))
      const condition = selector ? `\`${selector[0]}\` is \`${JSON.stringify(selector[1].const)}\`` : undefined
      const name = schemaNames.get(member) ?? member?.title
      const label = name ? `\`${name}\`` : condition ?? `Variant ${index + 1} (\`${typeLabel(member)}\`)`
      const description = member?.description?.replace(/\s+/g, " ").trim()
      lines.push(`${indent}  - ${label}${description ? `: ${description}` : ""}`)
      if (name && condition) lines.push(`${indent}    - ${condition}`)
      if (member?.allOf) {
        const required = [...new Set(parts.flatMap(part => part.required ?? []))]
        if (required.length)
          lines.push(`${indent}    - Required fields are ${required.map(field => `\`${field}\``).join(", ")}`)
      }
      lines.push(...schemaLines(member, depth + 1, true, indentDepth + 2))
    }
    // Sibling properties constrain every branch of a composed schema.
    if (schema.properties)
      lines.unshift(...schemaLines({ ...schema, oneOf: undefined, anyOf: undefined }, depth, true, indentDepth))
    return lines
  }
  if (schema.type === "array" && (schema.items?.oneOf || schema.items?.anyOf || schema.items?.type === "array")) {
    const items = schemaLines(schema.items, depth + 1, true, indentDepth + 1)
    return items.length ? [`${indent}- Array items`, ...items] : []
  }
  return []
}
