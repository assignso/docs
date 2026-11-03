---
description: Live updates in Assign, interrupted connections and recovery without repeating actions.
---

# Application realtime <Badge type="warning" text="Upcoming" />

Live updates refresh the Assign views you have open when their saved data changes. This behavior
is under development.

## Upcoming Web behavior

Open Tasks, Project Overview, settings and current Task cards refresh as changes arrive. A Task
card follows the Task's current identity and link after a move. Background settings updates preserve
an unsaved name or URL draft.

Loading or failed reads keep synchronization pending. A working network connection does not by
itself mean the displayed data is current. If a view reports that more items remain, its loaded
rows are only part of the collection.

<a id="migration-from-sse"></a>
<a id="ide-authentication"></a>
<a id="handshake-and-error-contract"></a>
<a id="subscribe-to-a-scope"></a>
<a id="capture-a-baseline"></a>
<a id="capture-a-baseline-upcoming"></a>
<a id="read-apply-and-acknowledge"></a>

## Build an integration

The Assign application manages its live connection. For an external integration, use the
operations and credentials described in the [public API reference](./reference/) and
[authentication guide](./authentication). Those pages identify the supported integration surface
and its availability.

Read collections with [bounded pagination](./pagination). Keep the returned continuation opaque
and follow it until the operation reports that no next page remains. An interrupted connection
does not make a partial list complete.

For customer event delivery, use [Task webhooks](./webhooks), with signature verification,
deduplication and explicit gap recovery. For accepted background work, use the workflow's
[operation status](./operations). These interfaces have their own authorization and recovery.

## Recover from an interruption

When your connection returns, let the view finish refreshing before relying on its current state.
If your session has ended, sign in again. If Workspace access was removed, ask a Workspace
administrator to review your access.

Keep unsaved edits while resolving a conflict. Review the latest saved values before choosing
whether to apply your changes. Save or copy any unsaved work before reloading the page.

If a remote action is still pending, check its status before submitting it again. A missing update
or a disconnected view does not establish that the action failed. See
[integration actions](./integrations#github-gist-actions) for an example, and
[unknown write outcomes](./writes#recover-an-unknown-outcome) for API recovery.
