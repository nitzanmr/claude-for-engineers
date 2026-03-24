---
name: prd-format
description: PRD file structure — required fields, naming conventions, status values, and execution log format
---

# PRD Format Specification

## Directory Structure

```
prds/
└── YYYY-MM-DDTHH-MM_feature-name/
    ├── master-plan.md
    ├── prd-01_short-description.md
    ├── prd-02_short-description.md
    └── ...
```

- Directory name: `<timestamp>_<kebab-case-feature-name>`
- PRD files: `prd-<NN>_<kebab-case-description>.md` (zero-padded number)
- Master plan: always `master-plan.md`

## Master Plan Required Fields

```
Created: YYYY-MM-DD HH:MM UTC
Status: DRAFT | APPROVED | PRDS_GENERATED | IN_PROGRESS | COMPLETED | PARTIAL | RETRO_COMPLETE
Author: <who planned this>
```

Sections required: Overview, Goals, Architecture Decisions, PRD Dependency Graph (ASCII art), PRD Summary table, Out of Scope, Open Questions.

Full template with examples: `.claude/skills/prd/SKILL.md`

## PRD File Required Fields

```
Created: YYYY-MM-DD HH:MM UTC
Status: PENDING | IN_PROGRESS | COMPLETED | BLOCKED
Depends on: None | PRD-XX, PRD-YY
Complexity: Low | Medium | High
```

Sections required: Objective, Context, Tasks, Execution Log.

Each task requires: Status, Complexity, File Changes (CREATE / MODIFY / DELETE subsections), Unit Tests, Acceptance Criteria.

Full template with examples: `.claude/skills/prd/SKILL.md`

## Status Transition Rules

- Task: `PENDING` → `IN_PROGRESS` → `COMPLETED` | `FAILED` | `PARTIAL` | `BLOCKED`
- PRD: `PENDING` → `IN_PROGRESS` → `COMPLETED` | `PARTIAL` | `BLOCKED`
- Master Plan: `DRAFT` → `APPROVED` → `PRDS_GENERATED` → `IN_PROGRESS` → `COMPLETED` | `PARTIAL` | `RETRO_COMPLETE`

### PARTIAL vs FAILED

| Status | Meaning | Downstream effect |
|--------|---------|-------------------|
| `FAILED` | Task could not run to completion (error, missing file, crash) | Always blocks dependents |
| `PARTIAL` | Task ran to completion but ≥1 acceptance criterion did not pass | Blocks dependents by default; engineer can override in execution log |

### Task-Level Dependency Syntax

Tasks within a PRD may also declare dependencies on other tasks in the same PRD:

```markdown
### Task 2: <Task Title>
**Status:** PENDING
**Depends on:** Task 1
**Complexity:** Low
```

The `Depends on:` field lists task numbers (e.g., `Task 1`, `Task 1, Task 3`). `/execute` validates these chains for cycles before starting the PRD.

## Execution Log Format

Agents append to the `## Execution Log` section. Format per task:

```markdown
### Task N: <Title>
- **Agent:** <agent type>
- **Mode:** task | swarm
- **Started:** YYYY-MM-DD HH:MM UTC
- **Completed:** YYYY-MM-DD HH:MM UTC
- **Status:** COMPLETED | FAILED | PARTIAL
- **Files created:** <list or "(none)">
- **Files modified:** <list with description or "(none)">
- **Files deleted:** <list or "(none)">
- **Skills used:** <list or "(none)">
- **Test results:** <command + PASS/FAIL, or "(none)">
- **Issues encountered:** <list or "(none)">
- **Acceptance criteria:**
  - [x] Criterion 1
  - [x] Criterion 2
```

## Key Rules

- **File change anchors:** Use context anchors (function names, surrounding lines), not just line numbers. Line numbers are hints only.
- **Acceptance criteria:** Every criterion must be verifiable by running a test or command. No vague criteria.
- **Test location:** Tests mirror `src/` structure in a `tests/` directory (e.g., `src/util/foo.ts` → `tests/util/foo.test.ts`).
