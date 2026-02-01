import * as v1Repo from "./v1.repo";

export const getProjectPrompt = async (displayId: string, userId: string) => {
  // Get project by display_id
  const project = await v1Repo.getProjectByDisplayId(displayId);

  if (!project) {
    throw new Error("Project not found");
  }

  // Check user has access to project
  const hasAccess = await v1Repo.checkUserProjectAccess(userId, project.id);

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Get commit with "prod" tag
  const commit = await v1Repo.getProdCommitByProjectId(project.id);

  if (!commit) {
    throw new Error("No production prompt found");
  }

  return {
    system_prompt: commit.system_prompt,
    prompt_name: commit.prompts.name,
    commit_message: commit.commit_message,
    updated_at: commit.created_at,
  };
};
