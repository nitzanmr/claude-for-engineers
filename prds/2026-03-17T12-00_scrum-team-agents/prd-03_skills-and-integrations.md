# PRD-03: Skills and Integrations

Created: 2026-03-17 12:00 UTC
Status: PENDING
Depends on: PRD-02
Complexity: Medium

## Objective

Create 7 skills (6 specialist invocation skills + `/set-context`) and update the existing `/team-review` and `/team-research` skills to include the specialist agents as optional participants.

## Context

Each specialist agent needs a companion skill for independent invocation. The skill handles context loading and invokes the agent against whatever the engineer provides. `/set-context` lets engineers update `current-topic.md` interactively. The existing `/team-review` and `/team-research` skills are updated to mention the specialist agents as optional additions.

## Tasks

### Task 1: Create /set-context Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/set-context/SKILL.md

```markdown
---
name: set-context
description: Update the current project topic so all specialist agents know what the team is working on
argument-hint: <feature name or topic description>
tags: [context, agents, setup]
---

# Set Context Skill

Update `.claude/context/current-topic.md` with the current working topic so all specialist agents pick it up automatically on their next invocation.

## Steps

### Step 1: Read Current State
Read `.claude/context/current-topic.md` to see the current topic.

Show the engineer the current content and ask:
- What is the new feature/topic?
- What phase are you in? (PLANNING / PRD / EXECUTION / REVIEW / NONE)
- Which PRD directory is active? (or "none")
- Any key decisions or open questions to record?

If an argument was provided to this skill, use it as the new feature/topic name and skip asking for it.

### Step 2: Update the File
Update `.claude/context/current-topic.md` with:
- Updated timestamp (current UTC time)
- New feature name
- New phase
- Active PRD directory (if any)
- Key decisions (carry forward existing ones, add new ones)
- Open questions

### Step 3: Confirm
Show the engineer the updated file content. Tell them:
> "All specialist agents will pick up this context on their next invocation."
```

#### Acceptance Criteria

- [ ] `.claude/skills/set-context/SKILL.md` created
- [ ] Frontmatter valid (name, description, argument-hint, tags)
- [ ] Skill reads existing context before updating
- [ ] Skill accepts optional argument for the topic name

---

### Task 2: Create /dba-review Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/dba-review/SKILL.md

```markdown
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

### Step 2: Load Context for Agent
Read `.claude/context/current-topic.md` and include its contents in the agent prompt.

### Step 3: Invoke DBA Expert
Launch a `general-purpose` agent with the following prompt:

```
You are the DBA expert agent. Follow the instructions in `.claude/agents/dba-expert.md`.

Current topic context:
<contents of current-topic.md>

Review target: <target from Step 1>

Complete all steps in your agent instructions: load memory, do your review, consult cross-agent context, store findings, and produce your report.
```

### Step 4: Present Report
Share the agent's report with the engineer.
```

#### Acceptance Criteria

- [ ] `.claude/skills/dba-review/SKILL.md` created
- [ ] Frontmatter valid
- [ ] Skill passes current-topic.md contents to agent
- [ ] Agent invoked with reference to `.claude/agents/dba-expert.md`

---

### Task 3: Create /pm-review Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/pm-review/SKILL.md

```markdown
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

### Step 2: Load Context
Read `.claude/context/current-topic.md`.

### Step 3: Invoke PM Agent
Launch a `general-purpose` agent with the following prompt:

```
You are the product manager agent. Follow the instructions in `.claude/agents/product-manager.md`.

Current topic context:
<contents of current-topic.md>

Review target: <target>

Complete all steps: load memory, evaluate scope and priority, consult team agent memories, store decisions, and produce your report.
```

### Step 4: Present Report
Share the agent's report with the engineer.
```

#### Acceptance Criteria

- [ ] `.claude/skills/pm-review/SKILL.md` created
- [ ] Frontmatter valid
- [ ] Skill passes current-topic.md to agent
- [ ] Agent invoked with reference to `.claude/agents/product-manager.md`

---

### Task 4: Create /devops-review Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/devops-review/SKILL.md

```markdown
---
name: devops-review
description: Invoke the DevOps engineer agent to review deployment readiness, production implications, and infrastructure decisions
argument-hint: <PRD directory, file path, or deployment question>
tags: [review, devops, production, specialist, agents]
---

# DevOps Review Skill

Invoke the DevOps engineer agent against a specific target.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What should the DevOps engineer review?"

### Step 2: Load Context
Read `.claude/context/current-topic.md`.

### Step 3: Invoke DevOps Agent
Launch a `general-purpose` agent:

```
You are the DevOps engineer agent. Follow the instructions in `.claude/agents/devops-engineer.md`.

Current topic context:
<contents of current-topic.md>

Review target: <target>

Complete all steps: load memory, review production readiness, store notes, and produce your report.
```

### Step 4: Present Report
Share the agent's report.
```

#### Acceptance Criteria

- [ ] `.claude/skills/devops-review/SKILL.md` created
- [ ] Frontmatter valid

---

### Task 5: Create /security-review Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/security-review/SKILL.md

```markdown
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

### Step 2: Load Context
Read `.claude/context/current-topic.md`.

### Step 3: Invoke Security Agent
Launch a `general-purpose` agent:

```
You are the security expert agent. Follow the instructions in `.claude/agents/security-expert.md`.

Current topic context:
<contents of current-topic.md>

Review target: <target>

Complete all steps: load memory, retrieve security state, do your security review, update security state in memory, and produce your report.
```

### Step 4: Present Report
Share the agent's report.
```

#### Acceptance Criteria

- [ ] `.claude/skills/security-review/SKILL.md` created
- [ ] Frontmatter valid

---

### Task 6: Create /pentest Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/pentest/SKILL.md

```markdown
---
name: pentest
description: Invoke the penetration agent to find exploitable paths, test business logic for bypass opportunities, and identify attack vectors
argument-hint: <PRD directory, file path, endpoint, or area to attack>
tags: [security, pentest, attack, specialist, agents]
---

# Pentest Skill

Invoke the penetration agent to perform adversarial analysis on a specific target. The agent operates within authorized testing scope only.

## Steps

### Step 1: Determine Target
If argument provided, use it. Otherwise ask: "What area should the penetration agent focus on? (file, endpoint, flow, or PRD)"

### Step 2: Load Context
Read `.claude/context/current-topic.md`.

### Step 3: Invoke Pentest Agent
Launch a `general-purpose` agent:

```
You are the penetration agent. Follow the instructions in `.claude/agents/penetration-agent.md`.

Current topic context:
<contents of current-topic.md>

Target for adversarial analysis: <target>

Complete all steps: load memory, retrieve security-expert findings, perform adversarial analysis, store attack vectors found, report findings to security-expert via memory, and produce your report.
```

### Step 4: Present Report
Share the agent's report with the engineer.
```

#### Acceptance Criteria

- [ ] `.claude/skills/pentest/SKILL.md` created
- [ ] Frontmatter valid
- [ ] Skill references authorized testing scope

---

### Task 7: Create /qa-review Skill

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/qa-review/SKILL.md

```markdown
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

### Step 2: Load Context
Read `.claude/context/current-topic.md`.

### Step 3: Invoke QA Agent
Launch a `general-purpose` agent:

```
You are the QA automation agent. Follow the instructions in `.claude/agents/qa-automation.md`.

Current topic context:
<contents of current-topic.md>

Review target: <target>

Complete all steps: load memory, analyze coverage span and test quality, assess agent team output quality, store findings, and produce your report with suggested quality gates.
```

### Step 4: Present Report
Share the agent's report.
```

#### Acceptance Criteria

- [ ] `.claude/skills/qa-review/SKILL.md` created
- [ ] Frontmatter valid

---

### Task 8: Update /team-review to Include Specialist Agents

**Status:** PENDING
**Complexity:** Low
**Depends on:** Tasks 2-7

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Add new section** (after `### Step 2: Assign Review Agents`, before `### Step 3: Synthesize Review`):

```markdown
### Step 2b: Optional Specialist Agents

In addition to the standard review agents, you can include any of the specialist agents for domain-specific review. Ask the engineer which specialists to include:

| Skill | Agent | When to include |
|-------|-------|-----------------|
| `/dba-review` | `dba-expert` | PRD touches database queries, schemas, or migrations |
| `/pm-review` | `product-manager` | Scope or priority questions arose during execution |
| `/devops-review` | `devops-engineer` | New services, config changes, or deployment implications |
| `/security-review` | `security-expert` | Auth, input handling, or data exposure changes |
| `/pentest` | `penetration-agent` | Security-sensitive features need adversarial review |
| `/qa-review` | `qa-automation` | Test coverage or quality of agent-written tests is in question |

To include a specialist, add them to the parallel agent launch in Step 2. Each specialist automatically loads the current topic and their memory context — they do not need to be briefed on the project.

Example launch prompt for a specialist:
```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

Current topic context:
<contents of .claude/context/current-topic.md>

Review target: <PRD directory>

Complete all steps in your agent instructions including memory load, review, and memory store.
```
```

#### Acceptance Criteria

- [ ] New section added to team-review SKILL.md after `### Step 2: Assign Review Agents`
- [ ] Section lists all 6 specialist agents with when-to-include guidance
- [ ] Example launch prompt included
- [ ] Existing content not modified

---

### Task 9: Update /team-research to Include Specialist Agents

**Status:** PENDING
**Complexity:** Low
**Depends on:** Tasks 2-7

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Add new section** (after `## Research Agent Guidelines`, before `## Integration with /plan`):

```markdown
## Specialist Agents in Research

When research touches a specialist's domain, you can include them as a research agent. Specialist agents bring their memory context into the research — they already know what they've seen in this project before.

| Specialist | When to include in research |
|------------|---------------------------|
| `dba-expert` | Mapping data access patterns, understanding schema, exploring query behavior |
| `product-manager` | Understanding existing scope decisions, mapping feature dependencies |
| `devops-engineer` | Mapping deployment topology, understanding infrastructure constraints |
| `security-expert` | Mapping authentication flows, understanding current security posture |
| `penetration-agent` | Mapping attack surface before a security-sensitive feature |
| `qa-automation` | Mapping existing test coverage before planning new test strategy |

To include a specialist in a research round, launch them the same way as a standard Explore agent but reference their agent file:

```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

Current topic context:
<contents of .claude/context/current-topic.md>

Research question: <specific research question for this agent>

Your report should include:
1. Files found relevant to your domain
2. Patterns you observe
3. Concerns or flags from your specialist perspective
4. Relevant memories from past sessions in this project

Do NOT suggest changes — just report what exists and what you know.
```

Specialist research results are included in the synthesized research summary under a "Specialist Perspectives" section.
```

#### Acceptance Criteria

- [ ] New section added to team-research SKILL.md after `## Research Agent Guidelines`
- [ ] Section lists all 6 specialists with when-to-include guidance
- [ ] Example research prompt included
- [ ] Existing content not modified

---

## Execution Log

*(Filled in during execution)*
