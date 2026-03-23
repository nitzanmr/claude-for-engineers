---
name: check-setup
description: Verify Claude for Engineers installation is correctly configured (settings, topic)
argument-hint: (no arguments needed)
tags: [setup, validation, config]
---

# Check Setup Skill

Verify that all required configuration for the Claude for Engineers workflow is in place. Run this before starting your first planning session or when something feels broken.

## What It Checks

1. `settings.json` — valid JSON, required permissions present, CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled
2. `.gitignore` — run-log snapshots are gitignored
3. `current-topic.md` — exists and is initialized (not all placeholders)

## Execution Steps

### Step 1: Check settings.json

Read `.claude/settings.json`.

- If the file does not exist: report "FAIL: .claude/settings.json not found. Re-run the installer."
- If not valid JSON: report "FAIL: .claude/settings.json is not valid JSON."
- Check `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`:
  - If missing or not `"1"`: report "FAIL: env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS must be set to \"1\" in settings.json."
  - If present: report "OK: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1"
- Check `permissions.allow` contains all of: `TeamCreate`, `TaskCreate`, `TaskList`, `TaskUpdate`, `TaskGet`, `SendMessage`:
  - If any are missing: report "FAIL: Missing required permissions: <list>."
  - If all present: report "OK: required permissions present."

### Step 2: Check .gitignore

Run:
```bash
git check-ignore -v ".claude/context/run-log/example.md"
```

- If the file IS ignored: report "OK: run-log snapshots are gitignored."
- If NOT ignored: report "WARN: .claude/context/run-log/*.md is not gitignored. Add `.claude/context/run-log/*.md` to .gitignore to prevent run snapshots from being committed."

### Step 3: Check current-topic.md

Read `.claude/context/current-topic.md`.

- If the file does not exist: report "FAIL: .claude/context/current-topic.md not found. Run `/set-context` to create it."
- If all fields contain placeholder comments (lines starting with `#` or containing `<...>`): report "WARN: current-topic.md has not been updated. Run `/set-context` to set the current topic."
- If the `Feature:` field has a real value: report "OK: current-topic.md is initialized (Feature: <value>)."

### Step 4: Present Summary

Show a summary table:

```
────────────────────────────────────────
Claude for Engineers — Setup Check
────────────────────────────────────────
settings.json              OK | FAIL
Gitignore rules            OK | WARN
current-topic.md           OK | WARN (not set) | FAIL (missing)
────────────────────────────────────────
Overall: READY | NEEDS_FIXES
```

If any item is FAIL: list each issue with a specific fix instruction.
If all are OK or WARN: tell the engineer they're ready to run `/plan`.
