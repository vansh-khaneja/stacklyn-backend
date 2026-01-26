import * as commitRepo from "./commit.repo";

export const createCommit = async (data: {
  prompt_id: string;
  system_prompt: string;
  user_query: string;
  commit_message?: string;
  created_by: string;
}) => {
  return commitRepo.createCommit(data);
};

export const getCommitById = async (id: string) => {
  const commit = await commitRepo.getCommitById(id);
  if (!commit) {
    throw new Error("Commit not found");
  }
  return commit;
};

export const getAllCommits = async () => {
  return commitRepo.getAllCommits();
};

export const getCommitsByPromptId = async (promptId: string) => {
  return commitRepo.getCommitsByPromptId(promptId);
};

export const updateCommit = async (
  id: string,
  data: {
    system_prompt?: string;
    user_query?: string;
    commit_message?: string;
  }
) => {
  await getCommitById(id);
  return commitRepo.updateCommit(id, data);
};

export const deleteCommit = async (id: string) => {
  await getCommitById(id);
  return commitRepo.deleteCommit(id);
};

export const addTagToCommit = async (commitId: string, tagId: string) => {
  await getCommitById(commitId);
  return commitRepo.addTagToCommit(commitId, tagId);
};

export const removeTagFromCommit = async (commitId: string, tagId: string) => {
  await getCommitById(commitId);
  return commitRepo.removeTagFromCommit(commitId, tagId);
};

export const getCommitsByUserId = async (userId: string) => {
  return commitRepo.getCommitsByUserId(userId);
};
