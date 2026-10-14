export const methods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"]

export const isInternal = (operation, security) =>
  /^Internal\b/.test(operation.description ?? "") ||
  security.some((entry) => Object.hasOwn(entry, "integrationPrivateConnector"))

export function publicContract(source) {
  const spec = structuredClone(source)
  spec.servers = (spec.servers ?? []).filter((server) => !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(server.url))
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of methods) {
      const operation = item[method]
      if (operation && isInternal(operation, operation.security ?? spec.security ?? [])) delete item[method]
    }
    if (!methods.some((method) => item[method])) delete spec.paths[path]
  }
  // Components reachable only from private operations must not leak into the download.
  const used = new Set()
  const visit = (value) => {
    if (!value || typeof value !== "object") return
    if (typeof value.$ref === "string" && value.$ref.startsWith("#/components/")) {
      const [, , group, encoded] = value.$ref.split("/")
      const name = encoded.replaceAll("~1", "/").replaceAll("~0", "~")
      const key = `${group}/${name}`
      if (!used.has(key)) { used.add(key); visit(spec.components?.[group]?.[name]) }
    }
    if (Array.isArray(value.security)) for (const entry of value.security) {
      for (const name of Object.keys(entry)) {
        const key = `securitySchemes/${name}`
        if (!used.has(key)) { used.add(key); visit(spec.components?.securitySchemes?.[name]) }
      }
    }
    for (const child of Object.values(value)) visit(child)
  }
  const { components, ...surface } = spec
  visit(surface)
  for (const [group, entries] of Object.entries(spec.components ?? {})) {
    for (const name of Object.keys(entries)) if (!used.has(`${group}/${name}`)) delete entries[name]
    if (!Object.keys(entries).length) delete spec.components[group]
  }
  const tags = new Set(Object.values(spec.paths).flatMap((item) => methods.flatMap((method) => item[method]?.tags ?? [])))
  spec.tags = (spec.tags ?? []).filter((tag) => tags.has(tag.name)).map((tag) => ({
    ...tag,
    ...(tag["x-assign-status"] === "upcoming" && !/\bupcoming\b/i.test(tag.description ?? "") ? { description: `Upcoming: this contract is not yet deployed. ${tag.description ?? ""}`.trim() } : {}),
  }))
  return spec
}
