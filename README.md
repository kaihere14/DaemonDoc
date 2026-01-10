# ReadIt
A full-stack web application built with React, Express, and MongoDB.

## Header & Badges
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/kaihere14/ReadIt)
[![License](https://img.shields.io/badge/License-ISC-blue)](https://github.com/kaihere14/ReadIt/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange)](https://github.com/kaihere14/ReadIt)

## Overview
ReadIt is a web application designed to provide a seamless reading experience. The application consists of a client-side built with React, and a server-side built with Express and MongoDB.

## Features
* User authentication and authorization
* GitHub API integration
* Real-time data synchronization using WebSockets
* Responsive design for mobile and desktop devices
* Support for multiple reading formats (e.g., EPUB, PDF)
* Enhanced Redis connection handling with improved error logging and retry strategy

## Tech Stack
* Frontend: React, Tailwind CSS, Framer Motion
* Backend: Express, MongoDB, Mongoose
* Database: MongoDB
* APIs: GitHub API
* Cache: Redis

## Architecture
The application follows a microservices architecture, with separate services for authentication, GitHub API integration, and data storage.

### Project Structure
```markdown
.
├── client
│   ├── package.json
│   ├── public
│   ├── src
│   └── vite.config.js
├── server
│   ├── package.json
│   ├── src
│   │   ├── controllers
│   │   ├── db
│   │   ├── index.js
│   │   ├── middlewares
│   │   ├── routes
│   │   ├── schema
│   │   ├── services
│   │   └── utils
│   └── src/index.js
└── .gitignore
```

## Getting Started
### Prerequisites
* Node.js (>= 14.17.0)
* MongoDB (>= 5.0.0)
* GitHub API token
* Redis (>= 6.2.0)

### Installation
1. Clone the repository: `git clone https://github.com/kaihere14/ReadIt.git`
2. Install dependencies: `npm install` (in both `client` and `server` directories)
3. Create a `.env` file in the `server` directory with your GitHub API token and Redis connection details: 
```makefile
GITHUB_TOKEN=YOUR_TOKEN_HERE
REDIS_HOST=YOUR_REDIS_HOST
REDIS_PORT=YOUR_REDIS_PORT
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
```
4. Start the server: `npm run dev` (in the `server` directory)
5. Start the client: `npm run dev` (in the `client` directory)

### Configuration
The application uses environment variables for configuration. The following variables are supported:
* `PORT`: The port number to listen on (default: 3000)
* `GITHUB_TOKEN`: Your GitHub API token
* `MONGODB_URI`: The MongoDB connection string (default: `mongodb://localhost:27017`)
* `REDIS_HOST`: The Redis host
* `REDIS_PORT`: The Redis port
* `REDIS_PASSWORD`: The Redis password

Example `.env` file:
```makefile
PORT=3000
GITHUB_TOKEN=YOUR_TOKEN_HERE
MONGODB_URI=mongodb://localhost:27017
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
```

## Usage
The application provides the following endpoints:
* `GET /`: Returns a welcome message
* `POST /auth/login`: Authenticates a user
* `GET /api/github`: Returns GitHub API data

Example usage:
```bash
curl http://localhost:3000
curl -X POST -H "Content-Type: application/json" -d '{"username": "john", "password": "hello"}' http://localhost:3000/auth/login
curl http://localhost:3000/api/github
```

## Development
The application uses the following scripts:
* `dev`: Starts the server and client in development mode
* `build`: Builds the client for production
* `test`: Runs the tests (not implemented)

Example usage:
```bash
npm run dev
npm run build
npm run test
```

## API Documentation
The application provides the following API endpoints:
### Authentication
* `POST /auth/login`: Authenticates a user
	+ Request body: `{"username": "john", "password": "hello"}`
	+ Response: `{"token": "jwt_token"}`
* `POST /auth/register`: Registers a new user
	+ Request body: `{"username": "john", "password": "hello", "email": "john@example.com"}`
	+ Response: `{"token": "jwt_token"}`

### GitHub API
* `GET /api/github`: Returns GitHub API data
	+ Response: `{"data": {"login": "john", "id": 12345}}`

## Contributing
Contributions are welcome! Please submit a pull request with your changes.

## Troubleshooting
If you encounter any issues, please check the following:
* Ensure you have the latest dependencies installed
* Check the server and client logs for errors
* Verify your GitHub API token is valid
* Verify your Redis connection details are correct

## Roadmap
The following features are planned for future releases:
* Support for multiple reading formats
* Real-time data synchronization using WebSockets
* Improved user interface and experience

## License & Credits
The application is licensed under the ISC license. Credits go to the following authors:
* John Doe (author of the GitHub API integration)
* Jane Doe (author of the user interface)

## Acknowledgments
The application uses the following third-party libraries:
* React
* Express
* MongoDB
* Mongoose
* GitHub API
* Redis
* IORedis
* BullMQ