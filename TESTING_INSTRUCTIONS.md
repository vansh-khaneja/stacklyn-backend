# Stacklyn Backend Testing Instructions

## 1. Prerequisites
Ensure you have the dependencies installed:
```bash
npm install
# or
yarn install
```

## 2. Start the Server
The backend server must be running for the tests to work.
Open a terminal and run:
```bash
npm run dev
# or
yarn dev
```
> **Important:** Keep this terminal open and leaving the server running.

## 3. Running the Tests
We have two scripts available for verification. Open a **new, separate terminal** to run these commands.

### Option A: Clean API Test (`test-api.ts`)
This is the recommended script. It sends real HTTP requests to your running server (`localhost:3000`) and verifies the full lifecycle:
`User -> Project -> Prompt -> Commit -> Run -> Score -> Tag`

**Run command:**
```bash
npx ts-node test-api.ts
```

### Option B: Legacy Flow (`test-flow.ts`)
This file contains the original mock-based logic (commented out for reference) plus the new real API test logic appended at the end.

**Run command:**
```bash
npx ts-node test-flow.ts
```

## 4. Reviewing Results
A log of a successful test run has been saved to:
📄 **`test-api-results.log`**

You can refer to this file to see:
- Expected output format
- API response structures
- Generated IDs

---
**Troubleshooting:**
- **Connection Refused?** Make sure you ran `npm run dev` in a separate terminal.
- **Database Errors?** Ensure your `.env` file is set up correctly and your database is reachable.
