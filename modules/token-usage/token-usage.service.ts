import * as tokenUsageRepo from "./token-usage.repo";
import { calculateCost } from "../../utils/pricing.utils";

export const createTokenUsage = async (data: {
  user_id?: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  system_prompt?: string;
  user_query?: string;
  response?: string;
  status?: string;
}) => {
  return tokenUsageRepo.createTokenUsage(data);
};

export const getTokenUsageById = async (id: string) => {
  const usage = await tokenUsageRepo.getTokenUsageById(id);
  if (!usage) {
    throw new Error("Token usage record not found");
  }
  return usage;
};

export const getAllTokenUsage = async () => {
  return tokenUsageRepo.getAllTokenUsage();
};

export const getTokenUsageByUserId = async (
  userId: string,
  limit: number = 10,
  offset: number = 0,
  fromDate?: Date,
  toDate?: Date,
  model?: string,
  status?: string
) => {
  return tokenUsageRepo.getTokenUsageByUserId(userId, limit, offset, fromDate, toDate, model, status);
};

export const getTokenUsageByModel = async (modelName: string) => {
  return tokenUsageRepo.getTokenUsageByModel(modelName);
};

export const getTokenUsageStats = async (userId?: string) => {
  return tokenUsageRepo.getTokenUsageStats(userId);
};

// Log token usage from an LLM call
export const logTokenUsage = async (data: {
  user_id?: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms?: number;
  system_prompt?: string;
  user_query?: string;
  response?: string;
  status: string;
}) => {
  const cost = calculateCost(data.model_name, data.input_tokens, data.output_tokens);
  return tokenUsageRepo.createTokenUsage({ ...data, cost });
};
