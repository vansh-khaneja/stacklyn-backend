import prisma from "../../config/db";

export const createCommit = async (data: {
  prompt_id: string;
  system_prompt: string;
  user_query: string;
  commit_message?: string;
  created_by: string;
}) => {
  return prisma.commits.create({
    data,
  });
};

export const getCommitById = async (id: string) => {
  return prisma.commits.findUnique({
    where: { id },
    include: {
      commit_tags: true,
      prompt_runs: true,
      scores: true,
    },
  });
};

export const getAllCommits = async () => {
  return prisma.commits.findMany({
    include: {
      commit_tags: true,
    },
  });
};

export const getCommitsByPromptId = async (promptId: string) => {
  return prisma.commits.findMany({
    where: { prompt_id: promptId },
    include: {
      commit_tags: true,
      prompt_runs: true,
      scores: true,
    },
  });
};

export const updateCommit = async (
  id: string,
  data: {
    system_prompt?: string;
    user_query?: string;
    commit_message?: string;
  }
) => {
  return prisma.commits.update({
    where: { id },
    data,
  });
};

export const deleteCommit = async (id: string) => {
  return prisma.commits.delete({
    where: { id },
  });
};

export const addTagToCommit = async (commitId: string, tagName: string) => {
  return prisma.commit_tags.create({
    data: {
      commit_id: commitId,
      tag_name: tagName,
    },
  });
};

export const removeTagFromCommit = async (commitId: string, tagName: string) => {
  return prisma.commit_tags.delete({
    where: {
      commit_id_tag_name: {
        commit_id: commitId,
        tag_name: tagName,
      },
    },
  });
};

export const getCommitsByUserId = async (userId: string) => {
  return prisma.commits.findMany({
    where: { created_by: userId },
    include: {
      commit_tags: true,
    },
  });
};
