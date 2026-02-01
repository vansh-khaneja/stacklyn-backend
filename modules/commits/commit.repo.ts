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

export const getCommitsByPromptId = async (
  promptId: string,
  limit: number = 9,
  offset: number = 0
) => {
  // Where clause: exclude commits that have version tags (v*.*.*)
  const where = {
    prompt_id: promptId,
    NOT: {
      commit_tags: {
        some: {
          tag_name: {
            startsWith: "v",
          },
        },
      },
    },
  };

  const [commits, total, prodCommit] = await Promise.all([
    // Get paginated commits (excluding versioned ones)
    prisma.commits.findMany({
      where,
      include: {
        commit_tags: true,
        prompt_runs: true,
              },
      orderBy: {
        created_at: "desc",
      },
      skip: offset,
      take: limit,
    }),
    // Get total count
    prisma.commits.count({ where }),
    // Get the current PROD commit
    prisma.commits.findFirst({
      where: {
        prompt_id: promptId,
        commit_tags: {
          some: {
            tag_name: "PROD",
          },
        },
      },
      include: {
        commit_tags: true,
        prompt_runs: true,
              },
    }),
  ]);

  return { commits, total, prodCommit };
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

// Remove a specific tag from all commits of a prompt
export const removeTagFromPromptCommits = async (promptId: string, tagName: string) => {
  return prisma.commit_tags.deleteMany({
    where: {
      tag_name: tagName,
      commits: {
        prompt_id: promptId,
      },
    },
  });
};

// Get all tags for commits of a specific prompt
export const getTagsForPrompt = async (promptId: string) => {
  const tags = await prisma.commit_tags.findMany({
    where: {
      commits: {
        prompt_id: promptId,
      },
    },
    select: {
      tag_name: true,
    },
  });
  return tags.map((t) => t.tag_name);
};

// Get all commits with version tags for a prompt (production releases)
export const getVersionedCommits = async (
  promptId: string,
  limit: number = 9,
  offset: number = 0
) => {
  const where = {
    prompt_id: promptId,
    commit_tags: {
      some: {
        tag_name: {
          startsWith: "v",
        },
      },
    },
  };

  const [commits, total] = await Promise.all([
    prisma.commits.findMany({
      where,
      include: {
        commit_tags: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.commits.count({ where }),
  ]);

  return { commits, total };
};

// Get the current main commit for a prompt
export const getMainCommitForPrompt = async (promptId: string) => {
  return prisma.commits.findFirst({
    where: {
      prompt_id: promptId,
      commit_tags: {
        some: {
          tag_name: "main",
        },
      },
    },
  });
};
