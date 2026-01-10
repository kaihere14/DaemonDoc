# 📚 ReadIt - AI-Powered README Generator

<div align="center">

![ReadIt Banner](https://img.shields.io/badge/ReadIt-AI%20README%20Generator-4F46E5?style=for-the-badge&logo=readme&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Demo-readit--4.onrender.com-success?style=for-the-badge)](https://readit-4.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

**Transform your GitHub repositories with AI-generated, always up-to-date documentation**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API Docs](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 🎯 Overview

**ReadIt** is an intelligent README generation platform that leverages AI to automatically create and maintain comprehensive documentation for your GitHub repositories. By analyzing your codebase structure, dependencies, and commits, ReadIt generates professional, contextual READMEs that stay synchronized with your code through GitHub webhooks.

### Why ReadIt?

- **⏱️ Save Time**: Stop writing boilerplate documentation manually
- **🔄 Always Current**: Auto-updates when you push code changes
- **🧠 Context-Aware**: Analyzes actual code, not just file names
- **🎨 Professional**: Generates well-structured, comprehensive docs
- **🔐 Secure**: OAuth authentication with encrypted token storage
- **⚡ Fast**: Background processing with Redis-powered job queues

---

## ✨ Features

### Core Capabilities

- **🤖 AI-Powered Analysis**

  - Uses Groq's LLaMA 3.3 70B model for intelligent code understanding
  - Analyzes repository structure, dependencies, and file relationships
  - Generates contextual documentation based on actual implementation

- **🔄 Automatic Updates**

  - GitHub webhook integration for real-time updates
  - Regenerates README on every push event
  - Smart diff analysis to focus on changed files

- **📊 Intelligent Context Building**

  - Identifies and prioritizes important files
  - Extracts metadata from package managers (npm, pip, maven, etc.)
  - Builds optimal prompts with code snippets and structure

- **🎯 Repository Management**

  - Select specific repositories to activate
  - Dashboard to manage all your projects
  - One-click activation/deactivation

- **🔒 Enterprise-Grade Security**

  - GitHub OAuth 2.0 authentication
  - AES-256-GCM token encryption
  - HMAC-SHA256 webhook signature verification
  - JWT-based session management

- **⚡ High Performance**
  - BullMQ-powered background job processing
  - Redis queue for async operations
  - Optimized context building (70% size reduction)
  - Handles large repositories efficiently

---

## 🎬 Demo

### Live Application

**Frontend**: Coming soon (Vercel deployment)  
**Backend API**: https://readit-4.onrender.com

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Connect GitHub Account → OAuth Authentication                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Select Repository → Creates Webhook & Activates              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Push Code → Webhook Triggers → Job Queued                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. AI Analyzes Codebase → Generates README → Commits to Repo   │
└─────────────────────────────────────────────────────────────────┘
```

### Screenshots

_(Add screenshots of your landing page, dashboard, and repository selection UI here)_

---

## 🏗️ Architecture

```
                        ┌──────────────────┐
                        │   React Client   │
                        │   (Vite + TW)    │
                        └────────┬─────────┘
                                 │ REST API
                                 ↓
┌────────────────────────────────────────────────────────────────┐
│                      Express Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Auth       │  │   GitHub     │  │   Worker          │   │
│  │  Controller  │  │  Controller  │  │   Controller      │   │
│  └──────────────┘  └──────────────┘  └───────────────────┘   │
└────────┬──────────────────┬──────────────────┬────────────────┘
         │                  │                  │
         ↓                  ↓                  ↓
  ┌────────────┐   ┌─────────────────┐  ┌──────────────┐
  │  MongoDB   │   │  GitHub API     │  │   Redis      │
  │   (User    │   │  (Repos, Trees, │  │  (BullMQ)    │
  │   Repos)   │   │   Webhooks)     │  │              │
  └────────────┘   └─────────────────┘  └──────┬───────┘
                                                │
                                                ↓
                                      ┌──────────────────┐
                                      │  Background      │
                                      │  Worker Process  │
                                      └────────┬─────────┘
                                               │
                                               ↓
                                      ┌──────────────────┐
                                      │   Groq AI API    │
                                      │  (LLaMA 3.3 70B) │
                                      └──────────────────┘
```

### Data Flow

1. **User Authentication**: GitHub OAuth → Encrypted Token Storage → JWT Generation
2. **Repository Activation**: Create Webhook → Store in MongoDB → Initial README Generation
3. **Push Event**: GitHub Webhook → Verify Signature → Queue Job in Redis
4. **Background Processing**:
   - Fetch repository tree and changed files
   - Build intelligent context with code analysis
   - Generate README using Groq AI
   - Commit README back to repository
   - Update job status

---

## 🛠️ Tech Stack

### Frontend (`/client`)

| Technology        | Purpose                 | Version |
| ----------------- | ----------------------- | ------- |
| **React**         | UI framework            | 19.2.0  |
| **Vite**          | Build tool & dev server | 7.2.4   |
| **React Router**  | Client-side routing     | 7.12.0  |
| **Tailwind CSS**  | Utility-first styling   | 4.1.18  |
| **Framer Motion** | Animation library       | 12.25.0 |
| **Zustand**       | State management        | 5.0.9   |
| **Lucide React**  | Icon library            | 0.562.0 |

### Backend (`/server`)

| Technology   | Purpose               | Version |
| ------------ | --------------------- | ------- |
| **Node.js**  | Runtime environment   | 18+     |
| **Express**  | Web framework         | 5.2.1   |
| **MongoDB**  | Primary database      | -       |
| **Mongoose** | ODM for MongoDB       | 9.1.2   |
| **Redis**    | Job queue & caching   | -       |
| **IORedis**  | Redis client          | 5.9.1   |
| **BullMQ**   | Job queue management  | 5.66.4  |
| **JWT**      | Authentication tokens | 9.0.3   |
| **Axios**    | HTTP client           | 1.13.2  |

### AI & External Services

- **Groq AI** - LLaMA 3.3 70B model for README generation
- **GitHub API** - Repository access, webhooks, commits
- **Redis Labs** - Managed Redis instance
- **MongoDB Atlas** - Cloud database

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB** instance ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud)
- **Redis** instance ([Redis Labs](https://redis.com/) for cloud or local)
- **GitHub OAuth App** ([Create one](https://github.com/settings/developers))
- **Groq API Key** ([Get free key](https://console.groq.com))

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/readit.git
cd readit
```

### 2. Server Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/readit

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Token Encryption (generate with: openssl rand -hex 32)
GITHUB_TOKEN_SECRET=64_character_hex_string_for_aes256_encryption

# Webhook Security
GITHUB_WEBHOOK_SECRET=your_custom_webhook_secret_string

# Redis Configuration
REDIS_HOST=your-redis-host.cloud.redislabs.com
REDIS_PORT=17140
REDIS_PASSWORD=your_redis_password

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Groq AI Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
README_FILE_NAME=README.md
```

### 3. Client Setup

```bash
cd ../client
npm install
```

Create `.env` file in `client/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
# Server starts on http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

### 5. Access Application

Open your browser and navigate to **http://localhost:5173**

---

## ⚙️ Configuration

### GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: ReadIt (or your choice)
   - **Homepage URL**: `http://localhost:5173` (dev) or production URL
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**
6. Add to your `server/.env` file

### Groq API Setup

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key and add to `server/.env` as `GROQ_API_KEY`

### Redis Setup

**Local Development:**

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Verify installation
redis-cli ping  # Should return PONG
```

**Production (Redis Labs):**

1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy connection details (host, port, password)
4. Add to `server/.env`

### MongoDB Setup

**Local Development:**

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Production (MongoDB Atlas):**

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Add a database user
4. Whitelist your IP address (or 0.0.0.0/0 for all)
5. Get connection string and add to `server/.env`

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://readit-4.onrender.com`

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Auth Endpoints

#### `GET /auth/github`

Initiates GitHub OAuth flow.

**Response**: Redirects to GitHub authorization page

---

#### `GET /auth/github/callback`

GitHub OAuth callback handler.

**Query Parameters:**

- `code` (string, required) - Authorization code from GitHub

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "githubId": "12345678",
    "username": "octocat",
    "avatar": "https://avatars.githubusercontent.com/u/583231"
  }
}
```

**Status Codes:**

- `200 OK` - Successful authentication
- `400 Bad Request` - Invalid or missing code
- `500 Internal Server Error` - Server error

---

#### `POST /auth/verify`

Verifies JWT token and returns user information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "githubId": "12345678",
    "username": "octocat"
  }
}
```

**Status Codes:**

- `200 OK` - Token valid
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User not found

---

### GitHub Repository Endpoints

#### `GET /api/github/getGithubRepos`

Fetches all repositories accessible to the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "reposData": [
    {
      "id": 123456789,
      "name": "my-awesome-project",
      "full_name": "octocat/my-awesome-project",
      "private": false,
      "owner": "octocat",
      "default_branch": "main",
      "activated": true
    },
    {
      "id": 987654321,
      "name": "another-repo",
      "full_name": "octocat/another-repo",
      "private": true,
      "owner": "octocat",
      "default_branch": "master",
      "activated": false
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `401 Unauthorized` - Invalid token
- `404 Not Found` - GitHub access token not found
- `500 Internal Server Error` - Failed to fetch repositories

---

#### `POST /api/github/addRepoActivity`

Activates README generation for a repository.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "repoId": 123456789,
  "repoName": "my-awesome-project",
  "repoFullName": "octocat/my-awesome-project",
  "repoOwner": "octocat",
  "defaultBranch": "main"
}
```

**Response:**

```json
{
  "message": "Repository activity added successfully"
}
```

**Status Codes:**

- `200 OK` - Successfully activated
- `400 Bad Request` - Missing required fields or already activated
- `401 Unauthorized` - Invalid token
- `422 Unprocessable Entity` - Webhook already exists
- `500 Internal Server Error` - Failed to create webhook

**Actions Performed:**

1. Creates GitHub webhook for push events
2. Stores repository activation in database
3. Queues initial README generation job

---

#### `POST /api/github/deactivateRepoActivity`

Deactivates README generation for a repository.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "repoId": 123456789
}
```

**Response:**

```json
{
  "message": "Repository deactivated successfully"
}
```

**Status Codes:**

- `200 OK` - Successfully deactivated
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Active repository not found
- `500 Internal Server Error` - Failed to delete webhook

**Actions Performed:**

1. Deletes GitHub webhook
2. Marks repository as inactive in database

---

#### `POST /api/github/webhookhandler`

Receives GitHub webhook events for push notifications.

**Headers:**

```
X-Hub-Signature-256: sha256=<hmac_signature>
Content-Type: application/json
```

**Body:** Standard GitHub push event payload

**Response:**

```json
{
  "message": "Webhook received and job queued"
}
```

**Status Codes:**

- `200 OK` - Webhook processed successfully
- `403 Forbidden` - Invalid webhook signature
- `400 Bad Request` - Invalid payload
- `500 Internal Server Error` - Processing error

**Webhook Event Processing:**

1. Verifies HMAC-SHA256 signature
2. Extracts repository and commit information
3. Checks if repository is activated
4. Queues README generation job in Redis

---

### Health Check

#### `GET /health`

Health check endpoint for monitoring.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-11T10:30:00.000Z",
  "uptime": 3600.5,
  "redis": "connected"
}
```

**Status Codes:**

- `200 OK` - Service healthy

**Use Cases:**

- Uptime monitoring
- Load balancer health checks
- Keepalive pings for Render free tier

---

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create Web Service**

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Web Service**
   - Connect your GitHub repository

2. **Configure Service**

   ```
   Name: readit-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   Add all variables from your `server/.env`:

   - `MONGO_URI`
   - `JWT_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL` (update with Render URL)
   - `GITHUB_TOKEN_SECRET`
   - `GITHUB_WEBHOOK_SECRET`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`
   - `FRONTEND_URL` (your Vercel URL)
   - `BACKEND_URL` (your Render URL)
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
   - `README_FILE_NAME`

4. **Deploy**
   - Click **Create Web Service**
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://readit-4.onrender.com`)

### Frontend Deployment (Vercel)

1. **Import Project**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Import your GitHub repository

2. **Configure Project**

   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   Add environment variable:

   - `VITE_BACKEND_URL` = Your Render backend URL

4. **Deploy**
   - Click **Deploy**
   - Vercel will automatically deploy
   - Note your deployment URL

### Post-Deployment Steps

1. **Update GitHub OAuth App**

   - Go to GitHub OAuth App settings
   - Update **Homepage URL** to your Vercel URL
   - Update **Callback URL** to `https://your-render-app.onrender.com/auth/github/callback`

2. **Update Environment Variables**

   - Update `GITHUB_CALLBACK_URL` in Render
   - Update `FRONTEND_URL` in Render
   - Update `BACKEND_URL` in Render and Vercel

3. **Test the Application**
   - Visit your Vercel URL
   - Test GitHub login
   - Activate a test repository
   - Make a commit and verify README generation

### Keepalive Setup (Prevent Render Free Tier Sleep)

**Option 1: GitHub Actions** (Already configured)

- File: `.github/workflows/keepalive.yml`
- Pings every 10 minutes
- Note: May have delays during high GitHub load

**Option 2: External Monitoring (Recommended)**

1. Sign up at [UptimeRobot](https://uptimerobot.com)
2. Create new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://readit-4.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
3. Save and activate

**Option 3: Cron-job.org**

1. Sign up at [cron-job.org](https://cron-job.org)
2. Create new cron job:
   - **URL**: `https://readit-4.onrender.com/health`
   - **Schedule**: Every 10 minutes
3. Activate

---

## 🔐 Security

### Implemented Security Measures

1. **Authentication**

   - OAuth 2.0 with GitHub
   - JWT tokens with 7-day expiration
   - Secure token storage in localStorage

2. **Encryption**

   - AES-256-GCM encryption for GitHub access tokens
   - Random IV generation for each encryption
   - Authentication tags for data integrity

3. **Webhook Security**

   - HMAC-SHA256 signature verification
   - Timing-safe equal comparison
   - Secret key validation

4. **Database Security**

   - Mongoose schema validation
   - MongoDB connection with authentication
   - Encrypted sensitive fields

5. **API Security**
   - CORS configuration
   - Rate limiting (recommended to add)
   - Input validation and sanitization

### Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Rotate secrets regularly** - Especially JWT and encryption keys
3. **Use HTTPS in production** - Both Render and Vercel provide free SSL
4. **Whitelist IPs for databases** - Restrict MongoDB and Redis access
5. **Monitor logs** - Watch for suspicious activity
6. **Update dependencies** - Run `npm audit` regularly

---

## 🐛 Troubleshooting

### Common Issues

#### Redis Connection Errors

**Problem**: `Redis connection failed` or `ECONNREFUSED`

**Solutions**:

```bash
# Check if Redis is running locally
redis-cli ping  # Should return PONG

# Check Redis credentials in .env
echo $REDIS_HOST
echo $REDIS_PORT

# For cloud Redis, verify:
# 1. IP whitelist includes your server IP
# 2. Credentials are correct
# 3. Firewall allows connections on Redis port
```

#### MongoDB Connection Issues

**Problem**: `MongoServerError: bad auth` or connection timeout

**Solutions**:

```bash
# Test connection with mongosh
mongosh "your_connection_string"

# For MongoDB Atlas:
# 1. Check network access (IP whitelist)
# 2. Verify database user credentials
# 3. Ensure user has read/write permissions
# 4. Check if connection string includes database name
```

#### GitHub Webhook Not Firing

**Problem**: README not updating after push

**Solutions**:

1. **Check webhook exists**:

   - Go to repo → Settings → Webhooks
   - Verify webhook URL matches your backend
   - Check recent deliveries for errors

2. **Verify webhook secret**:

   - Ensure `GITHUB_WEBHOOK_SECRET` matches webhook configuration
   - Check server logs for signature verification errors

3. **Test webhook manually**:
   ```bash
   curl -X POST https://your-render-app.onrender.com/api/github/webhookhandler \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=test" \
     -d '{"ref":"refs/heads/main"}'
   ```

#### AI Generation Timeout

**Problem**: README generation takes too long or times out

**Solutions**:

- **Large repositories**: Generation may take 1-3 minutes
- **Check Groq API limits**: Verify you haven't exceeded rate limits
- **Review context size**: Check if repository is extremely large
- **Check worker logs**: Look for specific errors in Render logs

```bash
# Monitor job queue
redis-cli
> KEYS bullmq:*
> LLEN bullmq:readme-generation:wait
```

#### OAuth Callback Error

**Problem**: `redirect_uri_mismatch` or callback fails

**Solutions**:

1. **Verify callback URL**:

   - GitHub OAuth App settings must match exactly
   - Include protocol (http:// or https://)
   - No trailing slash

2. **Update environment variables**:

   ```env
   GITHUB_CALLBACK_URL=https://your-actual-domain.com/auth/github/callback
   ```

3. **Clear browser cache**: Old redirect URIs may be cached

---

## 📊 Performance Optimization

### Context Building Optimization

The system implements intelligent file filtering:

```javascript
// Files automatically excluded:
- node_modules/, vendor/, dist/, build/
- .git/, .github/workflows/
- Binary files, images, fonts
- Lock files (package-lock.json, yarn.lock)
- Log files

// Files prioritized:
- Package.json, requirements.txt, pom.xml
- Main source files (src/, lib/)
- Configuration files
- Documentation files
```

### Redis Queue Management

```javascript
// Job configuration
{
  removeOnComplete: { count: 100 },  // Keep last 100 completed
  removeOnFail: { count: 50 },       // Keep last 50 failed
  attempts: 3,                        // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 2000                       // Start with 2s delay
  }
}
```

### Database Indexing

Ensure indexes are created for optimal query performance:

```javascript
// User schema
username: { type: String, index: true }
githubId: { type: String, unique: true, index: true }

// ActiveRepo schema
userId: { type: ObjectId, index: true }
repoId: { type: Number, index: true }
active: { type: Boolean, index: true }
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] GitHub OAuth login flow
- [ ] Repository list fetches correctly
- [ ] Repository activation creates webhook
- [ ] Push event triggers README generation
- [ ] Generated README commits to repository
- [ ] Repository deactivation removes webhook
- [ ] Health endpoint responds
- [ ] Error handling for invalid tokens
- [ ] Error handling for missing environment variables

### API Testing with cURL

```bash
# Health check
curl https://readit-4.onrender.com/health

# Get repositories (requires token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://readit-4.onrender.com/api/github/getGithubRepos

# Activate repository
curl -X POST https://readit-4.onrender.com/api/github/addRepoActivity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repoId": 123456,
    "repoName": "test-repo",
    "repoFullName": "username/test-repo",
    "repoOwner": "username",
    "defaultBranch": "main"
  }'
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Propose new functionality
3. **Submit PRs** - Fix bugs or add features
4. **Improve Docs** - Enhance documentation
5. **Share Feedback** - Tell us what you think

### Development Workflow

1. **Fork the repository**

   ```bash
   gh repo fork yourusername/readit
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**

   ```bash
   # Run server
   cd server && npm run dev

   # Run client
   cd client && npm run dev
   ```

5. **Commit with meaningful message**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe what you changed
   - Reference any related issues
   - Add screenshots if UI changes

### Code Style Guidelines

- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for functions
- Keep functions small and focused
- Use async/await over promises
- Handle errors gracefully

---

## 📜 License

This project is licensed under the **ISC License**.

```
Copyright (c) 2026 ReadIt

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 🙏 Acknowledgments

Special thanks to:

- **[Groq](https://groq.com)** - For providing lightning-fast LLaMA inference
- **[GitHub](https://github.com)** - For comprehensive API and OAuth support
- **[BullMQ](https://docs.bullmq.io/)** - For robust job queue management
- **[Render](https://render.com)** - For reliable and simple deployment
- **[Vercel](https://vercel.com)** - For seamless frontend hosting
- **Open Source Community** - For the amazing tools and libraries

---

## 📞 Support & Contact

### Get Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/readit/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/readit/discussions)
- 📧 **Email**: support@readit.dev
- 🐦 **Twitter**: [@readit_ai](https://twitter.com/readit_ai)

### Useful Links

- [Live Demo](https://readit-4.onrender.com)
- [Documentation](https://docs.readit.dev)
- [API Reference](https://api.readit.dev/docs)
- [Changelog](CHANGELOG.md)

---

## 🗺️ Roadmap

### Q1 2026

- [ ] Multi-language README generation (ES, FR, DE, ZH)
- [ ] Custom README templates
- [ ] README preview before committing
- [ ] Dark mode support

### Q2 2026

- [ ] GitLab integration
- [ ] Bitbucket support
- [ ] Team collaboration features
- [ ] Analytics dashboard

### Q3 2026

- [ ] API documentation auto-generation
- [ ] Changelog auto-generation
- [ ] Code comment analysis
- [ ] Integration with Notion/Confluence

### Q4 2026

- [ ] VS Code extension
- [ ] CLI tool
- [ ] Self-hosted version
- [ ] Enterprise features

---

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/kaihere14/Readit?style=social) ![GitHub forks](https://img.shields.io/github/forks/kaihere14/Readit?style=social)![GitHub issues](https://img.shields.io/github/issues/kaihere14/Readit) ![GitHub pull requests](https://img.shields.io/github/issues-pr/kaihere14/Readit) ![GitHub last commit](https://img.shields.io/github/last-commit/kaihere14/Readit)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Built with ❤️ by the ReadIt Team**

[Website](https://read-it-ruby.vercel.app/home) • [Twitter](https://x.com/ArmanKiyotaka) • [Linkedin](https://www.linkedin.com/in/arman-thakur-303b47367/)

</div>
