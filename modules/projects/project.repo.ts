import prisma from "../../config/db";

export const createProject = async (data: {
  name: string;
  description?: string;
  created_by: string;
}) => {
  return prisma.projects.create({
    data,
  });
};

export const getProjectById = async (id: string) => {
  return prisma.projects.findUnique({
    where: { id },
    include: {
      project_users: {
        include: {
          users: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });
};

export const getAllProjects = async () => {
  return prisma.projects.findMany({
    include: {
      project_users: {
        include: {
          users: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });
};

export const updateProject = async (
  id: string,
  data: { name?: string; description?: string }
) => {
  return prisma.projects.update({
    where: { id },
    data,
  });
};

export const deleteProject = async (id: string) => {
  return prisma.projects.delete({
    where: { id },
  });
};

export const getProjectMembers = async (projectId: string) => {
  return prisma.project_users.findMany({
    where: { project_id: projectId },
    include: {
      users: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

export const addProjectMember = async (
  projectId: string,
  userId: string,
  role: string = "member"
) => {
  return prisma.project_users.create({
    data: {
      project_id: projectId,
      user_id: userId,
      role,
    },
  });
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  return prisma.project_users.delete({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });
};

export const getProjectsByUserId = async (userId: string) => {
  return prisma.projects.findMany({
    where: {
      created_by: userId,
    },
  });
};

export const getMembershipsByUserId = async (userId: string) => {
  return prisma.project_users.findMany({
    where: { user_id: userId },
    include: {
      projects: true,
      users: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

export const updateMemberRole = async (
  projectId: string,
  userId: string,
  role: string
) => {
  return prisma.project_users.update({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
    data: { role },
    include: {
      users: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};
