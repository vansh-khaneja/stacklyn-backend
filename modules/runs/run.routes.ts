import { Router } from "express";
import * as runController from "./run.controller";

const router = Router();

router.post("/", runController.createRun);
router.post("/execute", runController.executeCommit);
router.get("/", runController.getAllRuns);
router.get("/:id", runController.getRunById);
router.put("/:id", runController.updateRun);
router.delete("/:id", runController.deleteRun);
router.get("/commit/:commitId", runController.getRunsByCommitId);
router.get("/model/:modelName", runController.getRunsByModelName);
router.get("/status/:status", runController.getRunsByStatus);

export default router;
