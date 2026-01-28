import * as activityRepo from "./activity.repo";
import * as projectRepo from "../projects/project.repo";
import { entity_type, activity_action } from "@prisma/client";

export interface LogActivityParams {
  userId?: string;
  projectId?: string;
  entityType: entity_type;
  entityId: string;
  action: activity_action;
  title: string;
  metadata?: Record<string, any>;
}

// Async activity logging - fire and forget
export const logActivity = async (params: LogActivityParams) => {
  try {
    await activityRepo.createActivity({
      user_id: params.userId,
      project_id: params.projectId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      title: params.title,
      metadata: params.metadata,
    });
  } catch (error) {
    // Log error but don't throw - activity logging should never break main flow
    console.error("Failed to log activity:", error);
  }
};

// Get activity feed for all projects a user has access to
export const getActivityFeed = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
) => {
  // Get projects user owns
  const ownedProjects = await projectRepo.getProjectsByUserId(userId);

  // Get projects user is a member of
  const memberships = await projectRepo.getMembershipsByUserId(userId);
  const memberProjectIds = memberships.map((m) => m.project_id);

  // Combine both (owned + member), remove duplicates
  const allProjectIds = [
    ...new Set([
      ...ownedProjects.map((p) => p.id),
      ...memberProjectIds,
    ]),
  ];

  if (allProjectIds.length === 0) {
    return [];
  }

  return activityRepo.getActivitiesForUserProjects(allProjectIds, limit, offset);
};
