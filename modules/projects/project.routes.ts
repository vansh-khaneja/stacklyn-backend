import { Router } from "express";
import * as projectController from "./project.controller";

const router = Router();

router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/all", projectController.getAllUserProjects);
router.get("/memberships", projectController.getMyMemberships);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);
router.get("/:id/members", projectController.getProjectMembers);
router.post("/:id/members", projectController.addProjectMember);
router.post("/:id/members/email", projectController.addProjectMemberByEmail);
router.put("/:id/members/:userId", projectController.updateMemberRole);
router.delete("/:id/members/:userId", projectController.removeProjectMember);
router.get("/user/:userId", projectController.getProjectsByUserId);

export default router;
