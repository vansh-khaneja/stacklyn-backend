import { Request, Response } from "express";
import * as tagService from "./tag.service";

// Get all unique tags
export const getAllTags = async (_req: Request, res: Response) => {
  try {
    const tags = await tagService.getAllTags();
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTagMappings = async (_req: Request, res: Response) => {
  try {
    const tags = await tagService.getAllTagMappings();
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all commits with a specific tag
export const getCommitsByTagName = async (
  req: Request<{ name: string }>,
  res: Response
) => {
  try {
    const { name } = req.params;
    const commits = await tagService.getCommitsByTagName(name);
    res.json(commits);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

// Search tags by partial name
export const searchTags = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const tags = await tagService.searchTags(q as string);
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tag from all commits
export const deleteTag = async (
  req: Request<{ name: string }>,
  res: Response
) => {
  try {
    const { name } = req.params;
    await tagService.deleteTag(name);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

// Rename a tag across all commits
export const renameTag = async (
  req: Request<{ name: string }>,
  res: Response
) => {
  try {
    const { name } = req.params;
    const { newName } = req.body;
    await tagService.renameTag(name, newName);
    res.json({ message: `Tag renamed from "${name}" to "${newName}"` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
