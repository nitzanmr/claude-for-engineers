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

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /qa-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md`. Pass the full bundle inline in the agent prompt under `## Session Memory`.

### Step 3: Invoke QA Agent
Launch a `general-purpose` agent:

```
You are the QA automation agent. Follow the instructions in `.claude/agents/qa-automation.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md.
```

### Step 4: Present Report
Share the agent's report.
