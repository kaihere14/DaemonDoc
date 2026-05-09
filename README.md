
# DaemonDoc — AI-Powered README Generator

<div align="center">

[![Live](https://img.shields.io/badge/www.daemondoc.online-4F46E5?style=for-the-badge)](https://www.daemondoc.online)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

**Connect a repo. Push code. Get a professional README — automatically.**

[Features](#-features) • [How It Works](#-how-it-works) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

DaemonDoc is an AI-powered documentation engine that automates the creation and maintenance of GitHub READMEs. By integrating directly with your repositories via webhooks, it analyzes your codebase and commit diffs to ensure your documentation remains accurate and up-to-date without manual intervention.

The system features a sophisticated **dual-mode AI pipeline**:
- **Full Generation**: Scans the repository tree and key files to build a comprehensive initial README.
- **Patch Mode**: Uses stored section hashes to surgically update only the parts of the README affected by recent commits, preserving the rest of the document and minimizing token usage.

Powered by **Google Gemini** (primary, 1M token context) with a resilient fallback to **Groq**, DaemonDoc handles complex repository structures with ease. It includes a full-featured dashboard for repository management, real-time generation logs, and a Pro subscription tier powered by **Razorpay**.
## ✨ Features

- **AI Discovery Layer** — Machine-readable `llms.txt` and `site-metadata.json` files providing high-density technical summaries and capability maps for AI crawlers.
- **Semantic Repository Metadata** — Integrated `README-AI.md` and extended JSON-LD metadata for improved semantic association and GitHub discovery.
- **Agent-Ready Context** — Dedicated `ai-context.md` instruction sets designed for seamless integration and accurate recommendation by AI developer agents.
- **Real-time Log Detail Streaming** — Live-updating message trails for generation jobs powered by Convex reactive subscriptions.
- **Expandable Activity Logs** — Interactive log rows that expand to reveal a live-updating message trail of the documentation pipeline using Framer Motion animations.
- **Unified Log Correlation** — Seamlessly links MongoDB persistent logs with Convex transient message streams via unique log identifiers for real-time status tracking.
- **Dynamic Hero Experience** — Enhanced landing page featuring interactive video controls, floating tech stack iconography, and animated workflow steps (Connect, Push, Sync).
- **Guided User Onboarding Walkthrough** — A multi-stage interactive experience including non-blocking dashboard banners and contextual guidance in the activity logs.
- **Pro Subscription Tier** — Unlock unlimited repositories, priority AI generation, and enhanced project/competitor analysis limits.
- **Seamless Payment Integration** — Integrated upgrade flow with real-time plan synchronization and localized currency formatting (INR) via Razorpay.
- **Animated Technical Iconography** — Custom-engineered SVG animations (Hammer, Disc, PlugZap, Search) that visualize complex engine processes like AST scanning.
- **Intelligent Code Analysis** — Powered by Gemini 1.5 Flash for deep understanding of codebase structure, logic, and intent with RAG-based context synthesis.
- **Multi-Key AI Fallback** — Resilience through 3-key rotation for both Gemini and Groq providers, ensuring continuous generation availability.
- **Async Job Queue** — BullMQ + Redis handles all generation in the background; webhooks return instantly to GitHub.
- **Enterprise-Grade Security** — Bank-level AES-256 encryption protects GitHub tokens and repository access keys at rest.
## ⚙️ How It Works

1. Connect GitHub Account → OAuth login, encrypted token stored
2. Activate a Repo → Webhook created. If it's the first activation, an initial README is generated immediately.
3. Push Code → Webhook fires, job queued in Redis
4. AI Scans Codebase → Step 1: file selection (mini model)
   Step 2: README generation (main model)
5. README Committed → Pushed back to your repo automatically
6. Feature Announcement → (Optional) Craft updates via a **4-step guided wizard** in the Admin dashboard, featuring categorized tags, **targeted recipient selection**, unlimited change entries, and real-time validation.

### Full vs Patch Mode

- **Full generation** — Used when no README exists yet, or the existing one is under 500 characters. Scans up to 50 files and generates from scratch.
- **Patch mode** — Used on subsequent pushes. Identifies which README sections are affected by the changed files, then surgically rewrites only those sections using a SHA-256 section hash to detect what actually changed.

### AI Provider Chain

Gemini key 1 → Gemini key 2 → Gemini key 3 → Groq key 1 → Groq key 2 → Groq key 3

Retriable errors (429 rate limit, 503 overload, network errors) move to the next key. Auth failures (401/403) and payload errors (413) also fall through.

## Tech Stack 🛠️

### Frontend (`/client`)

| Technology                 | Purpose                  | Version |
| -------------------------- | ------------------------ | ------- |
| React                      | UI framework             | 19.x    |
| Vite                       | Build tool               | 7.x     |
| Convex React Client        | Real-time subscriptions  | 1.17.x  |
| React Router               | Client-side routing      | 7.x     |
| Tailwind CSS               | Styling                  | 4.x     |
| Framer Motion              | Animations & Transitions | 12.x    |
| Lucide React               | Icons                    | 0.562.0 |
| PostHog                    | Analytics                | —       |

### Backend (`/server`)

| Technology         | Purpose                       | Version |
| ------------------ | ----------------------------- | ------- |
| Node.js            | Runtime                       | 18+     |
| Express            | Web framework                 | 5.x     |
| Convex             | Real-time log store           | —       |
| MongoDB + Mongoose | Database                      | —       |
| Redis + IORedis    | Job queue backing & Cache     | —       |
| BullMQ             | Job queue                     | 5.x     |
| JWT                | Auth tokens                   | —       |

### AI & External Services

| Service                   | Role                                                |
| ------------------------- | --------------------------------------------------- |
| **Gemini 1.5 Flash**      | Primary README generation (1M context)              |
| **Groq**                  | Fallback provider for both generation and selection |
| **Convex**                | Live log metadata and message details               |
| **GitHub API**            | Repo tree, file content, webhooks, commits          |
| **Razorpay**              | Payment processing and subscription management      |
| **Resend**                | Transactional and broadcast email services          |

---
## 🏗️ Architecture

DaemonDoc follows a modern decoupled architecture designed for scalability and reliability:

- **Frontend**: A high-performance SPA built with **React 19**, **Vite 7**, and **Tailwind CSS v4**. It utilizes **Convex React Client** for read-only reactive subscriptions to live log details.
- **Backend**: An **Express.js 5** REST API handling authentication, repository orchestration, and payment processing. It mirrors log events to Convex via HTTP actions.
- **Worker Tier**: A robust **BullMQ** system backed by **Redis** that offloads long-running AI generation tasks from the main request cycle.
- **Real-time Layer**: **Convex** serves as the transient store for live log metadata and message trails, allowing the client to stream updates without polling the primary database.
- **Data Layer**: **MongoDB** (via Mongoose) remains the authoritative source for user profiles, encrypted GitHub tokens, and persistent generation logs.
- **AI Engine**: A multi-provider strategy utilizing **Google Gemini** for deep context analysis, falling back to **Groq** for high-speed resilience.
- **Integrations**:
  - **GitHub API**: For OAuth, webhook management, and committing documentation via the Contents API.
  - **Razorpay**: For secure INR payment processing and subscription lifecycle management.
  - **Resend**: For transactional and broadcast email delivery.
## Installation 🛠️

### Prerequisites

- Node.js 18+ or **Bun**
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- Redis (local or via **Docker**)
- [Convex Account](https://www.convex.dev/)
- [GitHub OAuth App](https://github.com/settings/developers)
- Gemini API keys from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Groq API keys from [Groq Console](https://console.groq.com) (fallback)

### 1. Clone

bash
git clone https://github.com/kaihere14/daemondoc.git
cd daemondoc


### 2. Infrastructure (Redis via Docker)

If you have Docker installed, you can quickly spin up the required Redis service:

bash
cd server
docker-compose up -d


### 3. Convex Setup

bash
cd ../convex-server
npm install
npx convex dev # This will set up your Convex project and generate types


### 4. Server setup

bash
cd ../server
npm install # or bun install


Create `server/.env` with your environment variables (refer to the Configuration section).

### 5. Client setup

bash
cd ../client
npm install # or bun install

## 🗄️ Database

MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/daemondoc

### Schema Optimizations
- **Indexing**: The `userId` and `logId` fields in the `userLog` schema are indexed to optimize query performance for activity tracking and real-time correlation between MongoDB and Convex.

### Convex Real-time Store
- **logs**: Stores transient log metadata (`logId`, `status`, `repoName`, `updatedAt`) for reactive UI updates.
- **logMessages**: Stores chronological message trails for active generation jobs, indexed by `logId` for efficient streaming to the client.
# Auth

JWT_SECRET=your_jwt_secret_minimum_32_chars
GITHUB_TOKEN_SECRET=64_char_hex_for_aes256_encryption

# GitHub OAuth App

GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_WEBHOOK_SECRET=your_webhook_secret

> **Note:** The webhook handler now ignores pushes to non‑default branches, so README generation only occurs for pushes on the repository's default branch.

# Redis (omit REDIS\_\* vars to use localhost:6379 with no auth)

REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# App URLs

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Gemini (primary AI provider — add up to 3 keys for rate limit resilience)

GEMINI_API_KEY1=your_gemini_key_1
GEMINI_API_KEY2=your_gemini_key_2
GEMINI_API_KEY3=your_gemini_key_3
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_MODEL_MINI=gemini-3-flash-preview

# Groq (fallback — add up to 3 keys) ⚡

GROQ_API_KEY1=your_groq_key_1
GROQ_API_KEY2=your_groq_key_2
GROQ_API_KEY3=your_groq_key_3
GROQ_MODEL=openai/gpt-oss-120b

This provider includes intelligent prompt truncation to respect the 8,000 token context limit. It utilizes a middle-cut strategy to preserve critical context framing (head and tail) when processing large codebases.
# Output

README_FILE_NAME=README.md

````

### 3. Client setup

```bash
cd client
npm install
````

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Start development

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev


Open **http://localhost:5173**

---
## Configuration

### Convex Integration

1. Create a project on [Convex](https://www.convex.dev/)
2. Add to `client/.env`:
   - `VITE_CONVEX_URL=your_convex_deployment_url`
3. Add to `server/.env`:
   - `CONVEX_SITE_URL=your_convex_site_url` (for HTTP actions)

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. Set **Authorization callback URL** to `http://localhost:3000/auth/github/callback`
3. Copy **Client ID** and **Client Secret** → add to `server/.env`
4. Ensure your webhook is configured for push events; the system will only process pushes to the default branch.

### PostHog Analytics

1. Sign up at [PostHog](https://posthog.com/)
2. Create a new project and copy your **Project API Key** and **API Host**
3. Add to `client/.env`:
   - `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=your_project_token`
   - `VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (or your region's host)

### Gemini API Keys

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create up to 3 API keys for rate limit resilience
3. Add as `GEMINI_API_KEY1`, `GEMINI_API_KEY2`, `GEMINI_API_KEY3` in `server/.env`

### Groq API Keys (fallback)

1. Visit [Groq Console](https://console.groq.com) → **API Keys**
2. Create up to 3 keys
3. Add as `GROQ_API_KEY1`, `GROQ_API_KEY2`, `GROQ_API_KEY3` in `server/.env`
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt-get install redis-server && sudo systemctl start redis-server

redis-cli ping  # → PONG
```

**Cloud:** [Redis Cloud](https://redis.com/try-free/) — copy host/port/password to `.env`

---

## 📡 API Documentation

**Base URL**: `http://localhost:3000` (dev) / your Render URL (prod)

All protected routes require `Authorization: Bearer <jwt_token>`.

### Auth

| Method | Endpoint                | Description                  |
| ------ | ----------------------- | ---------------------------- |
| `GET`  | `/auth/github`          | Initiates GitHub OAuth       |
| `GET`  | `/auth/github/callback` | OAuth callback, returns JWT  |
| `POST` | `/auth/verify`          | Verify JWT, return user info |

### Repositories

| Method | Endpoint                             | Description                                                  |
| ------ | ------------------------------------ | ------------------------------------------------------------ |
| `GET`  | `/api/github/getGithubRepos`         | List user's repos with activation status                     |
| `POST` | `/api/github/addRepoActivity`        | Activate a repo (creates webhook, queues initial generation) |
| `POST` | `/api/github/deactivateRepoActivity` | Deactivate a repo (removes webhook)                          |
| `POST` | `/api/github/webhookhandler`         | GitHub push event receiver                                   |
| `GET`  | `/api/github/fetchLogs`              | Get activity log for the authenticated user                  |

### Convex Integration

| Method | Endpoint            | Description                                   |
| ------ | ------------------- | --------------------------------------------- |
| `GET`  | `/api/convex/test`  | Test Convex connection and connectivity       |
| `GET`  | `/api/convex/tasks` | Fetch sample tasks from the Convex data store |

### Payments & Admin

| Method  | Endpoint                                | Description                                                                 |
| ------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `GET`   | `/api/payments/admin/analytics`         | Fetch aggregate payment and revenue statistics                              |
| `GET`   | `/api/payments/admin/users`             | List users with plan details (supports search, plan filter, and pagination) |
| `POST`  | `/api/payments/admin/revoke-plan`       | Revoke a user's pro plan and revert to free tier limits                     |
| `PATCH` | `/api/payments/admin/update-plan-price` | Update the price of a specific subscription plan                            |

### Health

| Method | Endpoint  | Description                                        |
| ------ | --------- | -------------------------------------------------- |
| `GET`  | `/health` | Health check — returns status, uptime, redis state |

---
## 🚀 Deployment

### Backend (Render)

1. New Web Service → connect repo
2. Settings:

   Root Directory: server
   Build Command: npm install
   Start Command: npm start

3. Environment variables — add everything from `server/.env`, updating:
   - `GITHUB_CALLBACK_URL` → `https://your-app.onrender.com/auth/github/callback`
   - `FRONTEND_URL` → your Vercel URL
   - `BACKEND_URL` → your Render URL

Required vars:
`MONGO_URI`, `JWT_SECRET`, `GITHUB_TOKEN_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `GITHUB_WEBHOOK_SECRET`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `FRONTEND_URL`, `BACKEND_URL`, `GEMINI_API_KEY1`, `GEMINI_API_KEY2`, `GEMINI_API_KEY3`, `GEMINI_MODEL`, `GEMINI_MODEL_MINI`, `GROQ_API_KEY1`, `GROQ_API_KEY2`, `GROQ_API_KEY3`, `GROQ_MODEL`, `README_FILE_NAME`

### Frontend (Vercel)

1. New Project → import repo
2. Settings:

   Root Directory: client
   Build Command: npm run build
   Output Directory: dist

3. Environment variable: `VITE_BACKEND_URL` = your Render URL

### Keepalive (Render free tier)

Set up an uptime monitor at [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) pinging `https://your-app.onrender.com/health` every 5 minutes.

## Troubleshooting

**README not updating after push**

- Check repo → Settings → Webhooks → recent deliveries
- Verify `GITHUB_WEBHOOK_SECRET` matches what's set on the webhook
- Make sure `BACKEND_URL` is publicly reachable (use [ngrok](https://ngrok.com) for local dev)

**AI generation failing**

- Check server logs for which provider/key failed and why
- 429 errors mean rate limits — add more keys or wait
- If all keys fail, the job fails and shows in Activity Logs

**Redis connection errors**

```bash
redis-cli ping  # should return PONG
```

For cloud Redis, verify the IP whitelist includes your server's IP.

**OAuth callback mismatch**

- `GITHUB_CALLBACK_URL` in `.env` must exactly match the URL registered in your GitHub OAuth App settings

---

## Security

- **GitHub tokens** encrypted at rest with AES-256-GCM (random IV per entry)
- **GitHub tokens** excluded from API responses
- **Webhooks** verified with HMAC-SHA256 using timing-safe comparison
- **JWT** sessions with 7-day expiration
- **Never commit `.env`** — it's in `.gitignore`

---

## License

ISC — see [LICENSE](LICENSE)

---

<div align="center">

**Built by [Arman Thakur](https://www.armandev.space) & [Yash Bavadiya](https://xevrion.dev/)**

[daemondoc.online](https://daemondoc.online)

</div>
