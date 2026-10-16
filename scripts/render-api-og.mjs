// All text becomes outlines from bundled fonts: no system fonts, browser or network.
import assert from "node:assert/strict"
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { openSync } from "fontkit"
import { Resvg } from "@resvg/resvg-js"
import { fontPaths, imageCard, imageDirectory, imageEntry, imageHeight, imageManifest, imageWidth } from "./api-og.mjs"

// fontkit's WOFF2 variation instances lose cmap tables; use the bundled default instance.
const sans = openSync(fontPaths.sans.pathname)
const heading = sans
const mono = openSync(fontPaths.mono.pathname)
const width = (text, font, size) => font.layout(text).positions.reduce((sum, position) => sum + position.xAdvance, 0) * size / font.unitsPerEm

export function layoutText(text, font, size, maxWidth, maxLines) {
  const characters = Array.from(text.replace(/\s+/g, " ").trim())
  const lines = []
  let offset = 0
  while (offset < characters.length && lines.length < maxLines) {
    let end = offset + 1
    while (end <= characters.length && width(characters.slice(offset, end).join(""), font, size) <= maxWidth) end++
    end = Math.max(offset + 1, end - 1)
    if (end < characters.length && lines.length < maxLines - 1) {
      const space = characters.slice(offset, end).lastIndexOf(" ")
      if (space > 0) end = offset + space
      else {
        const slash = characters.slice(offset, end).lastIndexOf("/")
        if (slash > 0) end = offset + slash + 1
      }
    }
    let line = characters.slice(offset, end).join("").trim()
    if (lines.length === maxLines - 1 && end < characters.length) {
      while (line && width(`${line}…`, font, size) > maxWidth) line = Array.from(line).slice(0, -1).join("")
      line = `${line.trimEnd()}…`
    }
    lines.push(line)
    offset = end
    while (characters[offset] === " ") offset++
  }
  return lines
}

function text(value, x, y, size, font = sans, color = "#f5f6fa") {
  const { glyphs, positions } = font.layout(value)
  const scale = size / font.unitsPerEm
  let cursor = 0
  return glyphs.map((glyph, index) => {
    const position = positions[index]
    const path = `<path d="${glyph.path.toSVG()}" fill="${color}" transform="translate(${x + (cursor + position.xOffset) * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})"/>`
    cursor += position.xAdvance
    return path
  }).join("")
}

function block(value, x, y, size, font, color, maxLines, lineHeight) {
  return layoutText(value, font, size, 1072, maxLines)
    .map((line, index) => text(line, x, y + index * lineHeight, size, font, color)).join("")
}

export function cardSvg(operation) {
  const card = imageCard(operation)
  const accent = ({ GET: "#81dfb5", POST: "#9bbcff", PUT: "#f3cf8e", PATCH: "#f3cf8e", DELETE: "#ffaaaa" })[card.method] ?? "#9bbcff"
  const badge = card.method || "DOCUMENTATION"
  const badgeWidth = width(badge, mono, 20) + 36
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0d1017"/>
    <path d="M74 49H67V56M89 49H96V56M67 72V79H74M89 79H96V72" fill="none" stroke="#f5f6fa" stroke-width="3" stroke-linecap="round"/>
    <circle cx="81.5" cy="64" r="5" fill="#f5f6fa"/>
    ${text("Assign", 114, 76, 32, heading)}${text("Docs", 222, 76, 32, sans, "#949daf")}
    ${text("API REFERENCE", 923, 72, 18, mono, "#949daf")}
    <path d="M64 106H1136" stroke="#2a3140"/>
    <rect x="64" y="140" width="${badgeWidth}" height="40" rx="8" fill="${accent}"/>
    ${text(badge, 82, 167, 20, mono, "#0d1017")}
    ${block(card.path, 64, 229, 34, mono, "#f5f6fa", 3, 42)}
    ${block(card.title, 64, 375, 43, heading, "#f5f6fa", 2, 51)}
    ${block(card.description, 64, 470, 23, sans, "#aeb7c8", 2, 31)}
    <path d="M64 537H1136" stroke="#2a3140"/>
    ${text(card.label, 64, 579, 20, sans, "#9bbcff")}
    ${text("docs.assign.so", 933, 579, 18, mono, "#949daf")}
  </svg>`
}

export function generateApiImages(publicDirectory, operations) {
  const directory = join(publicDirectory, imageDirectory)
  mkdirSync(directory, { recursive: true })
  const manifest = imageManifest(operations)
  const expected = new Set(["manifest.json"])
  let rendered = 0
  for (const operation of [undefined, ...operations]) {
    const entry = imageEntry(operation)
    const name = entry.src.split("/").at(-1)
    expected.add(name)
    const target = join(directory, name)
    if (!existsSync(target)) {
      const png = new Resvg(cardSvg(operation), { font: { loadSystemFonts: false } }).render().asPng()
      writeFileSync(target, png)
      rendered++
    }
  }
  for (const name of readdirSync(directory)) if (!expected.has(name)) rmSync(join(directory, name), { recursive: true })
  const json = `${JSON.stringify(manifest, null, 2)}\n`
  const target = join(directory, "manifest.json")
  if (!existsSync(target) || readFileSync(target, "utf8") !== json) writeFileSync(target, json)
  return { images: expected.size - 1, rendered }
}

export function verifyApiImages(output, operations, baseUrl) {
  const manifest = imageManifest(operations)
  assert.deepEqual(JSON.parse(readFileSync(join(output, imageDirectory, "manifest.json"), "utf8")), manifest)
  const expected = new Set(["manifest.json", ...Object.values(manifest).map(({ src }) => src.split("/").at(-1))])
  assert.deepEqual(new Set(readdirSync(join(output, imageDirectory))), expected, "stale share images in published output")
  for (const { src } of Object.values(manifest)) {
    const png = readFileSync(join(output, src))
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a")
    assert.equal(png.readUInt32BE(16), imageWidth)
    assert.equal(png.readUInt32BE(20), imageHeight)
  }
  for (const operation of [{ id: "docs-fallback", link: "/api" }, ...operations]) {
    const html = readFileSync(join(output, operation.link, "index.html"), "utf8")
    const tags = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => {
      const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
      return [attributes.property ?? attributes.name, attributes.content]
    })
    const meta = Object.fromEntries(tags)
    const url = new URL((manifest[operation.link] ?? manifest["*"]).src, baseUrl).href
    assert.equal(meta["og:image"], url, `wrong image for ${operation.id}`)
    assert.equal(meta["twitter:image"], url)
    assert.equal(meta["twitter:card"], "summary_large_image")
    assert.equal(meta["og:image:width"], String(imageWidth))
    assert.equal(meta["og:image:height"], String(imageHeight))
    assert.equal(meta["og:image:type"], "image/png")
    assert.ok(meta["og:image:alt"] && meta["twitter:image:alt"])
    assert.equal(tags.filter(([name]) => name === "og:image").length, 1, "duplicate image metadata")
    if (manifest[operation.link]) assert.ok(html.includes(`href="${new URL(operation.link, baseUrl).href}"`), "missing canonical operation URL")
  }
}
