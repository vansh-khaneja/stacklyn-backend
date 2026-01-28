import { Request, Response } from "express";
import * as activityService from "./activity.service";

// Get recent activity feed for current user (all their projects)
export const getActivityFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const activities = await activityService.getActivityFeed(userId, limit, offset);
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
