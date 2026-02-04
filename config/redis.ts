import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

// Helper to ensure Redis is connected before operations
export const ensureRedisConnected = async () => {
  if (!redisClient.isOpen) {
    console.log("⚠️ Redis not connected, attempting to connect...");
    await redisClient.connect();
  }
};

export default redisClient;
