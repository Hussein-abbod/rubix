import { Router, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

router.get("/stats", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.userId } },
        status: { not: "archived" },
      },
    });

    const projectIds = projects.map((p) => p.id);

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "active").length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const completedThisWeek = await prisma.section.count({
      where: {
        projectId: { in: projectIds },
        status: "completed",
        updatedAt: { gte: weekAgo },
      },
    });

    const overdueTasks = await prisma.section.count({
      where: {
        projectId: { in: projectIds },
        status: { not: "completed" },
        deadline: { lt: new Date() },
      },
    });

    res.json({ totalProjects, activeProjects, completedThisWeek, overdueTasks });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/upcoming-deadlines", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.userId } },
        status: { not: "archived" },
      },
    });
    const projectIds = projects.map((p) => p.id);

    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);

    const sections = await prisma.section.findMany({
      where: {
        projectId: { in: projectIds },
        deadline: { gte: new Date(), lte: sevenDays },
        status: { not: "completed" },
      },
      orderBy: { deadline: "asc" },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
      take: 10,
    });

    const mapped = sections.map((s) => ({
      ...s,
      _id: s.id,
      projectId: { ...s.project, _id: s.project.id }, // Mongoose populated format
      assignedTo: s.assignee ? { ...s.assignee, _id: s.assignee.id } : null,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deadlines" });
  }
});

router.get("/recent-activity", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.userId } },
        status: { not: "archived" },
      },
    });
    const projectIds = projects.map((p) => p.id);

    const sections = await prisma.section.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });

    const activity = sections.map((s) => ({
      _id: s.id,
      type: "section_updated",
      message: `"${s.heading}" updated`,
      timestamp: s.updatedAt,
      icon: "edit",
    }));

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

router.get("/my-tasks", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sections = await prisma.section.findMany({
      where: {
        assignedTo: req.userId,
        status: { not: "completed" },
      },
      orderBy: { deadline: "asc" },
      take: 10,
      include: {
        project: { select: { id: true, name: true } },
      },
    });
    
    // Convert to mongoose-like format for frontend
    const mapped = sections.map((s) => ({
      ...s,
      _id: s.id,
      projectId: s.project,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

export default router;
