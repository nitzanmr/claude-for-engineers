---
name: security-review
description: Invoke the security expert agent to review authentication, authorization, input validation, and known vulnerability patterns
argument-hint: <PRD directory, file path, or security question>
tags: [review, security, vulnerabilities, specialist, agents]
---

# Security Review Skill

Invoke the security expert agent against a specific target.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What should the security expert review?"

### Step 2: Build Session Memory Bundle

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before running this review."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. If the tool responds: MCP Status = `AVAILABLE`. If unavailable: MCP Status = `UNAVAILABLE`.

**3. Pre-fetch agent memory** (only if MCP is AVAILABLE) — Call `search_nodes("security-expert", <topic>)` where `<topic>` is the value of the `Feature:` field in current-topic.md.

**4. Assemble the bundle**:
```markdown
# Session Memory — <YYYY-MM-DDTHH-MM-SS>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM-SS
- Triggered by: /security-review
- Phase: REVIEW

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <if UNAVAILABLE: "Agent proceeds without past memory this session">

## Pre-fetched Agent Memories
### security-expert — past findings on this topic
<search_nodes results or "None">
```

**5. Pass inline** — Include the full bundle in the agent prompt under a `## Session Memory` section.

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
