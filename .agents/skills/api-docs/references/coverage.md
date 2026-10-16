# API documentation coverage

Use the sections relevant to the page. Resolve each applicable item against its versioned contract; report missing facts rather than inventing them. “Not supported” needs evidence, too. These authoring checks adapt the guide's documentation and drift sections; they do not adopt its sample API design.

## Operation pages

Cover the reader's implementation and recovery decisions:

- Purpose and observable outcome; method/path, stable operation identity, API version, availability and deprecation/replacement where applicable.
- Admitted credentials, required scopes, live roles, Workspace/resource restrictions and field-level access. Authentication alternatives do not grant resource access.
- Path/query/header/body inputs, types, serialization, units, bounds, defaults and cross-field constraints. Distinguish omission, null, empty and zero, and required presence from nullable values.
- Success and failure statuses, media types, response schemas and significant headers. Include request IDs, pagination, retry or concurrency metadata only where supported.
- Notifications, events, background work and related changes; when reads, lists, search and streams reflect a write. Distinguish acceptance from completion.
- Idempotency scope/retention/mismatch behavior, concurrency requirements, timeout ambiguity and safe retry conditions. Avoid promises of exactly-once effects based on key presence alone.
- Request/response sizes, page and batch bounds, rate limits versus quotas, and documented cost implications. Link shared policies while stating exceptions.
- Machine-readable error codes, triggers and actionable recovery, including whether a failed request could have taken effect.
- Minimal and realistic examples, relevant failure sequences, and links to the resource and workflow guide.

Keep structured facts in OpenAPI. Check security inheritance and overrides: separate requirement objects are alternatives, schemes in one object combine, and an empty requirement can permit anonymous access. An empty bearer scope array is not evidence that no capability checks apply. Do not treat schema defaults, formats or read/write annotations as proof of server enforcement.

## Credential and OAuth guides

Explain who or what the credential represents, who may issue it, how to acquire it, its environment and Workspace binding, scope/role intersection and exact transmission syntax. Distinguish a bare token input from a full authorization-header value. Separate browser, native/CLI, delegated application and machine-to-machine setup where their assumptions differ.

Cover one-time secret display if supported, secure local/CI storage, logging exclusions, expiry, rotation/overlap, emergency revocation and propagation. Explain management, last-use inspection, ownership/offboarding and exposure recovery where available. Troubleshoot malformed, expired, revoked, wrong-environment and insufficient-authority cases without implying undocumented diagnostic distinctions.

For OAuth, cover registration, public/confidential client type, supported flows, redirect rules, PKCE, consent, scopes, Workspace selection, token exchange, refresh, revocation, discovery and error recovery. Keep protocol audiences separate. Explain cookie/CSRF behavior only on the interface that accepts it.

## Specialized workflows

- Collections: bounded traversal, filter/sort encoding, cursor binding, termination, totals and concurrent-change behavior. Follow the documented continuation signal, not page length.
- Jobs and bulk: acceptance versus completion, polling or event updates, terminal states, cancellation, partial success and per-item retry rules.
- Deletion: archive/trash/delete distinctions, retention, restore and irreversible effects.
- Webhooks and streams: authenticity, payload version, acknowledgment, duplicate handling, ordering, replay/resume and recovery from gaps.
- Files: upload completion, size/type restrictions, download authorization, URL expiry and integrity where supported.
- Migrations: affected API/SDK versions, before/after examples, replacements, compatibility window and verification. Keep SDK versioning separate from API versioning.

## Examples and drift

Use supported operations to explain relevant sequences: an interrupted create retried with the same key and payload; a stale update reconciled before retry; or a duplicate event acknowledged without repeating its effect. Derive actual status codes and payloads from the selected contract.

Validate spec references, examples and supported SDK snippets offline with fixtures or mocked transports. When an authorized behavior change is in scope, review compatibility, owner-supplied response evidence and generated consumer changes in the same slice. Never convert a documentation task into live API mutation or paid validation.

Check that published operation pages, downloadable OpenAPI, Markdown, search/agent indexes and SDK inputs use the intended audience and availability. Record deployment/proxy verification and human usability measurements separately from local checks. Report a missing fact or required check with its owner and affected operation; do not silently fill it or imply a passing result.
