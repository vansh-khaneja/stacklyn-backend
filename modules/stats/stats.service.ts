import * as statsRepo from "./stats.repo";

export const getDashboardStats = async (userId: string) => {
  const [tokenStats, projectsCount, promptsCount, commitsCount] = await Promise.all([
    statsRepo.getMonthlyTokenStats(userId),
    statsRepo.getUserProjectsCount(userId),
    statsRepo.getUserPromptsCount(userId),
    statsRepo.getUserCommitsCount(userId),
  ]);

  return {
    tokens: {
      total_tokens_this_month: tokenStats.total_tokens,
      total_input_tokens: tokenStats.total_input_tokens,
      total_output_tokens: tokenStats.total_output_tokens,
      total_cost: tokenStats.total_cost,
      total_requests: tokenStats.total_requests,
      period: tokenStats.period,
    },
    latency: {
      avg_latency_ms: tokenStats.avg_latency_ms,
    },
    counts: {
      total_projects: projectsCount,
      total_prompts: promptsCount,
      total_commits: commitsCount,
    },
  };
};
