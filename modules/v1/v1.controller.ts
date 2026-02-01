import { Request, Response } from "express";
import * as v1Service from "./v1.service";

export const getProjectPrompt = async (
  req: Request<{ displayId: string }>,
  res: Response
) => {
  try {
    const { displayId } = req.params;
    const userId = (req as any).apiKeyUserId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await v1Service.getProjectPrompt(displayId, userId);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Access denied") {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === "No production prompt found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
