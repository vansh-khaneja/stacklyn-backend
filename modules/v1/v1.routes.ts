import { Router } from "express";
import { requireApiKey } from "../../middlewares/api-key.middleware";
import * as v1Controller from "./v1.controller";

const router = Router();

// All v1 routes require API key authentication
router.use(requireApiKey);

// GET /v1/projects/:displayId/prompt - Get production system prompt
router.get("/projects/:displayId/prompt", v1Controller.getProjectPrompt);

export default router;
