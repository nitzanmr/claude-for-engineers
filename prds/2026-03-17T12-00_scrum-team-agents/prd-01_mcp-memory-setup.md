# PRD-01: MCP Memory + Context Setup

Created: 2026-03-17 12:00 UTC
Status: PENDING
Depends on: None
Complexity: Low

## Objective

Set up the MCP memory server and per-project context infrastructure so agents can store and retrieve persistent, project-scoped memory.

## Context

The MCP memory server (`@modelcontextprotocol/server-memory`) provides a knowledge graph accessible via Claude Code tools. Configured per-project via `.claude/settings.json`, each project gets an isolated memory file. A shared `current-topic.md` tells all agents what the team is working on without being asked.

## Tasks

### Task 1: Configure MCP Memory Server for This Project

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/settings.json

New file — configures the MCP memory server for this project. Points to a project-local memory file for isolation.

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_FILE_PATH": ".claude/memory/agent-memory.json"
      }
    }
  }
}
```

> Note: If `MEMORY_FILE_PATH` env var is not supported by the installed version of `@modelcontextprotocol/server-memory`, check the server's README for the correct flag. The goal is to point the memory file at `.claude/memory/agent-memory.json` relative to the project root.

#### Acceptance Criteria

- [ ] `.claude/settings.json` created with correct MCP server config
- [ ] Running `npx @modelcontextprotocol/server-memory --help` succeeds (confirms package is available via npx)
- [ ] File is valid JSON: `node -e "require('./.claude/settings.json')" && echo OK`

---

### Task 2: Create Memory Directory with Gitignore

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/memory/.gitignore

The memory DB file is project-local state that should NOT be committed to git. This gitignore ensures the memory file itself is excluded while keeping the directory tracked.

```
# Agent memory database — project-local state, do not commit
agent-memory.json
```

#### Acceptance Criteria

- [ ] `.claude/memory/.gitignore` created
- [ ] `.claude/memory/agent-memory.json` would be ignored by git: `git check-ignore -v .claude/memory/agent-memory.json` returns a match

---

### Task 3: Create Current Topic Context File

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/context/current-topic.md

Shared context file read by every agent on invocation. Updated by `/plan`, `/execute`, `/set-context`, or manually by the engineer.

```markdown
# Current Topic

Updated: <!-- timestamp -->
Active PRD: <!-- e.g. prds/2026-03-17T12-00_scrum-team-agents/ or "none" -->
Feature: <!-- e.g. "Scrum team agent personas" -->
Phase: <!-- PLANNING | PRD | EXECUTION | REVIEW | NONE -->

## What We're Building
<!-- 2-3 sentences describing the current feature or task -->

## Key Decisions So Far
<!-- bullet list of decisions made — add as planning progresses -->
-

## Open Questions
<!-- anything unresolved the team is still debating -->
-

## Team Notes
<!-- cross-agent notes — any agent can add here -->
-
```

#### Acceptance Criteria

- [ ] `.claude/context/current-topic.md` created with correct template structure
- [ ] File is valid markdown (no syntax errors)

---

### Task 4: Add Per-Project Setup Instructions to CLAUDE.md

**Status:** PENDING
**Complexity:** Low
**Depends on:** Task 1, Task 2, Task 3

#### File Changes

##### MODIFY: CLAUDE.md

**Add new section** (after the `## PRDs Location` section, before `## Project-Specific Setup`):

```markdown
## Agent Memory Setup

Each project that uses the scrum team agents needs a one-time setup:

1. **Copy `.claude/settings.json`** from this repo into your project root. This configures the MCP memory server to store agent memory in `.claude/memory/agent-memory.json` (project-local, git-ignored).

2. **Copy `.claude/context/current-topic.md`** into your project. Update it at the start of each planning session, or use `/set-context` to update it interactively.

3. **Copy `.claude/memory/.gitignore`** into your project to prevent the memory DB from being committed.

The memory file is created automatically on first agent use. Each project has completely isolated agent memory.
```

#### Acceptance Criteria

- [ ] CLAUDE.md updated with the agent memory setup section
- [ ] Section appears after `## PRDs Location`
- [ ] Instructions are accurate and complete

---

## Execution Log

*(Filled in during execution)*
