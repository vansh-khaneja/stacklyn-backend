
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000/api";

async function main() {
    try {
        console.log("Checking GET /runs/models...");
        const res = await fetch(`${BASE_URL}/runs/models`);
        console.log(`Status: ${res.status}`);

        if (res.ok) {
            const data = await res.json();
            console.log("Response:", JSON.stringify(data, null, 2));
        } else {
            console.log("Error body:", await res.text());
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
