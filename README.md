# ReadIt
================

## Header & Badges
[![Build Status](https://travis-ci.org/kaihere14/ReadIt.svg?branch=main)](https://travis-ci.org/kaihere14/ReadIt)
[![Coverage Status](https://coveralls.io/repos/github/kaihere14/ReadIt/badge.svg?branch=main)](https://coveralls.io/github/kaihere14/ReadIt?branch=main)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/kaihere14/ReadIt.svg)](https://github.com/kaihere14/ReadIt/issues)

## Overview
ReadIt is a web application that integrates with GitHub to provide repository activity management. It allows users to connect their GitHub accounts, view their repositories, and manage activity on those repositories. The application is built using React, Node.js, and Express, and utilizes MongoDB for data storage.

## Features
* Connect to GitHub using OAuth
* View a list of connected GitHub repositories
* Manage activity on repositories
* Create webhooks for repositories to track activity
* Support for multiple repository owners
* Real-time updates for repository activity

### Unique Features
* **Repository Visualization**: ReadIt provides a visual representation of repository activity, making it easier to track changes and updates.
* **Customizable Webhooks**: Users can create custom webhooks to receive notifications for specific repository events.

## Tech Stack
* **Frontend**: React, Tailwind CSS
* **Backend**: Node.js, Express
* **Database**: MongoDB
* **Authentication**: OAuth (GitHub)

## Architecture
The application is designed as a microservices architecture, with separate services for the frontend, backend, and database. The frontend is built using React and utilizes the backend API for data retrieval and manipulation. The backend is built using Node.js and Express, and interacts with the database for data storage and retrieval.

### System Design
```markdown
+---------------+
|  Client   |
+---------------+
           |
           |
           v
+---------------+
|  Backend   |
|  (API)     |
+---------------+
           |
           |
           v
+---------------+
|  Database  |
|  (MongoDB) |
+---------------+
```

### Directory Structure
```markdown
├── client/
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── context/
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── pages/
│   └── vite.config.js
└── server/
    ├── package-lock.json
    ├── package.json
    └── src/
        ├── controllers/
        ├── db/
        ├── index.js
        ├── middlewares/
        ├── routes/
        ├── schema/
        ├── services/
        └── utils/
```

## Getting Started
To get started with the application, follow these steps:

### Prerequisites
* Node.js (>= 14.17.0)
* npm (>= 6.14.13)
* MongoDB (>= 4.4.3)
* GitHub account

### Installation
1. Clone the repository: `git clone https://github.com/kaihere14/ReadIt.git`
2. Navigate to the client directory: `cd client`
3. Install dependencies: `npm install`
4. Start the client development server: `npm run dev`
5. Navigate to the server directory: `cd server`
6. Install dependencies: `npm install`
7. Start the server: `npm start`

### Configuration
* **GitHub OAuth**: Create a GitHub OAuth application and add the client ID and client secret to the `server/src/config.js` file.
* **MongoDB**: Create a MongoDB database and add the connection string to the `server/src/config.js` file.

## Usage
To use the application, follow these steps:

1. Start the client and server development servers
2. Navigate to `http://localhost:3000` in your browser
3. Connect to GitHub using the OAuth button
4. View your connected repositories
5. Manage activity on your repositories

## API Endpoints
The server provides the following API endpoints:

### GET /github-repos
Returns a list of connected GitHub repositories for the authenticated user.

### POST /add-repo-activity
Creates a new repository activity for the authenticated user.

### GET /repo-activity
Returns a list of repository activities for the authenticated user.

## Contributing
To contribute to the project, please fork the repository and submit a pull request. Ensure that your code is formatted according to the project's coding standards and that all tests pass.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments
Thanks to the following contributors:

* [Your Name](https://github.com/your-username)

## Contact
For questions or issues, please contact [Your Email](mailto:your-email@example.com).

## Roadmap
* **v1.0.0**: Initial release with basic features
* **v1.1.0**: Add support for multiple repository owners
* **v1.2.0**: Implement real-time updates for repository activity

## Troubleshooting
* **Error: Unable to connect to GitHub**: Check your GitHub OAuth credentials and ensure that the client ID and client secret are correct.
* **Error: Unable to connect to MongoDB**: Check your MongoDB connection string and ensure that the database is running.