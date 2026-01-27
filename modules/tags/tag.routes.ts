import { Router } from "express";
import * as tagController from "./tag.controller";

const router = Router();

router.get("/", tagController.getAllTags);
router.get("/search", tagController.searchTags);
router.get("/:name/commits", tagController.getCommitsByTagName);
router.delete("/:name", tagController.deleteTag);
router.put("/:name", tagController.renameTag);

export default router;
