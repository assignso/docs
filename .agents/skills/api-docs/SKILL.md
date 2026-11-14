---
name: api-docs
description: Write or review Assign API guides, reference descriptions, credential setup and migration docs against released contracts.
---

# Write API documentation

Produce pages that let an integration author make a correct request, interpret its result and recover. Follow [Docs rules](../../../AGENTS.md); internal research/undecided design stays with architecture.

## Resolve the contract

Name audience, API version/surface, reader outcome and exact operations; choose tutorial, how-to, concept, resource, reference, troubleshooting or migration. For structural reviews, map current URLs/purposes first.

With the sibling checkout, read [documentation conventions](../../../../architecture/api/documentation.md), sections 25–28 of the [design guide](../../../../architecture/api/public-api-design-implementation-guide.md) and accepted surface requirements; redesign also uses [T12](../../../../architecture/api/public-api-redesign.md#t12--developer-documentation-sdks-and-structural-migration). Read other guide sections only for relevant behavior. Illustrative defaults never override contracts. Without private sources, use public contracts/maintainer rules and identify unconfirmed facts.

Resolve operation IDs, schemas, security and release evidence against the public projection. Distinguish target, implemented and released behavior; record discrepancies instead of inventing defaults, permissions or SDK support. Keep credential/cookie/CSRF details specific to version and interface. For endpoint/navigation/framework work, read [Vocs maintenance](../../resources/vocs.md).

## Author and verify

- Keep machine-readable facts in OpenAPI; regenerate consumers, never hand-edit generated copies/indexes/reference output. Use stable operation links/embeds instead of duplicate field tables; preserve existing generated URLs/navigation and inspect actual renderer routes before restructuring.
- Apply relevant [coverage checks](references/coverage.md). Explain field meaning, access, outcome and failure/recovery beyond types. Preserve revision versus conditional-header semantics, accepted versus completed work, required versus optional idempotency and credential versus resource authorization. Schemas alone prove no runtime guarantee.
- Tutorials take one supported path with prerequisites, variable acquisition and expected results. Guides order a complete task with recovery; resources explain identity/relationships/lifecycle; troubleshooting starts with symptoms and safe diagnosis.
- Use fictitious valid data and credential environment variables. Pair requests with expected status, significant headers and legal responses, including realistic failure sequences. Label excerpts/hypothetical results; verify SDK versions/methods. Explain mutation effects before commands.
- Write concise sentence-case instructions and purposeful reference descriptions, preserving exact names/error codes/qualifiers/release labels. Apply Humanizer to public prose after technical review, then recheck facts; if unavailable, use plain-language editing and disclose the limit. Internal instructions/reports are excluded.
- Review contracts, generated consumers, guides and examples together. Follow Docs source-drift/offline-contract/lint/link/build gates for changed public content; verify HTML, Markdown, search, downloads and agent indexes. Maintenance resources stay outside public allowlists. Preserve URLs/anchors or test static compatibility routes. Instruction-only changes need frontmatter/reference/consistency checks, not app suites.
- Check examples with schemas, fixtures or mocked transports; no paid inference, ambient credentials, live recording or remote mutations merely to validate prose.

Finish with complete requested pages/findings, covered checklist or explicit gaps, resolving operation references and sourced claims. Report files, verification and limits: fixtures prove no deployment/proxy/onboarding performance; drafts authorize no publication or API behavior change.
