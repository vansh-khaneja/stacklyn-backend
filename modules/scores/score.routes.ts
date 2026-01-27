import { Router } from "express";
import * as scoreController from "./score.controller";

const router = Router();

router.post("/", scoreController.createScore);
router.get("/", scoreController.getAllScores);
router.get("/:id", scoreController.getScoreById);
router.put("/:id", scoreController.updateScore);
router.delete("/:id", scoreController.deleteScore);
router.get("/commit/:commitId", scoreController.getScoresByCommitId);
router.get("/scorer/:scorer", scoreController.getScoresByScorer);
router.get("/commit/:commitId/average", scoreController.getAverageScoreByCommitId);
router.get("/search/threshold", scoreController.getScoresAboveThreshold);

export default router;
