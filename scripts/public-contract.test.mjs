import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicContract, isInternal } from './public-contract.mjs';
import { projectPublic } from './generated/public-projection.mjs';
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/publication.json', import.meta.url), 'utf8'));

test('HTML, public download and SDK inputs select one independent manifest without wire changes', () => {
  const { document, manifest } = fixture(), before = structuredClone(document);
  const download = publicContract(document, manifest);
  assert.deepEqual(projectPublic(document, manifest), document);
  assert.deepEqual(publicContract(download), download);
  assert.deepEqual(download.paths, document.paths);
  assert.deepEqual(download.components, document.components);
  assert.deepEqual(document, before);
  assert.ok(download.components.schemas.Example);
  assert.ok(download.components.schemas.ExamplePage);
});

test('no manifest or classification fails export, regardless of description', () => {
  const { document, manifest } = fixture();
  assert.throws(() => publicContract(document), /release manifest required/);
  delete document.paths['/api/v1/examples'].get['x-assign-publication'];
  document.paths['/api/v1/examples'].get.description = 'A public-sounding summary';
  assert.throws(() => publicContract(document, manifest), /unclassified/);
  assert.throws(() => isInternal({ description: 'Internal operation' }), /classification required/);
  assert.equal(isInternal({ 'x-assign-publication': 'first-party', description: 'Friendly summary' }), true);
});

test('preview fixtures require explicit prepared mode and cannot enter normal publication', () => {
  const { document, manifest } = fixture(); manifest.state = 'prepared';
  assert.throws(() => publicContract(document, manifest), /release evidence required/);
  assert.deepEqual(publicContract(document, manifest, { prepared: true }).paths, document.paths);
});

test('manifest and internal profiling overlays cannot leak through public downloads', () => {
  const { document, manifest } = fixture();
  document.paths['/api/v1/examples'].get['x-assign-performance'] = { owner: 'prepared-private-owner', fixture_selector: 'prepared-private-selector' };
  const output = publicContract(document, manifest);
  assert.doesNotMatch(JSON.stringify(output), /prepared-private/);
  manifest.source_path = 'private-source';
  assert.throws(() => publicContract(document, manifest), /unknown release manifest field/);
});

test('changed shared prose and dangling schema references require resolution before download', () => {
  const { document, manifest } = fixture();
  document.components.schemas.Example.description = 'Unreviewed text';
  assert.throws(() => publicContract(document, manifest), /approval differs/);
  delete document.components.schemas.Example;
  assert.throws(() => publicContract(document, manifest), /dangling/);
});

test('actual Docs generator emits/checks manifest-selected endpoint/download/SDK inputs in isolated staging', async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { parse } = await import('yaml');
  const { apiPresentation } = await import('./api-presentation.mjs');
  const { document, manifest } = fixture();
  const root = mkdtempSync(join(tmpdir(), 'assign-publication-'));
  try {
    const input = join(root, 'source.json'), release = join(root, 'release.json');
    writeFileSync(input, JSON.stringify(document)); writeFileSync(release, JSON.stringify(manifest));
    const script = fileURLToPath(new URL('./generate-api-endpoints.mjs', import.meta.url));
    const args = [script, input, '--output-root', root];
    for (const extra of [[], ['--check']]) {
      const result = spawnSync(process.execPath, [...args, ...extra], { encoding: 'utf8', env: { PATH: process.env.PATH, ASSIGN_PUBLIC_RELEASE_MANIFEST: release } });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /1 public operations/);
    }
    const download = parse(readFileSync(join(root, 'public/openapi.yaml'), 'utf8'));
    assert.deepEqual(download.paths, document.paths);
    assert.deepEqual(download.components, document.components);
    assert.equal(apiPresentation(download).operations.length, manifest.operations.length);
    assert.match(readFileSync(join(root, 'api/endpoints.md'), 'utf8'), /GET \/api\/v1\/examples/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('package validation checks the same public release before accepting a source artifact', async () => {
  const { validatePublicRelease } = await import('./validate-public-release.mjs');
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { document, manifest } = fixture();
  const root = mkdtempSync(join(tmpdir(), 'assign-package-publication-'));
  try {
    const file = join(root, 'openapi.json');
    writeFileSync(file, JSON.stringify({ ...document, 'x-assign-release-manifest': manifest }));
    assert.equal(validatePublicRelease(file).operations, 1);
    manifest.source = 'private-registry';
    writeFileSync(file, JSON.stringify({ ...document, 'x-assign-release-manifest': manifest }));
    assert.throws(() => validatePublicRelease(file), /unknown release manifest/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
