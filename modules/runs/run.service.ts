import { Prisma } from "@prisma/client";
import * as runRepo from "./run.repo";
import * as commitService from "../commits/commit.service";
import * as tokenUsageService from "../token-usage/token-usage.service";
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
  model: string = DEFAULT_MODEL,
  systemPromptOverride?: string,
  userQueryOverride?: string,
  userId?: string
) => {
  // Get the commit
  const commit = await commitService.getCommitById(commitId);

  // Use overrides if provided (these have variables already substituted), otherwise use commit values
  const system_prompt = systemPromptOverride ?? commit.system_prompt;
  const user_query = userQueryOverride ?? commit.user_query;

  try {
    // Call LLM
    console.log("Sending to model:", {
      system_prompt,
      user_query,
      model,
    });
    const llmResponse = await callLLM({
      system_prompt,
      user_query,
      model,
    });
    console.log("Received from model:", llmResponse);

    // Log token usage (non-blocking)
    tokenUsageService.logTokenUsage({
      user_id: userId,
      model_name: llmResponse.model,
      input_tokens: llmResponse.token_usage?.prompt_tokens || 0,
      output_tokens: llmResponse.token_usage?.completion_tokens || 0,
      latency_ms: llmResponse.latency_ms,
      system_prompt,
      user_query,
      response: llmResponse.content,
      status: "success",
    }).catch(err => console.error("Failed to log token usage:", err));

    // Save the run
    const run = await runRepo.createRun({
      commit_id: commitId,
      model_name: llmResponse.model,
      response: llmResponse.content,
      latency_ms: llmResponse.latency_ms,
      token_usage: llmResponse.token_usage,
      status: "success",
    });

    return { ...run, system_prompt, user_query };
  } catch (error: any) {
    // Log failed token usage (non-blocking)
    tokenUsageService.logTokenUsage({
      user_id: userId,
      model_name: model,
      input_tokens: 0,
      output_tokens: 0,
      system_prompt,
      user_query,
      response: error.message,
      status: "failed",
    }).catch(err => console.error("Failed to log token usage:", err));

    // Save failed run
    const run = await runRepo.createRun({
      commit_id: commitId,
      model_name: model,
      response: error.message,
      status: "failed",
    });

    return { ...run, system_prompt, user_query };
  }
};

export const getAvailableModels = () => {
  return import("../../services/llm").then((m) => m.getAvailableModels());
};

export const getRunsByUserId = async (userId: string) => {
  return runRepo.getRunsByUserId(userId);
};
