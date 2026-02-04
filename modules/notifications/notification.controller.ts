import { Request, Response } from "express";
import { notificationService } from "./notification.service";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const getNotificationCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const count = await notificationService.getNotificationCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    res.status(500).json({ error: "Failed to fetch notification count" });
  }
};

export const removeNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { notificationId } = req.params;
    if (!notificationId || Array.isArray(notificationId)) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    const removed = await notificationService.removeNotification(userId, notificationId as string);
    
    if (removed) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (error) {
    console.error("Error removing notification:", error);
    res.status(500).json({ error: "Failed to remove notification" });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await notificationService.clearAllNotifications(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
};
