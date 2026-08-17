# Assign frontend prototype

The current Assign 3.0 web build is an interaction prototype. Its public pages are available at:

- `/` — Home
- `/features` — implemented foundation features
- `/pricing` — pricing principles and a clear pre-launch notice
- `/about` — product thesis and principles
- `/login` — prototype login
- `/signup` — prototype signup

Login and signup accept fixture input only. They do not create an account, authenticate with Google or GitHub, store credentials, establish a session, or call an Assign API. Completing either flow opens the fixture Workspace so navigation and interaction can be tested.

The authenticated product prototype lives under `/app/*`, with the interaction lab at `/__lab`. Product data there is generated fixture data and is not persisted.

Documents are available in the prototype: `/app/{workspace}/documents` lists them, `/app/{workspace}/documents/new` creates one, and each document opens on its own page. Task descriptions and task comments use the same editor. See [Writing in Assign](editor.md) for what the editor can do. As with the rest of the prototype, document content is fixture data held in the browser: it is not stored on a server and does not survive a reload of the fixture set.
