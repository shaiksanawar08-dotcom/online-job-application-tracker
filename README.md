# Online Job Application Tracker

A full-stack web application to organize job applications, track application statuses, and export application data to CSV.

## Features

- Add and manage job applications
- Track application statuses
- Store application records in MongoDB
- Export application data to CSV
- React-based user interface
- Node.js and Express backend API

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database

### Installation

Clone the repository:

    git clone https://github.com/shaiksanawar08-dotcom/online-job-application-tracker.git
    cd online-job-application-tracker

Install backend dependencies:

    cd backend
    npm install

Create a private `backend/.env` file with your own configuration:

    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_own_secret_value

Never publish your real database credentials or secret keys.

Install frontend dependencies in a separate terminal:

    cd frontend
    npm install
    npm run dev

Use the local URL shown by Vite to open the application. Start the backend using the script configured in `backend/package.json`.

## Security

- Keep `.env` files private.
- Do not upload `node_modules`.
- Use your own MongoDB connection string.

## Author

Shaik Sanawar

GitHub: https://github.com/shaiksanawar08-dotcom
