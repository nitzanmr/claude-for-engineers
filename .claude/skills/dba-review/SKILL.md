---
name: dba-review
description: Invoke the DBA expert agent to review database queries, schema decisions, or data access patterns
argument-hint: <file path, PRD directory, or question about data layer>
tags: [review, database, specialist, agents]
---

# DBA Review Skill

Invoke the DBA expert agent against a specific target. The agent will automatically load the current project context and retrieve relevant memories before reviewing.

## Steps

### Step 1: Determine Target
If an argument was provided, use it as the review target (file path, PRD directory, or question).
If no argument was provided, ask the engineer: "What should the DBA review? (provide a file path, PRD directory, or describe the question)"

### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("dba-expert", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/dba-review`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### dba-expert — past findings on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.

### Step 3: Invoke DBA Expert
Launch a `general-purpose` agent with the following prompt:

```
You are the DBA expert agent. Follow the instructions in `.claude/agents/dba-expert.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target from Step 1>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

### Step 4: Present Report
Share the agent's report with the engineer.
