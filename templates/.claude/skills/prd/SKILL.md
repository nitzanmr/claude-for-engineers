---
name: prd
description: Generate detailed PRDs with hyper-specific tasks from an approved Master Plan
argument-hint: <prd-directory-name or feature-name>
tags: [prd, specification, planning]
---

# PRD Generator Skill

Generate detailed PRDs from an approved Master Plan. Each PRD contains tiny, hyper-specific tasks that agents can execute mechanically.

## Prerequisites

- A Master Plan must exist and be approved (created by `/plan`)
- The Master Plan must be in `prds/<timestamp>_<feature-name>/master-plan.md`
- Status in Master Plan must be `APPROVED`

## What This Skill Does

1. Reads the approved Master Plan
2. For each PRD listed in the plan, generates a detailed PRD file
3. Each PRD contains tasks so specific that agents need zero thinking
4. Every file change is specified with code snippets or function descriptions
5. Dependencies between PRDs and between tasks are explicit

## Execution Steps

### Step 1: Read the Master Plan

**Before using the argument as a path:** Validate that `{{argument}}` contains only safe characters: letters, digits, hyphens, underscores, and the letter `T` (for timestamp separators). If the argument contains slashes, dots, spaces, or any other character, STOP and report: "Invalid PRD directory name — argument must be a safe directory name like `2026-03-18T11-15_feature-name`."

Read `prds/{{argument}}/master-plan.md` (or find the latest PRD directory if no argument was given).

Verify:
- Master Plan exists
- Status is APPROVED
- PRD list and dependency graph are defined

### Step 2: Explore for Each PRD

For each PRD in the master plan:
1. Read all files that will be modified
2. Understand current state of code
3. Identify exact insertion points, function signatures, types
4. Find existing patterns to follow

This exploration is critical. You MUST read the actual files before specifying changes.

### Step 2.5: Impact Audit (MANDATORY)

Before writing any PRD, run a comprehensive impact audit for every field, function, type, or interface being changed:

1. **Call-site audit.** For every field/function/type being modified, renamed, or removed, grep the ENTIRE codebase for all usages. Include controllers, utilities, jobs, admin code, scripts — not just models and services.

2. **Consumer audit.** For every data access pattern being changed (e.g., column rename, type change, new lookup method), find ALL consumers. Check every layer of the codebase, not just the obvious ones.

3. **Index/constraint audit.** For every model or schema being modified, review its full definition including indexes, unique constraints, and associations. If a column is being renamed, added, or removed, verify all indexes and constraints referencing it are updated.

4. **Migration consistency audit.** For any migration that drops or renames columns, verify it also handles indexes referencing those columns. For any migration that adds columns, verify default values and nullability.

If the audit reveals call sites or consumers not covered by the current PRD plan, **add tasks to cover them**. Do NOT rely on agents to "discover" these during execution — they won't.

**This step prevents the most common PRD failure mode: changing how something is stored or accessed but missing places that read it.**

### Step 3: Generate PRD Files

For each PRD, create a file following the Master Plan and PRD File templates below.

Key rules:
- **Tiny tasks.** A task should be completable without decisions. If it requires a decision, it's too big. Split it.
- **Exact file changes.** Show code for small changes. Show function names + descriptions for large changes. Always provide context anchors (not just line numbers).
- **No ambiguity.** An agent reading the task should know EXACTLY what to do.
- **Dependencies are explicit.** Both between PRDs and between tasks within a PRD.
- **Timestamps.** Every file gets a `Created:` header with UTC timestamp.
- **Tests included.** Every task with logic MUST include unit tests (inline or as a separate task). See testing rules below.
- **Testable acceptance criteria.** Every criterion must be verifiable by running a test or command. No vague criteria.

### Step 4: Write the Files

Write all PRD files to the same directory as the Master Plan:
```
prds/<timestamp>_<feature-name>/
  master-plan.md          # Already exists
  prd-01_description.md   # Generated now
  prd-02_description.md   # Generated now
  ...
```

### Step 5: Update Master Plan Status

Update the Master Plan:
- Set Status to `PRDS_GENERATED`
- Add generation timestamp
- Update PRD summary table with actual task counts

### Step 6: Present for Review

Tell the engineer:
- How many PRDs were generated
- Total task count
- Which PRDs are independent (can run in parallel)
- Which have dependencies
- Ask them to review the PRD files

**Do NOT proceed to execution.** The engineer reviews PRDs in their editor and either approves or requests changes.

## Task Granularity Examples

### Good (small, specific):
```markdown
### Task 1: Add PaymentStatus type

##### CREATE: src/types/payment.ts
```ts
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentRecord = {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: number;
};
```

#### Acceptance Criteria
- [ ] File created at correct path
- [ ] Types exported correctly
- [ ] No TypeScript errors
```

### Bad (too big, requires decisions):
```markdown
### Task 1: Build the entire payment system
Create types, API client, state management, and UI components for payments.
```

### Good (modifying existing file):
```markdown
### Task 3: Wire PaymentStatus to PaymentScreen

##### MODIFY: src/components/PaymentScreen.tsx

**Add import** (after existing type imports):
```ts
import type { PaymentRecord } from '../../types/payment';
```

**Add to StateProps type**:
```ts
type StateProps = {
  // ...existing props...
  paymentRecord?: PaymentRecord;  // Add this
};
```

**Add to withGlobal** (after existing selectors):
```ts
paymentRecord: selectPaymentRecord(global, ownProps.paymentId),
```

#### Acceptance Criteria
- [ ] Import added
- [ ] StateProps updated
- [ ] withGlobal wired correctly
- [ ] No TypeScript errors
```

## Master Plan Template

```markdown
# Master Plan: <Feature Name>

Created: YYYY-MM-DD HH:MM UTC
Status: DRAFT | APPROVED | PRDS_GENERATED | IN_PROGRESS | COMPLETED | PARTIAL | RETRO_COMPLETE
Author: <who planned this>

## Overview
<2-3 sentences: what is being built and why>

## Goals
- <Goal 1>
- <Goal 2>

## Architecture Decisions
- Decision 1: <what was decided and why>
- Decision 2: <what was decided and why>

## PRD Dependency Graph

​```
PRD-01 (no deps)  ──┐
PRD-02 (no deps)  ──┼──> PRD-04 (depends: 01, 02, 03)
PRD-03 (depends: 01)┘         │
                              v
                         PRD-05 (depends: 04)
​```

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | Short name | None | 4 | Low |
| 02 | Short name | None | 3 | Medium |

## Out of Scope
- <What is NOT being built>

## Open Questions
- <Should be empty before approval>
```

## PRD File Template

```markdown
# PRD-<NN>: <Title>

Created: YYYY-MM-DD HH:MM UTC
Status: PENDING | IN_PROGRESS | COMPLETED | BLOCKED
Depends on: None | PRD-XX, PRD-YY
Complexity: Low | Medium | High

## Objective
<One sentence: what this PRD achieves>

## Context
<Why this PRD exists, how it fits in the feature>

## Tasks

### Task 1: <Task Title>

**Status:** PENDING
**Complexity:** Low | Medium | High
**Recommended skills:** <project-specific skills if applicable>

#### File Changes

##### CREATE: path/to/new/file.ts
​```ts
export function myFunction(param: string): Result {
  // <description of logic>
}
​```

##### MODIFY: path/to/existing/file.ts

**Add import** (after existing imports):
​```ts
import { myFunction } from '../new/file';
​```

**Update `ResultType`** (add new field after `name`):
​```ts
newField: number;  // <why this field is needed>
​```

##### DELETE: path/to/obsolete/file.ts
<Why this file is being removed>

#### Unit Tests

##### CREATE: tests/path/matching/source.test.ts
​```ts
import { myFunction } from '../../src/path/to/source';

describe('myFunction', () => {
  it('should return expected result for valid input', () => {
    expect(myFunction('valid')).toEqual({ ... });
  });
  it('should handle edge case', () => {
    expect(myFunction('')).toEqual(DEFAULT_VALUE);
  });
});
​```

#### Acceptance Criteria
- [ ] `npm test -- source.test.ts` passes
- [ ] `npm run typecheck` passes with no errors

---

### Task 2: <Task Title>
**Status:** PENDING
**Depends on:** Task 1
...

---

## Execution Log

### Task 1: <Task Title>
- **Agent:** <agent type used>
- **Mode:** task | swarm
- **Started:** YYYY-MM-DD HH:MM UTC
- **Completed:** YYYY-MM-DD HH:MM UTC
- **Status:** COMPLETED | FAILED | PARTIAL
- **Files created:** <list or "(none)">
- **Files modified:** <list with description or "(none)">
- **Files deleted:** <list or "(none)">
- **Skills used:** <list or "(none)">
- **Test results:** <command + PASS/FAIL>
- **Issues encountered:** <list or "(none)">
- **Acceptance criteria:**
  - [x] Criterion 1
```

## File Change Specification

| Change Size | What to Show |
|-------------|-------------|
| < 20 lines | Exact code with insertion point |
| 20-50 lines | Function signatures + key logic |
| 50+ lines / new files | Structure, exports, key functions with descriptions |

Always provide **context anchors** — not line numbers:
- "After the line containing `const lang = useLang()`"
- "Inside the `handleSubmit` function, after validation"
- "Before the `export default` statement"

## Recommending Skills

If the project has project-specific skills (e.g., `/component`, `/lang-key`, `/review`), include them in task recommendations:

```markdown
**Recommended skills:** `/component PaymentCard`, `/lang-key`
```

This tells the executing agent which skills to use. If no project-specific skills exist, omit this field.

## Recommending Agents

If the project has specialized agents (e.g., `component-builder`, `state-architect`), recommend them:

```markdown
**Recommended agent:** `component-builder`
```

This tells the executor which agent type to assign. If no specialized agents exist, omit this field.

## Testing Requirements

**Unit tests required for:** utility functions, reducers, selectors, API clients, business logic.

**Unit tests optional for:** type definitions, re-exports, CSS/SCSS, lang keys, simple UI components.

**Test file location:** mirror `src/` in `tests/` (e.g., `src/util/foo.ts` → `tests/util/foo.test.ts`).

**Inline vs. separate task:** inline for 1-2 test cases; separate task when tests are substantial.

**Integration test PRD:** every feature MUST have a final integration test PRD that depends on all other PRDs. Runs last.

**Acceptance criteria must be verifiable:**
```
// BAD
- [ ] Component works correctly

// GOOD
- [ ] `npm test -- foo.test.ts` passes
- [ ] `npm run typecheck` passes with no errors
- [ ] `selectFoo(global)` returns `global.foo`
```

## Task Granularity Rules

Tasks must be completable without any decisions. If a task requires a decision, split it.

- Adding a lang key = 1 task
- Creating a component file = 1 task
- Adding an import + calling a function = 1 task
- Writing unit tests for a module = 1 task

If a task description exceeds ~50 lines, split it. Ask: **Can an agent complete this without making any decisions?**

## Notes

- Read actual files before specifying changes. Never guess at current file contents.
- When in doubt about task size, split smaller.
- PRDs should be reviewable like a PR. The engineer should know exactly what code will exist after execution.
- If you discover issues with the Master Plan during PRD generation (e.g., missing dependency, conflicting requirements), stop and ask the engineer before continuing.
