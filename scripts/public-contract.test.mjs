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
  const { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { execFileSync, spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { parse } = await import('yaml');
  const { apiPresentation } = await import('./api-presentation.mjs');
  const { checkPublicExport } = await import('./check-public-export.mjs');
  const { exportDigest } = await import('./public-export.mjs');
  const { document, manifest } = fixture();
  const root = mkdtempSync(join(tmpdir(), 'assign-publication-'));
  try {
    const input = join(root, 'source.json'), release = join(root, 'release.json');
    const output = join(root, 'export'), receipt = join(root, 'private.json');
    writeFileSync(input, JSON.stringify(document));
    writeFileSync(release, JSON.stringify(manifest));
    const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    git('init', '-q');
    git('add', 'source.json');
    const tree = git('write-tree');
    const revision = git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit-tree', tree, '-m', 'Fixture source');
    const script = fileURLToPath(new URL('./generate-api-endpoints.mjs', import.meta.url));
    const args = [script, input, '--output-root', output, '--source-revision', revision, '--private-provenance', receipt];
    const env = { PATH: process.env.PATH, ASSIGN_PUBLIC_RELEASE_MANIFEST: release };
    const run = (...extra) => spawnSync(process.execPath, [...args, ...extra], { encoding: 'utf8', env });
    const directory = join(output, 'public');
    const authoringPin = join(directory, 'openapi-provenance.json');
    const stalePin = JSON.stringify({ schema: 'assign.docs-public-export.v1', state: 'approved-authoring' });
    mkdirSync(directory, { recursive: true });
    writeFileSync(authoringPin, stalePin);
    const result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 public operations/);
    assert.ok(!existsSync(authoringPin), 'Released generation removes the authoring pin');
    const verified = run('--check');
    assert.equal(verified.status, 0, verified.stderr);
    const path = join(directory, 'openapi.yaml');
    const indexPath = join(output, 'api/endpoints.md');
    const download = parse(readFileSync(path, 'utf8'));
    assert.deepEqual(download.paths, document.paths);
    assert.deepEqual(download.components, document.components);
    assert.equal(apiPresentation(download).operations.length, manifest.operations.length);
    assert.match(readFileSync(indexPath, 'utf8'), /GET \/api\/v1\/examples/);
    assert.equal(checkPublicExport(directory, { indexPath }).release, manifest.release);
    const binding = JSON.parse(readFileSync(receipt, 'utf8'));
    assert.equal(binding.source.revision, revision);
    assert.equal(binding.release, manifest.release);
    assert.equal(binding.release_manifest_sha256, exportDigest(manifest));
    assert.equal(binding.export.state, 'released');
    writeFileSync(authoringPin, stalePin);
    assert.match(run('--check').stderr, /Stale authoring pin/);
    assert.throws(() => checkPublicExport(directory, { indexPath }), /stale authoring pin/);
    rmSync(authoringPin);
    writeFileSync(indexPath, 'Old generated index');
    assert.throws(() => checkPublicExport(directory, { indexPath }), /endpoint index is stale/);
    assert.match(run('--check').stderr, /endpoints.md is stale/);
    writeFileSync(receipt, JSON.stringify({ ...binding, release: 'different' }));
    assert.match(run('--check').stderr, /Immutable private source-to-export receipt differs/);
    rmSync(receipt);
    assert.match(run('--check').stderr, /ENOENT.*private.json/);
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
    const extra = { ...document, components: { ...document.components, schemas: {
      ...document.components.schemas, Unapproved: { type: 'string' },
    } }, 'x-assign-release-manifest': manifest };
    writeFileSync(file, JSON.stringify(extra));
    assert.throws(() => validatePublicRelease(file), /released download differs/i);
    manifest.source = 'private-registry';
    writeFileSync(file, JSON.stringify({ ...document, 'x-assign-release-manifest': manifest }));
    assert.throws(() => validatePublicRelease(file), /unknown release manifest/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
