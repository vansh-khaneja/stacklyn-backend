import prisma from "../../config/db";
import { entity_type, activity_action } from "@prisma/client";

export interface CreateActivityData {
  user_id?: string;
  project_id?: string;
  entity_type: entity_type;
  entity_id: string;
  action: activity_action;
  title: string;
  metadata?: Record<string, any>;
}

export const createActivity = async (data: CreateActivityData) => {
  return prisma.activities.create({
    data,
  });
};

export const getActivitiesForUserProjects = async (
  projectIds: string[],
  limit: number = 20,
  offset: number = 0
) => {
  return prisma.activities.findMany({
    where: {
      project_id: { in: projectIds },
    },
    include: {
      users: {
        select: { id: true, email: true, name: true, image_url: true },
      },
      projects: {
        select: { id: true, name: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: limit,
    skip: offset,
  });
};
