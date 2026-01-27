import * as tagRepo from "./tag.repo";

export const getAllTags = async () => {
  return tagRepo.getAllTags();
};

export const getAllTagMappings = async () => {
  return tagRepo.getAllTagMappings();
};

export const tagExists = async (name: string) => {
  return tagRepo.tagExists(name);
};

export const getCommitsByTagName = async (tagName: string) => {
  const results = await tagRepo.getCommitsByTagName(tagName);
  if (results.length === 0) {
    throw new Error("Tag not found or has no commits");
  }
  return results.map((r) => r.commits);
};

export const searchTags = async (query: string) => {
  return tagRepo.searchTags(query);
};

export const deleteTag = async (tagName: string) => {
  const exists = await tagRepo.tagExists(tagName);
  if (!exists) {
    throw new Error("Tag not found");
  }
  return tagRepo.deleteTag(tagName);
};

export const renameTag = async (oldName: string, newName: string) => {
  const exists = await tagRepo.tagExists(oldName);
  if (!exists) {
    throw new Error("Tag not found");
  }
  return tagRepo.renameTag(oldName, newName);
};
