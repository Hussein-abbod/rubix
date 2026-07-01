import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/", upload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ fileId: req.file.filename, originalName: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
