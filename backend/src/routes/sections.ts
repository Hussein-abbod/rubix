import { Router, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

const pid = (req: AuthRequest) => req.params.projectId as string;
const sid = (req: AuthRequest) => req.params.id as string;

router.get("/projects/:projectId/sections", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sections = await prisma.section.findMany({
      where: { projectId: pid(req) },
      orderBy: { order: "asc" },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    // Frontend expects `assignedTo` to be the populated object like mongoose did: `populate("assignedTo")`
    // We can map over and set `assignedTo` to the assignee object to maintain frontend compatibility.
    const mapped = sections.map(s => ({
      ...s,
      // Parse content from JSON string back to object for Tiptap
      content: s.content ? (() => { try { return JSON.parse(s.content); } catch { return s.content; } })() : null,
      assignedTo: s.assignee ? { ...s.assignee, _id: s.assignee.id } : null,
      _id: s.id,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

router.post("/projects/:projectId/sections", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { heading, wordCount, pageConstraints, requirements, assignedTo, deadline } = req.body;

    const count = await prisma.section.count({ where: { projectId: pid(req) } });
    
    // We need a documentId. The project should have one.
    const project = await prisma.project.findUnique({
      where: { id: pid(req) },
      include: { documents: true }
    });

    let docId = project?.masterDocumentId;
    if (!docId && project?.documents.length) {
      docId = project.documents[0].id;
    }

    if (!docId) {
      return res.status(400).json({ error: "No document found for project" });
    }

    const section = await prisma.section.create({
      data: {
        projectId: pid(req),
        documentId: docId,
        heading,
        wordCount: wordCount || 0,
        pageConstraints,
        requirements,
        assignedTo: assignedTo || null,
        deadline: deadline ? new Date(deadline) : null,
        order: count,
        status: "todo",
      },
    });

    res.status(201).json({ ...section, _id: section.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create section" });
  }
});

router.put("/sections/:id", requireAuth, async (req: AuthRequest, res: Response) => {  // accessible at /api/sections/:id
  try {
    const { heading, content, wordCount, pageConstraints, requirements, assignedTo, deadline, status, order } = req.body;

    const section = await prisma.section.findUnique({ where: { id: sid(req) } });
    if (!section) return res.status(404).json({ error: "Section not found" });

    const updateData: any = {};
    if (heading !== undefined) updateData.heading = heading;
    // Stringify JSON content (Tiptap) to store as LongText in MySQL
    if (content !== undefined) updateData.content = typeof content === "object" ? JSON.stringify(content) : content;
    if (wordCount !== undefined) updateData.wordCount = wordCount;
    if (pageConstraints !== undefined) updateData.pageConstraints = pageConstraints;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) updateData.status = status;
    if (order !== undefined) updateData.order = order;

    const updated = await prisma.section.update({
      where: { id: section.id },
      data: updateData,
    });

    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to update section" });
  }
});

router.put("/sections/:id/assign", requireAuth, async (req: AuthRequest, res: Response) => {  // accessible at /api/sections/:id/assign
  try {
    const { assignedTo } = req.body;
    const section = await prisma.section.update({
      where: { id: sid(req) },
      data: { assignedTo: assignedTo || null },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    const assignee = section.assignee ? { ...section.assignee, _id: section.assignee.id } : null;
    res.json({ ...section, assignedTo: assignee, _id: section.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign section" });
  }
});

router.put("/sections/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {  // accessible at /api/sections/:id/status
  try {
    const { status } = req.body;
    const section = await prisma.section.update({
      where: { id: sid(req) },
      data: { status },
    });
    res.json({ ...section, _id: section.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/sections/:id", requireAuth, async (req: AuthRequest, res: Response) => {  // accessible at /api/sections/:id
  try {
    await prisma.section.delete({ where: { id: sid(req) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete section" });
  }
});

router.put("/sections/reorder", requireAuth, async (req: AuthRequest, res: Response) => {  // accessible at /api/sections/reorder
  try {
    const { sectionIds } = req.body;
    for (let i = 0; i < sectionIds.length; i++) {
      await prisma.section.update({
        where: { id: sectionIds[i] },
        data: { order: i },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to reorder sections" });
  }
});

router.put("/sections/bulk-assign", requireAuth, async (req: AuthRequest, res: Response) => {  // accessible at /api/sections/bulk-assign
  try {
    const { assignments } = req.body;
    for (const a of assignments) {
      await prisma.section.update({
        where: { id: a.sectionId },
        data: { assignedTo: a.userId || null },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to bulk assign" });
  }
});

export default router;
