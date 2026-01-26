# Stacklyn - Prompt Versioning System

A backend system for versioning and managing AI prompts, similar to Git but for prompts.

## API Functions

### Users
| Function | Description |
|----------|-------------|
| `userController.createUser` | Create a new user with email and name |

### Projects
| Function | Description |
|----------|-------------|
| `projectController.createProject` | Create a new project for a user |
| `projectController.getProjectsByUserId` | Get all projects owned by a user |

### Prompts
| Function | Description |
|----------|-------------|
| `promptController.createPrompt` | Create a new prompt within a project |
| `promptController.getPromptsByProjectId` | Get all prompts for a specific project |

### Commits
| Function | Description |
|----------|-------------|
| `commitController.createCommit` | Create a new commit (version) for a prompt with system_prompt and user_query |
| `commitController.getCommitsByPromptId` | Get all commits (versions) for a specific prompt |
| `commitController.addTagToCommit` | Add a tag (like "main", "v1.0") to a commit |

### Runs
| Function | Description |
|----------|-------------|
| `runController.executeCommit` | Execute a commit by calling LLM and save the response |

### Scores
| Function | Description |
|----------|-------------|
| `scoreController.createScore` | Create a score/evaluation for a commit run |

### Tags
| Function | Description |
|----------|-------------|
| `tagController.getAllTags` | Get all unique tags used across commits |

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
```

## Environment Variables

```
DATABASE_URL=your_postgres_connection_string
GROQ_API_KEY=your_groq_api_key
```

## LLM Models Supported

- `llama-3.3-70b-versatile` (default)
- `llama-3.1-8b-instant`
- `openai/gpt-oss-120b`
- `openai/gpt-oss-20b`
