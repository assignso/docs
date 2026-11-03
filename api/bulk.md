---
description: Apply one bounded Task change to explicit items and recover partial results without repeating successful effects.
---

# Change several Tasks

## Prepare a bounded command <Badge type="warning" text="Awaiting deployment" />

[`bulkUpdateTasks`](./reference/operations/bulkupdatetasks) applies the same change to an explicit
list of Tasks in one Workspace. It runs synchronously and returns ordered per-item outcomes.
It does not start background work or select every Task matching a filter.

Choose between 1 and 100 Tasks you may edit, and read their current authorized state. Give each
Task a unique `item_id` for this command and retain its exact positive decimal `revision` as
`expected_revision`. Keep revisions as strings; JavaScript numbers can lose precision. Each
Task ID must also be unique in the request.

The request accepts Status, assignee, priority, due date and Milestone changes. Omitted changes
are preserved. Only the fields declared nullable accept `null`. The identity-coded JSON body
must fit within 5 MiB. This operation uses per-item `expected_revision` fields; it does not take
an HTTP `If-Match` condition.

## Submit one shared change

This illustrative request lowers the priority of two Tasks. Replace both IDs and revisions with
current values you have read, and choose one fresh key for this entire intended request.

```http
POST /api/v1/workspaces/{workspace_id}/tasks/bulk
Authorization: Bearer <token>
Idempotency-Key: <key-for-this-bulk-command>
Content-Type: application/json
Accept: application/json

{
  "items": [
    {
      "item_id": "priority-review-1",
      "task_id": "0198ac5e-f9b7-7000-8000-000000000001",
      "expected_revision": "7"
    },
    {
      "item_id": "priority-review-2",
      "task_id": "0198ac5e-f9b7-7000-8000-000000000002",
      "expected_revision": "12"
    }
  ],
  "changes": { "priority": "low" }
}
```

Keep the exact body, item IDs, revisions and key until the result is known. The credential needs
the operation's admitted write scope and current Workspace and Project authority. Browser
cookies do not authenticate this product request.

## Review every item

A `200` response contains `mode: "per_item"` and an `items` array in input order. A successful
HTTP response can include failed items:

| Item outcome | Meaning | Next action |
| --- | --- | --- |
| `updated` | The intended effect has a committed receipt | Save its revision and receipt ID. |
| `not_found` | The Task is unavailable to this request | Check current access and the target. |
| `conflict` | The observed Task version is no longer usable | Read current state and reconcile. |
| `validation_failed` | The change is invalid for that Task | Correct the intended change after review. |
| `item_conflict` | A successful item ID was reused for a different effect | Establish the original result before another command. |

Successful items return their original committed revision and receipt identity. A replay can
set `replayed: true`; its result does not substitute a fresh current Task. Read current authorized
Task state separately before making another change. The group response's `ETag` is not an item
write validator.

## Recover partial or unknown outcomes

After a timeout or lost response, retry the same key and exact request body under current
authority. Do not issue a new key merely because the response was interrupted. An unexpected
execution error aborts the whole command; a transport failure alone cannot establish which
result committed.

After reviewing a known partial result, you may submit only the failed items under a new request
key. Keep their original item IDs and use fresh server-authored revisions. Do not include already
successful items as a new intended effect. Their retained receipts do not expire into permission
to execute the command again; changing an effect under a successful item ID returns a conflict.

For a stale item, reconcile the new state before choosing a new change. For unavailable access,
restore authority before recovery. See [Writes and retries](./writes) and
[Errors and recovery](./errors) for finite retry budgets and uncertain outcomes.
