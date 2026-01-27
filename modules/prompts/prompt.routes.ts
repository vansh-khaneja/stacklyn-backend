import { Router } from "express";
import * as promptController from "./prompt.controller";

const router = Router();

router.post("/", promptController.createPrompt);
router.get("/", promptController.getAllPrompts);
router.get("/:id", promptController.getPromptById);
router.put("/:id", promptController.updatePrompt);
router.delete("/:id", promptController.deletePrompt);
router.get("/project/:projectId", promptController.getPromptsByProjectId);
router.get("/user/:userId", promptController.getPromptsByUserId);

export default router;
