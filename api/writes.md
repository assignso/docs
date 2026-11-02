---
description: Read opaque item validators, make conditional edits and recover interrupted Assign API writes without repeating their effects.
---

# Writes and retries

## Conditional changes <Badge type="warning" text="Awaiting deployment" />

Read the operation's condition and idempotency requirements before sending a mutation. An
`Idempotency-Key` identifies one intent for retry; `If-Match` protects against changing a version
you have not observed. A key does not replace a condition.

For Task updates, read [the Task](./reference/operations/gettask) with `view=canonical`. Copy
the exact opaque strong `ETag` into `If-Match` on [the update](./reference/operations/updatetask).
Use the same content encoding. The default detail view includes independently changing display
data and does not supply the canonical mutation validator. A collection or create-response
tag cannot substitute for this read.

For Comment edits and deletion, read [the Comment](./reference/operations/getcomment) and keep
its representation selection and encoding. Only an operation that explicitly declares a
create-only condition accepts `If-None-Match: *` for that purpose. Reaction add/remove commands
have their own desired-state semantics and do not require a fabricated tag or retry key.
Use each operation's reference instead of applying a condition to every `PUT` or `DELETE`.

## Make an edit

Obtain a supported credential from [Authentication](./authentication). Get `taskId` from a Task
you can read and edit, for example a row returned by [Workspace Tasks](./pagination).
Pass `token`, `taskId` and a cancellation `signal` to your request code. This example clears
the Task's due date; it leaves omitted fields unchanged.

```js
const taskUrl = `https://api.assign.so/api/v1/tasks/${taskId}`
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
const read = await fetch(`${taskUrl}?view=canonical`, {
  headers, credentials: 'omit', signal,
})
if (!read.ok) throw new Error(`Read failed: ${read.status}`)
const etag = read.headers.get('ETag')
if (!etag) throw new Error('Canonical item validator is missing')
await read.json()

const original = {
  key: crypto.randomUUID(),
  etag,
  body: JSON.stringify({ due_on: null }),
}
async function sendOriginal() {
  return fetch(taskUrl, {
    method: 'PATCH', credentials: 'omit', signal,
    headers: {
      ...headers, 'Content-Type': 'application/json',
      'If-Match': original.etag, 'Idempotency-Key': original.key,
    },
    body: original.body,
  })
}
const result = await sendOriginal()
if (!result.ok) throw new Error(`Update needs recovery: ${result.status}`)
const updatedTask = await result.json()
```

The expected result is `200` with the updated Task. Keep `original` until the outcome is known;
the example sends once and does not automatically retry. Never derive `etag` from `revision`.

PATCH uses the operation's partial-object JSON schema, not JSON Merge Patch. Omission preserves
a value, an explicit `null` clears a nullable field, and arrays replace only where declared
writable. For example, `{"due_on":null}` clears the due date, while omitting `due_on` preserves
it. A null title is invalid. An empty `{}` fails `422`; a valid nonempty patch that changes
nothing returns the current representation without advancing its revision or emitting another
change. Read-only and unknown write fields are rejected.

## Recover a failed condition

| Result | Example trigger | Next action |
| --- | --- | --- |
| `428 precondition_required` | Task update has no `If-Match` | Read the canonical item and prepare a conditional request. |
| `412 precondition_failed` | Another writer changed the Task after your read | Read current canonical state, reconcile the intended edit, then create a new request with its current tag and a new key. |
| `400 malformed_request` | Task condition is malformed or weak | Correct the header syntax; copy an actual strong item tag unchanged. |

Task updates also reject numeric, foreign and wildcard conditions with `412`. Preserve strong
tag lists only where supported. Do not bypass an observed-version requirement with `*`.
A stale write is a new attempted change that failed its condition. Recovery of an already
committed keyed request follows the original intent instead.

## Recover an unknown outcome

A disconnect, cancellation, timeout or non-JSON gateway response does not prove rollback.
After an uncertain keyed Task create/update or Comment create/edit/delete:

1. Retain the original operation, target, credential context, selectors, body, key and condition.
2. Use the operation's documented recovery or retry the identical request within its retention
   and retry limits. Renew a locally expired request deadline without changing the intent.
3. A committed original result can be recovered under current access without repeating effects,
   even when its original condition is now old. A `409 operation_in_progress` means the original
   request is still pending; honor any `Retry-After` within your retry budget.
4. Treat a changed-payload `409 idempotency_key_conflict` as a different intent. Do not keep
   retrying it or issue a new key merely to escape the conflict. First establish the original
   result, then decide whether another change is needed.

Recovered historical responses can omit validators. Read current canonical state before the
next conditional edit, even when recovery returned a Task or Comment body. Recovery can fail
after access is revoked or a receipt is no longer recoverable. If you cannot establish the
outcome, stop and use the request ID for support; do not infer failure from an absent item on
one collection page.

Key requirements, scope and retention are operation-specific. The public keyed operations use
an opaque client-generated `Idempotency-Key` of 16–200 characters. Preserve it with the original
request through recovery. This is not a global promise of unlimited retention or exactly-once
delivery for all operations.

## Bound retries

Use a finite attempt count and elapsed-time deadline with backoff and jitter. Honor
`Retry-After` as the earliest retry time, whether it is delay-seconds or an HTTP date. Stop if
that time exceeds your deadline. A `retryable` error does not authorize a fresh mutation with
a new key. Quota or entitlement failures need the stated corrective action, not an automatic
retry loop. See [Errors and recovery](./errors#rate-limits-and-availability).
