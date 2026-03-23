---
name: workflow
description: Claude for Engineers workflow rules - plan, prd, execute, retro + team skills
---

# Workflow Rules

## Skills Overview

| Skill | Phase | Purpose |
|-------|-------|---------|
| `/plan` | Planning | Collaborative conversation to produce Master Plan |
| `/team-research` | Planning | Parallel codebase exploration during `/plan` |
| `/prd` | Specification | Generate detailed PRDs from Master Plan |
| `/execute` | Execution | Mechanical agent execution (task or swarm mode) |
| `/team-review` | Review (optional) | Parallel code review after execution |
| `/retro` | Retrospective | Capture learnings and update documentation |

## The Workflow

```
                    ┌─────────────────┐
                    │    /plan         │
                    │  (conversation)  │
                    │                  │
                    │  Can use:        │
                    │  /team-research  │
                    └────────┬────────┘
                             │ Master Plan approved
                             v
                    ┌─────────────────┐
                    │    /prd          │
                    │  (specification) │
                    └────────┬────────┘
                             │ PRDs reviewed & approved
                             v
                    ┌─────────────────┐
                    │   /execute       │
                    │  (task or swarm) │
                    └────────┬────────┘
                             │ Execution complete
                             v
                    ┌─────────────────┐
                    │  /team-review    │
                    │  (optional)      │
                    └────────┬────────┘
                             │
                             v
                    ┌─────────────────┐
                    │   /retro         │
                    │  (retrospective) │
                    └─────────────────┘
```

## Phase Rules

### Phase 1: Plan (Collaborative)

**Goal:** Both human and AI fully understand what will be built.

**Skill:** `/plan`

Rules:
- This is a CONVERSATION, not auto-generation
- AI must explore the codebase before proposing architecture
- AI asks clarifying questions - don't assume
- Build toward a Master Plan incrementally during discussion
- Two gates: (1) "Ready to write Master Plan?" (2) "Approve this Master Plan?"
- Master Plan is lightweight - no code-level detail yet

**Sub-skill:** `/team-research`

When to use during planning:
- Feature touches multiple subsystems
- Need to understand complex existing patterns
- Mapping all files that will be affected
- Engineer asks "how does X work today?" and the answer spans many files

How it works:
- Propose 2-4 focused research questions to the engineer
- Get approval before launching
- Launch parallel Explore agents
- Synthesize results and continue the planning conversation

### Phase 2: PRD (Detailed Specification)

**Goal:** Every file change is specified before a single line of code is written.

**Skill:** `/prd`

Rules:
- Only runs AFTER Master Plan is approved
- Generates multiple PRDs with dependencies between them
- Tasks within PRDs are tiny and hyper-specific
- Each task specifies exact file changes (see prd-format.md)
- Small changes: show actual code snippets
- Large changes: show function names + description of what changes
- Every task lists: files to create, modify, delete
- Timestamps in directory names and file headers
- Engineer reviews all PRD files before execution begins
- Engineer can request changes to any PRD

### Phase 3: Execute (Mechanical)

**Goal:** Agents follow PRD tasks exactly. No decisions, no thinking.

**Skill:** `/execute`

Rules:
- Only runs AFTER engineer approves all PRDs
- Engineer chooses execution mode:
  - **Task mode**: Parallel subagents (simpler, faster, no coordination)
  - **Swarm mode**: TeamCreate with shared task list (complex features, live progress)
- Pass full task content directly to agents (don't tell them to find it)
- Agents follow task files mechanically
- Agents do NOT make architectural decisions
- If an agent encounters ambiguity, it stops and reports - does not guess
- Agents update PRD files with progress logs and timestamps
- Dependency order is respected: independent PRDs first, then dependent ones
- Each task records: start time, end time, files touched, issues encountered

### Phase 4: Review (Optional)

**Goal:** Verify execution results match PRD specifications.

**Skill:** `/team-review`

When to use:
- After execution of complex features
- Before merging to main branch
- When engineer wants thorough verification

How it works:
- Build session memory bundle (context snapshot + current topic)
- Scan PRD content to auto-select specialist agents; show selection to engineer
- Launch parallel review agents (spec compliance + code quality + auto-selected specialists)
- PM synthesizes all findings into prioritized backlog (Needed / Desirable / Hard)
- Write `review.md` (full reports) and `backlog.md` (structured issue list)
- Show review dashboard: severity aggregate, backlog status, PRD status badge
- Engineer decides what to fix (or run `/pm-backlog <dir>` to manage items)

### Phase 5: Retro (Retrospective)

**Goal:** Capture what happened for future reference.

**Skill:** `/retro`

Rules:
- Review execution logs in PRD files
- Identify what went well and what didn't
- Assess PRD quality (were tasks specific enough? were dependencies correct?)
- Update project documentation if patterns were learned
- Write retrospective to `prds/<dir>/retrospective.md`

## Cross-Phase Rules

### Timestamps
- All PRD directories include creation timestamp: `YYYY-MM-DDTHH-MM`
- All PRD files include `Created:` header with full UTC timestamp
- All execution logs include UTC timestamps per entry
- All retrospectives and reviews are timestamped

### File Ownership
- The engineer reviews all generated PRDs before execution
- PRD files are the source of truth during execution
- Agents append to PRD files (execution log section) but NEVER modify the spec sections
- Review output goes to `review.md`, retro to `retrospective.md`

### Approval Gates

The workflow has explicit approval gates. Nothing proceeds without engineer confirmation:

1. **Master Plan approval** - Before PRDs are generated
2. **PRD approval** - Before execution starts
3. **Execution mode** - Engineer picks task or swarm
4. **Failed task handling** - Engineer decides retry, skip, or fix

### Dependencies
- PRDs can depend on other PRDs (DAG structure — no circular dependencies allowed)
- Tasks within a PRD can depend on other tasks in the same PRD
- Dependencies are explicit and listed in each PRD header and task
- Execution respects dependency order
- Independent PRDs/tasks run in parallel
- If a task modifies the same file as another task in the same wave, they run sequentially
- `/execute` validates the dependency graph before execution — if a cycle is detected, it stops and reports

### Status Transitions

All status values and their valid transitions:

**Master Plan:**
```
DRAFT → APPROVED → PRDS_GENERATED → IN_PROGRESS → COMPLETED → RETRO_COMPLETE
                                                 → PARTIAL (if tasks failed)
```

**PRD:**
```
PENDING → IN_PROGRESS → COMPLETED → REVIEWED_PASS
                                  → REVIEWED_NEEDS_FIXES
                      → PARTIAL (some tasks failed)
                      → BLOCKED (dependency failed)
```

**Task:**
```
PENDING → IN_PROGRESS → COMPLETED
                      → FAILED
                      → BLOCKED (dependency failed)
```

### Scaling Limits

Recommended limits to keep execution manageable:
- **Tasks per PRD:** 3-8 (split larger PRDs)
- **PRDs per feature:** 3-8 (split larger features into multiple planning sessions)
- **Agents in swarm mode:** 5-8 max (batch remaining tasks)
- **Research agents:** 2-4 max (per `/team-research`)
- **Review agents:** 2-3 max (per `/team-review`)

### Testing

Testing is built into the workflow at every level:

**In PRDs (`/prd` phase):**
- Every task with logic (functions, reducers, selectors, utilities) MUST include unit tests
- Tests can be inline with the task or a separate test task
- Acceptance criteria must be verifiable by running a test or command
- Every feature MUST include a final integration test PRD that depends on all other PRDs

**During execution (`/execute` phase):**
- Agents run unit tests as part of task completion
- After each wave, the executor verifies tests pass
- Integration test PRD runs last, after all implementation PRDs

**In review (`/team-review` phase):**
- Review agents check that test files exist for all logic
- Review agents verify test coverage matches implementation

**What needs tests:**
- Utility functions, reducers, selectors, API clients, business logic

**What doesn't need tests:**
- Type definitions, re-exports, CSS/SCSS, localization keys

### Using Project-Specific Skills
- PRD tasks can recommend project-specific skills (e.g., `/component`, `/lang-key`)
- PRD tasks can recommend project-specific agents (e.g., `component-builder`)
- The executor uses these recommendations when launching agents
- If no project-specific skills exist, tasks run with `general-purpose` agents
