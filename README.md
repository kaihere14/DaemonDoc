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

- **Frontend**: Vite, React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI Model**: Groq's LLaMA 3.3 70B
- **API**: RESTful API

---

## 📊 API Documentation

### Endpoints

- **GET /api/docs**: Returns API documentation
- **POST /api/repos**: Creates a new repository
- **GET /api/repos**: Returns a list of repositories
- **GET /api/repos/:id**: Returns a repository by ID
- **PUT /api/repos/:id**: Updates a repository
- **DELETE /api/repos/:id**: Deletes a repository

### Request/Response Examples

```json
// Create a new repository
POST /api/repos HTTP/1.1
Content-Type: application/json

{
  "name": "My Repository",
  "description": "This is my repository"
}

// Response
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "My Repository",
  "description": "This is my repository"
}
```

---

## 🚀 Deployment

### Production Deployment

1. Clone the repository: `git clone https://github.com/kaihere14/ReadIt.git`
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Start the application: `npm start`

### Development Deployment

1. Clone the repository: `git clone https://github.com/kaihere14/ReadIt.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---

## 🤝 Contributing

Contributions are welcome! Please submit a pull request with your changes.

### Development Workflow

1. Fork the repository
2. Create a new branch: `git checkout -b my-branch`
3. Make changes: `git add .` and `git commit -m "My changes"`
4. Push changes: `git push origin my-branch`
5. Submit a pull request

---

## 📝 License

ReadIt is licensed under the ISC license.

---

## 🙏 Acknowledgments

Thanks to all contributors and maintainers of the project.

---

## 🤔 Troubleshooting

If you encounter any issues, please submit an issue on the GitHub repository.

### Common Issues

- **Error: Unable to connect to GitHub**: Check your GitHub credentials and try again.
- **Error: Unable to generate README**: Check your repository structure and try again.

---

## 📈 Roadmap

- **v1.0**: Initial release
- **v1.1**: Add support for multiple repositories
- **v1.2**: Improve AI model accuracy
- **v2.0**: Add support for custom templates

---

## 👥 Contributors

- **Kaihere14**: Creator and maintainer of the project

---

## 📚 README Generator

This README was generated using ReadIt. Try it out for your own projects!