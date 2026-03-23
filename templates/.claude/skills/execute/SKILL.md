---
name: execute
description: Execute PRDs mechanically using task agents or swarm mode
argument-hint: <prd-directory-name>
allowed-tools: Read, Glob, Grep, Task, Bash, TaskCreate, TaskList, TaskUpdate, TaskGet, TeamCreate, SendMessage
tags: [execution, orchestration, parallel]
---

# Execute Skill

Execute approved PRDs by launching agents that follow task specifications mechanically.

## Prerequisites

- PRDs must exist in `prds/{{argument}}/`
- Master Plan status should be `PRDS_GENERATED`
- Engineer must have reviewed and approved the PRDs

## Execution Modes

Ask the engineer which mode to use:

### Task Mode (Default)
- Uses the `Task` tool to launch parallel subagents
- Simpler, faster, no coordination overhead
- Best for: independent tasks, small features, straightforward work
- Agents run independently and report back

### Swarm Mode
- Uses `TeamCreate` to create a team with shared task list
- Agents coordinate via messages and shared task list
- Best for: complex features where tasks may interact, or when you want live progress tracking
- Better visibility via `TaskList`

## Execution Flow

### Step 0: Build Session Memory Bundle

Before launching any task agents, assemble the shared context bundle.

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. The PRD directory is the skill argument. Set `Triggered by: /execute` and `Phase: EXECUTION`.

Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format. Include the full bundle in every agent prompt under `## Session Memory`.

### Step 1: Discovery and Validation

**Before using the argument as a path:** Validate that `{{argument}}` contains only safe characters: letters, digits, hyphens, underscores, and the letter `T` (for timestamp separators). If the argument contains slashes, dots, spaces, or any other character, STOP and report: "Invalid PRD directory name — argument must be a safe directory name like `2026-03-18T11-15_feature-name`."

1. Read `prds/{{argument}}/master-plan.md` to get PRD dependency graph
2. List and read all PRD files (`prd-*.md`)
3. Parse each PRD for:
   - Status (skip if already `COMPLETED`)
   - Dependencies (which PRDs must complete first)
   - Tasks, their dependencies, and their status
   - Recommended agents per task
4. **Validate the dependency graph:**
   - Check for circular dependencies (PRD-01 → PRD-02 → PRD-01). Walk each dependency chain to ensure no PRD appears twice.
   - If a cycle is detected, STOP and report the cycle to the engineer. Do not proceed.
   - Check that all referenced dependencies exist (e.g., "Depends on: PRD-03" but PRD-03 doesn't exist).
5. Build the wave plan: group PRDs by dependency order
6. **Build the file manifest:** Collect all files to be created, modified, and deleted across all PRDs. This becomes the expected scope for post-execution verification.

### Step 2: Present Execution Plan

Show the engineer what will happen:

```
Found N PRDs with M total tasks.

Wave 1 (parallel - no dependencies):
  PRD-01: "Settings types and state" - 3 tasks
  PRD-02: "Settings persistence" - 2 tasks

Wave 2 (depends on wave 1):
  PRD-03: "Settings UI components" - 4 tasks (needs PRD-01, PRD-02)

Wave 3 (depends on wave 2):
  PRD-04: "Sidebar integration" - 2 tasks (needs PRD-03)

Total: 4 PRDs, 11 tasks, 3 waves
```

Ask: "Execute in **Task mode** or **Swarm mode**? Or want to adjust anything?"

Wait for confirmation before launching anything.

### Step 3: Execute Wave

#### Task Mode

For each task in the current wave, launch a parallel agent using the `Task` tool.

**Critical: Pass the full task content directly to the agent.** Do NOT tell the agent to "read the PRD file and find your task." Instead, read the task spec yourself and include it in the agent prompt.

Agent prompt template:

```
You are executing a PRD task. Follow the specification EXACTLY.
Do not make decisions. Do not add anything not specified.
If something is ambiguous, STOP and report - do not guess.

## Task Specification

<paste the full task content here, including file changes and acceptance criteria>

## Rules

- Create/modify files exactly as specified
- Use context anchors to find insertion points (not line numbers)
- Do not add imports, functions, or code not specified in the task
- Do not refactor or "improve" surrounding code
- If a recommended skill is listed, use it

## Session Memory
<full contents of the session memory bundle built in Step 0>

## When Complete, Report

1. Files created (full paths)
2. Files modified (full paths + what changed)
3. Files deleted (full paths)
4. Test results: run `npm test -- <test-file>` for any test files in the task
5. Acceptance criteria checklist (mark each pass/fail)
6. Issues encountered (if any)
7. Completion timestamp (UTC)
```

Use the recommended agent type from the task if specified:
- `subagent_type: "component-builder"` for UI tasks
- `subagent_type: "state-architect"` for state tasks
- `subagent_type: "general-purpose"` as default

Launch all independent tasks in the wave simultaneously (single message, multiple Task tool calls).

#### Swarm Mode

1. **Create team:** `TeamCreate` with name based on feature
2. **Create all tasks:** `TaskCreate` for every task across all PRDs, with descriptions containing the full task spec
3. **Set dependencies:** `TaskUpdate` with `addBlockedBy` matching the PRD dependency graph
4. **Spawn teammates:** Launch agents using `Task` tool with `team_name` parameter. Use recommended agent types. **Limit to 5-8 agents max.** If there are more tasks than agents, agents pick up new tasks as they complete previous ones.
5. **Assign first wave:** `TaskUpdate` with `owner` for unblocked tasks
6. **Monitor:** Track via `TaskList` and teammate messages. As tasks complete, assign newly unblocked tasks.
7. **Collect results:** Read teammate completion reports

### Step 4: Collect Results, Verify Scope, and Run Tests

After each wave completes:

1. Read each agent's completion report
2. **Verify file scope:** Compare files the agent reported touching against the file manifest from Step 1. Flag any files that were modified but NOT listed in the PRD spec. Report unexpected file changes to the engineer.
3. For each task, verify:
   - Files created match the spec
   - Files modified match the spec
   - No files outside the PRD scope were touched
   - Agent reported all acceptance criteria as passing
   - Agent ran unit tests and they passed
4. If agent did not run tests, run them now:
   - Find test files created/modified in this wave
   - Run: `npm test -- <test-file>`
   - Report results
5. Note any issues or failures

### Step 5: Update PRD Files (Orchestrator Responsibility)

**CRITICAL: The orchestrator (you) must update PRD files — do NOT rely on agents to do this.** Agents report results back to you; you write the execution logs. This is the audit trail and must not be skipped.

For each completed task, update the PRD file:

1. Change task **Status** from `PENDING` to `COMPLETED` (or `FAILED`)
2. Append to the **Execution Log** section:

```markdown
### Task N: <Title>
- **Agent:** <agent type used>
- **Mode:** task | swarm
- **Started:** YYYY-MM-DD HH:MM UTC
- **Completed:** YYYY-MM-DD HH:MM UTC
- **Status:** COMPLETED | FAILED | PARTIAL
- **Files created:**
  - path/to/new/file.ts
- **Files modified:**
  - path/to/existing.ts (added import, updated type, wired selector)
- **Files deleted:**
  - (none)
- **Skills used:** /component, /lang-key
- **Test results:**
  - `npm test -- settings.test.ts` - PASS (4/4)
- **Issues encountered:**
  - (none)
- **Acceptance criteria:**
  - [x] File created at correct path
  - [x] Types exported correctly
  - [x] No TypeScript errors
```

When all tasks in a PRD are done, update the PRD-level **Status** to `COMPLETED`.

**Validation gate:** Do NOT proceed to the next wave until execution logs are written for all tasks in the current wave. If logs are missing, write them now before moving on.

### Step 6: Next Wave

1. Check which PRDs/tasks are now unblocked
2. If any tasks FAILED, report to engineer and ask how to proceed:
   - Skip dependent tasks (mark BLOCKED)
   - Fix the failed task and retry
   - Adjust the PRD and continue
3. Launch the next wave
4. Repeat steps 3-6

### Step 7: Final Report

After all waves complete:

```
Execution Complete: <feature-name>

PRDs: X/Y completed
Tasks: A/B completed
Failed: F tasks
Duration: Xm Ys

Files created: N
Files modified: M
Files deleted: D

Issues:
  1. <issue description> (PRD-XX, Task Y)
  2. <issue description> (PRD-XX, Task Y)

Test results:
  Unit tests: X passed, Y failed
  Integration tests: X passed, Y failed

Suggested next steps:
  1. Fix any failing tests
  2. Run /team-review to verify code quality
  3. Run project linter: npm run lint
  4. Manual testing
  5. Run /retro for retrospective
```

Update Master Plan status to `COMPLETED` (or `PARTIAL` if tasks failed).

## Error Handling

- **Circular dependency detected:** Stop before execution. Report the cycle to the engineer. The dependency graph must be a DAG.
- **Agent fails a task:** Mark as FAILED in execution log with error details. Report to engineer. Do NOT auto-retry.
- **Dependency fails:** Mark dependent tasks as BLOCKED. Report the chain to engineer.
- **Agent reports ambiguity:** Stop the wave. Show the ambiguity to the engineer. Fix the PRD spec, then resume.
- **Agent modified unexpected files:** Flag in the execution log. Report to engineer which files were touched outside the PRD scope. Engineer decides if the changes are acceptable.
- **File conflict:** If two tasks in the same wave modify the same file, execute them sequentially, not in parallel.
- **PRD not found:** Show helpful error with available PRD directories.

## Progress Tracking

All progress lives in the PRD files:
- Task status: `PENDING` -> `IN_PROGRESS` -> `COMPLETED` | `FAILED`
- PRD status: `PENDING` -> `IN_PROGRESS` -> `COMPLETED` | `PARTIAL`
- Master Plan status: `PRDS_GENERATED` -> `IN_PROGRESS` -> `COMPLETED`

The engineer can read PRD files at any time to check progress.

## Skill Dependencies

This skill uses:
- `/team-review` (optional) - Suggest after execution for code review

This skill reads from:
- `/prd` output - The PRD files with task specifications

This skill produces output for:
- `/retro` - Execution logs in PRD files
- `/team-review` - Files to review

## Notes

- Agents MUST NOT make decisions. If a task is ambiguous, it's a PRD defect, not an execution problem.
- Always pass full task content to agents. Never tell them to "go find it."
- Always update PRD files with execution logs. This is the audit trail.
- If execution reveals PRD issues (wrong file path, missing dependency), stop and fix the PRD first.
- The quality of output depends entirely on PRD quality. Bad PRDs = bad code.
