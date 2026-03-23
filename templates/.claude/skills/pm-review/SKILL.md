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

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /pm-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md`. Pass the full bundle inline in the agent prompt under `## Session Memory`.

### Step 3: Invoke PM Agent
Launch a `general-purpose` agent with the following prompt:

```
You are the product manager agent. Follow the instructions in `.claude/agents/product-manager.md`.

## Session Memory
<full contents of the session memory bundle built in Step 2>

Review target: <target>
The PRD directory for this review is: <active PRD from current-topic.md, or "none">

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md.
```

### Step 4: Present Report
Share the agent's report with the engineer.
