import prisma from "../../config/db";

// Get monthly token stats for a user
export const getMonthlyTokenStats = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const stats = await prisma.token_usage.aggregate({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      input_tokens: true,
      output_tokens: true,
      cost: true,
    },
    _avg: {
      latency_ms: true,
    },
    _count: true,
  });

  return {
    total_input_tokens: stats._sum.input_tokens || 0,
    total_output_tokens: stats._sum.output_tokens || 0,
    total_tokens: (stats._sum.input_tokens || 0) + (stats._sum.output_tokens || 0),
    total_cost: stats._sum.cost || 0,
    avg_latency_ms: Math.round(stats._avg.latency_ms || 0),
    total_requests: stats._count,
    period: {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
    },
  };
};

// Get total projects count for a user
export const getUserProjectsCount = async (userId: string) => {
  return prisma.projects.count({
    where: {
      OR: [
        { created_by: userId },
        { project_users: { some: { user_id: userId } } },
      ],
    },
  });
};

// Get total prompts count for a user
export const getUserPromptsCount = async (userId: string) => {
  return prisma.prompts.count({
    where: {
      projects: {
        OR: [
          { created_by: userId },
          { project_users: { some: { user_id: userId } } },
        ],
      },
    },
  });
};

// Get total commits count for a user
export const getUserCommitsCount = async (userId: string) => {
  return prisma.commits.count({
    where: { created_by: userId },
  });
};
