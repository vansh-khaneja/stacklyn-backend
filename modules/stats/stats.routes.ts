import { Router } from "express";
import * as statsController from "./stats.controller";

const router = Router();

router.get("/dashboard", statsController.getDashboardStats);

export default router;
