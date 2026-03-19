---
name: pm-review
description: Invoke the PM agent to evaluate scope, priority, and efficiency tradeoffs. Differentiates needed improvements from hard addons.
argument-hint: <PRD directory, feature description, or scope question>
tags: [review, product, scope, specialist, agents]
---

# PM Review Skill

Invoke the product manager agent against a specific target. The PM will load context, consult other agents' memories, and make clear priority calls.

## Steps

### Step 1: Determine Target
If an argument was provided, use it. Otherwise ask: "What should the PM review? (PRD directory, feature proposal, or scope question)"

### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("product-manager", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/pm-review`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### product-manager — past decisions on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.

### Step 3: Invoke PM Agent
Launch a `general-purpose` agent with the following prompt:

```
You are the product manager agent. Follow the instructions in `.claude/agents/product-manager.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

### Step 4: Present Report
Share the agent's report with the engineer.
