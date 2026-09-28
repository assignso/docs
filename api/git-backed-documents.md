---
description: Mirror a Workspace's Documents to a Git repository as Markdown, with sync modes, conflict handling and API endpoints.
---

# Git-backed Documents

A Git-backed Workspace mirrors its Assign Documents to one repository as readable Markdown. Assign
stays the canonical copy. Synchronization runs in the background and never blocks an editor save.

## Connect a repository

Open **Workspace settings → Knowledge → Git Repository** and choose **Use existing repository**. Pick
an active GitHub connection and repository, a branch, a documentation root and a sync mode, then
confirm the reader disclosure. Creating a repository from Assign isn't available yet.

The connection uses only repository access already granted under Integrations. Anyone who can read
the repository can read every synchronized Document, including frontmatter, so don't connect a
repository whose readers shouldn't see that content.

## How sync works

- Edits in Assign are batched into a direct commit to the branch. Sync never force-pushes or opens a
  pull request.
- Edits made during an export wait for the next pass.
- **Sync now** starts an immediate bounded reconciliation, still subject to permission, conflict and
  rate limits.
- In bidirectional mode, verified pushes make Assign reread the branch and apply supported Markdown
  changes under the documentation root.
- Deleting a bound Markdown file archives its Document, and bringing the same file back restores it.
  Renames keep the binding.
- If the provider is down, Assign editing keeps working. The status, pending count and run history
  show what's delayed.

Assign writes `.assign.yaml` and `.assign/documents.json` in the documentation root to map paths to
Documents. Don't edit them by hand. Without them, an import creates new Documents.

## Frontmatter and conflicts

Unknown frontmatter is preserved exactly while the body is edited through Assign. Frontmatter doesn't
change Document properties.

If Git and Assign both changed a Document since the last sync, sync stops for it. Settings offers
**Keep Assign**, **Use Git** and a merged-Markdown option. Each choice rechecks the current Git head
and Document revision, and a stale choice is rejected rather than overwriting newer work.

Pausing or disconnecting stops repository writes but deletes nothing. The mirror leaves out
Comments, access controls, Tasks, full revision history, collaboration data and secrets, so it's not
a backup.

## HTTP API

The connection is at `/api/v1/workspaces/{workspace_id}/knowledge-repository`, with operations for
import, sync, run history and conflict listing and resolution. The
[OpenAPI document](/openapi.yaml) has the schemas. MCP doesn't expose Git sync management, but
Document and Knowledge retrieval works there as usual.

Submitting the same active connection again is safe. State changes use the repository revision, and
sync and conflict operations recheck the Document revision and Git head. Mutations aren't replayed by
idempotency key, so if a response is lost, read the repository, run history or conflict list before
retrying.

Limits: 2,000 eligible files, 20 MiB total and 1 MiB per file when reading a repository, and 20 MiB of
Documents and frontmatter per sync.
