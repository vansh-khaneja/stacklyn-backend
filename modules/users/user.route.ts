import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/email/:email", userController.getUserByEmail);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/:id/projects", userController.getUserProjects);

export default router;
