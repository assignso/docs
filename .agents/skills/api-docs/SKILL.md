---
name: api-docs
description: Write or review Assign API tutorials, integration guides, resource pages and operation reference descriptions against their public contract. Use for API documentation structure and content; API behavior changes remain separate work.
---

# Write API documentation

Produce documentation that lets an integration author make a correct request, interpret the result and recover from failure. Work in the Docs repository under its [repository rules](../../../AGENTS.md); keep research and unresolved design decisions in the architecture owner when available.

## Establish the source and page purpose

Identify the audience, one reader outcome, and the exact operations involved. Choose a tutorial, how-to, concept, resource explanation, reference or troubleshooting page. For a structure review, map existing URLs and page purposes before proposing moves.

Resolve the canonical OpenAPI operation IDs, schemas, security declarations, owning requirements and release status. Compare the public projection. Record discrepancies rather than inventing defaults, permissions, SDK support or deployed availability. For framework/configuration work, read the [Vocs maintenance resource](../../resources/vocs.md) first.

## Author from the contract

Keep machine-readable facts in OpenAPI and regenerate its consumers. Never hand-edit generated endpoint indexes, public contract copies or generated reference output. Use stable operation links or supported embeds instead of duplicating field tables.

An operation reference needs an action-led title and observable outcome; method/path and availability; credential and resource-access requirements; a minimal request and success response; inputs; applicable behavioral constraints; errors and recovery; related guides. Use a stable operation anchor when the renderer groups operations on one page.

Describe field meaning, units, bounds, defaults, omission/null/empty behavior and serialization where relevant. Preserve distinctions between body revisions and conditional headers, accepted and completed work, optional and required idempotency keys, and credential admission and resource authorization. Document only verified retry, consistency, pagination and side-effect guarantees. Link shared rules while stating operation-specific exceptions.

A tutorial introduces prerequisites and variable sources, takes one supported path and explains the result. A guide completes one task with ordered steps and recovery. A resource page explains identity, relationships and lifecycle before linking to operations. Troubleshooting starts from an observable symptom and gives a diagnosis and safe action.

## Review examples and language

Use valid fictitious data, environment variables for credentials and exact contract names. Explain how to obtain IDs. Pair requests with expected status and valid response examples. Label excerpts and hypothetical output; do not imply execution. Check SDK versions and method availability before adding language variants. Make mutation effects clear before the command.

Use sentence-case headings, direct instructions and concise action verbs. Reference descriptions explain purpose beyond a field's type or operation's name. Keep exact technical qualifiers, error codes and release labels.

For public-facing authored prose, use the installed Humanizer skill after technical review, following the workspace skill-selection rules. If unavailable, apply plain-language editing and disclose that limitation. Humanizer does not apply to internal reports, plans or these instructions. Recheck contract facts after polishing.

## Verify and report

Follow the repository's required source-drift, offline contract, lint, link and build checks for changed public content. Check HTML and generated Markdown when rendering changes. Keep maintenance resources outside the public page allowlist. Preserve old URLs and explicit anchors or provide tested compatibility routes.

Validate examples with schemas, deterministic fixtures or mocked transports. Never use paid inference, ambient credentials or live fixture recording for documentation tests. Do not execute examples that mutate remote data merely to validate wording.

Finish when the requested pages or review are complete, exact operation references resolve, claims have sources, examples are checked at the stated level, and unresolved facts are explicit. Report changed files, validation and limits. A docs draft does not authorize publication or API behavior changes.
