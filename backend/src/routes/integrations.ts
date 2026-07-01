import { Router, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

// Integration status
router.get("/status", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({
    google: {
      connected: user?.googleCalendarConnected || false,
      email: user?.googleEmail || null,
    },
    webex: {
      connected: user?.webexConnected || false,
      name: user?.webexPersonEmail || null,
    },
  });
});

// Google Calendar
router.get("/google/auth-url", requireAuth, async (req: AuthRequest, res: Response) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent`;
  res.json({ url });
});

router.post("/google/callback", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const data: any = await response.json();

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        googleCalendarConnected: true,
        googleRefreshToken: data.refresh_token,
        googleEmail: data.email || null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Google OAuth failed" });
  }
});

router.post("/google/disconnect", requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.userId },
    data: {
      googleCalendarConnected: false,
      googleRefreshToken: null,
      googleEmail: null,
    },
  });
  res.json({ success: true });
});

router.put("/google/preferences", requireAuth, async (req: AuthRequest, res: Response) => {
  // Not implemented in schema yet - ignore for now to match behavior
  res.json({ success: true });
});

// Cisco Webex
router.get("/webex/auth-url", requireAuth, async (req: AuthRequest, res: Response) => {
  const url = `https://webexapis.com/v1/authorize?client_id=${process.env.WEBEX_CLIENT_ID}&redirect_uri=${process.env.WEBEX_REDIRECT_URI}&response_type=code&scope=spark:all&state=${req.userId}`;
  res.json({ url });
});

router.post("/webex/callback", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const response = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.WEBEX_CLIENT_ID!,
        client_secret: process.env.WEBEX_CLIENT_SECRET!,
        redirect_uri: process.env.WEBEX_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const data: any = await response.json();

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        webexConnected: true,
        webexAccessToken: data.access_token,
        webexRefreshToken: data.refresh_token,
        webexPersonEmail: data.email || null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Webex OAuth failed" });
  }
});

router.post("/webex/disconnect", requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.userId },
    data: {
      webexConnected: false,
      webexAccessToken: null,
      webexRefreshToken: null,
      webexPersonEmail: null,
    },
  });
  res.json({ success: true });
});

router.put("/webex/preferences", requireAuth, async (req: AuthRequest, res: Response) => {
  // Not implemented in schema yet - ignore for now to match behavior
  res.json({ success: true });
});

export default router;
