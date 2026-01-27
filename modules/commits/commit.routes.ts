import { Router } from "express";
import * as commitController from "./commit.controller";

const router = Router();

router.post("/", commitController.createCommit);
router.get("/", commitController.getAllCommits);
router.get("/compare/:commitId1/:commitId2", commitController.compareCommits);
router.get("/:id", commitController.getCommitById);
router.put("/:id", commitController.updateCommit);
router.delete("/:id", commitController.deleteCommit);
router.get("/prompt/:promptId", commitController.getCommitsByPromptId);
router.get("/user/:userId", commitController.getCommitsByUserId);
router.post("/:id/tags", commitController.addTagToCommit);
router.delete("/:id/tags/:tagName", commitController.removeTagFromCommit);

export default router;
