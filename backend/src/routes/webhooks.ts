import { Router, Request, Response } from "express";
import prisma from "../config/db";

const router = Router();

router.post("/clerk", async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";
      const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || email;
      const avatar = data.image_url;

      await prisma.user.upsert({
        where: { clerkId },
        update: { email, name, avatar },
        create: { clerkId, email, name, avatar },
      });
    }

    if (type === "user.deleted") {
      await prisma.user.delete({
        where: { clerkId: data.id }
      }).catch(() => {}); // Ignore if user not found
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
