import { Request, Response } from "express";
import * as searchService from "./search.service";

export const searchWorkspace = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const query = req.query.q as string;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!query) {
            return res.status(200).json({ projects: [], prompts: [] });
        }

        const results = await searchService.searchWorkspace(userId, query);
        res.status(200).json(results);
    } catch (error: any) {
        console.error("Search error:", error);
        res.status(500).json({ error: error.message || "Failed to search workspace" });
    }
};
