---
description: Choose a product credential, obtain your Workspace ID, and read one bounded Task page with HTTP, TypeScript or PHP.
---

# Make your first API request <Badge type="warning" text="Awaiting deployment" />

Read at most one Task from a Workspace you can access. The rewritten v1 flow is awaiting
deployment; check [availability](./conventions#availability) before using it. Start with HTTP.
The SDK examples below describe the same operation for packages that support this contract.

## 1. Obtain a product credential

Choose the path that matches who will use your integration. All three paths end with a bare
product bearer token in `ASSIGN_TOKEN`, kept in your secret manager and supplied only to the
process making the request. Do not paste a token into source code, shell history or logs.

### Personal script

Sign in to Assign and open **Account settings → Access tokens**. Create a named token for the
Workspace you want to read, selecting `tasks:read` when the rewritten scope policy is available.
Complete any requested sign-in confirmation. Copy the secret once into your secret manager;
the credential list cannot show it again. Use the expiry displayed at issuance.

An existing token may use an earlier scope policy. Follow its migration notice rather than
assuming `tasks:write` includes read access. See [token lifecycle](./authentication#expiry-rotation-and-revocation)
for replacement, rotation and exposure recovery.

### Workspace service

Ask a Workspace owner or admin to provision an owned product service account and issue a
credential with `tasks:read`, when service-account setup is available. Assign an administrator
responsible for its access and offboarding. Store the one-time secret in the service's secret
manager and supply it as `ASSIGN_TOKEN`. An MCP service credential cannot substitute for it.

A registered confidential application with an authorized service-account binding can instead
use the [client-credentials flow](./oauth#run-as-a-service-account). Save the response's
`access_token` as `ASSIGN_TOKEN`; use `expires_in` to replace it before expiry. This grant has
no refresh token. If your Workspace has no supported service-account setup, wait for that
feature before running unattended work.

### Application acting for a person

Complete [product OAuth registration and discovery](./oauth#register-and-discover), then the
[Authorization Code and PKCE flow](./oauth#obtain-delegated-access) for the selected Workspace
and `tasks:read`. Your application needs its registered client ID and redirect URI before it
can start. Save the returned `access_token` as `ASSIGN_TOKEN` and retain the refresh token
securely for [renewal](./oauth#renew-delegated-access). A client secret, authorization code,
refresh token or MCP token is not the bearer token for a Task request.

## 2. Set the Workspace ID

Obtain the immutable Workspace ID from the administrator arranging your integration and set
`ASSIGN_WORKSPACE_ID` in the same process. Confirm that it is the Workspace selected for the
credential or OAuth grant. A Workspace name, URL slug or Project key is not this ID. Switching
Workspace in the app does not retarget a saved token. Stop if you cannot obtain the ID;
do not inspect browser cookies or call undocumented setup endpoints.

The read below needs no Project or Task ID. Scopes and current membership, role, Project
visibility and resource permissions all apply; a scope alone does not grant access.

## 3. Read one Task page

All variants use [listWorkspaceTasks](./reference/operations/listworkspacetasks):
`GET /api/v1/workspaces/{workspace_id}/tasks?limit=1`. Run one variant once. Do not enable
verbose HTTP logging or print the authorization header when troubleshooting.

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

This example targets `@assignso/sdk` **1.0.0-rc.9** and Node.js 18 or newer. That package version
is not currently available from the public npm registry. Use HTTP until a package supporting
this operation is available; an older installed version may expose a different contract.

In a Node.js TypeScript project with the supported SDK installed, save this as `first-read.ts`
and compile it with your project's TypeScript configuration. The SDK's `basePath` is the origin;
the generated method adds `/api/v1`.

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

The PHP SDK is not yet published on Packagist. Use HTTP until a supported package is available.
This example uses the generated `Assign\Sdk` public interface for the rewritten v1 contract,
PHP 8.1 or newer and a Composer project with the SDK installed. Save it as `first-read.php`
beside the project's `vendor/` directory and run `php first-read.php` after supplying the same
two environment variables.

```php
<?php
require __DIR__ . '/vendor/autoload.php';

use Assign\Sdk\Api\TasksApi;
use Assign\Sdk\ApiException;
use Assign\Sdk\Configuration;

$token = getenv('ASSIGN_TOKEN');
$workspaceId = getenv('ASSIGN_WORKSPACE_ID');
if (!$token || !$workspaceId) {
    fwrite(STDERR, "Set ASSIGN_TOKEN and ASSIGN_WORKSPACE_ID\n");
    exit(1);
}

$config = (new Configuration())
    ->setHost('https://api.assign.so')
    ->setAccessToken($token);
$api = new TasksApi(null, $config);
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

This tutorial stops after one page. To continue later, follow every non-null `next_cursor`,
even after a short or empty page, with the same credential and selectors. See
[pagination](./pagination) for cursor handling and coverage limits. An empty page alone
does not prove that a complete scan found no Tasks.

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

Set `ASSIGN_PROJECT_ID` from a returned Task's `project_id` only after confirming the Project
is suitable. If the page is empty or you need another Project, request `projects:read` and
use [listWorkspaceProjects](./reference/operations/listworkspaceprojects) in the same Workspace
to select an accessible Project's immutable `id`. A Project name or key cannot replace it.

Follow the [create/read/update Task recipe](./tasks#create), beginning
with [createTask](./reference/operations/createtask). It explains the request body, one stable
idempotency key per creation intent, the expected `201`, interrupted-response recovery and
verification using the returned Task ID. Check the result before creating again. Remove or
archive example work through Assign when you finish; do not modify unrelated Tasks.
