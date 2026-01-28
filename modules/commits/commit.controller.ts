import { Request, Response } from "express";
import * as commitService from "./commit.service";

export const createCommit = async (req: Request, res: Response) => {
  try {
    const { prompt_id, system_prompt, user_query, commit_message } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const commit = await commitService.createCommit({
      prompt_id,
      system_prompt,
      user_query,
      commit_message,
      created_by: userId,
    });
    res.status(201).json(commit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommitById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const commit = await commitService.getCommitById(id);
    res.json(commit);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllCommits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const commits = await commitService.getCommitsByUserId(userId);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommitsByPromptId = async (
  req: Request<{ promptId: string }>,
  res: Response
) => {
  try {
    const { promptId } = req.params;
    const commits = await commitService.getCommitsByPromptId(promptId);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCommit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { system_prompt, user_query, commit_message } = req.body;
    const commit = await commitService.updateCommit(id, {
      system_prompt,
      user_query,
      commit_message,
    });
    res.json(commit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCommit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    await commitService.deleteCommit(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const addTagToCommit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { tagName } = req.body;
    const commitTag = await commitService.addTagToCommit(id, tagName);
    res.status(201).json(commitTag);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeTagFromCommit = async (
  req: Request<{ id: string; tagName: string }>,
  res: Response
) => {
  try {
    const { id, tagName } = req.params;
    await commitService.removeTagFromCommit(id, tagName);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getCommitsByUserId = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const commits = await commitService.getCommitsByUserId(userId);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const compareCommits = async (
  req: Request<{ commitId1: string; commitId2: string }>,
  res: Response
) => {
  try {
    const { commitId1, commitId2 } = req.params;
    const comparison = await commitService.compareCommits(commitId1, commitId2);
    res.json(comparison);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
