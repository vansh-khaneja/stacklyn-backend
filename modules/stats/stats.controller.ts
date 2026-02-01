import { Request, Response } from "express";
import * as statsService from "./stats.service";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const stats = await statsService.getDashboardStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
