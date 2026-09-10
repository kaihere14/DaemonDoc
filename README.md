# DaemonDoc

DaemonDoc is an AI-powered documentation engine that automatically generates, updates, and cleans up `README.md` files for GitHub repositories. It listens to GitHub repository push webhooks, analyzes codebase diffs, and commits structured documentation directly back to GitHub using Google Gemini and Sarvam AI models.

## Features

* **Webhook-Driven Automation**: Automatically queues README updates on GitHub `push` events to default repository branches.
* **Smart Generation Modes**: Evaluates repository state to choose between full README rewrites and targeted section patches.
* **README Cleanup**: Asynchronously restructures, deduplicates, and tidies cluttered documentation via BullMQ background workers.
* **AI Provider Priority & Fallback**: Configurable provider prioritization supporting Google Gemini (with key rotation) and Sarvam AI.
* **Real-time Log Streaming**: Streams live background job progress and status messages to the client using Convex.
* **Dashboard & Admin Tools**: Includes repository activation controls, system analytics, user management, and email broadcast tools using Resend.

## Repository Structure

```
├── client/          # React 19 + Vite dashboard frontend (app.daemondoc.online)
├── seo-client/      # Next.js 16 landing page and marketing site (daemondoc.online)
├── server/          # Node.js + Express API server and BullMQ background worker
├── convex-server/   # Convex server functions for real-time log updates
└── docs/            # Architecture and system documentation
```

## Requirements

* **Node.js**: `>=20`
* **Package Manager**: `pnpm` (`10.20.0`)
* **Databases & Services**:
  * MongoDB
  * Redis

## Installation

Install dependencies across all monorepo workspaces from the root directory:

```bash
pnpm install
```

## Configuration

Configure environment variables for the backend and frontend applications.

### Server (`server/.env`)

```env
PORT=3000
NODE_ENV=development
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
GITHUB_TOKEN_SECRET=32_byte_hex_string_for_token_encryption

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
CONVEX_URL=https://your-convex-deployment.convex.cloud

GEMINI_API_KEY1=your_primary_gemini_key
GEMINI_API_KEY2=your_secondary_gemini_key
GEMINI_API_KEY3=your_tertiary_gemini_key
SARVAM_API_KEY=your_sarvam_api_key

RESEND_API_KEY=your_resend_api_key
README_FILE_NAME=README.md
```

### Client (`client/.env`)

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_token
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VITE_MARKETING_URL=http://localhost:3001
```

### SEO / Marketing Client (`seo-client/.env`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

## Usage

### Development

Run the dashboard client and backend API server concurrently:

```bash
pnpm run dev
```

Run individual services separately:

```bash
# Start dashboard frontend (client)
pnpm run dev:client

# Start API server and worker (server)
pnpm run dev:server

# Start marketing site (seo-client)
pnpm run dev:seo

# Start Convex local development
pnpm run dev:convex
```

### Building and Code Quality

```bash
# Build all workspaces
pnpm run build

# Typecheck TypeScript files across workspaces
pnpm run typecheck

# Run linter across workspaces
pnpm run lint

# Check and format code with Prettier
pnpm run format:check
pnpm run format:write
```

### Docker Deployment

Build and run the API server using Docker:

```bash
docker build -t daemondoc-server ./server
docker run -p 3000:3000 --env-file server/.env daemondoc-server
```

Alternatively, use the provided Docker Compose configuration for development services:

```bash
docker compose -f docker-compose.devlopment-setup.yml up -d
```

## API Reference

### Authentication (`/auth`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/auth/github` | Redirects to GitHub OAuth authorization |
| `GET` | `/auth/github/callback` | Handles GitHub OAuth callback |
| `POST` | `/auth/verify` | Validates JWT token and returns user details |
| `GET` | `/auth/providers` | Retrieves supported LLM provider metadata |
| `PATCH` | `/auth/llm-provider-priority` | Updates LLM provider priority order for the user |
| `DELETE` | `/auth/delete` | Deletes user account, webhooks, and associated logs |

### GitHub & Repository Automation (`/api/github`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/github/getGithubRepos` | Fetches accessible GitHub repositories for the user |
| `POST` | `/api/github/addRepoActivity` | Activates repo monitoring and creates a GitHub webhook |
| `POST` | `/api/github/deactivateRepoActivity` | Deactivates repo monitoring and removes webhook |
| `POST` | `/api/github/webhookhandler` | Raw body handler for incoming GitHub push webhooks |
| `GET` | `/api/github/fetchUserLogs` | Retrieves recent log history for the authenticated user |
| `POST` | `/api/github/cleanUpReadme` | Enqueues a background job to clean up and reformat a README |
| `GET` | `/api/github/admin/analytics` | Returns system overview and run analytics (Admin required) |
| `GET` | `/api/github/admin/users` | Fetches paginated user list (Admin required) |

### Email Broadcast (`/api/email`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/email/recipients` | Returns eligible broadcast recipients list (Admin required) |
| `POST` | `/api/email/send` | Queues feature update broadcast email jobs (Admin required) |
| `GET` | `/api/email/queue-status` | Fetches current email queue metrics (Admin required) |

## License

This project is licensed under the [ISC License](LICENSE).