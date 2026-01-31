import * as commitRepo from "./commit.repo";
import { diffWords } from "diff";
import { callLLM } from "../../services/llm";

export const createCommit = async (data: {
  prompt_id: string;
  system_prompt: string;
  user_query: string;
  commit_message?: string;
  created_by: string;
}) => {
  // Check if this is the first commit for this prompt
  const existingCommits = await commitRepo.getCommitsByPromptId(data.prompt_id);
  const isFirstCommit = existingCommits.total === 0;

  // Create the commit
  const commit = await commitRepo.createCommit(data);

  // If first commit, automatically add "main" tag
  if (isFirstCommit) {
    await commitRepo.addTagToCommit(commit.id, "main");
  }

  return commit;
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

export const getCommitsByPromptId = async (
  promptId: string,
  limit: number = 9,
  offset: number = 0
) => {
  const { commits, total, prodCommit } = await commitRepo.getCommitsByPromptId(
    promptId,
    limit,
    offset
  );

  return {
    commits,
    prodCommit,
    pagination: {
      limit,
      offset,
      total,
    },
  };
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

// Helper to get next version number
const getNextVersion = (existingTags: string[]): string => {
  // Filter version tags (v*.*.*)
  const versionRegex = /^v(\d+)\.(\d+)\.(\d+)$/;
  const versions = existingTags
    .map((tag) => {
      const match = tag.match(versionRegex);
      if (match) {
        return {
          major: parseInt(match[1]),
          minor: parseInt(match[2]),
          patch: parseInt(match[3]),
        };
      }
      return null;
    })
    .filter((v) => v !== null);

  if (versions.length === 0) {
    return "v1.0.0"; // First version
  }

  // Find the highest version
  const highest = versions.reduce((max, v) => {
    if (v.major > max.major) return v;
    if (v.major === max.major && v.minor > max.minor) return v;
    if (v.major === max.major && v.minor === max.minor && v.patch > max.patch) return v;
    return max;
  });

  // Increment patch version
  return `v${highest.major}.${highest.minor}.${highest.patch + 1}`;
};

// Get all versioned commits (production releases) for a prompt
export const getProductionReleases = async (
  promptId: string,
  limit: number = 9,
  offset: number = 0
) => {
  const { commits, total } = await commitRepo.getVersionedCommits(promptId, limit, offset);

  // Parse version tags and sort by version number (descending)
  const versionRegex = /^v(\d+)\.(\d+)\.(\d+)$/;

  const releases = commits
    .map((commit) => {
      const versionTag = commit.commit_tags.find((t) => versionRegex.test(t.tag_name));
      const isProd = commit.commit_tags.some((t) => t.tag_name === "PROD");

      return {
        id: commit.id,
        commit_message: commit.commit_message,
        created_at: commit.created_at,
        version: versionTag?.tag_name || null,
        is_current_prod: isProd,
        tags: commit.commit_tags.map((t) => t.tag_name),
      };
    })
    .sort((a, b) => {
      // Sort by version descending
      const matchA = a.version?.match(versionRegex);
      const matchB = b.version?.match(versionRegex);
      if (!matchA || !matchB) return 0;

      const [, majA, minA, patA] = matchA.map(Number);
      const [, majB, minB, patB] = matchB.map(Number);

      if (majB !== majA) return majB - majA;
      if (minB !== minA) return minB - minA;
      return patB - patA;
    });

  return {
    releases,
    pagination: {
      limit,
      offset,
      total,
    },
  };
};

// Push a commit to production - moves PROD tag and adds version tag
export const pushToProd = async (commitId: string) => {
  const commit = await getCommitById(commitId);

  // Get all existing tags for this prompt to determine next version
  const existingTags = await commitRepo.getTagsForPrompt(commit.prompt_id);
  const nextVersion = getNextVersion(existingTags);

  // Remove PROD tag from all commits of this prompt
  await commitRepo.removeTagFromPromptCommits(commit.prompt_id, "PROD");

  // Add PROD tag and version tag to the selected commit
  await commitRepo.addTagToCommit(commitId, "PROD");
  await commitRepo.addTagToCommit(commitId, nextVersion);

  // Return the updated commit
  return getCommitById(commitId);
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

// Generate commit message based on diff between old and new system prompts
export const generateCommitMessage = async (
  oldSystemPrompt: string,
  newSystemPrompt: string
) => {
  const systemPrompt = `You are a commit message generator using conventional commits format.

Rules:
- Use format: <type>: <description>
- Types: feat (new feature), fix (bug fix), chore (maintenance), refactor, docs, style, perf
- Description must be 5-6 words MAX
- Use lowercase
- No period at end
- No quotes

Examples:
- feat: add error handling for api
- fix: resolve timeout in requests
- chore: update system prompt tone
- refactor: simplify response formatting

Only respond with the commit message, nothing else.`;

  const userQuery = `Old:
${oldSystemPrompt}

New:
${newSystemPrompt}`;

  const response = await callLLM({
    model: "llama-3.1-8b-instant",
    system_prompt: systemPrompt,
    user_query: userQuery,
  });

  // Clean up the response
  return response.content.trim().replace(/^["']|["']$/g, "").toLowerCase();
};
