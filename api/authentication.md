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
