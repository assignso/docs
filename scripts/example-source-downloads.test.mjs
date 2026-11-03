import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import test from "node:test"

test("allowlisted example source downloads preserve executable identity and exclude private inputs", () => {
  const directory = fileURLToPath(new URL("./tests", import.meta.url))
  const result = spawnSync("python3", ["-B", "-m", "unittest", "discover", "-s", directory, "-p", "test_example_source_downloads.py", "-v"],
    { encoding: "utf8", env: { PATH: process.env.PATH }, maxBuffer: 1024 * 1024 })
  assert.equal(result.status, 0, result.error?.message ?? result.stderr)
  assert.match(result.stderr, /Ran [1-9][0-9]* tests?/)
  assert.match(result.stderr, /^OK$/m)
  process.stdout.write(result.stderr)
})
