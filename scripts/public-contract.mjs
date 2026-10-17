import { methods, projectPublic } from './generated/public-projection.mjs';
export { methods };

export const isInternal = operation => {
  const publication = operation['x-assign-publication'];
  if (!['product-reference', 'protocol-reference', 'first-party', 'internal'].includes(publication))
    throw new Error('Explicit publication classification required');
  return publication === 'first-party' || publication === 'internal';
};

// One independently approved operation set drives HTML, SDK and downloads.
export function publicContract(source, manifest = source['x-assign-release-manifest'], options = {}) {
  const result = projectPublic(source, manifest, options);
  return { ...result, 'x-assign-release-manifest': structuredClone(manifest) };
}
