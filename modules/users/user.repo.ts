import prisma from "../../config/db";

export const createUser = async (data: { email: string; name?: string }) => {
  return prisma.users.create({
    data,
  });
};

export const getUserById = async (id: string) => {
  return prisma.users.findUnique({
    where: { id },
  });
};

export const getUserByEmail = async (email: string) => {
  return prisma.users.findUnique({
    where: { email },
  });
};

export const updateUser = async (
  id: string,
  data: { email?: string; name?: string; image_url?: string }
) => {
  return prisma.users.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: string) => {
  return prisma.users.delete({
    where: { id },
  });
};

export const getUserProjects = async (userId: string) => {
  return prisma.projects.findMany({
    where: {
      OR: [
        { created_by: userId },
        { project_users: { some: { user_id: userId } } },
      ],
    },
    include: {
      project_users: {
        where: { user_id: userId },
        select: { role: true },
      },
    },
  });
};

export const getAllUsers = async () => {
  return prisma.users.findMany();
};
