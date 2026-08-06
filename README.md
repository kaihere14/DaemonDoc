# DaemonDoc — AI-Powered README Automation

[![License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

Automate and maintain accurate GitHub READMEs through codebase analysis, commit tracking, and intelligent document restructuring.

---

## ✨ Core Features

### AI-Powered README Management
- **Dual-mode Generation**  
  - *Initial Generation*: Analyze repository structure to create new READMEs  
  - *Patch Mode*: Update only changed sections using SHA-256 hashing for precision  

- **Intelligent Cleanup**  
  - Manual trigger via "Brush" icon to eliminate redundancy and merge duplicate sections  
  - Automated restructuring with OpenRouter (Qwen 32B) for clarity and consistency  

- **Real-Time Monitoring**  
  - Live log streaming via Convex during cleanup operations  
  - Log recovery on server restarts to prevent stale "ongoing" states  

### Infrastructure & Security
- **Domain Architecture**  
  - Marketing site: `daemondoc.online`  
  - Dashboard: `app.daemondoc.online` with automatic root redirects  
  - SEO protection: Noindex directives for private routes  

- **AI Engine**  
  - Primary: Google Gemini 1.5 Flash (1M token context)  
  - Fallback: Groq with 3-key rotation for resilience  

- **GitHub Integration**  
  - Webhook-based commit tracking  
  - Secure OAuth with encrypted token storage  
  - Automatic README commits to default branch (supports `[skip ci]`)  

- **Background Processing**  
  - BullMQ + Redis for async task management  
  - Rate-limit handling with provider fallback  

---

## 🧠 Architecture Overview

```
[GitHub Push] → Webhook → BullMQ Queue → AI Worker Tier → MongoDB
                                  ↘
                                   → Convex (real-time logs)
```

**Key Components**:
- **Frontend**: React 19 + Vite 7 SPA with Convex subscriptions  
- **Backend**: Express.js 5 API using Mongoose for MongoDB  
- **Workers**: BullMQ 5.76 for async AI tasks  
- **AI Providers**: Gemini (primary), Groq (fallback)  
- **Payments**: Razorpay for INR subscriptions  
- **Email**: Resend for transactional communications  

---

## 🛠️ Tech Stack

| Layer       | Technologies                                                                 |
|-------------|------------------------------------------------------------------------------|
| **Frontend**| React 19, Vite 7, Tailwind CSS 4, Shadcn UI, React Router, Convex Client     |
| **Backend** | Node.js 20+, Express 5, Mongoose, pnpm workspace                             |
| **Workers** | BullMQ 5.76, Redis (IORedis)                                                |
| **Real-time**| Convex 1.39                                                                |
| **Database**| MongoDB (user profiles, logs)                                                |
| **AI**      | Google Gemini (1M context), Groq (fallback)                                 |

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

## 🚀 Deployment

**1. Backend (Render)**  
- Root: Project root directory  
- Build: `corepack enable && pnpm install --frozen-lockfile --filter server`  
- Start: `pnpm --filter server start`  
- Required env vars: All backend variables + public URLs  

**2. Frontend Dashboard (Vercel)**  
- Root: `client` directory  
- Build: `pnpm run build`  
- Env vars:  
  - `VITE_BACKEND_URL=production_url`  
  - `VITE_MARKETING_URL=https://daemondoc.online` (optional)  

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

- **Webhook Failures**  
  - Confirm `GITHUB_CALLBACK_URL` matches OAuth app settings  
  - Validate webhook secret HMAC  
  - Ensure backend is publicly accessible (use ngrok for local testing)  

- **AI Generation Errors**  
  - 429 errors: Add more API keys or wait for rate limits  
  - 401/403: Rotate API keys  
  - **Stuck Logs**: Server restarts automatically mark interrupted cleanups as "failed"  

- **Live Log Sync Issues**  
  - Verify `CONVEX_SITE_URL` in server env  
  - Check browser console for Convex connection errors  

- **Redis Connectivity**  
  ```bash
  redis-cli ping  # Should return PONG
  ```

---

## 🔐 Security

- GitHub tokens encrypted with AES-256-GCM  
- Webhook HMAC-SHA256 payload verification  
- 7-day JWT session expiration  
- Never commit `.env` files (included in `.gitignore`)  

---

## 📄 License

AGPL v3 - See [LICENSE](LICENSE) file  

---

**Developed by**  
[Arman Thakur](https://www.armandev.space) & [Yash Bavadiya](https://xevrion.dev)  
[daemondoc.online](https://daemondoc.online)