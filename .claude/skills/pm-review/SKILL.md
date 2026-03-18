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

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before running this review."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. If the tool responds: MCP Status = `AVAILABLE`. If unavailable: MCP Status = `UNAVAILABLE`.

**3. Pre-fetch agent memory** (only if MCP is AVAILABLE) — Call `search_nodes("product-manager", <topic>)` where `<topic>` is the value of the `Feature:` field in current-topic.md.

**4. Assemble the bundle**:
```markdown
# Session Memory — <YYYY-MM-DDTHH-MM-SS>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM-SS
- Triggered by: /pm-review
- Phase: REVIEW

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <if UNAVAILABLE: "Agent proceeds without past memory this session">

## Pre-fetched Agent Memories
### product-manager — past decisions on this topic
<search_nodes results or "None">
```

**5. Pass inline** — Include the full bundle in the agent prompt under a `## Session Memory` section.

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
