---
name: qa-review
description: Invoke the QA automation agent to evaluate test coverage span, test quality, and suggest measurable acceptance criteria
argument-hint: <PRD directory, file path, or test strategy question>
tags: [review, qa, testing, coverage, specialist, agents]
---

# QA Review Skill

Invoke the QA automation agent to assess test coverage and quality.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What should the QA agent review? (PRD, test files, implementation files, or a coverage question)"

### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("qa-automation", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/qa-review`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### qa-automation — past coverage findings on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.

### Step 3: Invoke QA Agent
Launch a `general-purpose` agent:

```
You are the QA automation agent. Follow the instructions in `.claude/agents/qa-automation.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

### Step 4: Present Report
Share the agent's report.
