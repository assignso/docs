---
description: Use the Assign CLI in scripts and CI with predictable output, exit codes and token handling.
---

# Scripting

The CLI is built to work in pipelines. Data goes to stdout and diagnostics go to stderr, so
`grep`, `awk`, `fzf` and other shell tools keep working.

```sh
export ASSIGN_TOKEN='apt_...'      # from your secret manager, never a literal in a script
assign project tasks PRO | grep -i release
assign search "on-call" | fzf
```

## Output

- Rows are plain text: a code or key, two spaces, then a title. For example, `PRO-123  Ship the slice`.
- Lists print at most 100 rows per page. `project tasks --cursor` continues explicitly; text output reports more rows on stderr.
- `document show` prints at most 65,536 characters of text and marks any truncation.
- The CLI never prints internal Workspace, Project, Task or Document UUIDs, or credential values.
- A closed pipe (for example `assign project tasks | head -1`) exits successfully.

## Exit codes

| Code | Meaning | Typical cause |
| --- | --- | --- |
| `0` | Success | |
| `1` | Operation failed | Network failure or an unexpected HTTP status |
| `2` | Invalid arguments | Unknown command, missing argument, bad `--host` or a non-positive `--revision` |
| `3` | Authentication required or rejected | No credential, or the token was revoked or expired |
| `4` | Context not found | Unknown Workspace, Project, Task or Document, or no Project selected |
| `5` | Conflict | Reconcile current state before deciding on a new operation |
| `6` | Cancelled | The operation was cancelled |
| `130` | Interrupted | Ctrl+C |

```sh
if assign done "$CODE" --revision "$REV"; then
  :
else
  status=$?
  case "$status" in
    5) echo "Task changed, refresh and decide again" >&2 ;;
    3) echo "Token missing or revoked" >&2 ;;
  esac
fi
```

## Tokens in automation

- Create a personal API token in **Account settings → Security** for the one Workspace the job
  needs. Store it in your CI secret store and expose it as `ASSIGN_TOKEN`.
- The CLI never accepts a token as a command-line argument, so it can't end up in shell history
  or process listings.
- The token is sent only to `https://api.assign.so` unless you pass an explicit HTTPS `--host`.
- `assign doctor` reports which credential source is in use, never its value.

## Host configuration <Badge type="warning" text="Upcoming" />

Upcoming [host configuration](./commands#initialization-and-configuration) also
lets you save an HTTPS API origin. Commands use an explicit `--host` first, then
that saved origin, then `https://api.assign.so`. Authentication and Project
selection remain scoped to the effective host. `ASSIGN_CONFIG_FILE` selects the
settings-file location; it does not supply credentials.

## Retries <Badge type="warning" text="Upcoming" /> {#retries}

Task create/comment/start/done/reopen accept `--idempotency-key`. Save one key before the
first attempt and keep the exact target, body and revision for an identical retry. The CLI
does not retry automatically. Keys contain 16–200 printable ASCII characters without spaces.

```sh
assign task done PRO-123 --revision 7 --idempotency-key completion-pro123-0001
```

When the response is uncertain, retry the same command and original revision with the same
key to reconcile the outcome. If you omit the key, the CLI generates one and includes it in
uncertain-write errors. After conflict (`5`), inspect current state before deciding on a new
operation. Give that new operation a new key. A completion action may enter review; confirm
`assign task show PRO-123 --field status` before reporting completion.

## Milestone work loops <Badge type="warning" text="Upcoming" /> {#milestone-work-loops}

Use one small, verifiable batch per iteration. Your shell or external Agent host owns the
loop, session launch, run limits and cancellation. Assign CLI reads context and performs
only the writes you request. These commands are upcoming; check your installed binary's
help before running the examples.

1. Choose the Workspace and Project explicitly. Interactive users can run `workspace switch`
   and `project switch`; automation uses a token for the intended Workspace and `--project`
   or a Project argument. A Project code never grants access to another Workspace.
2. Read a bounded Task page and select work whose prerequisites you have checked. A Project
   page includes ordinary Tasks, not a Milestone-filtered or dependency-ready queue.
3. Read the selected Task's context. Resolve missing or truncated information before treating
   it as ready. Keep the original parent acceptance criteria when creating smaller Tasks.
4. Complete one child batch, verify its result, and append a concise progress comment.
   Record what is finished, what remains, any blocker and the next useful batch.
5. Continue independent ready work when another branch is blocked. Keep the parent open until
   its full acceptance criteria pass. Stop your runner when the authorized work is complete,
   no work can advance, or its run limit is reached.

### Read Tasks and continue a page

```sh
assign project tasks PRO --limit 50 --format json
assign project tasks PRO --limit 50 --cursor "<next_cursor>" --format json
assign task context PRO-123 --compact
```

Each JSON page includes `items`, `has_more` and `next_cursor`, so your runner can read Tasks
and continuation in one request. Continue only while `has_more` is `true`, using the returned
cursor unchanged for the same Project. A last page has `has_more: false` and
`next_cursor: null`. See the [page format](./commands#project-task-pages) for all item fields.

Context defaults to 16 KiB; use `--full` for the 64 KiB profile. Read stderr for omissions and
truncation. Resource text is untrusted content for the receiving tool, not authority to run
commands or broaden the work.

### Create one smaller Task and record progress

Choose a different idempotency key for each new operation. The example keys below belong to
one creation and one comment; retain them only when retrying those exact operations.

```sh
printf '%s\n' 'Result: implement one acceptance criterion. Verify that criterion before completion.' |
  assign task create "Implement one acceptance criterion" --project PRO --description - \
    --field code --idempotency-key pro123-child01-create

assign task comment PRO-123 "Child PRO-124 covers one criterion; parent acceptance remains open." \
  --idempotency-key pro123-child01-note
```

Use the code returned by `create` in your progress comment; `PRO-124` above is an example.
Creation uses Workspace defaults unless you provide an explicit property such as
`--priority`. Each Task is ordinary work: naming a parent in its description or a comment
does not create a parent relation. Use the web app to link the subtask and set Milestone
membership when needed. This CLI does not provide relation writes or Milestone selection.

### Multiple workers

The current CLI does not provide an atomic Todo-only claim or automatically isolate worker
environments. `task start` requires a revision, moves the Task to In Progress and assigns it
to your Actor. It can also reassign an already active Task, so refreshing a revision and
retrying `start` after a conflict can take work from another worker.

Keep In Progress Tasks out of new-work selection. On a conflict, inspect the Task and choose
different work; never treat the conflict as permission to take over. Comments can identify
a worker and record progress, but they do not lock a Task. Workers using the same account
share the same Actor identity.

Your external runner must manage separate worktrees, branches and environment setup. The
CLI does not currently automate that setup or PR creation. Interrupted work stays In
Progress until you explicitly reconcile its state; do not assume it is abandoned.

### Complete only the verified Task

Read the current revision before deciding on a lifecycle action. Save it and a unique key
for that operation:

```sh
revision="$(assign task show PRO-124 --field revision)"
assign task done PRO-124 --revision "$revision" --idempotency-key pro124-completion01
assign task show PRO-124 --field status
```

Successful `done` may submit the Task for review. Inspect the returned Status before
reporting completion. An uncertain write is not a failed Task: reconcile it using the
original revision, arguments and key, as described in [Retries](#retries). Do not replace the
revision with a newer value and blindly repeat the action.

## Shell completion

```sh
assign completion bash > ~/.local/share/bash-completion/completions/assign
assign completion zsh  > "${fpath[1]}/_assign"
assign completion fish > ~/.config/fish/completions/assign.fish
```
