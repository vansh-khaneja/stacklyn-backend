import * as chatRepo from "./chat.repo";
import { getUserProjectRole } from "../../utils/authorization.utils";

export const createMessage = async (data: {
  project_id: string;
  user_id: string;
  content: string;
  parent_message_id?: string;
}) => {
  return chatRepo.createMessage(data);
};

export const getMessageById = async (id: string) => {
  const message = await chatRepo.getMessageById(id);
  if (!message) {
    throw new Error("Message not found");
  }
  return message;
};

export const getProjectMessages = async (projectId: string, userId: string) => {
  const messages = await chatRepo.getProjectMessages(projectId);

  // Get user roles for each message author
  const messagesWithRoles = await Promise.all(
    messages.map(async (message) => {
      let userRole = null;
      if (message.user_id) {
        userRole = await getUserProjectRole(message.user_id, projectId);
      }
      return {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        updated_at: message.updated_at,
        parent_message_id: message.parent_message_id,
        replies_count: message._count.replies,
        user: message.user
          ? {
              id: message.user.id,
              name: message.user.name,
              image_url: message.user.image_url,
              role: userRole,
            }
          : null,
      };
    })
  );

  return messagesWithRoles;
};

export const getMessageReplies = async (messageId: string, projectId: string) => {
  const replies = await chatRepo.getMessageReplies(messageId);

  // Get user roles for each reply author
  const repliesWithRoles = await Promise.all(
    replies.map(async (reply) => {
      let userRole = null;
      if (reply.user_id) {
        userRole = await getUserProjectRole(reply.user_id, projectId);
      }
      return {
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
      };
    })
  );

  return repliesWithRoles;
};

export const updateMessage = async (id: string, content: string) => {
  await getMessageById(id);
  return chatRepo.updateMessage(id, content);
};

export const deleteMessage = async (id: string) => {
  await getMessageById(id);
  return chatRepo.deleteMessage(id);
};

export const getMessageWithProject = async (id: string) => {
  const message = await chatRepo.getMessageWithProject(id);
  if (!message) {
    throw new Error("Message not found");
  }
  return message;
};

// ==================== REACTIONS ====================

export const getMessageReactions = async (messageId: string, currentUserId: string) => {
  const reactions = await chatRepo.getMessageReactions(messageId);

  // Group reactions by emoji with user info
  const grouped: {
    [emoji: string]: {
      emoji: string;
      count: number;
      current_user_reacted: boolean;
      users: { id: string; name: string | null; image_url: string | null }[];
    };
  } = {};

  reactions.forEach((reaction: {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: Date | null;
    user: { id: string; name: string | null; image_url: string | null };
  }) => {
    if (!grouped[reaction.emoji]) {
      grouped[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        current_user_reacted: false,
        users: [],
      };
    }
    grouped[reaction.emoji].count++;
    // Check if current user has reacted with this emoji
    if (reaction.user_id === currentUserId) {
      grouped[reaction.emoji].current_user_reacted = true;
    }
    grouped[reaction.emoji].users.push({
      id: reaction.user.id,
      name: reaction.user.name,
      image_url: reaction.user.image_url,
    });
  });

  return Object.values(grouped);
};

export const addReaction = async (
  messageId: string,
  userId: string,
  emoji: string
) => {
  return chatRepo.addReaction(messageId, userId, emoji);
};

export const removeReaction = async (
  messageId: string,
  userId: string,
  emoji: string
) => {
  return chatRepo.removeReaction(messageId, userId, emoji);
};
