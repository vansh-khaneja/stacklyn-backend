import prisma from "../../config/db";

// Get all unique tag names (strings)
export const getAllTags = async () => {
  const tags = await prisma.commit_tags.findMany({
    distinct: ["tag_name"],
    select: {
      tag_name: true,
    },
  });
  return tags.map((t) => t.tag_name);
};

// Get all tag-to-commit mappings (objects)
export const getAllTagMappings = async () => {
  return prisma.commit_tags.findMany();
};

// Check if a tag exists (is used by any commit)
export const tagExists = async (tagName: string) => {
  const tag = await prisma.commit_tags.findFirst({
    where: { tag_name: tagName },
  });
  return !!tag;
};

// Get all commits with a specific tag
export const getCommitsByTagName = async (tagName: string) => {
  return prisma.commit_tags.findMany({
    where: { tag_name: tagName },
    include: {
      commits: {
        select: {
          id: true,
          commit_message: true,
          system_prompt: true,
          user_query: true,
          created_at: true,
        },
      },
    },
  });
};

// Search tags by partial name
export const searchTags = async (query: string) => {
  const tags = await prisma.commit_tags.findMany({
    where: {
      tag_name: {
        contains: query,
        mode: "insensitive",
      },
    },
    distinct: ["tag_name"],
    select: {
      tag_name: true,
    },
  });
  return tags.map((t) => t.tag_name);
};

// Delete all occurrences of a tag (remove from all commits)
export const deleteTag = async (tagName: string) => {
  return prisma.commit_tags.deleteMany({
    where: { tag_name: tagName },
  });
};

// Rename a tag across all commits
export const renameTag = async (oldName: string, newName: string) => {
  return prisma.commit_tags.updateMany({
    where: { tag_name: oldName },
    data: { tag_name: newName },
  });
};
