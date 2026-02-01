import { Request, Response } from "express";
import * as apiKeysService from "./api-keys.service";

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const apiKey = await apiKeysService.createApiKey(userId, name);
    res.status(201).json(apiKey);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const apiKeys = await apiKeysService.getApiKeysByUserId(userId);
    res.json(apiKeys);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const revokeApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    await apiKeysService.revokeApiKey(id, userId);
    res.json({ message: "API key revoked" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === "API key not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    await apiKeysService.deleteApiKey(id, userId);
    res.json({ message: "API key deleted" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === "API key not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
