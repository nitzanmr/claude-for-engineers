# PRD-05: /check-setup Validation Skill

Created: 2026-03-18 11:15 UTC
Status: COMPLETED
Depends on: PRD-01, PRD-03
Complexity: Low

## Objective

Create a `/check-setup` skill that engineers can run to verify their Claude for Engineers installation is correctly configured before starting a planning session.

## Context

The most common failure mode for new users is a misconfigured `MEMORY_FILE_PATH` — either still a placeholder, or a relative path, causing the MCP memory server to point to the wrong file with no error. This failure is silent. `/check-setup` makes it loud. It also checks that MCP is reachable and that the current-topic.md is initialized.

This PRD depends on PRD-01 (settings.json has the correct structure) and PRD-03 (validate/settings-json.js exists for reuse).

## Tasks

### Task 1: Create .claude/skills/check-setup/SKILL.md

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/check-setup/SKILL.md

```markdown
---
name: check-setup
description: Verify Claude for Engineers installation is correctly configured (settings, MCP, topic)
argument-hint: (no arguments needed)
tags: [setup, validation, config]
---

# Check Setup Skill

Verify that all required configuration for the Claude for Engineers workflow is in place. Run this before starting your first planning session or when something feels broken.

## What It Checks

1. `settings.json` — structure, MEMORY_FILE_PATH (absolute, not placeholder), pinned npm package
2. `settings.local.json` — exists, has real absolute path
3. MCP server — reachable and responding
4. `current-topic.md` — exists and is initialized (not all placeholders)
5. `.gitignore` — memory file and settings.local.json are ignored

## Execution Steps

### Step 1: Run settings-json.js validator

Run:
```bash
node validate/settings-json.js
```

If the `validate/` directory does not exist, report: "FAIL: validate/ directory not found. Run the setup instructions in CLAUDE.md to install the validate scripts."

Report the output. If it exits with an error, flag it as a setup issue to fix.

### Step 2: Check .gitignore entries

Run:
```bash
git check-ignore -v .claude/memory/agent-memory.json
git check-ignore -v .claude/settings.local.json
```

- If `agent-memory.json` is NOT ignored: report "FAIL: .claude/memory/agent-memory.json is not gitignored. Add `.claude/memory/.gitignore` with `agent-memory.json`."
- If `settings.local.json` is NOT ignored: report "FAIL: .claude/settings.local.json is not gitignored. Add `.claude/settings.local.json` to .gitignore."
- If both are ignored: report "OK: sensitive files are gitignored."

### Step 3: Check current-topic.md

Read `.claude/context/current-topic.md`.

- If the file does not exist: report "FAIL: .claude/context/current-topic.md not found. Run `/set-context` to create it."
- If all fields contain placeholder comments (lines starting with `#` or containing `<...>`): report "WARN: current-topic.md has not been updated. Run `/set-context` to set the current topic."
- If the `Feature:` field has a real value: report "OK: current-topic.md is initialized (Feature: <value>)."

### Step 4: Check MCP connectivity

Attempt to call `search_nodes("mcp-health-check")`.

- If the call succeeds (even with 0 results): report "OK: MCP memory server is reachable."
- If the call fails or the tool is not available: report "FAIL: MCP memory server is not reachable. Check that settings.json (or settings.local.json) has a valid MEMORY_FILE_PATH and that npx can install @modelcontextprotocol/server-memory."

### Step 5: Present Summary

Show a summary table:

```
────────────────────────────────────────
Claude for Engineers — Setup Check
────────────────────────────────────────
settings.json structure    OK | FAIL
settings.local.json path   OK | FAIL | MISSING
Gitignore rules            OK | FAIL
current-topic.md           OK | WARN (not set) | FAIL (missing)
MCP server                 OK | FAIL
────────────────────────────────────────
Overall: READY | NEEDS_FIXES
```

If any item is FAIL: list each issue with a specific fix instruction.
If all are OK or WARN: tell the engineer they're ready to run `/plan`.
```

#### Acceptance Criteria

- [ ] File exists at `.claude/skills/check-setup/SKILL.md`
- [ ] File starts with valid YAML frontmatter: `---\nname: check-setup\n...`
- [ ] `grep -n "validate/settings-json.js" .claude/skills/check-setup/SKILL.md` returns 1 match
- [ ] `grep -n "search_nodes" .claude/skills/check-setup/SKILL.md` returns 1 match (MCP check step)
- [ ] `grep -n "set-context" .claude/skills/check-setup/SKILL.md` returns at least 2 matches (fix instructions for missing/unset topic)

---

### Task 2: Register /check-setup in CLAUDE.md

**Status:** PENDING
**Complexity:** Low
**Depends on:** Task 1

#### File Changes

##### MODIFY: CLAUDE.md

**Find** the "All Skills" table in the "Workflow Skills" section. It has this header:

```
| Skill | When | What it does |
|-------|------|-------------|
| `/plan` | Start of feature | Collaborative conversation -> Master Plan |
```

**Append a new row** at the end of the Workflow Skills table (after the `/pm-backlog` row):

```
| `/check-setup` | Before first use or when MCP feels broken | Verify settings, MCP, and topic are configured |
```

#### Acceptance Criteria

- [ ] `grep -n "check-setup" CLAUDE.md` returns at least 1 match
- [ ] The new row appears in the "Workflow Skills" section table
- [ ] The table formatting is consistent with surrounding rows (pipes aligned)

---

## Execution Log

### Task 1: Create .claude/skills/check-setup/SKILL.md
- **Agent:** orchestrator (main conversation)
- **Mode:** task
- **Started:** 2026-03-18 11:50 UTC
- **Completed:** 2026-03-18 11:52 UTC
- **Status:** COMPLETED
- **Files created:** `.claude/skills/check-setup/SKILL.md`
- **Acceptance criteria:**
  - [x] File exists at `.claude/skills/check-setup/SKILL.md`
  - [x] File starts with valid YAML frontmatter: `---\nname: check-setup\n...`
  - [x] `grep -n "validate/settings-json.js" .claude/skills/check-setup/SKILL.md` returns 1 match
  - [x] `grep -n "search_nodes" .claude/skills/check-setup/SKILL.md` returns 1 match
  - [x] `grep -n "set-context" .claude/skills/check-setup/SKILL.md` returns 2 matches

### Task 2: Register /check-setup in CLAUDE.md
- **Agent:** orchestrator (main conversation)
- **Mode:** task
- **Started:** 2026-03-18 11:52 UTC
- **Completed:** 2026-03-18 11:53 UTC
- **Status:** COMPLETED
- **Files modified:** `CLAUDE.md` (added `/check-setup` row to Workflow Skills table)
- **Acceptance criteria:**
  - [x] `grep -n "check-setup" CLAUDE.md` returns 1 match
  - [x] New row appears in the Workflow Skills section table
  - [x] Table formatting is consistent with surrounding rows
