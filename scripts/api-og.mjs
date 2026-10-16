// Metadata and raster generation share this public-operation manifest.
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"

export const imageWidth = 1200
export const imageHeight = 630
export const imageDirectory = "og/api"
export const docsOrigin = "https://docs.assign.so"
export const fontPaths = {
  sans: new URL("../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2", import.meta.url),
  mono: new URL("../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2", import.meta.url),
}
const digest = (...values) => values.reduce((hash, value) => hash.update(value), createHash("sha256")).digest("hex").slice(0, 16)
const rendererKey = digest(readFileSync(new URL("./render-api-og.mjs", import.meta.url)),
  readFileSync(new URL(import.meta.url)), ...Object.values(fontPaths).map((path) => readFileSync(path)))

export function plainText(value, limit = 400) {
  return String(value ?? "").replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/<[^>]*>/g, " ")
    .replace(/[`*_#]/g, "").replace(/\s+/g, " ").trim().slice(0, limit)
}

export function imageCard(operation) {
  if (!operation) return { id: "reference", method: "", path: "docs.assign.so",
    title: "Build with Assign.", description: "Guides and API, CLI and MCP references for Assign.",
    label: "Developer documentation" }
  const version = operation.path.match(/^\/(?:api|share)\/(v\d+)(?:\/|$)/)?.[1]
  const title = plainText(operation.title, 240)
  const description = plainText(operation.description)
  return { id: operation.id, method: operation.method, path: operation.path.slice(0, 800),
    title, description: description === title ? "" : description,
    label: [version ? `API ${version}` : "API reference", operation.upcoming ? "Upcoming" : null,
      operation.deprecated ? "Deprecated" : null].filter(Boolean).join(" · ") }
}

export function imageEntry(operation) {
  const card = imageCard(operation)
  return { src: `/${imageDirectory}/${card.id}-${digest(rendererKey, JSON.stringify(card))}.png`,
    alt: operation ? `${card.method} ${operation.path} — ${card.title}. ${card.label}` : "Assign developer documentation",
    width: imageWidth, height: imageHeight, type: "image/png" }
}

export function imageManifest(operations) {
  return Object.fromEntries([["*", imageEntry()], ...operations.map((operation) => [operation.link, imageEntry(operation)])])
}

export function imageMetadata(operation, baseUrl = docsOrigin) {
  const image = imageEntry(operation)
  const url = new URL(image.src, baseUrl).href
  return { canonical: new URL(operation.link, baseUrl).href, meta: {
    ogImage: url, ogImageAlt: image.alt, ogImageWidth: image.width, ogImageHeight: image.height,
    ogImageType: image.type, twitterCard: "summary_large_image", twitterImage: url, twitterImageAlt: image.alt,
  } }
}

// Vocs serializes this function's source. Keep it free of module/closure references.
export function operationImageHead(_path, { frontmatter }) {
  return frontmatter?.assignOpenGraph ?? { meta: {
    ogImageAlt: "Assign developer documentation", ogImageWidth: 1200, ogImageHeight: 630,
    ogImageType: "image/png", twitterCard: "summary_large_image", twitterImageAlt: "Assign developer documentation",
  } }
}
