---
name: prd-format
description: PRD file structure and formatting specification
---

# PRD Format Specification

## Directory Structure

```
prds/
└── YYYY-MM-DDTHH-MM_feature-name/
    ├── master-plan.md
    ├── prd-01_short-description.md
    ├── prd-02_short-description.md
    ├── prd-03_short-description.md
    └── ...
```

- Directory name: `<timestamp>_<kebab-case-feature-name>`
- PRD files: `prd-<NN>_<kebab-case-description>.md` (zero-padded number)
- Master plan: always `master-plan.md`

## Master Plan Format

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
<Key decisions made during planning discussion>
- Decision 1: <what was decided and why>
- Decision 2: <what was decided and why>

## PRD Dependency Graph

```
PRD-01 (no deps)  ──┐
PRD-02 (no deps)  ──┼──> PRD-04 (depends: 01, 02, 03)
PRD-03 (depends: 01)┘         │
                              v
                         PRD-05 (depends: 04)
```

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | Short name | None | 4 | Low |
| 02 | Short name | None | 3 | Medium |
| 03 | Short name | PRD-01 | 5 | Medium |
| 04 | Short name | PRD-01,02,03 | 2 | Low |

## Out of Scope
- <What is NOT being built>

## Open Questions
- <Anything unresolved - should be empty before approval>
```

## PRD File Format

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
<Description of the new file's purpose>
```ts
// Key structure/exports of the new file
export function myFunction(param: string): Result {
  // <description of logic>
}

export type MyType = {
  field1: string;
  field2: number;
};
```

##### MODIFY: path/to/existing/file.ts

**Add import** (top of file, after existing imports):
```ts
import { myFunction } from '../new/file';
```

**Add to `processData` function** (after the validation block ~line 45):
```ts
const result = myFunction(data.value);
if (!result) return;
```

**Update `ResultType` type** (add new field):
```ts
// Before:
type ResultType = {
  id: string;
  name: string;
};

// After:
type ResultType = {
  id: string;
  name: string;
  newField: number;  // <why this field is needed>
};
```

##### DELETE: path/to/obsolete/file.ts
<Why this file is being removed>

#### Unit Tests

Every task that creates or modifies logic (types, functions, reducers, selectors, utilities, API calls) MUST include a corresponding test task - either inline or as a separate task in the same PRD.

```markdown
##### CREATE: tests/path/matching/source.test.ts

```ts
import { myFunction } from '../../src/path/to/source';

describe('myFunction', () => {
  it('should return expected result for valid input', () => {
    expect(myFunction('valid')).toEqual({ ... });
  });

  it('should handle edge case', () => {
    expect(myFunction('')).toEqual(DEFAULT_VALUE);
  });

  it('should throw on invalid input', () => {
    expect(() => myFunction(undefined as any)).toThrow();
  });
});
```
```

**Test location:** Tests mirror the `src/` structure in a `tests/` directory:
```
src/util/settingsStorage.ts      → tests/util/settingsStorage.test.ts
src/global/reducers/settings.ts  → tests/global/reducers/settings.test.ts
src/global/selectors/settings.ts → tests/global/selectors/settings.test.ts
```

#### Acceptance Criteria

Every acceptance criterion must be **verifiable by running a test or a command**. Vague criteria are not allowed.

```markdown
// BAD - not testable
- [ ] Component works correctly
- [ ] State is managed properly

// GOOD - testable
- [ ] `selectSettings(global)` returns `global.settings`
- [ ] `updateSettings(global, { theme: 'dark' })` returns new global with updated theme
- [ ] `loadSettings()` returns DEFAULT_SETTINGS when localStorage is empty
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm test -- settings.test.ts` passes
```

Format:
- [ ] <Specific, testable criterion>
- [ ] <Specific, testable criterion>
- [ ] Unit tests pass: `npm test -- <test-file>`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No lint errors: `npm run lint -- <files>`

---

### Task 2: <Task Title>
**Status:** PENDING
**Depends on:** Task 1
...

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->

### Task 1: <Task Title>
- **Agent:** <agent type used>
- **Started:** YYYY-MM-DD HH:MM UTC
- **Completed:** YYYY-MM-DD HH:MM UTC
- **Files created:**
  - path/to/file.ts
- **Files modified:**
  - path/to/existing.ts (added import, updated function)
- **Files deleted:**
  - (none)
- **Skills used:** /component, /lang-key, /review
- **Issues encountered:**
  - (none)
- **Acceptance criteria:**
  - [x] Criterion 1
  - [x] Criterion 2
  - [x] No TypeScript errors
  - [x] No lint errors

### Task 2: <Task Title>
...
```

## File Change Specification Rules

### For Small Changes (< 20 lines)
Show exact code with before/after or insertion point:
```markdown
**Add to line 45** (after `const lang = useLang();`):
```ts
const isEnabled = useFeatureFlag('myFeature');
```
```

### For Medium Changes (20-50 lines)
Show function signatures, key logic, and where they go:
```markdown
**Add `processPayment` function** (after `validateForm` function):
```ts
function processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult> {
  // 1. Validate amount > 0
  // 2. Call PaymentAPI.charge(amount, method)
  // 3. Update global state with result
  // 4. Return result
}
```
```

### For Large Changes (50+ lines) or New Files
Show structure, exports, key functions with descriptions:
```markdown
**New file purpose:** Payment processing service

**Exports:**
- `PaymentService` class (singleton)
  - `charge(amount, method)` - Process payment via API
  - `refund(transactionId)` - Issue refund
  - `getHistory(userId)` - Fetch payment history
- `PaymentError` class - Custom error type
- `formatAmount(amount, currency)` - Display helper

**Key patterns:**
- Extends `BaseApiClient` for auth handling
- Uses `TelebizStorageKey.PaymentCache` for caching
- Error handling follows service error pattern (try/catch, log, update state)
```

### Anchoring Changes (Resilient to Line Shifts)
Always provide context anchors, not just line numbers:
```markdown
**After the line containing** `const lang = useLang();`
**Inside the `handleSubmit` function**, after the validation check
**At the end of the imports section**
**Before the `export default` statement**
```

Line numbers are hints, not requirements. Anchors are the source of truth.

## Task Granularity Rules

Tasks should be as small as possible:
- Adding a single lang key = 1 task
- Creating a component file = 1 task
- Adding an import + calling a function = 1 task
- Wiring state to a component = 1 task
- Writing unit tests for a module = 1 task

If a task description is longer than ~50 lines, it should probably be split.

A good test: **Can an agent complete this task without making any decisions?** If not, break it down further.

## Testing Rules

### Unit Tests Are Required For

- Utility functions (pure functions, helpers)
- State reducers (immutable update logic)
- State selectors (data access logic)
- API clients (request/response handling)
- Business logic (validation, transformation, calculation)

### Unit Tests Are Optional For

- Simple type definitions (no logic to test)
- UI components (unless they contain complex logic)
- Styling changes
- Localization keys

### Test Task Placement

Tests can be structured two ways:

**Option A: Inline with implementation task**
Include the test file in the same task as the implementation. Best for small tasks where the test is 1-2 test cases.

**Option B: Separate test task**
Create a dedicated test task that depends on the implementation task. Best for:
- Complex logic needing many test cases
- Modules where tests are substantial

### Integration Tests

**Every PRD set MUST include a final integration test PRD** (or final tasks in the last PRD) that:
- Tests the feature end-to-end
- Verifies PRD boundaries work together (types from PRD-01 used correctly in PRD-03, etc.)
- Runs the full test suite to ensure no regressions

Integration test PRD depends on all other PRDs and runs last.

### Acceptance Criteria Must Be Testable

Every acceptance criterion must be verifiable by either:
1. Running a test: `npm test -- <file>.test.ts`
2. Running a command: `npm run typecheck`, `npm run lint`
3. Checking a specific behavior: "calling X with Y returns Z"

Never write vague criteria like "works correctly" or "handles edge cases."
