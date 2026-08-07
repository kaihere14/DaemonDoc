# DaemonDoc — AI-Powered README Automation

[![License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

Automate accurate GitHub README maintenance through codebase analysis, commit tracking, and intelligent document restructuring. DaemonDoc v1 is fully open source with no paid features or usage limits.

---

## ✨ Key Features

### AI-Powered Document Lifecycle
- **Dual-mode pipeline**:
  - _Full generation_: Create initial READMEs from repository structure
  - _Patch mode_: Update only changed sections using SHA-256 hashing
- **Intelligent cleanup**:
  - Manual "Brush" icon to trigger aggressive noise reduction
  - Automated restructuring via OpenRouter (Qwen 32B)
  - Live activity logging with real-time progress streaming

### Core Capabilities
- **GitHub Integration**:
  - Webhook-based commit tracking
  - Secure OAuth with encrypted token storage
  - Automatic README commits to default branch
- **Real-Time Monitoring**:
  - Live log streaming via Convex
  - Log recovery after server restarts
- **Free & Open Source**:
  - No paid tiers, subscriptions, or usage limits
  - Unlimited repository activation

---

## 🧠 Architecture Overview

```
[GitHub Push] → Webhook → BullMQ Queue → AI Worker Tier → MongoDB
                                  ↘
                                   → Convex (real-time logs)
```

**Key Components**:
- **Frontend**: React 19 + Vite 7 SPA with Convex subscriptions
- **Backend**: Express.js 5 API with MongoDB (Mongoose)
- **Workers**: BullMQ/Redis for async AI generation
- **AI Providers**: Google Gemini (1M context) with Groq fallback
- **Real-time**: Convex for live log streaming

---

## 🧰 Tech Stack

| Layer         | Technologies                                                                                      |
|---------------|---------------------------------------------------------------------------------------------------|
| **Frontend**  | React 19, Next.js, Vite 7, Tailwind CSS 4, Shadcn UI, Convex React Client                         |
| **Backend**   | Node.js 20+, Express 5, Mongoose, pnpm workspace                                                  |
| **Workers**   | BullMQ 5.76, Redis (IORedis)                                                                      |
| **Real-time** | Convex 1.39                                                                                       |
| **Database**  | MongoDB (user profiles, logs)                                                                     |
| **AI**        | Google Gemini (1M context), Groq (fallback)                                                       |
| **Email**     | Resend for transactional communications                                                           |

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

2. **Setup**
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

### System Monitoring
| Method | Endpoint                    | Description                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| GET    | `/api/github/fetchUserLogs` | Retrieve documentation activity logs         |
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

- **AI Generation Errors**:
  - 429 errors: Add more API keys or wait for rate limits
  - 401/403: Rotate API keys
  - **Stuck "Ongoing" Logs**: The `LogRecovery` service will mark failed operations after server restarts

- **Live Log Sync Issues**:
  - Ensure `CONVEX_SITE_URL` is correctly configured
  - Check browser console for Convex connection errors

- **Redis Connectivity**:
  ```bash
  redis-cli ping # Should return PONG
  ```

---

## 🔐 Security

- **Token Encryption**: GitHub tokens stored encrypted using AES-GCM
- **Webhook Verification**: HMAC-SHA256 signature validation
- **Authorization**: JWT authentication with 7-day expiration and role-based checks
- **Environment Protection**: Sensitive credentials managed via environment variables

---

## 📄 License

AGPL v3 - See [LICENSE](LICENSE) file

---

**Developed by**  
[Arman Thakur](https://www.armandev.space) & [Yash Bavadiya](https://xevrion.dev)  
[daemondoc.online](https://daemondoc.online)