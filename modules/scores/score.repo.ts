import prisma from "../../config/db";

export const createScore = async (data: {
  commit_id: string;
  score: number;
  scorer: string;
  reference_prompt?: string;
  actual_prompt?: string;
  reasoning?: string;
}) => {
  return prisma.scores.create({
    data,
  });
};

export const getScoreById = async (id: string) => {
  return prisma.scores.findUnique({
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

export const getAllScores = async () => {
  return prisma.scores.findMany({
    include: {
      commits: {
        select: { id: true, commit_message: true },
      },
    },
  });
};

export const getScoresByCommitId = async (commitId: string) => {
  return prisma.scores.findMany({
    where: { commit_id: commitId },
  });
};

export const getScoresByScorer = async (scorer: string) => {
  return prisma.scores.findMany({
    where: { scorer },
    include: {
      commits: {
        select: { id: true, commit_message: true },
      },
    },
  });
};

export const updateScore = async (
  id: string,
  data: {
    score?: number;
    reasoning?: string;
    reference_prompt?: string;
    actual_prompt?: string;
  }
) => {
  return prisma.scores.update({
    where: { id },
    data,
  });
};

export const deleteScore = async (id: string) => {
  return prisma.scores.delete({
    where: { id },
  });
};

export const getAverageScoreByCommitId = async (commitId: string) => {
  const result = await prisma.scores.aggregate({
    where: { commit_id: commitId },
    _avg: { score: true },
    _count: { score: true },
  });
  return {
    average: result._avg.score,
    count: result._count.score,
  };
};

export const getScoresAboveThreshold = async (threshold: number) => {
  return prisma.scores.findMany({
    where: {
      score: { gte: threshold },
    },
    include: {
      commits: {
        select: { id: true, commit_message: true },
      },
    },
  });
};
