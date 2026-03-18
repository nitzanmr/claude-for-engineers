# PRD-02: team-review Swarm Mode

Created: 2026-03-18 10:48 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Add an opt-in swarm mode to `/team-review` that uses TeamCreate for live coordination, cross-agent consultation via SendMessage, and an explicit `blocked_by` dependency for the PM synthesis task.

## Context

`/team-review` currently launches parallel `Task` agents then runs PM synthesis sequentially after all agents finish. Swarm mode models this as a task dependency graph: review agent tasks run in parallel, PM synthesis is created with `addBlockedBy` pointing to all of them — the same wave-dependency pattern as `/execute`. Agents can also consult each other via SendMessage when they find cross-domain findings.

---

## Tasks

### Task 1: Update frontmatter allowed-tools

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Replace the `allowed-tools` line** (line 5, inside the frontmatter block):

```
// Before:
allowed-tools: Read, Glob, Grep, Task, Bash

// After:
allowed-tools: Read, Glob, Grep, Task, Bash, TeamCreate, TaskCreate, TaskList, TaskUpdate, TaskGet, SendMessage
```

#### Acceptance Criteria

- [ ] `allowed-tools` line in frontmatter contains all 6 new tools
- [ ] Frontmatter YAML is valid (no extra spaces or broken formatting)

---

### Task 2: Add execution modes section and mode selection prompt

**Status:** PENDING
**Depends on:** Task 1
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Add a new `## Execution Modes` section** directly after the `## When to Use` section and before the `## How It Works` section:

```markdown
## Execution Modes

### Task Mode (Default)
- Uses the `Task` tool to launch parallel review subagents
- Agents run independently, PM synthesis runs after all agents finish
- Best for: straightforward reviews, small feature PRDs, quick checks

### Swarm Mode
- Uses `TeamCreate` to create a team with a shared task list
- PM synthesis task is created with `addBlockedBy` on all review tasks — starts automatically when all reviews are done
- Agents can consult each other via `SendMessage` when they find cross-domain findings (e.g., code-quality agent spots something security-relevant)
- Live task progress visible via `TaskList`
- Best for: large reviews with many specialists, or when you want visibility into reviewer progress in real time
```

**Add the mode selection prompt** inside `## How It Works`, at the end of **Step 2b** (after the line `Wait for engineer confirmation. If "adjust", let them add or remove specialists before continuing.`), as a new paragraph:

```markdown
After engineer confirms the specialist selection, ask:

```
Review with <N> agents: <list agent names>.
  • Task mode  — agents run independently, PM synthesis runs after all finish
  • Swarm mode — agents share a task list and can consult each other via messages;
                 PM synthesis is blocked until all reviews complete; live progress
                 visible via TaskList

Which mode?
```

Wait for confirmation before launching any agents.
```

#### Acceptance Criteria

- [ ] `## Execution Modes` section exists with both mode descriptions
- [ ] Mode selection prompt appears in Step 2b, after the specialist approval gate
- [ ] Prompt lists the agents that will run (not generic text)
- [ ] Prompt includes tradeoff bullet points for both modes
- [ ] Skill instructs to wait for confirmation before launching

---

### Task 3: Add swarm mode execution steps

**Status:** PENDING
**Depends on:** Task 2
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Replace the entire `### Step 2: Assign Review Agents` section** (the part that describes launching the agents, from the `**Agent 1 - Spec Compliance:**` block through the end of the code block for Agent 2 - Code Quality and Agent 3 - Integration) with an expanded version that covers both modes.

The replacement should wrap the existing agent prompt templates inside a `#### Task Mode` sub-section, and add a new `#### Swarm Mode` sub-section after it:

```markdown
### Step 2: Assign Review Agents

#### Task Mode

Launch parallel review agents using the `Task` tool with `subagent_type: "Explore"` or `"general-purpose"`.

**Agent 1 - Spec Compliance:**
```
Review whether the executed code matches the PRD task specifications exactly.

For each completed task in the PRD files:
1. Read the task specification (expected file changes)
2. Read the actual files that were created/modified
3. Compare: does the actual code match what was specified?
4. Check: were all acceptance criteria met?
5. Flag: any deviation from spec (additions, omissions, differences)

Report format per task:
- Task: <name>
- Spec match: EXACT | MINOR_DEVIATION | MAJOR_DEVIATION
- Deviations: <list specific differences>
- Acceptance criteria: <which passed, which failed>
```

**Agent 2 - Code Quality:**
```
Review the code quality of all files created or modified during PRD execution.

For each file:
1. Check for common issues:
   - TypeScript errors or type safety issues
   - Missing error handling
   - Unused imports or variables
   - Code style violations
2. Check consistency with project patterns
3. Flag any anti-patterns or potential bugs

Report format:
- File: <path>
- Issues found: <list>
- Severity: LOW | MEDIUM | HIGH
```

**Agent 3 - Integration (optional, for multi-PRD executions):**
```
Review how the executed code integrates across PRD boundaries.

Check:
1. Import chains work correctly across new files
2. Type definitions are consistent
3. State flows correctly between components
4. No circular dependencies introduced
5. All integration points from PRD specs are wired correctly
6. **Consumer completeness:** For every field, type, or interface that was changed,
   grep the ENTIRE codebase for all usages. Verify that every consumer was updated.
   This includes controllers, services, jobs, utilities, admin code, and scripts —
   not just the files listed in the PRDs. Report any call sites still using the
   old field name, old type, or old access pattern.
7. **Index/constraint consistency:** For every model that was modified, verify that
   model indexes and database constraints reference the correct (new) column names.

Report: list any integration gaps, missed consumers, or stale references.
```

#### Swarm Mode

1. **Create team:** `TeamCreate` with name `review-<run-id>` (use the run ID from Step 0)
2. **Create review tasks:** `TaskCreate` one task per review agent (spec-compliance, code-quality, and any auto-selected specialists). Use the agent prompts above as the task description.
3. **Create PM synthesis task:** `TaskCreate` with name `pm-synthesis`, description containing the full PM synthesis prompt from Step 3. Set `addBlockedBy` to all review task IDs created in step 2 — PM does not start until every review task is DONE.
4. **Spawn agents:** Launch review agents using the `Task` tool with `team_name: "review-<run-id>"`. Launch all review agents simultaneously. Also launch the PM agent with `team_name` — it will wait on its blocked task automatically.
5. **Assign tasks:** `TaskUpdate` each review task with the corresponding agent as `owner`
6. **Monitor:** Track progress via `TaskList`. When `pm-synthesis` status transitions to `IN_PROGRESS`, all review tasks have completed.
7. **Collect results:** After `pm-synthesis` is DONE, read all task outputs and proceed to Step 4 (write review.md, backlog.md, show dashboard) — same as task mode.

**Swarm mode agent prompt addition** — append this to every review agent's prompt when in swarm mode (NOT to the PM synthesis prompt):

```
## Team Coordination

You are part of a review team. Other specialist agents are reviewing adjacent dimensions simultaneously.

If you find an issue that is clearly in another specialist's domain, send them a message:
- Use `SendMessage` to the relevant teammate
- Example: "Found potential SQL injection in src/api/payments.ts line 42 — flagging for security-expert"
- Example: "PaymentService has no retry logic on API failure — may be relevant to devops-engineer"

Keep messages brief and specific: file path + line/function + why it's relevant to them.
Do NOT wait for replies before completing your own review.
```
```

#### Acceptance Criteria

- [ ] Step 2 has two clearly labeled sub-sections: `#### Task Mode` and `#### Swarm Mode`
- [ ] Task mode content contains all 3 agent prompt templates (identical to current content — no regression)
- [ ] Swarm mode lists all 7 steps: TeamCreate, create review tasks, create PM task with blocked_by, spawn agents, assign, monitor, collect
- [ ] PM synthesis task is explicitly described as `addBlockedBy` all review tasks
- [ ] Swarm mode agent prompt includes the `## Team Coordination` consultation section with SendMessage examples
- [ ] PM synthesis prompt does NOT receive the team coordination addition

---

## Execution Log

_(populated during execution)_
