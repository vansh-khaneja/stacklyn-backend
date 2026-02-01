import { config } from "dotenv";
config();

import * as userController from "./modules/users/user.controller";
import * as projectController from "./modules/projects/project.controller";
import * as promptController from "./modules/prompts/prompt.controller";
import * as commitController from "./modules/commits/commit.controller";
import * as runController from "./modules/runs/run.controller";
import * as tagController from "./modules/tags/tag.controller";

// Mock request and response objects
function mockReq(body: any = {}, params: any = {}) {
  return { body, params } as any;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      console.log(`Response [${this.statusCode}]:`, JSON.stringify(data, null, 2));
      return this;
    },
    send() {
      console.log(`Response [${this.statusCode}]: No content`);
      return this;
    },
  };
  return res;
}

//////////////////////////// create user


// async function testCreateUser() {
//   const req = mockReq({ email: "vk@gmail.com", name: "Vansh Khaneja" });
//   const res = mockRes();
//   await userController.createUser(req, res);
//   return res.data;
// }


////////////////////////////// create project for that user


// async function testCreateProject() {
//   const req = mockReq({
//     name: "webyrix",
//     description: "a project to build cool websites",
//     created_by: "47123874-5f6f-4eb5-a9a6-e30563eb9943",
//   });
//   const res = mockRes();
//   await projectController.createProject(req, res);
//   return res.data;
// }

// // Run
// testCreateProject().then(() => process.exit(0));


// /////////////////////////// create prompt

// async function testCreatePrompt() {
//   const req = mockReq({
//     name: "TODO: website dev prompt",
//     project_id: "2518c406-6807-4601-a79e-3afd138876fb",
//     created_by: "47123874-5f6f-4eb5-a9a6-e30563eb9943",
//   });
//   const res = mockRes();
//   await promptController.createPrompt(req, res);
//   return res.data;
// }

// // Run
// testCreatePrompt().then(() => process.exit(0));


///////////////////////////// create commit

// async function testCreateCommit() {
//   const req = mockReq({
//     prompt_id: "332a20d0-967e-4318-b7b1-c84a041aa325", // Replace with actual prompt ID
//     system_prompt: "You are an expert web developer. Create clean, modern Reactjs based website.",
//     user_query: "Create a hero section for a tech startup website",
//     commit_message: "Initial hero section prompt",
//     created_by: "47123874-5f6f-4eb5-a9a6-e30563eb9943",
//   });
//   const res = mockRes();
//   await commitController.createCommit(req, res);
//   return res.data;
// }

// Run
// testCreateCommit().then(() => process.exit(0));


///////////////////////////// execute commit (call LLM)

// async function testExecuteCommit() {
//   const req = mockReq({
//     commit_id: "2664ca5a-92b8-4601-8ec6-fe34c5f78552", // Replace with actual commit ID
//     model: "openai/gpt-oss-120b", // or: llama-3.1-8b-instant, openai/gpt-oss-120b, openai/gpt-oss-20b
//   });
//   const res = mockRes();
//   await runController.executeCommit(req, res);
//   return res.data;
// }

// // Run
// testExecuteCommit().then(() => process.exit(0));


///////////////////////////// create score (dummy for now)

// async function testCreateScore() {
//   const req = mockReq({
//     commit_id: "2664ca5a-92b8-4601-8ec6-fe34c5f78552", // Replace with actual commit ID
//     score: 0.85, // Score between 0 and 1
//     scorer: "human", // or "auto", "llm-judge", etc.
//     reference_prompt: "Expected a clean hero section with CTA",
//     actual_prompt: "Got a hero section with headline and button",
//     reasoning: "Good structure but missing some details",
//   });
//   const res = mockRes();
//   await scoreController.createScore(req, res);
//   return res.data;
// }

// // Run
// testCreateScore().then(() => process.exit(0));


///////////////////////////// add tag to commit

// Add tag directly to a commit
// async function testAddTagToCommit() {
//   const req = mockReq(
//     { tagName: "main" },   // body - just the tag name
//     { id: "2664ca5a-92b8-4601-8ec6-fe34c5f78552" }    // params (commit id)
//   );
//   const res = mockRes();
//   await commitController.addTagToCommit(req, res);
//   return res.data;
// }


///////////////////////////// get all projects for a user

// async function testGetProjectsByUserId() {
//   const req = mockReq(
//     {},   // body - empty
//     { userId: "47123874-5f6f-4eb5-a9a6-e30563eb9943" }    // params (user id)
//   );
//   const res = mockRes();
//   await projectController.getProjectsByUserId(req, res);
//   return res.data;
// }

// // Run
// testGetProjectsByUserId().then(() => process.exit(0));


///////////////////////////// get all prompts for a project

// async function testGetPromptsByProjectId() {
//   const req = mockReq(
//     {},   // body - empty
//     { projectId: "9201c71a-cd99-4317-9e62-5e9807e7e503" }    // params (project id)
//   );
//   const res = mockRes();
//   await promptController.getPromptsByProjectId(req, res);
//   return res.data;
// }

// // Run
// testGetPromptsByProjectId().then(() => process.exit(0));


///////////////////////////// get all commits for a prompt

// async function testGetCommitsByPromptId() {
//   const req = mockReq(
//     {},   // body - empty
//     { promptId: "332a20d0-967e-4318-b7b1-c84a041aa325" }    // params (prompt id)
//   );
//   const res = mockRes();
//   await commitController.getCommitsByPromptId(req, res);
//   return res.data;
// }

// // Run
// testGetCommitsByPromptId().then(() => process.exit(0));


///////////////////////////// get all runs for a commit

// async function testGetRunsByCommitId() {
//   const req = mockReq(
//     {},
//     { commitId: "2664ca5a-92b8-4601-8ec6-fe34c5f78552" }
//   );
//   const res = mockRes();
//   await runController.getRunsByCommitId(req, res);
//   return res.data;
// }

// // Run
// testGetRunsByCommitId().then(() => process.exit(0));


///////////////////////////// delete a prompt

// async function testDeletePrompt() {
//   const req = mockReq(
//     {},
//     { id: "332a20d0-967e-4318-b7b1-c84a041aa325" }  // replace with actual prompt id
//   );
//   const res = mockRes();
//   await promptController.deletePrompt(req, res);
//   return res.data;
// }

// // Run
// testDeletePrompt().then(() => process.exit(0));


///////////////////////////// delete a project

// async function testDeleteProject() {
//   const req = mockReq(
//     {},
//     { id: "9201c71a-cd99-4317-9e62-5e9807e7e503" }  // replace with actual project id
//   );
//   const res = mockRes();
//   await projectController.deleteProject(req, res);
//   return res.data;
// }

// // Run
// testDeleteProject().then(() => process.exit(0));


///////////////////////////// update project title and description

// async function testUpdateProject() {
//   const req = mockReq(
//     { name: "New Project Name", description: "Updated description" },
//     { id: "2518c406-6807-4601-a79e-3afd138876fb" }  // replace with actual project id
//   );
//   const res = mockRes();
//   await projectController.updateProject(req, res);
//   return res.data;
// }

// // Run
// testUpdateProject().then(() => process.exit(0));


///////////////////////////// update prompt name

// async function testUpdatePrompt() {
//   const req = mockReq(
//     { name: "Updated Prompt Name" },
//     { id: "f776e160-be32-4eb0-a539-781206805ccb" }  // replace with actual prompt id
//   );
//   const res = mockRes();
//   await promptController.updatePrompt(req, res);
//   return res.data;
// }

// // Run
// testUpdatePrompt().then(() => process.exit(0));
