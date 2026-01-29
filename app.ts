import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware";
import { requireAuth, extractClerkUser } from "./middlewares/clerk.middleware";
import userRoutes from "./modules/users/user.route";
import projectRoutes from "./modules/projects/project.routes";
import promptRoutes from "./modules/prompts/prompt.routes";
import commitRoutes from "./modules/commits/commit.routes";
import runRoutes from "./modules/runs/run.routes";
import scoreRoutes from "./modules/scores/score.routes";
import tagRoutes from "./modules/tags/tag.routes";
import searchRoutes from "./modules/search/search.routes";
import activityRoutes from "./modules/activities/activity.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Public routes
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "stacklyn-backend",
  });
});

// Protected routes - require Clerk authentication
app.use("/api", requireAuth, extractClerkUser);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/runs", runRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/activities", activityRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Unauthenticated') {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
