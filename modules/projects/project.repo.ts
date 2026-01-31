import prisma from "../../config/db";

export const createProject = async (data: {
  name: string;
  description?: string;
  created_by: string;
}) => {
  const project = await prisma.projects.create({
    data,
  });

  // Add creator to project_users as admin
  await prisma.project_users.create({
    data: {
      project_id: project.id,
      user_id: data.created_by,
      role: "admin",
    },
  });

  return project;
};

export const getProjectById = async (id: string) => {
  return prisma.projects.findUnique({
    where: { id },
    include: {
      project_users: {
        include: {
          users: {
            select: { id: true, email: true, name: true, image_url: true },
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
            select: { id: true, email: true, name: true, image_url: true },
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
        select: { id: true, email: true, name: true, image_url: true },
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
  // Get personal projects: user is a member AND only 1 member total
  const projects = await prisma.projects.findMany({
    where: {
      project_users: {
        some: { user_id: userId },
      },
    },
    include: {
      project_users: {
        include: {
          users: {
            select: { id: true, email: true, name: true, image_url: true },
          },
        },
      },
      _count: {
        select: { project_users: true },
      },
    },
  });

  // Filter to only projects with exactly 1 member (personal projects)
  return projects.filter((project) => project._count.project_users === 1);
};

export const getMembershipsByUserId = async (userId: string) => {
  // Get shared projects: user is a member AND 2+ members total
  const memberships = await prisma.project_users.findMany({
    where: { user_id: userId },
    include: {
      projects: {
        include: {
          _count: {
            select: { project_users: true },
          },
        },
      },
      users: {
        select: { id: true, email: true, name: true, image_url: true },
      },
    },
  });

  // Filter to only projects with 2+ members (shared projects)
  return memberships.filter(
    (membership) => membership.projects._count.project_users >= 2
  );
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
        select: { id: true, email: true, name: true, image_url: true },
      },
    },
  });
};

export const getAllUserProjects = async (
  userId: string,
  limit: number = 9,
  offset: number = 0
) => {
  // Get all projects where user is a member, with pagination
  const [projects, total] = await Promise.all([
    prisma.projects.findMany({
      where: {
        project_users: {
          some: { user_id: userId },
        },
      },
      include: {
        project_users: {
          include: {
            users: {
              select: { id: true, email: true, name: true, image_url: true },
            },
          },
        },
        _count: {
          select: { project_users: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.projects.count({
      where: {
        project_users: {
          some: { user_id: userId },
        },
      },
    }),
  ]);

  // Add type field based on member count
  const projectsWithType = projects.map((project) => ({
    ...project,
    type: project._count.project_users === 1 ? "personal" : "shared",
  }));

  return { projects: projectsWithType, total };
};
