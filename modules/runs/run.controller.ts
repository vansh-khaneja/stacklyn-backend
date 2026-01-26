import { Request, Response } from "express";
import * as runService from "./run.service";

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

export const getAllRuns = async (_req: Request, res: Response) => {
  try {
    const runs = await runService.getAllRuns();
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
    const run = await runService.executeCommit(commit_id, model);
    res.status(201).json(run);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
