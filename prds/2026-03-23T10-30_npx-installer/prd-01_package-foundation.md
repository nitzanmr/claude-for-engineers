# PRD-01: Package Foundation

Created: 2026-03-23 10:35 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Create the npm package scaffold and the `templates/` directory with all canonical source files ready to ship, with no absolute paths or publisher-specific config.

## Context

The repo currently has no `package.json`, no `bin/` directory, and `.claude/settings.json` contains the publisher's real absolute path. This PRD creates the foundation everything else builds on. No installer logic yet — just structure and assets.

## Tasks

---

### Task 1: Create `package.json`

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### CREATE: package.json

```json
{
  "name": "claude-for-engineers",
  "version": "0.1.0",
  "description": "Install the claude-for-engineers AI workflow into your project",
  "license": "MIT",
  "engines": {
    "node": ">=20.0.0"
  },
  "bin": {
    "claude-for-engineers": "bin/install.js"
  },
  "files": [
    "bin/",
    "lib/",
    "templates/",
    "README.md"
  ],
  "keywords": [
    "claude",
    "gemini",
    "ai",
    "workflow",
    "planning",
    "prd",
    "agents",
    "skills"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_ORG/claude-for-engineers"
  }
}
```

#### Acceptance Criteria
- [ ] `node -e "require('./package.json')"` runs without error
- [ ] `npm pack --dry-run` output lists only files under `bin/`, `lib/`, `templates/`, and `README.md`
- [ ] `npm pack --dry-run` output does NOT contain `settings.local.json`, `agent-memory.json`, `prds/`, or any path containing `/Users/`

---

### Task 2: Create `templates/` directory with canonical content

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### CREATE: templates/.claude/settings.json

Sanitized version of `.claude/settings.json` — remove publisher's absolute path, remove `context7` server, change hardcoded `npx` path to portable `npx`:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory@2026.1.26"],
      "env": {
        "MEMORY_FILE_PATH": "REPLACE_WITH_LOCAL_PATH"
      }
    }
  },
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
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

##### CREATE: templates/.claude/memory/.gitignore

```
agent-memory.json
```

##### CREATE: templates/.claude/context/current-topic.md

```markdown
# Current Topic

Updated: REPLACE_WITH_DATE
Active PRD: none
Feature: REPLACE_WITH_FEATURE_NAME
Phase: PLANNING

## What We're Building
REPLACE_WITH_DESCRIPTION

## Key Decisions So Far
- None yet

## Open Questions
- None yet

## Team Notes
- Run /set-context to update this file interactively
```

##### COPY (via installer task): templates/.claude/skills/

Copy all 15 SKILL.md files from `.claude/skills/` into `templates/.claude/skills/`, preserving subdirectory structure. Each file goes to `templates/.claude/skills/<skill-name>/SKILL.md`.

Skills to copy:
- `plan`, `prd`, `execute`, `retro`
- `team-research`, `team-review`
- `set-context`, `check-setup`, `pm-backlog`
- `pm-review`, `qa-review`, `security-review`, `devops-review`, `dba-review`, `pentest`

##### COPY (via installer task): templates/.claude/agents/

Copy all 6 agent `.md` files from `.claude/agents/` into `templates/.claude/agents/`:
- `product-manager.md`, `qa-automation.md`, `security-expert.md`
- `devops-engineer.md`, `dba-expert.md`, `penetration-agent.md`

##### COPY (via installer task): templates/.claude/rules/

Copy all 3 rule `.md` files from `.claude/rules/` into `templates/.claude/rules/`:
- `workflow.md`, `prd-format.md`, `session-memory-schema.md`

##### CREATE: templates/CLAUDE.md

Copy the root `CLAUDE.md` to `templates/CLAUDE.md`. This is the file installed at the user's project root.

> Implementation note: the file copy tasks above should be done by the agent using `cp -r` or equivalent. The files must be exact copies — no content modification.

#### Acceptance Criteria
- [ ] `templates/.claude/settings.json` contains `"REPLACE_WITH_LOCAL_PATH"` (not a real path)
- [ ] `templates/.claude/settings.json` does NOT contain `context7` or `/Users/`
- [ ] `templates/.claude/skills/` has exactly 15 subdirectories, each with a `SKILL.md`
- [ ] `templates/.claude/agents/` has exactly 6 `.md` files
- [ ] `templates/.claude/rules/` has exactly 3 `.md` files
- [ ] `templates/CLAUDE.md` exists

---

### Task 3: Clean up `.claude/.claude/` nested artifact

**Status:** COMPLETED
**Complexity:** Low

The file tree shows a `.claude/.claude/` nested directory exists. This is an accidental artifact of the publisher's own setup and must be removed before publishing.

#### File Changes

##### DELETE: .claude/.claude/

Remove the entire `.claude/.claude/` directory and its contents.

Run: `rm -rf .claude/.claude/`

#### Acceptance Criteria
- [ ] `ls .claude/` does NOT show a `.claude` subdirectory
- [ ] No files under `.claude/.claude/` remain

---

### Task 4: Create empty `bin/` and `lib/` directory stubs

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### CREATE: bin/.gitkeep

Empty file to track the `bin/` directory in git before `install.js` is written in PRD-02.

##### CREATE: lib/.gitkeep

Empty file to track the `lib/` directory in git before lib files are written in PRD-02.

##### UPDATE: .gitignore

Add npm publish artifacts (after existing entries):

```
# npm
*.tgz
node_modules/
```

(Note: `node_modules/` is likely already present — only add if missing.)

#### Acceptance Criteria
- [ ] `bin/` directory exists
- [ ] `lib/` directory exists
- [ ] `.gitignore` contains `*.tgz`

---

## Execution Log

### Task 1: Create `package.json`
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:30 UTC
- **Completed:** 2026-03-23 10:32 UTC
- **Status:** COMPLETED
- **Files created:**
  - package.json
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node -e "require('./package.json')"` - PASS
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `node -e "require('./package.json')"` runs without error
  - [x] `npm pack --dry-run` output lists only files under `bin/`, `lib/`, `templates/`, and `README.md`
  - [x] `npm pack --dry-run` output does NOT contain `settings.local.json`, `agent-memory.json`, `prds/`, or any path containing `/Users/`

### Task 2: Create `templates/` directory with canonical content
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:30 UTC
- **Completed:** 2026-03-23 10:32 UTC
- **Status:** COMPLETED
- **Files created:**
  - templates/.claude/settings.json
  - templates/.claude/memory/.gitignore
  - templates/.claude/context/current-topic.md
  - templates/.claude/skills/check-setup/SKILL.md
  - templates/.claude/skills/dba-review/SKILL.md
  - templates/.claude/skills/devops-review/SKILL.md
  - templates/.claude/skills/execute/SKILL.md
  - templates/.claude/skills/pentest/SKILL.md
  - templates/.claude/skills/plan/SKILL.md
  - templates/.claude/skills/pm-backlog/SKILL.md
  - templates/.claude/skills/pm-review/SKILL.md
  - templates/.claude/skills/prd/SKILL.md
  - templates/.claude/skills/qa-review/SKILL.md
  - templates/.claude/skills/retro/SKILL.md
  - templates/.claude/skills/security-review/SKILL.md
  - templates/.claude/skills/set-context/SKILL.md
  - templates/.claude/skills/team-research/SKILL.md
  - templates/.claude/skills/team-review/SKILL.md
  - templates/.claude/agents/dba-expert.md
  - templates/.claude/agents/devops-engineer.md
  - templates/.claude/agents/penetration-agent.md
  - templates/.claude/agents/product-manager.md
  - templates/.claude/agents/qa-automation.md
  - templates/.claude/agents/security-expert.md
  - templates/.claude/rules/prd-format.md
  - templates/.claude/rules/session-memory-schema.md
  - templates/.claude/rules/workflow.md
  - templates/CLAUDE.md
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] templates/.claude/settings.json contains "REPLACE_WITH_LOCAL_PATH"
  - [x] templates/.claude/settings.json does NOT contain context7 or /Users/
  - [x] templates/.claude/skills/ has exactly 15 subdirectories, each with a SKILL.md
  - [x] templates/.claude/agents/ has exactly 6 .md files
  - [x] templates/.claude/rules/ has exactly 3 .md files
  - [x] templates/CLAUDE.md exists

### Task 3: Clean up `.claude/.claude/` nested artifact
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:30 UTC
- **Completed:** 2026-03-23 10:32 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:** (none)
- **Files deleted:**
  - .claude/.claude/ (entire directory, contained settings.local.json)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `ls .claude/` does NOT show a `.claude` subdirectory
  - [x] No files under `.claude/.claude/` remain

### Task 4: Create empty `bin/` and `lib/` directory stubs
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:30 UTC
- **Completed:** 2026-03-23 10:32 UTC
- **Status:** COMPLETED
- **Files created:**
  - bin/.gitkeep
  - lib/.gitkeep
- **Files modified:**
  - .gitignore (appended `# npm` and `*.tgz`; node_modules/ already present, not duplicated)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `bin/` directory exists
  - [x] `lib/` directory exists
  - [x] `.gitignore` contains `*.tgz`
