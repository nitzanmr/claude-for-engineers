# PRD-05: Rules: PARTIAL Semantics + Task-Level Dependencies + Master Plan Status

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: None
Complexity: Medium

## Objective

Fill three spec gaps in the workflow rules: define what PARTIAL means for a task (vs FAILED), add task-level dependency syntax, and add PARTIAL to the Master Plan status transitions.

## Context

The current `workflow.md` and `prd-format.md` do not define `PARTIAL` at the task level — only at the PRD level. Agents doing execution have no guidance on what to do when a task runs but some acceptance criteria fail. Task-level dependencies exist in practice (e.g., "Task 3 depends on Task 2") but are not specified, so agents making DAG validation decisions for tasks have no spec to follow. These changes apply to both `templates/.claude/rules/` (distributed) and `.claude/rules/` (dev repo working copy).

## Tasks

### Task 1: Define PARTIAL task status and task-level dependency rules in `workflow.md`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/rules/workflow.md

**Update the Task status transition block** in "Status Transitions" (find the block starting with `**Task:**`):

Replace:
```
**Task:**
```
PENDING → IN_PROGRESS → COMPLETED
                      → FAILED
                      → BLOCKED (dependency failed)
```
```

With:
```
**Task:**
```
PENDING → IN_PROGRESS → COMPLETED
                      → FAILED          (task could not run to completion — always blocks dependents)
                      → PARTIAL         (task completed but ≥1 acceptance criterion did not pass —
                                         blocks dependents by default; engineer can override)
                      → BLOCKED         (a dependency is FAILED or PARTIAL without engineer override)
```
```

**Add a new "Task-Level Dependencies" subsection** in the "Dependencies" section, after the last bullet of the existing Dependencies list (before "### Scaling Limits"):

```markdown
### Task-Level Dependencies

Tasks within a PRD can declare `Depends on: Task N` in their header. The rules are:

- `/execute` validates task-level dependency chains before launching a PRD's tasks, using the same DFS cycle detection as PRD-level DAG validation
- If a task is `FAILED` or `PARTIAL`, all tasks that declare `Depends on: Task N` on it are marked `BLOCKED` — unless the engineer explicitly overrides in the execution log with a note like "proceeding despite PARTIAL"
- Circular task dependencies are an error — `/execute` stops and reports the cycle before starting the PRD

Task dependency format in a PRD file:
```markdown
### Task 3: Wire component to state

**Status:** PENDING
**Depends on:** Task 1, Task 2
```
```

##### MODIFY: .claude/rules/workflow.md

Apply identical changes as above (the `.claude/` copy is the dev repo's working copy — keep it in sync with templates).

#### Acceptance Criteria

- [ ] `templates/.claude/rules/workflow.md` contains `PARTIAL` in the Task status transition block with its definition
- [ ] `templates/.claude/rules/workflow.md` contains a "Task-Level Dependencies" subsection
- [ ] `.claude/rules/workflow.md` receives the same changes
- [ ] `make validate-invariants` passes (no unexpected status values introduced)

---

### Task 2: Add PARTIAL to Master Plan status transitions in `workflow.md`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/rules/workflow.md

**Update the Master Plan status transition block** in "Status Transitions" (find the block starting with `**Master Plan:**`):

Replace:
```
**Master Plan:**
```
DRAFT → APPROVED → PRDS_GENERATED → IN_PROGRESS → COMPLETED → RETRO_COMPLETE
                                                 → PARTIAL (if tasks failed)
```
```

With:
```
**Master Plan:**
```
DRAFT → APPROVED → PRDS_GENERATED → IN_PROGRESS → COMPLETED     → RETRO_COMPLETE
                                                 → PARTIAL        → RETRO_COMPLETE
                                                   (≥1 PRD ended in FAILED or PARTIAL;
                                                    all others completed)
```
```

##### MODIFY: .claude/rules/workflow.md

Apply identical change (keep dev repo in sync).

#### Acceptance Criteria

- [ ] Master Plan transition block in `templates/.claude/rules/workflow.md` shows `PARTIAL` with its definition
- [ ] `PARTIAL → RETRO_COMPLETE` transition is visible (retro can run on partial executions)
- [ ] `.claude/rules/workflow.md` receives the same changes

---

### Task 3: Add task-level dependency syntax and PARTIAL semantics to `prd-format.md`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/rules/prd-format.md

**Update the "Status Transition Rules" section** — replace the Task line:

Replace:
```
- Task: `PENDING` → `IN_PROGRESS` → `COMPLETED` | `FAILED` | `BLOCKED`
```

With:
```
- Task: `PENDING` → `IN_PROGRESS` → `COMPLETED` | `FAILED` | `PARTIAL` | `BLOCKED`
```

**Add a PARTIAL vs FAILED clarification block** immediately after the status transition rules (before the "## Execution Log Format" section):

```markdown
### PARTIAL vs FAILED

| Status | Meaning | Downstream effect |
|--------|---------|-------------------|
| `FAILED` | Task could not run to completion (error, missing file, crash) | Always blocks dependents |
| `PARTIAL` | Task ran to completion but ≥1 acceptance criterion did not pass | Blocks dependents by default; engineer can override in execution log |
```

**Add task-level dependency example** to the "PRD File Required Fields" section, after the existing field list. Add a note:

```markdown
Tasks within a PRD may also declare dependencies on other tasks in the same PRD:

```markdown
### Task 2: <Task Title>
**Status:** PENDING
**Depends on:** Task 1
**Complexity:** Low
```

The `Depends on:` field lists task numbers (e.g., `Task 1`, `Task 1, Task 3`). `/execute` validates these chains for cycles before starting the PRD.
```

##### MODIFY: .claude/rules/prd-format.md

Apply identical changes (keep dev repo in sync).

#### Acceptance Criteria

- [ ] `templates/.claude/rules/prd-format.md` Task status transition line includes `PARTIAL`
- [ ] `PARTIAL vs FAILED` table is present in `templates/.claude/rules/prd-format.md`
- [ ] Task-level `Depends on:` syntax example is present in `templates/.claude/rules/prd-format.md`
- [ ] `.claude/rules/prd-format.md` receives the same changes
- [ ] `make validate-statuses` passes (PARTIAL must already be in the allowed status set — check `validate/prd-status-values.sh` and add PARTIAL if missing)

---

## Execution Log

### Task 1: Define PARTIAL task status and task-level dependency rules in `workflow.md`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 09:30 UTC
- **Completed:** 2026-03-24 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - templates/.claude/rules/workflow.md (updated Task status transition block with PARTIAL; added Task-Level Dependencies subsection)
  - .claude/rules/workflow.md (same changes)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `templates/.claude/rules/workflow.md` contains `PARTIAL` in Task status transition block
  - [x] Contains "Task-Level Dependencies" subsection
  - [x] `.claude/rules/workflow.md` receives the same changes

### Task 2: Add PARTIAL to Master Plan status transitions in `workflow.md`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:00 UTC
- **Completed:** 2026-03-24 10:05 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - templates/.claude/rules/workflow.md (updated Master Plan block with expanded PARTIAL definition)
  - .claude/rules/workflow.md (same changes)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Master Plan transition block shows PARTIAL with definition
  - [x] `PARTIAL → RETRO_COMPLETE` transition visible
  - [x] Both copies updated

### Task 3: Add task-level dependency syntax and PARTIAL semantics to `prd-format.md`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:05 UTC
- **Completed:** 2026-03-24 10:15 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - templates/.claude/rules/prd-format.md (Task status line updated; PARTIAL vs FAILED table added; task-level Depends on syntax example added)
  - .claude/rules/prd-format.md (same changes)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Task status transition line includes `PARTIAL`
  - [x] PARTIAL vs FAILED table present
  - [x] Task-level dependency syntax example present
  - [x] Both copies updated
