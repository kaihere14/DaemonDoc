# Architecture Context

## Stack

| Layer          | Technology                        | Role                                                        |
| -------------- | --------------------------------- | ----------------------------------------------------------- |
| Client         | React 19 + Vite 7                 | SPA — all pages are client-side rendered                    |
| Routing        | React Router v7                   | Client-side routing; no server-side page rendering          |
| Styling        | Tailwind CSS v4 + shadcn/ui       | Utility-first styling; shadcn components in `components/ui` |
| Animations     | Framer Motion                     | Page transitions and component-level motion                 |
| Auth (client)  | JWT in localStorage               | Token stored after OAuth, sent as Bearer header             |
| Server         | Node.js + Express.js 5            | REST API server                                             |
| Database       | MongoDB + Mongoose                | All persistent data                                         |
| Auth (server)  | JWT (`jsonwebtoken`)              | Verified in `auth.middleware.js` on every protected route   |
| Queue          | BullMQ + Redis (IORedis)          | Async README generation jobs                                |
| AI — Primary   | Google Gemini API                 | Large context window (1M tokens); preferred provider        |
| AI — Fallback  | Groq (OpenAI-compatible SDK)      | Fallback when Gemini keys are exhausted or unavailable      |
| Payments       | Razorpay                          | INR payment orders; webhook for reliable activation         |
| Email          | Resend                            | Transactional email and admin broadcasts                    |
| Analytics      | PostHog + Vercel Analytics        | User behavior tracking on the client                        |

## Repository Structure

```
/
├── client/          # React SPA (Vite)
│   └── src/
│       ├── components/     # Shared UI components
│       ├── context/        # React context (AuthContext)
│       ├── hooks/          # Custom hooks (useRequireAuth, useRepos)
│       ├── lib/
│       │   ├── api.js      # Axios instance + ENDPOINTS map
│       │   ├── utils.js    # cn() utility
│       │   └── pages/      # Route-level page components
│       └── index.css       # Tailwind v4 theme + global styles
└── server/          # Express.js API
    └── src/
        ├── config/         # Pricing plan definitions
        ├── controllers/    # Route handler logic
        ├── db/             # Mongoose connection
        ├── email/          # Email templates and rendering
        ├── middlewares/    # Auth middleware (JWT verification)
        ├── routes/         # Express route registrations
        ├── schema/         # Mongoose models
        ├── services/       # Gemini, Groq, GitHub, email services
        ├── scripts/        # One-off migration and seed scripts
        └── utils/          # git.worker (BullMQ), redis, crypto, prompt builder, etc.
```

## System Boundaries

- `server/src/routes/` — Route registration; maps HTTP paths to controller functions.
- `server/src/controllers/` — Request handling: input validation, auth checks, DB reads/writes, queue enqueuing.
- `server/src/services/` — External integrations: GitHub API client, Gemini API, Groq API, email sending.
- `server/src/utils/git.worker.js` — BullMQ worker that runs the full README generation pipeline.
- `server/src/schema/` — Mongoose models; the authoritative data contract.
- `client/src/lib/api.js` — Single Axios instance with auth interceptor; all client HTTP calls go through here.
- `client/src/context/AuthContext.jsx` — Auth state (user, isAuthenticated, login, logout).
- `client/src/lib/pages/` — Route-level components; one file per page.

## Data Model

### User
```
githubId, githubUsername, email, avatarUrl
githubAccessToken: { iv, content, tag }   // AES-GCM encrypted
autoReadmeEnabled, emailNotificationsEnabled, admin
plan: "free" | "pro"
planInterval: "free" | "monthly" | "yearly"
reviewLimit, competitorLimit, activeRepoLimit (null = unlimited)
planExpiry, usagePeriodStart
reviewsUsed, competitorAnalysesUsed
reposDeactivatedNotification
```

### ActiveRepo
```
userId (ref User), repoId, repoName, repoFullName, repoOwner, defaultBranch
active, lastProcessedSha, webhookId
lastReadmeGeneratedAt, readmeGenerationCount, lastReadmeSha
sectionHashes (Mixed), lastSectionHashesUpdatedAt
```

### UserLog
```
userId, repoName, repoOwner
action (string), status: "ongoing" | "success" | "failed" | "skipped"
commitId
```

### PaymentLedger
```
userId (ref User)
razorpayOrderId, razorpayPaymentId
type, planBefore, planAfter
amount (paise), currency, status
note, razorpayResponse
```

### Plan
```
planId, name, interval, amount (paise), currency, billingDays
reviewLimit, competitorLimit, activeRepoLimit
active
```

### Subscription
```
(see subscription.schema.js — tracks subscription lifecycle)
```

## Auth Flow

1. User clicks "Sign in with GitHub" → redirected to GitHub OAuth.
2. GitHub redirects to `/oauth-success?code=...`.
3. `OauthVerify` page sends the code to `/auth/github/callback`.
4. Server exchanges code for GitHub access token, creates or updates `User`, issues a JWT.
5. JWT stored in `localStorage.accessToken`.
6. All subsequent API calls include `Authorization: Bearer <token>`.
7. `auth.middleware.js` verifies the JWT and sets `req.userId` on every protected route.

## README Generation Pipeline

### Trigger Sources
- **First activation**: `addRepoActivity` controller enqueues a job immediately after saving `ActiveRepo`.
- **Push webhook**: `githubWebhookHandler` enqueues a job on every push to the default branch (skips bot commits, non-default branches, and already-processed SHAs).

### Queue
- BullMQ queue named `readme-generation` backed by Redis.
- Worker runs `aihandler(data)` for each job.
- On complete: keeps last 100 job records. On fail: keeps last 50.

### Generation Modes
- **Full mode**: No existing README or no section hashes stored. Scans up to 50 repo files (Gemini limits) or 25 (Groq limits), builds full context, generates complete README.
- **Patch mode**: Existing README found with stored `sectionHashes`. Fetches only changed files from the commit diff, generates surgical section updates, reassembles the final README.

### AI Provider Strategy
- Gemini is tried first (up to 3 API keys: `GEMINI_API_KEY1`, `GEMINI_API_KEY2`, `GEMINI_API_KEY3`).
- If all Gemini keys fail, Groq is used as fallback.
- Provider limits (tokens, file counts) are resolved upfront via `getActiveLimits()`.

### Context Building
- `buildReadmeContext()` in `prompt.builder.js` assembles the prompt from repo structure, commit diff, file contents, and existing README.
- `validateContext()` checks for required fields and estimates token usage.
- `optimizeContext()` trims the context if it exceeds the provider's `contextOptimizeAt` threshold.

### Commit Back
- Generated README is committed to the repo via GitHub Contents API with message `chore: auto-update README [skip ci]`.
- `[skip ci]` prevents the webhook from re-triggering on the bot's own commit.
- Section hashes of the new README are stored on `ActiveRepo` for use in the next patch cycle.

## Payment Flow

1. Client fetches available plans from `/api/payments/plans`.
2. User selects a plan; client calls `/api/payments/create-order` → returns Razorpay order ID.
3. Razorpay checkout renders in the browser.
4. On success, client calls `/api/payments/verify` with the three Razorpay IDs.
5. Server verifies HMAC signature, fetches the order from Razorpay, validates amount/currency/userId match, then calls `applyProPlan()`.
6. `applyProPlan()` updates `User` with pro limits and expiry, and writes a `PaymentLedger` record.
7. As a reliable fallback, Razorpay sends `payment.captured` webhook → `razorpayWebhook` → idempotent `handlePaymentCaptured()`.

## Invariants

1. The BullMQ worker is the only place AI generation runs — never in a request handler.
2. GitHub access tokens are always stored encrypted (AES-GCM); plaintext tokens are never persisted.
3. Auth and `req.userId` ownership are verified before every mutation.
4. The webhook handler skips bot commits (`[skip ci]`, `auto-update README`) to prevent infinite loops.
5. Payment activation is idempotent — duplicate `razorpayPaymentId` is rejected silently.
6. Free plan repo limit is enforced at activation time; paid users have `activeRepoLimit: null` (unlimited).
7. Section hashes on `ActiveRepo` are the canonical signal for patch vs. full generation mode.
