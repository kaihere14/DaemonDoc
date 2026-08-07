
# DaemonDoc — AI-Powered README Automation

[![License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

Automate and maintain accurate GitHub READMEs through codebase analysis, commit tracking, and intelligent document restructuring.

> **Free and open source, forever.** DaemonDoc v1 has no paid tiers, subscriptions, credits, or usage limits — every feature is available to every user, and unlimited repositories can be activated. There is no payment or billing code in this repository. Paid features are planned for DaemonDoc v2, a separate SaaS product; this version stays free.

---

## ✨ Core Features

- **Dual-mode AI pipeline**
  - _Full generation_: Analyze repository structure to create initial READMEs
  - _Patch mode_: Identify and update only changed sections via SHA-256 hashing

- **AI-Powered Cleanup & Restructuring** ✨
  - Manual cleanup trigger via repo card "Brush" icon to aggressively trim noise and merge duplicate sections
  - Automated restructuring for clarity using OpenRouter (Qwen 32B)
  - **Live Activity Logging**: Cleanup runs now stream real-time progress to the dashboard via Convex, providing the same visibility as standard generation runs.

- **Real-Time Monitoring**
  - Live log streaming via Convex during cleanup operations
  - Log recovery on server restarts to prevent stale "ongoing" states

- **Free & Open Source Forever** 🆓
  - No paid tiers, subscriptions, credits, or usage limits. Every feature is available to every user, and unlimited repositories can be activated.

### Infrastructure & Security

- **Domain Architecture**
  - Marketing site: `daemondoc.online`
  - Dashboard: `app.daemondoc.online` with automatic root redirects
  - SEO protection: Noindex directives for private routes

- **AI Engine**
  - Primary: Google Gemini 1.5 Flash (1M token context)
  - Fallback: Groq with 3-key rotation for resilience
  - RAG-based code analysis for contextual understanding

- **GitHub Integration**
  - Webhook-based commit tracking
  - Secure OAuth with encrypted token storage
  - Automatic README commits to default branch with `[skip ci]` support

- **Background Processing**
  - BullMQ + Redis job queue for async operations
  - Rate-limit handling with automatic provider fallback
  - 7-day JWT session expiration

- **Unified Design System** 🎨
  - Self-hosted Inter Display font for consistent, high-performance styling across both the React client and Next.js SEO-client.
  - Standardized interactive `CandyButton` and `CandyLink` components.

---
## 🧠 Architecture

```
[GitHub Push] → Webhook → BullMQ Queue → AI Worker Tier → MongoDB
                                  ↘
                                   → Convex (real-time logs)
```

**Key Components**:

- **Frontend**: React 19 + Vite 7 SPA with Convex real-time subscriptions
- **Backend**: Express.js 5 API with MongoDB (Mongoose) persistence
- **Worker Tier**: BullMQ/Redis for async AI generation
- **Real-time Layer**: Convex for live log streaming
- **AI Providers**: Gemini (primary) with Groq fallback chain

---

## 🛠️ Tech Stack

| Layer         | Technologies                                                                            |
| ------------- | --------------------------------------------------------------------------------------- |
| **Frontend**  | React 19, Next.js, Vite 7, Tailwind CSS 4, Shadcn UI, Convex React Client, React Router |
| **Backend**   | Node.js 20+, Express 5, Mongoose, pnpm workspace                                        |
| **Workers**   | BullMQ 5.76, Redis (IORedis)                                                            |
| **Real-time** | Convex 1.39                                                                             |
| **Database**  | MongoDB (user profiles, logs)                                                           |
| **AI**        | Google Gemini (1M context), Groq (fallback)                                             |
| **Email**     | Resend for transactional communications                                                 |

---
## 🧪 Installation

1. **Prerequisites**
   - Node.js 20+
   - pnpm 10.20.x (via `corepack enable`)
   - MongoDB (local or Atlas)
   - Redis (local or Docker)
   - Convex project (https://convex.dev)
   - GitHub OAuth app (https://github.com/settings/developers)
   - 3+ API keys for Gemini and Groq

2. **Clone & Setup**

   ```bash
   git clone https://github.com/kaihere14/daemondoc.git
   cd daemondoc
   corepack enable
   pnpm install


   ```

3. **Run Services**
   ```bash
   pnpm dev:server    # Express API
   pnpm dev:client    # Vite SPA
   pnpm dev:seo       # Next.js SEO Landing Page
   pnpm dev:convex    # Convex backend

   ```

---

## 🔧 Configuration

### Required Environment Variables

**Backend (server/.env)**:

```env
MONGO_URI=
JWT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
GITHUB_WEBHOOK_SECRET=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
CONVEX_SITE_URL=
GEMINI_API_KEY1=
GROQ_API_KEY1=
README_FILE_NAME=README.md
```

**Frontend (client/.env)**:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CONVEX_URL=your_convex_deployment_url
```

**SEO Landing (seo-client/.env)**:

```env
NEXT_PUBLIC_APP_URL=https://daemondoc.online
BACKEND_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/auth/github`          | Initiate OAuth flow   |
| GET    | `/auth/github/callback` | Handle OAuth callback |
| POST   | `/auth/verify`          | JWT validation        |
| DELETE | `/auth/delete`          | Delete user account   |

### Repository Management

| Method | Endpoint                             | Description                                         |
| ------ | ------------------------------------ | --------------------------------------------------- |
| GET    | `/api/github/getGithubRepos`         | List user repositories                              |
| POST   | `/api/github/addRepoActivity`        | Activate repo (create webhook + queue generation)   |
| POST   | `/api/github/deactivateRepoActivity` | Deactivate repository tracking                      |
| POST   | `/api/github/cleanUpReadme`          | Trigger AI-powered README restructuring and cleanup |
| POST   | `/api/github/webhookhandler`         | Handle GitHub push events                           |

### System Monitoring & Activity

| Method | Endpoint                    | Description                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| GET    | `/api/github/fetchUserLogs` | Retrieve automated documentation activity logs |
| GET    | `/health`                   | Redis status + uptime                          |

### Admin Operations

| Method | Endpoint                      | Description                                    |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/api/github/admin/analytics` | Retrieve system-wide analytics (cached)        |
| GET    | `/api/github/admin/users`     | Browse and search all registered users         |

---
## 🚀 Deployment

**1. Backend (Render)**

- Root: Project root directory
- Build: `corepack enable && pnpm install --frozen-lockfile --filter server`
- Start: `pnpm --filter server start`
- Required env vars: All backend variables + public URLs

**2. Frontend (Vercel)**

- Root: `client` directory
- Build: `pnpm run build`
- Env var: `VITE_BACKEND_URL=production_url`

**3. SEO Landing (Vercel)**

- Root: `seo-client` directory
- Env vars:
  - `NEXT_PUBLIC_APP_URL=https://daemondoc.online`
  - `BACKEND_URL=production_url`

**4. Redis (Free Tier Keepalive)**  
Set up a 5-minute cron job to ping:  
`https://your-app.onrender.com/health`

---

## ⚠️ Troubleshooting

- **Webhook Failures**:
  - Verify `GITHUB_CALLBACK_URL` matches OAuth app settings
  - Check webhook secret HMAC validation
  - Ensure backend is publicly accessible (use ngrok for local testing)

- **AI Generation & Cleanup Errors**:
  - 429 errors: Add more API keys or wait for rate limits
  - 401/403: Rotate API keys
  - **Stuck "Ongoing" Logs**: If the server restarts during a cleanup, the `LogRecovery` service will mark them as failed with the message "Cleanup interrupted because the backend restarted".

- **Live Log Sync Issues**:
  - Ensure `CONVEX_SITE_URL` is correctly configured in the server environment.
  - Check browser console for Convex connection errors if live updates are missing in the UI.

- **Redis Connectivity**:  
  bash
  redis-cli ping # Should return PONG

---

## 🔐 Security

- **Token Encryption**: GitHub access tokens are stored encrypted using AES-GCM; plaintext tokens are never persisted or logged.
- **Webhook Verification**: GitHub webhook payloads are verified using HMAC-SHA256 signatures.
- **Strict Authorization**: Access is governed strictly by JWT authentication and role-based checks (`requireAdmin`). No payment, billing, or plan-gating middleware exists in the codebase.
- **Session Security**: JWT session expiration is set to 7 days.
- **Environment Protection**: Sensitive credentials and API keys are managed strictly via environment variables (never committed to source control).

---
## 📄 License

AGPL v3 - See [LICENSE](LICENSE) file

---

**Developed by**  
[Arman Thakur](https://www.armandev.space) & [Yash Bavadiya](https://xevrion.dev)  
[daemondoc.online](https://daemondoc.online)
