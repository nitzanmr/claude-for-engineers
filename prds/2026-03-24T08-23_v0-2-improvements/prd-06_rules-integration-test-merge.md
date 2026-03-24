# PRD-06: Rules: Integration Test PRD Convention + Review→Merge Decision

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: PRD-05
Complexity: Low

## Objective

Add two missing pieces to `workflow.md`: the integration test PRD convention (every feature ends with a test-only PRD) and the review→merge decision guide (backlog categories map to merge readiness).

## Context

The workflow rules say "every feature MUST include a final integration test PRD" but don't specify its name, structure, or how it fits in the dependency graph. Similarly, after `/team-review`, engineers get backlog categories but there's no rule mapping those categories to a merge decision. Both are currently in the architecture decisions in the master plan but not in the distributed rules files.

## Tasks

### Task 1: Add integration test PRD convention to `workflow.md`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/rules/workflow.md

**In the "Testing" section under "Cross-Phase Rules"**, find the block:

```
**In PRDs (`/prd` phase):**
- Every task with logic (functions, reducers, selectors, utilities) MUST include unit tests
...
- Every feature MUST include a final integration test PRD that depends on all other PRDs
```

**After** `- Every feature MUST include a final integration test PRD that depends on all other PRDs`, add the following sub-block:

```markdown
**Integration Test PRD Convention:**

Every feature MUST end with an integration test PRD. Rules:

- **Name:** `prd-NN_integration-tests.md` (where NN is the last PRD number)
- **Depends on:** ALL implementation PRDs — it is the final node in the dependency DAG
- **Content:** Only test tasks — no production code changes
- **Acceptance criteria per task:** A runnable command (e.g., `npm test -- integration.test.js`)
- **Counts** toward the PRD total in the Master Plan summary table

Example dependency line: `Depends on: PRD-01, PRD-02, PRD-03`

Example task:
```markdown
### Task 1: Run end-to-end integration suite

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: tests/integration/feature.test.js
(test code here)

#### Acceptance Criteria
- [ ] `npm test -- tests/integration/feature.test.js` exits 0
- [ ] All integration scenarios defined in the Master Plan are covered
```
```

##### MODIFY: .claude/rules/workflow.md

Apply identical change (keep dev repo in sync).

#### Acceptance Criteria

- [ ] "Integration Test PRD Convention" block is present in `templates/.claude/rules/workflow.md`
- [ ] Convention specifies: name pattern, depends-on all PRDs, test-only content, runnable acceptance criteria
- [ ] `.claude/rules/workflow.md` receives the same changes

---

### Task 2: Add review→merge decision guide to `workflow.md`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/rules/workflow.md

**In "Phase 4: Review (Optional)"**, after the "How it works" bullet list and before any "## Cross-Phase Rules" heading, add a new subsection:

```markdown
### Review → Merge Decision

After `/team-review` completes, use backlog categories to determine merge readiness:

| Backlog Category | Merge Action |
|-----------------|-------------|
| **Needed** (BLG items flagged as `[Needed]`) | Must fix before merge. Either create follow-up PRDs or fix inline, then re-run `/team-review` to clear. |
| **Desirable** (BLG items flagged as `[Desirable]`) | Merge is safe. Track in issue tracker or manage with `/pm-backlog`. |
| **Hard** (BLG items flagged as `[Hard]`) | Do NOT merge. Start a new `/plan` session — this requires re-scoping. |

**Decision rules:**
- All Needed items cleared → merge recommended
- Only Desirable items remain → merge is safe, track separately
- Any Hard items present → stop, re-plan
- PRD Status `REVIEWED_PASS` → merge ready; `REVIEWED_NEEDS_FIXES` → fix required
```

##### MODIFY: .claude/rules/workflow.md

Apply identical change (keep dev repo in sync).

#### Acceptance Criteria

- [ ] "Review → Merge Decision" table is present in `templates/.claude/rules/workflow.md`
- [ ] Table covers all three backlog categories: Needed, Desirable, Hard
- [ ] Decision rules are explicit (all Needed cleared = merge recommended)
- [ ] `.claude/rules/workflow.md` receives the same changes

---

## Execution Log

### Task 1: Add integration test PRD convention to `workflow.md`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:15 UTC
- **Completed:** 2026-03-24 10:20 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - templates/.claude/rules/workflow.md (added "Integration Test PRD Convention" block after existing integration test PRD bullet)
  - .claude/rules/workflow.md (same changes)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] "Integration Test PRD Convention" block present in both workflow.md copies
  - [x] Convention specifies name pattern, depends-on-all, test-only content, runnable acceptance criteria

### Task 2: Add review→merge decision guide to `workflow.md`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:20 UTC
- **Completed:** 2026-03-24 10:25 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - templates/.claude/rules/workflow.md (added "Review → Merge Decision" table in Phase 4 section)
  - .claude/rules/workflow.md (same changes)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] "Review → Merge Decision" table present in both copies
  - [x] Table covers Needed, Desirable, Hard categories
  - [x] Decision rules explicit
