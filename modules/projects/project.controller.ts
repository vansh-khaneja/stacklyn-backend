import { Request, Response } from "express";
import * as projectService from "./project.service";
import {
  verifyProjectAccess,
  verifyProjectOwnership,
} from "../../utils/authorization.utils";
import { logActivity } from "../activities/activity.service";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req as any).userId; // DB user UUID

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const project = await projectService.createProject({
      name,
      description,
      created_by: userId, // Use DB user UUID
    });

    logActivity({
      userId,
      projectId: project.id,
      entityType: "project",
      entityId: project.id,
      action: "created",
      title: `Project created: '${project.name}'`,
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const project = await projectService.getProjectById(id);
    res.json(project);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // DB user UUID

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Filter projects by the authenticated user's DB UUID
    const projects = await projectService.getProjectsByUserId(userId);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user owns this project (only owner can update)
    const isOwner = await verifyProjectOwnership(userId, id);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied. Only project owner can update the project." });
    }

    const project = await projectService.updateProject(id, { name, description });

    logActivity({
      userId,
      projectId: project.id,
      entityType: "project",
      entityId: project.id,
      action: "updated",
      title: `Project updated: '${project.name}'`,
    });

    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user owns this project (only owner can delete)
    const isOwner = await verifyProjectOwnership(userId, id);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied. Only project owner can delete the project." });
    }

    const project = await projectService.getProjectById(id);
    await projectService.deleteProject(id);

    logActivity({
      userId,
      entityType: "project",
      entityId: id,
      action: "deleted",
      title: `Project deleted: '${project.name}'`,
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getProjectMembers = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const members = await projectService.getProjectMembers(id);
    res.json(members);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const addProjectMember = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { userId: memberUserId, role } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user owns this project (only owner can add members)
    const isOwner = await verifyProjectOwnership(userId, id);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied. Only project owner can add members." });
    }

    const member = await projectService.addProjectMember(id, memberUserId, role);

    logActivity({
      userId,
      projectId: id,
      entityType: "member",
      entityId: memberUserId,
      action: "created",
      title: `Member added to project`,
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeProjectMember = async (
  req: Request<{ id: string; userId: string }>,
  res: Response
) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user owns this project (only owner can remove members)
    const isOwner = await verifyProjectOwnership(userId, id);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied. Only project owner can remove members." });
    }

    await projectService.removeProjectMember(id, memberUserId);

    logActivity({
      userId,
      projectId: id,
      entityType: "member",
      entityId: memberUserId,
      action: "deleted",
      title: `Member removed from project`,
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getProjectsByUserId = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Users can only view their own projects
    if (userId !== targetUserId) {
      return res.status(403).json({ error: "Access denied. You can only view your own projects." });
    }

    const projects = await projectService.getProjectsByUserId(targetUserId);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProjectMemberByEmail = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user owns this project (only owner can add members)
    const isOwner = await verifyProjectOwnership(userId, id);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied. Only project owner can add members." });
    }

    const member = await projectService.addProjectMemberByEmail(id, email, role);

    logActivity({
      userId,
      projectId: id,
      entityType: "member",
      entityId: member.user_id,
      action: "created",
      title: `Member added to project`,
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyMemberships = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const memberships = await projectService.getMembershipsByUserId(userId);
    res.json(memberships);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMemberRole = async (
  req: Request<{ id: string; userId: string }>,
  res: Response
) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const { role } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Only project owner can update member roles
    const isOwner = await verifyProjectOwnership(userId, id);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied. Only project owner can update member roles." });
    }

    const member = await projectService.updateMemberRole(id, memberUserId, role);

    logActivity({
      userId,
      projectId: id,
      entityType: "member",
      entityId: memberUserId,
      action: "updated",
      title: `Member role updated`,
    });

    res.json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
