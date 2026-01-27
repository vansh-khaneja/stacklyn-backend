import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware";
import userRoutes from "./modules/users/user.route";
import projectRoutes from "./modules/projects/project.routes";
import promptRoutes from "./modules/prompts/prompt.routes";
import commitRoutes from "./modules/commits/commit.routes";
import runRoutes from "./modules/runs/run.routes";
import scoreRoutes from "./modules/scores/score.routes";
import tagRoutes from "./modules/tags/tag.routes";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/runs", runRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/tags", tagRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "stacklyn-backend",
  });
});

export default app;
