import { Request, Response } from "express";
import * as promptService from "./prompt.service";

export const createPrompt = async (req: Request, res: Response) => {
  try {
    const { name, project_id, created_by } = req.body;
    const prompt = await promptService.createPrompt({
      name,
      project_id,
      created_by,
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
    const prompt = await promptService.getPromptById(id);
    res.json(prompt);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllPrompts = async (_req: Request, res: Response) => {
  try {
    const prompts = await promptService.getAllPrompts();
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
    const { userId } = req.params;
    const prompts = await promptService.getPromptsByUserId(userId);
    res.json(prompts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
