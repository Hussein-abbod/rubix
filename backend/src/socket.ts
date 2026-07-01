import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import prisma from "./config/db";

export function setupSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const projectId = socket.handshake.query.projectId as string;
    const userId = socket.handshake.query.userId as string;

    if (projectId) {
      socket.join(`project:${projectId}`);
    }

    // Section locking
    socket.on("section:lock", async (data: { sectionId: string }) => {
      try {
        const section = await prisma.section.findUnique({ where: { id: data.sectionId } });
        if (section && !section.lockedBy) {
          await prisma.section.update({
            where: { id: data.sectionId },
            data: { lockedBy: userId, lockedAt: new Date() },
          });

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, avatar: true },
          });

          io.to(`project:${projectId}`).emit("section:locked", {
            sectionId: data.sectionId,
            userId,
            userName: user?.name || "Someone",
            userAvatar: user?.avatar,
          });
        }
      } catch (err) {
        console.error("Lock error:", err);
      }
    });

    socket.on("section:unlock", async (data: { sectionId: string }) => {
      try {
        const section = await prisma.section.findUnique({ where: { id: data.sectionId } });
        if (section && section.lockedBy === userId) {
          await prisma.section.update({
            where: { id: data.sectionId },
            data: { lockedBy: null, lockedAt: null },
          });

          io.to(`project:${projectId}`).emit("section:unlocked", {
            sectionId: data.sectionId,
          });
        }
      } catch (err) {
        console.error("Unlock error:", err);
      }
    });

    // Content updates
    socket.on("section:content", async (data: { sectionId: string; content: object }) => {
      try {
        // We will store content as string in DB since it's LongText or JSON. Let's serialize if needed, 
        // assuming schema is String for content (LongText)
        await prisma.section.update({
          where: { id: data.sectionId },
          data: { content: JSON.stringify(data.content) },
        });

        socket.to(`project:${projectId}`).emit("section:contentUpdated", {
          sectionId: data.sectionId,
          content: data.content,
        });
      } catch (err) {
        console.error("Content update error:", err);
      }
    });

    // Status changes
    socket.on("section:status", async (data: { sectionId: string; status: string }) => {
      try {
        await prisma.section.update({
          where: { id: data.sectionId },
          data: { status: data.status },
        });

        io.to(`project:${projectId}`).emit("section:statusChanged", {
          sectionId: data.sectionId,
          status: data.status,
        });
      } catch (err) {
        console.error("Status update error:", err);
      }
    });

    socket.on("disconnect", () => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
}
