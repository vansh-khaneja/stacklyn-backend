import prisma from "../../config/db";

// Truncate text to ~7 words with ellipsis
const truncateToWords = (text: string | null, wordCount: number = 7): string | null => {
  if (!text) return null;
  const words = text.split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "...";
};

export const createTokenUsage = async (data: {
  user_id?: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  cost?: number;
  latency_ms?: number;
  system_prompt?: string;
  user_query?: string;
  response?: string;
  status?: string;
}) => {
  return prisma.token_usage.create({
    data,
  });
};

export const getTokenUsageById = async (id: string) => {
  return prisma.token_usage.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const getAllTokenUsage = async () => {
  return prisma.token_usage.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getTokenUsageByUserId = async (
  userId: string,
  limit: number = 10,
  offset: number = 0,
  fromDate?: Date,
  toDate?: Date,
  model?: string,
  status?: string
) => {
  const where: any = { user_id: userId };

  if (fromDate || toDate) {
    where.created_at = {};
    if (fromDate) where.created_at.gte = fromDate;
    if (toDate) where.created_at.lte = toDate;
  }

  if (model) {
    where.model_name = model;
  }

  if (status) {
    where.status = status;
  }

  const [data, total, stats, modelsUsed] = await Promise.all([
    prisma.token_usage.findMany({
      where,
      select: {
        id: true,
        model_name: true,
        input_tokens: true,
        output_tokens: true,
        cost: true,
        latency_ms: true,
        status: true,
        created_at: true,
        system_prompt: true,
      },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.token_usage.count({ where }),
    prisma.token_usage.aggregate({
      where,
      _sum: {
        input_tokens: true,
        output_tokens: true,
        cost: true,
        latency_ms: true,
      },
      _avg: {
        latency_ms: true,
      },
    }),
    prisma.token_usage.groupBy({
      by: ["model_name"],
      where: { user_id: userId },
    }),
  ]);

  return {
    data: data.map((item) => ({
      ...item,
      system_prompt: truncateToWords(item.system_prompt),
    })),
    pagination: {
      limit,
      offset,
      total,
    },
    summary: {
      total_input_tokens: stats._sum.input_tokens || 0,
      total_output_tokens: stats._sum.output_tokens || 0,
      total_tokens: (stats._sum.input_tokens || 0) + (stats._sum.output_tokens || 0),
      total_cost: stats._sum.cost || 0,
      total_latency_ms: stats._sum.latency_ms || 0,
      avg_latency_ms: Math.round(stats._avg.latency_ms || 0),
    },
    models_used: modelsUsed.map((m) => m.model_name),
  };
};

export const getTokenUsageByModel = async (modelName: string) => {
  return prisma.token_usage.findMany({
    where: { model_name: modelName },
    orderBy: { created_at: "desc" },
  });
};

export const getTokenUsageStats = async (userId?: string) => {
  const where = userId ? { user_id: userId } : {};

  const stats = await prisma.token_usage.aggregate({
    where,
    _sum: {
      input_tokens: true,
      output_tokens: true,
      cost: true,
    },
    _count: true,
  });

  const byModel = await prisma.token_usage.groupBy({
    by: ["model_name"],
    where,
    _sum: {
      input_tokens: true,
      output_tokens: true,
      cost: true,
    },
    _count: true,
  });

  return {
    total_input_tokens: stats._sum.input_tokens || 0,
    total_output_tokens: stats._sum.output_tokens || 0,
    total_cost: stats._sum.cost || 0,
    total_requests: stats._count,
    by_model: byModel,
  };
};
