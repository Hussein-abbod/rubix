import { Router, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
        status: { not: "archived" },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    const mappedProjects = projects.map(p => ({
      ...p,
      _id: p.id,
      members: p.members.map(m => ({
        ...m,
        user: { ...m.user, _id: m.user.id },
      })),
    }));
    res.json(mappedProjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const isMember = project.members.some((m) => m.userId === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      ...project,
      _id: project.id,
      members: project.members.map(m => ({
        ...m,
        user: { ...m.user, _id: m.user.id },
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, deadline, sections, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: deadline ? new Date(deadline) : undefined,
        createdById: req.userId,
        members: {
          create: [
            { userId: req.userId, role: "owner" },
            ...(memberIds || [])
              .filter(Boolean)
              .map((idOrObj: any) => {
                const uid = typeof idOrObj === "string" ? idOrObj : (idOrObj.id || idOrObj._id);
                return uid ? { userId: uid, role: "editor" } : null;
              })
              .filter(Boolean),
          ],
        },
        documents: {
          create: [{ title: name }],
        },
      },
      include: {
        documents: true,
      },
    });

    const docId = project.documents[0].id;

    // Update project with masterDocumentId
    await prisma.project.update({
      where: { id: project.id },
      data: { masterDocumentId: docId },
    });

    if (sections?.length > 0) {
      await prisma.section.createMany({
        data: sections.map((s: any, i: number) => ({
          projectId: project.id,
          documentId: docId,
          heading: s.title || s.heading,
          wordCount: s.wordCount || 0,
          pageConstraints: s.pageConstraints,
          requirements: s.requirements,
          assignedTo: s.assignedTo || null,
          deadline: s.deadline ? new Date(s.deadline) : null,
          order: i,
          status: "todo",
        })),
      });
    }

    const populated = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });

    res.status(201).json({
      ...populated,
      _id: populated!.id,
      members: populated!.members.map(m => ({
        ...m,
        user: { ...m.user, _id: m.user.id },
      })),
    });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { members: true },
    });
    if (!project) return res.status(404).json({ error: "Not found" });

    const isOwner = project.members.some((m) => m.userId === req.userId && m.role === "owner");

    const { name, description, deadline, projectObjective, expectedOutcomes, status } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (projectObjective !== undefined) updateData.projectObjective = projectObjective;
    if (expectedOutcomes !== undefined) updateData.expectedOutcomes = expectedOutcomes;
    if (status !== undefined && isOwner) updateData.status = status;

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: updateData,
    });
    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { members: true },
    });
    if (!project) return res.status(404).json({ error: "Not found" });

    const isOwner = project.members.some((m) => m.userId === req.userId && m.role === "owner");
    if (!isOwner) return res.status(403).json({ error: "Only owner can delete" });

    await prisma.project.delete({ where: { id: project.id } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.put("/:id/archive", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { members: true },
    });
    if (!project) return res.status(404).json({ error: "Not found" });

    const isOwner = project.members.some((m) => m.userId === req.userId && m.role === "owner");
    if (!isOwner) return res.status(403).json({ error: "Only owner can archive" });

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { status: project.status === "archived" ? "active" : "archived" },
    });
    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to archive project" });
  }
});

router.put("/:id/invite", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { members: true },
    });
    if (!project) return res.status(404).json({ error: "Not found" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const alreadyMember = project.members.some((m) => m.userId === user.id);
    if (alreadyMember) return res.status(400).json({ error: "Already a member" });

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: role || "editor",
      },
    });

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      include: { members: { include: { user: true } } },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to invite member" });
  }
});

router.put("/:id/remove-member", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Not found" });

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: project.id, userId },
      },
    });

    await prisma.section.updateMany({
      where: { projectId: project.id, assignedTo: userId },
      data: { assignedTo: null },
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
});

router.get("/:id/members", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });
    if (!project) return res.status(404).json({ error: "Not found" });

    const sections = await prisma.section.findMany({
      where: { projectId: project.id },
    });

    const membersWithStats = project.members.map((m) => {
      const assignedSections = sections.filter((s) => s.assignedTo === m.userId);
      const completed = assignedSections.filter((s) => s.status === "completed").length;
      const overdue = assignedSections.filter(
        (s) => s.status !== "completed" && s.deadline && s.deadline < new Date()
      ).length;

      return {
        user: { ...m.user, _id: m.user.id },
        role: m.role,
        _id: m.id,
        id: m.id,
        stats: {
          assigned: assignedSections.length,
          completed,
          overdue,
        },
        completionRate:
          assignedSections.length > 0
            ? Math.round((completed / assignedSections.length) * 100)
            : 0,
      };
    });

    res.json(membersWithStats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

export default router;
