import { Prisma } from "@prisma/client";
import * as runRepo from "./run.repo";
import * as commitService from "../commits/commit.service";
import { callLLM, DEFAULT_MODEL } from "../../services/llm";

export const createRun = async (data: {
  commit_id: string;
  model_name: string;
  response?: string;
  latency_ms?: number;
  token_usage?: Prisma.InputJsonValue;
  status?: string;
}) => {
  return runRepo.createRun(data);
};

export const getRunById = async (id: string) => {
  const run = await runRepo.getRunById(id);
  if (!run) {
    throw new Error("Run not found");
  }
  return run;
};

export const getAllRuns = async () => {
  return runRepo.getAllRuns();
};

export const getRunsByCommitId = async (commitId: string) => {
  return runRepo.getRunsByCommitId(commitId);
};

export const getRunsByModelName = async (modelName: string) => {
  return runRepo.getRunsByModelName(modelName);
};

export const updateRun = async (
  id: string,
  data: {
    response?: string;
    latency_ms?: number;
    token_usage?: Prisma.InputJsonValue;
    status?: string;
  }
) => {
  await getRunById(id);
  return runRepo.updateRun(id, data);
};

export const deleteRun = async (id: string) => {
  await getRunById(id);
  return runRepo.deleteRun(id);
};

export const getRunsByStatus = async (status: string) => {
  return runRepo.getRunsByStatus(status);
};

// Execute a commit with an LLM and save the run
export const executeCommit = async (
  commitId: string,
  model: string = DEFAULT_MODEL
) => {
  // Get the commit
  const commit = await commitService.getCommitById(commitId);

  try {
    // Call LLM
    const llmResponse = await callLLM({
      system_prompt: commit.system_prompt,
      user_query: commit.user_query,
      model,
    });

    // Save the run
    const run = await runRepo.createRun({
      commit_id: commitId,
      model_name: llmResponse.model,
      response: llmResponse.content,
      latency_ms: llmResponse.latency_ms,
      token_usage: llmResponse.token_usage,
      status: "success",
    });

    return run;
  } catch (error: any) {
    // Save failed run
    const run = await runRepo.createRun({
      commit_id: commitId,
      model_name: model,
      response: error.message,
      status: "failed",
    });

    return run;
  }
};

export const getAvailableModels = () => {
  return import("../../services/llm").then((m) => m.getAvailableModels());
};

export const getRunsByUserId = async (userId: string) => {
  return runRepo.getRunsByUserId(userId);
};
