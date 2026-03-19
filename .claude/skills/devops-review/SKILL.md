---
name: devops-review
description: Invoke the DevOps engineer agent to review deployment readiness, production implications, infrastructure decisions, and tool integration — including discovering, configuring, testing, and embedding new tools or external services into a project
argument-hint: <PRD directory, file path, or deployment question>
tags: [review, devops, production, specialist, agents]
---

# DevOps Review Skill

Invoke the DevOps engineer agent against a specific target.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What should the DevOps engineer review?"

### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("devops-engineer", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/devops-review`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### devops-engineer — past production notes on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.

### Step 3: Invoke DevOps Agent
Launch a `general-purpose` agent:

```
You are the DevOps engineer agent. Follow the instructions in `.claude/agents/devops-engineer.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

### Step 4: Present Report
Share the agent's report.
