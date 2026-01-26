import prisma from "../../config/db";
import { Prisma } from "@prisma/client";

export const createRun = async (data: {
  commit_id: string;
  model_name: string;
  response?: string;
  latency_ms?: number;
  token_usage?: Prisma.InputJsonValue;
  status?: string;
}) => {
  return prisma.prompt_runs.create({
    data,
  });
};

export const getRunById = async (id: string) => {
  return prisma.prompt_runs.findUnique({
    where: { id },
    include: {
      commits: {
        select: {
          id: true,
          commit_message: true,
          system_prompt: true,
          user_query: true,
        },
      },
    },
  });
};

export const getAllRuns = async () => {
  return prisma.prompt_runs.findMany({
    include: {
      commits: {
        select: { id: true, commit_message: true },
      },
    },
  });
};

export const getRunsByCommitId = async (commitId: string) => {
  return prisma.prompt_runs.findMany({
    where: { commit_id: commitId },
  });
};

export const getRunsByModelName = async (modelName: string) => {
  return prisma.prompt_runs.findMany({
    where: { model_name: modelName },
    include: {
      commits: {
        select: { id: true, commit_message: true },
      },
    },
  });
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
  return prisma.prompt_runs.update({
    where: { id },
    data,
  });
};

export const deleteRun = async (id: string) => {
  return prisma.prompt_runs.delete({
    where: { id },
  });
};

export const getRunsByStatus = async (status: string) => {
  return prisma.prompt_runs.findMany({
    where: { status },
    include: {
      commits: {
        select: { id: true, commit_message: true },
      },
    },
  });
};
