import * as promptRepo from "./prompt.repo";

export const createPrompt = async (data: {
  name: string;
  project_id: string;
  created_by: string;
}) => {
  return promptRepo.createPrompt(data);
};

export const getPromptById = async (id: string) => {
  const prompt = await promptRepo.getPromptById(id);
  if (!prompt) {
    throw new Error("Prompt not found");
  }
  return prompt;
};

export const getAllPrompts = async () => {
  return promptRepo.getAllPrompts();
};

export const getPromptsByProjectId = async (projectId: string) => {
  return promptRepo.getPromptsByProjectId(projectId);
};

export const updatePrompt = async (id: string, data: { name?: string }) => {
  await getPromptById(id);
  return promptRepo.updatePrompt(id, data);
};

export const deletePrompt = async (id: string) => {
  await getPromptById(id);
  return promptRepo.deletePrompt(id);
};

export const getPromptsByUserId = async (userId: string) => {
  return promptRepo.getPromptsByUserId(userId);
};
