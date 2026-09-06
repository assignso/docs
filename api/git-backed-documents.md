# Git-backed Documents

Git-backed Documents keep a Workspace's Assign Documents mirrored as readable
Markdown in one repository. Assign remains the canonical collaborative copy;
Git synchronization happens asynchronously and never blocks an editor save.

## Connect a repository

Open **Workspace settings → Knowledge → Git Repository**. Choose **Use existing
repository**, select an active GitHub connection and repository, then choose an
existing branch, a documentation root and a sync mode. Confirm the repository
reader disclosure before connecting. Repository creation is not available in
the initial GitHub adapter, so **Create documentation repository** remains
unavailable when that capability is absent.

The connection uses only repository access already granted under Integrations.
People who can read the repository can read every synchronized Document,
including preserved frontmatter. Do not connect a repository whose readers
should not receive that content.

## Synchronization behavior

- Assign edits are grouped before a conditional direct commit to the selected
  branch. Synchronization never force-pushes or creates a pull request.
- **Sync now** starts an immediate bounded reconciliation, but still applies
  authorization, conflict, provider and rate limits.
- In bidirectional mode, verified provider pushes cause Assign to reread the
  configured branch and apply supported Markdown changes under the selected
  documentation root.
- Deleting a bound Markdown file archives its Assign Document. Returning the
  same portable identity restores it. Known renames retain the binding identity.
- Provider outages leave canonical Assign editing available. Use the status,
  pending count and recent run history to diagnose delayed synchronization.

Assign stores `.assign.yaml` and `.assign/documents.json` inside the configured
documentation root. The manifest maps paths to portable identities; do not edit
it casually. Markdown remains usable without those files, but a clean import
without the manifest creates new Assign identities.

## Frontmatter and conflicts

Unknown frontmatter is preserved byte-for-byte while the Markdown body is
edited through Assign's supported Markdown profile. Frontmatter does not change
fixed Assign Document properties in the first release.

When Git and Assign both change from the last common version, synchronization
stops for that Document. The settings page offers **Keep Assign**, **Use Git**
and a merged-Markdown action. Each choice rechecks the current Git head and
Document revision; a stale choice is rejected instead of overwriting newer work.

Pausing or disconnecting stops future repository writes but does not delete
Documents. A Markdown mirror does not include comments, access controls, Tasks,
complete revision history, collaboration updates, credentials or secrets, so it
is not a replacement for Workspace backups.

## HTTP API

The public API exposes the connection at
`/api/v1/workspaces/{workspace_id}/knowledge-repository`, with explicit import,
sync, bounded run-history, conflict-list and conflict-resolution operations.
Use the generated SDK for the current request and response schemas. New Git-sync
management tools are not currently exposed through Assign MCP; existing
authorized Document and Knowledge retrieval remains available there.

Connection setup is naturally idempotent when the same active configuration is
submitted again. State changes use the repository revision, and sync/conflict
operations recheck the current Document revision and Git head. If a mutation's
HTTP result is lost, read the repository, run history or conflict list before
retrying; this first contract does not replay mutation responses by an
idempotency key.
