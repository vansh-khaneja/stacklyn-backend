import prisma from "../../config/db";

export const createMessage = async (data: {
  project_id: string;
  user_id: string;
  content: string;
  parent_message_id?: string;
}) => {
  return prisma.chat_messages.create({
    data,
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
    },
  });
};

export const getMessageById = async (id: string) => {
  return prisma.chat_messages.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
    },
  });
};

export const getProjectMessages = async (projectId: string) => {
  // Get top-level messages (no parent) with replies count
  return prisma.chat_messages.findMany({
    where: {
      project_id: projectId,
      parent_message_id: null,
    },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
      _count: {
        select: { replies: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getMessageReplies = async (messageId: string) => {
  return prisma.chat_messages.findMany({
    where: {
      parent_message_id: messageId,
    },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
    },
    orderBy: { created_at: "asc" },
  });
};

export const updateMessage = async (id: string, content: string) => {
  return prisma.chat_messages.update({
    where: { id },
    data: { content },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
    },
  });
};

export const deleteMessage = async (id: string) => {
  return prisma.chat_messages.delete({
    where: { id },
  });
};

export const getMessageWithProject = async (id: string) => {
  return prisma.chat_messages.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
      project: {
        select: { id: true },
      },
    },
  });
};

// ==================== REACTIONS ====================

export const getMessageReactions = async (messageId: string) => {
  return prisma.message_reactions.findMany({
    where: { message_id: messageId },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
    },
    orderBy: { created_at: "asc" },
  });
};

export const addReaction = async (
  messageId: string,
  userId: string,
  emoji: string
) => {
  return prisma.message_reactions.create({
    data: {
      message_id: messageId,
      user_id: userId,
      emoji,
    },
    include: {
      user: {
        select: { id: true, name: true, image_url: true },
      },
    },
  });
};

export const removeReaction = async (
  messageId: string,
  userId: string,
  emoji: string
) => {
  return prisma.message_reactions.deleteMany({
    where: {
      message_id: messageId,
      user_id: userId,
      emoji,
    },
  });
};
