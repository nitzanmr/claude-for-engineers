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

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before running this review."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. If the tool responds: MCP Status = `AVAILABLE`. If unavailable: MCP Status = `UNAVAILABLE`.

**3. Pre-fetch agent memory** (only if MCP is AVAILABLE) — Call `search_nodes("qa-automation", <topic>)` where `<topic>` is the value of the `Feature:` field in current-topic.md.

**4. Assemble the bundle**:
```markdown
# Session Memory — <YYYY-MM-DDTHH-MM-SS>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM-SS
- Triggered by: /qa-review
- Phase: REVIEW

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <if UNAVAILABLE: "Agent proceeds without past memory this session">

## Pre-fetched Agent Memories
### qa-automation — past coverage findings on this topic
<search_nodes results or "None">
```

**5. Pass inline** — Include the full bundle in the agent prompt under a `## Session Memory` section.

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
