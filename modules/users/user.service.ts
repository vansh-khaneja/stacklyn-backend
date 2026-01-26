import * as userRepo from "./user.repo";

export const createUser = async (data: { email: string; name?: string }) => {
  const existingUser = await userRepo.getUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  return userRepo.createUser(data);
};

export const getUserById = async (id: string) => {
  const user = await userRepo.getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await userRepo.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateUser = async (
  id: string,
  data: { email?: string; name?: string }
) => {
  await getUserById(id);
  return userRepo.updateUser(id, data);
};

export const deleteUser = async (id: string) => {
  await getUserById(id);
  return userRepo.deleteUser(id);
};

export const getUserProjects = async (userId: string) => {
  await getUserById(userId);
  return userRepo.getUserProjects(userId);
};

export const getAllUsers = async () => {
  return userRepo.getAllUsers();
};
