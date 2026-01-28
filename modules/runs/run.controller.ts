import { Request, Response } from "express";
import * as runService from "./run.service";
import * as commitService from "../commits/commit.service";
import * as promptService from "../prompts/prompt.service";
import { logActivity } from "../activities/activity.service";

export const createRun = async (req: Request, res: Response) => {
  try {
    const { commit_id, model_name, response, latency_ms, token_usage, status } =
      req.body;
    const run = await runService.createRun({
      commit_id,
      model_name,
      response,
      latency_ms,
      token_usage,
      status,
    });
    res.status(201).json(run);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRunById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const run = await runService.getRunById(id);
    res.json(run);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllRuns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const runs = await runService.getRunsByUserId(userId);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRunsByCommitId = async (
  req: Request<{ commitId: string }>,
  res: Response
) => {
  try {
    const { commitId } = req.params;
    const runs = await runService.getRunsByCommitId(commitId);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRunsByModelName = async (
  req: Request<{ modelName: string }>,
  res: Response
) => {
  try {
    const { modelName } = req.params;
    const runs = await runService.getRunsByModelName(modelName);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRun = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { response, latency_ms, token_usage, status } = req.body;
    const run = await runService.updateRun(id, {
      response,
      latency_ms,
      token_usage,
      status,
    });
    res.json(run);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRun = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    await runService.deleteRun(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getRunsByStatus = async (
  req: Request<{ status: string }>,
  res: Response
) => {
  try {
    const { status } = req.params;
    const runs = await runService.getRunsByStatus(status);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Execute a commit with an LLM
export const executeCommit = async (req: Request, res: Response) => {
  try {
    const { commit_id, model } = req.body;
    const userId = (req as any).userId;

    const commit = await commitService.getCommitById(commit_id);
    const prompt = await promptService.getPromptById(commit.prompt_id);
    const run = await runService.executeCommit(commit_id, model);

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "run",
      entityId: run.id,
      action: run.status === "success" ? "executed" : "failed",
      title: run.status === "success"
        ? `New evaluation run on '${prompt.name}'`
        : `Failed generation in '${prompt.name}'`,
    });

    res.status(201).json(run);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAvailableModels = async (_req: Request, res: Response) => {
  try {
    const models = await runService.getAvailableModels();
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
