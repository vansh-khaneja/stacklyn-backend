import * as projectRepo from "./project.repo";
import * as userRepo from "../users/user.repo";

export const createProject = async (data: {
  name: string;
  description?: string;
  created_by: string;
}) => {
  return projectRepo.createProject(data);
};

export const getProjectById = async (id: string) => {
  const project = await projectRepo.getProjectById(id);
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
};

export const getAllProjects = async () => {
  return projectRepo.getAllProjects();
};

export const getProjectsByUserId = async (userId: string) => {
  return projectRepo.getProjectsByUserId(userId);
};

export const updateProject = async (
  id: string,
  data: { name?: string; description?: string }
) => {
  await getProjectById(id);
  return projectRepo.updateProject(id, data);
};

export const deleteProject = async (id: string) => {
  await getProjectById(id);
  return projectRepo.deleteProject(id);
};

export const getProjectMembers = async (projectId: string) => {
  await getProjectById(projectId);
  return projectRepo.getProjectMembers(projectId);
};

export const addProjectMember = async (
  projectId: string,
  userId: string,
  role: string = "member"
) => {
  await getProjectById(projectId);
  return projectRepo.addProjectMember(projectId, userId, role);
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  await getProjectById(projectId);
  return projectRepo.removeProjectMember(projectId, userId);
};

export const addProjectMemberByEmail = async (
  projectId: string,
  email: string,
  role: string = "member"
) => {
  await getProjectById(projectId);

  const user = await userRepo.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found with this email");
  }

  return projectRepo.addProjectMember(projectId, user.id, role);
};
