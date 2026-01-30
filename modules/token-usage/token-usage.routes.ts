import { Router } from "express";
import * as tokenUsageController from "./token-usage.controller";

const router = Router();

router.get("/me", tokenUsageController.getMyTokenUsage);

export default router;
