---
name: set-context
description: Update the current project topic so all specialist agents know what the team is working on
argument-hint: <feature name or topic description>
tags: [context, agents, setup]
---

# Set Context Skill

Update `.claude/context/current-topic.md` with the current working topic so all specialist agents pick it up automatically on their next invocation.

## Steps

### Step 1: Read Current State
Read `.claude/context/current-topic.md` to show the current values (if the file exists).

If an argument was provided, use it as the new feature name directly without asking.

Otherwise ask the engineer:
- What is the feature/topic name?
- Which PRD directory is active? (or "none")

### Step 2: Update the File
Write `.claude/context/current-topic.md` with:
```markdown
# Current Topic

Updated: <current UTC time>
Feature: <feature name>
Active PRD: <directory name or "none">
```

### Step 3: Confirm
Show the engineer the updated content.
