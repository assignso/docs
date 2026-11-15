---
description: The Assign HTTP API, covering base URL, authentication options, conventions, versioning and where to find each resource.
---

# API overview

Use the HTTP API to connect Assign to your scripts and integrations. The rewritten v1 contract
is awaiting deployment. Check the operation's [availability](/api/conventions#availability)
before use.

- [Make your first API request](/api/quickstart) to set up a credential and read one Task page.
- [Find an operation](#find-an-operation-by-task) by workflow or browse the [reference](/api/reference/).
- [Recover from a failed request](/api/errors) using the status, error code and request ID.

Assign's public API uses JSON over HTTPS. The product REST base URL is
`https://api.assign.so/api/v1`.

Supported integrations use the operations in the [public reference](/api/reference/). Each
operation states its availability and access requirements. [Product OAuth](/api/oauth) and
[MCP](/mcp/) have separate protocol guides and credential audiences.

## Authentication

Use a personal API token for a script, an owned product service account for unattended
Workspace work, or product OAuth for a registered application. Each operation documents its
admitted credentials and scopes. Your current Workspace and Project permissions still apply.
[MCP credentials](/mcp/security) have their own audience and cannot authenticate product REST.

Start with [Make your first API request](/api/quickstart) for credential setup, the Workspace ID
and the same bounded Task read with HTTP, TypeScript or PHP. The [authentication guide](/api/authentication)
covers credential selection, expiry, rotation and recovery. The rewritten v1 flow is awaiting
deployment; check its availability before use. Assign applications manage their own sign-in.

## Conventions at a glance

- **Identifiers** are opaque UUIDv7 strings. Don't infer time, tenant or type from them.
- **Timestamps** are RFC 3339 in UTC. Calendar dates such as due dates are `YYYY-MM-DD`.
- **Pagination** follows every non-null `next_cursor`, including after short or empty pages.
- **Idempotency.** Where required, retain the original `Idempotency-Key` and exact request after
  an uncertain outcome.
- **Concurrency.** Conditional updates use the opaque item `ETag` in `If-Match`. A failed
  condition returns `412`; a missing required condition returns `428`.
- **Errors** use Problem Details with a stable `code`, `type` and `request_id`.
- **Isolation.** A resource outside your Workspace returns `404`, the same as a resource that
  doesn't exist.

Read [Conventions](/api/conventions) before you build an integration. The rewritten v1 rules are
awaiting deployment. [Pagination](/api/pagination), [writes and retries](/api/writes), and
[errors and recovery](/api/errors) cover continuation and failure handling.

## Find an operation by task

| I want to | Operations | Guide |
| --- | --- | --- |
| Find a Project | [List Workspace Projects](/api/reference/operations/listworkspaceprojects) | [Projects and Statuses](/api/projects) |
| List or read Tasks | [List Workspace Tasks](/api/reference/operations/listworkspacetasks), [Read a Task](/api/reference/operations/gettask) | [List and filter Tasks](/api/tasks#list) |
| Create or edit a Task | [Create a Task](/api/reference/operations/createtask), [Update a Task](/api/reference/operations/updatetask) | [Create a Task](/api/tasks#create), [Edit a Task safely](/api/writes#make-an-edit) |
| Add a Comment or relate Tasks | [Create a Comment](/api/reference/operations/createcomment), [Create a Task relation](/api/reference/operations/createtaskrelation) | [Tasks](/api/tasks) |
| Configure a Project workflow | [List Project Statuses](/api/reference/operations/listprojectstatuses), [Create a Project Status](/api/reference/operations/createprojectstatus) | [Task Statuses](/api/projects#statuses) |
| Manage labels or invitations | [List Workspace labels](/api/reference/operations/listworkspacelabeldefinitions), [Create a Workspace invitation](/api/reference/operations/createworkspaceinvitation) | [Labels](/api/labels), [Workspaces](/api/workspaces) |
| Find work or log time | [Search a Workspace](/api/reference/operations/searchworkspace), [Create a Task time entry](/api/reference/operations/createtasktimeentry) | [Search](/api/search), [Time tracking](/guides/time-tracking#api) |
| Receive Task events | [Create a webhook endpoint](/api/reference/operations/createwebhookendpoint) | [Receive Task webhooks](/api/webhooks) |

## Resources

<div class="resource-grid">

- [**Workspaces**](/api/workspaces): roles, settings, members and invitations
- [**Projects**](/api/projects): Projects, Statuses, members and Milestones
- [**Tasks**](/api/tasks): create, update, move, relate and comment
- [**Documents**](/api/documents): collaborative content, history and Markdown
- [**Attachments**](/api/attachments): direct-to-storage uploads
- [**Search**](/api/search): Workspace-scoped content search
- [**Current work**](/api/current-work): your in-progress Task across Workspaces
- [**Inbox**](/api/inbox): notifications and preferences
- [**Activity**](/api/activity): Task, Project, person and Workspace history
- [**People**](/api/people): member profiles
- [**Integrations**](/api/integrations): providers, installations and Rich Entities
- [**Knowledge**](/api/knowledge): evidence-backed Workspace Knowledge
- [**Discuss**](/api/discuss): private AI conversation
- [**Agents**](/api/agents): hired and custom Agents
- [**Git-backed Documents**](/api/git-backed-documents): sync Documents with a repository

</div>

## Using Assign

Use [Account settings](/api/account) to manage your profile and credentials in the application.
[Application realtime](/api/realtime) describes upcoming live updates and interruption recovery.
The application manages its sign-in and live connection.

## API reference

Browse the [API reference](/api/reference) for parameters, request examples and response schemas
from the public contract. Reference pages marked upcoming describe accepted behavior that has
not yet deployed.

## OpenAPI and SDKs

The public contract is an [OpenAPI 3.1 document](/openapi.yaml). It is the authoritative source for
request and response schemas, and the [endpoint index](/api/endpoints) lists every operation in it.
Import it into an API client or use it to generate your own client.

Official SDK authoring sources are generated from the same approved public contract. A generated
source package does not establish that a matching package has been released:

| Language | Package |
| --- | --- |
| TypeScript | `@assignso/sdk` (matching contract not yet released) |
| PHP | `assignso/php-sdk` (matching contract not yet released) |

Use the [first-request tutorial](/api/quickstart#3-read-one-task-page) for the current source examples
and availability. SDKs release on their own schedule. See
[Versioning](/api/versioning#sdk-and-client-releases).

## Page totals <Badge type="warning" text="Awaiting deployment" />

My Work, Workspace Document lists, Activity, Task Comments and Agent run history return
`total_count` for the collection you can access with the selected filters, before the cursor position.
Use it as an item count, not a fixed page count: response byte limits can shorten pages, and
the count can change as items change. Follow `next_cursor` until null to finish the traversal.
Activity counts events before display grouping; Comments include retained deleted-comment ordinals.
Totals do not allow arbitrary cursor jumps.
