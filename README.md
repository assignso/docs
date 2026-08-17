# Assign documentation

Public documentation for Assign 3.0 will live here. The machine-readable HTTP
contract is maintained separately in `openapi-spec` and is the source for
generated SDKs.

Assign uses **Workspace** for its tenant and collaboration boundary and **Task**
for its work resource. Public product endpoints use `/api/v1`; deployment probes
such as `/health` and `/ready` are not public API resources.

- [API conventions](api/conventions.md)
- [Browser authentication](api/authentication.md)
- [Account and Workspaces](api/account.md)
- [Projects and Statuses](api/projects.md)
- [Tasks](api/tasks.md)
- [Writing in Assign](editor.md)
- [Frontend prototype](frontend-prototype.md)
