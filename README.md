
# DaemonDoc — AI-Powered README Generator

<div align="center">

[![Live](https://img.shields.io/badge/www.daemondoc.online-4F46E5?style=for-the-badge)](https://www.daemondoc.online)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

**Connect a repo. Push code. Get a professional README — automatically.**

[Features](#-features) • [How It Works](#-how-it-works) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## Overview

DaemonDoc hooks into your GitHub repositories via webhooks. Every time you push, it scans your codebase, runs it through AI, and commits an up-to-date README back to your repo — no manual writing required.

The AI pipeline uses **Gemini 2.5 Flash** (primary, 1M token context) with automatic fallback to **Groq** if all Gemini keys are exhausted. You can configure up to 3 API keys per provider for rate limit resilience.

---

## ✨ Features

- **Smart README generation** — Analyzes actual code, not just file names. Understands structure, dependencies, and intent.
- **Immediate first-time generation** — README is generated instantly upon first repository activation, no need to wait for a push.
- **Incremental patch mode** — On subsequent pushes, only the sections affected by your changes are updated, not the whole README.
- **Multi-key AI fallback** — Up to 3 Gemini keys tried in order, then up to 3 Groq keys. Generation continues as long as any key works.
- **Large context scanning** — Gemini's 1M token window allows scanning up to 50 files at 500 lines each, vs Groq's conservative 25 files / 200 lines.
- **Async job queue** — BullMQ + Redis handles all generation in the background; webhooks return instantly.
- **GitHub OAuth** — Secure login, AES-256-GCM encrypted token storage, HMAC-SHA256 webhook verification.
- **Activity logs** — Dashboard shows every job: repo, timestamp, success/failed/in-progress status.
## ⚙️ How It Works


1. Connect GitHub Account  →  OAuth login, encrypted token stored
2. Activate a Repo         →  Webhook created. If it's the first activation, an initial README is generated immediately.
3. Push Code               →  Webhook fires, job queued in Redis
4. AI Scans Codebase       →  Step 1: file selection (mini model)
                               Step 2: README generation (main model)
5. README Committed        →  Pushed back to your repo automatically


### Full vs Patch Mode

- **Full generation** — Used when no README exists yet, or the existing one is under 500 characters. Scans up to 50 files and generates from scratch.
- **Patch mode** — Used on subsequent pushes. Identifies which README sections are affected by the changed files, then surgically rewrites only those sections using a SHA-256 section hash to detect what actually changed.

### AI Provider Chain


Gemini key 1 → Gemini key 2 → Gemini key 3 → Groq key 1 → Groq key 2 → Groq key 3


Retriable errors (429 rate limit, 503 overload, network errors) move to the next key. Auth failures (401/403) and payload errors (413) also fall through.
## Tech Stack

### Frontend (`/client`)

| Technology | Purpose | Version |
|---|---|---|
| React | UI framework | 19.x |
| Vite | Build tool | 7.x |
| React Router | Client-side routing | 7.x |
| Tailwind CSS | Styling | 4.x |
| Framer Motion | Animations | 12.x |
| Zustand | State management | 5.x |
| Lucide React | Icons | — |

### Backend (`/server`)

| Technology | Purpose | Version |
|---|---|---|
| Node.js | Runtime | 18+ |
| Express | Web framework | 5.x |
| MongoDB + Mongoose | Database | — |
| Redis + IORedis | Job queue backing | — |
| BullMQ | Job queue | 5.x |
| JWT | Auth tokens | — |
| Axios | HTTP client | — |

### AI & External Services

| Service | Role |
|---|---|
| **Gemini 2.5 Flash** | Primary README generation (1M context) |
| **Gemini 2.5 Flash Lite** | Primary file selection (mini model) |
| **Groq** | Fallback provider for both generation and selection |
| **GitHub API** | Repo tree, file content, webhooks, commits |
| **MongoDB Atlas** | User and repo data |
| **Redis** | BullMQ job queue |

---

## Architecture

```
┌─────────────────────────┐
│      React Client       │
│   (Vite + Tailwind)     │
└────────────┬────────────┘
             │ REST API
             ▼
┌────────────────────────────────────────────────┐
│                 Express Backend                 │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  │
│  │    Auth     │  │  GitHub  │  │  Worker  │  │
│  │ Controller  │  │Controller│  │Controller│  │
│  └─────────────┘  └──────────┘  └──────────┘  │
└────────┬───────────────┬───────────────┬───────┘
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐   ┌────────────┐   ┌─────────┐
    │ MongoDB │   │ GitHub API │   │  Redis  │
    └─────────┘   └────────────┘   └────┬────┘
                                        │
                                        ▼
                                 ┌─────────────┐
                                 │  BullMQ     │
                                 │  Worker     │
                                 └──────┬──────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │  Gemini 2.5 Flash      │
                            │  (→ Groq fallback)     │
                            └───────────────────────┘
```

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- Redis (local or [Redis Cloud](https://redis.com/))
- [GitHub OAuth App](https://github.com/settings/developers)
- Gemini API keys from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Groq API keys from [Groq Console](https://console.groq.com) (fallback)

### 1. Clone

```bash
git clone https://github.com/yourusername/daemondoc.git
cd daemondoc
```

### 2. Server setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/daemondoc

# Auth
JWT_SECRET=your_jwt_secret_minimum_32_chars
GITHUB_TOKEN_SECRET=64_char_hex_for_aes256_encryption

# GitHub OAuth App
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Redis (omit REDIS_* vars to use localhost:6379 with no auth)
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
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_MINI=gemini-2.5-flash-lite

# Groq (fallback — add up to 3 keys)
GROQ_API_KEY1=your_groq_key_1
GROQ_API_KEY2=your_groq_key_2
GROQ_API_KEY3=your_groq_key_3
GROQ_MODEL=llama-3.3-70b-versatile

# Output
README_FILE_NAME=README.md
```

### 3. Client setup

```bash
cd client
npm install
```

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
```

Open **http://localhost:5173**

---

## Configuration

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. Set **Authorization callback URL** to `http://localhost:3000/auth/github/callback`
3. Copy **Client ID** and **Client Secret** → add to `server/.env`

### Gemini API Keys

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create up to 3 API keys for rate limit resilience
3. Add as `GEMINI_API_KEY1`, `GEMINI_API_KEY2`, `GEMINI_API_KEY3` in `server/.env`

### Groq API Keys (fallback)

1. Visit [Groq Console](https://console.groq.com) → **API Keys**
2. Create up to 3 keys
3. Add as `GROQ_API_KEY1`, `GROQ_API_KEY2`, `GROQ_API_KEY3` in `server/.env`

### Redis

**Local:**
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt-get install redis-server && sudo systemctl start redis-server

redis-cli ping  # → PONG
```

**Cloud:** [Redis Cloud](https://redis.com/try-free/) — copy host/port/password to `.env`

---

## API Documentation

**Base URL**: `http://localhost:3000` (dev) / your Render URL (prod)

All protected routes require `Authorization: Bearer <jwt_token>`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/github` | Initiates GitHub OAuth |
| `GET` | `/auth/github/callback` | OAuth callback, returns JWT |
| `POST` | `/auth/verify` | Verify JWT, return user info |

### Repositories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github/getGithubRepos` | List user's repos with activation status |
| `POST` | `/api/github/addRepoActivity` | Activate a repo (creates webhook, queues initial generation) |
| `POST` | `/api/github/deactivateRepoActivity` | Deactivate a repo (removes webhook) |
| `POST` | `/api/github/webhookhandler` | GitHub push event receiver |
| `GET` | `/api/github/fetchLogs` | Get activity log for the authenticated user |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns status, uptime, redis state |

---

## 🚀 Deployment

### Backend (Render)

1. New Web Service → connect repo
2. Settings:
   
   Root Directory: server
   Build Command:  npm install
   Start Command:  npm start
   
3. Environment variables — add everything from `server/.env`, updating:
   - `GITHUB_CALLBACK_URL` → `https://your-app.onrender.com/auth/github/callback`
   - `FRONTEND_URL` → your Vercel URL
   - `BACKEND_URL` → your Render URL

Required vars:
`MONGO_URI`, `JWT_SECRET`, `GITHUB_TOKEN_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `GITHUB_WEBHOOK_SECRET`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `FRONTEND_URL`, `BACKEND_URL`, `GEMINI_API_KEY1`, `GEMINI_API_KEY2`, `GEMINI_API_KEY3`, `GEMINI_MODEL`, `GEMINI_MODEL_MINI`, `GROQ_API_KEY1`, `GROQ_API_KEY2`, `GROQ_API_KEY3`, `GROQ_MODEL`, `README_FILE_NAME`

### Frontend (Vercel)

1. New Project → import repo
2. Settings:
   
   Root Directory:  client
   Build Command:   npm run build
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
