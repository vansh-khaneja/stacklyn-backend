import { Router } from "express";
import * as apiKeysController from "./api-keys.controller";

const router = Router();

router.post("/", apiKeysController.createApiKey);
router.get("/", apiKeysController.getMyApiKeys);
router.patch("/:id/revoke", apiKeysController.revokeApiKey);
router.delete("/:id", apiKeysController.deleteApiKey);

export default router;
