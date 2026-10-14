import { watch } from "node:fs"
import { spawn } from "node:child_process"
import { join } from "node:path"
import { preparePages, root, sections } from "./prepare-pages.mjs"

preparePages()
const server = spawn(process.execPath, [join(root, "node_modules/vocs/dist/cli.js"), "dev", ...process.argv.slice(2)], {
  cwd: root, stdio: "inherit",
})
let timer
const refresh = () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    try { preparePages() } catch (error) { console.error(error) }
  }, 100)
}
const watchers = [...sections, "styles"].map((section) => watch(join(root, section), { recursive: true }, refresh))
watchers.push(watch(root, (_, filename) => { if (filename === "index.md") refresh() }))
const close = () => {
  clearTimeout(timer)
  for (const watcher of watchers) watcher.close()
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { close(); server.kill(signal) })
server.on("error", (error) => { close(); console.error(error); process.exitCode = 1 })
server.on("exit", (code) => { close(); process.exitCode = code ?? 1 })
