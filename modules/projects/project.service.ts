import * as projectRepo from "./project.repo";
import * as userRepo from "../users/user.repo";
import { notificationService } from "../notifications/notification.service";
import { emitNotificationToUser } from "../../services/websocket";

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
  role: string = "member",
  invitedByUserId?: string
) => {
  const project = await getProjectById(projectId);
  const result = await projectRepo.addProjectMember(projectId, userId, role);
  
  // Send notification if invited by someone else
  if (invitedByUserId && invitedByUserId !== userId) {
    const inviter = await userRepo.getUserById(invitedByUserId);
    const notification = await notificationService.notifyInvite(
      userId,
      projectId,
      project.name,
      invitedByUserId,
      inviter?.name || "Someone"
    );
    emitNotificationToUser(userId, notification);
  }
  
  return result;
};

export const removeProjectMember = async (
  projectId: string,
  userId: string,
  removedByUserId?: string
) => {
  const project = await getProjectById(projectId);
  const result = await projectRepo.removeProjectMember(projectId, userId);
  
  // Send notification if removed by someone else
  if (removedByUserId && removedByUserId !== userId) {
    const remover = await userRepo.getUserById(removedByUserId);
    const notification = await notificationService.notifyRemoved(
      userId,
      projectId,
      project.name,
      removedByUserId,
      remover?.name || "Someone"
    );
    emitNotificationToUser(userId, notification);
  }
  
  return result;
};

export const addProjectMemberByEmail = async (
  projectId: string,
  email: string,
  role: string = "member",
  invitedByUserId?: string
) => {
  const project = await getProjectById(projectId);

  const user = await userRepo.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found with this email");
  }

  const result = await projectRepo.addProjectMember(projectId, user.id, role);
  
  // Send notification
  if (invitedByUserId && invitedByUserId !== user.id) {
    const inviter = await userRepo.getUserById(invitedByUserId);
    const notification = await notificationService.notifyInvite(
      user.id,
      projectId,
      project.name,
      invitedByUserId,
      inviter?.name || "Someone"
    );
    emitNotificationToUser(user.id, notification);
  }
  
  return result;
};

export const getMembershipsByUserId = async (userId: string) => {
  return projectRepo.getMembershipsByUserId(userId);
};

export const updateMemberRole = async (
  projectId: string,
  userId: string,
  role: string
) => {
  await getProjectById(projectId);
  return projectRepo.updateMemberRole(projectId, userId, role);
};

export const getAllUserProjects = async (
  userId: string,
  limit: number = 9,
  offset: number = 0
) => {
  return projectRepo.getAllUserProjects(userId, limit, offset);
};
