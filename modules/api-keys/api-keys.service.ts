import * as apiKeysRepo from "./api-keys.repo";
import { randomBytes, createHash } from "crypto";

// Generate a random API key
const generateApiKey = (): string => {
  const prefix = "sk_";
  const key = randomBytes(32).toString("hex");
  return `${prefix}${key}`;
};

// Hash the API key for storage
const hashApiKey = (key: string): string => {
  return createHash("sha256").update(key).digest("hex");
};

export const createApiKey = async (userId: string, name: string) => {
  const rawKey = generateApiKey();
  const key_hash = hashApiKey(rawKey);

  const apiKey = await apiKeysRepo.createApiKey({
    user_id: userId,
    name,
    key_hash,
  });

  // Return the raw key only once (user must save it)
  return {
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey,
    created_at: apiKey.created_at,
  };
};

export const getApiKeysByUserId = async (userId: string) => {
  return apiKeysRepo.getApiKeysByUserId(userId);
};

export const validateApiKey = async (rawKey: string) => {
  const key_hash = hashApiKey(rawKey);
  const apiKey = await apiKeysRepo.getApiKeyByHash(key_hash);

  if (!apiKey) {
    return null;
  }

  if (apiKey.status !== "active") {
    return null;
  }

  return apiKey;
};

export const revokeApiKey = async (id: string, userId: string) => {
  const apiKey = await apiKeysRepo.getApiKeyWithUser(id);

  if (!apiKey) {
    throw new Error("API key not found");
  }

  if (apiKey.user?.id !== userId) {
    throw new Error("Unauthorized");
  }

  return apiKeysRepo.updateApiKeyStatus(id, "revoked");
};

export const deleteApiKey = async (id: string, userId: string) => {
  const apiKey = await apiKeysRepo.getApiKeyWithUser(id);

  if (!apiKey) {
    throw new Error("API key not found");
  }

  if (apiKey.user?.id !== userId) {
    throw new Error("Unauthorized");
  }

  return apiKeysRepo.deleteApiKey(id);
};
