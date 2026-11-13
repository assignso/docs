---
description: Get a product credential and Workspace ID, read one Task page with HTTP, TypeScript or PHP, and create a Task if authorized.
---

# Make your first API request <Badge type="warning" text="Awaiting deployment" />

Read at most one Task from a Workspace you can access. The rewritten v1 flow is awaiting
deployment. Check [availability](./conventions#availability) before sending requests.
Start with HTTP, or use a matching SDK artifact if you have one.

## 1. Obtain a product credential

Choose the path that matches who will use your integration. All three paths end with a bare
product bearer token in `ASSIGN_TOKEN`, kept in your secret manager and supplied only to the
process making the request. Do not paste a token into source code, shell history or logs.

### Personal script

Sign in to Assign and select the Workspace you want to read. Open
**Account settings → Access tokens**, name the token, and select **Read Assign data**.
Complete any requested sign-in confirmation and check that the issued scopes include
`tasks:read`. See [what the form grants](./account#personal-api-tokens). Copy the one-time
secret to your secret manager and use the expiry shown at issuance.

An existing token may use an earlier scope policy. Follow its migration notice rather than
assuming `tasks:write` includes read access. See [token lifecycle](./authentication#expiry-rotation-and-revocation)
for replacement, rotation and exposure recovery.

### Workspace service

When service-account setup is available, a Workspace owner or admin opens
**Workspace settings → Service accounts** in the intended Workspace. Create or select an owned
service account and issue a named credential with `tasks:read` and an expiry. Assign an
administrator responsible for its access and offboarding. Store the one-time product secret
in the service's secret manager and supply it as `ASSIGN_TOKEN`.

A registered confidential application with an authorized service-account binding can use the
[client-credentials flow](./oauth#run-as-a-service-account). Request `tasks:read` within that
binding's approved scopes. Save the response's
`access_token` as `ASSIGN_TOKEN`; use `expires_in` to replace it before expiry. This grant has
no refresh token. If your Workspace has no supported service-account setup, wait for that
feature before running unattended work.

### Application acting for a person

Use [Copy the Workspace ID](./account#copy-workspace-id) before starting OAuth. Arrange
[product OAuth registration](./oauth#register-and-discover) with your application's administrator.
With the registered client ID and redirect URI, send the person to Assign to approve the
Workspace and `tasks:read` using [Authorization Code with PKCE](./oauth#obtain-delegated-access).
After the code exchange, supply the returned `access_token` as `ASSIGN_TOKEN`. Store the
refresh token separately for [renewal](./oauth#renew-delegated-access).

## 2. Set the Workspace ID

Follow [Copy the Workspace ID](./account#copy-workspace-id) for the selected Workspace.
If an administrator is arranging your integration, ask them for that same immutable ID.
Set `ASSIGN_WORKSPACE_ID` in the process making the request and confirm that it matches the
credential or OAuth grant.
A Workspace name, URL slug or Project key is not this ID. Switching Workspace in the app does
not retarget a saved token. Stop if you cannot obtain the ID; do not inspect browser cookies
or call undocumented setup endpoints.

### Check the credential

Confirm the token's Workspace and effective scopes with
[`getAuthContext`](./reference/operations/getauthcontext).

```http
GET /api/v1/auth-context
Authorization: Bearer <token>
Accept: application/json
```

Replace `<token>` with the token from step 1. A `200 OK` response identifies the credential's
`workspace_id` and `effective_scopes`. Compare the ID with `ASSIGN_WORKSPACE_ID`
and check for `tasks:read`. If the ID differs, obtain a credential for the intended
Workspace. If you get a `401`, check the token's environment, expiry and revocation
before trying again. Keep the `Assign-Request-ID` response header for troubleshooting.

The Task read below needs no Project or Task ID. Assign checks current membership, role,
Project visibility and resource permissions when you send it.

## 3. Read one Task page

All variants call [listWorkspaceTasks](./reference/operations/listworkspacetasks) with
`GET /api/v1/workspaces/{workspace_id}/tasks?limit=1`. Each sends the product token as
`Authorization: Bearer`. Run one variant once. Keep the authorization header out of
troubleshooting logs by leaving verbose HTTP logging off.

### HTTP

With `curl` installed and both variables supplied from the setup above:

```sh
curl --include --get \
  "https://api.assign.so/api/v1/workspaces/$ASSIGN_WORKSPACE_ID/tasks" \
  --data-urlencode "limit=1" \
  -H "Authorization: Bearer $ASSIGN_TOKEN" \
  -H "Accept: application/json"
```

### TypeScript <Badge type="warning" text="Upcoming" />

Use Node.js 18 or newer and the `@assignso/sdk` version pinned in the
[TypeScript source download](#run-the-complete-workflow). If you have the matching
unreleased artifact, follow the download's installation instructions. Use HTTP if you need
to proceed without the SDK.

Save this as `first-read.ts` in a TypeScript project with the SDK installed and compile it
with your project's TypeScript configuration. Set `basePath` to the API origin. The SDK method
adds `/api/v1`.

```ts
import { Configuration, ResponseError, TasksApi } from '@assignso/sdk';

async function main() {
  const token = process.env.ASSIGN_TOKEN;
  const workspaceId = process.env.ASSIGN_WORKSPACE_ID;
  if (!token || !workspaceId) throw new Error('Set ASSIGN_TOKEN and ASSIGN_WORKSPACE_ID');

  const api = new TasksApi(new Configuration({
    basePath: 'https://api.assign.so',
    accessToken: token,
  }));
  const response = await api.listWorkspaceTasksRaw({ workspaceId, limit: 1 });
  const page = await response.value();
  console.log({ status: response.raw.status, returned: page.data.length,
    hasNextPage: page.nextCursor !== null });
}

main().catch((error: unknown) => {
  if (error instanceof ResponseError) console.error('HTTP status:', error.response.status);
  console.error('Task read failed. Check the credential and Workspace ID.');
  process.exitCode = 1;
});
```

### PHP <Badge type="warning" text="Upcoming" />

Use PHP 8.1 or newer, Composer and the `assignso/php-sdk` version pinned in the
[PHP source download](#run-the-complete-workflow). If you have the matching unreleased SDK
artifact, follow the download's installation instructions. Use HTTP if you need to proceed
without the SDK.

Save this as `first-read.php` beside the Composer project's `vendor/` directory. Supply the
same two environment variables and run `php first-read.php`.

```php
<?php
require __DIR__ . '/vendor/autoload.php';

use Assign\Sdk\Api\TasksApi;
use Assign\Sdk\ApiException;
use Assign\Sdk\Configuration;
use Assign\Sdk\ProductClient;

$token = getenv('ASSIGN_TOKEN');
$workspaceId = getenv('ASSIGN_WORKSPACE_ID');
if (!$token || !$workspaceId) {
    fwrite(STDERR, "Set ASSIGN_TOKEN and ASSIGN_WORKSPACE_ID\n");
    exit(1);
}

$origin = 'https://api.assign.so';
$config = (new Configuration())->setHost($origin);
$client = ProductClient::create(static fn(): string => $token, $origin);
$api = new TasksApi($client, $config);
try {
    [$page, $status] = $api->listWorkspaceTasksWithHttpInfo(
        workspace_id: $workspaceId,
        limit: 1,
    );
    echo json_encode([
        'status' => $status,
        'returned' => count($page->getData()),
        'has_next_page' => $page->getNextCursor() !== null,
    ], JSON_THROW_ON_ERROR), PHP_EOL;
} catch (ApiException $error) {
    fwrite(STDERR, 'Task read failed with HTTP status ' . $error->getCode() . PHP_EOL);
    exit(1);
}
```

## 4. Interpret the result

Expect `200` with a JSON page. HTTP returns snake-case fields such as `next_cursor`;
TypeScript exposes `nextCursor`, and PHP exposes `getNextCursor()`. The SDK examples print
only the status, returned row count and whether another page is available.
The HTTP example prints response headers and Task data. View the response locally. When
reporting a problem, share the status and request ID without posting the Task data or cursor.

This illustrative response is a valid empty page:

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

For a nonempty page, each row's `id` is the immutable Task ID and `project_id` is its Project
ID. Save IDs only for resources your integration needs. A row is a list projection; use
[getTask](./reference/operations/gettask) for full Task content. The collection's `ETag`, when
returned, cannot serve as the `If-Match` value for editing a Task.

This tutorial stops after one page. To continue later, follow each non-null `next_cursor`,
even after a short or empty page, with the same credential and selectors. A null cursor ends
the traversal. Check [coverage and pagination](./pagination) before treating the result as
complete. Keep decimal identifiers and revisions as strings to preserve their exact values.

If the request fails, keep the HTTP status, safe error code and request ID with the token
removed. For `401`, check environment, audience, expiry and revocation. For `403`, compare the
issued scopes and current access with the operation. For `404`, confirm the Workspace ID and
membership. See [access-error recovery](./authentication#recover-from-an-access-error).
Do not repeat a failed request with another person's credential.

## 5. Make an authorized write

Creating a Task changes shared Workspace data and can notify others. Use a Project approved
for integration examples. A read-only credential cannot create a Task. Obtain a separate
credential or fresh OAuth consent with both `tasks:read` and `tasks:write` before continuing;
refresh and narrowing cannot expand the original grant.

In the retained token form, select both **Read Assign data** and **Create and change Assign
data**, then review the issued scopes. Those controls grant more than Task access. Product
OAuth applications request the explicit scopes described above.

### Find the Project and optional Status

If the Task page includes a row from your approved Project, use its `project_id`. Otherwise,
call [listWorkspaceProjects](./reference/operations/listworkspaceprojects) with `projects:read`
in the same Workspace. For example, use
`GET /api/v1/workspaces/{workspace_id}/projects?code=DEMO&limit=1` with your Workspace ID
and the approved Project key in place of `DEMO`. Set `ASSIGN_PROJECT_ID` to the Project's
immutable `data[].id` from the response. If the Project is missing or you cannot confirm you may create Tasks there,
ask a Workspace administrator to confirm access before continuing.

You can let Assign choose the default Status. To choose one explicitly, call
[listProjectStatuses](./reference/operations/listprojectstatuses) with `projects:read` and
the selected Project ID. Use the `data[].id` of a Status from that response as `status_id`
in the create body or set `ASSIGN_STATUS_ID` for the downloadable app. To continue either
lookup, pass the returned `next_cursor` as `cursor` with the same credential and query until
you find the ID or the response returns a null cursor.

### Create one Task and verify it

Follow the [Task create recipe](./tasks#create). Send `createTask` to
`POST /api/v1/projects/{project_id}/tasks` using the approved Project ID, the write credential
and a unique `Idempotency-Key` for this one Task. Save the key and exact JSON body before sending.

Expect `201 Created`. Save the returned Task's `id`, confirm its `project_id` matches the
approved Project, and use [getTask](./reference/operations/gettask) with the new Task ID to
verify the result. If the response is lost, follow
[uncertain-outcome recovery](./writes#recover-an-unknown-outcome) with the original key and body.
Clean up only the Task you created.

### Run the complete workflow

Each source download includes its setup instructions and exact SDK version in the
dependency manifest and lockfile.

- [Download the TypeScript Task app source](/examples/task-workflow/typescript.zip)
- [Download the PHP Task app source](/examples/task-workflow/php.zip)

Each app reads a bounded Task page, creates and edits one Task, recovers from a stale
validator, and moves the Task it created to the trash. The matching SDK artifacts are
unreleased. Running either app requires obtaining its SDK artifact separately.

Use the write-capable credential from step 5 as `ASSIGN_API_TOKEN` and its HTTPS API origin
as `ASSIGN_API_ORIGIN`. Use the Workspace ID from step 2 as `ASSIGN_WORKSPACE_ID`.
Use the [Project and Status lookups](#find-the-project-and-optional-status) to set
`ASSIGN_PROJECT_ID` and, if you want to choose a Status, `ASSIGN_STATUS_ID`.
The download's README explains how to recover an interrupted run and where the app stores
its recovery record.
