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

Read `prds/{{argument}}/master-plan.md` (or find the latest PRD directory).

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

### Step 3: Generate PRD Files

For each PRD, create a file following the format in `.claude/rules/prd-format.md`.

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

## File Change Specification

Follow these rules from `.claude/rules/prd-format.md`:

| Change Size | What to Show |
|-------------|-------------|
| < 20 lines | Exact code with insertion point |
| 20-50 lines | Function signatures + key logic |
| 50+ lines / new files | Structure, exports, key functions with descriptions |

Always provide **context anchors**:
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

Follow the full testing rules in `.claude/rules/prd-format.md`. Key points:

- Every task with logic MUST include unit tests (inline or separate task)
- Every feature MUST include a final integration test PRD that depends on all others
- Acceptance criteria must be verifiable by running a test or command — no vague criteria
- Type definitions, re-exports, CSS, and lang keys don't need tests

## Notes

- Read actual files before specifying changes. Never guess at current file contents.
- When in doubt about task size, split smaller.
- PRDs should be reviewable like a PR. The engineer should know exactly what code will exist after execution.
- If you discover issues with the Master Plan during PRD generation (e.g., missing dependency, conflicting requirements), stop and ask the engineer before continuing.
