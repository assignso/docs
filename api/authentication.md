# Browser and native authentication

Assign authenticates browser requests with two host-only cookies:

- `__Host-assign_session` contains the opaque session secret. It is `Secure`,
  `HttpOnly`, `SameSite=Lax`, and has `Path=/` with no `Domain` attribute.
- `__Host-assign_csrf` contains the session-bound CSRF token. It has the same
  transport attributes but remains readable by the browser application so it
  can be copied into the `X-CSRF-Token` request header.

Browser sessions expire after 30 days even if continuously active. A session
also expires after 7 days without activity. Expired, invalid, and revoked
sessions receive `401 authentication_required` and both cookies are expired by
the response.

## CLI browser authentication

The first-party `assign` CLI uses a credential family separate from browser
cookies, personal API tokens, native mobile credentials, and MCP OAuth.
`assign login` binds an ephemeral callback at `http://127.0.0.1:{port}/callback`
before opening `GET /api/v1/cli/oauth/authorize` in the system browser. The
fixed public client is `assign-cli`; it has no secret and must use PKCE `S256`,
an opaque state value, and the exact loopback callback. `localhost`, non-loopback
hosts, alternate paths, custom schemes, query-bearing callbacks, and PKCE
downgrade are rejected.

The five-minute authorization code is single-use. The token endpoint returns a
15-minute opaque API access token and a rotating refresh token with 90-day idle
and one-year absolute family expiry. Consumed-refresh replay revokes the whole
family. `POST /api/v1/cli/oauth/revoke` revokes the current interactive CLI
family. These tokens are accepted only at API-host CLI operations and are never
accepted by the MCP resource host.

## Native email and password authentication

The native login and signup screens offer email/password authentication. Apple
and GitHub options on iOS, and Google and GitHub on Android, are currently
visible as disabled coming-soon options. Use email/password until those options
are connected.

On signup, **Already have an account? Sign in** appears above the fields.
The email and password fields support your device’s password manager.
Opening its system autofill sheet keeps your draft; leaving the screen or
backgrounding Assign clears the password. Password saving and automatic
suggestions depend on your password manager and app/domain setup; they are
not yet verified in the development build. Assign does not save your password
for transfer to the login screen.

Native apps can display their own login and signup screens. Use HTTPS and send
no browser cookies. The native endpoints are:

- `POST /api/v1/mobile/auth/login`: email/password plus client/installation binding.
- `POST /api/v1/mobile/auth/register`: the same binding, email/password and optional
  `display_name`; returns a native token set with status 201.
- `POST /api/v1/mobile/auth/mfa/verify`: binding, `mfa_token` and authenticator or
  recovery `code`; returns a native token set after successful verification.

Use `client_id=assign-ios` with `platform=ios`, or `assign-android` with `android`.
Include a stable random URL-safe `installation_id` of 43–128 characters and a
`device_label` of at most 64 characters. These public client identifiers do not
require an OAuth callback or Apple/Google developer account.

Login returns `mfa_required=false` with `tokens`, or `mfa_required=true` with
`mfa_token` and `expires_at`. Keep the challenge in memory and submit it from the
same client/installation. It expires after five minutes, allows five failed code
attempts and is single-use. No mobile token is issued before required MFA passes.
Store issued credentials in the platform secure store and retain the existing
refresh/revoke lifecycle below. Never persist passwords or verification codes.

Password recovery and verification resend use the existing anonymous email
endpoints. A `verification_delivery_failed` registration response means the
account was created: request another verification email, then log in. Do not
automatically retry registration or token issuance after an uncertain response.

After authentication, fetch `/api/v1/me` and `/api/v1/workspaces`. An account with
no active memberships may create its first Workspace using
`POST /api/v1/mobile/workspaces/bootstrap` with native bearer and `{name, slug}`.
This returns the Workspace without changing a browser session; repeated or
concurrent first creation cannot provision another Workspace.

## Native mobile OAuth (activation required)

Native mobile authentication requires a registered first-party platform client and
verified HTTPS app links. Public mobile activation is not available yet. The
OpenAPI contract describes supported operations; confirm the selected server
supports the requested endpoints. OAuth additionally requires callback registration.

For separate OAuth entry, authorization starts in the system browser at
`GET /api/v1/mobile/oauth/authorize`. The request uses a registered public
client, exact callback URI, high-entropy state and installation identifier,
and PKCE `S256`; there is no mobile client secret. Production returns through
the Assign universal/app link at
`https://api.assign.so/mobile/oauth/callback`. The app exchanges the returned
five-minute one-time code and PKCE verifier at
`POST /api/v1/mobile/oauth/token` for an opaque bearer access token valid for up to 15 minutes
and a rotating refresh token. Both tokens belong only in platform-secure
storage, never a URL, log, analytics event, or ordinary application storage.

Each refresh rotates the refresh token. A consumed-token replay revokes the
credential family and requires fresh authentication. `POST
/api/v1/mobile/oauth/revoke` revokes the calling device credential and its
push registration; browser account security can list or revoke native
credentials under `/api/v1/me/mobile-credentials`. See the machine-readable
contract for the exact request/response schemas.

The signed-in native subset includes `GET /api/v1/me`,
`GET /api/v1/workspaces`, Workspace Project listing, Project detail/statuses/Tasks,
Task detail and Task update, alongside Inbox and My Work. Project and Task
creation also accept native bearer credentials in builds with creation support. Other routes do not
implicitly accept native credentials. Native `/me` returns account information
without a browser-selected Workspace. The app chooses an active membership and
uses the appropriate Workspace/resource route.

Native creation requires `Idempotency-Key`; reuse it for retries of the same
command. Native Task updates require `If-Match` and `Idempotency-Key`; they omit browser
cookies and `X-CSRF-Token`. Browser mutations still require CSRF. Invalid bearer
credentials never fall back to browser cookies. Use the returned `expires_in`
(0–900 seconds), rather than assuming another full 15 minutes; zero requires
sign-in again. SDK callers must use clients generated from this contract. PHP
Task-update and Project/Task-create calls retain their positional order; native callers
pass `null` in
the CSRF argument position.

## Sign in with an identity provider

Start Google, GitHub, or Apple sign-in at
`GET /api/v1/auth/providers/{provider}/authorize`. Assign validates the
provider callback, creates a fresh browser session, sets both cookies, and
redirects directly to the signed-in Workspace. An account that does not yet
belong to a Workspace is redirected to Workspace creation instead.

Assign first resolves an identity by its provider and immutable provider
subject. If this is the first sign-in from that provider identity and the
provider reports a **verified** email matching an existing Assign account,
Assign attaches the identity and signs in that existing account automatically.
The user does not need to connect the provider beforehand, and no duplicate
account is created. Matching is case-normalized; an absent or unverified
provider email cannot attach to an account.

After attachment, future sign-ins resolve the immutable provider identity, not
the provider's mutable email. A provider email change therefore does not move
the identity to another account. Apple private-relay addresses match only that
exact normalized relay address.

## Register and sign in with a password

```http
POST /api/v1/auth/register HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"email": "person@example.com", "password": "<passphrase>", "display_name": "Person"}
```

Registration returns `201` with the account and sets both browser-session
cookies. It creates account data only: no Workspace, membership, or Actor is
created, and the response omits all Workspace fields. The resulting
account-only session can read account-level resources and create the first
Workspace, but cannot use Workspace-scoped operations. Continue with
[Create the first Workspace](workspaces.md#create-the-first-workspace).
Passwords must be 12–128 characters and are refused if they appear in a
known-breach list; a rejected password returns `400` with a message describing
the rule it failed. A taken address returns `409` — registration necessarily
reveals whether an address can be registered, and a vague failure would only
strand someone who already has an account.

The address starts unverified and a verification message is sent. **Verification
gates recovery, not access**: the account works right away, but no password
reset will ever be issued for an unverified address.

```http
POST /api/v1/auth/login HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"email": "person@example.com", "password": "<passphrase>"}
```

Sign-in returns `200`. **The body has two shapes and you must branch on them.**
Without a second factor the response is the account and both cookies are set. If
the account has a second factor, no cookies are set and the body is a challenge
instead:

```json
{"mfa_required": true, "mfa_token": "<challenge>", "expires_at": "2026-08-17T18:35:00Z"}
```

Branch on whether `mfa_required` is present. A challenge is not a session: until
it is exchanged (below), the caller can read nothing.

Every sign-in failure returns the same `401 invalid_credentials` — unknown
address, no password on the account, wrong password — and takes comparable time,
so the endpoint cannot be used to find out which addresses are registered.

`POST /api/v1/auth/email/verify` redeems a verification token, and
`POST /api/v1/auth/email/resend-verification` sends a new one. Resend answers
`202` with an empty body whatever happens, including for an address that is not
registered; treat it as "we will act if there is anything to act on", never as
confirmation that an account exists.

`POST /api/v1/auth/password/forgot` and `POST /api/v1/auth/password/reset`
request and redeem a reset token. The forgot operation emails a clickable
`/reset-password?token=...` link that remains valid for four hours; it answers
`202` and empty on the same reasoning as resend. A reset **revokes every
session**, including the one that performed it, because a reset is what someone
whose account was taken over performs and the attacker's session must not
survive it.

`POST /api/v1/auth/password/change` replaces the password for a signed-in user
and requires `current_password`, since an unattended browser must not be enough
to lock the owner out. Unlike a reset it keeps the calling session and revokes
the others. An account that signs in only through an identity provider has no
password to change and receives `409`.

## Second factor

Assign supports a time-based one-time password (TOTP) factor from any standard
authenticator app, with ten single-use recovery codes.

### Complete a sign-in

Exchange the challenge from `login` for a session:

```http
POST /api/v1/auth/mfa/verify HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"mfa_token": "<challenge>", "code": "123456"}
```

On success this returns `200` with the account and sets both cookies. `code` may
be a TOTP code or a recovery code; recovery codes match regardless of spacing
and letter case, so a code read off paper works however it was written down.

A wrong code returns `401 invalid_code`, identically whatever was wrong with it.
A TOTP code is accepted only once, so a code that was already used is refused
for the rest of its window. The challenge itself expires after five minutes and
gives up after five wrong codes; either way the response is
`401 invalid_challenge` and the user must sign in again.

### Enrol

```http
POST /api/v1/auth/mfa/totp/setup HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Returns `201` with `provisioning_uri` — render it as a QR code — and `secret`,
the manual-entry fallback. **The secret is returned exactly once and is never
readable again**; a client that loses it must start setup over. Starting setup
again replaces the previous secret, so an earlier QR code stops working.

Setup on its own changes nothing: sign-in still works as before until the
enrolment is confirmed, so an abandoned setup cannot lock anyone out.

```http
POST /api/v1/auth/mfa/totp/confirm HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"code": "123456"}
```

Returns `201` with `recovery_codes` and enables the factor. **Those ten codes are
also shown exactly once** — only their hashes are stored — so present them for
saving before the user can navigate away. An account that already has a
confirmed factor receives `409`; replacing a live factor is not allowed, since
it would let whoever holds an open session swap the protection out silently.

### Recovery codes and removal

```http
POST /api/v1/auth/mfa/recovery-codes/regenerate HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"current_password": "<passphrase>"}
```

Returns `201` with a fresh set and invalidates every previous code, including
unused ones. The current password is required because these codes are themselves
a way past the factor.

```http
DELETE /api/v1/auth/mfa/totp HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"current_password": "<passphrase>", "code": "123456"}
```

Returns `204` and removes the factor along with its recovery codes. Removal
requires **both** the current password and a current code (TOTP or recovery):
either on its own would let a stolen session or a stolen phone take the
protection off by itself. An account with no confirmed factor receives `409`.

## Passkeys

A passkey is strong authentication on its own. Signing in with one **never**
asks for a second factor, even on an account that has TOTP enabled — the
authenticator already verified the user, which is the assurance the second
factor exists to add.

Passkey operations are served only by a deployment with a configured relying
party. Where none is configured they return `404` like any other unrouted path,
so check before building against them.

Every ceremony has two steps: ask Assign for options, hand them to the browser,
send the result back with the ceremony token. The token is single-use and
expires after five minutes.

### Sign in

```http
POST /api/v1/auth/passkeys/login/options HTTP/1.1
Host: api.assign.so
```

Returns `201` with `ceremony_token` and `options`. Pass `options` to
`navigator.credentials.get()` unchanged — it is the WebAuthn structure defined
by the specification, not a shape this API invents, so a WebAuthn client library
will handle the base64url decoding for you.

The ceremony names no account and lists no allowed credentials: sign-in is
usernameless, the authenticator proposes the account, and as a result this
endpoint cannot be used to find out whether an account or credential exists.

```http
POST /api/v1/auth/passkeys/login/verify HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"ceremony_token": "<token>", "response": { ... }}
```

On success this returns `200` with the account and sets both session cookies.
Every failure is `401` and says nothing more — unknown or expired ceremony, an
already-used one, or an assertion that did not verify all look alike. Start a
new ceremony and try again.

### Register

```http
POST /api/v1/auth/passkeys/register/options HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

Returns `201` with a ceremony for `navigator.credentials.create()`. The options
require a discoverable credential and user verification, which is what makes the
resulting passkey usable for usernameless sign-in. Credentials already on the
account are excluded, so an authenticator that is already enrolled declines
rather than making a duplicate. An account at the ten-passkey limit gets `409`.

```http
POST /api/v1/auth/passkeys/register/verify HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"ceremony_token": "<token>", "name": "Work laptop", "response": { ... }}
```

Returns `201` with the stored passkey. `name` is the user's own label for the
device — ask for something they will recognize in a list a year from now.

### Manage

`GET /api/v1/auth/passkeys` lists the account's passkeys. `PATCH
/api/v1/auth/passkeys/{passkey_id}` renames one, and `DELETE` on the same path
removes it. Deleting removes Assign's side only; the user clears the
authenticator's copy in their own platform settings.

Two response fields are worth surfacing in a UI. `backup_eligible` and
`backup_state` together say whether the passkey is synced to the user's
provider account or bound to one device — the difference between losing a phone
being an inconvenience and being a lockout. And `disabled` is `true` when Assign
took the credential out of use because its signature counter failed to advance,
which indicates a second copy of the private key exists. A disabled passkey
cannot sign in and cannot be re-enabled: tell the user plainly, and have them
remove it and register a new one.

Deleting the account's **last remaining sign-in method** is refused with `409
last_sign_in_method`. A password, a linked identity provider, or another working
passkey each count; a disabled one does not.

## Sign in with a provider

Sign-in is a two-step redirect flow against `google`, `github`, or `apple`:

```http
GET /api/v1/auth/providers/{provider}/authorize HTTP/1.1
Host: api.assign.so
```

This redirects the browser (`302`) to the provider's consent screen. An
unknown or disabled provider name returns the same `404` used for any other
absent resource, so provider availability cannot be enumerated.

The provider then returns control to Assign at the callback path:

```http
GET /api/v1/auth/providers/{provider}/callback?state=...&code=... HTTP/1.1
Host: api.assign.so
```

Google and GitHub redirect here with a `state`/`code` query string; Apple
instead posts the same two fields as `application/x-www-form-urlencoded` to
the identical path (`POST`), since it uses the OIDC `form_post` response
mode. A missing or malformed `state`/`code` is a genuine client error and
returns `400 invalid_request`. Any other authentication failure — an
unrecognized provider, a rejected code exchange — does not leak details:
the browser is redirected (`302`) to the web application's login page with
an opaque `?error=authentication_failed` query parameter and no cookies are
set. On success, both browser-session cookies are set and the browser is
redirected to that account's current Workspace project list. An account-only
session is redirected to Workspace creation.

## Cross-site request protection

Every authenticated `POST`, `PUT`, `PATCH`, and `DELETE` request must send the
value of `__Host-assign_csrf` in the `X-CSRF-Token` header. Assign verifies that
the cookie and header match and that the token belongs to the authenticated
session. A missing or invalid token receives `403 invalid_csrf_token`.

## Log out

`POST /api/v1/auth/logout` revokes only the current browser session and expires
both cookies. Send the session and CSRF cookies with the request and include the
CSRF token header:

```http
POST /api/v1/auth/logout HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
```

A successful logout returns `204 No Content` with `Cache-Control: no-store`.

## Switch the session's Workspace

A browser session is normally scoped to exactly one Workspace at a time (see
`workspace` on [`GET /api/v1/me`](account.md#read-the-current-user-and-workspace)).
A newly registered account may temporarily have an account-only session until
it creates its first Workspace.
Moving to a different Workspace the caller actively belongs to requires a
new session — there is no in-place reauthorization of an existing session
onto a new scope:

```http
PUT /api/v1/auth/session/workspace HTTP/1.1
Host: api.assign.so
Cookie: __Host-assign_session=<session>; __Host-assign_csrf=<csrf-token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

{"workspace_id": "<workspace-id>"}
```

On success this revokes the current session, creates a new one scoped to
`workspace_id`, and returns `204 No Content` with `Set-Cookie` fields that
replace both `__Host-assign_session` and `__Host-assign_csrf` with freshly
rotated values. Clients must re-read the CSRF cookie before issuing further
mutating requests. A Workspace the caller does not actively belong to
returns `403 workspace_access_denied` and leaves the current session
untouched.

### Using a password reset email

Open the clickable link in your reset email, then enter and confirm your new
password. There is no reset token to copy or paste. If you open the reset page
without its email link, choose **Request a new link**. Invalid, expired or
already-used links also require a new reset email. Unverified addresses receive
a verification email first; verify the address and request the reset again.

### Failed requests in the native app

A failed save or data request shows an error without signing you out or clearing
your draft. This includes permission, validation, server and connection failures.
If an operation rejects authentication, the app checks whether your session is
still valid before signing you out. It does not automatically repeat a failed
save. Confirmed invalid sessions and explicit sign-out still clear private data.
