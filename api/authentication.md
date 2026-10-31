---
description: Choose an API credential, make a bearer-authenticated request, and recover from expiry, rotation or revoked access.
---

# Authentication

Use a personal API token for a script you run as yourself. For an AI assistant, follow
[Connect an MCP client](../mcp/connect). Sign in to Assign to manage your Account and credentials.

## Product API credentials <Badge type="warning" text="Awaiting deployment" />

The rewritten v1 integration flow below is awaiting deployment. Check the operation's
[availability](./conventions#availability) before using it.

| Your integration | Credential | Access belongs to |
| --- | --- | --- |
| A personal script or local automation | Personal API token | You, within one Workspace |
| An unattended Workspace service | Product service-account credential | An explicitly owned service account |
| An application acting for a person | Product OAuth access token, with Authorization Code and PKCE S256 | The person who consented, within the selected Workspace |
| A registered confidential application acting autonomously | Client-credentials access token | Its bound service account and Workspace |

Choose only the scopes the integration needs. A Task read needs `tasks:read`; `tasks:write`
does not include read access. Discovery may also need the relevant Workspace or Project read
scope. Scopes limit access further: current membership, role, Project visibility and resource
permissions still apply. Changing an ID or requesting a wider scope cannot bypass them.

Product credentials, Assign client credentials and MCP credentials have different audiences.
Send a credential only to the service and operations it was issued for. An MCP service
credential is not a product service-account credential.

### Make your first request

1. Open **Account settings → Security** in Assign and create a personal API token for the
   Workspace you want to read. Select the available read access needed for Tasks.
2. Copy the secret once into your secret manager. Make it available to this process as
   `ASSIGN_TOKEN`; keep it out of shell history, source files and logs. Save the bare secret;
   the request below adds the `Bearer` prefix.
3. Obtain the immutable Workspace ID from the Workspace administrator and set
   `ASSIGN_WORKSPACE_ID`. A Workspace name or URL slug is not this ID.

```sh
curl "https://api.assign.so/api/v1/workspaces/$ASSIGN_WORKSPACE_ID/tasks?limit=1" \
  -H "Authorization: Bearer $ASSIGN_TOKEN" \
  -H "Accept: application/json"
```

A successful request returns `200` and a bounded JSON page. This illustrative response is a
valid empty page:

```json
{
  "data": [],
  "next_cursor": null,
  "included": {
    "assignees": [],
    "statuses": [],
    "milestones": [],
    "labels": [],
    "completeness": "complete",
    "unavailable": []
  }
}
```

Follow `next_cursor` until it is `null`, including after a short or empty page. The endpoint
reference defines the response headers and filters. Keep the same credential and selectors
when continuing.

### Expiry, rotation and revocation

New personal and product service credentials default to 30 days and have a 90-day maximum.
Use the expiry shown when the credential is issued. Older credentials can retain their
original lifetime; replace them when prompted instead of assuming the new limit applies.
Personal credentials stay with their human owner and cannot be transferred. Give unattended
work an owned service account with an administrator responsible for its access and offboarding.

Rotation normally ends the old credential's validity immediately. If you explicitly choose
overlap, it lasts at most 24 hours. Deploy the replacement during that window, then remove the
old secret from your service. Emergency revocation has no overlap. Narrowing can remove scopes;
it cannot add scopes, change the Workspace, transfer ownership or extend expiry.

A secret is shown only on its initial successful issuance or rotation. If that response is
lost, inspect the credential or operation metadata before taking another action. Recovery
cannot reveal the secret again. Revoke an unusable replacement and explicitly create another;
do not keep retrying issuance to obtain a secret.

Revocation prevents subsequent authorized requests. It does not undo work already committed.
A token also stops authorizing work when its owner or service account loses the required access.
Re-enabling an account does not restore a revoked credential.

### Keep credentials out of redirects

Send product bearer tokens only to the configured API origin over HTTPS, in `Authorization`.
Do not put them in a URL, browser storage or a support message. For an upload or download URL,
use only the headers supplied for that storage request. Never forward an Assign bearer token
to storage or another redirect destination.

### Recover from an access error

| Response | Next action |
| --- | --- |
| `400 invalid_request` | Send exactly one `Authorization: Bearer` header. Remove credentials from the query and body. |
| `401 authentication_required` | Check the configured environment, audience and saved token. Expired, revoked or invalid credentials can share this response; inspect safe credential metadata or authorize again. |
| `403 insufficient_scope` | Compare the operation's scopes with the issued grant. Obtain approved access; refresh cannot widen a grant. Current role and resource permissions still apply. |
| `404` | Check the Workspace and immutable resource ID. The resource may be unavailable to you; do not probe other IDs to work around access controls. |

Read the `WWW-Authenticate` challenge when present. Keep the status, safe error code and request
ID for troubleshooting, with the credential removed. If a secret was exposed, revoke it
immediately and issue a replacement through the authorized setup flow. Repeating a request
with another person's credential is not a recovery step.

## Public and application interfaces

The product REST reference describes supported integration operations; public does not mean
anonymous. [Product OAuth](./oauth) and [MCP](../mcp/) have their own protocol endpoints,
credential audiences and error formats. Account sign-in and security management are provided
by the Assign application. Provider callbacks and private application interfaces are not a
substitute for a documented integration operation.

### The same Task read across clients <Badge type="warning" text="Upcoming" />

The canonical Task collection operation is `listWorkspaceTasks`,
`GET /api/v1/workspaces/{workspace_id}/tasks`. Client migrations use that resource contract;
check each client's availability before relying on the new flow.

| Consumer | Credential or connection | Task-read contract |
| --- | --- | --- |
| Web | Sign in to Assign; the application manages access | `listWorkspaceTasks` |
| Mobile | The registered Assign app manages its native sign-in | `listWorkspaceTasks` |
| Desktop | Its hosted Assign view or registered native connection | `listWorkspaceTasks` |
| CLI | `assign login`, or an explicitly configured personal token | `listWorkspaceTasks` |
| MCP | Its own OAuth or MCP service credential; use `task_list` | The authorized collection semantics of `listWorkspaceTasks`, exposed as an MCP tool |
| Public HTTP and SDK clients | A product credential from the chooser above | `listWorkspaceTasks` |
| IDE plugins | Their registered sign-in and operating-system credential store | `listWorkspaceTasks` |

MCP tools use the MCP protocol. Do not send a product token to MCP or treat an MCP tool as a
REST endpoint. A client name does not grant extra Workspace or Project access.

## Browser sessions

Sign in at [assign.so](https://assign.so). Assign manages the browser session. Integrations
use the bearer flow above; see [authentication migration](./versioning#authentication-migration)
when updating an existing client.

## Password sign-in

Use Assign's sign-in and password-reset screens. Passwords are 12 to 128 characters and must
pass the compromised-password check. Resetting a password signs out every session; changing it
while signed in keeps the current session and signs out the others. Verify your email so you
can recover the Account. A password-reset link expires after four hours.

### Register from an invitation <Badge type="warning" text="Awaiting deployment" />

Open the invitation in the browser and sign up with the invited email address. A valid
invitation verifies that address. Complete invitation acceptance after signing in to join the
Workspace. An invalid or expired invitation cannot create membership.

## Second factor

Set up an authenticator under **Account settings → Security**. Save the ten single-use recovery
codes when shown. Generating a new set invalidates the old codes. A sign-in challenge lasts
five minutes and allows five wrong codes; start sign-in again if it expires. Keep recovery
codes in a secure place separate from the device running your authenticator.

## Passkeys

Manage passkeys in **Account settings → Passkeys** where available. A passkey sign-in does not
ask for an additional authenticator code. An Account can hold up to ten passkeys. A disabled
passkey cannot be re-enabled; remove it and register a replacement. Assign prevents removal
of your last usable sign-in method.

## Sign in with a provider

Choose Google, GitHub or Apple on the Assign sign-in screen. After the first link, your Account
stays with that provider identity even if you change your email at the provider. Manage these
links under **Account settings → Connected accounts**.

### Continue to a Task after sign-in <Badge type="warning" text="Awaiting deployment" />

Open the Task link and sign in when asked. Supported Assign links return you to that Task.
External return destinations are ignored. If sign-in succeeds but the Workspace cannot open,
use **Retry** without entering your credentials again.

## Switch Workspace

Use Assign's Workspace chooser. Existing product credentials remain bound to the Workspace
selected when issued; switching the app's Workspace does not retarget a script's token.

## Developer-client tokens

Use [`assign login`](../cli/authentication) for the CLI and the sign-in action provided by your
IDE plugin. Their registered browser flows use PKCE and their own credentials. Let the client
manage renewal and its operating-system credential store. For MCP setup, use
[`assign mcp setup`](../cli/mcp), which creates a separate MCP connection.

## Native mobile OAuth

Sign in through the Assign mobile app. Its registered native credential is distinct from a
personal token and an MCP credential. [Native availability](./conventions#availability) is
separate from product API availability; a native sign-in does not authorize an external app
to copy or reuse the mobile credential.

## Post-login destinations

Assign opens a Workspace you can access, or Workspace creation for an Account without one.
Use an authorized Assign Task or invitation link to continue to that destination after sign-in.
