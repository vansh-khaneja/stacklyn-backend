import { Request, Response } from "express";
import * as promptService from "./prompt.service";
import {
  verifyPromptAccess,
  verifyProjectAccess,
} from "../../utils/authorization.utils";

export const createPrompt = async (req: Request, res: Response) => {
  try {
    const { name, project_id } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to the project before creating a prompt
    const hasAccess = await verifyProjectAccess(userId, project_id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied. You don't have access to this project." });
    }

    const prompt = await promptService.createPrompt({
      name,
      project_id,
      created_by: userId,
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

    // ✅ Verify user has access to this prompt
    const hasAccess = await verifyPromptAccess(userId, id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const prompt = await promptService.updatePrompt(id, { name });
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

    // ✅ Verify user has access to this prompt
    const hasAccess = await verifyPromptAccess(userId, id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    await promptService.deletePrompt(id);
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
