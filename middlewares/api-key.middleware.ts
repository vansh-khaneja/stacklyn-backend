import { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";
import prisma from "../config/db";

// Hash the API key for lookup
const hashApiKey = (key: string): string => {
  return createHash("sha256").update(key).digest("hex");
};

export const requireApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get API key from header (Authorization: Bearer sk_xxx) or query param
    let apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      apiKey = req.query.api_key as string;
    }

    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    // Hash and lookup
    const keyHash = hashApiKey(apiKey);
    const apiKeyRecord = await prisma.api_keys.findUnique({
      where: { key_hash: keyHash },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!apiKeyRecord) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (apiKeyRecord.status !== "active") {
      return res.status(401).json({ error: "API key is revoked" });
    }

    // Attach user info to request
    (req as any).apiKeyUserId = apiKeyRecord.user_id;
    (req as any).apiKeyUser = apiKeyRecord.user;

    next();
  } catch (error: any) {
    console.error("API key auth error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};
