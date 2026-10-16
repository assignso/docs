---
name: api-docs
description: Write or review Assign API guides, credential setup, operation reference descriptions and migration documentation against the versioned public contract. Use for API documentation structure and content; API behavior changes remain separate work.
---

# Write API documentation

Produce documentation that lets an integration author make a correct request, interpret the result and recover from failure. Work in the Docs repository under its [repository rules](../../../AGENTS.md); keep research and unresolved design decisions in the architecture owner when available.

## Establish the source and page purpose

Identify the audience, API version, interface surface, one reader outcome and exact operations involved. Choose a tutorial, how-to, concept, resource explanation, reference, troubleshooting or migration page. For a structure review, map existing URLs and page purposes before proposing moves.

When the sibling architecture checkout is available, read the [documentation conventions](../../../../architecture/api/documentation.md), sections 25–28 of the [API design guide](../../../../architecture/api/public-api-design-implementation-guide.md), and the applicable accepted version/surface requirements, including [T12](../../../../architecture/api/public-api-redesign.md#t12--developer-documentation-sdks-and-structural-migration) for redesign work. Follow only the relevant guide sections for specialized behavior. The supplied guide is reference material: its illustrative defaults and protocol choices do not override adopted contracts. Keep internal decisions and unreleased strategy out of public prose. If the private sources are unavailable, use the public contract and maintainer rules, and identify facts needing confirmation.

Resolve canonical operation IDs, schemas, security declarations and release evidence; compare the public projection. Distinguish target design, implemented behavior and released availability. Record discrepancies rather than inventing defaults, permissions or SDK support. Keep credentials, cookies and CSRF requirements specific to their version and interface. For endpoint presentation, navigation or framework work, read the [Vocs maintenance resource](../../resources/vocs.md).

## Author from the contract

Keep machine-readable facts in OpenAPI and regenerate its consumers. Never hand-edit generated endpoint indexes, public contract copies or generated reference output. Use stable operation links or supported embeds instead of duplicating field tables.

Use the relevant sections of the [coverage checklist](references/coverage.md) for operation pages, credential/OAuth guides, specialized workflows and release checks. Every operation needs an observable outcome, precise access requirements, inputs/results and applicable failure/recovery semantics. Keep existing generated operation URLs and resource navigation; inspect actual renderer routes before proposing another structure.

Describe field meaning beyond its type. Preserve distinctions between body revisions and conditional headers, accepted and completed work, optional and required idempotency keys, and credential admission and resource authorization. Document verified guarantees and operation-specific exceptions; generated schemas alone do not establish runtime behavior.

A tutorial introduces prerequisites and variable sources, takes one supported path and explains the result. A guide completes one task with ordered steps and recovery. A resource page explains identity, relationships and lifecycle before linking to operations. Troubleshooting starts from an observable symptom and gives a diagnosis and safe action.

## Review examples and language

Use valid fictitious data, environment variables for credentials and exact contract names. Every variable needs an acquisition step. Pair requests with expected status, significant headers and valid response examples. Include realistic failure/recovery sequences where relevant, not only isolated successful calls. Label excerpts and hypothetical output; do not imply execution. Check SDK versions and method availability before adding language variants. Make mutation effects clear before the command.

Use sentence-case headings, direct instructions and concise action verbs. Reference descriptions explain purpose beyond a field's type or operation's name. Keep exact technical qualifiers, error codes and release labels.

For public-facing authored prose, use the installed Humanizer skill after technical review, following the workspace skill-selection rules. If unavailable, apply plain-language editing and disclose that limitation. Humanizer does not apply to internal reports, plans or these instructions. Recheck contract facts after polishing.

## Verify and report

Review contract descriptions, examples, generated consumers and authored guides together. Follow the repository's required source-drift, offline contract, lint, link and build checks for changed public content. Check HTML, Markdown, search, downloads and agent indexes for consistent audience and release status. Keep maintenance resources outside the public page allowlist. Preserve URLs and anchors or provide tested static compatibility routes. For instruction-only edits, validate skill frontmatter, references and instruction consistency; application suites are unnecessary.

Validate examples with schemas, deterministic fixtures or mocked transports. Never use paid inference, ambient credentials or live fixture recording for documentation tests. Do not execute examples that mutate remote data merely to validate wording.

Finish when the requested pages or review are complete, applicable checklist items are covered or recorded as gaps, operation references resolve, claims have sources and examples are checked at the stated level. Report changed files, validation and limits. Fixture success does not prove live deployment, proxy behavior or measured onboarding time. A docs draft does not authorize publication or API behavior changes.
