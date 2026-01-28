import { Request, Response } from "express";
import * as scoreService from "./score.service";

export const createScore = async (req: Request, res: Response) => {
  try {
    const {
      commit_id,
      score,
      scorer,
      reference_prompt,
      actual_prompt,
      reasoning,
    } = req.body;
    const newScore = await scoreService.createScore({
      commit_id,
      score,
      scorer,
      reference_prompt,
      actual_prompt,
      reasoning,
    });
    res.status(201).json(newScore);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getScoreById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const score = await scoreService.getScoreById(id);
    res.json(score);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllScores = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const scores = await scoreService.getScoresByUserId(userId);
    res.json(scores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getScoresByCommitId = async (
  req: Request<{ commitId: string }>,
  res: Response
) => {
  try {
    const { commitId } = req.params;
    const scores = await scoreService.getScoresByCommitId(commitId);
    res.json(scores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getScoresByScorer = async (
  req: Request<{ scorer: string }>,
  res: Response
) => {
  try {
    const { scorer } = req.params;
    const scores = await scoreService.getScoresByScorer(scorer);
    res.json(scores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateScore = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { score, reasoning, reference_prompt, actual_prompt } = req.body;
    const updatedScore = await scoreService.updateScore(id, {
      score,
      reasoning,
      reference_prompt,
      actual_prompt,
    });
    res.json(updatedScore);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteScore = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    await scoreService.deleteScore(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAverageScoreByCommitId = async (
  req: Request<{ commitId: string }>,
  res: Response
) => {
  try {
    const { commitId } = req.params;
    const result = await scoreService.getAverageScoreByCommitId(commitId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getScoresAboveThreshold = async (req: Request, res: Response) => {
  try {
    const threshold = parseFloat(req.query.threshold as string);
    const scores = await scoreService.getScoresAboveThreshold(threshold);
    res.json(scores);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
