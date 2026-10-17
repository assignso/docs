import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { publicContract } from './public-contract.mjs';

export function validatePublicRelease(path = fileURLToPath(new URL('../public/openapi.yaml', import.meta.url))) {
  const document = publicContract(parse(readFileSync(path, 'utf8')));
  return { operations: document['x-assign-release-manifest'].operations.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(validatePublicRelease(process.argv[2]))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
