# DaemonDoc

## Overview

DaemonDoc is an AI-powered GitHub README generator. Users connect their GitHub repositories, activate them with a toggle, and DaemonDoc automatically generates or updates the README every time code is pushed. The AI reads the actual codebase and commit diff to write accurate, up-to-date documentation without any manual effort from the developer.

Live at: [daemondoc.online](https://daemondoc.online)

## Goals

1. Let users sign in via GitHub OAuth and connect their GitHub account.
2. Let users activate any of their GitHub repositories for automatic README generation.
3. Automatically trigger README generation on every push to the default branch.
4. Use AI to generate a full README on first activation, then patch only changed sections on subsequent pushes.
5. Let users view generation logs per repo to understand what happened and when.
6. Support a freemium subscription model with plan-gated repo limits.
7. Provide an admin dashboard for analytics, user management, and payment oversight.

## Core User Flow

1. User visits the landing page and clicks "Get Started."
2. User signs in via GitHub OAuth.
3. User is redirected to `/home` (the repository dashboard).
4. User sees all their GitHub repos and toggles activation on the ones they want.
5. On first activation, an AI README generation job is triggered immediately.
6. On each subsequent push to the default branch, a generation job is queued.
7. User visits `/logs` to see recent generation history and statuses.
8. User can upgrade to Pro on `/upgrade` to unlock unlimited active repositories.

## Features

### Authentication

- GitHub OAuth login flow (GitHub → OAuth callback → JWT issued → stored in localStorage).
- JWT-based session: every API request carries the token in the `Authorization: Bearer` header.
- Route protection via `useRequireAuth` hook — unauthenticated users are redirected to `/login`.
- Account deletion supported via `/auth/delete`.

### Repository Management

- Fetches all user-owned, non-fork, push-permitted repos from GitHub API.
- Users can activate or deactivate repos with a toggle.
- Activating a repo registers a GitHub push webhook on that repo.
- Deactivating removes the webhook and deletes the `ActiveRepo` record.
- Stats bar on the dashboard shows total, active, inactive, and private repo counts.
- Filter by All / Active / Inactive tabs plus a search bar.
- Pagination (12 repos per page).
- Free plan cap: 5 active repos. Pro plan: unlimited.
- Auto-deactivation notification banner when free plan limit is exceeded after a downgrade.

### AI README Generation

- On first activation, the full codebase is scanned (up to 50 files with Gemini, 25 with Groq).
- On subsequent pushes, patch mode runs: only sections affected by the commit diff are updated.
- Generation mode is chosen automatically (`determineGenerationMode`) based on whether an existing README is present and has section hashes stored.
- Gemini is the primary AI provider (1M token context). Groq is the fallback.
- The generated or patched README is committed back to the repo with `[skip ci]` to avoid loops.
- Section hashes are stored on `ActiveRepo` after each run to enable surgical patch mode next time.

### Generation Logs

- Users see the last 10 generation events per account on `/logs`.
- Each log shows repo name, status (success / failed / ongoing / skipped), and timestamp.
- Successful logs link to the commit SHA.
- Ongoing jobs show a live spinner.

### Subscription and Payments

- Free plan: 5 active repos, 1 AI review, 1 competitor analysis.
- Pro plan: unlimited active repos, 20 AI reviews, 10 competitor analyses.
- Pricing in INR via Razorpay: ₹499/month or ₹3,999/year.
- Payment flow: create order → Razorpay checkout → verify signature → activate plan.
- Webhook fallback: Razorpay sends `payment.captured` event as a reliable second path.
- Plan expiry with 4-day grace buffer. Usage resets every 30 days from activation.

### Admin Dashboard

- `/admin` is accessible only to users with `admin: true`.
- Analytics: total users, active repos, total generation runs, live jobs, success rate, last-24h activity.
- 7-day activity chart (total / success / failed / skipped / ongoing).
- Top 5 repos by generation count.
- Payment analytics: paid users, MRR, ARR, revenue chart, recent payment log.
- User plan management: search, filter, view plan details, revoke Pro plan.
- Admin can update plan prices in the DB.
- Admin can broadcast emails to all users.

### User Profile

- View GitHub username, email, avatar, and plan details.
- Toggle email notifications.
- Toggle global auto-README.
- Account deletion.

### Onboarding Walkthrough

- Step-based walkthrough stored in `localStorage` keyed by GitHub username.
- Step 0: Banner on Home prompting user to activate their first repo.
- Step 1: Modal after first activation, guiding user to the Logs page.
- Step 2: Banner on Logs page confirming the flow is set up.
- Walkthrough can be skipped at any step.

## Scope

### In Scope

- GitHub OAuth authentication and JWT session management
- Repository activation, deactivation, and plan-gated limits
- GitHub push webhook registration and handling
- AI README generation pipeline (full + patch modes)
- BullMQ background job queue for generation work
- Generation log tracking per user
- Freemium subscription via Razorpay (INR)
- Admin dashboard for analytics and user management
- Email delivery via Resend
- PostHog analytics and Vercel Analytics

### Out Of Scope

- Pull request / branch-level README generation
- Per-section override or manual editing UI
- Team or organization account support
- Versioned README history
- Non-GitHub VCS providers (GitLab, Bitbucket)
- Mobile-native applications

## Success Criteria

1. A user can sign in with GitHub and see all their repositories.
2. Activating a repo creates a GitHub webhook and triggers immediate README generation.
3. Every push to the default branch fires a generation job without user intervention.
4. The generated README is committed back and visible on GitHub.
5. Users can view their generation history on the Logs page.
6. Free plan enforces the 5-repo limit; Pro plan removes it.
7. Payment creates a Razorpay order, signature is verified, and the Pro plan is applied.
