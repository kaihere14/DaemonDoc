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

## Next Up

- Add specific next feature here when starting work.

## Open Questions

- Should the Logs page poll for live status updates on ongoing jobs, or require a manual refresh?
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
