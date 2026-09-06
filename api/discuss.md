# Discuss

Discuss is one persistent, private Search Agent conversation for each of your
Workspace memberships. It has no thread list or provider selector. Visible
messages are stored by Assign Core; raw reasoning, prompts, credentials, and
provider payloads are never returned.

The Web app opens Discuss from the primary navigation above Inbox. Typing is
local: a message reaches Knowledge only when you explicitly send it. Answers
show their current Workspace sources and can abstain when evidence is missing.
If Knowledge is unavailable, your submitted message remains saved and ordinary
Workspace work remains available.

## Message history

`GET /api/v1/workspaces/{workspace_id}/discuss/messages` returns a bounded
chronological page from only the current membership's stream. Use `before` for
older pages. `GET .../messages/search?q=...` searches retained private raw
history without placing it in shared Workspace Search or Knowledge.

`POST .../messages` requires the session CSRF token and an `Idempotency-Key`.
Retries with the same key return the existing turn and do not repeat Knowledge
work. `POST .../read-state` advances the private read position monotonically.
All responses are `private, no-store`.

## Personal settings and reminders

`GET` and `PATCH .../discuss/preferences` manage the current membership's IANA
timezone, work hours/days, exactly three optional ceremonies (start day, end
day, end week), conservative push opt-in, and wording personality. Updates use
the returned revision. Plan changes never enable ceremonies or push.

`GET` and `POST .../discuss/reminders` list or create explicitly confirmed work
reminders with a concrete due instant and timezone. `PATCH
.../discuss/reminders/{reminder_id}` completes, cancels, or snoozes an exact
revision. Snooze creates the next occurrence; delivery is not completion.

Private history, settings, reminders, and references are removed with the
membership lifecycle and never appear in Workspace administrator aggregates.
