import prisma from "../../config/db";

export const getProjectByDisplayId = async (displayId: string) => {
  return prisma.projects.findUnique({
    where: { display_id: displayId },
  });
};

export const checkUserProjectAccess = async (userId: string, projectId: string) => {
  const membership = await prisma.project_users.findUnique({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });
  return !!membership;
};

export const getProdCommitByProjectId = async (projectId: string) => {
  // Find commit with "prod" tag in any prompt of this project
  const commit = await prisma.commits.findFirst({
    where: {
      prompts: {
        project_id: projectId,
      },
      commit_tags: {
        some: {
          tag_name: { equals: "prod", mode: "insensitive" },
        },
      },
    },
    select: {
      id: true,
      system_prompt: true,
      user_query: true,
      commit_message: true,
      created_at: true,
      prompts: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return commit;
};
