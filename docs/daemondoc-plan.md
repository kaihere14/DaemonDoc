# DaemonDoc — Complete Plan

---

## Part 1: Current Problems (v1 Nuclear Review)

---

### Blockers — fix these first, they cause live bugs

**1. Dual log store — Convex logs table is write-only, never read**

Every log event writes to both MongoDB and Convex, but the client only ever reads from MongoDB. The Convex `logs` table, `createLog`, `updateLog`, both their indexes, and every dual-write call site exist purely to populate storage nobody queries. The writes are never atomic so the two stores silently drift. `liveUpdate` itself is copy-pasted verbatim in `github.controller.js` and `git.worker.js`.

Fix: MongoDB owns the log record. Convex owns only the live message stream via a single shared `liveUpdate(logId, message)` helper. Delete `logs:createLog`, `logs:updateLog`, the `logs` table. ~120 lines of plumbing gone, entire "two stores can disagree" failure class gone.

**Status: fixed** — MongoDB for persistence, Convex stripped down to live stream only.

---

**2. README cleanup bypasses the queue — runs inline in the HTTP request**

README generation goes through BullMQ. Cleanup — identical shape of work: fetch file, call LLM, commit to GitHub — runs inline inside the HTTP request, holding the connection open for the entire model round-trip. Three visible consequences:

- `logRecovery.service.js` exists solely to mark cleanup logs stuck in `ongoing` after a restart — a whole service that exists to paper over not enqueuing the job
- `cleanupProgressToast.js` rotates 14 joke messages on a 5 second timer because the client has no real progress signal
- Cleanup has no retry/backoff while the email queue gets `attempts: 3` with exponential backoff

Fix: enqueue cleanup on the existing queue, return `202` with `logId`. Client gets real progress. `logRecovery.service.js` deleted entirely.

---

**3. `active` flag abandoned mid-refactor — live behavior bug**

`deactivateRepoActivity` deletes the document but nothing else was updated. `ActiveRepo.active` is still in the schema with `default: true` and eight queries still filter on `active: true` — all now no-ops. `github.controller.js:186-191` checks for a document with `active: false` to decide "has this repo been activated before?" — that document can never exist anymore. So the first-activation branch which enqueues an immediate README generation fires on every re-activation, not just the first.

Fix: drop `active` field and all eight filters. Replace first-activation check with explicit `firstActivatedAt` field. Add compound unique index `{userId, repoId}`.

---

**4. Webhook HMAC verification is broken and can 500**

`express.json()` has already parsed the body before HMAC runs, so the signature is computed over a re-serialized JSON string — not the bytes GitHub actually signed. Key order and escaping are not guaranteed to round-trip. Additionally `timingSafeEqual` throws when buffers differ in length, so a malformed `x-hub-signature-256` header produces an unhandled throw and a 500 instead of a 401.

Fix: mount `express.raw({ type: "application/json" })` on the webhook route only, HMAC the raw buffer, length-check before `timingSafeEqual`, parse body afterwards.

---

**5. `groq.service.js` — 987 lines, wrong name, failover loop written twice**

Named for one provider but orchestrates two (Gemini primary, Groq fallback), owns key rotation, retry classification, token budgeting, three inline prompts, and both generation modes. OpenRouter bypasses this stack entirely with a raw fetch in a separate file. The provider failover loop is written twice — once in `generateReadme` and once in `generateReadmePatch` — same `for` over `buildProviderList()`, same error ladder, same exhaustion log. They differ only in what they do on success and their failure contract: one throws, the other returns `null`. JSON extraction appears three times. Token estimation has two names (`estimateTokens` private, `estimateTokenCount` exported) plus a third in `prompt.builder.js`. Two mode vocabularies (`full/patch` and `full/enhance/incremental`) for the same concept. `GROQ_MAX_INPUT_TOKENS = 8000` contradicts `PROVIDER_LIMITS.groq.maxInputTokens = 6000` in another file.

Fix: `llm/failover.js` with one `withProviderFailover()`, consistent throw contract. Split into `providers/gemini.js`, `providers/groq.js`, `providers/openrouter.js` (transport only), `readme.generate.js`, `readme.patch.js`. ~987 lines lands near 400 across focused files.

---

**6. Gemini `thought` fallback can commit model reasoning as a README**

If the Gemini response has no `text` but has a `thought` part, the function returns the thought — which the worker happily commits to `README.md`. The file's own comments admit this is unresolved.

Fix: delete the thought handling entirely. If response has no text, throw. Also verify default model IDs (`gemini-3.5-flash`, `gemini-3.1-flash-lite` don't correspond to published models) — these fire when env vars are unset.

---

### High value, low risk

**7. Three Redis connections, two byte-identical**

`utils/redis.js` exports `redis` and `redisConnection` with identical config — two live sockets. `git.worker.js` opens a third with slightly different config then also imports `redis` from `redis.js`. Three connections, three drifting configs.

Fix: one `createRedis()` factory in `utils/redis.js` with the resilience options `git.worker.js` clearly wanted, named exports for BullMQ.

---

**8. `redis.del("admin_analytics")` scattered across 9 places, no TTL**

Cache invalidation in nine places across four modules. Any new write path that forgets the line serves stale analytics forever because `redis.set` is called with no TTL.

Fix: one `invalidateAnalyticsCache()` helper plus a TTL as a backstop.

---

**9. Worker lives in `utils/` and starts on import**

`git.worker.js` opens a Redis connection, creates a Queue, and instantiates a Worker as an import side effect. `github.controller.js` imports it just to get `readmeQueue` and thereby starts a worker inside the API process. No `SIGTERM` handling means in-flight README generations are killed mid-commit on every deploy.

Fix: `jobs/readme.queue.js` (producer only) and `jobs/readme.worker.js` (separate entry point, graceful shutdown). `aihandler` moves to `services/readme.pipeline.js`.

---

**10. `fetchFilesFromTree` is fully serialized — biggest latency contributor**

`for...await` over up to 50 GitHub file fetches, one at a time. A bounded-concurrency map at 4-6 parallel is the same amount of code and makes this a fraction of the time.

---

**11. OAuth: no `state` param, users matched by mutable username**

Login flow open to CSRF. GitHub usernames are mutable and reusable — `githubId` is the stable identifier already stored in the schema.

Fix: add `state` param, match on `githubId`, update username from profile on login.

---

**12. Raw error objects leaked to clients**

`res.status(500).json({ message: "...", error })` in five controllers. Serializing an axios error can expose URLs, headers, and tokens.

Fix: log server-side, return only a message string to the client.

---

**13. `/health` lies**

Returns `redis: "connected"` as a hardcoded string without checking Redis. The keepalive cron treats a 200 as proof the system is up.

---

**14. `github.service.js` destroys error info the retry logic needs**

Six functions wrap calls in `try/catch` that discard `error.response` — which is exactly what `isRetriableError()` inspects to decide whether a 429/503 is retriable. Any GitHub failure through this layer is classified non-retriable.

Fix: preserve original error with `{ cause }` or keep `.response`.

---

**15. `deleteAccount` — non-atomic, sequential webhook teardown**

Deletes webhooks in a sequential `for` loop then deletes User, UserLog, ActiveRepo in three separate awaits. A failure between them leaves orphaned data.

Fix: `Promise.allSettled` for webhook teardown, delete dependents first, user last.

---

### Structural issues (schedule deliberately)

**16. `Login.jsx` — 804 lines, five demo steps as five branches of one effect**

12 `useState`, a 5-branch mega-effect, `setTimeout(fn, 0)` rewind workaround. Each step's state is dead weight while the other four are showing.

Fix: each step becomes a self-contained component. Parent becomes `const Step = STEPS[step]`. Remounting on step change gives the rewind for free — 10 of 12 `useState` hooks disappear.

---

**17. `Admin.jsx` — 31-prop modal, state mutation bug**

`EmailComposerModal` receives 31 props, half of them raw `setX` setters. `handleChangeUpdate` copies the array but mutates the object inside it — will break any memoization.

Fix: modal owns its wizard state. Parent keeps `open` and `onSubmit(payload)`. 31 props become 3.

---

**18. ~15 components and 6 images duplicated between `client` and `seo-client`**

Already drifted (`unplug`: 246 lines vs 97, `icon`: 572 vs 634) so a fix in one doesn't reach the other.

Fix: `packages/ui` shared library, one implementation, both apps consume it.

---

**19. `github.controller.js` — 770 lines, six responsibilities**

Repos + webhooks + logs + admin analytics + admin users + cleanup all in one file.

Fix: split into `repos.controller.js`, `webhook.controller.js`, `logs.controller.js`, `admin.controller.js`.

---

### Hygiene (an afternoon, mostly deletions)

- Delete four stray lockfiles (`client/pnpm-lock.yaml`, `seo-client/pnpm-lock.yaml`, `server/pnpm-lock.yaml`, `server/package-lock.json`)
- Delete `fix-eslint.js` (committed codemod, can't even run — CommonJS `require` in ESM repo)
- Drop `zustand` (0 imports), `openai` (0 imports), `crypto` npm shim (shadows Node builtin, deprecated)
- Pick one animation library — `motion` and `framer-motion` are the same package, both installed
- Extend ESLint to `server` and `seo-client` (currently covers `client` only)
- Add CI: lint + build on every push
- `getGithubRepos` fetches `per_page=100` with no pagination — silent truncation for users with 100+ repos
- Delete unauthenticated debug endpoints `/api/convex/test` and `/api/convex/tasks`
- Make `sendEmail`'s `to` param required — currently defaults to personal Gmail
- Fix `parseReadmeSections` duplicate heading collision — two `## Usage` headings overwrite each other
- Fix `buildPatchSystemPrompt` — numbers two different rules as `6` when `strictMode` is on
- Fix `HALLUCINATION_PHRASES` — includes `"I cannot"` and `"please note that"` as substrings, trips on legitimate README content
- Delete `createMinimalContext` in `prompt.builder.js` — documented as "for testing", no tests exist
- Add `createdAt` index to `UserLog` — analytics sorts and range-filters on it in four queries
- First tests: `readme.parser.js`, `readme.validator.js`, `prompt.builder.js`, `getImportantFiles` — all pure functions with clear contracts

---

## Part 2: v1 Patch Plan

Goal: ship per-repo analytics and customization without breaking 60 existing users. Zero architectural risk — purely additive changes.

### Backend changes

- Add `repoId` (indexed) to `UserLog` — existing logs just won't have it, new logs carry it going forward
- Add to `ActiveRepo`: `generationMode` (auto/always-full/always-patch), `ignoredPaths: [String]`, `customSections: [String]`, `reviewEnabled: Boolean`, `firstActivatedAt: Date`
- Add to `ActiveRepo` for migration: `migratedToV2: Boolean`, `migratedAt: Date`
- Add to `User` for migration: `v2InstallationId: Number`
- `GET /api/repos/:repoId/analytics` — generation history, success rate, avg time, mode breakdown
- `GET /api/repos/:repoId/logs` — logs scoped to that repo
- `PATCH /api/repos/:repoId/settings` — save customization fields
- Parallelize `fetchFilesFromTree` with bounded concurrency — biggest latency win, near-zero risk
- Fix webhook HMAC (safe to backport)
- Fix OAuth lookup to `githubId` (safe to backport)
- Stop leaking raw errors to clients (safe to backport)
- Fix `/health` to actually ping Redis (safe to backport)

### Frontend changes

- Repo card opens `/repos/:repoId` instead of a modal
- Per-repo analytics page: generation history chart, success/fail rate, mode breakdown badges, last commit processed
- Per-repo settings panel: generation mode toggle, ignored paths, custom sections input
- Live log feed scoped to that repo
- Context richness indicator (indexed files vs total files) — placeholder for v2 ingest, wired up in v2
- Migration banner in dashboard — persistent, links to GitHub App install URL once v2 is live

### What you do NOT touch in v1

- Auth flow (GitHub OAuth stays)
- Queue architecture
- Convex real-time layer
- `active` flag (fixing it touches too many things, clean in v2 rewrite)
- LLM orchestration layer

---

## Part 3: v2 Full Rewrite Plan

Clean slate. New repo. Every blocker fixed from line one.

---

### Stack decisions

| Layer     | v1                               | v2                                                    |
| --------- | -------------------------------- | ----------------------------------------------------- |
| Auth      | GitHub OAuth + per-repo webhooks | GitHub App (installation tokens)                      |
| Real-time | Convex                           | SSE — no external dependency                          |
| Queue     | BullMQ (partial)                 | BullMQ for everything, worker as separate entry point |
| Vector DB | none                             | Qdrant                                                |
| Database  | MongoDB                          | MongoDB (keep it, fix schema)                         |
| LLM       | `groq.service.js` 987 lines      | split providers + one `withProviderFailover`          |
| Frontend  | React 19 + Vite                  | Next.js 15                                            |
| Monorepo  | pnpm workspace (drifting)        | pnpm workspace + `packages/ui` from day one           |

SSE replaces Convex entirely. The nuclear review showed Convex's `logs` table was write-only and never queried — only the live message stream mattered. SSE gives you the same real-time UX with zero external dependency and no dual-write problem.

---

### Folder structure

```
server/
  src/
    jobs/
      readme.queue.js         producer only
      readme.worker.js        separate entry point, graceful SIGTERM
      ingest.queue.js
      ingest.worker.js
      review.queue.js
      review.worker.js
    controllers/
      repos.controller.js
      webhook.controller.js
      logs.controller.js
      admin.controller.js
    services/
      github/
        github.client.js      raw API calls, preserves error.response
        github.app.js         installation token fetch + cache + refresh
      llm/
        providers/
          gemini.js           transport only
          groq.js             transport only
          openrouter.js       transport only
        failover.js           withProviderFailover, written once
        readme.generate.js
        readme.patch.js
      ingest/
        chunker.js
        embedder.js
        symbol-graph.js
      review/
        diff.parser.js
        review.generate.js
      readme/
        pipeline.js           aihandler logic, properly placed
        parser.js             keep from v1, it's good
        validator.js          keep from v1, it's good
      sse.service.js          per-logId streams, heartbeat, unsubscribe
    models/
      User.js
      ActiveRepo.js
      UserLog.js
      ReviewRun.js
    middleware/
      auth.js
      raw-body.js             webhook route only
    routes/
      repos.routes.js
      webhook.routes.js
      auth.routes.js
      admin.routes.js
      sse.routes.js
    utils/
      redis.js                one factory, one config
      crypto.js               standalone, never re-exported
      prompt.builder.js
      logger.js               structured, logId-bound, replaces 127 console.*
```

---

### New schemas

**`ActiveRepo` v2**

```js
{
  userId: ObjectId,
  repoId: String,
  repoName: String,
  installationId: Number,
  ingestStatus: enum(pending | ingesting | ready | failed),
  ingestSha: String,
  qdrantCollection: String,
  generationMode: enum(auto | always-full | always-patch),
  ignoredPaths: [String],
  customSections: [String],
  reviewEnabled: Boolean,
  reviewSeverityThreshold: enum(blocking | suggestion | nit),
  reviewMode: enum(inline | summary),
  firstActivatedAt: Date,
  contextRichnessScore: Number,
  currentReadmeSha: String,
  lastGeneratedAt: Date,
}
```

**`UserLog` v2**

```js
{
  userId: ObjectId,
  repoId: String,             // indexed
  logId: String,
  type: enum(generation | cleanup | review | ingest),
  status: enum(pending | ongoing | success | failed),
  mode: enum(full | patch),
  commitSha: String,
  commitMessage: String,
  messages: [{ text: String, ts: Date }],
  generationMs: Number,
  createdAt: Date,            // indexed
}
```

**`ReviewRun` (new)**

```js
{
  userId: ObjectId,
  repoId: String,
  prNumber: Number,
  prTitle: String,
  status: enum(pending | running | posted | failed),
  commentCount: Number,
  severityCounts: { blocking: Number, suggestion: Number, nit: Number },
  githubReviewId: Number,
  createdAt: Date,
}
```

---

### Phase A: v2 Backend Core

**GitHub App + Auth**

- Register GitHub App, configure permissions (contents read/write, pull requests read/write, webhooks, metadata read)
- Installation token manager — fetch, cache per `installationId`, auto-refresh before expiry
- New auth flow — GitHub App OAuth (different from v1)
- `User` model with `githubId` as primary key
- All new v2 schemas

**Infrastructure**

- SSE service — per-logId streams, heartbeat, client subscribe/unsubscribe
- Structured logger with `logId` binding — replaces 127 console.\* calls
- Redis single factory, named exports for BullMQ
- `invalidateAnalyticsCache()` + TTL on all cache sets
- `crypto.js` standalone, never re-exported through a controller

**LLM Layer**

- `providers/gemini.js`, `providers/groq.js`, `providers/openrouter.js` — transport only
- `failover.js` — `withProviderFailover()` once, consistent throw contract
- `readme.generate.js` — full mode
- `readme.patch.js` — patch mode
- `prompt.builder.js` absorbs all prompts, fixes duplicate rule `6`, fixes `HALLUCINATION_PHRASES`

**Queue + Worker Architecture**

- `jobs/readme.queue.js` — producer only, imported by controllers
- `jobs/readme.worker.js` — separate entry point, graceful SIGTERM, `commitAndRecord()` shared tail
- Webhook handler with raw body, correct HMAC, length-guard

---

### Phase B: v2 Ingest Pipeline

The shared backbone both README and review engines query against.

**Core Ingest**

- `ingest.queue.js` + `ingest.worker.js`
- `chunker.js` — file-level for small files, function/class-level for large ones
- `embedder.js` — Gemini embedding API or OpenAI `text-embedding-3-small`
- Qdrant collection management — one collection per repo, namespaced by `repoId`
- Full ingest on first enable — entire repo tree, chunk, embed, store
- `ingestStatus` progression: `pending → ingesting → ready → failed`
- `contextRichnessScore` — indexed file count vs total file count, exposed on API

**Progressive Context (incremental updates)**

- On every push: fetch changed files only, upsert embeddings by `sha`
- Drift detection: if >40% of files changed since `ingestSha`, trigger full re-ingest instead of incremental
- Manual "rebuild index" trigger from repo settings page
- Quality improves naturally commit by commit — thin at first for new repos, rich for mature repos

**Symbol Graph**

- Regex-based import extraction for JS/TS/Python (no AST for now)
- Store as edges in MongoDB `{repoId, file, imports: []}`
- 1-hop traversal for cross-file context retrieval

**RAG-powered README pipeline**

- On push: vector search using commit diff as query, retrieve top-K related chunks
- Context builder: `diff + retrieved chunks + current README + 1-hop symbol graph`
- Hand off to `readme.generate.js` or `readme.patch.js` based on mode decision
- Upsert changed file embeddings after generation

---

### Phase C: v2 Review Engine

**Diff Processing**

- `diff.parser.js` — parse PR diff into per-file hunks with line numbers
- Fetch full file contents for each changed file via GitHub App

**Context Retrieval**

- Vector search per changed file — top-K related chunks from Qdrant
- Symbol graph 1-hop — what imports this file, what does this file import
- Merge diff + chunks + symbol context into review prompt

**Review Generation**

- `review.generate.js` — LLM prompt with severity classification (blocking/suggestion/nit)
- Noise control — configurable severity threshold per repo (default: skip nits)
- Summary comment mode vs inline comments mode as repo setting

**GitHub Integration**

- Post via GitHub App review API — `POST /pulls/:pr/reviews` with line-anchored comments
- `ReviewRun` record created on PR open, updated on post
- Re-review on new push to same PR — diff against last reviewed commit sha

---

### Phase D: v2 Frontend

**Foundation**

- `packages/ui` — shared component library from day one, no drift between apps
- Design system — typography, color tokens, spacing
- Route-level auth guards (not component-level)
- SSE hooks replacing Convex subscriptions
- Single monorepo: `apps/web` (Next.js 15) absorbs landing page, no separate `seo-client`

**Pages**

```
/                           landing (merged into main app, no separate seo-client)
/login                      GitHub App install flow
/dashboard                  repo list, ingest status badges, context richness indicator
/repos/[repoId]             per-repo analytics, customization, review toggle
/repos/[repoId]/logs        live generation log feed via SSE
/repos/[repoId]/reviews     PR review history, comment severity breakdown
/settings                   account, billing, plan
/admin                      admin panel (modal owns state, 3 props not 31)
```

---

### Phase E: Migration from v1 Webhook to GitHub App

This is the most critical phase — moving 60 existing users from per-repo OAuth webhooks to GitHub App installation without any README generation gap.

---

#### The core problem

In v1, webhooks are registered per-repo manually using the user's OAuth token. Each `ActiveRepo` stores a `webhookId` your app created. GitHub App webhooks work completely differently — when a user installs the App, GitHub automatically sends webhooks for all repos they grant access to. You never create webhooks manually.

Migration = get users to install the GitHub App, at which point the App takes over webhook delivery and old per-repo webhooks become redundant.

---

#### Schema additions needed in v1 (additive, no breaking changes)

```js
// ActiveRepo — two new fields
migratedToV2: { type: Boolean, default: false }
migratedAt: { type: Date }

// User — one new field
v2InstallationId: { type: Number }
```

---

#### Migration flow step by step

**Step 1: Register and deploy the GitHub App**

Before any user touches anything, the GitHub App is live with its webhook URL pointing at v2's endpoint (`api-v2.daemondoc.online/webhooks/github`). v1's webhook URL stays alive in parallel. Both systems run simultaneously.

**Step 2: Show migration banner in v1 dashboard**

When a user logs into v1, show a persistent banner: "DaemonDoc v2 is here — install the GitHub App to unlock RAG-powered README generation and code review." One button: "Install GitHub App" — links directly to the GitHub App's public install URL. A user who ignores this keeps getting READMEs generated via v1. No interruption.

**Step 3: User clicks install**

GitHub's install flow asks which repos to grant access to. User approves. GitHub sends an `installation` webhook event to v2's backend containing the `installationId` and list of repos.

**Step 4: v2 handles the `installation` event**

```
installation webhook fires on v2
        |
look up user by githubId in shared MongoDB
        |
create User record in v2 collection, carry over plan + billing
        |
for each repo in installation that matches an existing v1 ActiveRepo:
  - create v2 ActiveRepo with ingestStatus: pending
  - queue ingest job
        |
mark those repos in v1 DB as migratedToV2: true, migratedAt: now
        |
store installationId on v1 User as v2InstallationId
        |
use installationId to delete old v1 per-repo webhooks via GitHub API
(you now have the installation token to do this — no user action needed)
```

**Step 5: v1 webhook handler respects migration flag**

For any repo where `migratedToV2: true`, if a push event still arrives at v1's webhook endpoint (race condition or delayed delivery), v1 ignores it and returns `200`. v2 is now the source of truth for that repo.

**Step 6: New repos after migration**

If a user installs the GitHub App and later creates a new repo, the App's `installation_repositories` event fires automatically and v2 picks it up. No v1 involvement needed.

---

#### Edge cases

**User only grants App access to some repos**

Only migrate repos where the installation covers them. Repos not included in the App installation stay on v1 until sunset or until the user expands App permissions.

**User never migrates**

v1 keeps working for them until the 60-day sunset. They see the banner on every login. At day 45, send a warning email. At day 60, v1 stops processing their webhooks and shows a "service ended, please install the GitHub App" page.

**Race condition: push arrives at both v1 and v2**

The `migratedToV2` flag on `ActiveRepo` is the guard. v1 checks it before processing any webhook event. If true, return `200` immediately and do nothing. v2 is authoritative.

---

#### Migration sequence summary

```
v2 GitHub App registered and live
            |
v1 users see migration banner in dashboard
            |
user clicks "Install GitHub App"
            |
GitHub sends installation webhook to v2
            |
v2 finds user by githubId in shared MongoDB
creates v2 records, carries over billing
queues ingest jobs for each repo
            |
v2 deletes old v1 per-repo webhooks
using installation token
            |
v1 marks repos as migratedToV2: true
            |
user is fully on v2
v1 ignores their repos going forward
```

Zero downtime. No README generation gap. No user action beyond clicking "Install".

---

### Phase F: Launch + Sunset

**Parallel run**

- v2 launches alongside v1, v1 stays live
- On v2 signup, check `githubId` against v1 DB — carry over plan/billing if match
- Migration email to all 60 users — "reconnect in one click via GitHub App"
- v1 webhook handlers check `migratedToV2` flag, ignore migrated repos

**Sunset**

- Day 0: v2 launches, migration banner live in v1
- Day 45: warning email to all unmigrated users
- Day 60: v1 stops processing webhooks, shows migration page
- Day 60+: v1 decommissioned

**Launch**

- New landing page live
- Product Hunt + X launch post
- DaemonDoc v2 announcement to existing users
