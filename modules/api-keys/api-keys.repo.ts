import prisma from "../../config/db";

export const createApiKey = async (data: {
  user_id: string;
  name: string;
  key_hash: string;
}) => {
  return prisma.api_keys.create({
    data,
  });
};

export const getApiKeyById = async (id: string) => {
  return prisma.api_keys.findUnique({
    where: { id },
  });
};

export const getApiKeyByHash = async (key_hash: string) => {
  return prisma.api_keys.findUnique({
    where: { key_hash },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const getApiKeysByUserId = async (userId: string) => {
  return prisma.api_keys.findMany({
    where: { user_id: userId },
    select: {
      id: true,
      name: true,
      status: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
};

export const updateApiKeyStatus = async (id: string, status: string) => {
  return prisma.api_keys.update({
    where: { id },
    data: { status },
  });
};

export const deleteApiKey = async (id: string) => {
  return prisma.api_keys.delete({
    where: { id },
  });
};

export const getApiKeyWithUser = async (id: string) => {
  return prisma.api_keys.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true },
      },
    },
  });
};
