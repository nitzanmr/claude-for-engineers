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

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before running this review."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. If the tool responds: MCP Status = `AVAILABLE`. If unavailable: MCP Status = `UNAVAILABLE`.

**3. Pre-fetch agent memory** (only if MCP is AVAILABLE) — Call `search_nodes("dba-expert", <topic>)` where `<topic>` is the value of the `Feature:` field in current-topic.md.

**4. Assemble the bundle**:
```markdown
# Session Memory — <YYYY-MM-DDTHH-MM-SS>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM-SS
- Triggered by: /dba-review
- Phase: REVIEW

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <if UNAVAILABLE: "Agent proceeds without past memory this session">

## Pre-fetched Agent Memories
### dba-expert — past findings on this topic
<search_nodes results or "None">
```

**5. Pass inline** — Include the full bundle in the agent prompt under a `## Session Memory` section.

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
