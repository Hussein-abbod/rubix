# Rubix

This is the Rubix repository containing both the frontend and backend services.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm

## Getting Started

Follow these instructions to get the project running locally.

### 1. Installation

First, install the dependencies for the root workspace, backend, and frontend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

You will need to set up the environment variables for both the backend and frontend.

**Backend:**
```bash
cp backend/.env.example backend/.env
```
*(Make sure to update any database credentials or API keys in `backend/.env` if necessary)*

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

### 3. Database Setup

The backend uses Prisma ORM. Generate the Prisma client and push the schema to your database:

```bash
cd backend
npx prisma generate
npx prisma db push
cd ..
```

### 4. Running the App

You can run both the frontend and backend concurrently from the root directory using a single command:

```bash
npm run dev
```

This will start:
- Backend API server (usually on port 3000 or 5000 depending on `.env`)
- Frontend application (usually on port 5173 or 3000)

Enjoy building Rubix!
