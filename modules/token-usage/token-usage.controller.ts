import { Request, Response } from "express";
import * as tokenUsageService from "./token-usage.service";

export const getAllTokenUsage = async (req: Request, res: Response) => {
  try {
    const usage = await tokenUsageService.getAllTokenUsage();
    res.json(usage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTokenUsageById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const usage = await tokenUsageService.getTokenUsageById(id);
    res.json(usage);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getMyTokenUsage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    // Date filters
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    // Support preset periods: 1h, 6h, 24h, 7d, 30d
    const period = req.query.period as string;
    if (period) {
      const now = new Date();
      const match = period.match(/^(\d+)(h|d)$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === "h") {
          fromDate = new Date(now.getTime() - value * 60 * 60 * 1000);
        } else if (unit === "d") {
          fromDate = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
        }
        toDate = now;
      }
    }

    // Support custom date range (overrides period)
    if (req.query.from) {
      fromDate = new Date(req.query.from as string);
    }
    if (req.query.to) {
      toDate = new Date(req.query.to as string);
    }

    const model = req.query.model as string | undefined;
    const status = req.query.status as string | undefined;

    const usage = await tokenUsageService.getTokenUsageByUserId(
      userId,
      limit,
      offset,
      fromDate,
      toDate,
      model,
      status
    );
    res.json(usage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTokenUsageByModel = async (
  req: Request<{ modelName: string }>,
  res: Response
) => {
  try {
    const { modelName } = req.params;
    const usage = await tokenUsageService.getTokenUsageByModel(modelName);
    res.json(usage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTokenUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = await tokenUsageService.getTokenUsageStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTokenUsageStats = async (_req: Request, res: Response) => {
  try {
    const stats = await tokenUsageService.getTokenUsageStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
