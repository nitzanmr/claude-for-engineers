---
name: security-review
description: Invoke the security expert agent to review authentication, authorization, input validation, and known vulnerability patterns. Also acts as a security advisor on new tools, APIs, and external services — evaluating their trust model, vulnerability surface, credential risks, and issuing an ADOPT / ADOPT WITH CONTROLS / DO NOT ADOPT verdict
argument-hint: <PRD directory, file path, or security question>
tags: [review, security, vulnerabilities, specialist, agents]
---

# Security Review Skill

Invoke the security expert agent against a specific target.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What should the security expert review?"

### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("security-expert", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/security-review`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### security-expert — past findings on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.

### Step 3: Invoke Security Agent
Launch a `general-purpose` agent:

```
You are the security expert agent. Follow the instructions in `.claude/agents/security-expert.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

### Step 4: Present Report
Share the agent's report.
