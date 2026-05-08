# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Production — core product is live and functional. Work continues on improvements and new features.

## Current Goal

Identify the next improvement to work on and add it here.

## Completed

### Core Infrastructure

- [x] Express.js server with MongoDB (Mongoose) and JWT auth
- [x] GitHub OAuth flow (code exchange → JWT → localStorage)
- [x] `auth.middleware.js` — JWT verification on all protected routes
- [x] AES-GCM encryption for stored GitHub access tokens (`utils/crypto.js`)
- [x] BullMQ + Redis queue setup (`utils/git.worker.js`)
- [x] Redis connection with reconnect strategy

### Repository Management

- [x] Fetch user repos from GitHub API (non-fork, push-permitted, paginated 100)
- [x] `ActiveRepo` schema with webhook ID, section hashes, and generation metadata
- [x] Activate repo: create GitHub webhook + save `ActiveRepo` + trigger initial generation
- [x] Deactivate repo: delete GitHub webhook + delete `ActiveRepo` record
- [x] GitHub webhook handler: verify HMAC signature, skip bot commits and non-default branches, enqueue job
- [x] Plan-based active repo limit enforcement at activation time
- [x] Free plan auto-deactivation notification (`reposDeactivatedNotification` flag)

### AI README Generation Pipeline

- [x] Full generation mode: scans repo tree, fetches important files, builds full context, generates README
- [x] Patch generation mode: fetches changed files, surgically updates sections, reassembles README
- [x] `determineGenerationMode()` — selects mode based on existing README and stored hashes
- [x] Gemini API service (`services/gemini.service.js`) — primary provider with 3-key rotation
- [x] Groq service (`services/groq.service.js`) — fallback provider (OpenAI-compatible)
- [x] `getActiveLimits()` — resolves provider-appropriate token and file count limits
- [x] `buildReadmeContext()`, `validateContext()`, `optimizeContext()` in `prompt.builder.js`
- [x] README committed back to repo via GitHub Contents API with `[skip ci]`
- [x] Section hashes stored on `ActiveRepo` after each generation run
- [x] `UserLog` records created at job start and updated at completion
- [x] Admin analytics cache invalidated on each job completion (Redis `del admin_analytics`)

### Client SPA

- [x] Vite + React 19 + React Router v7 setup
- [x] Tailwind CSS v4 via `@import "tailwindcss"` in `index.css`
- [x] `AuthContext` — user state, `login()`, `logout()`, token verify on mount
- [x] `useRequireAuth` hook — redirect to `/login` if unauthenticated
- [x] `useRepos` hook — fetch and manage repo list state
- [x] Landing page (`/`) with Hero, Features, How It Works sections
- [x] Login page (`/login`) with GitHub OAuth button
- [x] OAuth verify page (`/oauth-success`) — exchanges code, stores JWT, redirects
- [x] Home dashboard (`/home`) — repo grid with filter tabs, search, pagination, stats bar
- [x] `RepoCard` — shows repo name, language, privacy, activation toggle
- [x] Logs page (`/logs`) — last 10 generation events with status indicators
- [x] Profile page (`/profile`) — user info, settings toggles, account deletion
- [x] Upgrade page (`/upgrade`) — plan comparison, Razorpay checkout integration
- [x] Admin page (`/admin`) — analytics, payment management, user plan table, broadcast email UI
- [x] PostHog analytics integration
- [x] Vercel Analytics integration

### Payments

- [x] `Plan` schema seeded with `pro_monthly` (₹499) and `pro_yearly` (₹3,999)
- [x] `PaymentLedger` schema for idempotent payment records
- [x] Razorpay order creation → checkout → signature verification → plan activation
- [x] Razorpay `payment.captured` webhook as idempotent fallback
- [x] `applyProPlan()` — sets unlimited repo limit, review limits, expiry date
- [x] Admin: revoke Pro plan (enforces free limit, deactivates excess repos)
- [x] Admin: update plan price in DB
- [x] Admin: view all users with plan, paginated, filterable
- [x] Usage tracking and reset queue (`services/reset.queue.js`)

### Email

- [x] Resend integration (`services/email.service.js`)
- [x] BullMQ email queue (`services/email.queue.js`)
- [x] HTML email template for feature announcements (`email/templates/feature-announcement.html`)
- [x] Admin broadcast: compose and send email to all users

### Onboarding

- [x] Multi-step walkthrough: banner on Home (step 0) → modal after first activation (step 1) → banner on Logs (step 2)
- [x] Walkthrough state stored in `localStorage` per GitHub username
- [x] Walkthrough dismissible at any step

## In Progress

- Nothing currently active.

## Completed (continued)

### Client-Side Convex Log Details (Feature 03)

- [x] `convex` client dependency installed in `client/package.json`
- [x] `client/.env` — `VITE_CONVEX_URL` added for the Convex React client
- [x] `client/src/main.jsx` — app wrapped with `ConvexProvider` using `ConvexReactClient`
- [x] `client/src/lib/convexApi.js` — client-local Convex API reference added so Vercel does not bundle from sibling `convex-server/`
- [x] `client/src/lib/pages/Logs.jsx` — log rows expand/collapse on click using `logId`
- [x] `client/src/lib/pages/Logs.jsx` — `LogMessages` component added with reactive `useQuery(api.logs.getLogMessages, { logId })`
- [x] Commit links moved into the log metadata row so row clicks control expansion only
- [x] Expanded log detail panel uses the existing Framer Motion/Timeline visual language and Convex subscriptions for live updates
- [x] Architecture and project context updated to document the client-side Convex read path

## Completed (continued)

### Logs Schema Update — logId Correlation (Feature 02)

- [x] `logId` field added to `server/src/schema/userLog.schema.js` — UUID, required, unique, indexed
- [x] `convex-server/convex/schema.ts` — `logs` table added with `logId`, `userId`, `repoName`, `action`, `status`, `liveDetail` (optional), `updatedAt`; indexed by `logId` and `userId`
- [x] `convex-server/convex/logs.ts` — `createLog` and `updateLog` internal mutations
- [x] `convex-server/convex/http.ts` — `POST /api/logs/create` and `POST /api/logs/update` HTTP actions wired to the internal mutations
- [x] `server/src/services/convex.service.js` — `convexFetch(path, options)` helper exported for HTTP action calls against `CONVEX_SITE_URL`
- [x] `server/src/utils/git.worker.js` — generates `logId = crypto.randomUUID()` at job start, saves it in MongoDB `UserLog`, and fire-and-forgets `POST /api/logs/create` to Convex; all `updateLogStatus` calls fire-and-forget `POST /api/logs/update` to Convex on every status transition

## Completed (continued)

### Convex + Express Integration (Feature 01)

- [x] `convex-server/` project initialized with Convex dev deployment (`daemon-doc-server`)
- [x] `convex-server/convex/schema.ts` — `tasks` table with `text` and `isCompleted` fields
- [x] `convex-server/convex/tasks.ts` — `get` query (returns all tasks) and `getById` query
- [x] `convex-server/convex/http.ts` — HTTP router exposing `GET /api/test` and `GET /api/tasks` HTTP actions
- [x] Sample tasks data imported into Convex DB via `npx convex import --table tasks sampleData.jsonl` (3 documents)
- [x] `server/src/services/convex.service.js` — reusable `convexFetch(path, options)` utility using native `fetch`; reads `CONVEX_SITE_URL` from env
- [x] `server/src/controllers/convex.controller.js` — `testConvexConnection` and `getTasks` handlers
- [x] `server/src/routes/convex.routes.js` — `GET /api/convex/test` and `GET /api/convex/tasks`
- [x] `server/src/index.js` — convex routes mounted at `/api/convex`
- [x] `CONVEX_SITE_URL` added to `server/.env`

## Next Up

- Validate live message updates in the browser while a README generation job is ongoing.

## Open Questions

- Is there a plan to support multiple GitHub accounts per user (orgs)?
- Should `reviewLimit` and `competitorLimit` be exposed as a working feature on the frontend, or are they reserved for a future feature?

## Architecture Decisions

- **Patch vs. full generation**: Section hashes on `ActiveRepo` are the signal. No section hashes = full mode. This avoids re-reading the README file to decide — the stored hash state is authoritative.
- **Delete not deactivate**: Deactivating a repo deletes the `ActiveRepo` document entirely rather than toggling `active: false`. This prevents duplicate records when the user re-activates the same repo.
- **Razorpay webhook as fallback, not primary**: The `/verify` endpoint is the fast path (user stays on the page waiting). The webhook handles the case where the browser tab closes before verification runs.
- **Redis cache for admin analytics**: The analytics aggregation is expensive. Result is cached in Redis with key `admin_analytics` and invalidated on every generation job completion and repo activation/deactivation.
- **No TypeScript**: The project uses plain JSX/JS throughout. Do not introduce TypeScript without an explicit decision to migrate.
- **Tailwind v4**: Config lives entirely in `index.css`. No `tailwind.config.js` exists and none should be created.

## Session Notes

- The context files were rewritten on 2026-05-03 to reflect the actual DaemonDoc codebase. The previous versions described a different project ("Ghost AI" — a canvas-based architecture design tool) and were completely inaccurate.
- Live domain: daemondoc.online
- Payments in INR via Razorpay (not Stripe).
- AI providers: Gemini (primary) → Groq (fallback). Not the Anthropic/Claude API.
