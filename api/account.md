---
description: Manage your Assign profile, sign-in methods, sessions, personal API tokens and connected clients through Account settings.
---

# Account

Open **Account settings** in Assign to manage your profile and access. For integration
credentials and a first product request, use the [authentication guide](./authentication).
The public [endpoint reference](./endpoints) lists the supported integration operations.

## Current user

Your Account belongs to you across Workspaces. Your role and the resources you can access
can differ between Workspaces. Open the Workspace chooser to select where you are working;
this does not change the Workspace bound to an integration's token.

## Update the profile

Use **Account settings → Profile** to update your name, username, title, picture and personal
details. Display names have 1 to 100 characters. Optional text can be cleared. Your phone
number is private profile data.

Display preferences include full name or username, Sunday or Monday as the start of the week,
regional date and number formats, timezone and editor controls. Follow Workspace defaults
where the setting offers that option. See [Settings](../guides/settings) for their placement.

Username changes are awaiting deployment. New names use 3 to 30 lowercase letters, numbers
or interior dots, with a letter or number at each end. A username cannot be cleared;
existing usernames and earlier profile links remain usable.

### Save your interface language <Badge type="warning" text="Awaiting deployment" />

The Account language preference follows you across Workspaces and devices. Automatic follows
supported device languages with English fallback; English chooses English explicitly. This
preference is separate from regional formats, timezone and Voice language. Interface switching
and recipient-language delivery remain upcoming.

### Resolve your interface language <Badge type="warning" text="Awaiting deployment" />

Your explicit preference takes priority over device languages. An unavailable saved preference
stays saved while the interface displays in English. The application manages device-language
updates; integrations do not need to submit them.

### Change your email

Change your email in Account settings after a recent sign-in. Open the single-use verification
link in the same browser session within 30 minutes. Completion signs out your other sessions
and sends a security notice to the old address.

### Profile picture

Use a PNG or JPEG of at most 5 MiB, cropped to 512 × 512 pixels. Use the profile controls to
replace or remove it. If a supported file operation supplies a temporary storage URL, use
only its supplied headers and never forward an Assign credential to storage.

## Sessions

Open **Account settings → Active sessions** to review Workspace and recent activity and sign
out a session or all others. The list does not show browser, device, IP address or location.
Signing out the current session returns you to sign-in.

A remembered session lasts at most 30 days and expires after seven days without activity.
Without **Remember this device**, the session lasts at most 48 hours and the browser may
end it when closed. An expired or revoked session requires sign-in again.

## Personal API tokens

Create and manage personal tokens in **Account settings → Security**. Copy each new secret
once into a secret manager. Lists show safe metadata such as name, prefix, scopes, last use
and expiry; they cannot reveal the secret again. Revocation is permanent.

A personal token acts as you in its selected Workspace and stops authorizing work when you
lose the required access. Choose the minimum available scopes. The forthcoming product
policy, legacy-credential treatment, rotation overlap and lost-secret recovery are described
in [Authentication](./authentication#expiry-rotation-and-revocation). Tokens cannot be
transferred to another person. Use an owned product service account for unattended Workspace
work when that feature is available. [MCP service credentials](../mcp/security#service-credentials)
are separate and work only with MCP.

## Linked identities

Manage Google, GitHub and Apple under **Account settings → Connected accounts**. An identity
already linked to another Account cannot be added. Your first provider sign-in can link to
an existing Account only when the provider supplies a matching verified email. Later provider
email changes do not move that linked identity to another Account. Keep at least one working
sign-in method; Assign prevents removing the last one.

## Recent authentication

Sensitive changes, including signing out other sessions, linking identities and changing
passwords or email, require sign-in within the last 15 minutes. If prompted, authenticate
again and retry the action. A personal or service token cannot replace that interactive
confirmation or grant itself wider privileges.

## Connected MCP clients

Use **Account settings → MCP access** to review scopes, authorized Workspaces, last use and
expiry. Lists show up to 100 connections per page. Use **Next page** to continue or
**Back to first page** to restart. **Disconnect** revokes that connection immediately.
See [Connect a client](../mcp/connect#review-or-disconnect).

## Workspaces and members

Use the Workspace chooser to switch between memberships. Owners and admins manage invitations
and roles in **Workspace settings → Members**. Review plans under **Account settings → Billing
& plans**; payment and invoice details stay in Workspace billing settings.

## Project shortcuts

Use **Account settings → Project shortcuts** to assign the `1` to `9` shortcuts within a
Workspace. A Project can occupy one slot. Before customization, shortcuts use the first nine
active Projects you can read. Projects you can no longer access are removed from the shortcuts.

## Project display preferences

Your Projects-page sort and custom order apply to your Account within one Workspace. They
change neither shared Project ranks nor anyone else's order. If another device changes a
preference while you edit, reload the latest value before making an intentional change.

## Private realtime reads

Assign manages live Account updates inside the application. For supported Task notifications
in an integration, see [MCP events](../mcp/events). Use the public reference for documented
integration operations and their credential requirements.
