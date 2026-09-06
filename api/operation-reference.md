<!-- markdownlint-disable MD013 -->

# Supplemental API operation reference

This page is a navigation index for public operations whose detailed behavior
lives in a focused guide or in the machine-readable OpenAPI contract. It does
not replace the generated schemas. Unless a row says otherwise, use the
authentication, CSRF, pagination, conditional-request, idempotency, and error
rules in [API conventions](conventions.md) and inspect the OpenAPI operation ID
for the exact request and response shape.

Client-specific, callback, content-transfer, and private-connector operations
do not imply an ordinary web page. They are listed so API consumers can
distinguish an intentional machine-facing surface from an undocumented one.

## Agents, billing callbacks, and Workspace media

| Operation | Route | Notes |
| --- | --- | --- |
| `quarantineWorkspaceAgent` | `POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/quarantine` | Stops new Agent execution under the Workspace Agent administration rules. |
| `rollbackWorkspaceAgent` | `POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/rollback` | Restores the accepted prior Agent version when rollback is permitted. |
| `decideWorkspaceAgentApproval` | `POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs/{run_id}/actions/{action_id}/approvals/{approval_id}/decision` | Records the authorized approval decision for one pending Agent action. |
| `receiveStripeBillingWebhook` | `POST /api/v1/billing/webhooks/stripe` | Stripe-signed provider callback; browser and SDK callers must not invoke it. |
| `getWorkspaceIconContent` | `GET /api/v1/workspaces/{workspace_id}/icon/content` | Authorized content response for the current Workspace icon. |

## Knowledge and private Discuss

| Operation | Route |
| --- | --- |
| `answerWorkspaceKnowledge` | `GET /api/v1/workspaces/{workspace_id}/knowledge/answer` |
| `listDiscussMessages` / `sendDiscussMessage` | `GET` / `POST /api/v1/workspaces/{workspace_id}/discuss/messages` |
| `searchDiscussMessages` | `GET /api/v1/workspaces/{workspace_id}/discuss/messages/search` |
| `updateDiscussReadState` | `POST /api/v1/workspaces/{workspace_id}/discuss/read-state` |
| `getDiscussPreferences` / `updateDiscussPreferences` | `GET` / `PATCH /api/v1/workspaces/{workspace_id}/discuss/preferences` |
| `listDiscussReminders` / `createDiscussReminder` | `GET` / `POST /api/v1/workspaces/{workspace_id}/discuss/reminders` |
| `updateDiscussReminderState` | `PATCH /api/v1/workspaces/{workspace_id}/discuss/reminders/{reminder_id}` |

## Time tracking

Time entries are Workspace-authorized, revision-aware records. Corrections
preserve audit history; deletion voids rather than erases an entry. Totals and
timesheets are bounded projections and exports use the documented content type.

| Operation | Route |
| --- | --- |
| `getTimeTrackingPolicy` | `GET /api/v1/workspace/time-tracking` |
| `updateTimeTrackingPolicy` | `PATCH /api/v1/workspace/time-tracking` |
| `listTaskTimeEntries` | `GET /api/v1/tasks/{task_id}/time-entries` |
| `createTaskTimeEntry` | `POST /api/v1/tasks/{task_id}/time-entries` |
| `getTaskTimeTotals` | `GET /api/v1/tasks/{task_id}/time-totals` |
| `getProjectTimeTotals` | `GET /api/v1/projects/{project_id}/time-totals` |
| `updateTimeEntry` | `PATCH /api/v1/time-entries/{entry_id}` |
| `voidTimeEntry` | `DELETE /api/v1/time-entries/{entry_id}` |
| `getMyTimesheet` | `GET /api/v1/timesheets/me` |
| `exportMyTimesheet` | `GET /api/v1/timesheets/me/export` |

## CLI and native credential operations

CLI OAuth tokens and native mobile credentials are separate credential
families. Do not substitute them for browser cookies, personal API tokens, or
MCP credentials. Native mobile routes remain unavailable until their backend
release is explicitly documented.

| Operation | Route |
| --- | --- |
| `exchangeCliOAuthToken` | `POST /api/v1/cli/oauth/token` |
| `revokeNativeMobileCredential` | `DELETE /api/v1/me/mobile-credentials/{credential_id}` |
| `upsertCurrentNativePushDevice` | `PUT /api/v1/me/mobile-credentials/current/push-device` |
| `deleteCurrentNativePushDevice` | `DELETE /api/v1/me/mobile-credentials/current/push-device` |
| `getCurrentCliWorkspace` | `GET /api/v1/cli/workspace` |
| `switchCurrentCliWorkspace` | `PUT /api/v1/cli/workspace` |
| `listCliWorkspaces` | `GET /api/v1/cli/workspaces` |
| `listCliProjects` | `GET /api/v1/cli/projects` |
| `getCliProject` | `GET /api/v1/cli/projects/{project_code}` |
| `listCliProjectTasks` | `GET /api/v1/cli/projects/{project_code}/tasks` |
| `listCliDocuments` | `GET /api/v1/cli/documents` |
| `getCliDocument` | `GET /api/v1/cli/documents/{document_path}` |
| `getCliMyWork` | `GET /api/v1/cli/my-work` |
| `searchCliWorkspace` | `GET /api/v1/cli/search` |
| `startCliTask` | `POST /api/v1/cli/tasks/{task_code}/start` |
| `completeCliTask` | `POST /api/v1/cli/tasks/{task_code}/done` |
| `reopenCliTask` | `POST /api/v1/cli/tasks/{task_code}/reopen` |
| `getCliTaskContext` | `GET /api/v1/cli/tasks/{task_code}/context` |

## MCP service credentials

These browser-session administration operations manage Workspace-scoped MCP
service credentials. A creation response is the only time secret material may
be returned; list responses expose safe metadata only.

| Operation | Route |
| --- | --- |
| `listWorkspaceMcpServiceCredentials` | `GET /api/v1/workspaces/{workspace_id}/mcp-service-credentials` |
| `createWorkspaceMcpServiceCredential` | `POST /api/v1/workspaces/{workspace_id}/mcp-service-credentials` |
| `revokeWorkspaceMcpServiceCredential` | `DELETE /api/v1/workspaces/{workspace_id}/mcp-service-credentials/{credential_id}` |

## Integrations and private connectors

Private-connector request polling and completion are connector-authenticated
machine operations. Resource refresh is an authorized Workspace integration
mutation and follows the integration idempotency and audit contract.

| Operation | Route |
| --- | --- |
| `pollIntegrationPrivateConnector` | `GET /api/v1/integration-private-connectors/{connector_id}/requests/next` |
| `completeIntegrationPrivateConnectorRequest` | `POST /api/v1/integration-private-connectors/{connector_id}/requests/{request_id}/response` |
| `refreshIntegrationResources` | `POST /api/v1/integration-installations/{installation_id}/resources/refresh` |

## Comments and labels

Comment writes and label changes enforce live target visibility and Workspace
authorization. Label archival prevents future assignment without rewriting
historical audit evidence; replacement operates on the complete target label
set and uses the revision rules in the OpenAPI contract.

| Operation | Route |
| --- | --- |
| `listTaskComments` | `GET /api/v1/tasks/{task_id}/comments` |
| `createComment` | `POST /api/v1/tasks/{task_id}/comments` |
| `listWorkspaceLabelDefinitions` | `GET /api/v1/workspaces/{workspace_id}/label-definitions` |
| `createWorkspaceLabelDefinition` | `POST /api/v1/workspaces/{workspace_id}/label-definitions` |
| `listProjectLabelDefinitions` | `GET /api/v1/projects/{project_id}/label-definitions` |
| `createProjectLabelDefinition` | `POST /api/v1/projects/{project_id}/label-definitions` |
| `updateLabelDefinition` | `PATCH /api/v1/label-definitions/{label_id}` |
| `archiveLabelDefinition` | `DELETE /api/v1/label-definitions/{label_id}` |
| `listTargetLabelAssignments` | `GET /api/v1/{target_kind}/{target_id}/labels` |
| `replaceTargetLabels` | `PUT /api/v1/{target_kind}/{target_id}/labels` |

## Document content and attachments

Document content is a versioned rich-text resource. Attachment upload is a
reserve-transfer-complete workflow: reserve through Assign, transfer only to
the returned short-lived object URL, then complete or cancel. Download and
preview operations return short-lived authorization, not permanent public
object URLs.

| Operation | Route |
| --- | --- |
| `getDocumentContent` | `GET /api/v1/documents/{document_id}/content` |
| `replaceDocumentContent` | `PUT /api/v1/documents/{document_id}/content` |
| `reserveAttachmentUpload` | `POST /api/v1/attachment-uploads` |
| `completeAttachmentUpload` | `POST /api/v1/attachment-uploads/{upload_id}/complete` |
| `cancelAttachmentUpload` | `DELETE /api/v1/attachment-uploads/{upload_id}` |
| `getAttachment` | `GET /api/v1/attachments/{attachment_id}` |
| `deleteAttachment` | `DELETE /api/v1/attachments/{attachment_id}` |
| `authorizeAttachmentDownload` | `POST /api/v1/attachments/{attachment_id}/download` |
| `authorizeAttachmentPreview` | `POST /api/v1/attachments/{attachment_id}/preview` |
