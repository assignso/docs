---
description: Browser sessions and CSRF, password, second-factor, passkey and provider sign-in, and developer-client and native tokens.
---

# Authentication

Which credential to use is summarized in the [API overview](./index#authentication). This page covers
sign-in and session operations. For scripts, use a personal API token in the `Authorization` header
instead.

## Browser sessions

Browser requests use two host-only cookies:

| Cookie | Purpose |
| --- | --- |
| `__Host-assign_session` | The opaque session secret (`Secure`, `HttpOnly`, `SameSite=Lax`). |
| `__Host-assign_csrf` | The CSRF token. Readable by your app so it can copy it into `X-CSRF-Token`. |

A session expires after 30 days, or after 7 days without activity. Sign-in requests accept an
optional `remember_me` boolean: `false` issues cookies without an expiry, so the browser discards
them when it closes, and the session lasts at most 48 hours. Omitting it
keeps the 30-day session. An expired or revoked session
returns `401 authentication_required` and clears both cookies.

Every browser-session authenticated `POST`, `PUT`, `PATCH` and `DELETE` must send the CSRF cookie's value in
`X-CSRF-Token`. A missing or mismatched token returns `403 invalid_csrf_token`.

```http
POST /api/v1/auth/logout HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Logging out revokes the current session only and returns `204`.

## Password sign-in

```http
POST /api/v1/auth/register HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"email": "person@example.com", "password": "<passphrase>", "display_name": "Person"}
```

Registration returns `201`, sets both cookies and creates an account without a Workspace. That
session can read account resources and [create the first Workspace](./workspaces#create-a-workspace)
but nothing Workspace-scoped. Passwords are 12–128 characters and can't appear in a known-breach
list. A taken address returns `409`. The address starts unverified: the account works immediately,
but password reset isn't available until it's verified.

### Register from an invitation <Badge type="warning" text="Awaiting deployment" />

Include the invitation credential in optional `invitation_token` when registering
with the invited email address. A valid invitation verifies that address without
sending a second verification email. Registration creates no Workspace membership;
[accept the invitation](./workspaces#invitations) after signing in. Invalid, expired,
revoked, used or mismatched credentials return `400 invalid_invitation` and create
no account. Signup without an invitation keeps the verification email.

```http
POST /api/v1/auth/login HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"email": "person@example.com", "password": "<passphrase>", "remember_me": true}
```

Sign-in returns `200` with one of two bodies. Branch on `mfa_required`:

- **No second factor:** the account, with both cookies set.
- **Second factor enabled:** no cookies, and a challenge you exchange in the next section.

```json
{"mfa_required": true, "mfa_token": "<challenge>", "expires_at": "2026-08-17T18:35:00Z"}
```

Every failure returns the same `401 invalid_credentials`.

| Operation | Use |
| --- | --- |
| `POST /api/v1/auth/email/verify` | Redeem the token from the verification link. |
| `POST /api/v1/auth/email/resend-verification` | Send a new link. Always `202`, whether or not the address exists. |
| `POST /api/v1/auth/password/forgot` | Email a reset link, valid for four hours. Always `202`. An unverified address gets a verification link instead. |
| `POST /api/v1/auth/password/reset` | Set a new password. Revokes every session. |
| `POST /api/v1/auth/password/change` | Change the password (needs `current_password`). Keeps this session and revokes the others. Returns `409` for accounts without a password. |

## Second factor

Assign supports a TOTP authenticator app and ten single-use recovery codes.

Complete a sign-in with the challenge from `login`. `code` is a TOTP or recovery code:

```http
POST /api/v1/auth/mfa/verify HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"mfa_token": "<challenge>", "code": "123456", "remember_me": true}
```

Send the same `remember_me` value you sent at the first step; the session is created here.

Success returns `200` with the account and both cookies. A wrong code returns `401 invalid_code`. The
challenge expires after five minutes or five wrong codes (`401 invalid_challenge`), and the user
signs in again.

Manage the factor from a signed-in session (session and CSRF headers as above):

| Operation | Result |
| --- | --- |
| `POST /api/v1/auth/mfa/totp/setup` | `201` with `provisioning_uri` (render as a QR code) and `secret`. The secret is shown once. Nothing changes until you confirm. |
| `POST /api/v1/auth/mfa/totp/confirm` with `{"code": "123456"}` | `201` with `recovery_codes`, shown once, and enables the factor. `409` if a factor is already enabled. |
| `POST /api/v1/auth/mfa/recovery-codes/regenerate` with `current_password` | `201` with a new set. Every earlier code stops working. |
| `DELETE /api/v1/auth/mfa/totp` with `current_password` and `code` | `204`. Removes the factor and its recovery codes. `409` if none is enabled. |

## Passkeys

A passkey sign-in never asks for a second factor. Passkey operations return `404` on deployments
where passkeys aren't configured.

Each ceremony has two steps: get options, pass them to the browser, then return the result with the
single-use `ceremony_token` (valid five minutes).

| Step | Operation |
| --- | --- |
| Sign in | `POST /api/v1/auth/passkeys/login/options`, then `navigator.credentials.get()` with `options` unchanged, then `POST …/login/verify` with `{"ceremony_token", "response"}`. Returns the account and both cookies. Every failure is `401`. |
| Register (signed in) | `POST /api/v1/auth/passkeys/register/options`, then `navigator.credentials.create()`, then `POST …/register/verify` with `{"ceremony_token", "name", "response"}`. Returns `201`. An account can hold ten passkeys (`409` beyond that). |
| Manage | `GET /api/v1/auth/passkeys` lists. `PATCH` renames and `DELETE` removes `/api/v1/auth/passkeys/{passkey_id}`. |

Passkey fields worth showing in a UI: `backup_eligible` and `backup_state` say whether it's synced or
tied to one device. `disabled` is `true` when Assign stopped trusting it; it can't be re-enabled, so
ask the user to remove it and register a new one.

Removing the account's last working sign-in method returns `409 last_sign_in_method`.

## Sign in with a provider

Start Google, GitHub or Apple sign-in at `GET /api/v1/auth/providers/{provider}/authorize`, which
redirects (`302`) to the provider. The provider returns to
`/api/v1/auth/providers/{provider}/callback`, by `GET` for Google and GitHub and by form `POST` for
Apple.

On success both cookies are set and the browser is redirected to the account's Workspace, or to
Workspace creation for an account without one. A malformed callback returns `400 invalid_request`;
any other failure redirects to the login page with `?error=authentication_failed`.

A first sign-in from a provider identity whose **verified** email matches an existing account attaches
to that account. After that, the identity is matched by the provider's subject, so an email change
at the provider doesn't move it.

### Continue to a Task after sign-in <Badge type="warning" text="Awaiting deployment" />

The optional `return_to` parameter accepts local `/app/` Workspace paths,
including their query string and fragment, as well as MCP authorization and
token-free invitation acceptance paths. External URLs are ignored. A Task link
that requires login returns you to that Task with either remember-device choice.
If login succeeds but the Workspace cannot open, use **Retry** to continue
without entering your credentials again.

## Switch Workspace

A browser session is scoped to one Workspace. To change it:

```http
PUT /api/v1/auth/session/workspace HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"workspace_id": "<workspace-id>"}
```

This returns `204` and replaces both cookies, so re-read the CSRF cookie before your next write. A
Workspace you don't belong to returns `403 workspace_access_denied` and leaves the session as it was.

## Developer-client tokens

The Assign CLI signs in with a browser authorization-code flow using PKCE (`S256`) and a loopback
callback at `http://127.0.0.1:{port}/callback`. Use `assign login` rather than implementing it. The
public client is `assign-cli`.

- The authorization code is single-use and lasts five minutes.
- The access token lasts 15 minutes. The refresh token rotates on every use, and replaying a used one
  revokes the whole family.
- `POST /api/v1/dev/oauth/revoke` revokes the calling credential.
- Grants carry `assign:read`, `assign:write` and `assign:discuss`. Sign in again to gain a scope your
  session predates.
- These tokens work only on the operations that accept them (see the endpoint index) and never on the
  MCP server.

`POST /api/v1/cli/mcp/token` exchanges a CLI or personal API token for a short-lived MCP token that
can narrow, but not widen, the parent's scopes. Use [`assign mcp setup`](../cli/mcp) instead of
calling it.

## Native mobile OAuth

Native credentials are distinct from browser sessions, personal API tokens and developer-client tokens. Send the native access token in `Authorization: Bearer <native-access-token>` only to operations whose OpenAPI security alternatives include `nativeAccessToken`. Native requests do not need cookies or `X-CSRF-Token`; each operation still requires its documented revision and idempotency headers.

The development contract includes supporting Workspace/Project/Task reads, ordinary Search and reference options, Document reads, Task comments and reactions, attachments, Account profile and image operations, settings reads and Git context. Workspace label definitions require exactly one `purpose=task`; generic label assignment reads support only `target_kind=task`. Project label override lists return `409 catalog_incomplete` above 100 records.

Use the explicit Workspace in the path or upload request. Account profile operations apply to the authenticated caller. Invalid, expired, revoked or duplicate bearer credentials return an authentication error even when a valid browser cookie is present.

Upload file bytes to the HTTPS URL returned by the reservation using only its required storage headers. Never forward the native token to storage. Profile image content returns a storage redirect; resolve it separately and fetch the image without Assign credentials.

These additions are implemented and tested locally. Production availability and iOS/Android device qualification are pending. See [Availability](./conventions#availability) and the [OpenAPI contract](./index#openapi-and-sdks).

## Post-login destinations

<Badge type="warning" text="Awaiting deployment" />

Successful password, second-factor and passkey sign-in opens the active Workspace’s Home using its readable path. Provider sign-in redirects through `/app`, then opens that Workspace’s Projects. The current Workspace is resolved from the authenticated session; if it is unavailable, Assign reports an error instead of opening another Workspace. Account-only sign-in still opens Workspace creation. Explicit supported sign-in continuations keep their destination.
