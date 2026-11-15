import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { createRequire } from 'node:module';
import { loadDocsContract } from './authoring-contract.mjs';
import { parse as parseOpenApi } from '../node_modules/vocs/dist/internal/openapi/parser.js';
import { fromIr } from '../node_modules/vocs/dist/internal/openapi/markdown.js';
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

test('the endpoint index lists every operation in the pinned reference', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const { operations } = loadApiPresentation(root);
  const index = readFileSync(new URL('../api/endpoints.md', import.meta.url), 'utf8');
  const indexed = [...index.matchAll(/^\| `([A-Z]+ \/[^`]+)` \|/gm)].map(([, entry]) => entry);
  assert.deepEqual(indexed.sort(), operations.map(({ method, path }) => `${method} ${path}`).sort());
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

test('getTask Markdown renders both approved 200 schemas with their own required fields', async () => {
  const { document } = loadDocsContract(fileURLToPath(new URL('../public/openapi.yaml', import.meta.url)));
  const path = '/api/v1/tasks/{task_id}';
  const contract = document.paths[path].get;
  assert.equal(contract.parameters.find(({ name }) => name === 'view').schema.default, 'detail');
  const ir = await parseOpenApi({ path: '/api/reference', spec: document });
  const resource = fromIr(ir).find(({ path }) => path === '/api/reference/tasks').content;
  const operations = resource.split(/(?=^## )/m).filter(section => section.split('\n').includes('`GET ' + path + '`'));
  assert.equal(operations.length, 1);
  const success = operations[0].split(/(?=^#### )/m).find(section => section.startsWith('#### `200`'));
  assert.match(success, /The default `view=detail` returns `Task`\. Use `view=canonical` to return `CanonicalTask`\./);
  const body = success.split('Body (`application/json`):')[1];
  assert.match(body, /^- Exactly one of$/m);
  for (const name of ['Task', 'CanonicalTask']) {
    const branch = body.split(/(?=^  - )/m).find(section => section.startsWith('  - `' + name + '`'));
    assert.ok(branch, 'Missing response schema ' + name);
    const required = [...branch.matchAll(/^    - `([^`]+)` [^\n]*?_\(required\)_/gm)].map(([, field]) => field);
    assert.deepEqual(required.sort(), [...document.components.schemas[name].required].sort(), name);
  }
  assert.doesNotMatch(resource, /x-assign-(?:publication|performance|release-manifest)|fixture_selector/);
});

test('response Markdown keeps null and nested alternatives distinct and bounded', async () => {
  const tooDeep = { type: 'object', properties: { omittedField: { type: 'string' } } };
  const spec = {
    openapi: '3.1.0',
    info: { title: 'Prepared response fixture', version: '1' },
    paths: {
      '/fixture': { get: {
        operationId: 'getFixture',
        summary: 'Read fixture',
        tags: ['Fixture'],
        responses: { 200: {
          description: 'Selected response.',
          content: { 'application/json': { schema: {
            oneOf: [{ type: 'null' }, { $ref: '#/components/schemas/Result' }],
          } } },
        } },
      } },
    },
    components: { schemas: {
      Result: {
        type: 'object',
        required: ['events'],
        properties: {
          events: { type: 'array', items: { anyOf: [
            { $ref: '#/components/schemas/NameEvent' },
            { $ref: '#/components/schemas/CountEvent' },
            { allOf: [
              { type: 'object', required: ['kind', 'payload'] },
              { properties: { kind: { const: 'retry' } } },
            ] },
          ] } },
        },
        'x-assign-private': 'prepared-private-selector',
      },
      NameEvent: {
        type: 'object',
        description: 'When an event supplies a name.',
        required: ['value'],
        properties: { value: { type: 'string' }, nested: tooDeep },
      },
      CountEvent: {
        type: 'object',
        description: 'When an event supplies a count.',
        properties: { value: { type: 'integer' } },
      },
    } },
  };
  const ir = await parseOpenApi({ path: '/api/reference', spec });
  const markdown = fromIr(ir).find(({ path }) => path === '/api/reference/fixture').content;
  assert.match(markdown, /^- Exactly one of\n  - Variant 1 \(`null`\)\n  - `Result`\n    - `events` [^\n]+_\(required\)_/m);
  assert.match(markdown, /^ {6}- Array items\n {8}- At least one of\n {10}- `NameEvent`: When an event supplies a name\.\n {12}- `value` `string` _\(required\)_/m);
  assert.match(markdown, /^ {10}- `CountEvent`: When an event supplies a count\.\n {12}- `value` `integer`$/m);
  assert.match(markdown, /^ {10}- `kind` is `"retry"`\n {12}- Required fields are `kind`, `payload`$/m);
  assert.doesNotMatch(markdown, /omittedField|x-assign-private|prepared-private-selector/);
});
