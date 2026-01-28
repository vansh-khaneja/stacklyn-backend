import prisma from "../config/db";

/**
 * Verify if a user has access to a project (either as owner or member)
 */
export async function verifyProjectAccess(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.projects.findFirst({
    where: {
      id: projectId,
      OR: [
        { created_by: userId },
        { project_users: { some: { user_id: userId } } },
      ],
    },
  });

  return !!project;
}

/**
 * Verify if a user owns a project
 */
export async function verifyProjectOwnership(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.projects.findFirst({
    where: {
      id: projectId,
      created_by: userId,
    },
  });

  return !!project;
}

/**
 * Verify if a user has access to a prompt (via project access)
 */
export async function verifyPromptAccess(
  userId: string,
  promptId: string
): Promise<boolean> {
  const prompt = await prisma.prompts.findFirst({
    where: {
      id: promptId,
    },
    include: {
      projects: true,
    },
  });

  if (!prompt) {
    return false;
  }

  return verifyProjectAccess(userId, prompt.project_id);
}

/**
 * Verify if a user has access to a commit (via prompt/project access)
 */
export async function verifyCommitAccess(
  userId: string,
  commitId: string
): Promise<boolean> {
  const commit = await prisma.commits.findFirst({
    where: {
      id: commitId,
    },
    include: {
      prompts: {
        include: {
          projects: true,
        },
      },
    },
  });

  if (!commit) {
    return false;
  }

  return verifyProjectAccess(userId, commit.prompts.project_id);
}
