import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { createRequire } from 'node:module';
import { apiPresentation, loadApiPresentation, operationExampleSetup } from './api-presentation.mjs';
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

test('operation introductions compile without executable MDX expressions', async () => {
  const require = createRequire(import.meta.resolve('vocs'));
  const { compile } = await import(require.resolve('@mdx-js/mdx'));
  const { operations } = loadApiPresentation(new URL('..', import.meta.url).pathname);
  for (const operation of operations) {
    await compile(operationExampleSetup(operation), { remarkPlugins: [() => tree => {
      function check(node) {
        assert.ok(!['mdxTextExpression', 'mdxFlowExpression'].includes(node.type),
          `${operation.id} contains executable prose: ${node.value}`);
        for (const child of node.children ?? []) check(child);
      }
      check(tree);
    }] });
  }
});
