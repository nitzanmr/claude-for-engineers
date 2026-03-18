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
Read `.claude/context/current-topic.md` to see the current topic.

Show the engineer the current content and ask:
- What is the new feature/topic?
- What phase are you in? (PLANNING / PRD / EXECUTION / REVIEW / NONE)
- Which PRD directory is active? (or "none")
- Any key decisions or open questions to record?

If an argument was provided to this skill, use it as the new feature/topic name and skip asking for it.

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
