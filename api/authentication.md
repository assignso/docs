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
