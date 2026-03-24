---
name: set-context
description: Update the current project topic so all specialist agents know what the team is working on
argument-hint: <feature name or topic description>
allowed-tools: Read, Write
tags: [context, agents, setup]
---

# Set Context Skill

Update `.claude/context/current-topic.md` with the current working topic so all specialist agents pick it up automatically on their next invocation.

## Steps

### Step 1: Read and Display Current State

Read `.claude/context/current-topic.md`.

Show the current values in a table before asking for changes:

```
Current topic:
  Feature   : <value or "(not set)">
  Active PRD : <value or "(none)">
  Updated    : <value or "never">
```

If an argument was provided (`{{argument}}`), use it as the new Feature name directly — skip asking.

Otherwise ask the engineer:
- What is the new feature/topic name? (press Enter to keep current)
- Which PRD directory is now active? (press Enter to keep current, type "none" to clear)

### Step 2: Update the File
Update `.claude/context/current-topic.md` with:
- Updated timestamp (current UTC time)
- New feature name
- New phase
- Active PRD directory (if any)
- Key decisions (carry forward existing ones, add new ones)
- Open questions

### Step 3: Confirm
Show the engineer the updated file content. Tell them:
> "All specialist agents will pick up this context on their next invocation."
