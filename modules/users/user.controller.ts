import { Request, Response } from "express";
import * as userService from "./user.service";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const user = await userService.createUser({ email, name });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserByEmail = async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const deleteMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await userService.deleteUser(userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { email, name, image_url } = req.body;
    const user = await userService.updateUser(userId, { email, name, image_url });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, image_url } = req.body;
    const user = await userService.updateUser(id, { email, name, image_url });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserProjects = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const projects = await userService.getUserProjects(id);
    res.json(projects);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
