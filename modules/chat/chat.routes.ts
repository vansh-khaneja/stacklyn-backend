import { Router } from "express";
import * as chatController from "./chat.controller";

const router = Router({ mergeParams: true });

// GET /api/projects/:projectId/chat - Get all top-level messages
router.get("/", chatController.getProjectMessages);

// POST /api/projects/:projectId/chat - Create a new message
router.post("/", chatController.createMessage);

// GET /api/projects/:projectId/chat/:messageId/replies - Get thread replies
router.get("/:messageId/replies", chatController.getMessageReplies);

// POST /api/projects/:projectId/chat/:messageId/replies - Reply to a message
router.post("/:messageId/replies", chatController.createReply);

// PUT /api/projects/:projectId/chat/:messageId - Update a message
router.put("/:messageId", chatController.updateMessage);

// DELETE /api/projects/:projectId/chat/:messageId - Delete a message
router.delete("/:messageId", chatController.deleteMessage);

// GET /api/projects/:projectId/chat/:messageId/reactions - Get reactions for a message
router.get("/:messageId/reactions", chatController.getMessageReactions);

// POST /api/projects/:projectId/chat/:messageId/reactions - Add a reaction to a message
router.post("/:messageId/reactions", chatController.addReaction);

// DELETE /api/projects/:projectId/chat/:messageId/reactions/:emoji - Remove a reaction
router.delete("/:messageId/reactions/:emoji", chatController.removeReaction);

export default router;
