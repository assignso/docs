import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { apiPresentation } from './api-presentation.mjs';
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/publication.json', import.meta.url), 'utf8'));

test('every manifest operation has one unique HTML route and sidebar link', () => {
  const { document, manifest } = fixture(), before = structuredClone(document);
  const { operations, sidebar } = apiPresentation(document, manifest);
  assert.equal(operations.length, manifest.operations.length);
  const flatten = items => items.flatMap(item => [item, ...flatten(item.items ?? [])]);
  const links = flatten(sidebar).filter(({ link }) => link?.includes('/operations/'));
  assert.deepEqual(links.map(({ link }) => link).sort(), operations.map(({ link }) => link).sort());
  assert.deepEqual(document, before);
  assert.equal(sidebar[0].text, 'API reference');
  assert.equal(sidebar.find(({ text }) => text === 'More resources').items[0].items[0].link, '/api/reference/operations/listexamples');
});

test('unclassified source cannot become a discoverable HTML reference', () => {
  assert.throws(() => apiPresentation({ paths: { '/example': { get: { operationId: 'example' } } } }), /manifest required/);
});

test('current unmigrated download fails closed until its release/classification owners deliver', () => {
  const spec = parse(readFileSync(new URL('../public/openapi.yaml', import.meta.url), 'utf8'));
  assert.throws(() => apiPresentation(spec), /release manifest required/);
});
