# Browser authentication

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

## Register and sign in with a password

```http
POST /api/v1/auth/register HTTP/1.1
Host: api.assign.so
Content-Type: application/json

{"email": "person@example.com", "password": "<passphrase>", "display_name": "Person"}
```

Registration returns `201` with the account and sets both browser-session
cookies, so the account is usable immediately. It also creates a personal
Workspace with the new user as its owner. Passwords must be 12–128 characters
and are refused if they appear in a known-breach list; a rejected password
returns `400` with a message describing the rule it failed. A taken address
returns `409` — registration necessarily reveals whether an address can be
registered, and a vague failure would only strand someone who already has an
account.

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
request and redeem a reset token; forgot answers `202` and empty on the same
reasoning as resend. A reset **revokes every session**, including the one that
performed it, because a reset is what someone whose account was taken over
performs and the attacker's session must not survive it.

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

Passkeys are not available.

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
redirected to the web application root.

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

A browser session is scoped to exactly one Workspace at a time (see
`workspace` on [`GET /api/v1/me`](account.md#read-the-current-user-and-workspace)).
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
