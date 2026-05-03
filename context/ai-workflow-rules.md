# Development Workflow

## Approach

Build this project incrementally. Context files define what exists, how it works, and what needs to change. Always implement against the actual codebase — read the relevant source files before writing code. Do not infer behavior from the outdated boilerplate that was in these docs previously.

## Before Writing Any Code

1. Read the files you are about to touch.
2. Verify the behavior you are changing by tracing the actual code path (route → controller → service → schema).
3. Check `progress-tracker.md` for any open questions that affect your task.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated concerns in a single implementation step.

## When To Split Work

Split an implementation step if it combines:

- Client UI changes and server-side logic changes
- Queue worker changes and API route changes
- Multiple unrelated routes or schemas
- Behavior that is not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior that is not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.

## Protected Files

Do not modify generated third-party components unless explicitly instructed:

- `client/src/components/ui/*` (shadcn/ui components)
- `client/src/components/animate-ui/*` (custom animated icon components)

Project-specific logic must go in app-level components, controllers, or services — not inside these files.

## Client / Server Boundary

- The client is a pure SPA. It has no SSR, no server actions, no file system access.
- All data fetching goes through the Express API via `client/src/lib/api.js`.
- Never fetch from GitHub directly in the client — proxy through the server.
- Long-running AI work always runs in the BullMQ worker — never in a request handler or a React component.

## Adding a New Feature

### Server side
1. Define the schema change (if any) in `server/src/schema/`.
2. Add the service function if it calls an external API.
3. Add the controller function with input validation and auth check.
4. Register the route in the appropriate `routes/` file.
5. If the work is async/heavy, enqueue a BullMQ job instead of doing it in the handler.

### Client side
1. Add the endpoint constant to `ENDPOINTS` in `client/src/lib/api.js`.
2. Build the component or page. Page-level components go in `client/src/lib/pages/`.
3. Add a `<Route>` in `client/src/App.jsx` if it is a new page.
4. Protect the route with `useRequireAuth()` if it requires authentication.

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- System architecture, new routes, or new schemas → `architecture-context.md`
- New UI patterns, color decisions, or layout → `ui-context.md`
- New conventions or language/tooling changes → `code-standards.md`
- Feature scope changes → `project-overview.md`

Update `progress-tracker.md` after every meaningful implementation step. Progress state must reflect actual code, not intended state.

## Before Moving To The Next Unit

1. The current unit works end to end in the browser (or via API test).
2. No invariant defined in `architecture-context.md` was violated.
3. `progress-tracker.md` reflects the completed work.
