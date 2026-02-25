
# DaemonDoc  
**A modern full‑stack documentation platform powered by React, Vite, Tailwind CSS, and Express.**  

![DaemonDoc Banner](https://raw.githubusercontent.com/kaihere14/DaemonDoc/main/client/public/logo.svg)

---

## Badges
| | |
|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js) | ![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react) |
| ![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express) | ![MongoDB](https://img.shields.io/badge/MongoDB-9.1-47A248?logo=mongodb) |
| ![Redis](https://img.shields.io/badge/Redis-6%2B-DC382D?logo=redis) | ![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite) |
| ![License](https://img.shields.io/badge/License-ISC-3DA639) | ![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=github) |

*Quick links:*  
[Demo (coming soon)](#) • [Documentation](#) • [Issues](https://github.com/kaihere14/DaemonDoc/issues) • [Pull Requests](https://github.com/kaihere14/DaemonDoc/pulls)

---

## Overview
DaemonDoc is a **single‑page web application** that lets developers create, edit, and publish technical documentation directly from their GitHub repositories.  
- **Live preview** powered by React + Framer Motion.  
- **Secure authentication** with JWT and refresh‑token flow.  
- **Background job processing** (e.g., markdown rendering) via BullMQ + Redis.  

Targeted at **software teams, open‑source maintainers, and anyone who wants a fast, self‑hosted docs site**.

Current version: **v1.0.0** (first stable release).

---

## Features
| Feature | Description | Status |
|---|---|---|
| **GitHub Integration** | Pull markdown files, repo metadata, and contributors via the GitHub API. | ✅ Stable |
| **JWT Authentication** | Sign‑up / sign‑in with email + password, protected routes, token refresh. | ✅ Stable |
| **Rich Text Editor** | WYSIWYG markdown editor with live preview (React + Framer Motion). | ✅ Stable |
| **Background Rendering** | Convert markdown to HTML in a BullMQ worker (Redis‑backed). | ✅ Stable |
| **Responsive UI** | Tailwind‑CSS powered, mobile‑first layout. | ✅ Stable |
| **API Rate‑limit handling** | Automatic back‑off & retry for GitHub API limits. | ✅ Stable |
| **Docker Support** | One‑command containerised dev & prod environments. | ✅ Stable |
| **Vercel / Netlify Ready** | `vercel.json` included for zero‑config deployments. | ✅ Stable |
| **Health & Metrics** | `/health` endpoint reports uptime, DB & Redis status. | ✅ Stable |
| **Extensible Plugin System** *(planned)* | Hooks for custom renderers, theming, and CI integration. | ⚙️ Beta |

---

## Tech Stack
| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Framer Motion, Zustand, Axios | Fast HMR, utility‑first styling, smooth animations, simple state management |
| **Backend** | Express 5, Node.js 20, MongoDB 9 (via Mongoose), Redis 6 (BullMQ), JWT, Axios | Scalable REST API, document storage, background job queue |
| **DevOps** | Docker, Vercel (frontend), GitHub Actions (CI) | Consistent environments, easy deployments |
| **Testing / Linting** | ESLint, Prettier (via Vite plugin) | Code quality & consistency |
| **Analytics** | @vercel/analytics | Usage insights (optional) |

---

## Architecture
```
root
├─ client/                # React SPA (Vite)
│   ├─ src/
│   │   ├─ components/    # UI primitives
│   │   ├─ pages/         # Route‑level views
│   │   ├─ context/       # React context providers
│   │   ├─ hooks/         # Custom hooks (auth, API)
│   │   └─ lib/           # Utility functions
│   └─ public/            # Static assets (logo, OG images)
│
├─ server/                # Express API
│   ├─ src/
│   │   ├─ controllers/   # Request handlers (auth, github)
│   │   ├─ routes/        # Express routers
│   │   ├─ services/      # Business logic (JWT, GitHub client)
│   │   ├─ db/            # Mongoose connection helper
│   │   ├─ utils/         # Shared helpers (error handling)
│   │   └─ middlewares/   # CORS, auth guard, error middleware
│   └─ .env.example       # Sample environment variables
│
├─ .github/workflows/     # CI pipelines
└─ docker-compose.yml     # Multi‑container dev setup (optional)
```

**Data Flow**  
1. Browser → **React SPA** (Axios) → **Express API** (`/auth`, `/api/github`).  
2. API validates JWT, forwards GitHub requests, stores markdown in MongoDB.  
3. When a new doc is saved, a BullMQ job is queued; a Redis‑backed worker renders markdown → HTML → saved back to DB.  
4. Frontend polls the rendered HTML endpoint for live preview.

---

## Getting Started

### Prerequisites
| Tool | Minimum version |
|------|-----------------|
| Node.js | **20** |
| npm (or Yarn) | **9** |
| Docker (optional) | **20.10** |
| MongoDB | **6** (local or Atlas) |
| Redis | **6** (local or managed) |
| GitHub OAuth App | *Client ID & Secret* (for GitHub integration) |

### Clone the repository
```bash
git clone https://github.com/kaihere14/DaemonDoc.git
cd DaemonDoc
```

### Environment variables
Create a `.env` file in the **server** folder (copy from the example):

```bash
# server/.env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/daemondoc
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=another-super-secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173   # Vite dev server
```

> **Tip:** Keep `.env` out of version control (`.gitignore` already includes it).

### Install dependencies

```bash
# Install server deps
cd server
npm ci

# Install client deps
cd ../client
npm ci
```

### Development mode (hot‑reload)

```bash
# Terminal 1 – start the API
cd server
npm run dev   # nodemon watches src/**/*.js

# Terminal 2 – start the frontend
cd ../client
npm run dev   # Vite dev server (http://localhost:5173)
```

Open `http://localhost:5173` in your browser. The frontend proxies API calls to `http://localhost:3000` (configured via Vite's proxy in `vite.config.js`).

### Build for production

```bash
# Build the client
cd client
npm run build   # outputs to client/dist

# (Optional) Create a Docker image
docker build -t daemondoc .
```

### Run the production bundle

```bash
# Using Node directly
cd server
npm start   # expects compiled client assets in ../client/dist
```

Or deploy the `client` folder to Vercel/Netlify and the `server` folder to any Node‑compatible host (Heroku, Railway, Render, etc.).

---

## Usage

### Authentication (REST)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user (email + password). Returns JWT + refresh token. |
| `POST` | `/auth/login` | Login with credentials. Returns JWT + refresh token. |
| `POST` | `/auth/refresh` | Exchange a valid refresh token for a new JWT. |
| `GET` | `/auth/me` | Returns the authenticated user profile (requires `Authorization: Bearer <jwt>`). |

**Example (login)**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret"}'
```

### GitHub Docs API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github/repos/:owner/:repo/contents/:path` | Fetch raw markdown file from a repo. |
| `GET` | `/api/github/repos/:owner/:repo/commits` | List recent commits (used for change detection). |
| `POST` | `/api/github/render` | Submit markdown to be rendered by the background worker. Returns job ID. |
| `GET` | `/api/github/render/:jobId/status` | Poll job status (`queued`, `processing`, `completed`). |
| `GET` | `/api/github/render/:jobId/result` | Retrieve rendered HTML once the job is complete. |

**Example (fetch a markdown file)**
```bash
curl -H "Authorization: Bearer <jwt>" \
  http://localhost:3000/api/github/repos/facebook/react/contents/README.md
```

### Health Check
```bash
curl http://localhost:3000/health
# => { status: "ok", uptime: 123.45, redis: "connected", ... }
```

---

## Development

### Code style & linting
bash
# Lint the server code
npm run lint:server
# Lint the client code
npm run lint:client
# Fix linting issues automatically (where possible)
npm run lint:fix


### Schema changes
- The `sectionHashes` field in `ActiveRepo` is now stored as a plain object using Mongoose `Schema.Types.Mixed`.
- When updating hashes, the model explicitly calls `doc.markModified('sectionHashes')` to ensure changes are persisted.

---
# Run ESLint on the client
cd client
npm run lint

# Server uses standard Node.js linting (no custom script yet)
```

### Testing
> No automated test suite is currently bundled. Contributions that add Jest/Mocha tests are welcome.

### Debugging
- **Server**: `npm run dev` uses `nodemon` – set `DEBUG=server:*` to get verbose logs.  
- **Client**: Vite's dev console shows HMR errors; open Chrome DevTools → Network to inspect API calls.

### Docker development (optional)

```yaml
# docker-compose.yml (example)
version: "3.9"
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]
  redis:
    image: redis:7
    ports: ["6379:6379"]
  server:
    build: ./server
    env_file: ./server/.env
    ports: ["3000:3000"]
    depends_on: [mongo, redis]
  client:
    build: ./client
    ports: ["5173:5173"]
    depends_on: [server]
volumes:
  mongo-data:
```

Run with `docker compose up --build`.

---

## API Documentation
For a full OpenAPI (Swagger) spec, see `server/openapi.yaml` (to be added). Below is a concise reference.

### Authentication

| Endpoint | Method | Request Body | Response |
|---|---|---|---|
| `/auth/register` | POST | `{ email: string, password: string }` | `{ accessToken: string, refreshToken: string, user: { id, email } }` |
| `/auth/login` | POST | `{ email: string, password: string }` | Same as register |
| `/auth/refresh` | POST | `{ refreshToken: string }` | `{ accessToken: string }` |
| `/auth/me` | GET | — | `{ id, email, createdAt }` |

### GitHub Integration

| Endpoint | Method | Params | Response |
|---|---|---|---|
| `/api/github/repos/:owner/:repo/contents/:path` | GET | `owner`, `repo`, `path` | `{ content: string, sha: string, url: string }` |
| `/api/github/render` | POST | `{ markdown: string, repo: string, path: string }` | `{ jobId: string }` |
| `/api/github/render/:jobId/status` | GET | `jobId` | `{ status: "queued" \| "processing" \| "completed" \| "failed" }` |
| `/api/github/render/:jobId/result` | GET | `jobId` | `{ html: string }` |

**Authentication** – All `/api/github/*` routes require the `Authorization: Bearer <jwt>` header.

**Rate limits** – The server respects GitHub’s `X-RateLimit-Remaining` header; if exhausted, a `429 Too Many Requests` response is returned with a `retry-after` field.

**Patch‑mode support** – The server now stores per‑section hashes in the `ActiveRepo` document (`sectionHashes` field) as a plain object (MongoDB `Mixed` type). This enables efficient README patch generation. The field is automatically marked as modified when hashes are updated, ensuring proper persistence.

---
## Contributing

1. **Fork** the repository.  
2. **Create a feature branch**: `git checkout -b feat/awesome-feature`.  
3. **Install dependencies** (see *Getting Started*).  
4. **Make your changes**. Keep code style consistent (`npm run lint`).  
5. **Commit** with a clear message: `git commit -m "feat: add live markdown preview"`  
6. **Push** and open a **Pull Request** against `main`.  

### Development workflow
- **Backend**: run `npm run dev` in `server/`.  
- **Frontend**: run `npm run dev` in `client/`.  
- **Pull request checklist**  
  - [ ] Lint passes (`npm run lint`).  
  - [ ] New/updated endpoints documented in the API section.  
  - [ ] Tests added (if applicable).  
  - [ ] README updated for any new public behavior.

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be respectful and inclusive.

---

## Troubleshooting & FAQ

| Issue | Solution |
|---|---|
| **CORS error when calling API** | Ensure `FRONTEND_URL` in `.env` matches the Vite dev URL (`http://localhost:5173`). |
| **MongoDB connection fails** | Verify `MONGODB_URI` is reachable; check that the DB server is running. |
| **Redis not connected** | Make sure Redis is running on the host/port defined in `REDIS_URL`. |
| **GitHub API returns 401** | Confirm that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` belong to a valid OAuth App and that the token exchange flow is implemented correctly. |
| **Background job never finishes** | Check Redis logs; ensure BullMQ worker process is running (you may need to start a separate worker script). |
| **`npm run dev` crashes on Windows** | Use WSL2 or Git Bash; the project expects a POSIX‑compatible environment. |

For further help, open an issue or join the discussion in the repository's **Discussions** tab.

---

## Roadmap
- **v1.1** – Add full-text search (ElasticSearch) for docs.  
- **v2.0** – Plugin system for custom renderers (PDF, DOCX).  
- **v2.1** – Real‑time collaborative editing (WebSocket + Yjs).  
- **v3.0** – Multi‑tenant SaaS mode with billing integration.

---

## License & Credits
**License:** ISC – see the [LICENSE](LICENSE) file.  

### Authors & Contributors
- **Kai Here** – Project founder & lead developer ([@kaihere14](https://github.com/kaihere14))  
- **Contributors** – See the [GitHub contributors graph](https://github.com/kaihere14/DaemonDoc/graphs/contributors).

### Acknowledgments
- **Tailwind Labs** – Tailwind CSS framework.  
- **Vite Team** – Fast bundler & dev server.  
- **BullMQ** – Redis‑based job queue.  
- **Express** – Minimalist web framework.  

--- 

*Happy documenting!* 🚀