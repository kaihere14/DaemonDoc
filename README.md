# 📚 DaemonDoc – AI‑Powered README Generator  

<div align="center">

![DaemonDoc Banner](https://img.shields.io/badge/DaemonDoc-AI%20README%20Generator-4F46E5?style=for-the-badge&logo=readme&logoColor=white)  
[![Live Demo](https://img.shields.io/badge/www.daemondoc.online-success?style=for-the-badge)](https://www.daemondoc.online)  
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)  
[![Build Status](https://img.shields.io/github/actions/workflow/status/kaihere14/DaemonDoc/keepalive.yml?branch=main&style=for-the-badge)](https://github.com/kaihere14/DaemonDoc/actions)  
[![Coverage](https://img.shields.io/coveralls/github/kaihere14/DaemonDoc?style=for-the-badge)](https://coveralls.io/github/kaihere14/DaemonDoc)  

**Transform your GitHub repositories with AI‑generated, always up‑to‑date documentation.**  

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API Docs](#-api-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)  

</div>

---

## 🎯 Overview  

**DaemonDoc** is a SaaS‑style platform that automatically creates and maintains high‑quality `README.md` files for any public or private GitHub repository. By hooking into GitHub webhooks, analysing the codebase with Groq’s LLaMA 3.3 70B model, and committing the generated markdown back to the repo, DaemonDoc eliminates boiler‑plate documentation work and keeps docs in sync with code.

* **Target audience** – Developers, engineering teams, and open‑source maintainers who want up‑to‑date docs without manual effort.  
* **Current version** – `v0.4.2‑AST` (released 2024‑11‑12)

---

## ✨ Features  

| Category | Feature | Status |
|----------|---------|--------|
| **AI‑Powered Analysis** | LLaMA 3.3 70B (Groq) for code understanding, GPT‑OSS‑120B for markdown generation | ✅ Stable |
| **Automatic Updates** | GitHub webhook triggers on every push → background job → new README commit | ✅ Stable |
| **Context Builder** | Prioritises important files, extracts `package.json`, `pyproject.toml`, etc. | ✅ Stable |
| **Repository Management** | Dashboard to activate/deactivate repos, view logs, and edit settings | ✅ Stable |
| **Security** | OAuth 2.0 with GitHub, AES‑256‑GCM token encryption, HMAC‑SHA256 webhook verification, JWT sessions | ✅ Stable |
| **Performance** | BullMQ + Redis job queue, incremental diff analysis (≈70 % size reduction) | ✅ Stable |
| **Refactored Client‑Side API** | Centralised `src/lib/api.js`, new React hooks `useRepos` & `useRequireAuth`, improved error handling | ✅ New |
| **Enhanced Auth Flow** | `AuthContext` now uses the new hooks, supports silent token refresh | ✅ New |
| **Modular Utilities** | Server‑side `crypto.js`, `githubApiClient.js`, `langMap.js` for clean separation of concerns | ✅ New |

---

## 🛠️ Tech Stack  

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Zustand, Lucide‑React, ESLint 9 (flat config) |
| **Backend** | Node 20, Express 4, BullMQ, Redis, Groq API, JWT, Axios, dotenv |
| **Auth / Security** | GitHub OAuth 2.0, AES‑256‑GCM (`crypto.js`), HMAC‑SHA256 webhook verification |
| **Database** | MongoDB (via Mongoose) – stores user profiles, repo selections, job logs |
| **CI / CD** | GitHub Actions (keep‑alive workflow), Vercel (frontend), Render (backend) |
| **Testing** | Vitest (frontend), Jest & Supertest (backend) |
| **Other** | `@vercel/analytics`, `@tailwindcss/vite`, `lucide-react`, `zustand` |

---

## 🏗️ Architecture  

```
+-------------------+          +-------------------+          +-------------------+
|  Frontend (Vite)  |  <--->   |  Backend (Express) |  <--->   |  External Services |
|  React SPA        |  HTTP    |  • Auth (OAuth)    |  API     |  • GitHub API      |
|  • useRepos hook  |  Calls   |  • Job Queue (Bull)|          |  • Groq AI         |
|  • useRequireAuth |          |  • Redis          |          |  • MongoDB Atlas   |
+-------------------+          +-------------------+          +-------------------+
```

* **`client/src/lib/api.js`** – thin wrapper around Axios, automatically injects JWT and handles token refresh.  
* **`client/src/hooks/useRepos.js`** – fetches the list of repositories the user has activated.  
* **`client/src/hooks/useRequireAuth.js`** – guards routes/pages, redirects to login when the JWT is missing/expired.  
* **`server/src/utils/githubApiClient.js`** – encapsulates all GitHub REST calls (webhook creation, PR creation, file commits).  
* **`server/src/utils/crypto.js`** – provides AES‑256‑GCM encrypt/decrypt helpers for storing OAuth tokens.  

The directory layout mirrors this separation:

```
client/
 ├─ src/
 │   ├─ lib/          # API wrapper
 │   ├─ hooks/        # React hooks (useRepos, useRequireAuth)
 │   ├─ context/      # AuthContext (now thin)
 │   └─ pages/        # Landing, Login, Dashboard, Logs, Profile
server/
 ├─ src/
 │   ├─ utils/        # crypto.js, githubApiClient.js, langMap.js
 │   ├─ services/     # github.service.js, groq.service.js
 │   ├─ controllers/  # oauthcontroller.js, github.controller.js
 │   └─ routes/       # /auth, /webhook, /api
```

---

## ⚙️ Getting Started  

### Prerequisites  

| Tool | Minimum version |
|------|-----------------|
| Node | 18.x |
| npm | 9.x (or `pnpm`/`yarn`) |
| Docker (optional) | 24.x |
| MongoDB Atlas account | – |
| GitHub OAuth App | – |
| Groq API key | – |
| Redis instance | – |

### Installation  

```bash
# Clone the repo
git clone https://github.com/kaihere14/DaemonDoc.git
cd DaemonDoc

# ---------- Frontend ----------
cd client
npm ci            # installs exact versions from package-lock
npm run dev       # starts Vite dev server at http://localhost:5173

# ---------- Backend ----------
cd ../server
npm ci
npm run dev       # starts Express server at http://localhost:4000
```

Both servers use the same `.env.example` file (see below).  

### Configuration  

Create a `.env` file in the **server** root:

```dotenv
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=super_secret_webhook_key

# JWT & Encryption
JWT_SECRET=super_long_random_string
ENCRYPTION_KEY=32_byte_base64_key   # used by crypto.js (AES‑256‑GCM)

# Groq AI
GROQ_API_KEY=your_groq_api_key

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/daemondoc

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# Server
PORT=4000
BASE_URL=http://localhost:4000   # used for webhook callbacks
```

> **Tip:** The `ENCRYPTION_KEY` must be a 32‑byte base64‑encoded string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

The **client** reads the environment via Vite’s built‑in `import.meta.env`. Create `client/.env` (or use Vite’s `VITE_` prefix) if you need to override defaults:

```dotenv
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 🚀 Usage  

1. **Start both services** (`npm run dev` in `client` and `server`).  
2. Open `http://localhost:5173` → click **“Connect GitHub”**.  
3. Authorise the OAuth request; you’ll be redirected back to the dashboard.  
4. Click **“Add Repository”**, select a repo, and enable the DaemonDoc integration.  
5. Push a commit to the selected repo → the webhook triggers a background job.  
6. After a few seconds, DaemonDoc creates a PR titled *“🤖 Auto‑generated README”* with the new `README.md`.  

### Example: Generating a README via the API  

```bash
curl -X POST "$BASE_URL/api/readme/generate" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
        "owner": "kaihere14",
        "repo": "DaemonDoc",
        "branch": "main"
      }'
```

Response:

```json
{
  "status": "queued",
  "jobId": "c3f5e8a1-7b2d-4f9a-9c1e-2d9b6a5e7f3a",
  "message": "README generation job has been queued."
}
```

You can poll `/api/jobs/:jobId` to get the final status and a link to the created PR.

---

## 📚 API Documentation  

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/auth/me` | Returns the authenticated user profile. | JWT |
| `GET` | `/api/repos` | List of repositories the user has activated. | JWT |
| `POST` | `/api/repos/:owner/:repo/activate` | Creates webhook & stores repo config. | JWT |
| `POST` | `/api/webhook/github` | GitHub webhook entry point (internal). | HMAC‑SHA256 |
| `POST` | `/api/readme/generate` | Manually trigger README generation for a repo. | JWT |
| `GET` | `/api/jobs/:id` | Retrieve job status (queued, processing, completed, failed). | JWT |

**Authentication** – All public endpoints require a JWT in the `Authorization: Bearer <token>` header. Tokens are issued after successful GitHub OAuth and are signed with `JWT_SECRET`.  

**Rate Limits** – The Groq API is limited to 60 requests/minute per key; DaemonDoc enforces a per‑user queue to stay within limits.  

**Error Codes**  

| Code | Meaning |
|------|---------|
| `400` | Bad request / validation error |
| `401` | Missing/invalid JWT |
| `403` | Invalid GitHub webhook signature |
| `404` | Resource not found |
| `429` | Rate limit exceeded (Groq) |
| `500` | Internal server error |

Full OpenAPI spec is available at `http://localhost:4000/api-docs` when the server is running.

---

## 👩‍💻 Development  

```bash
# Frontend
cd client
npm run lint          # runs ESLint (flat config)
npm run test          # Vitest unit tests
npm run build         # production build (dist/)

# Backend
cd ../server
npm run lint          # ESLint
npm run test          # Jest + Supertest
npm run start:prod    # runs compiled code (node dist/index.js)
```

### Code Style  

* **ESLint** – flat config (`client/eslint.config.js`) enforces `no-unused-vars` with a custom ignore pattern for constants (`^[A-Z_]`).  
* **Prettier** – integrated via `npm run format`.  

### Debugging  

* Frontend: Vite dev server with React Fast Refresh.  
* Backend: `DEBUG=daemon:* npm run dev` prints detailed BullMQ job logs.  

---

## 📦 Deployment  

### Frontend (Vercel)  

1. Connect the `client` folder to Vercel.  
2. Set the environment variable `VITE_API_BASE_URL` to your backend URL (e.g., `https://api.daemondoc.com`).  
3. Vercel automatically runs `npm ci && npm run build`.  

### Backend (Render / Railway / Docker)  

**Dockerfile (example)**  

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
CMD ["node", "dist/index.js"]
```

Deploy the image, set the same `.env` variables as described above, and expose port `4000`.  

**Render** – create a *Web Service* with the Dockerfile, enable *Auto‑Deploy* from the `main` branch.  

**Performance Tips**  

* Keep the Redis instance in the same region as the server to minimise latency.  
* Enable BullMQ job concurrency (`worker.concurrency = 5`) for large organisations.  

---

## 🤝 Contributing  

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feat/awesome-feature`).  
3. Install dependencies (`npm ci` in both `client` and `server`).  
4. Make your changes, ensuring linting and tests pass:  

```bash
npm run lint && npm run test
```

5. Open a Pull Request with a clear description and reference any related issue.  

### Development Workflow  

| Step | Command |
|------|---------|
| Install deps | `npm ci` |
| Run both services | `npm run dev` (top‑level script uses `concurrently`) |
| Lint | `npm run lint` |
| Test | `npm run test` |
| Build | `npm run build` |

Please adhere to the **Conventional Commits** format for commit messages.

---

## 📄 License & Credits  

**License:** ISC – see the [LICENSE](LICENSE) file.  

**Authors & Contributors**  

* **Kai Here** – Project lead, full‑stack architecture, AI prompt engineering.  
* **Community contributors** – see the `CONTRIBUTORS.md` file for a full list.  

**Acknowledgments**  

* Groq for the generous free tier of LLaMA 3.3 70B and GPT‑OSS‑120B.  
* BullMQ and Redis for reliable background processing.  
*