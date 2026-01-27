import * as commitRepo from "./commit.repo";
import { diffWords } from "diff";

export const createCommit = async (data: {
  prompt_id: string;
  system_prompt: string;
  user_query: string;
  commit_message?: string;
  created_by: string;
}) => {
  return commitRepo.createCommit(data);
};

export const getCommitById = async (id: string) => {
  const commit = await commitRepo.getCommitById(id);
  if (!commit) {
    throw new Error("Commit not found");
  }
  return commit;
};

export const getAllCommits = async () => {
  return commitRepo.getAllCommits();
};

export const getCommitsByPromptId = async (promptId: string) => {
  return commitRepo.getCommitsByPromptId(promptId);
};

export const updateCommit = async (
  id: string,
  data: {
    system_prompt?: string;
    user_query?: string;
    commit_message?: string;
  }
) => {
  await getCommitById(id);
  return commitRepo.updateCommit(id, data);
};

export const deleteCommit = async (id: string) => {
  await getCommitById(id);
  return commitRepo.deleteCommit(id);
};

export const addTagToCommit = async (commitId: string, tagId: string) => {
  await getCommitById(commitId);
  return commitRepo.addTagToCommit(commitId, tagId);
};

export const removeTagFromCommit = async (commitId: string, tagId: string) => {
  await getCommitById(commitId);
  return commitRepo.removeTagFromCommit(commitId, tagId);
};

export const getCommitsByUserId = async (userId: string) => {
  return commitRepo.getCommitsByUserId(userId);
};

export const compareCommits = async (commitId1: string, commitId2: string) => {
  const [commit1, commit2] = await Promise.all([
    getCommitById(commitId1),
    getCommitById(commitId2),
  ]);

  const systemPromptDiff = diffWords(commit1.system_prompt, commit2.system_prompt);

  // Minimum words to show in a changed chunk
  const MIN_WORDS = 5;

  // Convert diff to array with word counts
  const parts = systemPromptDiff.map((part) => ({
    value: part.value,
    type: part.added ? "added" : part.removed ? "removed" : "unchanged",
    wordCount: part.value.trim().split(/\s+/).filter(w => w).length,
  }));

  // Expand small changed chunks by borrowing words from adjacent unchanged text
  const expandedParts: Array<{ value: string; type: string }> = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.type === "unchanged") {
      expandedParts.push({ value: part.value, type: part.type });
    } else {
      // For added/removed parts, check if we need more context
      if (part.wordCount < MIN_WORDS) {
        // Try to borrow words from previous unchanged part
        const prevPart = expandedParts[expandedParts.length - 1];
        if (prevPart && prevPart.type === "unchanged") {
          const words = prevPart.value.split(/(\s+)/);
          const wordsNeeded = MIN_WORDS - part.wordCount;
          const wordTokens = words.filter((_, idx) => idx % 2 === 0); // actual words

          if (wordTokens.length > wordsNeeded) {
            // Take last N words from unchanged and prepend to changed
            const takeFrom = Math.max(0, words.length - wordsNeeded * 2);
            const borrowed = words.slice(takeFrom).join('');
            prevPart.value = words.slice(0, takeFrom).join('');
            part.value = borrowed + part.value;
          }
        }
      }
      expandedParts.push({ value: part.value, type: part.type });
    }
  }

  // Merge consecutive parts of the same type
  const mergedDiff: Array<{ value: string; type: string }> = [];
  for (const part of expandedParts) {
    // Skip empty parts
    if (!part.value.trim()) continue;

    const lastPart = mergedDiff[mergedDiff.length - 1];
    if (lastPart && lastPart.type === part.type) {
      lastPart.value += part.value;
    } else {
      mergedDiff.push({ value: part.value, type: part.type });
    }
  }

  return {
    oldCommit: {
      id: commit1.id,
      system_prompt: commit1.system_prompt,
      commit_message: commit1.commit_message,
      created_at: commit1.created_at,
    },
    newCommit: {
      id: commit2.id,
      system_prompt: commit2.system_prompt,
      commit_message: commit2.commit_message,
      created_at: commit2.created_at,
    },
    diff: mergedDiff,
  };
};
