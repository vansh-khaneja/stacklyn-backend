import { config } from "dotenv";
config();

const BASE_URL = "http://localhost:3000/api";

// Helper for logging
const logStep = (msg: string) => console.log(`\n👉 ${msg}`);
const logSuccess = (msg: string, data: any) => console.log(`✅ ${msg}:`, data);

async function testCreateUser() {
    logStep("Creating User...");
    const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: `test_${Date.now()}@example.com`,
            name: "Test User"
        }),
    });
    const data = await res.json();
    if (!data.id) throw new Error("User creation failed");
    logSuccess("Created User", data);
    return data;
}

async function testCreateProject(userId: string) {
    logStep("Creating Project...");
    const res = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Webyrix",
            description: "A project to build cool websites",
            created_by: userId
        }),
    });
    const data = await res.json();
    if (!data.id) throw new Error("Project creation failed");
    logSuccess("Created Project", data);
    return data;
}

async function testCreatePrompt(userId: string, projectId: string) {
    logStep("Creating Prompt...");
    const res = await fetch(`${BASE_URL}/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Hero Section Prompt",
            project_id: projectId,
            created_by: userId
        }),
    });
    const data = await res.json();
    if (!data.id) throw new Error("Prompt creation failed");
    logSuccess("Created Prompt", data);
    return data;
}

async function testCreateCommit(userId: string, promptId: string) {
    logStep("Creating Commit...");
    const res = await fetch(`${BASE_URL}/commits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            prompt_id: promptId,
            system_prompt: "You are an expert react dev.",
            user_query: "Make a hero section.",
            commit_message: "Initial commit",
            created_by: userId
        }),
    });
    const data = await res.json();
    if (!data.id) throw new Error("Commit creation failed");
    logSuccess("Created Commit", data);
    return data;
}

async function testExecuteCommit(commitId: string) {
    logStep("Creating Run (Execution Result)...");
    const res = await fetch(`${BASE_URL}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            commit_id: commitId,
            model_name: "gpt-4",
            response: "<html>Hero Content</html>",
            latency_ms: 1200,
            token_usage: 150,
            status: "success"
        }),
    });
    const data = await res.json();
    if (!data.id) throw new Error("Run creation failed");
    logSuccess("Created Run", data);
    return data;
}

async function testCreateScore(commitId: string) {
    logStep("Creating Score...");
    const res = await fetch(`${BASE_URL}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            commit_id: commitId,
            score: 0.95,
            scorer: "human",
            reference_prompt: "N/A",
            actual_prompt: "N/A",
            reasoning: "Looks good"
        }),
    });
    const data = await res.json();
    if (!data.id) throw new Error("Score creation failed");
    logSuccess("Created Score", data);
    return data;
}

async function testAddTagToCommit(commitId: string) {
    logStep("Adding Tag...");
    const res = await fetch(`${BASE_URL}/commits/${commitId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: "v1.0" }),
    });
    const data = await res.json();
    logSuccess("Added Tag to Commit", data);
    return data;
}

// -------------------------------------------------------------
// MAIN EXECUTION FLOW
// -------------------------------------------------------------
async function runAllTests() {
    console.log("🚀 Starting Stacklyn Real API Verification...");
    console.log("-----------------------------------------");

    try {
        const user = await testCreateUser();
        const project = await testCreateProject(user.id);
        const prompt = await testCreatePrompt(user.id, project.id);
        const commit = await testCreateCommit(user.id, prompt.id);

        await testExecuteCommit(commit.id);
        await testCreateScore(commit.id);
        await testAddTagToCommit(commit.id);

        console.log("-----------------------------------------");
        console.log("🎉 SUCCESS: All API routes verified!");

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
        process.exit(1);
    }
}

runAllTests();
