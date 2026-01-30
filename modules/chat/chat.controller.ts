import { Request, Response } from "express";
import * as chatService from "./chat.service";
import {
  verifyProjectAccess,
  getUserProjectRole,
} from "../../utils/authorization.utils";

export const getProjectMessages = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await chatService.getProjectMessages(projectId, userId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    const message = await chatService.createMessage({
      project_id: projectId,
      user_id: userId,
      content: content.trim(),
    });

    // Get user role for response
    const userRole = await getUserProjectRole(userId, projectId);

    res.status(201).json({
      id: message.id,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
      parent_message_id: message.parent_message_id,
      user: message.user
        ? {
            id: message.user.id,
            name: message.user.name,
            image_url: message.user.image_url,
            role: userRole,
          }
        : null,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMessageReplies = async (
  req: Request<{ projectId: string; messageId: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify message exists and belongs to this project
    const message = await chatService.getMessageWithProject(messageId);
    if (message.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    const replies = await chatService.getMessageReplies(messageId, projectId);
    res.json(replies);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createReply = async (
  req: Request<{ projectId: string; messageId: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify parent message exists and belongs to this project
    const parentMessage = await chatService.getMessageWithProject(messageId);
    if (parentMessage.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Reply content is required" });
    }

    const reply = await chatService.createMessage({
      project_id: projectId,
      user_id: userId,
      content: content.trim(),
      parent_message_id: messageId,
    });

    // Get user role for response
    const userRole = await getUserProjectRole(userId, projectId);

    res.status(201).json({
      id: reply.id,
      content: reply.content,
      created_at: reply.created_at,
      updated_at: reply.updated_at,
      parent_message_id: reply.parent_message_id,
      user: reply.user
        ? {
            id: reply.user.id,
            name: reply.user.name,
            image_url: reply.user.image_url,
            role: userRole,
          }
        : null,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMessage = async (
  req: Request<{ projectId: string; messageId: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify message exists and belongs to this project
    const message = await chatService.getMessageWithProject(messageId);
    if (message.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    // Only message owner can update
    if (message.user_id !== userId) {
      return res.status(403).json({ error: "You can only edit your own messages" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    const updatedMessage = await chatService.updateMessage(messageId, content.trim());

    // Get user role for response
    const userRole = await getUserProjectRole(userId, projectId);

    res.json({
      id: updatedMessage.id,
      content: updatedMessage.content,
      created_at: updatedMessage.created_at,
      updated_at: updatedMessage.updated_at,
      parent_message_id: updatedMessage.parent_message_id,
      user: updatedMessage.user
        ? {
            id: updatedMessage.user.id,
            name: updatedMessage.user.name,
            image_url: updatedMessage.user.image_url,
            role: userRole,
          }
        : null,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMessage = async (
  req: Request<{ projectId: string; messageId: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify message exists and belongs to this project
    const message = await chatService.getMessageWithProject(messageId);
    if (message.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    // User can delete their own message OR admin can delete any message
    const userRole = await getUserProjectRole(userId, projectId);
    if (message.user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    await chatService.deleteMessage(messageId);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

// ==================== REACTIONS ====================

export const getMessageReactions = async (
  req: Request<{ projectId: string; messageId: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify message exists and belongs to this project
    const message = await chatService.getMessageWithProject(messageId);
    if (message.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    const reactions = await chatService.getMessageReactions(messageId, userId);
    res.json(reactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addReaction = async (
  req: Request<{ projectId: string; messageId: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId } = req.params;
    const { emoji } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify message exists and belongs to this project
    const message = await chatService.getMessageWithProject(messageId);
    if (message.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    if (!emoji || emoji.trim() === "") {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const reaction = await chatService.addReaction(messageId, userId, emoji.trim());
    res.status(201).json(reaction);
  } catch (error: any) {
    // Handle duplicate reaction
    if (error.code === "P2002") {
      return res.status(409).json({ error: "You already reacted with this emoji" });
    }
    res.status(400).json({ error: error.message });
  }
};

export const removeReaction = async (
  req: Request<{ projectId: string; messageId: string; emoji: string }>,
  res: Response
) => {
  try {
    const { projectId, messageId, emoji } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user has access to this project
    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify message exists and belongs to this project
    const message = await chatService.getMessageWithProject(messageId);
    if (message.project_id !== projectId) {
      return res.status(404).json({ error: "Message not found in this project" });
    }

    await chatService.removeReaction(messageId, userId, decodeURIComponent(emoji));
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
