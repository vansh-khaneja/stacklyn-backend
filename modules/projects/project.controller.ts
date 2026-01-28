import { Request, Response } from "express";
import * as projectService from "./project.service";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req as any).userId; // DB user UUID

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const project = await projectService.createProject({
      name,
      description,
      created_by: userId, // Use DB user UUID
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    res.json(project);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // DB user UUID

    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Filter projects by the authenticated user's DB UUID
    const projects = await projectService.getProjectsByUserId(userId);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const project = await projectService.updateProject(id, { name, description });
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getProjectMembers = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const members = await projectService.getProjectMembers(id);
    res.json(members);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const addProjectMember = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const member = await projectService.addProjectMember(id, userId, role);
    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeProjectMember = async (
  req: Request<{ id: string; userId: string }>,
  res: Response
) => {
  try {
    const { id, userId } = req.params;
    await projectService.removeProjectMember(id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getProjectsByUserId = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const projects = await projectService.getProjectsByUserId(userId);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProjectMemberByEmail = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const member = await projectService.addProjectMemberByEmail(id, email, role);
    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
