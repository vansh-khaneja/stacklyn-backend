import redisClient, { ensureRedisConnected } from "../../config/redis";
import { v4 as uuidv4 } from "uuid";

// Notification types
export type NotificationType = "invite" | "removed" | "mention" | "reply";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  messageId?: string;
  fromUserId?: string;
  fromUserName?: string;
  link?: string;
  createdAt: string;
}

const NOTIFICATION_KEY_PREFIX = "notifications:";
const NOTIFICATION_TTL = 2 * 24 * 60 * 60; // 2 days in seconds

export class NotificationService {
  // Get Redis key for user's notifications
  private getKey(userId: string): string {
    return `${NOTIFICATION_KEY_PREFIX}${userId}`;
  }

  // Create and store a notification
  async createNotification(
    userId: string,
    type: NotificationType,
    data: {
      title: string;
      message: string;
      projectId?: string;
      projectName?: string;
      messageId?: string;
      fromUserId?: string;
      fromUserName?: string;
      link?: string;
    }
  ): Promise<Notification> {
    await ensureRedisConnected();
    
    const notification: Notification = {
      id: uuidv4(),
      type,
      title: data.title,
      message: data.message,
      projectId: data.projectId,
      projectName: data.projectName,
      messageId: data.messageId,
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      link: data.link,
      createdAt: new Date().toISOString(),
    };

    const key = this.getKey(userId);
    
    // Add to list (prepend so newest first)
    await redisClient.lPush(key, JSON.stringify(notification));
    
    // Set/refresh TTL
    await redisClient.expire(key, NOTIFICATION_TTL);
    
    console.log(`📬 Created notification for ${userId}: ${notification.type}`);

    return notification;
  }

  // Get all notifications for a user
  async getNotifications(userId: string): Promise<Notification[]> {
    await ensureRedisConnected();
    const key = this.getKey(userId);
    const notifications = await redisClient.lRange(key, 0, -1);
    
    return notifications.map((n) => JSON.parse(n) as Notification);
  }

  // Get notification count for a user
  async getNotificationCount(userId: string): Promise<number> {
    await ensureRedisConnected();
    const key = this.getKey(userId);
    return await redisClient.lLen(key);
  }

  // Remove a specific notification by ID
  async removeNotification(userId: string, notificationId: string): Promise<boolean> {
    await ensureRedisConnected();
    const key = this.getKey(userId);
    const notifications = await redisClient.lRange(key, 0, -1);
    
    console.log(`🗑️ Attempting to remove notification ${notificationId} for user ${userId}`);
    
    // Find and remove the notification with matching ID
    for (const n of notifications) {
      const parsed = JSON.parse(n) as Notification;
      if (parsed.id === notificationId) {
        const removed = await redisClient.lRem(key, 1, n);
        console.log(`🗑️ Removed notification: ${removed > 0 ? 'success' : 'failed'}`);
        return removed > 0;
      }
    }
    
    console.log(`🗑️ Notification ${notificationId} not found`);
    return false;
  }

  // Mark all as read (clear all notifications)
  async clearAllNotifications(userId: string): Promise<void> {
    await ensureRedisConnected();
    const key = this.getKey(userId);
    const deleted = await redisClient.del(key);
    console.log(`🗑️ Cleared all notifications for ${userId}: ${deleted > 0 ? 'success' : 'no notifications to clear'}`);
  }

  // Helper methods for creating specific notification types
  async notifyInvite(
    userId: string,
    projectId: string,
    projectName: string,
    invitedByUserId: string,
    invitedByUserName: string
  ): Promise<Notification> {
    return this.createNotification(userId, "invite", {
      title: "Project Invitation",
      message: `${invitedByUserName} added you to ${projectName}`,
      projectId,
      projectName,
      fromUserId: invitedByUserId,
      fromUserName: invitedByUserName,
      link: `/workspace/projects/${projectId}`,
    });
  }

  async notifyRemoved(
    userId: string,
    projectId: string,
    projectName: string,
    removedByUserId: string,
    removedByUserName: string
  ): Promise<Notification> {
    return this.createNotification(userId, "removed", {
      title: "Removed from Project",
      message: `${removedByUserName} removed you from ${projectName}`,
      projectId,
      projectName,
      fromUserId: removedByUserId,
      fromUserName: removedByUserName,
      link: `/workspace/projects`,
    });
  }

  async notifyMention(
    userId: string,
    projectId: string,
    projectName: string,
    messageId: string,
    mentionedByUserId: string,
    mentionedByUserName: string
  ): Promise<Notification> {
    return this.createNotification(userId, "mention", {
      title: "You were mentioned",
      message: `${mentionedByUserName} mentioned you in ${projectName}`,
      projectId,
      projectName,
      messageId,
      fromUserId: mentionedByUserId,
      fromUserName: mentionedByUserName,
      link: `/workspace/teams?project=${projectId}`,
    });
  }

  async notifyReply(
    userId: string,
    projectId: string,
    projectName: string,
    messageId: string,
    repliedByUserId: string,
    repliedByUserName: string
  ): Promise<Notification> {
    return this.createNotification(userId, "reply", {
      title: "New Reply",
      message: `${repliedByUserName} replied to your message in ${projectName}`,
      projectId,
      projectName,
      messageId,
      fromUserId: repliedByUserId,
      fromUserName: repliedByUserName,
      link: `/workspace/teams?project=${projectId}`,
    });
  }
}

export const notificationService = new NotificationService();
