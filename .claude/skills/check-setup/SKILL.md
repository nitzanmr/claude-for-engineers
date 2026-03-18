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
