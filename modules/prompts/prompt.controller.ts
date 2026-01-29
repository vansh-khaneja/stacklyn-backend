import { Request, Response } from "express";
import * as promptService from "./prompt.service";
import {
  verifyPromptAccess,
  verifyProjectAccess,
  getUserProjectRole,
} from "../../utils/authorization.utils";
import { logActivity } from "../activities/activity.service";

export const createPrompt = async (req: Request, res: Response) => {
  try {
    const { name, project_id } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Viewers cannot create prompts
    const role = await getUserProjectRole(userId, project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied. You don't have access to this project." });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot create prompts." });
    }

    const prompt = await promptService.createPrompt({
      name,
      project_id,
      created_by: userId,
    });

    logActivity({
      userId,
      projectId: project_id,
      entityType: "prompt",
      entityId: prompt.id,
      action: "created",
      title: `Prompt created: '${prompt.name}'`,
    });

    res.status(201).json(prompt);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPromptById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to this prompt
    const hasAccess = await verifyPromptAccess(userId, id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const prompt = await promptService.getPromptById(id);
    res.json(prompt);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllPrompts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const prompts = await promptService.getPromptsByUserId(userId);
    res.json(prompts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPromptsByProjectId = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to the project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const prompts = await promptService.getPromptsByProjectId(projectId);
    res.json(prompts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePrompt = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get prompt to find project_id
    const existingPrompt = await promptService.getPromptById(id);

    // Viewers cannot update prompts
    const role = await getUserProjectRole(userId, existingPrompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot update prompts." });
    }

    const prompt = await promptService.updatePrompt(id, { name });

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "prompt",
      entityId: prompt.id,
      action: "updated",
      title: `Prompt updated: '${prompt.name}'`,
    });

    res.json(prompt);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePrompt = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get prompt to find project_id
    const prompt = await promptService.getPromptById(id);

    // Viewers cannot delete prompts
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot delete prompts." });
    }

    await promptService.deletePrompt(id);

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "prompt",
      entityId: id,
      action: "deleted",
      title: `Prompt deleted: '${prompt.name}'`,
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getPromptsByUserId = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Users can only view their own prompts
    if (userId !== targetUserId) {
      return res.status(403).json({ error: "Access denied. You can only view your own prompts." });
    }

    const prompts = await promptService.getPromptsByUserId(targetUserId);
    res.json(prompts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
