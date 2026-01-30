import { Request, Response } from "express";
import * as commitService from "./commit.service";
import * as promptService from "../prompts/prompt.service";
import { verifyCommitAccess, verifyPromptAccess, getUserProjectRole } from "../../utils/authorization.utils";
import { logActivity } from "../activities/activity.service";

export const createCommit = async (req: Request, res: Response) => {
  try {
    const { prompt_id, system_prompt, user_query, commit_message } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const prompt = await promptService.getPromptById(prompt_id);

    // Viewers cannot create commits
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied. You don't have access to this prompt." });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot create commits." });
    }

    const commit = await commitService.createCommit({
      prompt_id,
      system_prompt,
      user_query,
      commit_message,
      created_by: userId,
    });

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "commit",
      entityId: commit.id,
      action: "created",
      title: `Updated '${prompt.name}'`,
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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to this commit
    const hasAccess = await verifyCommitAccess(userId, id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

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
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 9;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to the prompt
    const hasAccess = await verifyPromptAccess(userId, promptId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await commitService.getCommitsByPromptId(promptId, limit, offset);
    res.json(result);
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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const existingCommit = await commitService.getCommitById(id);
    const prompt = await promptService.getPromptById(existingCommit.prompt_id);

    // Viewers cannot update commits
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot update commits." });
    }

    const commit = await commitService.updateCommit(id, {
      system_prompt,
      user_query,
      commit_message,
    });

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "commit",
      entityId: commit.id,
      action: "updated",
      title: `Updated '${prompt.name}'`,
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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const commit = await commitService.getCommitById(id);
    const prompt = await promptService.getPromptById(commit.prompt_id);

    // Viewers cannot delete commits
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot delete commits." });
    }

    await commitService.deleteCommit(id);

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "commit",
      entityId: id,
      action: "deleted",
      title: `Deleted commit from '${prompt.name}'`,
    });

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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const commit = await commitService.getCommitById(id);
    const prompt = await promptService.getPromptById(commit.prompt_id);

    // Viewers cannot add tags
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot add tags." });
    }

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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const commit = await commitService.getCommitById(id);
    const prompt = await promptService.getPromptById(commit.prompt_id);

    // Viewers cannot remove tags
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot remove tags." });
    }

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
    const { userId: targetUserId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Users can only view their own commits
    if (userId !== targetUserId) {
      return res.status(403).json({ error: "Access denied. You can only view your own commits." });
    }

    const commits = await commitService.getCommitsByUserId(targetUserId);
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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Verify user has access to both commits
    const hasAccess1 = await verifyCommitAccess(userId, commitId1);
    const hasAccess2 = await verifyCommitAccess(userId, commitId2);

    if (!hasAccess1 || !hasAccess2) {
      return res.status(403).json({ error: "Access denied" });
    }

    const comparison = await commitService.compareCommits(commitId1, commitId2);
    res.json(comparison);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const pushToProd = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const commit = await commitService.getCommitById(id);
    const prompt = await promptService.getPromptById(commit.prompt_id);

    // Only admins and members can push to prod
    const role = await getUserProjectRole(userId, prompt.project_id);
    if (!role) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (role === "viewer") {
      return res.status(403).json({ error: "Access denied. Viewers cannot push to production." });
    }

    const updatedCommit = await commitService.pushToProd(id);

    logActivity({
      userId,
      projectId: prompt.project_id,
      entityType: "commit",
      entityId: id,
      action: "updated",
      title: `Pushed '${prompt.name}' to production`,
    });

    res.json(updatedCommit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProductionReleases = async (
  req: Request<{ promptId: string }>,
  res: Response
) => {
  try {
    const { promptId } = req.params;
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 9;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to the prompt
    const hasAccess = await verifyPromptAccess(userId, promptId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await commitService.getProductionReleases(promptId, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateCommitMessage = async (req: Request, res: Response) => {
  try {
    console.log("[generateCommitMessage] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[generateCommitMessage] Body keys:", Object.keys(req.body));

    // Accept both camelCase and snake_case
    const oldSystemPrompt = req.body.oldSystemPrompt || req.body.old_system_prompt;
    const newSystemPrompt = req.body.newSystemPrompt || req.body.new_system_prompt;
    const userId = (req as any).userId;

    console.log("[generateCommitMessage] oldSystemPrompt:", oldSystemPrompt ? `${oldSystemPrompt.substring(0, 50)}...` : "MISSING");
    console.log("[generateCommitMessage] newSystemPrompt:", newSystemPrompt ? `${newSystemPrompt.substring(0, 50)}...` : "MISSING");

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!oldSystemPrompt || !newSystemPrompt) {
      console.log("[generateCommitMessage] Validation failed - missing prompts");
      return res.status(400).json({ error: "Both oldSystemPrompt and newSystemPrompt are required" });
    }

    console.log("[generateCommitMessage] Calling LLM...");
    const commitMessage = await commitService.generateCommitMessage(
      oldSystemPrompt,
      newSystemPrompt
    );
    console.log("[generateCommitMessage] Generated message:", commitMessage);

    res.json({ commitMessage });
  } catch (error: any) {
    console.error("[generateCommitMessage] Error:", error);
    res.status(500).json({ error: error.message });
  }
};
