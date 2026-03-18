# PRD-01: Settings.json Security Fixes

Created: 2026-03-18 11:15 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Remove the developer's real filesystem path from committed settings.json, pin the MCP npm package to a specific version, and block destructive MCP memory operations.

## Context

Three security issues found in `.claude/settings.json`:
1. Real developer path `/Users/nitzanmr/...` committed to a public repo (PII leak)
2. `@modelcontextprotocol/server-memory` installed with no version pin via `npx -y` (supply chain risk)
3. Destructive MCP memory ops (`delete_entities`, `delete_observations`, `delete_relations`) unrestricted

The fix moves the machine-specific `MEMORY_FILE_PATH` to `settings.local.json` (which will be gitignored) and keeps `settings.json` as a clean committed template.

## Tasks

### Task 1: Add settings.local.json to .gitignore

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: .gitignore

**Append** (at the end of the file, after the last line):

```
.claude/settings.local.json
```

#### Acceptance Criteria

- [ ] `git check-ignore -v .claude/settings.local.json` outputs a match
- [ ] Existing `.gitignore` rules are unchanged above the new line

---

### Task 2: Move MEMORY_FILE_PATH to settings.local.json

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 1

#### File Changes

##### MODIFY: .claude/settings.json

**Replace** the entire file content with:

```json
{
  "mcpServers": {
    "memory": {
      "command": "/usr/local/bin/npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_FILE_PATH": "REPLACE_WITH_ABSOLUTE_PATH/.claude/memory/agent-memory.json"
      }
    }
  },
  "permissions": {
    "allow": [
      "TeamCreate",
      "TaskCreate",
      "TaskList",
      "TaskUpdate",
      "TaskGet",
      "SendMessage"
    ],
    "deny": [
      "mcp__memory__delete_entities",
      "mcp__memory__delete_observations",
      "mcp__memory__delete_relations"
    ]
  }
}
```

Note: The `deny` block is added in this same task (covering Task 4 below) to avoid a second full-file rewrite.

##### MODIFY: .claude/settings.local.json

**Replace** the entire file content with:

```json
{
  "mcpServers": {
    "memory": {
      "env": {
        "MEMORY_FILE_PATH": "/Users/nitzanmr/claude-for-engineers/.claude/memory/agent-memory.json"
      }
    }
  },
  "permissions": {
    "allow": [
      "mcp__memory__search_nodes"
    ]
  }
}
```

This preserves the existing `mcp__memory__search_nodes` allow rule and adds the real path in the gitignored local file.

#### Acceptance Criteria

- [ ] `cat .claude/settings.json | grep "nitzanmr"` returns empty (no real path in committed file)
- [ ] `cat .claude/settings.json | grep "REPLACE_WITH_ABSOLUTE_PATH"` returns 1 match
- [ ] `cat .claude/settings.local.json | grep "nitzanmr"` returns the real path
- [ ] `.claude/settings.local.json` is gitignored (verified in Task 1)
- [ ] Both files are valid JSON: `node -e "require('./.claude/settings.json')" && echo OK`
- [ ] Both files are valid JSON: `node -e "require('./.claude/settings.local.json')" && echo OK`

---

### Task 3: Pin MCP npm package to a specific version

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 2

#### File Changes

##### MODIFY: .claude/settings.json

The `args` array currently contains `["-y", "@modelcontextprotocol/server-memory"]`. Pin it to a specific version.

**Step 1:** Run this command to get the current latest version:
```bash
npm view @modelcontextprotocol/server-memory version
```

**Step 2:** Update the `args` array in `.claude/settings.json` (inside `mcpServers.memory`):

```json
"args": ["-y", "@modelcontextprotocol/server-memory@VERSION"]
```

Replace `VERSION` with the actual version string returned by the command (e.g., `"args": ["-y", "@modelcontextprotocol/server-memory@2.1.0"]`).

#### Acceptance Criteria

- [ ] `cat .claude/settings.json | grep "@modelcontextprotocol/server-memory@"` returns a match with a version number (e.g., `@2.1.0`)
- [ ] The version number contains at least one dot (e.g., `1.0.0` — not just `@modelcontextprotocol/server-memory`)
- [ ] File is still valid JSON: `node -e "require('./.claude/settings.json')" && echo OK`

---

### Task 4: Update CLAUDE.md setup instructions for settings.local.json

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 2

#### File Changes

##### MODIFY: CLAUDE.md

**Find** the section "Agent Memory Setup" (under `## Agent Memory Setup`). It currently says:

```
1. **Copy `.claude/settings.json`** from this repo into your project's `.claude/` directory. This configures the MCP memory server to store agent memory in `.claude/memory/agent-memory.json` (project-local, git-ignored).

   **After copying**, update `MEMORY_FILE_PATH` in `.claude/settings.json` to the **absolute path** of your project's memory file. The relative path in the template is CWD-sensitive: if Claude Code is launched from outside the project root the memory server will silently point to the wrong file. Example:
   ```json
   "MEMORY_FILE_PATH": "/Users/yourname/your-project/.claude/memory/agent-memory.json"
   ```
```

**Replace** with:

```
1. **Copy `.claude/settings.json`** from this repo into your project's `.claude/` directory. This configures the MCP memory server.

   **Create `.claude/settings.local.json`** (gitignored — do NOT commit it) with your absolute path:
   ```json
   {
     "mcpServers": {
       "memory": {
         "env": {
           "MEMORY_FILE_PATH": "/Users/yourname/your-project/.claude/memory/agent-memory.json"
         }
       }
     },
     "permissions": {
       "allow": [
         "mcp__memory__search_nodes"
       ]
     }
   }
   ```

   Claude Code merges `settings.json` and `settings.local.json` at startup. The local file holds your machine-specific path; the committed file stays clean for other users.

   **Important:** Never put your real absolute path in `settings.json` — it leaks your username and directory structure if the repo is public.
```

#### Acceptance Criteria

- [ ] `grep -n "nitzanmr" CLAUDE.md` returns 0 matches (no real paths in CLAUDE.md)
- [ ] `grep -n "settings.local.json" CLAUDE.md` returns at least 1 match in the Agent Memory Setup section
- [ ] The JSON code block in the new instructions is valid JSON (manually verify formatting)

---

## Execution Log

### Task 1: Add settings.local.json to .gitignore
- **Agent:** orchestrator (main conversation)
- **Mode:** task
- **Started:** 2026-03-18 11:20 UTC
- **Completed:** 2026-03-18 11:25 UTC
- **Status:** COMPLETED
- **Files modified:**
  - `.gitignore` (appended `.claude/settings.local.json`)
- **Issues encountered:**
  - Subagent hit permission denied for Edit tool; completed by orchestrator
- **Acceptance criteria:**
  - [x] `git check-ignore -v .claude/settings.local.json` outputs a match

### Task 2: Move MEMORY_FILE_PATH to settings.local.json
- **Agent:** orchestrator (main conversation)
- **Mode:** task
- **Started:** 2026-03-18 11:25 UTC
- **Completed:** 2026-03-18 11:30 UTC
- **Status:** COMPLETED
- **Files created:**
  - `.claude/settings.local.json` (with real absolute path)
- **Files modified:**
  - `.claude/settings.json` (replaced content: REPLACE_WITH_ABSOLUTE_PATH placeholder, added deny block)
- **Issues encountered:**
  - Preserved `"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }` block not in PRD spec (removing would break swarm mode)
- **Acceptance criteria:**
  - [x] `cat .claude/settings.json | grep "nitzanmr"` returns empty
  - [x] `cat .claude/settings.json | grep "REPLACE_WITH_ABSOLUTE_PATH"` returns 1 match
  - [x] `cat .claude/settings.local.json | grep "nitzanmr"` returns real path
  - [x] Both files are valid JSON

### Task 3: Pin MCP npm package to a specific version
- **Agent:** orchestrator (main conversation)
- **Mode:** task
- **Started:** 2026-03-18 11:30 UTC
- **Completed:** 2026-03-18 11:32 UTC
- **Status:** COMPLETED
- **Files modified:**
  - `.claude/settings.json` (args: `@modelcontextprotocol/server-memory@2026.1.26`)
- **Acceptance criteria:**
  - [x] `cat .claude/settings.json | grep "@modelcontextprotocol/server-memory@"` returns match with `@2026.1.26`
  - [x] File is valid JSON

### Task 4: Update CLAUDE.md setup instructions for settings.local.json
- **Agent:** orchestrator (main conversation)
- **Mode:** task
- **Started:** 2026-03-18 11:32 UTC
- **Completed:** 2026-03-18 11:35 UTC
- **Status:** COMPLETED
- **Files modified:**
  - `CLAUDE.md` (Agent Memory Setup section updated to reference settings.local.json)
- **Acceptance criteria:**
  - [x] `grep -n "nitzanmr" CLAUDE.md` returns 0 matches
  - [x] `grep -n "settings.local.json" CLAUDE.md` returns matches in Agent Memory Setup section
