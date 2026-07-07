# Rubix 🧩✨

> **Rubix** is a full-stack, real-time collaborative workspace and document editor. It empowers users to seamlessly create rich-text documents, manage tasks, and integrate with external platforms, all synced instantly across devices.

## 🎯 Problem / Motivation
Modern teams need a centralized hub for their ideas, documents, and workflows. Rubix aims to bridge the gap between simple note-taking apps and complex project management tools by providing a fast, intuitive, Notion-like editing experience backed by robust real-time synchronization and third-party integrations.

## 🌟 Key Features
- **Rich Text Editing**: A highly customizable Notion-style editor powered by Tiptap, supporting custom image uploads, tables, task lists, and formatting.
- **Real-Time Collaboration**: Built on WebSockets (`Socket.io`) to allow instantaneous document updates and live syncing across multiple clients.
- **Third-Party Integrations**: Seamlessly connect with external services using Google APIs and custom integration routes.
- **Advanced State Management**: Blistering fast frontend performance using Zustand for global state and React Query for server-state caching.
- **Drag & Drop Interface**: Intuitive block rearrangement and organization using `@hello-pangea/dnd`.
- **Secure Authentication**: JWT-based authentication with encrypted passwords (bcrypt) and protected API routes.

## 🛠️ Tech Stack

**Frontend**
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

**Backend & Database**
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)



## 📸 App Demo
### Video Walkthrough
<video src="video_demo/app_demo.mp4" controls="controls" muted="muted" width="100%"></video>

## 🚀 Setup Instructions

### 1. Installation
Install the dependencies for the root workspace, backend, and frontend:

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
*(Make sure to update your database connection string and JWT secrets inside `backend/.env`)*

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
Run both the frontend and backend concurrently from the root directory using a single command:

```bash
npm run dev
```

This will start:
- **Backend API & WebSocket server** (usually on port 3000 or 5000)
- **Frontend Vite application** (usually on port 5173)

## 🔌 Core Integrations
Rubix is built to be extensible. Key backend services include:
- **Authentication**: Secure login/registration flows via `backend/src/middleware/auth.ts`.
- **Editor Uploads**: Custom file upload handling via `Multer` connected to the Tiptap `CustomImage.tsx` extension.
- **External Integrations**: OAuth and third-party API syncing managed through `backend/src/routes/integrations.ts` using `googleapis`.
- **Cron Jobs**: Scheduled background tasks maintained by `node-cron`.

## 🔮 Future Improvements
- **AI Writing Assistant**: Integrate an LLM to help auto-complete paragraphs, summarize notes, or brainstorm ideas directly inside the editor.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for viewing, commenting, or editing specific documents.
- **Offline Support**: PWA capabilities caching the editor state when internet connection is lost, syncing automatically upon reconnection.
