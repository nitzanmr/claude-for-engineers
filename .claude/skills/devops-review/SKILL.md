---
name: devops-review
description: Invoke the DevOps engineer agent to review deployment readiness, production implications, infrastructure decisions, and tool integration — including discovering, configuring, testing, and embedding new tools or external services into a project
argument-hint: <PRD directory, file path, or deployment question>
allowed-tools: Read, Glob, Grep, Bash, Write, Task
tags: [review, devops, production, specialist, agents]
---

# DevOps Review Skill

Invoke the DevOps engineer agent against a specific target.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What should the DevOps engineer review?"

### Step 2: Build Session Memory Bundle

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /devops-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md`. Pass the full bundle inline in the agent prompt under `## Session Memory`.

### Step 3: Invoke DevOps Agent
Launch a `general-purpose` agent:

```
You are the DevOps engineer agent. Follow the instructions in `.claude/agents/devops-engineer.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md.
```

### Step 4: Present Report
Share the agent's report.
