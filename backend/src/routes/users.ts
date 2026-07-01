import { Router, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, avatar: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user, _id: user.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.get("/search", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: req.userId },
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      },
      select: { name: true, email: true, avatar: true, id: true },
      take: 10,
    });

    res.json(users.map(u => ({ ...u, _id: u.id })));
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

router.put("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/me/preferences", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      emailNotifications: true,
      inAppNotifications: true,
      dailySummary: true,
      deadlineReminders: true,
      overdueAlerts: true,
    }
  });
  res.json(user || {});
});

router.put("/me/preferences", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
    });
    res.json({
      emailNotifications: user.emailNotifications,
      inAppNotifications: user.inAppNotifications,
      dailySummary: user.dailySummary,
      deadlineReminders: user.deadlineReminders,
      overdueAlerts: user.overdueAlerts,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
