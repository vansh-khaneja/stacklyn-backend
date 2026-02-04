import { Router } from "express";
import {
  getNotifications,
  getNotificationCount,
  removeNotification,
  clearAllNotifications,
} from "./notification.controller";

const router = Router();

// GET /notifications - Get all notifications
router.get("/", getNotifications);

// GET /notifications/count - Get notification count
router.get("/count", getNotificationCount);

// DELETE /notifications/:notificationId - Remove single notification
router.delete("/:notificationId", removeNotification);

// DELETE /notifications - Clear all notifications (mark all as read)
router.delete("/", clearAllNotifications);

export default router;
