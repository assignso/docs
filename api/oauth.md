---
description: Product OAuth discovery, PKCE authorization, form-encoded token exchange, refresh rotation, machine grants and revocation.
---

# Product OAuth <Badge type="warning" text="Awaiting deployment" />

This product OAuth flow is awaiting deployment. It is separate from [MCP OAuth](../mcp/connect)
and the registered sign-in flows used by Assign's own clients. Use a
[personal API token](./authentication#make-your-first-request) for a personal script.

## Register and discover

Your application needs a reviewed registration with its client ID, allowed redirect URIs,
scopes and client type. There is no anonymous dynamic registration for product OAuth.
A confidential application also receives a client secret. Keep that secret on its server;
a public client must not embed one in a distributed app.

Fetch the environment's authorization-server metadata without an authorization header:

```sh
curl https://api.assign.so/.well-known/oauth-authorization-server/oauth/product \
  -H "Accept: application/json"
```

Check `issuer` against the issuer configured for your integration. Use the returned
`authorization_endpoint`, `token_endpoint`, `revocation_endpoint`, `resource` and
`scopes_supported`; do not substitute an MCP audience or infer endpoints from a redirect.
For the production product API, the resource is `https://api.assign.so/api/v1`.
The metadata describes supported grants and client-authentication methods.

## Obtain delegated access

Use Authorization Code with PKCE S256. Start with a fresh verifier and an unpredictable `state`
bound to your sign-in attempt. The authorization request includes `response_type=code`,
`client_id`, the selected `workspace_id`, the exact registered `redirect_uri`, `resource`,
explicit `scope`, `state`, `code_challenge` and `code_challenge_method=S256`.
State must be 16 to 512 bytes. The verifier is 43 to 128 characters.

Send the person to Assign's authorization and consent experience. They approve the application,
Workspace and requested scopes. Your application must not implement Assign's sign-in or
consent-approval API. Reject a callback whose state does not match your pending attempt.
An invalid redirect is rejected locally rather than used as an error destination.

The authorization code is single-use and expires after five minutes. Exchange it with the
same client, redirect URI and resource, and the original verifier. Store the returned access
and refresh tokens in the credential store appropriate to your application.

For a public client, set these process variables from your registered application, validated
metadata and completed callback: `ASSIGN_CLIENT_ID`, `ASSIGN_REDIRECT_URI`, `ASSIGN_RESOURCE`,
`ASSIGN_TOKEN_ENDPOINT`, `ASSIGN_CODE` and `ASSIGN_CODE_VERIFIER`. The following request is an
example of the exchange; never commit the variable values:

```sh
curl --request POST "$ASSIGN_TOKEN_ENDPOINT" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "client_id=$ASSIGN_CLIENT_ID" \
  --data-urlencode "resource=$ASSIGN_RESOURCE" \
  --data-urlencode "redirect_uri=$ASSIGN_REDIRECT_URI" \
  --data-urlencode "code=$ASSIGN_CODE" \
  --data-urlencode "code_verifier=$ASSIGN_CODE_VERIFIER"
```

A successful exchange returns `200`, `Cache-Control: no-store` and JSON fields `access_token`,
`refresh_token`, `token_type=Bearer`, `expires_in` and `scope`. Use `expires_in` to schedule renewal;
access tokens last at most 15 minutes. Send the access token as a bearer credential to the
[product resource operation](./authentication#make-your-first-request), never to MCP.

## Authenticate a confidential client

Confidential clients use `client_secret_basic` for token and revocation requests. Form-encode
the client ID and secret separately, join them with `:`, then Base64-encode that string for
the HTTP Basic header. Omit `client_id` from the form. A client secret in the form is unsupported.

Public clients send `client_id` in the form and no authorization header. Do not send an access
token as bearer authentication to the token or revocation endpoint.

## Renew delegated access

Use the token endpoint with a form containing `grant_type=refresh_token`, `resource` and the
current `refresh_token`, plus the client authentication above. An optional `scope` can narrow
access. It cannot add scopes or change the Workspace, resource or person who granted access.

Refresh tokens rotate on every successful use. Serialize refreshes for a shared grant and save
the new pair together before resuming requests. Reuse of a consumed refresh token revokes the
whole family, including its access tokens. A family expires after at most 30 idle days or
90 days from its creation, or earlier when consent expires. Rotation never extends that
absolute deadline.

Do not apply a generic automatic POST retry to code exchange or refresh. There is no grace
period or replay of a lost token response. If you cannot determine whether a response was
received and saved, start fresh authorization. Replaying an already consumed code with its
original binding can also revoke the family it issued.

## Run as a service account

A registered confidential application can use `client_credentials` only after a Workspace
owner or admin binds it to an owned product service account. This grants the service account's
access; it does not impersonate a person who previously signed in to the app.

Send a token form with `grant_type=client_credentials` and `resource`, using
`client_secret_basic`. Optional `scope` selects a subset of the binding's scopes. A successful
response has a bearer access token valid for at most 15 minutes and no refresh token. Obtain
another access token using the current authorized binding when needed.

Set `ASSIGN_OAUTH_BASIC` to the Base64 value constructed from your registered client ID and
secret as described above. Use `ASSIGN_TOKEN_ENDPOINT` and `ASSIGN_RESOURCE` from validated
metadata. A machine-grant request is separate from the public-client code exchange:

```sh
curl --request POST "$ASSIGN_TOKEN_ENDPOINT" \
  -H "Authorization: Basic $ASSIGN_OAUTH_BASIC" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "resource=$ASSIGN_RESOURCE"
```

The `200` JSON response contains `access_token`, `token_type=Bearer`, `expires_in` and `scope`.
It has `Cache-Control: no-store`. Never send the Basic value to a product resource endpoint.

Rotate application secrets through the application's administrator. An old secret works only
through an explicitly selected, unexpired overlap window, capped at 24 hours. Emergency
revocation has no grace. Disabling an application or service account, or replacing its binding,
invalidates earlier authority; re-enabling it does not revive old tokens.

## Revoke access

Use the discovered revocation endpoint with a form containing `resource`, `token` and optional
`token_type_hint`, using the same client authentication as token exchange. Set
`ASSIGN_REVOCATION_ENDPOINT` from validated metadata and `ASSIGN_REVOKE_TOKEN` from the saved
access or refresh token. For a public client:

```sh
curl --request POST "$ASSIGN_REVOCATION_ENDPOINT" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "client_id=$ASSIGN_CLIENT_ID" \
  --data-urlencode "resource=$ASSIGN_RESOURCE" \
  --data-urlencode "token=$ASSIGN_REVOKE_TOKEN"
```

Revoking either token of a delegated pair revokes its whole family. Revoking a machine access
token revokes that token. The owning application can revoke after Workspace access is lost.
The endpoint returns an empty `200` for unknown, expired, foreign or already revoked tokens;
it does not confirm whether a token existed. Remove the local tokens after revocation.
Revocation does not undo committed product changes.

## Protocol errors and recovery

Token and revocation input uses `application/x-www-form-urlencoded`, with at most 16 KiB and
no query parameters. Duplicate, unknown, empty or grant-incompatible fields are rejected.
OAuth error responses use `error` and `error_description`, independently of product REST errors.
For example, an expired code can return `400` with this illustrative body:

```json
{"error":"invalid_grant","error_description":"Authorization is no longer valid."}
```

| Error | What to check |
| --- | --- |
| `invalid_request` | Form encoding, required fields, size and duplicate parameters |
| `invalid_client` | Registered client and authentication method; do not substitute a product bearer token |
| `unauthorized_client` | Whether this client may use the requested grant |
| `invalid_target` | The exact resource from this environment's metadata |
| `invalid_scope` | The approved scope ceiling; request fresh consent to expand it |
| `invalid_grant` | Expiry, consumed code or refresh, redirect, verifier and revoked access; authorize again when the grant cannot be recovered |
| `unsupported_grant_type` | The grants advertised in metadata |
| `server_error` | Retain safe request diagnostics; do not blindly retry a secret-bearing exchange |

Product OAuth has no implicit or password grant, ID token, or public introspection endpoint.
Keep tokens and secrets out of URLs, logs, caches and error reports.
