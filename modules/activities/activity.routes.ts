import { Router } from "express";
import * as activityController from "./activity.controller";

const router = Router();

// GET /api/activities - Get recent activity feed for current user
router.get("/", activityController.getActivityFeed);

export default router;
