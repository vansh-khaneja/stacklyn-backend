import * as scoreRepo from "./score.repo";

export const createScore = async (data: {
  commit_id: string;
  score: number;
  scorer: string;
  reference_prompt?: string;
  actual_prompt?: string;
  reasoning?: string;
}) => {
  if (data.score < 0 || data.score > 1) {
    throw new Error("Score must be between 0 and 1");
  }
  return scoreRepo.createScore(data);
};

export const getScoreById = async (id: string) => {
  const score = await scoreRepo.getScoreById(id);
  if (!score) {
    throw new Error("Score not found");
  }
  return score;
};

export const getAllScores = async () => {
  return scoreRepo.getAllScores();
};

export const getScoresByCommitId = async (commitId: string) => {
  return scoreRepo.getScoresByCommitId(commitId);
};

export const getScoresByScorer = async (scorer: string) => {
  return scoreRepo.getScoresByScorer(scorer);
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
  await getScoreById(id);
  if (data.score !== undefined && (data.score < 0 || data.score > 1)) {
    throw new Error("Score must be between 0 and 1");
  }
  return scoreRepo.updateScore(id, data);
};

export const deleteScore = async (id: string) => {
  await getScoreById(id);
  return scoreRepo.deleteScore(id);
};

export const getAverageScoreByCommitId = async (commitId: string) => {
  return scoreRepo.getAverageScoreByCommitId(commitId);
};

export const getScoresAboveThreshold = async (threshold: number) => {
  if (threshold < 0 || threshold > 1) {
    throw new Error("Threshold must be between 0 and 1");
  }
  return scoreRepo.getScoresAboveThreshold(threshold);
};

export const getScoresByUserId = async (userId: string) => {
  return scoreRepo.getScoresByUserId(userId);
};
