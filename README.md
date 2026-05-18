
# DaemonDoc — AI-Powered README Automation

[![License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

Automatically generate and maintain accurate GitHub READMEs using codebase analysis and commit tracking.

---

## 📌 Core Features

- **Dual-mode AI pipeline**  
  - *Full generation*: Analyze repository structure to create initial READMEs  
  - *Patch mode*: Identify and update only changed sections via SHA-256 hashing

- **AI-Powered Cleanup & Restructuring**  
  - Aggressive redundancy removal and intelligent section merging  
  - Automated restructuring for clarity using OpenRouter (Qwen 32B)  
  - Real-time cleanup progress tracking with dynamic toast notifications

- **AI Engine**  
  - Primary: Google Gemini 1.5 Flash (1M token context)  
  - Fallback: Groq with 3-key rotation for resilience  
  - RAG-based code analysis for contextual understanding

- **GitHub Integration**  
  - Webhook-based commit tracking  
  - Secure OAuth with encrypted token storage  
  - Automatic README commits via GitHub API

- **Background Processing**  
  - BullMQ + Redis job queue for async operations  
  - Rate-limit handling with automatic provider fallback  
  - 7-day JWT session expiration

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

| Layer         | Technologies                                                                 |
|---------------|------------------------------------------------------------------------------|
| **Frontend**  | React 19, Vite 7, Tailwind CSS 4.3, Convex React Client, React Router       |
| **Backend**   | Node.js 20+, Express 5, Mongoose, pnpm workspace                            |
| **Workers**   | BullMQ 5.76, Redis (IORedis)                                                |
| **Real-time** | Convex 1.39                                                                 |
| **Database**  | MongoDB (user profiles, logs)                                               |
| **AI**        | Google Gemini (1M context), Groq (fallback)                                 |
| **Payments**  | Razorpay for INR subscriptions                                                |
| **Email**     | Resend for transactional communications                                       |

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
   pnpm dev:seo       # Next.js landing page
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
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/auth/github`            | Initiate OAuth flow   |
| GET    | `/auth/github/callback`   | Handle OAuth callback |
| POST   | `/auth/verify`            | JWT validation        |

### Repository Management
| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/api/github/getGithubRepos`    | List user repositories                 |
| POST   | `/api/github/addRepoActivity`   | Activate repo (create webhook + queue generation) |
| POST   | `/api/github/deactivateRepoActivity` | Deactivate repository tracking |
| POST   | `/api/github/cleanUpReadme`     | Trigger AI-powered README restructuring and cleanup |
| POST   | `/api/github/webhookhandler`    | Handle GitHub push events              |

### System Monitoring & Activity
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/github/fetchUserLogs` | Retrieve automated documentation activity logs |
| GET    | `/health`                 | Redis status + uptime    |

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
  - View failed jobs in Activity Logs

- **Redis Connectivity**:  
  ```bash
  redis-cli ping  # Should return PONG
  ```

---

## 🔐 Security

- GitHub tokens encrypted with AES-256-GCM  
- Webhook payloads verified with HMAC-SHA256  
- JWT session expiration: 7 days  
- Never commit `.env` files (included in .gitignore)

---

## 📄 License

AGPL v3 - See [LICENSE](LICENSE) file

---

**Developed by**  
[Arman Thakur](https://www.armandev.space) & [Yash Bavadiya](https://xevrion.dev)  
[daemondoc.online](https://daemondoc.online)