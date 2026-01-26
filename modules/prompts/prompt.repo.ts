import prisma from "../../config/db";

export const createPrompt = async (data: {
  name: string;
  project_id: string;
  created_by: string;
}) => {
  return prisma.prompts.create({
    data,
  });
};

export const getPromptById = async (id: string) => {
  return prisma.prompts.findUnique({
    where: { id },
    include: {
      commits: {
        include: {
          commit_tags: true,
        },
      },
    },
  });
};

export const getAllPrompts = async () => {
  return prisma.prompts.findMany({
    include: {
      projects: {
        select: { id: true, name: true },
      },
    },
  });
};

export const getPromptsByProjectId = async (projectId: string) => {
  return prisma.prompts.findMany({
    where: { project_id: projectId },
    include: {
      commits: true,
    },
  });
};

export const updatePrompt = async (id: string, data: { name?: string }) => {
  return prisma.prompts.update({
    where: { id },
    data,
  });
};

export const deletePrompt = async (id: string) => {
  return prisma.prompts.delete({
    where: { id },
  });
};

export const getPromptsByUserId = async (userId: string) => {
  return prisma.prompts.findMany({
    where: { created_by: userId },
    include: {
      projects: {
        select: { id: true, name: true },
      },
    },
  });
};
