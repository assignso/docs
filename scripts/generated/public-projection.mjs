// Generated from @assignso/openapi-spec public-projection.mjs; SHA-256 7ef21cf470a75d86e508db5684971ed10c4fa48bd7c678b88b3ec2d8bf855410.
// Public-only projection policy. Private registries are consumed before this boundary.
import { createHash } from 'node:crypto';

export const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];
const fail = (ok, message) => { if (!ok) throw new Error(message); };
const sorted = value => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;
export const projectionDigest = value => createHash('sha256').update(JSON.stringify(sorted(value))).digest('hex');
const publicExtensions = new Set(['x-assign-api-major', 'x-assign-status', 'x-assign-publication', 'x-assign-availability', 'x-assign-anonymous']);
const fields = new Set(`openapi info title summary description termsOfService contact name url email license identifier version jsonSchemaDialect servers variables default enum paths components tags externalDocs security operationId parameters requestBody responses callbacks deprecated $ref $id $schema $anchor $dynamicRef $dynamicAnchor $defs definitions type format properties patternProperties additionalProperties unevaluatedProperties required items prefixItems contains minContains maxContains additionalItems unevaluatedItems allOf anyOf oneOf not if then else dependentRequired dependentSchemas propertyName propertyNames const examples example content schema encoding headers style explode allowReserved allowEmptyValue in readOnly writeOnly nullable discriminator mapping xml attribute wrapped namespace prefix minimum maximum exclusiveMinimum exclusiveMaximum multipleOf minLength maxLength pattern minItems maxItems uniqueItems minProperties maxProperties contentEncoding contentMediaType contentSchema $comment securitySchemes schemas requestBodies links pathItems webhooks flows implicit password clientCredentials authorizationCode authorizationUrl tokenUrl refreshUrl scopes bearerFormat scheme openIdConnectUrl operationRef server value externalValue get put post patch delete head options trace`.split(/\s+/));
const maps = new Set(['paths', 'webhooks', 'variables', 'properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas', 'content', 'encoding', 'headers', 'responses', 'callbacks', 'schemas', 'parameters', 'requestBodies', 'securitySchemes', 'examples', 'links', 'pathItems', 'mapping', 'scopes', 'dependentRequired']);
const literal = new Set(['example', 'default', 'const', 'enum', 'value', 'required', 'security', 'dependentRequired']);
const set = (object, key, value) => Object.defineProperty(object, key, { value, writable: true, enumerable: true, configurable: true });

// Unknown standard fields fail instead of silently dropping wire constraints.
function safe(value, context = '', dynamic = false) {
  if (Array.isArray(value)) return value.map(child => safe(child, context));
  if (!value || typeof value !== 'object') return value;
  if (literal.has(context)) return structuredClone(value);
  fail(!['internal', 'first-party'].includes(value['x-assign-publication']), 'private graph node');
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    // Callback names contain an additional runtime-expression-to-Path-Item map.
    if (dynamic && context === 'callbacks') { set(result, key, safe(child, 'callback', true)); continue; }
    if (dynamic && context === 'callback') {
      if (key.startsWith('x-') && !publicExtensions.has(key)) continue;
      fail(key === '$ref' || publicExtensions.has(key) || /^(https?:\/\/|\/|\{)/.test(key), 'invalid callback expression');
      set(result, key, safe(child, 'pathItem')); continue;
    }
    if (dynamic) { set(result, key, safe(child, context)); continue; }
    if (key === '$comment') continue;
    if (key.startsWith('x-') && !publicExtensions.has(key)) continue;
    fail(fields.has(key) || publicExtensions.has(key), `unsupported public field: ${key}`);
    set(result, key, safe(child, key, maps.has(key) && !Array.isArray(child)));
  }
  return result;
}
const escape = value => value.replaceAll('~', '~0').replaceAll('/', '~1');
function lookup(document, ref) {
  fail(typeof ref === 'string' && ref.startsWith('#/'), `nonlocal reference: ${ref}`);
  let node = document;
  for (const key of ref.slice(2).split('/').map(value => value.replaceAll('~1', '/').replaceAll('~0', '~'))) {
    fail(node && Object.hasOwn(node, key), `dangling reference: ${ref}`); node = node[key];
  }
  return node;
}
function walk(value, visit, context = '') {
  if (!value || typeof value !== 'object' || literal.has(context)) return;
  visit(value, context);
  for (const [key, child] of Object.entries(value)) walk(child, visit, key);
}
export function operationRows(document) {
  return Object.entries(document.paths ?? {}).flatMap(([path, item]) => methods.filter(method => item[method])
    .map(method => ({ path, method, operation: item[method] })));
}

export function projectPublic(source, manifest, { view = 'product', prepared = false } = {}) {
  fail(manifest?.schema === 'assign.public-release.v1', 'explicit release manifest required');
  fail(Object.keys(manifest).every(key => ['schema', 'state', 'view', 'release', 'contract_epoch', 'schema_epoch', 'operations', 'component_roots', 'document_sha256', 'protocol'].includes(key)), 'private/unknown release manifest field');
  fail(['product', 'protocol'].includes(view) && manifest.view === view, 'publication view mismatch');
  fail(manifest.state === 'released' || (prepared && manifest.state === 'prepared'), 'release evidence required');
  fail(source.openapi === '3.1.1', 'pinned OpenAPI 3.1.1 required');
  fail(typeof manifest.release === 'string' && /^[a-zA-Z0-9._-]+$/.test(manifest.release), 'release identity required');
  fail(view === 'product' ? manifest.protocol === undefined : /^[a-z][a-z0-9-]+$/.test(manifest.protocol ?? ''), 'named protocol boundary required');
  fail(Number.isInteger(manifest.contract_epoch) && manifest.contract_epoch > 0 && Number.isInteger(manifest.schema_epoch) && manifest.schema_epoch > 0, 'contract/schema epoch required');
  fail(Array.isArray(manifest.operations) && manifest.operations.length > 0, 'empty release manifest');
  fail(Array.isArray(manifest.component_roots) && new Set(manifest.component_roots).size === manifest.component_roots.length, 'explicit unique component roots required');
  fail(/^[a-f0-9]{64}$/.test(manifest.document_sha256 ?? ''), 'independent public content approval required');
  const expectedPublication = view === 'product' ? 'product-reference' : 'protocol-reference';
  const rows = operationRows(source), ids = new Map();
  for (const row of rows) {
    const id = row.operation.operationId;
    fail(typeof id === 'string' && id.length > 0 && !ids.has(id), `duplicate/missing operationId: ${id}`);
    fail(['product-reference', 'protocol-reference', 'first-party', 'internal'].includes(row.operation['x-assign-publication']), `unclassified operation: ${id}`);
    ids.set(id, row);
  }
  const selected = new Set();
  const output = { ...source, paths: {}, components: {} };
  delete output['x-assign-release-manifest'];
  delete output.webhooks;
  // Every selected operation carries effective security explicitly.
  delete output.security;
  for (const entry of manifest.operations) {
    fail(Object.keys(entry).sort().join(',') === 'availability,method,operationId,path', 'private/unknown operation manifest field');
    const row = ids.get(entry.operationId);
    fail(row && row.path === entry.path && row.method === entry.method && !selected.has(entry.operationId), 'release operation identity mismatch');
    fail(!row.path.startsWith('/api/v2') && (view !== 'product' || row.path === '/api/v1' || row.path.startsWith('/api/v1/')), 'single in-place product namespace required');
    selected.add(entry.operationId);
    const operation = structuredClone(row.operation);
    fail(operation.responses && typeof operation.responses === 'object', 'operation responses required');
    fail(operation['x-assign-publication'] === expectedPublication, 'publication metadata mismatch');
    fail(['preview', 'available', 'deprecated'].includes(operation['x-assign-availability']) && entry.availability === operation['x-assign-availability'], 'availability metadata mismatch');
    fail((operation.deprecated === true) === (entry.availability === 'deprecated'), 'deprecation metadata mismatch');
    fail(manifest.state !== 'released' || entry.availability !== 'preview', 'preview operation cannot be released');
    const security = operation.security ?? source.security;
    fail(Array.isArray(security), 'explicit authentication required');
    fail(typeof operation['x-assign-anonymous'] === 'boolean' && operation['x-assign-anonymous'] === (security.length === 0), 'anonymous/security metadata mismatch');
    if (!security.length) fail(operation['x-assign-anonymous'] === true, 'explicit anonymous metadata required');
    for (const requirement of security) {
      fail(Object.keys(requirement).length > 0, 'implicit anonymous security alternative');
      for (const name of Object.keys(requirement)) {
        fail(Array.isArray(requirement[name]) && requirement[name].every(scope => typeof scope === 'string'), 'invalid security scopes');
        const scheme = lookup(source, `#/components/securitySchemes/${escape(name)}`);
        if (view === 'product') fail(name !== 'browserSession' && scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'bearer', 'product requires declared bearer schemes');
      }
    }
    operation.security = security;
    const item = output.paths[row.path] ??= Object.fromEntries(Object.entries(source.paths[row.path]).filter(([key]) => !methods.includes(key)));
    item[row.method] = operation;
  }
  const found = new Set();
  function visit(value) {
    walk(value, node => {
      fail(!['first-party', 'internal'].includes(node['x-assign-publication']), 'private graph node');
      if (node.operationId && !node.responses) fail(selected.has(node.operationId), 'dangling operation link');
      const refs = [node.$ref, node.$dynamicRef, node.operationRef, ...Object.values(node.discriminator?.mapping ?? {}),
        ...(Array.isArray(node.security) ? node.security : []).flatMap(requirement => Object.keys(requirement).map(name => `#/components/securitySchemes/${escape(name)}`))].filter(Boolean);
      for (const ref of refs) {
        lookup(source, ref);
        if (ref.startsWith('#/paths/')) {
          const target = lookup(source, ref);
          fail(target.operationId && selected.has(target.operationId), 'private operation reference');
        }
        if (ref.startsWith('#/components/')) {
          const root = ref.split('/').slice(0, 4).join('/');
          if (!found.has(root)) {
            found.add(root);
            const [, , group, name] = root.split('/').map(value => value.replaceAll('~1', '/').replaceAll('~0', '~'));
            const definition = lookup(source, root);
            fail(['schemas', 'responses', 'parameters', 'examples', 'requestBodies', 'headers', 'securitySchemes', 'links', 'callbacks', 'pathItems'].includes(group), 'unknown component section');
            set(output.components[group] ??= {}, name, structuredClone(definition)); visit(definition);
          }
        }
      }
    });
  }
  for (const ref of manifest.component_roots) fail(ref.startsWith('#/components/'), 'invalid component root');
  visit([output, ...manifest.component_roots.map($ref => ({ $ref }))]);
  const tags = new Set(operationRows(output).flatMap(({ operation }) => operation.tags ?? []));
  if (output.tags) output.tags = output.tags.filter(tag => tags.has(tag.name));
  const result = safe(output);
  const graphIds = new Set();
  walk(result, (node, context) => {
    if (node.operationId && node.responses) {
      fail(!graphIds.has(node.operationId), 'duplicate callback operation identity');
      graphIds.add(node.operationId);
      if (!selected.has(node.operationId)) {
        fail(view === 'protocol' && node['x-assign-publication'] === 'protocol-reference', 'unclassified/private callback');
        fail(['preview', 'available', 'deprecated'].includes(node['x-assign-availability']), 'callback availability required');
        fail(Array.isArray(node.security) && typeof node['x-assign-anonymous'] === 'boolean'
          && (node.security.length === 0) === node['x-assign-anonymous'], 'callback authentication required');
        for (const requirement of node.security) {
          fail(Object.keys(requirement).length > 0, 'implicit anonymous callback security');
          for (const scopes of Object.values(requirement)) fail(Array.isArray(scopes) && scopes.every(scope => typeof scope === 'string'), 'callback security scopes');
        }
      }
    }
    for (const ref of [node.$ref, node.$dynamicRef, node.operationRef, ...Object.values(node.discriminator?.mapping ?? {})].filter(Boolean)) lookup(result, ref);
    if (view === 'product') {
      fail(!node.callbacks && !node.webhooks, 'protocol callbacks require a separate protocol view');
      for (const parameter of Array.isArray(node.parameters) ? node.parameters : []) {
        const resolved = parameter.$ref ? lookup(result, parameter.$ref) : parameter;
        fail(resolved.in !== 'cookie' && !/csrf/i.test(resolved.name ?? ''), 'session/CSRF product parameter');
      }
      for (const name of Object.keys(node.headers ?? {})) fail(!/^set-cookie$/i.test(name) && !/csrf/i.test(name), 'session-cookie/CSRF product response');
      for (const name of Object.keys(node.properties ?? {})) fail(!/csrf/i.test(name), 'CSRF product body field');
    }
  });
  if (view === 'product') for (const scheme of Object.values(result.components.securitySchemes ?? {}))
    fail(scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'bearer', 'product schema root is not bearer');
  fail(projectionDigest(result) === manifest.document_sha256, 'public content approval differs');
  return result;
}
