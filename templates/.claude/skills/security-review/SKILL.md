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

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /security-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md`. Pass the full bundle inline in the agent prompt under `## Session Memory`.

### Step 3: Invoke Security Agent
Launch a `general-purpose` agent:

```
You are the security expert agent. Follow the instructions in `.claude/agents/security-expert.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md.
```

### Step 4: Present Report
Share the agent's report.
