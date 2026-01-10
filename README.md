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

---

## 📚 Tech Stack

* Frontend: React, Vite
* Backend: Node.js, Express
* Database: MongoDB
* AI Model: Groq's LLaMA 3.3 70B
* Job Queue: BullMQ, Redis
* Authentication: GitHub OAuth 2.0
* Encryption: AES-256-GCM

---

## 📝 Installation

### Prerequisites

* Node.js (>= 16.14.2)
* npm (>= 8.5.5)
* Git (>= 2.35.1)
* GitHub account

### Steps

1. Clone the repository: `git clone https://github.com/kaihere14/ReadIt.git`
2. Install dependencies: `npm install`
3. Create a GitHub OAuth app: <https://github.com/settings/applications/new>
4. Set environment variables: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
5. Start the application: `npm start`

---

## 📊 API Documentation

### Endpoints

* `GET /api/docs`: API documentation
* `POST /api/auth/github`: GitHub OAuth authentication
* `GET /api/repositories`: List of repositories
* `POST /api/repositories/:id/activate`: Activate repository
* `POST /api/repositories/:id/deactivate`: Deactivate repository

### Request/Response Examples

* `GET /api/docs`:
  + Request: `curl -X GET https://readit-4.onrender.com/api/docs`
  + Response: `{"api": {"version": "1.0.0", "endpoints": [...]}}`
* `POST /api/auth/github`:
  + Request: `curl -X POST https://readit-4.onrender.com/api/auth/github -H "Content-Type: application/json" -d '{"code": "github_code"}'`
  + Response: `{"token": "jwt_token"}`

---

## 🚀 Deployment

### Production Deployment

* Use a cloud platform (e.g., Render, Vercel)
* Set environment variables: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
* Deploy the application: `npm run deploy`

### Development Deployment

* Use a local development environment (e.g., Node.js, npm)
* Set environment variables: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
* Start the application: `npm start`

---

## 📈 Contributing

* Fork the repository: `git fork https://github.com/kaihere14/ReadIt.git`
* Create a new branch: `git branch feature/new-feature`
* Make changes: `git add .`, `git commit -m "New feature"`
* Open a pull request: <https://github.com/kaihere14/ReadIt/pulls>

---

## 📝 License

* ISC License: <https://github.com/kaihere14/ReadIt/blob/main/LICENSE>

---

## 🙏 Acknowledgments

* Groq's LLaMA 3.3 70B model: <https://groq.com>
* GitHub OAuth 2.0: <https://github.com/settings/applications/new>
* BullMQ: <https://github.com/OptimalBits/bull>
* Redis: <https://redis.io>