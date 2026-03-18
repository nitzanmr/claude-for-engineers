# PRD-03: BLG-024 — Add absolute MEMORY_FILE_PATH setup instruction to CLAUDE.md

Created: 2026-03-18 06:18 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Add an explicit instruction to CLAUDE.md's Agent Memory Setup section warning users to replace the relative `MEMORY_FILE_PATH` with an absolute path after copying `settings.json` into their project.

## Context

`settings.json` ships with `"MEMORY_FILE_PATH": ".claude/memory/agent-memory.json"`. The MCP memory server resolves this relative to the working directory of the shell that launched Claude Code. If Claude Code is opened from a directory other than the project root (e.g., from a parent directory in VS Code), the memory server silently points to the wrong path and all agent memory is isolated or lost. The template file can't contain an absolute path, so the fix is a setup instruction that makes this CWD-sensitivity explicit and tells users to set the absolute path manually.

## Tasks

### Task 1: Add absolute path warning to CLAUDE.md Agent Memory Setup step 1

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: CLAUDE.md

**Find** step 1 in the "Agent Memory Setup" section (the line starting with "1. **Copy `.claude/settings.json`**"):

```
1. **Copy `.claude/settings.json`** from this repo into your project's `.claude/` directory. This configures the MCP memory server to store agent memory in `.claude/memory/agent-memory.json` (project-local, git-ignored).
```

**Replace** with:

```
1. **Copy `.claude/settings.json`** from this repo into your project's `.claude/` directory. This configures the MCP memory server to store agent memory in `.claude/memory/agent-memory.json` (project-local, git-ignored).

   **After copying**, update `MEMORY_FILE_PATH` in `.claude/settings.json` to the **absolute path** of your project's memory file. The relative path in the template is CWD-sensitive: if Claude Code is launched from outside the project root the memory server will silently point to the wrong file. Example:
   ```json
   "MEMORY_FILE_PATH": "/Users/yourname/your-project/.claude/memory/agent-memory.json"
   ```
```

#### Acceptance Criteria

- [ ] CLAUDE.md Agent Memory Setup step 1 contains the warning about the relative path being CWD-sensitive
- [ ] The instruction explicitly tells users to replace the value with an absolute path after copying
- [ ] A JSON example showing the absolute path format is included

---

## Execution Log

### Task 1: Add absolute path warning to CLAUDE.md Agent Memory Setup step 1
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-18 06:37 UTC
- **Completed:** 2026-03-18 06:38 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - CLAUDE.md (Agent Memory Setup step 1 extended with CWD warning and absolute path JSON example)
- **Files deleted:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] CLAUDE.md Agent Memory Setup step 1 contains the CWD-sensitive warning
  - [x] Instruction tells users to replace with absolute path after copying
  - [x] JSON example showing absolute path format is included
