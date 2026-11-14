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

The selected representation and its content encoding have distinct strong validators. Keep
the same selectors and encoding between the read and conditional write. A collection tag, a
detail projection tag or a tag for another resource cannot authorize an item update. Never
construct a tag from `revision` or a Task number.

## Cache and conditional reads

Where supported, `If-None-Match` sends a previously received validator. A `304` has no response
body: reuse only the matching stored representation. Current access still applies. Follow the
operation's cache policy; Task, Comment and other explicitly `no-store` responses must not be
retained as a reusable HTTP cache. A validator does not grant access.

ETags identify exact representations, including their contract version and encoding. Respect
`Vary` and keep data separate by credential, Workspace and query. Error responses use
`Cache-Control: no-store`. Clear private data when switching identity or losing access.

## CSV pages and complete exports

The current public reference does not expose a CSV collection or complete-export operation.
Do not add `format=csv` to an operation that only documents JSON.

Where a future operation explicitly supports paginated CSV, each response is one bounded page.
Copy each nonempty `Assign-Next-Cursor` value into the next request using the same query and
format. An empty header marks the final CSV page. Saving one CSV page is not a complete export. Preserve
the supplied filename and escaping when opening a CSV in a spreadsheet.

A complete export needs a separately documented export workflow. A `202 Accepted` and its
`Location` identify accepted work, not a completed file. Follow the job to its documented
terminal state and obtain the authorized download only on success. Download capabilities can
expire; use the documented recovery flow instead of saving a capability as a permanent URL.
No public export-job URL or polling interval is promised by these conventions.

## Availability

An operation's presence in a guide or contract does not establish deployment. Pages marked
upcoming or awaiting deployment describe accepted behavior that is not yet available.

Two deployment notes:

- Attachment operations need object storage, and files report `scan_state: not_scanned` until malware
  scanning is enabled. See [Attachments](./attachments).
- Passkey operations return `404` where passkeys aren't configured.

## Related

[Pagination](./pagination) covers limits and continuation. [Writes and retries](./writes) covers
conditions and interrupted requests. [Errors and recovery](./errors) explains failures and rate
limits. [Versioning](./versioning) covers compatibility and deprecation.
