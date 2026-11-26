import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { checkPublicExport, validateReleasedExport } from './check-public-export.mjs';

export function validatePublicRelease(path = fileURLToPath(new URL('../public/openapi.yaml', import.meta.url))) {
  const manifest = validateReleasedExport(parse(readFileSync(path, 'utf8')));
  assert.ok(!existsSync(resolve(dirname(path), 'openapi-provenance.json')), 'Remove stale authoring pin before released publication');
  return { operations: manifest.operations.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const path = process.argv[2];
    if (path) console.log(JSON.stringify(validatePublicRelease(path)));
    else {
      const root = fileURLToPath(new URL('..', import.meta.url));
      const { state, operations } = checkPublicExport(resolve(root, 'public'), { indexPath: resolve(root, 'api/endpoints.md') });
      assert.ok(state === 'released', 'Explicit release manifest required');
      console.log(JSON.stringify({ operations }));
    }
  }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
