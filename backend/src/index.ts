import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { connectDB } from "./config/db";
import { setupSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any localhost port during development
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    // Allow the configured FRONTEND_URL in production
    if (origin === (process.env.FRONTEND_URL || "http://localhost:5173")) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// Routes
import webhooksRouter from "./routes/webhooks";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import projectsRouter from "./routes/projects";
import sectionsRouter from "./routes/sections";
import dashboardRouter from "./routes/dashboard";
import integrationsRouter from "./routes/integrations";
import uploadRouter from "./routes/upload";

app.use("/api/webhooks", webhooksRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api", sectionsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/integrations", integrationsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Setup WebSocket
setupSocket(httpServer);

// Connect DB and start server
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Rubix API running on http://localhost:${PORT}`);
  });
});
