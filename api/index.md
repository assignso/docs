---
description: The Assign HTTP API, covering base URL, authentication options, conventions, versioning and where to find each resource.
---

# API overview

Assign's public API is JSON over HTTPS. Every product operation lives under one versioned base
path:

```text
https://api.assign.so/api/v1
```

The web app, CLI, IDE extensions, mobile apps and MCP server all use this API, so a change made
through it follows the same permissions, validation and history as one made in the product.

## Authentication

Use a personal API token for a script, an owned product service account for unattended
Workspace work, or product OAuth for a registered application. Each operation documents its
admitted credentials and scopes. Your current Workspace and Project permissions still apply.
[MCP credentials](../mcp/security) have their own audience and cannot authenticate product REST.

The [authentication guide](./authentication) has one credential chooser, UI setup, a bounded
Task-read example and expiry, rotation and recovery rules. The rewritten v1 flow is awaiting
deployment; check its availability before use. Assign applications manage their own sign-in.

## Conventions at a glance

- **Identifiers** are opaque UUIDv7 strings. Don't infer time, tenant or type from them.
- **Timestamps** are RFC 3339 in UTC. Calendar dates such as due dates are `YYYY-MM-DD`.
- **Pagination** uses opaque cursors with bounded page sizes: `next_cursor` and `has_more`.
- **Idempotency.** Retryable writes take an `Idempotency-Key`. Reuse it only for the identical
  request.
- **Concurrency.** Updates take the resource revision in `If-Match`, and a stale revision returns
  `409`.
- **Errors** carry a stable machine-readable `code`, a safe message and, when available, a request
  ID.
- **Isolation.** A resource outside your Workspace returns `404`, the same as a resource that
  doesn't exist.

Read [Conventions](./conventions) before you build an integration.

## Resources

<div class="resource-grid">

- [**Application realtime**](./realtime): upcoming browser subscriptions and applied acknowledgements
- [**Account**](./account): profile and credential management in Assign
- [**Workspaces**](./workspaces): roles, settings, members and invitations
- [**Projects**](./projects): Projects, Statuses, members and Milestones
- [**Tasks**](./tasks): create, update, move, relate and comment
- [**Documents**](./documents): collaborative content, history and Markdown
- [**Attachments**](./attachments): direct-to-storage uploads
- [**Search**](./search): Workspace-scoped content search
- [**Current work**](./current-work): your in-progress Task across Workspaces
- [**Inbox**](./inbox): notifications and preferences
- [**Activity**](./activity): Task, Project, person and Workspace history
- [**People**](./people): member profiles
- [**Integrations**](./integrations): providers, installations and Rich Entities
- [**Knowledge**](./knowledge): evidence-backed Workspace Knowledge
- [**Discuss**](./discuss): private AI conversation
- [**Agents**](./agents): hired and custom Agents
- [**Git-backed Documents**](./git-backed-documents): sync Documents with a repository

</div>

## API reference

Browse the [API reference](/api/reference) for parameters, request examples and response schemas
from the public contract. Reference pages marked upcoming describe accepted behavior that has
not yet deployed.

## OpenAPI and SDKs

The public contract is an [OpenAPI 3.1 document](/openapi.yaml). It is the authoritative source for
request and response schemas, and the [endpoint index](./endpoints) lists every operation in it.
Import it into an API client or use it to generate your own client.

Official SDKs are generated from the same document:

| Language | Package |
| --- | --- |
| TypeScript | [`@assignso/sdk`](https://www.npmjs.com/package/@assignso/sdk) (release candidate) |
| PHP | `assignso/php-sdk` (not yet published on Packagist) |

SDKs release on their own schedule. See [Versioning](./versioning#sdk-and-client-releases).

## Page totals <Badge type="warning" text="Awaiting deployment" />

My Work, Workspace Document lists, Activity, Task Comments and Agent run history return
`total_count` for the collection you can access with the selected filters, before the cursor position.
Divide it by your requested page size to calculate total pages. The count can change as items change.
Activity counts events before display grouping; Comments include retained deleted-comment ordinals.
Totals do not allow arbitrary cursor jumps.
