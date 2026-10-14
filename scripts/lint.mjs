import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { lint } from "markdownlint/promise"
import { parse } from "yaml"
import { root, sections } from "./prepare-pages.mjs"

const files = ["index.md", "README.md", "AGENTS.md"]
function collect(directory) {
  for (const item of readdirSync(join(root, directory), { withFileTypes: true })) {
    const path = join(directory, item.name)
    if (item.isDirectory()) collect(path)
    else if (/\.mdx?$/.test(item.name)) files.push(path)
  }
}
for (const directory of [...sections, ".agents"]) collect(directory)
const { config } = parse(readFileSync(join(root, "markdownlint.yaml"), "utf8"))
const result = await lint({ files: files.map((file) => join(root, file)), config })
const errors = Object.entries(result).flatMap(([file, errors]) => errors.map((error) =>
  `${file}:${error.lineNumber} ${error.ruleNames[0]} ${error.ruleDescription}${error.errorDetail ? `: ${error.errorDetail}` : ""}`))
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1 }
else console.log(`Linted ${files.length} authored Markdown files; 0 issues`)
