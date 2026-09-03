# DaemonDoc

DaemonDoc is an AI-powered documentation platform that automatically generates, updates, and cleans up GitHub `README.md` files. By integrating with GitHub webhooks, BullMQ queues, and Gemini LLM provider chains, DaemonDoc analyzes commit diffs and repository code structure to keep project documentation continuously synchronized with codebase changes.

## Features

- **Webhook-Driven Synchronization**: Automatically listens for GitHub `push` events on repository default branches to trigger documentation updates.
- **Smart Generation & Patching**: Detects whether a full README generation or section-level patch is needed, updating only changed documentation sections while preserving existing content.
- **AST & Section Parsing**: Uses SHA-256 section hashing and deterministic section re-anchoring to prevent hallucinated headings or structure loss.
- **Automated README Cleanup**: AI-assisted cleanup pipeline to reformat, restructure, and remove clutter or template boilerplate from existing README files.
- **Resilient LLM Provider Infrastructure**: Implements Gemini models (`gemini-3.5-flash-lite` and `gemini-3.6-flash`) with multi-API key rotation and fallback logic.
- **Real-Time Live Streaming Logs**: Powered by Convex to stream job progress logs directly to the user dashboard.
- **Asynchronous Queue Architecture**: Built with BullMQ and Redis to execute non-blocking, queued background jobs for generation, cleanup, and email broadcasts.
- **Admin Control Center**: Built-in system analytics, user management, and broadcast update email functionality using Resend templates.

## Requirements

- **Node.js**: `>=20`
- **Package Manager**: `pnpm@10.20.0`
- **Database**: MongoDB instance
- **Cache & Queue**: Redis server
- **Real-time Backend**: Convex project deployment
- **Authentication**: GitHub OAuth App credentials

## Project Structure

```
DaemonDoc/
├── client/           # Vite + React 19 dashboard application (app.daemondoc.online)
├── seo-client/       # Next.js 16 marketing and landing site (daemondoc.online)
├── server/           # Express 5 backend server, BullMQ workers, LLM logic, and API routes
├── convex-server/    # Convex server functions and schema for live streaming logs
├── docker-compose.yml# Container configuration
└── pnpm-workspace.yaml# Monorepo workspace configuration
```

## Installation

Clone the repository and install dependencies across all workspace packages:

```bash
pnpm run install:all
```

## Configuration

DaemonDoc requires environment variables configured across its server, client, and Convex environments.

### Backend (`server/.env`)

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/daemondoc
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=default

JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
GITHUB_TOKEN_SECRET=hex_encoded_32_byte_key

BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
CONVEX_URL=https://your-convex-deployment.convex.cloud

GEMINI_API_KEY1=your_gemini_key_1
GEMINI_API_KEY2=your_gemini_key_2
GEMINI_API_KEY3=your_gemini_key_3

RESEND_API_KEY=your_resend_api_key
```

### Dashboard Client (`client/.env`)

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
VITE_MARKETING_URL=http://localhost:3001
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_token
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Marketing Site (`seo-client/.env`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

## Usage

### Development

Run all applications (`client`, `seo-client`, and `server`) concurrently in development mode:

```bash
pnpm run dev
```

Alternatively, run specific services individually:

```bash
pnpm run dev:client
```

```bash
pnpm run dev:server
```

```bash
pnpm run dev:seo
```

```bash
pnpm run dev:convex
```

### Building for Production

To build all workspace packages:

```bash
pnpm run build
```

To build specific clients:

```bash
pnpm run build:client
```

```bash
pnpm run build:seo
```

Start the production Express server:

```bash
pnpm run start:server
```

### Code Quality and Verification

Run linter checks across all packages:

```bash
pnpm run lint
```

Run TypeScript type checks:

```bash
pnpm run typecheck
```

Check or format code formatting using Prettier:

```bash
pnpm run format:check
```

```bash
pnpm run format:write
```

## API Reference

### Authentication Routes (`/auth`)

- `GET /auth/github`: Redirects user to GitHub OAuth authorization.
- `GET /auth/github/callback`: Handles GitHub OAuth callback and issues JWT.
- `POST /auth/verify`: Verifies active JWT session.
- `DELETE /auth/delete`: Deletes user account and associated webhooks.

### GitHub & Repository Routes (`/api/github`)

- `GET /api/github/getGithubRepos`: Retrieves user's accessible GitHub repositories.
- `POST /api/github/addRepoActivity`: Connects a repository, sets up GitHub webhooks, and triggers initial README generation.
- `POST /api/github/deactivateRepoActivity`: Deactivates repository sync and removes webhooks.
- `POST /api/github/webhookhandler`: Webhook receiver for GitHub `push` events.
- `GET /api/github/fetchUserLogs`: Fetches recent execution logs for the authenticated user.
- `POST /api/github/cleanUpReadme`: Enqueues an asynchronous README cleanup job.

### Admin Routes (`/api/github/admin` & `/api/email`)

- `GET /api/github/admin/analytics`: Retrieves platform analytics, job status breakdowns, and active repository statistics (Requires Admin).
- `GET /api/github/admin/users`: Retrieves paginated user directory (Requires Admin).
- `GET /api/email/recipients`: Fetches eligible recipient list for broadcast emails (Requires Admin).
- `POST /api/email/send`: Enqueues product update broadcast jobs to selected users (Requires Admin).
- `GET /api/email/queue-status`: Returns BullMQ email broadcast queue statistics (Requires Admin).

## License

ISC License