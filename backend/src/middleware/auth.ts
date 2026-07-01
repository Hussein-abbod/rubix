import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rubix_secret_key";

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
