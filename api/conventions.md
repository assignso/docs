---
description: Choose the right representation, follow bounded pages and handle conditional writes and errors in the Assign API.
---

# API conventions

Use the [operation reference](./reference) for each operation's admitted credentials, inputs,
limits and responses. A shared convention applies only where that operation declares it.

## Shared rules <Badge type="warning" text="Awaiting deployment" />

These conventions describe the rewritten `/api/v1` contract. Check the availability label on
the operation before using it. [Authentication](./authentication) explains how to choose and
obtain a supported bearer credential.

| Topic | Rule |
| --- | --- |
| Identifiers | Opaque UUIDv7 strings. Don't infer time, tenant, type or order from them. |
| Timestamps | RFC 3339 in UTC. Calendar dates are `YYYY-MM-DD`. |
| Pagination | Follow every non-null `next_cursor`, including after a short or empty page. See [Pagination](./pagination). |
| Idempotency | Where required, retain the original `Idempotency-Key` and exact request after uncertainty. See [Writes and retries](./writes). |
| Concurrency | Copy the exact opaque item `ETag` from the declared read into `If-Match`. Failed conditions return `412`; missing required conditions return `428`. |
| Errors | Product errors use `application/problem+json`, a stable `code` and `type`, and a `request_id`. See [Errors and recovery](./errors). |
| Isolation | A resource outside your Workspace returns `404`, the same as one that doesn't exist. |

## Choose a representation

Only send selectors supported by the operation. A declared `format` selects the output format,
with `json` as the default unless the operation says otherwise. `Accept` permits or rejects that
choice. It does not override it. An unacceptable selected
representation returns `406 not_acceptable`. Unknown or duplicate selectors return `400`;
a valid but unsupported semantic combination returns `422`. There is no silent fallback.

Where an operation declares query limits, a query over the limit returns `413`.
Reduce the query to the operation’s supported selectors and limits before retrying.

`Content-Type` describes the request body. JSON writes use `application/json`. A content
operation that explicitly accepts Markdown requires its declared Markdown media type; sending
`Accept: text/markdown` does not turn a JSON request body into Markdown. Unsupported media types
or request content codings return `415 unsupported_media_type`. Send uncompressed request
bodies unless the operation explicitly accepts another coding.

For [Comments](./reference/operations/getcomment), `format=markdown` adds `body_markdown` to
the JSON representation. The response remains JSON. The format name alone does not imply a
`text/markdown` response.

Strong validators identify the selected representation and its encoding. Use the
representation and encoding named by the write operation, and send only selectors
that operation accepts. For a Task update, use `view=canonical` on the read and copy
its tag into the write's `If-Match` header. The write has no `view` selector. A collection
tag, a noncanonical detail tag or a tag for another resource cannot authorize an item update.
Some lists return a separate `item_validator.etag` on each writable row. Use that value
only when the write reference names it as the source. Never construct a tag from
`revision` or a Task number.

## Cache and conditional reads

Where supported, `If-None-Match` sends a previously received validator. A `304` has no response
body: reuse only the matching stored representation. Current access still applies. Follow the
operation's cache policy; Task, Comment and other explicitly `no-store` responses must not be
retained as a reusable HTTP cache. A validator does not grant access.

ETags identify exact representations, including their contract version and encoding. Respect
`Vary` and keep data separate by credential, Workspace and query. Error responses use
`Cache-Control: no-store`. Clear private data when switching identity or losing access.

## CSV pages and complete exports

[Read your timesheet](./reference/operations/getmytimesheet) with `from`, `to` and
`format=csv`, and allow `text/csv` in `Accept`. Use a supported bearer credential with
`time:read` or `assign:read` and current Workspace access. Each `200` returns one bounded
page. Copy each nonempty `Assign-Next-Cursor` value into the next request's `cursor` and
keep the dates, limit, format and credential unchanged. An empty header ends traversal.
If the report changes and returns `409`, restart from the first page.

For a complete snapshot of the authorized date range, first read the JSON timesheet and
keep its opaque `report_revision`. [Create an export](./reference/operations/createtimesheetexport)
using the same dates, that revision, `format: "csv"` in the JSON body and an
`Idempotency-Key`. The export is bounded to 366 days, 800 rows and 12 MiB. For a range
that exceeds the export bounds, choose a smaller range and read it again before exporting.

This export returns `202 Accepted` with an Operation already in `succeeded` state.
Use `Location` to [read its status](./reference/operations/getoperation) and
`result.href` to [download the CSV](./reference/operations/gettimesheetexport) with your
bearer credential. Downloads recheck access and expire after seven days. For `409` with
`time_report_changed`, reread the JSON timesheet before requesting a new snapshot. For
`410` after expiry, decide whether to create a new snapshot from a current observation.
If the create response is lost, recover by sending the exact original request and key.

Other operations define their own export workflow. When a `202` returns pending work,
follow the documented status resource to success before following its result link.

## Availability

An operation's presence in a guide or contract does not establish deployment. Pages marked
upcoming or awaiting deployment describe accepted behavior that is not yet available.

The product origin is `https://api.assign.so`. In an authorized preview environment,
use its supplied origin and confirm it serves the rewritten `/api/v1`. SDK publication
has a separate release schedule. See [SDK and client releases](./versioning#sdk-and-client-releases).

Two deployment notes:

- Attachment operations need object storage, and files report `scan_state: not_scanned` until malware
  scanning is enabled. See [Attachments](./attachments).
- Passkey operations return `404` where passkeys aren't configured.

## Related

[Pagination](./pagination) covers limits and continuation. [Writes and retries](./writes) covers
conditions and interrupted requests. [Errors and recovery](./errors) explains failures and rate
limits. [Versioning](./versioning) covers compatibility and deprecation.
