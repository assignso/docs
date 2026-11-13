// Editorial labels only. Operation IDs, routes and contract descriptions stay unchanged.
const actionTitles = {
  getworkspaceiconcontent: "Download the Workspace icon",
  resolvelifecyclecompletiontarget: "Choose a completing lifecycle Status",
  listlifecycledefinitions: "List Workspace lifecycle definitions",
  applylifecyclemapping: "Apply a reviewed lifecycle mapping",
  previewlifecyclemapping: "Preview a lifecycle mapping",
  getlifecyclemigration: "Read a lifecycle migration job",
  retrylifecyclemigration: "Resume a failed lifecycle migration",
  listworkspacemcpservicecredentials: "List Workspace MCP service credentials",
  revokeworkspacemcpservicecredential: "Revoke a Workspace MCP service credential",
  getworkspacemilestonelifecycle: "Read the Workspace Milestone stages",
  updateworkspacemilestonelifecycle: "Configure Workspace Milestone stages",
  getworkspaceprojection: "Read a Workspace baseline or delta",
  listworkspacestatuses: "List Workspace Task Statuses",
  createworkspacestatus: "Create a Workspace Task Status",
  listlifecyclebehaviors: "List supported lifecycle behaviors",
  listworkspaceactivity: "Read Workspace Activity",
  listworkspacefeatures: "List Workspace features and their state",
  updateworkspacefeature: "Enable or disable a Workspace feature",
  clearworkspaceiconupload: "Remove the Workspace icon",
  setworkspaceiconupload: "Set the Workspace icon from an uploaded attachment",
  listworkspacewebhookendpoints: "List Workspace webhook endpoints",
  createwebhookendpoint: "Register a Task webhook receiver",
  getwebhookendpoint: "Read a webhook endpoint",
  updatewebhookendpointstate: "Pause, resume or revoke a webhook endpoint",
  listwebhookdeliveries: "List retained webhook deliveries",
  getwebhookdelivery: "Read a webhook delivery outcome",
  redeliverwebhookdelivery: "Replay a retained webhook delivery",
  rotatewebhookendpointsecret: "Rotate a webhook signing secret",
  createtimesheetexport: "Export your timesheet as a CSV snapshot",
  gettimesheetexport: "Download a timesheet CSV snapshot",
  getmytimesheet: "Read your personal timesheet",
  listworkspacetimeentries: "List recorded time for a Task",
  gettimetrackingpolicy: "Read the Workspace time-tracking policy",
  updatetimetrackingpolicy: "Change the Workspace time-tracking policy",
  listprojecttimebreakdown: "List Project time by Task or contributor",
  getprojecttimetotals: "Read Project time totals",
  createtasktimeentry: "Record time on a Task",
  gettasktimetotals: "Read Task time totals",
  voidtimeentry: "Void a time entry",
  updatetimeentry: "Correct a time entry",
  resolveworkspacemember: "Resolve an exact Workspace member",
  undooperationreceipt: "Undo a committed operation",
  getoperationreceipt: "Read an original operation receipt",
  createtaskresultset: "Capture a Task query result set",
  gettaskresultset: "Read an exact Task result-set version",
  listtasksavedviews: "List your saved Task views",
  createtasksavedview: "Save a personal Task query",
  deletetasksavedview: "Delete a saved Task view",
  updatetasksavedview: "Rename or change a saved Task view",
  createtaskselection: "Select Tasks from an immutable result set",
  gettaskselection: "Read an exact Task selection",
  getchangesetoperationresult: "Read terminal ChangeSet outcomes",
  createchangeset: "Propose a set of changes",
  applychangeset: "Apply a reviewed ChangeSet",
  getchangeset: "Read an exact ChangeSet version",
  createdocumentpatch: "Draft a Document change",
  getdocumentpatch: "Read an exact Document draft version",
  listtasksubscribers: "List a Task's current followers",
  gettasksubscription: "Read your Task subscription",
  followtask: "Follow a Task",
  unfollowtask: "Stop following a Task",
  mutetask: "Mute a Task",
  unmutetask: "Resume following a muted Task",
  listtaskparticipants: "List a Task's participants",
  listtaskrelations: "List a Task's relations",
  createtaskrelation: "Create a relation between Tasks",
  reopentask: "Reopen a completed Task",
  restoretask: "Restore an archived or trashed Task",
  starttask: "Start a Task and assign it to yourself",
  gettaskcontext: "Read a Task's bounded context",
  headtaskcontext: "Read Task context headers",
  listtaskdescriptionrevisions: "List a Task's description revisions",
  restoretaskdescriptionrevision: "Restore a Task's description revision",
  duplicatetask: "Duplicate a Task",
  movetask: "Move a Task within its workflow",
  createtask: "Create a Task in a Project",
  deletetaskrelation: "Delete a Task relation",
  updatetaskrelation: "Change a Task relation's type",
  trashtask: "Move a Task to trash",
  gettask: "Read a Task",
  updatetask: "Update a Task",
  movestatus: "Reorder a Task Status",
  listworkspacemilestones: "Find Workspace Milestones",
  getworkspaceprojectlifecyclepolicy: "Read the Workspace Project lifecycle policy",
  updateworkspaceprojectlifecyclepolicy: "Enable or disable Project lifecycle states",
  listworkspaceprojectstates: "List Workspace Project lifecycle states",
  createworkspaceprojectstate: "Create a Workspace Project lifecycle state",
  listtaskactivity: "Read a Task's Activity",
  archivetask: "Archive a Task",
  listtaskassignments: "Read a Task's assignment history",
  listtaskattachments: "List a Task's attachments",
  attachtaskattachment: "Attach a file to a Task",
  completetask: "Complete a Task",
  listprojecttaskattachments: "List files attached to a Project's Tasks",
  getstatus: "Read a Task Status",
  updatestatus: "Update a Task Status",
  archivestatus: "Archive an unused Task Status",
  archivestatusandreplace: "Replace a Task Status and archive it",
  previewstatuslifecyclechange: "Preview a Task Status lifecycle change",
  updateprojectmember: "Change a Project member's role",
  createmilestone: "Create a Project Milestone",
  moveproject: "Reorder a Project",
  getprojectoverview: "Read a Project overview",
  listprojectstatuses: "List a Project's Task Statuses",
  createprojectstatus: "Create a Project Task Status",
  attachprojectattachment: "Attach a file to a Project",
  getprojectcompletionpolicy: "Read a Project's completion policy",
  updateprojectcompletionpolicy: "Replace a Project's completion policy",
  listprojectmembers: "List a Project's members",
  addprojectmember: "Add a Project member",
  removeprojectmember: "Remove a Project member",
  getmilestone: "Read a Milestone and its progress",
  updatemilestone: "Update a Milestone",
  archivemilestone: "Archive a Milestone",
  updateprojectstate: "Rename or restore a Project state",
  archiveprojectstate: "Archive an unused Project state",
  archiveandreplaceprojectstate: "Replace an in-use Project state and archive it",
  getworkspacepersonprofilepicture: "Read a Workspace person's profile picture",
  getworkspacepersonprofile: "Read a Workspace person's profile",
  listworkspacepersonactivity: "List a person's visible Workspace Activity",
  getknowledgerepository: "Read the Workspace Documents repository",
  updateknowledgerepositorystate: "Pause or resume the Documents repository",
  connectknowledgerepository: "Connect a Documents repository",
  listknowledgerepositoryconflicts: "List open Document sync conflicts",
  resolveknowledgerepositoryconflict: "Queue a Document conflict resolution",
  importknowledgerepository: "Queue a repository Markdown import",
  listknowledgerepositorysyncruns: "List repository synchronization runs",
  getknowledgerepositorysyncrun: "Read a repository synchronization run",
  syncknowledgerepository: "Queue repository synchronization",
  listdocumentrevisions: "List a Document's revision history",
  comparedocumentrevisions: "Compare Document revisions",
  getdocumentrevision: "Read a Document revision",
  restoredocumentrevision: "Restore a Document revision",
  listworkspacedocuments: "Find Workspace Documents",
  createdocument: "Create a Document",
  createworkspaceagentrun: "Start a manual Agent run",
  getworkspaceagentrun: "Read an Agent run",
  listworkspaceagentrunactions: "Review an Agent run's actions",
  decideworkspaceagentapproval: "Approve or reject an Agent action",
  cancelworkspaceagentrun: "Request cancellation of an Agent run",
  listworkspaceagentrunoutputs: "Read an Agent run's outputs",
  removeworkspaceagent: "Remove a Workspace Agent",
  getworkspaceagent: "Read a Workspace Agent",
  updateworkspaceagent: "Replace an Agent configuration",
  quarantineworkspaceagent: "Quarantine a Workspace Agent",
  rollbackworkspaceagent: "Restore an Agent's prior definition",
  listworkspaceagentruns: "List an Agent's run history",
  listworkspaceagents: "List Workspace Agent instances",
  createworkspaceagent: "Hire an Agent for your Workspace",
  listworkspaceagentdefinitions: "Find curated Agent definitions",
  listworkspacecustomagents: "List custom Agent definitions",
  createworkspacecustomagent: "Create a custom Agent definition",
  getworkspacecustomagent: "Read a custom Agent definition",
  updateworkspacecustomagent: "Update a custom Agent definition",
  delegatetasktoworkspacecustomagent: "Delegate a Task to a custom Agent",
  getworkspacecustomagentprofile: "Read a custom Agent profile",
  listworkspacecustomagentrequests: "List custom Agent request outcomes",
  admitworkspacecustomagentrequest: "Queue a custom Agent request",
  getworkspacecustomagentusage: "Read custom Agent usage",
  getprojectdisplaypreferences: "Read your Project display preferences",
  updateprojectdisplaypreferences: "Save your Project display preferences",
  getprojectshortcuts: "Read your Project shortcuts",
  updateprojectshortcuts: "Replace your Project shortcuts",
  listcurrentworkcandidates: "Find Tasks to work on next",
  listinboxitems: "Read your Workspace Inbox",
  convergeinboxreadstate: "Mark Inbox items read through a cutoff",
  listnotificationpreferences: "List your notification preferences",
  getnotificationpreference: "Read a notification preference",
  updatenotificationpreference: "Change a notification preference",
  getauthcontext: "Read your credential context",
  getinboxitem: "Read an Inbox item",
  updateinboxitemreadstate: "Mark an Inbox item read or unread",
  clearcurrenttask: "Clear your current Task",
  getcurrentwork: "Read your current work",
  setcurrenttask: "Select your current Task",
  getproject: "Read a Project",
  moveprojectstate: "Reorder a Project lifecycle state",
  renameproject: "Rename a Project",
  listprojectactivity: "Read a Project's Activity",
  archiveproject: "Archive a Project",
  listprojectattachments: "List a Project's attachments",
  listworkspaceprojects: "List Workspace Projects",
  listworkspacetasks: "List Workspace Tasks",
  listworkspacereferenceoptions: "Find reference and mention candidates",
  listmywork: "Read My Work",
  bulkupdatetasks: "Change several Tasks",
  gettaskrelatedcontext: "Find Suggestions for a Task",
  submittasksuggestionfeedback: "Confirm or discard a Task Suggestion",
  listworkspaceinvitations: "List Workspace invitations",
  requestintegrationaction: "Queue a typed remote action",
  getintegrationaction: "Read a remote action's status",
  disconnectintegrationbinding: "Disconnect a Project integration binding",
  verifysentrybinding: "Verify a Sentry Project binding",
  listintegrationsubscriptions: "List a binding's subscriptions",
  createintegrationsubscription: "Create an integration subscription",
  listintegrationcatalog: "List integration providers",
  disconnectintegrationinstallation: "Disconnect an integration installation",
  getintegrationinstallation: "Read an integration installation",
  listintegrationactiondefinitions: "List an installation's actions",
  getintegrationinstallationmanagement: "Create an installation management link",
  listintegrationresources: "List an installation's resources",
  listtaskrichentities: "Read external entities linked to a Task",
  beginintegrationauthorization: "Begin provider authorization",
  completeintegrationauthorizationwithcredential: "Complete provider authorization with a credential",
  listworkspaceintegrationinstallations: "List Workspace integration installations",
  requestintegrationprovider: "Request an integration provider",
  getlabeldefinition: "Read a label definition",
  updatelabeldefinition: "Rename, recolor or restore a label",
  archivelabeldefinition: "Archive a label",
  listprojectlabeldefinitions: "List a Project's Task labels",
  createprojectlabeldefinition: "Create a Project Task label",
  listprojecttasklabeloverrides: "List a Project's Task label overrides",
  clearprojecttasklabeloverride: "Restore a Task label's Workspace default in a Project",
  setprojecttasklabeloverride: "Override a Task label in a Project",
  listworkspacelabeldefinitions: "List Workspace labels",
  createworkspacelabeldefinition: "Create a Workspace label",
  listtargetlabelassignments: "Read a target's labels",
  replacetargetlabels: "Replace a target's labels",
  getoperation: "Read background work status",
  canceloperation: "Request cancellation of background work",
}

export function operationTitle(operation, fallback) {
  return actionTitles[(operation.operationId ?? operation.id)?.toLowerCase()] ?? operation.summary ?? fallback
}

// Request examples only. The approved OpenAPI document owns fields and behavior.
const keyed = { "Idempotency-Key": "${IDEMPOTENCY_KEY}" }
const conditional = { ...keyed, "If-Match": "${ITEM_ETAG}" }
const comment = { mediaType: "text/markdown", body: "Please review the release checklist." }
const attachmentDigest = "31b0a3b37cf018f94688fa626b3043cae6d46667cbfad593aced7909c736c355"
const attachmentUploadId = "0198ac5e-f9b7-7000-8000-000000000030"
const attachmentId = "0198ac5e-f9b7-7000-8000-000000000031"
const workspaceIconAttachmentId = "0198ac5e-f9b7-7000-8000-0000000000b1"
const lifecycleMigrationJobId = "0198ac5e-f9b7-7000-8000-0000000000c5"
const mcpServiceCredentialId = "0198ac5e-f9b7-7000-8000-0000000000c6"
const lifecycleMapping = { "0198ac5e-f9b7-7000-8000-0000000000c1": "0198ac5e-f9b7-7000-8000-0000000000c2" }
const curatedDefinitionId = "0198ac5e-f9b7-7000-8000-000000000020"
const sentryInstallationId = "0198ac5e-f9b7-7000-8000-000000000060"
const sentryResourceId = "0198ac5e-f9b7-7000-8000-000000000061"
const sentryBindingId = "0198ac5e-f9b7-7000-8000-000000000062"
const sentryResolveActionId = "0198ac5e-f9b7-7000-8000-000000000063"
const sentryVerifyActionId = "0198ac5e-f9b7-7000-8000-000000000064"
const sentrySubscriptionId = "0198ac5e-f9b7-7000-8000-000000000065"
const sentryIdentityId = "0198ac5e-f9b7-7000-8000-000000000066"
const sentryRefreshActionId = "0198ac5e-f9b7-7000-8000-000000000067"
const sentryAlertSubscriptionInput = {
  type: "sentry.alert_to_task", direction: "incoming", status: "enabled",
  configuration: { event_types: [], privacy_mode: "error_aggregate", task_creation_status_id: "0198ac5e-f9b7-7000-8000-000000000005" },
}
const customAgentInput = {
  slug: "release-reviewer", name: "Release reviewer",
  description: "Review release plans for missing preparation steps.",
  responsibility: "Identify gaps in the release checklist for your review.",
  instructions: "Review the supplied release checklist. Summarize missing steps and ask before making changes.",
  state: "draft", bindings: [],
}
const repositoryId = "0198ac5e-f9b7-7000-8000-000000000050"
const repositorySyncRunId = "0198ac5e-f9b7-7000-8000-000000000056"
const repositoryConflictId = "0198ac5e-f9b7-7000-8000-000000000053"
const repositoryGitSha = "8f2b1a47c9e0653d6a94f0b2e1587c03d6a942bf"
const repositoryConnection = {
  installation_id: "0198ac5e-f9b7-7000-8000-000000000051",
  resource_id: "0198ac5e-f9b7-7000-8000-000000000052",
  provider: "github", repository_name: "acme-example/product-documents", branch: "main",
  docs_root: "documents", sync_mode: "bidirectional", repository_readers_acknowledged: true,
}
const integrationAuthorizationId = "0198ac5e-f9b7-7000-8000-000000000068"
const integrationExampleState = "fictitious-authorization-state-replace-before-use"
const providerRequestInput = { provider_name: "Example Monitor", use_case: "Link deployment incidents to release Tasks." }
const projectLabelId = "0198ac5e-f9b7-7000-8000-000000000071"
const workspaceLabelId = "0198ac5e-f9b7-7000-8000-000000000072"
const projectLabelInput = { purpose: "task", name: "Release blocker", color: "rose" }
const workspaceLabelInput = { purpose: "task", name: "Customer request", color: "sky" }
const labelOverrideInput = { name: "Client escalation", color: "orange-500" }
const milestoneId = "0198ac5e-f9b7-7000-8000-000000000080"
const projectStateId = "0198ac5e-f9b7-7000-8000-000000000081"
const replacementProjectStateId = "0198ac5e-f9b7-7000-8000-000000000082"
const projectMemberActorId = "0198ac5e-f9b7-7000-8000-000000000008"
const completionPolicyInput = {
  requires_review: false,
  default_active_status_id: "0198ac5e-f9b7-7000-8000-000000000084",
  default_review_status_id: null,
  default_done_status_id: "0198ac5e-f9b7-7000-8000-000000000085",
}
const changeSetId = "0198ac5e-f9b7-7000-8000-000000000090"
const documentPatchId = "0198ac5e-f9b7-7000-8000-000000000091"
const changeSetOperationId = "0198ac5e-f9b7-7000-8000-000000000092"
const changeSetDigest = "13bb2f0b04c5659382daac1cc59199d18961dd7db2ec913223376c0d371c6bb5"
const documentDraftContent = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Review the release checklist before publishing." }] }] }
const proposedChanges = [
  { client_item_id: "release-checklist", tool: "document_patch_apply", excluded: false, draft_id: documentPatchId, draft_version: "1", expected_revision: "1" },
  { client_item_id: "release-task", tool: "task_update", excluded: false, task_id: "0198ac5e-f9b7-7000-8000-000000000003", expected_revision: "1", title: "Review release checklist" },
]

const taskReceiptId = "0198ac5e-f9b7-7000-8000-0000000000a1"
const taskInverseReceiptId = "0198ac5e-f9b7-7000-8000-0000000000a2"
const taskResultSetId = "0198ac5e-f9b7-7000-8000-0000000000a3"
const taskSelectionId = "0198ac5e-f9b7-7000-8000-0000000000a5"
const taskSavedViewId = "0198ac5e-f9b7-7000-8000-0000000000a4"
const releaseTaskQuery = { project_ids: ["0198ac5e-f9b7-7000-8000-000000000002"], state: "active", filter_terms: ["release"], order: "title" }

const timeEntryId = "0198ac5e-f9b7-7000-8000-0000000000b1"
const timeEntryInput = { duration: "30m", work_date: "2026-10-27", note: "Review release checklist." }
const timesheetExportId = "0198ac5e-f9b7-7000-8000-0000000000b2"
const timeReportRange = { from: "2026-10-01", to: "2026-10-31" }

export const operationExamples = {
  previewlifecyclemapping: { headers: { "If-Match": "${ITEM_ETAG}" }, body: { mappings: lifecycleMapping } },
  getlifecyclemigration: {},
  retrylifecyclemigration: { headers: conditional },
  listworkspacemcpservicecredentials: { query: { limit: "50" } },
  revokeworkspacemcpservicecredential: { headers: keyed },
  getworkspacemilestonelifecycle: {},
  updateworkspacemilestonelifecycle: { headers: conditional, body: { stages: [
    { id: "planned", label: "Planned", status: "planned", archived: false },
    { id: "active", label: "In progress", status: "active", archived: false },
    { id: "completed", label: "Released", status: "completed", archived: false },
    { id: "cancelled", label: "Cancelled", status: "cancelled", archived: false },
  ] } },
  getworkspaceprojection: { query: { view: "baseline", selection: JSON.stringify({ kind: "workspace_tasks", query: { project_id: ["0198ac5e-f9b7-7000-8000-000000000002"] } }), limit: "50" } },
  listworkspacestatuses: { query: { limit: "50" } },
  createworkspacestatus: { headers: keyed, body: { label: "Ready for review", category: "in_review", status_type: "started", icon: "scan-eye", color: "violet" } },
  getworkspaceiconcontent: {},
  resolvelifecyclecompletiontarget: { query: { kind: "task", definition_id: curatedDefinitionId, target_status_id: "0198ac5e-f9b7-7000-8000-0000000000c2" } },
  listlifecycledefinitions: { query: { kind: "task", limit: "20" } },
  applylifecyclemapping: { headers: conditional, body: {
    mappings: { "0198ac5e-f9b7-7000-8000-0000000000c1": "0198ac5e-f9b7-7000-8000-0000000000c2" },
    destination_validators: { [curatedDefinitionId]: '\"example-lifecycle-identity-1\"' }, acknowledged: true,
  } },
  listlifecyclebehaviors: {},
  listworkspaceactivity: { query: { limit: "50", day: "2026-10-27", time_zone: "Europe/Budapest" } },
  listworkspacefeatures: { query: { limit: "50" } },
  updateworkspacefeature: { headers: conditional, body: { enabled: true } },
  clearworkspaceiconupload: { headers: conditional },
  setworkspaceiconupload: { headers: conditional, body: { attachment_id: workspaceIconAttachmentId } },
  listworkspacewebhookendpoints: { query: { limit: "50" } },
  createwebhookendpoint: { headers: keyed, body: { url: "https://example.com/assign-events", event_types: ["task.updated"] } },
  getwebhookendpoint: {},
  updatewebhookendpointstate: { headers: conditional, body: { state: "paused" } },
  listwebhookdeliveries: { query: { limit: "50" } },
  getwebhookdelivery: {},
  redeliverwebhookdelivery: { headers: conditional },
  rotatewebhookendpointsecret: { headers: conditional },
  createtimesheetexport: { headers: keyed, body: { from: "2026-10-27", to: "2026-10-28", format: "csv", report_revision: "example-opaque-time-report" } },
  gettimesheetexport: {},
  getmytimesheet: { query: { from: "2026-10-27", to: "2026-10-28", format: "json", limit: "50" } },
  listworkspacetimeentries: { query: { task_id: "0198ac5e-f9b7-7000-8000-000000000003", limit: "50" } },
  gettimetrackingpolicy: {},
  updatetimetrackingpolicy: { headers: conditional, body: { enabled: true, rounding_mode: "ceil_15_minutes" } },
  listprojecttimebreakdown: { query: { group_by: "task", ...timeReportRange, limit: "100" } },
  getprojecttimetotals: { query: timeReportRange },
  createtasktimeentry: { headers: keyed, body: timeEntryInput },
  gettasktimetotals: {},
  voidtimeentry: { headers: conditional },
  updatetimeentry: { headers: conditional, body: { ...timeEntryInput, duration: "45m" } },
  resolveworkspacemember: { query: { query: "@alex-morgan" } },
  undooperationreceipt: { headers: keyed, body: { id: taskReceiptId } },
  getoperationreceipt: {},
  createtaskresultset: { headers: keyed, body: { query: releaseTaskQuery } },
  gettaskresultset: { query: { version: "1", view: "summary" } },
  listtasksavedviews: { query: { limit: "50" } },
  createtasksavedview: { headers: keyed, body: { name: "Active release Tasks", query: releaseTaskQuery } },
  deletetasksavedview: { headers: conditional },
  updatetasksavedview: { headers: conditional, body: { name: "Release preparation" } },
  createtaskselection: { headers: keyed, body: { result_set_id: taskResultSetId, result_set_version: "1", task_ids: ["0198ac5e-f9b7-7000-8000-000000000003"] } },
  gettaskselection: { query: { view: "summary" } },
  getchangesetoperationresult: {},
  createchangeset: { headers: keyed, body: { mode: "per_item", operations: proposedChanges } },
  applychangeset: { headers: keyed, body: { version: "1", digest: changeSetDigest } },
  getchangeset: { query: { version: "1" } },
  createdocumentpatch: { headers: keyed, body: { document_id: "0198ac5e-f9b7-7000-8000-000000000010", base_revision: "1", content: documentDraftContent } },
  getdocumentpatch: { query: { version: "1" } },
  listtasksubscribers: { query: { limit: "50" } },
  gettasksubscription: {},
  followtask: { headers: keyed },
  unfollowtask: { headers: keyed },
  mutetask: { headers: keyed },
  unmutetask: { headers: keyed },
  listtaskparticipants: { query: { limit: "50" } },
  listtaskrelations: { query: { limit: "50" } },
  createtaskrelation: { headers: keyed, body: { target_task_id: "0198ac5e-f9b7-7000-8000-00000000000c", type: "blocks" } },
  reopentask: { headers: conditional },
  restoretask: { headers: conditional },
  starttask: { headers: conditional },
  gettaskcontext: { query: { format: "markdown", profile: "compact" } },
  headtaskcontext: { query: { format: "markdown", profile: "compact" } },
  listtaskdescriptionrevisions: { query: { limit: "50" } },
  restoretaskdescriptionrevision: { headers: conditional },
  duplicatetask: { headers: conditional, body: { copy_assignee: false, copy_dates: false, copy_milestone: false, copy_labels: false, copy_subtasks: false, copy_attachments: false } },
  movetask: { headers: conditional, body: { status_id: "0198ac5e-f9b7-7000-8000-000000000084" } },
  listtaskactivity: { query: { limit: "50" } },
  archivetask: { headers: conditional },
  listtaskassignments: { query: { limit: "50" } },
  listtaskattachments: { query: { limit: "50" } },
  attachtaskattachment: { headers: keyed, body: { attachment_id: attachmentId } },
  completetask: { headers: conditional },
  movestatus: { headers: conditional, body: { after_id: "0198ac5e-f9b7-7000-8000-000000000084", before_id: "0198ac5e-f9b7-7000-8000-000000000085" } },
  listworkspacemilestones: { query: { limit: "50", project_id: "0198ac5e-f9b7-7000-8000-000000000002", code: "FRS-M1" } },
  getworkspaceprojectlifecyclepolicy: {},
  updateworkspaceprojectlifecyclepolicy: { headers: conditional, body: { enabled: true } },
  listworkspaceprojectstates: { query: { limit: "50" } },
  createworkspaceprojectstate: { headers: keyed, body: { label: "Release preparation" } },
  listprojecttaskattachments: { query: { limit: "50" } },
  getstatus: {},
  updatestatus: { headers: conditional, body: { label: "Release review" } },
  archivestatus: { headers: conditional },
  archivestatusandreplace: { headers: conditional, body: { replacement_status_id: "0198ac5e-f9b7-7000-8000-000000000085" } },
  previewstatuslifecyclechange: { query: { status_type: "completed" } },
  updateprojectmember: { headers: conditional, body: { role: "manager" } },
  createmilestone: { headers: keyed, body: { name: "Release readiness", description: "Review the release checklist and resolve remaining blockers.", due_on: "2026-11-18" } },
  moveproject: { headers: conditional, body: { after_id: "0198ac5e-f9b7-7000-8000-000000000087" } },
  getprojectoverview: {},
  createprojectstatus: { headers: keyed, body: { label: "Ready for review", category: "in_review", status_type: "started", position: "3", icon: "scan-eye", color: "violet" } },
  attachprojectattachment: { headers: keyed, body: { attachment_id: attachmentId } },
  getprojectcompletionpolicy: {},
  updateprojectcompletionpolicy: { headers: conditional, body: completionPolicyInput },
  listprojectmembers: { query: { limit: "50" } },
  addprojectmember: { headers: keyed, body: { actor_id: projectMemberActorId, role: "contributor" } },
  removeprojectmember: { headers: conditional },
  getmilestone: {},
  updatemilestone: { headers: conditional, body: { name: "Release readiness review", due_on: "2026-11-20" } },
  archivemilestone: { headers: conditional },
  updateprojectstate: { headers: conditional, body: { label: "Ready for release" } },
  archiveprojectstate: { headers: conditional },
  archiveandreplaceprojectstate: { headers: conditional, body: { replacement_state_id: replacementProjectStateId } },
  getworkspacepersonprofilepicture: {},
  getworkspacepersonprofile: {},
  listworkspacepersonactivity: { query: { limit: "50" } },
  listtaskrichentities: { query: { limit: "20" } },
  beginintegrationauthorization: { headers: keyed, body: { provider_key: "sentry", authority_mode: "installation", return_path: "/" } },
  completeintegrationauthorizationwithcredential: { headers: keyed, body: { state: integrationExampleState, credential: "fictitious-provider-credential-replace-before-use" } },
  listworkspaceintegrationinstallations: { query: { limit: "20" } },
  requestintegrationprovider: { headers: keyed, body: providerRequestInput },
  getknowledgerepository: {},
  updateknowledgerepositorystate: { headers: conditional, body: { state: "paused" } },
  connectknowledgerepository: { headers: conditional, body: repositoryConnection },
  listknowledgerepositoryconflicts: { query: { limit: "50" } },
  resolveknowledgerepositoryconflict: { headers: keyed, body: {
    action: "keep_assign", expected_git_sha: repositoryGitSha, expected_document_revision: "1",
  } },
  importknowledgerepository: { headers: keyed },
  listknowledgerepositorysyncruns: { query: { limit: "50" } },
  getknowledgerepositorysyncrun: {},
  syncknowledgerepository: { headers: keyed },
  listdocumentrevisions: { query: { limit: "50" } },
  comparedocumentrevisions: { query: { from: "1", to: "2" } },
  getdocumentrevision: {},
  restoredocumentrevision: { headers: conditional },
  listworkspacedocuments: { query: { path: "release-checklist", limit: "50" } },
  createdocument: { headers: keyed, body: {
    title: "Release checklist", project_id: "0198ac5e-f9b7-7000-8000-000000000002", visibility: "workspace",
    content: { type: "doc", schema_version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "Review the release checklist." }] }] },
  } },
  replacedocumentcontent: { headers: { "If-Match": "${ITEM_ETAG}" }, query: { format: "json" }, body: {
    content: { type: "doc", schema_version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "Review the release checklist before publishing." }] }] },
  } },
  listdocumentworklinks: { query: { limit: "50" } },
  deletedocumentworklink: { headers: conditional },
  createdocumentworklink: { headers: keyed },
  deletedocument: { headers: conditional },
  restoredocument: { headers: conditional },
  getdocument: { query: { view: "canonical" } },
  updatedocument: { headers: conditional, body: { title: "Release readiness checklist" } },
  archivedocument: { headers: conditional },
  listdocumentattachments: { query: { limit: "100" } },
  attachdocumentattachment: { headers: keyed, body: { attachment_id: attachmentId } },
  getdocumentcontent: { query: { format: "json", view: "canonical" } },
  redocommand: { headers: keyed },
  undocommand: { headers: keyed },
  reserveattachmentupload: { headers: keyed, body: {
    workspace_id: "0198ac5e-f9b7-7000-8000-000000000001", filename: "release-checklist.txt",
    content_length: 30, content_type: "text/plain", sha256: attachmentDigest,
  } },
  cancelattachmentupload: { headers: keyed },
  completeattachmentupload: { headers: keyed, body: { sha256: attachmentDigest } },
  deleteattachment: { headers: conditional },
  getattachment: {},
  createworkspaceagentrun: { headers: keyed, body: {} },
  getworkspaceagentrun: {},
  listworkspaceagentrunactions: { query: { limit: "50", pending_limit: "50" } },
  decideworkspaceagentapproval: { headers: keyed, body: {
    decision: "rejected", reason: "Keep the checklist unchanged until the release date is confirmed.", expected_revision: "1",
  } },
  cancelworkspaceagentrun: { headers: keyed, body: {} },
  listworkspaceagentrunoutputs: { query: { limit: "50" } },
  removeworkspaceagent: { headers: conditional },
  getworkspaceagent: {},
  updateworkspaceagent: { headers: conditional, body: {
    status: "paused", scope_kind: "workspace", project_ids: [], enabled_trigger_types: ["manual"],
    additional_instructions: "Highlight missing release preparation steps.",
  } },
  quarantineworkspaceagent: { headers: conditional, body: { reason: "Pause release reviews while the checklist instructions are reviewed." } },
  rollbackworkspaceagent: { headers: conditional, body: {} },
  listworkspaceagentruns: { query: { limit: "50" } },
  listworkspaceagents: { query: { limit: "50" } },
  createworkspaceagent: { headers: keyed, body: {
    definition_id: curatedDefinitionId, status: "active", scope_kind: "workspace", project_ids: [],
    enabled_trigger_types: ["manual"], additional_instructions: "Highlight missing release preparation steps.",
  } },
  listworkspaceagentdefinitions: { query: { limit: "50" } },
  listworkspacecustomagents: { query: { limit: "50" } },
  createworkspacecustomagent: { headers: keyed, body: customAgentInput },
  getworkspacecustomagent: {},
  updateworkspacecustomagent: { headers: conditional, body: { ...customAgentInput, state: "active" } },
  delegatetasktoworkspacecustomagent: { headers: keyed, body: {
    source_kind: "delegation", source_id: "0198ac5e-f9b7-7000-8000-000000000025",
    task_id: "0198ac5e-f9b7-7000-8000-000000000003", instructions: "Review the release checklist on this Task.", preview_only: false,
  } },
  getworkspacecustomagentprofile: {},
  listworkspacecustomagentrequests: { query: { limit: "50" } },
  admitworkspacecustomagentrequest: { headers: keyed, body: {
    source_kind: "manual", source_id: "0198ac5e-f9b7-7000-8000-000000000026",
    instructions: "Suggest a release preparation checklist for human review.", preview_only: false,
  } },
  getworkspacecustomagentusage: { query: { from: "2026-10-01T00:00:00Z", to: "2026-11-01T00:00:00Z" } },
  getprojectdisplaypreferences: {},
  updateprojectdisplaypreferences: { headers: conditional, body: { sort: "custom", project_ids: ["0198ac5e-f9b7-7000-8000-000000000002"] } },
  getprojectshortcuts: {},
  updateprojectshortcuts: { headers: conditional, body: { slots: [null, "0198ac5e-f9b7-7000-8000-000000000002", null, null, null, null, null, null, null] } },
  listcurrentworkcandidates: { query: { limit: "25" } },
  listinboxitems: { query: { limit: "50", unread_only: "true", category: "assignment" } },
  convergeinboxreadstate: { headers: keyed, body: { cutoff: "2026-10-27T10:00:00Z", read: true } },
  listnotificationpreferences: { query: { limit: "1" } },
  getnotificationpreference: {},
  updatenotificationpreference: { headers: { "If-Match": "${ITEM_ETAG}" }, body: { web_enabled: false } },
  getauthcontext: {},
  getinboxitem: {},
  updateinboxitemreadstate: { headers: conditional, body: { read: true } },
  clearcurrenttask: { headers: conditional },
  getcurrentwork: {},
  setcurrenttask: { headers: conditional, body: { task_id: "0198ac5e-f9b7-7000-8000-000000000003" } },
  getcomment: { query: { format: "markdown" } },
  updatecomment: { ...comment, headers: conditional, query: { format: "markdown" } },
  deletecomment: { headers: conditional },
  addcommentreaction: {},
  removecommentreaction: {},
  getproject: {},
  moveprojectstate: { headers: conditional, body: { after_id: replacementProjectStateId } },
  renameproject: { headers: conditional, body: { name: "Release readiness" } },
  listprojectactivity: { query: { limit: "50" } },
  archiveproject: { headers: conditional },
  listprojectattachments: { query: { limit: "50" } },
  getworkspace: {},
  listworkspacemembers: { query: { limit: "50" } },
  listworkspaceinvitations: { query: { limit: "50" } },
  revokeworkspaceinvitation: { headers: keyed },
  resendworkspaceinvitation: { headers: conditional },
  createworkspaceinvitation: { headers: keyed, body: { email: "sam.rivera@example.com", role: "member" } },
  addworkspacemember: { headers: keyed, body: { user_id: "0198ac5e-f9b7-7000-8000-000000000008" } },
  updateworkspacemembership: { headers: conditional, body: { role: "admin" } },
  removeworkspacemember: { headers: conditional },
  updateworkspace: { headers: conditional, body: { name: "Acme Design Studio" } },
  getworkspaceaiaccesspolicy: {},
  updateworkspaceaiaccesspolicy: { headers: conditional, body: { enabled: false } },
  getworkspacesettings: {},
  updateworkspacesettings: { headers: conditional, body: { default_task_priority: "high" } },
  listprojectstatuses: { query: { limit: "50" } },
  createtask: { headers: keyed, body: { title: "Plan the next release", priority: "medium", description_markdown: "Review the release checklist." } },
  deletetaskrelation: { headers: conditional },
  updatetaskrelation: { headers: conditional, body: { type: "relates" } },
  trashtask: { headers: conditional },
  gettask: { query: { view: "canonical" } },
  updatetask: { headers: conditional, body: { title: "Review the release plan" } },
  listtaskcomments: { query: { limit: "50", format: "markdown" } },
  createcomment: { ...comment, headers: keyed, query: { format: "markdown" } },
  listactivitygroups: { query: { scope: "workspace", day: "2026-10-27", time_zone: "UTC", limit: "10" } },
  listactivitygroupchildren: { query: { scope: "workspace", day: "2026-10-27", time_zone: "UTC", limit: "25", group_revision: "revision_example", snapshot: "opaque-parent-snapshot" } },
  listworkspaceprojects: { query: { limit: "50" } },
  createproject: { headers: keyed, body: { name: "Release planning", key: "APP" } },
  listworkspacereferenceoptions: { query: { q: "release", types: "document", limit: "10", surface: "comment" } },
  searchworkspace: { headers: { Accept: "application/json" }, query: { q: "release", limit: "20" } },
  listworkspacetasks: { query: { limit: "50", code: "APP-42" } },
  bulkupdatetasks: { headers: keyed, body: { items: [
    { item_id: "release-plan", task_id: "0198ac5e-f9b7-7000-8000-000000000003", expected_revision: "1" },
    { item_id: "release-checklist", task_id: "0198ac5e-f9b7-7000-8000-000000000004", expected_revision: "2" },
  ], changes: { priority: "low" } } },
  gettaskrelatedcontext: {},
  submittasksuggestionfeedback: { headers: keyed, body: {
    entity_kind: "task", entity_id: "0198ac5e-f9b7-7000-8000-000000000004", outcome: "confirmed",
  } },
  listmywork: { query: { view: "assigned", limit: "50" } },
  requestintegrationaction: { headers: keyed, body: {
    installation_id: sentryInstallationId, binding_id: sentryBindingId, action_type: "sentry.issue.resolve",
    authority_mode: "installation", confirmed: true, input: { issue_id: "ISSUE-1" },
  } },
  getintegrationaction: {},
  disconnectintegrationbinding: { headers: keyed },
  verifysentrybinding: { headers: keyed },
  listintegrationsubscriptions: { query: { limit: "50" } },
  createintegrationsubscription: { headers: keyed, body: sentryAlertSubscriptionInput },
  listintegrationcatalog: { query: { limit: "50" } },
  disconnectintegrationinstallation: { headers: conditional },
  getintegrationinstallation: {},
  listintegrationactiondefinitions: { query: { limit: "50" } },
  getintegrationinstallationmanagement: { headers: keyed },
  listintegrationresources: { query: { limit: "20" } },
  refreshintegrationresources: { headers: keyed },
  updateintegrationsubscription: { headers: conditional, body: { status: "paused" } },
  listpersonalintegrationidentities: { query: { limit: "20" } },
  disconnectpersonalintegrationidentity: { headers: keyed },
  listprojectintegrationbindings: { query: { limit: "20" } },
  createprojectintegrationbinding: { headers: keyed, body: { resource_id: sentryResourceId } },
  getlabeldefinition: {},
  updatelabeldefinition: { headers: conditional, body: { name: "Blocks release", color: "red-600" } },
  archivelabeldefinition: { headers: conditional },
  listprojectlabeldefinitions: { query: { limit: "50" } },
  createprojectlabeldefinition: { headers: keyed, body: projectLabelInput },
  listprojecttasklabeloverrides: { query: { limit: "50" } },
  clearprojecttasklabeloverride: { headers: conditional },
  setprojecttasklabeloverride: { headers: conditional, body: labelOverrideInput },
  listworkspacelabeldefinitions: { query: { purpose: "task", limit: "50" } },
  createworkspacelabeldefinition: { headers: keyed, body: workspaceLabelInput },
  listtargetlabelassignments: {},
  replacetargetlabels: { headers: conditional, body: { label_ids: [projectLabelId, workspaceLabelId] } },
  getoperation: {},
  canceloperation: { headers: keyed },
}

// The pinned Vocs sampler uses this hook for HTML, Markdown and copied examples.
export function applyRequestExample(operation, request) {
  const headers = request.headers.map((header) => ({ ...header }))
  if (operation.security?.length === 1 && Object.keys(operation.security[0]).length === 1 && Object.hasOwn(operation.security[0], "bearerToken") && !headers.some(({ name }) => name.toLowerCase() === "authorization"))
    headers.unshift({ name: "Authorization", value: "Bearer ${ASSIGN_TOKEN}" })
  const example = operationExamples[operation.id]
  if (!example) return { ...request, headers }
  for (const [name, value] of Object.entries(example.headers ?? {})) {
    const existing = headers.find((header) => header.name.toLowerCase() === name.toLowerCase())
    if (existing) existing.value = value
    else headers.push({ name, value })
  }
  const result = { ...request, headers, queryString: Object.entries(example.query ?? {}).map(([name, value]) => ({ name, value })) }
  const url = new URL(request.url), parts = url.pathname.split("/"), path = operation.path.split("/")
  const values = { ...(["getlifecyclemigration", "retrylifecyclemigration"].includes(operation.id) ? { job_id: lifecycleMigrationJobId } : {}), ...(operation.id === "revokeworkspacemcpservicecredential" ? { credential_id: mcpServiceCredentialId } : {}), ...(["applylifecyclemapping", "previewlifecyclemapping"].includes(operation.id) ? { definition_id: curatedDefinitionId } : {}), ...(["getwebhookendpoint", "updatewebhookendpointstate", "listwebhookdeliveries", "getwebhookdelivery", "redeliverwebhookdelivery", "rotatewebhookendpointsecret"].includes(operation.id) ? { endpoint_id: webhookEndpoint.id, delivery_id: webhookDelivery.id } : {}), ...(operation.id === "gettimesheetexport" ? { operation_id: timesheetExportId } : {}), ...(["voidtimeentry", "updatetimeentry"].includes(operation.id) ? { entry_id: timeEntryId } : {}), ...(["deletetasksavedview", "updatetasksavedview"].includes(operation.id) ? { view_id: taskSavedViewId } : {}), ...(operation.id === "gettaskselection" ? { id: taskSelectionId } : {}), ...(operation.id === "getoperationreceipt" ? { id: taskReceiptId } : {}), ...(operation.id === "gettaskresultset" ? { id: taskResultSetId } : {}), ...(["getchangeset", "applychangeset"].includes(operation.id) ? { id: changeSetId, change_set_id: changeSetId } : {}), ...(operation.id === "getdocumentpatch" ? { id: documentPatchId } : {}), ...(operation.id === "getchangesetoperationresult" ? { operation_id: changeSetOperationId } : {}), ...(["removeprojectmember", "updateprojectmember"].includes(operation.id) ? { actor_id: projectMemberActorId } : {}), ...(["getworkspacepersonprofilepicture", "getworkspacepersonprofile", "listworkspacepersonactivity"].includes(operation.id) ? { username: membershipRecord.username, user_id: membershipRecord.user_id } : {}), ...(["createworkspaceagentrun", "getworkspaceagentrun", "listworkspaceagentrunactions", "decideworkspaceagentapproval", "cancelworkspaceagentrun", "listworkspaceagentrunoutputs"].includes(operation.id) ? { agent_id: agentInstance.id, run_id: agentRun.id, action_id: agentAction.id, approval_id: agentAction.approval.id } : {}), ...(["removeworkspaceagent", "getworkspaceagent", "updateworkspaceagent", "quarantineworkspaceagent", "rollbackworkspaceagent", "listworkspaceagentruns"].includes(operation.id) ? { agent_id: agentInstance.id } : {}), ...(["getnotificationpreference", "updatenotificationpreference"].includes(operation.id) ? { category: "assignment" } : {}), ...(operation.id === "updateworkspacefeature" ? { feature: "time_tracking" } : {}), inbox_item_id: inboxRecord.id, workspace_id: workspace, project_id: projectId, task_id: taskId, comment_id: commentRecord.id, ...(["revokeworkspaceinvitation", "resendworkspaceinvitation"].includes(operation.id) ? { invitation_id: invitationRecord.id } : {}), ...(["updateworkspacemembership", "removeworkspacemember"].includes(operation.id) ? { member_id: membershipRecord.membership_id } : {}), ...(["getworkspacecustomagent", "updateworkspacecustomagent", "delegatetasktoworkspacecustomagent", "getworkspacecustomagentprofile", "listworkspacecustomagentrequests", "admitworkspacecustomagentrequest", "getworkspacecustomagentusage"].includes(operation.id) ? { definition_id: customAgentRecord.definition_id } : {}), ...(["createdocumentworklink", "deletedocumentworklink", "listtargetlabelassignments", "replacetargetlabels"].includes(operation.id) ? { target_kind: "task", target_id: taskId } : {}), ...(["getdocumentrevision", "restoredocumentrevision", "restoretaskdescriptionrevision"].includes(operation.id) ? { revision: "1" } : {}), ...(operation.id === "getknowledgerepositorysyncrun" ? { run_id: repositorySyncRunId } : {}), ...(operation.id === "resolveknowledgerepositoryconflict" ? { conflict_id: repositoryConflictId } : {}), ...(operation.id === "getintegrationaction" ? { action_id: sentryResolveActionId } : {}), ...(["disconnectintegrationbinding", "verifysentrybinding", "listintegrationsubscriptions", "createintegrationsubscription"].includes(operation.id) ? { binding_id: sentryBindingId } : {}), ...(["disconnectintegrationinstallation", "getintegrationinstallation", "listintegrationactiondefinitions", "getintegrationinstallationmanagement", "listintegrationresources", "refreshintegrationresources"].includes(operation.id) ? { installation_id: sentryInstallationId } : {}), ...(operation.id === "updateintegrationsubscription" ? { subscription_id: sentrySubscriptionId } : {}), ...(operation.id === "disconnectpersonalintegrationidentity" ? { identity_id: sentryIdentityId } : {}), ...(["getoperation", "canceloperation"].includes(operation.id) ? { operation_id: agentOperation.id } : {}), ...(["getlabeldefinition", "updatelabeldefinition", "archivelabeldefinition"].includes(operation.id) ? { label_id: projectLabelId } : {}), ...(["clearprojecttasklabeloverride", "setprojecttasklabeloverride"].includes(operation.id) ? { label_id: workspaceLabelId } : {}), ...(["movestatus", "getstatus", "updatestatus", "archivestatus", "archivestatusandreplace", "previewstatuslifecyclechange"].includes(operation.id) ? { status_id: reviewStatus.id } : {}), milestone_id: milestoneId, state_id: projectStateId, document_id: documentId, command_id: reversibleCommand.id, upload_id: attachmentUploadId, attachment_id: attachmentId, reaction: "thumbs_up", group_id: "group_example" }
  for (const [index, segment] of path.entries()) {
    const name = segment.match(/^\{([^}]+)\}$/)?.[1]
    if (name && values[name]) parts[parts.length - path.length + index] = encodeURIComponent(values[name])
  }
  url.pathname = parts.join("/")
  result.url = url.toString()
  if (example.body !== undefined) {
    const mediaType = example.mediaType ?? "application/json"
    result.headers = headers.filter(({ name }) => name.toLowerCase() !== "content-type")
    result.headers.push({ name: "Content-Type", value: mediaType })
    result.postData = { mimeType: mediaType, text: typeof example.body === "string" ? example.body : JSON.stringify(example.body, null, 2) }
  }
  return result
}

export function environmentSample(code, lang) {
  if (!code || !["bash", "ts"].includes(lang)) return code
  return code.replace(/'([^'\n]*\$\{(?:ASSIGN_TOKEN|IDEMPOTENCY_KEY|ITEM_ETAG)\}[^'\n]*)'/g, (_, value) =>
    lang === "bash" ? `"${value}"` : "`" + value.replace(/\$\{(ASSIGN_TOKEN|IDEMPOTENCY_KEY|ITEM_ETAG)\}/g, "${process.env.$1}") + "`")
}

const workspace = "0198ac5e-f9b7-7000-8000-000000000001"
const projectId = "0198ac5e-f9b7-7000-8000-000000000002"
const taskId = "0198ac5e-f9b7-7000-8000-000000000003"
const actorId = "0198ac5e-f9b7-7000-8000-000000000004"
const statusId = "0198ac5e-f9b7-7000-8000-000000000005"
const timestamp = "2026-10-27T10:00:00Z"
const workspaceFeature = {
  key: "time_tracking", label: "Time tracking", description: "Record Task time and view Timesheets.",
  maturity: "available", enabled: false, revision: "1", updated_at: timestamp, updated_by_actor_id: actorId,
  requires: [], required_by: [], settings_route: "settings/time-tracking", can_manage: true,
}
const iconWorkspace = {
  id: workspace, name: "Acme Studio", slug: "acme-studio", icon_url: null, revision: "2",
  created_at: timestamp, updated_at: "2026-10-27T10:01:00Z", archived_at: null,
}
const releaseMilestone = {
  id: milestoneId, workspace_id: workspace, project_id: projectId,
  name: "Release readiness", description: "Review the release checklist and resolve remaining blockers.",
  due_on: "2026-11-18", status: "active", stage_id: null, revision: "1",
  milestone_number: "1", code: "FRS-M1", created_at: timestamp, updated_at: timestamp, archived_at: null,
  progress: { total_tasks: "8", completed_tasks: "5", incomplete_tasks: "3", tasks_by_category: { done: "5", in_progress: "2", todo: "1" } },
}
const releaseProjectState = {
  id: projectStateId, workspace_id: workspace, label: "Release preparation", position: "2", revision: "1",
  created_at: timestamp, updated_at: timestamp, archived_at: null,
}
const curatedAgentDefinition = {
  id: curatedDefinitionId, slug: "release-planner", name: "Release planner", category: "Planning",
  description: "Review release preparation with your team.", responsibility: "Identify missing release preparation steps.",
  version: "1.0.0", supported_trigger_types: ["manual"], default_trigger_types: ["manual"],
  capability_summary: ["Review a release checklist"], action_boundary: "Suggest checklist changes for human review.",
}
const agentInstance = {
  id: "0198ac5e-f9b7-7000-8000-000000000021", actor_id: "0198ac5e-f9b7-7000-8000-000000000022",
  workspace_id: workspace, definition: curatedAgentDefinition, status: "active", scope_kind: "workspace", project_ids: [],
  enabled_trigger_types: ["manual"], additional_instructions: "Highlight missing release preparation steps.",
  schedule_timezone: "UTC", schedule_local_time: "09:00", schedule_weekdays: [1, 2, 3, 4, 5], schedule_interval_minutes: 0,
  next_scheduled_at: null, quarantined_at: null, quarantine_reason: "", removed_at: null, rollback_definition_version: "",
  revision: 1, created_at: timestamp, updated_at: timestamp,
}
const agentRun = {
  id: "0198ac5e-f9b7-7000-8000-000000000028", workspace_id: workspace, agent_instance_id: agentInstance.id,
  definition_id: curatedDefinitionId, definition_version: "1.0.0", trigger_type: "manual", state: "waiting_for_approval",
  initiated_by_actor_id: actorId, scheduled_for: null, safe_summary: "Release checklist review is ready for your decision.",
  error_code: null, reserved_credits: 0, used_credits: 0, cancellation_requested_at: null,
  started_at: timestamp, finished_at: null, created_at: timestamp, updated_at: timestamp,
}
const agentOperation = {
  outcome: "active", id: "0198ac5e-f9b7-7000-8000-00000000002b", state: "pending", progress: null,
  expires_at: "2026-10-28T10:00:00Z", created_at: timestamp, updated_at: timestamp,
}
const agentAction = {
  id: "0198ac5e-f9b7-7000-8000-000000000029", run_id: agentRun.id,
  tool_name: "update_task", tool_contract_version: "1", capability: "manage", target_type: "task", target_id: taskId,
  request_digest: "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  preview: "Rename the Task to Review the release checklist.",
  idempotency_key: "example-release-review-action-1", state: "pending_approval", result_target_revision: null,
  proposal: { title: "Review the release checklist" }, created_at: timestamp,
  approval: { id: "0198ac5e-f9b7-7000-8000-00000000002a", state: "pending", expires_at: "2026-10-28T10:00:00Z",
    decided_by_actor_id: "", decided_at: null, decision_reason: "" },
}
const customAgentRecord = {
  ...customAgentInput, contract_generation: "agent-participation.v1", workspace_id: workspace,
  definition_id: "0198ac5e-f9b7-7000-8000-000000000023", actor_id: "0198ac5e-f9b7-7000-8000-000000000024",
  revision: 1, version_digest: "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
}
const updatedCustomAgent = { ...customAgentRecord, state: "active", revision: 2,
  version_digest: "sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789" }
const queuedAgentRequest = {
  id: "0198ac5e-f9b7-7000-8000-000000000027", workspace_id: workspace,
  definition_id: customAgentRecord.definition_id, definition_revision: updatedCustomAgent.revision,
  version_digest: updatedCustomAgent.version_digest, requested_by_actor_id: actorId,
  ...operationExamples.delegatetasktoworkspacecustomagent.body,
  request_digest: "sha256:123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
  state: "queued", safe_summary: "", reserved_credits: 0, used_credits: 0, created_at: timestamp,
}
const manualAgentRequest = {
  ...queuedAgentRequest, ...operationExamples.admitworkspacecustomagentrequest.body,
  id: "0198ac5e-f9b7-7000-8000-000000000028", task_id: undefined,
  request_digest: "sha256:23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
}
const richText = (text) => ({ type: "doc", schema_version: 1, content: [{ type: "paragraph", content: [{ type: "text", text }] }] })
const commentText = "Please review the release checklist."
const commentRecord = {
  id: "0198ac5e-f9b7-7000-8000-000000000006", workspace_id: workspace, task_id: taskId,
  author_actor_id: actorId, actor: "user", actor_name: null, number: 1, revision: 1,
  created_at: timestamp, updated_at: timestamp, edited_at: null, deleted_at: null, reactions: [],
}
const markdownComment = { ...commentRecord, body_markdown: commentText }
const jsonComment = { ...commentRecord, body: richText(commentText) }
const projectRecord = {
  id: projectId, workspace_id: workspace, owner_actor_id: actorId, name: "Release planning",
  key: "APP", path: "release-planning", description: "Plan the next release.", url: null,
  start_on: null, target_on: null, project_state_id: null, visual_identity: null,
  visibility: "workspace", public_id: null, permissions: { can_update: true, can_publish: false, can_manage_members: false },
  show_cancelled_column: false, next_task_number: "43", revision: "1", created_at: timestamp, updated_at: timestamp,
}
const canonicalTask = {
  id: taskId, workspace_id: workspace, project_id: projectId, task_number: "42", status_id: statusId,
  rank: "a0", title: "Plan the next release", priority: "medium", revision: "1", description: richText("Review the release checklist."),
  created_at: timestamp, updated_at: timestamp, archived_at: null, trashed_at: null,
  purge_after: null, purged_at: null, lifecycle: "active", resolved_at: null, resolved_by: null, resolution: null,
}
// Command results and canonical item reads retain their declared numeric distinctions.
const taskCommand = { ...canonicalTask, task_number: 42, code: "APP-42", revision: 1, summary: null }
const reversibleCommand = {
  id: "0198ac5e-f9b7-7000-8000-000000000040", type: "task.update", entity_type: "task", entity_id: taskId,
  description: "Change the Task title to Review the release plan", undo_description: "Restore the Task title to Plan the next release",
  state: "done", created_at: timestamp, undoable_until: "2026-10-27T10:10:00Z",
}
const included = { assignees: [], statuses: [], milestones: [], labels: [], completeness: "complete", unavailable: [] }
const workspaceSettings = {
  workspace_id: workspace, description: "Release planning", default_timezone: "Europe/Budapest",
  default_locale: "en-GB", default_first_day_of_week: "monday", default_project_visibility: "workspace",
  default_task_status_category: "todo", default_task_priority: "medium", default_task_assignee: "unassigned",
  revision: "1", updated_at: timestamp,
}
const projectMemberRecord = {
  actor_id: projectMemberActorId, display_name: "Sam Rivera", role: "contributor", is_owner: false,
  revision: "1", created_at: timestamp, updated_at: timestamp, workspace_id: workspace, project_id: projectId,
}
const reviewStatus = {
  id: "0198ac5e-f9b7-7000-8000-000000000086", workspace_id: workspace, project_id: projectId,
  ...operationExamples.createprojectstatus.body, marks_task_resolved: false, is_required: false,
  revision: "1", created_at: timestamp, updated_at: timestamp, archived_at: null,
}
const workspaceReviewStatus = {
  ...reviewStatus, id: "0198ac5e-f9b7-7000-8000-0000000000d3", project_id: null,
  ...operationExamples.createworkspacestatus.body,
}
const projectCompletionPolicy = { ...completionPolicyInput, project_id: projectId, revision: "1" }
const membershipRecord = {
  membership_id: "0198ac5e-f9b7-7000-8000-000000000007", user_id: "0198ac5e-f9b7-7000-8000-000000000008",
  actor_id: actorId, display_name: "Alex Morgan", username: "alex-morgan", avatar_initials: null, avatar_color: null,
  role: "member", state: "active", revision: "1", profile_picture_url: null,
}
const invitationRecord = {
  id: "0198ac5e-f9b7-7000-8000-000000000009", workspace_id: workspace,
  email: "sam.rivera@example.com", role: "member", state: "pending", revision: "1",
  created_at: timestamp, expires_at: "2026-11-03T10:00:00Z", invited_by_actor_id: actorId,
  accepted_at: null, revoked_at: null,
}
const inboxRecord = {
  id: "0198ac5e-f9b7-7000-8000-00000000000b", workspace_id: workspace,
  category: "assignment", resource_type: "task", resource_id: taskId,
  summary: { title: "Plan the next release" }, urgency: "normal",
  deep_link: `/acme-studio/release-planning/tasks/${taskId}`,
  aggregation_count: 1, last_event_at: timestamp, read_at: null, seen_at: null,
  archived_at: null, revision: "1", created_at: timestamp,
}
const currentWork = {
  current: {
    task_id: taskId, workspace_id: workspace, workspace_name: "Acme Studio", workspace_slug: "acme-studio",
    project_id: projectId, project_name: "Release planning", project_path: "release-planning", project_key: "APP",
    task_number: "42", task_code: "APP-42", title: "Plan the next release", status_id: statusId,
    status_label: "In progress", status_category: "in_progress", updated_at: timestamp,
  },
  revision: "1", updated_at: timestamp, has_eligible_tasks: true,
}
const notificationPreference = {
  category: "assignment", description: "Tasks assigned to you", mandatory: false,
  web_enabled: true, email_enabled: false, email_available: false,
  push_enabled: false, push_available: false, delivery_policy: "immediate",
  revision: "0", updated_at: "1970-01-01T00:00:00Z",
}
const attachmentRecord = {
  id: attachmentId, workspace_id: workspace, filename: "release-checklist.txt",
  content_length: 30, content_type: "text/plain", scan_state: "clean",
  created_by_actor_id: actorId, created_at: timestamp, deleted_at: null,
}
const documentId = "0198ac5e-f9b7-7000-8000-000000000010"
const canonicalDocument = {
  id: documentId, workspace_id: workspace, code: "RELEASE-CHECKLIST", title: "Release checklist",
  visibility: "workspace", parent_document_id: null, project_id: projectId, public_id: null,
  created_by_actor_id: actorId, revision: "1", created_at: timestamp, updated_at: timestamp, archived_at: null,
}
const documentRow = {
  id: documentId, workspace_id: workspace, path: "release-checklist", title: canonicalDocument.title,
  visibility: "workspace", parent_document_id: null, project_id: projectId, child_document_count: "0", public_id: null,
  created_by_actor_id: actorId, revision: "1", created_at: timestamp, updated_at: timestamp, archived_at: null, summary: null,
}
const documentWorkLink = {
  id: "0198ac5e-f9b7-7000-8000-000000000011", document_id: documentId,
  document_title: canonicalDocument.title, document_path: documentRow.path,
  target_kind: "task", target_id: taskId, target_title: "Plan the next release", target_code: "APP-42",
  project_id: projectId, project_path: "release-planning", can_remove: true,
}
const documentRevision = {
  document_id: documentId, revision: "1", actor_id: actorId, change_kind: "created",
  project_id: projectId, title: documentRow.title, path: documentRow.path, visibility: "workspace",
  parent_document_id: null, archived_at: null, created_at: timestamp,
  content_ref: { operation_id: "getDocumentRevision", document_id: documentId, revision: "1" },
}
const editedDocumentRevision = {
  ...documentRevision, revision: "2", change_kind: "metadata", title: "Release readiness checklist",
  created_at: "2026-10-27T10:01:00Z",
  content_ref: { ...documentRevision.content_ref, revision: "2" },
}
const repositoryRecord = {
  ...repositoryConnection, id: repositoryId, workspace_id: workspace,
  status: "conflict", webhook_health: "healthy", revision: "3",
  last_git_commit_sha: repositoryGitSha, last_successful_sync_at: timestamp,
  pending_documents: "1", open_conflicts: "1",
}
delete repositoryRecord.repository_readers_acknowledged
const repositoryConflict = {
  id: repositoryConflictId, document_id: documentId, relative_path: "release-checklist.md",
  status: "open", observed_git_sha: repositoryGitSha, expected_document_revision: "1", created_at: timestamp,
}
const repositoryAcceptance = {
  outcome: "active", id: "0198ac5e-f9b7-7000-8000-000000000054", state: "pending",
  expires_at: "2026-10-28T10:00:00Z", created_at: timestamp, updated_at: timestamp, progress: null,
}
const repositorySyncRun = {
  id: repositorySyncRunId, direction: "bidirectional", trigger: "manual", status: "conflict",
  base_git_sha: repositoryGitSha, result_git_sha: null,
  documents_created: 0, documents_updated: 0, documents_moved: 0, documents_archived: 0, documents_conflicted: 1,
  error_code: null, started_at: timestamp, completed_at: "2026-10-27T10:01:00Z",
}
const sentryResolveAction = {
  id: sentryResolveActionId, workspace_id: workspace, installation_id: sentryInstallationId, binding_id: sentryBindingId,
  action_type: "sentry.issue.resolve", authority_mode: "installation", status: "pending", attempt_count: 0,
  safe_error_code: null, result: null, created_at: timestamp, updated_at: timestamp, completed_at: null,
}
const sentryVerifyAction = {
  ...sentryResolveAction, id: sentryVerifyActionId, action_type: "sentry.binding.verify",
}
const sentryAlertSubscription = {
  id: sentrySubscriptionId, workspace_id: workspace, installation_id: sentryInstallationId, binding_id: sentryBindingId,
  ...sentryAlertSubscriptionInput, revision: "1", created_at: timestamp, updated_at: timestamp,
}
const sentryBindingDisconnected = {
  id: sentryBindingId, workspace_id: workspace, installation_id: sentryInstallationId, resource_id: sentryResourceId,
  project_id: projectId, status: "disconnected", revision: "2", created_at: timestamp, updated_at: "2026-10-27T10:02:00Z",
}
const sentryInstallation = {
  id: sentryInstallationId, workspace_id: workspace, provider_key: "sentry", display_name: "Acme Studio Sentry",
  status: "active", health: "healthy", revision: "1", created_at: timestamp, updated_at: timestamp,
}
const sentryProvider = {
  key: "sentry", name: "Sentry", description: "Link live error reports to Tasks with structured diagnostics and freshness.",
  categories: ["observability"], capabilities: ["rich_entities", "task_creation", "status_writeback", "webhooks"],
  availability: "preview", official: true, supports_multiple_installations: true, supports_user_connections: true,
}
const sentryProjectResource = {
  id: sentryResourceId, workspace_id: workspace, installation_id: sentryInstallationId, resource_type: "sentry.project",
  display_name: "Release planning", canonical_url: "https://sentry.io/organizations/acme-studio/projects/release-planning/",
  status: "active", revision: "1", created_at: timestamp, updated_at: timestamp,
}
const sentryIssueInputSchema = {
  type: "object", additionalProperties: false, required: ["issue_id"],
  properties: { issue_id: { type: "string", minLength: 1, maxLength: 10000 } },
}
const sentryManagement = {
  installation_id: sentryInstallationId, management_url: "https://sentry.io/settings/acme-studio/integrations/",
  repository_selection: "unknown", granted_permissions: ["event:read", "project:read"], fetched_at: timestamp,
}
const sentryIdentity = {
  id: sentryIdentityId, workspace_id: workspace, installation_id: sentryInstallationId, provider_key: "sentry",
  installation_display_name: "Acme Studio Sentry", display_name: "Alex Morgan", identity_status: "active",
  authorization_status: "authorized", revision: "1", created_at: timestamp, updated_at: timestamp,
}
const sentryProjectBinding = {
  id: sentryBindingId, project_id: projectId, installation_id: sentryInstallationId, provider_key: "sentry",
  installation_display_name: "Acme Studio Sentry", installation_status: "active", resource_id: sentryResourceId,
  resource_type: "sentry.project", resource_display_name: "Release planning",
  resource_canonical_url: "https://sentry.io/organizations/acme-studio/projects/release-planning/",
  resource_status: "active", capability_group: "other", binding_status: "active",
  subscription_count: 1, enabled_subscription_count: 1, attention_subscription_count: 0,
  revision: "1", created_at: timestamp, updated_at: timestamp,
}
const sentryBindingCreated = {
  id: sentryBindingId, workspace_id: workspace, installation_id: sentryInstallationId, resource_id: sentryResourceId,
  project_id: projectId, status: "active", revision: "1", created_at: timestamp, updated_at: timestamp,
}
const projectLabel = {
  id: projectLabelId, workspace_id: workspace, project_id: projectId, purpose: "task", scope: "project",
  name: projectLabelInput.name, color: projectLabelInput.color, revision: "1", created_at: timestamp, updated_at: timestamp, archived_at: null,
}
const workspaceLabel = {
  id: workspaceLabelId, workspace_id: workspace, project_id: null, purpose: "task", scope: "workspace",
  name: workspaceLabelInput.name, color: workspaceLabelInput.color, revision: "1", created_at: timestamp, updated_at: timestamp, archived_at: null,
}
const taskSubscription = {
  id: "0198ac5e-f9b7-7000-8000-000000000093", task_id: taskId, actor_id: actorId,
  state: "following", authority: "manual", automatic_reason: null, policy_revision: 1,
  revision: "1", muted_at: null, unfollowed_at: null, created_at: timestamp, updated_at: timestamp,
}
const documentPatchDraft = {
  schema: "document_patch.v1", id: documentPatchId, version: "1", document_id: documentId,
  base_revision: "1", base_content: { type: "doc", content: [] }, draft_content: documentDraftContent,
  actor_id: actorId, expires_at: "2026-11-26T10:00:00Z",
}
const changeSetProposal = {
  schema: "change_set.v1", id: changeSetId, version: "1", digest: changeSetDigest,
  actor_id: actorId, initiator_actor_id: actorId, policy_revision: "1", mode: "per_item",
  requires_approval: true, state: "review", operations: proposedChanges.map((item, index) => ({ ...item, operation_id: `0198ac5e-f9b7-7000-8000-00000000009${index + 3}` })),
  expires_at: "2026-11-26T10:00:00Z", review_url: `/api/v1/workspaces/${workspace}/change-sets/${changeSetId}?version=1`,
}
const changeSetResult = {
  id: changeSetId, version: "1", operation_id: changeSetOperationId, state: "applied",
  outcomes: [
    { client_item_id: "release-checklist", operation_id: "0198ac5e-f9b7-7000-8000-000000000093", state: "committed", receipt: {
      schema: "work.operation_receipt.v1", operation_id: "0198ac5e-f9b7-7000-8000-000000000093", tool: "document_patch_apply", state: "committed",
      actor_id: actorId, initiator_actor_id: actorId, committed_at: "2026-10-27T10:05:00Z", resource_id: documentId, resource_type: "document", expected_revision: "1", revision: "2",
    } },
    { client_item_id: "release-task", operation_id: "0198ac5e-f9b7-7000-8000-000000000094", state: "conflicted" },
  ],
}
const changeSetAccepted = { outcome: "active", id: changeSetOperationId, state: "pending", progress: null, created_at: "2026-10-27T10:04:00Z", updated_at: "2026-10-27T10:04:00Z", expires_at: "2026-11-03T10:04:00Z" }

const taskReceipt = {
  schema: "work.operation_receipt.v1", operation_id: taskReceiptId, tool: "task_update", state: "committed",
  actor_id: actorId, initiator_actor_id: actorId, resource_type: "task", resource_id: taskId,
  project_id: projectId, expected_revision: "1", revision: "2", committed_at: timestamp,
}
const releaseTaskResultSet = {
  schema: "task_result_set.v1", id: taskResultSetId, version: "1", view: "summary", query: releaseTaskQuery,
  coverage: { query_digest: "d7a21c9f81b634a2e9850f4ea137d926b92f6068936f692427c2aa197f0b55e3",
    collection_version: "42", visibility_revision: "7", observed_at: timestamp, returned_count: 1, coverage: "complete" },
  expires_at: "2026-11-26T10:00:00Z", target_count: 1,
  items_url: `/api/v1/workspaces/${workspace}/task-result-sets/${taskResultSetId}?view=items&version=1`,
}

const savedReleaseView = {
  schema: "task.saved_view.v1", id: taskSavedViewId, revision: "1", name: "Active release Tasks",
  query: releaseTaskQuery, created_at: timestamp, updated_at: timestamp,
  item_validator: { etag: '\"example-saved-view-identity-1\"', encoding: "identity", representation: "canonical-item" },
}
const releaseTaskSelection = {
  id: taskSelectionId, result_set_id: taskResultSetId, result_set_version: "1", selected_count: 1,
  items_url: `/api/v1/workspaces/${workspace}/task-selections/${taskSelectionId}?view=items`, view: "summary",
}
const timeEntry = {
  id: timeEntryId, workspace_id: workspace, project_id: projectId, task_id: taskId, actor_id: actorId,
  work_date: timeEntryInput.work_date, duration_input: timeEntryInput.duration, note: timeEntryInput.note,
  exact_duration_seconds: "1800", reportable_duration_seconds: "1800", rounding_policy_revision: "1",
  revision: "1", created_at: timestamp, updated_at: timestamp,
  item_validator: { etag: '"example-time-entry-identity-1"', encoding: "identity", representation: "canonical-item" },
}
const timeTotals = { exact_duration_seconds: "1800", reportable_duration_seconds: "1800", entry_count: "1", report_revision: "example-opaque-time-report" }

export const timesheetCSV = "Date,User,User Email,Project,Task Code,Task Title,Duration,Duration Minutes,Note\n2026-10-27,Alex Morgan,alex@example.test,Release preparation,APP-42,Review release checklist,1800,30.00,Review release checklist.\n"
const timePolicy = { workspace_id: workspace, enabled: false, rounding_mode: "exact", revision: "0" }

const webhookEndpoint = {
  id: "0198ac5e-f9b7-7000-8000-000000000081", workspace_id: workspace,
  url: "https://example.com/assign-events", event_types: ["task.updated"], project_ids: [],
  state: "active", health: "healthy", revision: "1", secret_version: 1,
  created_at: "2026-10-27T10:00:00Z", updated_at: "2026-10-27T10:00:00Z",
  item_validator: { etag: '\"example-webhook-endpoint-identity-1\"', encoding: "identity", representation: "canonical-item" },
}
const { item_validator: webhookObservationValidator, ...webhookCommittedEndpoint } = webhookEndpoint
const webhookDelivery = {
  id: "0198ac5e-f9b7-7000-8000-000000000082", endpoint_id: webhookEndpoint.id,
  event_id: "0198ac5e-f9b7-7000-8000-000000000083", event_type: "task.updated",
  state: "succeeded", attempts: 1, replay_count: 0, revision: "1", last_status: 204, last_error: "",
  created_at: "2026-10-27T10:01:00Z", completed_at: "2026-10-27T10:01:01Z", retain_until: "2026-11-03T10:01:00Z",
  item_validator: { etag: '\"example-webhook-delivery-identity-1\"', encoding: "identity", representation: "canonical-item" },
}
const { item_validator: webhookDeliveryObservationValidator, ...webhookCommittedDelivery } = webhookDelivery
const successBodies = {
  resolvelifecyclecompletiontarget: { status_id: "0198ac5e-f9b7-7000-8000-0000000000c2" },
  listlifecycledefinitions: { data: [{
    id: curatedDefinitionId, kind: "task", name: "Release Tasks", revision: "1",
    default_status_id: "0198ac5e-f9b7-7000-8000-0000000000c1", archived_at: null,
    stages: [{
      id: "0198ac5e-f9b7-7000-8000-0000000000c3", name: "Completed", position: "1", revision: "1", archived_at: null,
      behaviors: { notify: true, show_active: false, treat_as_closed: true, counts_as_completed: true,
        allow_changes: true, track_changes: true, resolves_dependencies: true, treat_as_new: false, include_in_progress: false },
      statuses: [
        { id: "0198ac5e-f9b7-7000-8000-0000000000c1", name: "Released", position: "1", archived_at: null },
        { id: "0198ac5e-f9b7-7000-8000-0000000000c2", name: "Verified", position: "2", archived_at: null },
      ],
    }],
    item_validator: { etag: '\"example-lifecycle-identity-1\"', encoding: "identity", representation: "canonical-item" },
  }], next_cursor: null },
  previewlifecyclemapping: {
    definition_id: curatedDefinitionId, kind: "task", source_revision: "1",
    destination_revisions: { [curatedDefinitionId]: "1" },
    destination_validators: { [curatedDefinitionId]: '\"example-lifecycle-identity-1\"' },
    replaces_default: false, requires_acknowledgement: true,
    entries: [{ source_status_id: Object.keys(lifecycleMapping)[0], destination_status_id: Object.values(lifecycleMapping)[0], preserved: false, entity_count: 24, truncated: false, behavior_changes: [] }],
  },
  getlifecyclemigration: {
    id: lifecycleMigrationJobId, definition_id: curatedDefinitionId, kind: "task", status: "failed",
    mapping: lifecycleMapping, source_revision: "1", replaces_default: false,
    impact_count: 24, processed: "12", attempt_count: 1, error_code: "migration_failed",
    applied_revision: null, applied_at: null,
  },
  retrylifecyclemigration: { outcome: "active", id: "0198ac5e-f9b7-7000-8000-0000000000c7", state: "pending", progress: null, expires_at: "2026-11-03T10:00:00Z" },
  listworkspacemcpservicecredentials: { data: [{
    id: mcpServiceCredentialId, actor_id: "0198ac5e-f9b7-7000-8000-0000000000c8",
    prefix: "example_mcp", name: "Release checklist reader", scopes: ["assign:tasks:read"],
    project_ids: ["0198ac5e-f9b7-7000-8000-000000000002"], created_at: timestamp,
    last_used_at: null, expires_at: "2026-11-26T10:00:00Z",
  }], next_cursor: null },
  getworkspacemilestonelifecycle: {
    workspace_id: "0198ac5e-f9b7-7000-8000-000000000001", revision: "1",
    stages: [
      { id: "planned", label: "Planned", status: "planned", archived: false },
      { id: "active", label: "In progress", status: "active", archived: false },
      { id: "completed", label: "Completed", status: "completed", archived: false },
      { id: "cancelled", label: "Cancelled", status: "cancelled", archived: false },
    ],
  },
  updateworkspacemilestonelifecycle: {
    workspace_id: workspace, revision: "2", stages: operationExamples.updateworkspacemilestonelifecycle.body.stages,
  },
  getworkspaceprojection: {
    kind: "baseline", contract_epoch: 1, schema_epoch: 1,
    scope: { id: "0198ac5e-f9b7-7000-8000-0000000000d1", workspace_id: workspace,
      authority_revision: "1", schema_epoch: 1, contract_epoch: 1, view_hash: "a".repeat(64), generation: "1" },
    epoch: "0198ac5e-f9b7-7000-8000-0000000000d2", through: "12", has_more: false, cursor: null,
    records: [], views: [{ scope_id: "0198ac5e-f9b7-7000-8000-0000000000d1", revision: "1",
      ordered_ids: [], next_cursor: null, complete: true, count_semantics: "exact", total_count: "0" }],
    manifest: { field_set: "metadata", records_complete: true, through: "12", retained_floor: "0", contract_epoch: 1, schema_epoch: 1 },
  },
  listworkspacestatuses: { data: [workspaceReviewStatus], next_cursor: null },
  createworkspacestatus: workspaceReviewStatus,
  applylifecyclemapping: { outcome: "active", id: "0198ac5e-f9b7-7000-8000-0000000000c4", state: "pending", progress: null, expires_at: "2026-11-03T10:00:00Z" },
  listlifecyclebehaviors: { data: [
    ...["notify", "show_active", "treat_as_closed", "counts_as_completed"].map((key) => ({ key, kinds: ["task", "milestone", "project"] })),
    ...["allow_changes", "track_changes", "resolves_dependencies", "treat_as_new", "include_in_progress"].map((key) => ({ key, kinds: ["task"] })),
    { key: "accept_new_tasks", kinds: ["milestone", "project"] },
    { key: "accept_new_milestones", kinds: ["project"] },
  ], next_cursor: null },
  listworkspaceactivity: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000090", occurred_at: timestamp,
    actor: { id: actorId, display_name: "Alex Morgan", automation: false }, provenance: null,
    action: "task.completed", resource_type: "task", resource_id: taskId,
    deep_link: `/tasks/${taskId}`, summary: { title: "Review release checklist" },
    count: "1", operation_id: null, affected: [],
  }], next_cursor: null },
  listworkspacefeatures: { data: [{ ...workspaceFeature, item_validator: { etag: '"example-feature-identity-1"', encoding: "identity", representation: "canonical-item" } }], next_cursor: null },
  updateworkspacefeature: { ...workspaceFeature, enabled: true, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  clearworkspaceiconupload: iconWorkspace,
  setworkspaceiconupload: { ...iconWorkspace, icon_url: `/api/v1/attachments/${workspaceIconAttachmentId}/content` },
  listworkspacewebhookendpoints: { data: [webhookEndpoint], next_cursor: null, has_more: false },
  createwebhookendpoint: { endpoint: webhookCommittedEndpoint, signing_secret: "whsec_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" },
  getwebhookendpoint: webhookEndpoint,
  updatewebhookendpointstate: { ...webhookCommittedEndpoint, state: "paused", health: "paused", revision: "2", updated_at: "2026-10-27T10:02:00Z" },
  listwebhookdeliveries: { data: [webhookDelivery], next_cursor: null, has_more: false },
  getwebhookdelivery: webhookDelivery,
  redeliverwebhookdelivery: { ...webhookCommittedDelivery,
    state: "pending", replay_count: 1, revision: "2", completed_at: null, last_status: null },
  rotatewebhookendpointsecret: { endpoint: { ...webhookCommittedEndpoint, secret_version: 2, revision: "2", updated_at: "2026-10-27T10:02:00Z" },
    signing_secret: "whsec_AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=", previous_valid_until: "2026-10-27T10:07:00Z" },
  createtimesheetexport: {
    id: timesheetExportId, outcome: "succeeded", state: "succeeded", created_at: timestamp, updated_at: timestamp,
    expires_at: "2026-11-03T10:00:00Z",
    result: { href: `/api/v1/timesheet-exports/${timesheetExportId}/content`, kind: "authorized-resource", media_type: "text/csv", operation_id: "getTimesheetExport" },
  },
  gettimesheetexport: timesheetCSV,
  getmytimesheet: { data: [{ ...timeEntry, project_name: "Release preparation", task_number: "42", task_title: "Review release checklist" }],
    totals: { exact_duration_seconds: "1800", reportable_duration_seconds: "1800", entry_count: "1" }, next_cursor: null, report_revision: timeTotals.report_revision },
  listworkspacetimeentries: { data: [timeEntry], next_cursor: null, report_revision: timeTotals.report_revision },
  gettimetrackingpolicy: timePolicy,
  updatetimetrackingpolicy: { ...timePolicy, enabled: true, rounding_mode: "ceil_15_minutes", revision: "1", updated_at: timestamp },
  listprojecttimebreakdown: { data: [{ task_id: taskId, task_number: "42", task_title: "Review release checklist",
    exact_duration_seconds: timeTotals.exact_duration_seconds, reportable_duration_seconds: timeTotals.reportable_duration_seconds, entry_count: timeTotals.entry_count,
  }], next_cursor: null, report_revision: timeTotals.report_revision, group_by: "task", redacted: false },
  getprojecttimetotals: timeTotals,
  createtasktimeentry: timeEntry,
  gettasktimetotals: timeTotals,
  voidtimeentry: { ...timeEntry, revision: "2", voided_at: "2026-10-27T10:01:00Z", updated_at: "2026-10-27T10:01:00Z",
    item_validator: { ...timeEntry.item_validator, etag: '"example-time-entry-voided-2"' } },
  updatetimeentry: { ...timeEntry, duration_input: "45m", exact_duration_seconds: "2700", reportable_duration_seconds: "2700",
    revision: "2", updated_at: "2026-10-27T10:01:00Z", item_validator: { ...timeEntry.item_validator, etag: '"example-time-entry-identity-2"' } },
  createtasksavedview: savedReleaseView,
  updatetasksavedview: { ...savedReleaseView, name: "Release preparation", revision: "2", updated_at: "2026-10-27T10:01:00Z",
    item_validator: { ...savedReleaseView.item_validator, etag: '\"example-saved-view-identity-2\"' } },
  deletetasksavedview: { deleted: true },
  createtaskselection: releaseTaskSelection,
  gettaskselection: releaseTaskSelection,
  listworkspacetasks: { data: [{
    web_url: "https://app.assign.so/w/acme/tasks/APP-42", id: taskId, workspace_id: workspace, project_id: projectId,
    task_number: "42", code: "APP-42", status_id: statusId, rank: "a0", title: "Plan the next release",
    priority: "medium", revision: "1", created_at: timestamp, updated_at: timestamp,
    archived_at: null, trashed_at: null, purge_after: null, purged_at: null, lifecycle: "active",
    resolved_at: null, resolved_by: null, resolution: null, assignee_actor_id: null, due_on: null,
    milestone_id: null, label_ids: [], status_lifecycle: {
      stage_id: statusId, stage_revision: "1", definition_id: "0198ac5e-f9b7-7000-8000-000000000086", definition_revision: "1",
    },
  }], next_cursor: null, coverage: "complete", included: {
    assignees: [], statuses: [], milestones: [], labels: [], completeness: "partial",
    unavailable: [{ kind: "status", id: statusId, project_id: projectId, reason: "unavailable" }],
  } },
  resolveworkspacemember: { match: "exact", candidates: [{ membership_id: "0198ac5e-f9b7-7000-8000-000000000007",
    actor_id: actorId, display_name: "Alex Morgan", username: "alex-morgan", revision: "1" }], truncated: false },
  getoperationreceipt: taskReceipt,
  undooperationreceipt: { ...taskReceipt, operation_id: taskInverseReceiptId, tool: "operation_receipt_undo",
    expected_revision: "2", revision: "3", committed_at: "2026-10-27T10:01:00Z" },
  createtaskresultset: releaseTaskResultSet,
  gettaskresultset: releaseTaskResultSet,
  listtasksavedviews: { data: [{ schema: "task.saved_view.v1", id: taskSavedViewId, revision: "1",
    name: "Active release Tasks", query: releaseTaskQuery, created_at: timestamp, updated_at: timestamp,
    item_validator: { etag: '\"example-saved-view-identity-1\"', encoding: "identity", representation: "canonical-item" },
  }], next_cursor: null },
  getchangesetoperationresult: changeSetResult,
  createchangeset: changeSetProposal,
  applychangeset: changeSetResult,
  getchangeset: changeSetProposal,
  createdocumentpatch: documentPatchDraft,
  getdocumentpatch: documentPatchDraft,
  listtasksubscribers: { data: [{
    subscription_id: taskSubscription.id, actor_id: actorId, display_name: "Alex Morgan", following_since: timestamp,
  }], next_cursor: null },
  gettasksubscription: { subscription: taskSubscription },
  followtask: taskSubscription,
  unfollowtask: { ...taskSubscription, state: "unfollowed", revision: "2", unfollowed_at: "2026-10-27T10:05:00Z", updated_at: "2026-10-27T10:05:00Z" },
  mutetask: { ...taskSubscription, state: "muted", revision: "3", muted_at: "2026-10-27T10:10:00Z", updated_at: "2026-10-27T10:10:00Z" },
  unmutetask: { ...taskSubscription, revision: "4", updated_at: "2026-10-27T10:15:00Z" },
  listtaskparticipants: { data: [{
    actor: { id: actorId, display_name: "Alex Morgan" }, is_creator: true,
    is_assigned_now: true, was_previously_assigned: false, last_assigned_at: timestamp,
  }], next_cursor: null },
  listtaskrelations: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000092", project_id: projectId, source_task_id: taskId,
    target_task_id: "0198ac5e-f9b7-7000-8000-00000000000c", type: "blocks", revision: "1",
    related_task: { id: "0198ac5e-f9b7-7000-8000-00000000000c", code: "APP-43", title: "Publish the release notes", status_id: statusId },
    item_validator: { etag: '"example-task-relation-identity-1"', encoding: "identity", representation: "canonical-item" },
  }], next_cursor: null },
  createtaskrelation: {
    id: "0198ac5e-f9b7-7000-8000-000000000092", project_id: projectId, source_task_id: taskId,
    target_task_id: "0198ac5e-f9b7-7000-8000-00000000000c", type: "blocks", revision: "1",
    item_validator: { etag: '"example-task-relation-identity-1"', encoding: "identity", representation: "canonical-item" },
  },
  reopentask: {
    task: { ...canonicalTask, status_id: "0198ac5e-f9b7-7000-8000-000000000084", completed_at: null,
      assignee_actor_id: actorId, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
    reassigned: false,
    item_validator: { etag: '"example-reopened-task-identity-2"', encoding: "identity", representation: "canonical-item" },
  },
  restoretask: {
    ...canonicalTask, assignee_actor_id: actorId, revision: "2", updated_at: "2026-10-27T10:01:00Z",
    item_validator: { etag: '"example-restored-task-identity-2"', encoding: "identity", representation: "canonical-item" },
  },
  starttask: {
    task: { ...canonicalTask, status_id: "0198ac5e-f9b7-7000-8000-000000000084", completed_at: null,
      assignee_actor_id: actorId, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
    reassigned: false,
    item_validator: { etag: '"example-started-task-identity-2"', encoding: "identity", representation: "canonical-item" },
  },
  gettaskcontext: { task_code: "APP-42", profile: "compact", markdown: "# APP-42: Plan the next release\n\nReview the release checklist.", truncated: false, format: "markdown", omissions: [] },
  listtaskdescriptionrevisions: { data: [{ task_id: taskId, revision: "1", actor_id: actorId, change_kind: "baseline", description: canonicalTask.description, description_text: "Review the release checklist.", created_at: timestamp }], next_cursor: null, has_more: false },
  restoretaskdescriptionrevision: {
    ...canonicalTask, description: undefined, code: "APP-42", summary: null, revision: "3", updated_at: "2026-10-27T10:02:00Z",
  },
  duplicatetask: {
    task: { ...canonicalTask, description: undefined, id: "0198ac5e-f9b7-7000-8000-000000000090", task_number: "43", code: "APP-43", summary: null, rank: "a1" },
    copied_task_count: 1, copied_subtask_count: 0, copied_label_count: 0, copied_attachment_count: 0, issues: [],
    item_validator: { etag: '"example-task-copy-identity-1"', encoding: "identity", representation: "canonical-item" },
  },
  movetask: {
    ...canonicalTask, status_id: operationExamples.movetask.body.status_id, rank: "a1", revision: "2", updated_at: "2026-10-27T10:01:00Z",
    item_validator: { etag: '"example-task-identity-2"', encoding: "identity", representation: "canonical-item" },
  },
  movestatus: { ...reviewStatus, position: 2, revision: 2, updated_at: "2026-10-27T10:01:00Z" },
  listworkspacemilestones: { data: [releaseMilestone], next_cursor: null },
  getworkspaceprojectlifecyclepolicy: { workspace_id: workspace, enabled: false, revision: "1", updated_at: timestamp },
  updateworkspaceprojectlifecyclepolicy: { workspace_id: workspace, enabled: true, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  listworkspaceprojectstates: { data: [{ ...releaseProjectState, item_validator: { etag: '"example-project-state-identity-1"', encoding: "identity", representation: "canonical-item" } }], next_cursor: null },
  createworkspaceprojectstate: releaseProjectState,
  updateprojectmember: { ...projectMemberRecord, role: "manager", revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  createmilestone: { ...releaseMilestone, status: "planned", code: "APP-M1", progress: { total_tasks: "0", completed_tasks: "0", incomplete_tasks: "0", tasks_by_category: {} } },
  moveproject: { ...projectRecord, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  getprojectoverview: {
    project: projectRecord,
    members: [{ actor_id: actorId, display_name: "Alex Morgan", role: "manager", owner: true }, { actor_id: projectMemberActorId, display_name: "Sam Rivera", role: "contributor", owner: false }],
    member_count: "2",
    task_counts: { total: "0", open: "0", completed: "0", overdue: "0", unassigned: "0", archived: "0", trashed: "0", purged: "0", completion_percentage: 0 },
    milestone_counts: { total: "1", completed: "0", task_total: "0", task_completed: "0", task_completion_percentage: 0 },
    status_distribution: [{ id: statusId, label: "To do", category: "todo", status_type: "unstarted", icon: null, color: null, position: "1", task_count: "0" }],
    ongoing_work: [], recent_tasks: [], recent_activity: [], recent_documents: [], recent_files: [],
    freshness: { generated_at: timestamp, source_updated_at: timestamp },
    degradation: { degraded: false, unavailable_sections: [] },
  },
  createprojectstatus: reviewStatus,
  getmilestone: releaseMilestone,
  updatemilestone: { ...releaseMilestone, ...operationExamples.updatemilestone.body, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  updateprojectstate: { ...releaseProjectState, ...operationExamples.updateprojectstate.body, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  getworkspacepersonprofile: {
    user_id: membershipRecord.user_id, actor_id: actorId, display_name: "Alex Morgan", username: "alex-morgan",
    workspace_role: "member", status: "active", is_you: false, title: "Product designer",
    bio: "Designing the next release.", profile_status: "Reviewing release plans",
    profile_picture_url: `/api/v1/workspaces/${workspace}/people/${membershipRecord.user_id}/profile-picture/content`,
    avatar_initials: null, avatar_color: null,
  },
  listworkspacepersonactivity: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000080", occurred_at: timestamp,
    actor: { id: actorId, display_name: "Alex Morgan", automation: false }, provenance: null,
    action: "task.created", resource_type: "task", resource_id: taskId,
    deep_link: `/acme-studio/release-planning/tasks/${taskId}`, summary: { title: "Plan the next release" },
  }], next_cursor: null },
  listtaskrichentities: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000069", installation_id: sentryInstallationId, provider_key: "sentry",
    entity_type: "sentry.issue", external_id: "1234567890", human_identifier: "RELEASE-42",
    canonical_url: "https://sentry.io/organizations/acme-studio/issues/1234567890/", display_name: "Release upload failed",
    snapshot_schema_version: 1, snapshot: { title: "Release upload failed", summary: "Upload timed out while publishing the release.",
      status: { label: "Unresolved", tone: "warning" }, metrics: [{ id: "events", label: "Events", value: "12" }],
      properties: [{ id: "project", label: "Project", type: "text", value: "Release planning" }],
      actions: [{ id: "open", label: "Open in Sentry", kind: "open_external", url: "https://sentry.io/organizations/acme-studio/issues/1234567890/" }] },
    sync_status: "current", sync_message: null, last_synced_at: timestamp, last_changed_at: timestamp,
  }], next_cursor: null, has_more: false },
  beginintegrationauthorization: { id: integrationAuthorizationId, status: "authorization_started", expires_at: "2026-10-27T10:10:00Z", state: integrationExampleState },
  completeintegrationauthorizationwithcredential: sentryInstallation,
  listworkspaceintegrationinstallations: { data: [sentryInstallation], next_cursor: null, has_more: false },
  requestintegrationprovider: { id: "0198ac5e-f9b7-7000-8000-000000000070", workspace_id: workspace,
    ...providerRequestInput, created_at: timestamp, updated_at: timestamp },
  getknowledgerepository: { workspace_id: workspace, repository: repositoryRecord },
  updateknowledgerepositorystate: { workspace_id: workspace, repository_id: repositoryId, revision: "4", status: "paused" },
  connectknowledgerepository: { workspace_id: workspace, repository_id: repositoryId, revision: "1", status: "initializing" },
  listknowledgerepositoryconflicts: { items: [repositoryConflict], next_cursor: null, truncated: false },
  resolveknowledgerepositoryconflict: { ...repositoryAcceptance, id: "0198ac5e-f9b7-7000-8000-000000000055" },
  importknowledgerepository: repositoryAcceptance,
  listknowledgerepositorysyncruns: { items: [repositorySyncRun], next_cursor: null, truncated: false },
  getknowledgerepositorysyncrun: repositorySyncRun,
  syncknowledgerepository: { ...repositoryAcceptance, id: "0198ac5e-f9b7-7000-8000-000000000057" },
  listdocumentrevisions: { data: [editedDocumentRevision, documentRevision], next_cursor: null },
  comparedocumentrevisions: { from: documentRevision, to: editedDocumentRevision, changed_fields: ["title"] },
  getdocumentrevision: { ...documentRevision, content: richText("Review the release checklist.") },
  restoredocumentrevision: { ...documentRow, revision: "3", updated_at: "2026-10-27T10:02:00Z" },
  listworkspacedocuments: { data: [documentRow], next_cursor: null },
  createdocument: documentRow,
  replacedocumentcontent: { document_id: documentId, revision: 2, content: richText("Review the release checklist before publishing."), updated_at: "2026-10-27T10:01:00Z" },
  listdocumentworklinks: { data: [{ ...documentWorkLink, item_validator: { etag: '\"example-document-link-identity-1\"', encoding: "identity", representation: "canonical-item" } }], next_cursor: null },
  createdocumentworklink: documentWorkLink,
  restoredocument: { ...documentRow, revision: "4", updated_at: "2026-10-27T10:03:00Z", archived_at: null },
  getdocument: canonicalDocument,
  updatedocument: { ...documentRow, title: "Release readiness checklist", revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  archivedocument: { ...documentRow, title: "Release readiness checklist", revision: "3", archived_at: "2026-10-27T10:02:00Z", updated_at: "2026-10-27T10:02:00Z" },
  listdocumentattachments: { data: [attachmentRecord], next_cursor: null },
  attachdocumentattachment: attachmentRecord,
  getdocumentcontent: { document_id: documentId, revision: 1, content: richText("Review the release checklist."), updated_at: timestamp },
  undocommand: {
    command: { ...reversibleCommand, state: "undone" },
    task: { ...taskCommand, label_ids: [], revision: 3, updated_at: "2026-10-27T10:02:00Z" },
  },
  redocommand: {
    command: reversibleCommand,
    task: { ...taskCommand, label_ids: [], title: "Review the release plan", revision: 4, updated_at: "2026-10-27T10:03:00Z" },
  },
  reserveattachmentupload: {
    upload_id: attachmentUploadId, expires_at: "2026-10-27T10:15:00Z", content_length: 30,
    upload_url: "https://uploads.example.com/reservations/0198ac5e-f9b7-7000-8000-000000000030?signature=example",
    method: "PUT", required_headers: { "Content-Type": "text/plain" },
  },
  completeattachmentupload: attachmentRecord,
  getattachment: attachmentRecord,
  createworkspaceagentrun: agentOperation,
  getoperation: { ...agentOperation, state: "running", updated_at: "2026-10-27T10:01:00Z" },
  canceloperation: { ...agentOperation, state: "cancel_requested", updated_at: "2026-10-27T10:02:00Z" },
  getworkspaceagentrun: agentRun,
  listworkspaceagentrunactions: { data: [agentAction], next_cursor: null, has_more: false,
    pending_decisions: { data: [{ approval_id: agentAction.approval.id, expected_revision: "1", state: "pending", can_decide: true }], next_cursor: null, has_more: false } },
  decideworkspaceagentapproval: { ...agentAction, state: "rejected", approval: { ...agentAction.approval,
    state: "rejected", decided_by_actor_id: actorId, decided_at: "2026-10-27T10:01:00Z",
    decision_reason: operationExamples.decideworkspaceagentapproval.body.reason,
  } },
  cancelworkspaceagentrun: { ...agentRun, cancellation_requested_at: "2026-10-27T10:02:00Z", updated_at: "2026-10-27T10:02:00Z" },
  listworkspaceagentrunoutputs: { data: [{
    id: "0198ac5e-f9b7-7000-8000-00000000002c", actor_id: agentInstance.actor_id, run_id: agentRun.id,
    agent_instance_id: agentInstance.id, definition_version: agentRun.definition_version, kind: "report",
    target_type: "task", target_id: taskId, content: "Confirm the release date before updating the checklist.", created_at: timestamp,
  }], next_cursor: null, has_more: false },
  removeworkspaceagent: { ...agentInstance, status: "paused", removed_at: "2026-10-27T10:01:00Z", revision: 2, updated_at: "2026-10-27T10:01:00Z" },
  getworkspaceagent: agentInstance,
  updateworkspaceagent: { ...agentInstance, ...operationExamples.updateworkspaceagent.body, revision: 2, updated_at: "2026-10-27T10:01:00Z" },
  quarantineworkspaceagent: { ...agentInstance, status: "paused", quarantined_at: "2026-10-27T10:01:00Z",
    quarantine_reason: operationExamples.quarantineworkspaceagent.body.reason, rollback_definition_version: "0.9.0",
    revision: 2, updated_at: "2026-10-27T10:01:00Z" },
  rollbackworkspaceagent: { ...agentInstance, definition: { ...curatedAgentDefinition, version: "0.9.0" }, status: "paused",
    revision: 3, updated_at: "2026-10-27T10:02:00Z" },
  listworkspaceagentruns: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000028", workspace_id: workspace, agent_instance_id: agentInstance.id,
    definition_id: curatedDefinitionId, definition_version: "1.0.0", trigger_type: "manual", state: "queued",
    initiated_by_actor_id: actorId, scheduled_for: null, safe_summary: "", error_code: null,
    reserved_credits: 0, used_credits: 0, cancellation_requested_at: null, started_at: null, finished_at: null,
    created_at: timestamp, updated_at: timestamp,
  }], next_cursor: null, has_more: false, total_count: 1 },
  listworkspaceagents: { data: [{ ...agentInstance, catalog_updated_at: timestamp }], next_cursor: null, has_more: false },
  createworkspaceagent: agentInstance,
  listworkspaceagentdefinitions: { data: [curatedAgentDefinition], next_cursor: null, has_more: false },
  listworkspacecustomagents: { data: [{ ...customAgentRecord, updated_at: timestamp }], next_cursor: null, has_more: false },
  createworkspacecustomagent: customAgentRecord,
  getworkspacecustomagent: customAgentRecord,
  updateworkspacecustomagent: updatedCustomAgent,
  delegatetasktoworkspacecustomagent: queuedAgentRequest,
  admitworkspacecustomagentrequest: manualAgentRequest,
  listworkspacecustomagentrequests: { data: [manualAgentRequest, queuedAgentRequest], next_cursor: null, has_more: false },
  getworkspacecustomagentprofile: {
    definition_id: customAgentRecord.definition_id, actor_id: customAgentRecord.actor_id,
    name: customAgentRecord.name, description: customAgentRecord.description, responsibility: customAgentRecord.responsibility,
    manager_actor_id: actorId, personality: "", conversation_starters: [], knowledge_categories: [],
    capabilities: [], prohibited_actions: [], approval_boundary: "Manager approval is required for managed actions.",
    trigger_types: ["manual"], state: "active", revision: 2, latest_outcome: "",
  },
  getworkspacecustomagentusage: {
    definition_id: customAgentRecord.definition_id, ...operationExamples.getworkspacecustomagentusage.query,
    runs: 2, pending_runs: 2, reserved_credits: 0, pending_reserved_credits: 0, used_credits: 0,
    reconciled_at: "2026-11-01T00:00:00Z", scope: "visible-runs",
  },
  listactivitygroups: {
    "before": "2026-10-28T00:00:00Z",
    "counts": {
      "distinct_resources": {
        "accuracy": "exact",
        "resource_kind": "resource",
        "value": 1
      },
      "groups": {
        "accuracy": "exact",
        "resource_kind": "group",
        "value": 1
      },
      "occurrences": {
        "accuracy": "exact",
        "resource_kind": "occurrence",
        "value": 1
      },
      "projects": {
        "accuracy": "exact",
        "resource_kind": "project",
        "value": 1
      }
    },
    "coverage": {
      "history_before_retention": "unknown",
      "reasons": [],
      "retained_days": 90,
      "retained_from": "2026-07-30T07:00:00Z",
      "status": "complete"
    },
    "data": [
      {
        "id": "group_example",
        "revision": "revision_example",
        "kind": "tasks",
        "outcome": "task.created",
        "icon": "task",
        "importance": "normal",
        "day": "2026-10-27",
        "first_occurred_at": "2026-10-27T12:00:00Z",
        "last_occurred_at": "2026-10-27T12:00:00Z",
        "actor": {
          "automation": false,
          "display_name": "Alex Morgan",
          "id": "019a2b80-0000-7000-8000-000000000003",
          "identity_state": "available",
          "profile_link": null
        },
        "provenance": null,
        "counts": {
          "children": {
            "accuracy": "exact",
            "resource_kind": "child",
            "value": 1
          },
          "distinct_resources": {
            "accuracy": "exact",
            "resource_kind": "task",
            "value": 1
          },
          "occurrences": {
            "accuracy": "exact",
            "resource_kind": "occurrence",
            "value": 1
          },
          "projects": {
            "accuracy": "exact",
            "resource_kind": "project",
            "value": 1
          }
        },
        "facts": [],
        "references": [
          {
            "id": "019a2b80-0000-7000-8000-000000000001",
            "kind": "task",
            "label": null,
            "link": "/tasks/019a2b80-0000-7000-8000-000000000001",
            "role": "resource",
            "state": "available"
          },
          {
            "id": "019a2b80-0000-7000-8000-000000000002",
            "kind": "project",
            "label": null,
            "link": "/projects/019a2b80-0000-7000-8000-000000000002",
            "role": "project_id",
            "state": "available"
          }
        ],
        "preview_keys": [],
        "expansion": {
          "available": true,
          "coverage": {
            "history_before_retention": "unknown",
            "reasons": [],
            "retained_days": 90,
            "retained_from": "2026-07-30T07:00:00Z",
            "status": "complete"
          },
          "first_cursor": null
        }
      }
    ],
    "from": "2026-10-27T00:00:00Z",
    "has_more": false,
    "next_cursor": null,
    "observed_at": "2026-10-28T07:00:00Z",
    "policy_version": "activity.af01.v1",
    "previews": [],
    "resource_id": null,
    "schema": "assign.activity.groups.v1",
    "scope": "workspace",
    "snapshot": "opaque-parent-snapshot",
    "snapshot_id": "snapshot_example",
    "time_zone": "UTC"
  },
  getprojectdisplaypreferences: { workspace_id: workspace, sort: "default", project_ids: [], revision: "1", updated_at: timestamp },
  updateprojectdisplaypreferences: { workspace_id: workspace, ...operationExamples.updateprojectdisplaypreferences.body, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  getprojectshortcuts: { workspace_id: workspace, slots: [projectId, null, null, null, null, null, null, null, null], customized: false, revision: "1", updated_at: timestamp },
  updateprojectshortcuts: { workspace_id: workspace, ...operationExamples.updateprojectshortcuts.body, customized: true, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  listcurrentworkcandidates: { data: [{ ...currentWork.current,
    task_id: "0198ac5e-f9b7-7000-8000-00000000000c", task_number: "43", task_code: "APP-43",
    title: "Review the release checklist",
  }], next_cursor: null, has_more: false },
  listinboxitems: { data: [inboxRecord], next_cursor: null, unread_count: "1" },
  convergeinboxreadstate: { cutoff: timestamp, changed: "1", unread_count: "0" },
  listnotificationpreferences: { data: [notificationPreference], next_cursor: "example-opaque-preference-continuation" },
  getnotificationpreference: notificationPreference,
  updatenotificationpreference: { ...notificationPreference, web_enabled: false, revision: "1", updated_at: "2026-10-27T10:01:00Z" },
  getinboxitem: inboxRecord,
  updateinboxitemreadstate: { ...inboxRecord, read_at: "2026-10-27T10:01:00Z", revision: "2" },
  getcurrentwork: currentWork,
  setcurrenttask: { ...currentWork, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  clearcurrenttask: { ...currentWork, current: null, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  resendworkspaceinvitation: { invitation: { ...invitationRecord,
    id: "0198ac5e-f9b7-7000-8000-00000000000a",
    created_at: "2026-10-28T10:00:00Z", expires_at: "2026-11-04T10:00:00Z",
  } },
  createworkspaceinvitation: { invitation: invitationRecord },
  listworkspaceinvitations: { data: [{ ...invitationRecord,
    item_validator: { etag: '"example-invitation-identity-1"', encoding: "identity", representation: "canonical-item" },
  }], next_cursor: null },
  addworkspacemember: membershipRecord,
  updateworkspacemembership: { ...membershipRecord, role: "admin", revision: "2" },
  listworkspacemembers: { items: [{
    membership_id: "0198ac5e-f9b7-7000-8000-000000000007", user_id: "0198ac5e-f9b7-7000-8000-000000000008",
    actor_id: actorId, display_name: "Alex Morgan", username: "alex-morgan", avatar_initials: null, avatar_color: null,
    role: "member", state: "active", revision: "1", profile_picture_url: null,
    item_validator: { etag: '\"example-member-identity-1\"', encoding: "identity", representation: "canonical-item" },
  }], next_cursor: null, has_more: false },
  getworkspace: {
    id: workspace, name: "Acme Studio", slug: "acme-studio", icon_url: null, revision: "1",
    created_at: timestamp, updated_at: timestamp, archived_at: null,
  },
  updateworkspace: {
    id: workspace, name: "Acme Design Studio", slug: "acme-studio", icon_url: null, revision: "2",
    created_at: timestamp, updated_at: "2026-10-27T10:01:00Z", archived_at: null,
  },
  getworkspaceaiaccesspolicy: { enabled: true, revision: "1", updated_at: timestamp },
  updateworkspaceaiaccesspolicy: { enabled: false, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  getworkspacesettings: workspaceSettings,
  updateworkspacesettings: { ...workspaceSettings, default_task_priority: "high", revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  getcomment: markdownComment,
  updatecomment: { ...markdownComment, revision: 2, edited_at: "2026-10-27T10:01:00Z", updated_at: "2026-10-27T10:01:00Z" },
  addcommentreaction: { ...jsonComment, reactions: [{ reaction: "thumbs_up", count: 1, reacted_by_viewer: true }] },
  removecommentreaction: jsonComment,
  listtaskactivity: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000090", occurred_at: timestamp,
    actor: { id: actorId, display_name: "Alex Morgan", automation: false }, provenance: null,
    action: "task.updated", resource_type: "task", resource_id: taskId,
    deep_link: `/tasks/${taskId}`, summary: { title: canonicalTask.title }, count: 1, operation_id: null,
  }], next_cursor: null },
  archivetask: { ...canonicalTask, lifecycle: "archived", archived_at: "2026-10-27T10:01:00Z", updated_at: "2026-10-27T10:01:00Z", revision: "2" },
  listtaskassignments: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000091",
    actor: { id: actorId, display_name: "Alex Morgan" },
    assigned_by: { id: actorId, display_name: "Alex Morgan" },
    assigned_at: timestamp, unassigned_at: null, source: "direct", active: true,
  }], next_cursor: null, has_more: false },
  listtaskattachments: { data: [attachmentRecord], next_cursor: null, has_more: false },
  attachtaskattachment: attachmentRecord,
  completetask: {
    task: { ...canonicalTask, status_id: completionPolicyInput.default_done_status_id,
      completed_at: "2026-10-27T10:01:00Z", updated_at: "2026-10-27T10:01:00Z", revision: "2" },
    reassigned: false,
    item_validator: { etag: '"example-completed-task-identity-2"', encoding: "identity", representation: "canonical-item" },
  },
  listtaskcomments: { data: [markdownComment], next_cursor: null, has_more: false, total_count: 1 },
  createcomment: markdownComment,
  getproject: projectRecord,
  moveprojectstate: { ...releaseProjectState, position: "3", revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  renameproject: { ...projectRecord, ...operationExamples.renameproject.body, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  listprojectactivity: { data: [{
    id: "0198ac5e-f9b7-7000-8000-000000000083", occurred_at: "2026-10-27T10:01:00Z",
    actor: { id: actorId, display_name: "Alex Morgan", automation: false }, provenance: null,
    action: "project.updated", resource_type: "project", resource_id: projectId,
    deep_link: `/projects/${projectId}`, summary: { name: "Release readiness" },
    count: "1", operation_id: null, affected: [],
  }], next_cursor: null },
  listprojecttaskattachments: { data: [attachmentRecord], next_cursor: null },
  getstatus: reviewStatus,
  updatestatus: { ...reviewStatus, label: "Release review", revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  archivestatusandreplace: { ...reviewStatus, revision: "2", archived_at: "2026-10-27T10:01:00Z", updated_at: "2026-10-27T10:01:00Z" },
  previewstatuslifecyclechange: { status_id: reviewStatus.id, current_status_type: "started", target_status_type: "completed", affected_task_count: "12", synchronous_limit: "1000", allowed: true },
  listprojectattachments: { data: [attachmentRecord], next_cursor: null },
  attachprojectattachment: attachmentRecord,
  getprojectcompletionpolicy: projectCompletionPolicy,
  updateprojectcompletionpolicy: { ...projectCompletionPolicy, revision: "2" },
  listprojectmembers: { data: [{ ...projectMemberRecord, item_validator: {
    etag: '\"example-project-member-identity-1\"', encoding: "identity", representation: "canonical-item",
  } }], total_count: "1", next_cursor: null },
  addprojectmember: projectMemberRecord,
  listprojectstatuses: { data: [{
    id: statusId, workspace_id: workspace, project_id: projectId, label: "To do", category: "todo", status_type: "unstarted",
    icon: null, color: null, marks_task_resolved: false, position: "1", is_required: true, revision: "1",
    created_at: timestamp, updated_at: timestamp, archived_at: null,
  }], next_cursor: null },
  listworkspaceprojects: { data: [{ ...projectRecord, archived_at: null, task_count: "1" }], next_cursor: null },
  createproject: { ...projectRecord, description: null, next_task_number: "1", archived_at: null },
  createtask: taskCommand,
  gettask: canonicalTask,
  updatetask: { ...taskCommand, title: "Review the release plan", revision: 2, updated_at: "2026-10-27T10:01:00Z" },
  updatetaskrelation: {
    id: "0198ac5e-f9b7-7000-8000-000000000001", project_id: projectId,
    source_task_id: taskId, target_task_id: "0198ac5e-f9b7-7000-8000-000000000004",
    type: "relates", revision: "2",
    item_validator: { etag: '"example-relation-identity-2"', encoding: "identity", representation: "canonical-item" },
  },
  trashtask: {
    ...canonicalTask, title: "Review the release plan", revision: "3", lifecycle: "trashed",
    updated_at: "2026-10-27T10:02:00Z", trashed_at: "2026-10-27T10:02:00Z", purge_after: "2026-11-26T10:02:00Z",
    item_validator: { etag: '"example-task-identity-3"', encoding: "identity", representation: "canonical-item" },
  },
  bulkupdatetasks: { mode: "per_item", items: [
    { item_id: "release-plan", task_id: taskId, outcome: "updated", replayed: false,
      revision: "2", receipt_id: "0198ac5e-f9b7-7000-8000-000000000091" },
    { item_id: "release-checklist", task_id: "0198ac5e-f9b7-7000-8000-000000000004", outcome: "conflict", replayed: false },
  ] },
  gettaskrelatedcontext: { state: "ready", results: [{
    kind: "task", entity_id: "0198ac5e-f9b7-7000-8000-000000000004", project_id: projectId,
    identifier: "APP-43", project_path: "release-planning", title: "Review the release checklist",
    why: "This Task references the same release checklist.", excerpt: "Confirm the release checklist before scheduling the release.",
    source_time: timestamp, confidence: "high", confirmed: false,
  }], stale: false, observed_at: timestamp, truncated: false },
  submittasksuggestionfeedback: { accepted: true, synchronization: "pending" },
  listmywork: { data: [{
    ...canonicalTask, description: undefined, web_url: "https://app.assign.so/w/acme/tasks/APP-42", code: "APP-42",
    assignee_actor_id: actorId, due_on: "2026-10-27", milestone_id: null, label_ids: [],
    status_lifecycle: { stage_id: statusId, stage_revision: "1",
      definition_id: "0198ac5e-f9b7-7000-8000-000000000086", definition_revision: "1" },
  }], included: { ...included, completeness: "partial", unavailable: [
    { kind: "status", id: statusId, project_id: projectId, reason: "unavailable" },
    { kind: "assignee", id: actorId, project_id: projectId, reason: "unavailable" },
  ] }, next_cursor: null, total_count: "1", as_of_date: "2026-10-27", timezone: "UTC" },
  searchworkspace: { data: [{
    resource_type: "document", resource_id: documentId, project_id: projectId, task_id: null,
    status_id: null, status_label: null, status_category: null, status_type: null, status_icon: null, status_color: null,
    title: canonicalDocument.title, snippet: "Review the release checklist.", updated_at: timestamp,
    identifier: documentRow.path, project_path: "release-planning", project_code: "APP",
  }], has_more: false, next_cursor: null },
  listworkspacereferenceoptions: { users: [], agents: [], documents: [{
    type: "document", id: documentId, label: "Release checklist", uri: `assign:document/${documentId}`,
  }], projects: [], tasks: [] },
  requestintegrationaction: sentryResolveAction,
  getintegrationaction: {
    ...sentryResolveAction, status: "succeeded", attempt_count: 1,
    result: { issue_id: "ISSUE-1", status: "resolved" },
    updated_at: "2026-10-27T10:01:00Z", completed_at: "2026-10-27T10:01:00Z",
  },
  disconnectintegrationbinding: sentryBindingDisconnected,
  verifysentrybinding: sentryVerifyAction,
  listintegrationsubscriptions: {
    data: [{ ...sentryAlertSubscription, item_validator: { etag: '"example-subscription-identity-1"', encoding: "identity", representation: "canonical-item" } }],
    next_cursor: null, has_more: false,
  },
  createintegrationsubscription: sentryAlertSubscription,
  listintegrationcatalog: { data: [sentryProvider], next_cursor: null, has_more: false },
  disconnectintegrationinstallation: { ...sentryInstallation, status: "disconnected", health: "needs_attention", revision: "2", updated_at: "2026-10-27T10:02:00Z" },
  getintegrationinstallation: sentryInstallation,
  listintegrationactiondefinitions: { data: [
    { provider_key: "sentry", type: "sentry.binding.verify", display_name: "Verify Sentry binding",
      description: "Observe current Sentry binding readiness through a durable authorized action.",
      authority_mode: "installation", confirmation_required: false, requires_binding: true,
      input_schema: { type: "object", properties: {}, required: [], additionalProperties: false } },
    { provider_key: "sentry", type: "sentry.issue.resolve", display_name: "Resolve Sentry issue",
      description: "Resolve an issue in the connected Sentry project.",
      authority_mode: "installation", confirmation_required: true, requires_binding: true,
      input_schema: sentryIssueInputSchema },
  ], next_cursor: null, has_more: false },
  getintegrationinstallationmanagement: sentryManagement,
  listintegrationresources: { data: [sentryProjectResource], next_cursor: null, has_more: false },
  refreshintegrationresources: {
    id: sentryRefreshActionId, workspace_id: workspace, installation_id: sentryInstallationId, binding_id: null,
    action_type: "integration.resources.refresh", authority_mode: "installation", status: "pending", attempt_count: 0,
    safe_error_code: null, result: null, created_at: timestamp, updated_at: timestamp, completed_at: null,
  },
  updateintegrationsubscription: {
    ...sentryAlertSubscription, status: "paused", revision: "2", updated_at: "2026-10-27T10:01:00Z",
  },
  listpersonalintegrationidentities: { data: [sentryIdentity], next_cursor: null, has_more: false },
  disconnectpersonalintegrationidentity: {
    ...sentryIdentity, identity_status: "disconnected", authorization_status: "revoked", revision: "2",
    updated_at: "2026-10-27T10:02:00Z",
  },
  listprojectintegrationbindings: { data: [sentryProjectBinding], next_cursor: null, has_more: false },
  createprojectintegrationbinding: sentryBindingCreated,
  getlabeldefinition: projectLabel,
  updatelabeldefinition: { ...projectLabel, ...operationExamples.updatelabeldefinition.body, revision: "2", updated_at: "2026-10-27T10:01:00Z" },
  listprojectlabeldefinitions: { data: [projectLabel], next_cursor: null },
  createprojectlabeldefinition: projectLabel,
  listprojecttasklabeloverrides: { data: [{
    project_id: projectId, label_id: workspaceLabelId, definition: workspaceLabel,
    override: { project_id: projectId, label_id: workspaceLabelId, name: "Client request", color: "amber-400" },
    inherited: false, effective_name: "Client request", effective_color: "amber-400", revision: "1",
    item_validator: { etag: '"example-label-override-identity-1"', encoding: "identity", representation: "canonical-item" },
  }], next_cursor: null },
  setprojecttasklabeloverride: {
    project_id: projectId, label_id: workspaceLabelId, definition: workspaceLabel,
    override: { project_id: projectId, label_id: workspaceLabelId, ...labelOverrideInput },
    inherited: false, effective_name: labelOverrideInput.name, effective_color: labelOverrideInput.color, revision: "2",
  },
  listworkspacelabeldefinitions: { data: [workspaceLabel], next_cursor: null },
  createworkspacelabeldefinition: workspaceLabel,
  listtargetlabelassignments: { workspace_id: workspace, target_kind: "task", target_id: taskId, project_id: projectId, revision: "1", label_ids: [workspaceLabelId] },
}

export function applyResponseExamples(operation) {
  const body = successBodies[operation.id]
  const presented = { ...operation, summary: operationTitle(operation, `${operation.method} ${operation.path}`) }
  if (!body) return presented
  if (["createtimesheetexport", "gettimesheetexport", "getmytimesheet"].includes(operation.id))
    return { ...presented, responses: operation.responses.map((response) => response.status === (operation.id === "createtimesheetexport" ? "202" : "200")
      ? { ...response, content: response.content.map((media) => media.mediaType === "text/csv" ? { ...media, example: timesheetCSV }
        : media.mediaType === "application/json" ? { ...media, example: body } : media) }
      : response) }
  if (["createchangeset", "createdocumentpatch", "applychangeset"].includes(operation.id))
    return { ...presented, responses: operation.responses.map((response) => ["200", "201", "202"].includes(response.status)
      ? { ...response, content: response.content.map((media) => media.mediaType === "application/json"
        ? { ...media, example: response.status === "202" ? changeSetAccepted : body } : media) } : response) }
  const status = ["retrylifecyclemigration", "applylifecyclemapping", "resolveknowledgerepositoryconflict", "importknowledgerepository", "syncknowledgerepository", "createworkspaceagentrun", "canceloperation", "delegatetasktoworkspacecustomagent", "admitworkspacecustomagentrequest", "requestintegrationaction", "verifysentrybinding", "refreshintegrationresources"].includes(operation.id) ? "202" : ["createwebhookendpoint", "createtasktimeentry", "createtasksavedview", "createtaskselection", "createtaskresultset", "createtaskrelation", "duplicatetask", "attachtaskattachment", "createproject", "createworkspaceprojectstate", "createmilestone", "createprojectstatus", "createworkspacestatus", "attachprojectattachment", "addprojectmember", "beginintegrationauthorization", "createdocument", "createdocumentworklink", "reserveattachmentupload", "completeattachmentupload", "attachdocumentattachment", "createtask", "createcomment", "createworkspaceinvitation", "resendworkspaceinvitation", "createworkspaceagent", "createworkspacecustomagent", "createintegrationsubscription", "createprojectintegrationbinding", "createprojectlabeldefinition", "createworkspacelabeldefinition"].includes(operation.id) ? "201" : "200"
  if (["beginintegrationauthorization", "completeintegrationauthorizationwithcredential"].includes(operation.id))
    return { ...presented, responses: operation.responses.map((response) => [status, "202"].includes(response.status)
      ? { ...response, content: response.content.map((media) => media.mediaType === "application/json"
        ? { ...media, example: response.status === "202" ? { id: integrationAuthorizationId, status: "outcome_unknown" } : body } : media) }
      : response) }
  if (operation.id === "canceloperation")
    return { ...presented, responses: operation.responses.map((response) => ["200", "202"].includes(response.status)
      ? { ...response, content: response.content.map((media) => media.mediaType === "application/json"
        ? { ...media, example: response.status === "202" ? body : { outcome: "cancelled", id: body.id, state: "cancelled", expires_at: body.expires_at, created_at: body.created_at, updated_at: "2026-10-27T10:03:00Z" } } : media) }
      : response) }
  return { ...presented, responses: operation.responses.map((response) => response.status === status
    ? { ...response, content: response.content.map((media) => media.mediaType === "application/json" ? { ...media, example: body } : media) }
    : response) }
}
