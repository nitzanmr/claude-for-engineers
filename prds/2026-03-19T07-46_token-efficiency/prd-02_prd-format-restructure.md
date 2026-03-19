# PRD-02: prd-format.md Restructure

Created: 2026-03-19 07:46 UTC
Status: PENDING
Depends on: None
Complexity: Medium

## Objective

Reduce the always-loaded `prd-format.md` from 9,282 chars to ~2,100 chars by keeping only the spec (required fields, naming, status values, execution log format) and moving all authoring guidance and full templates to `prd/SKILL.md` where they are only loaded during `/prd`.

## Context

`prd-format.md` is loaded as a project rule on every conversation — including `/execute`, `/team-review`, and `/retro` runs where 85%+ of its content is irrelevant. The file contains full template examples, task granularity rules, testing decision logic, and file-change authoring guidance that are only needed when generating PRDs. Moving these to `prd/SKILL.md` (phase-specific) eliminates ~7,200 chars from the always-loaded context without losing any information.

---

## Tasks

### Task 1: Rewrite prd-format.md to spec-only

**Status:** PENDING
**Complexity:** Medium

#### File Changes

##### MODIFY: .claude/rules/prd-format.md

**Replace the entire file content** with the spec-only version below. This removes: the full Master Plan template (lines 26–69), the full PRD File Format template with embedded code examples (lines 73–234), the File Change Specification Rules with examples (lines 236–289), the Task Granularity Rules (lines 291–302), and the Testing Rules (lines 304–349). All of that content moves to `prd/SKILL.md` in Task 2 and Task 3.

New file content:

```markdown
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

- Task: `PENDING` → `IN_PROGRESS` → `COMPLETED` | `FAILED` | `BLOCKED`
- PRD: `PENDING` → `IN_PROGRESS` → `COMPLETED` | `PARTIAL` | `BLOCKED`
- Master Plan: `DRAFT` → `APPROVED` → `PRDS_GENERATED` → `IN_PROGRESS` → `COMPLETED` | `PARTIAL` | `RETRO_COMPLETE`

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
```

#### Acceptance Criteria

- [ ] File is ≤ 90 lines
- [ ] File contains `## Directory Structure` section
- [ ] File contains `## Master Plan Required Fields` section with status values
- [ ] File contains `## PRD File Required Fields` section
- [ ] File contains `## Status Transition Rules` section
- [ ] File contains `## Execution Log Format` section with the full template
- [ ] File contains `## Key Rules` section (anchors, acceptance criteria, test location)
- [ ] File does NOT contain `## File Change Specification Rules`
- [ ] File does NOT contain `## Task Granularity Rules`
- [ ] File does NOT contain `## Testing Rules`
- [ ] File references `.claude/skills/prd/SKILL.md` for full templates

---

### Task 2: Add Master Plan and PRD File templates to prd/SKILL.md

**Status:** PENDING
**Complexity:** Medium
**Depends on:** Task 1

#### File Changes

##### MODIFY: .claude/skills/prd/SKILL.md

**Add a new `## Master Plan Template` section** after the frontmatter/header and before `## Prerequisites` (insert at the top of the skill content, after line 10 — the `# PRD Generator Skill` heading and its one-line description):

The section to add contains the full Master Plan template (currently in prd-format.md lines 26–69 before the rewrite). It looks like:

```markdown
## Master Plan Template

Write master plans to `prds/<YYYY-MM-DDTHH-MM>_<feature-name>/master-plan.md`. Full structure:

```markdown
# Master Plan: <Feature Name>

Created: YYYY-MM-DD HH:MM UTC
Status: DRAFT
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

## Out of Scope
- <What is NOT being built>

## Open Questions
- <should be empty before approval>
```
```

**Add a new `## Full PRD File Template` section** immediately after the Master Plan Template section. The section contains the full PRD template (currently in prd-format.md lines 73–234 before the rewrite). Key structure:

```markdown
## Full PRD File Template

```markdown
# PRD-<NN>: <Title>

Created: YYYY-MM-DD HH:MM UTC
Status: PENDING
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

##### MODIFY: path/to/existing/file.ts

**Add import** (after existing imports):
[import statement]

**Add to `functionName` function** (after the validation block):
[code to add]

**Update `TypeName` type** (add new field):
[before/after diff]

##### DELETE: path/to/obsolete/file.ts
<Why this file is being removed>

#### Unit Tests

##### CREATE: tests/path/matching/source.test.ts
[test file structure with describe/it blocks]

#### Acceptance Criteria
- [ ] <Specific, testable criterion>
- [ ] Unit tests pass: `npm test -- <test-file>`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No lint errors: `npm run lint -- <files>`

---

### Task 2: <Task Title>
**Status:** PENDING
**Depends on:** Task 1

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->
```
```

#### Acceptance Criteria

- [ ] `prd/SKILL.md` contains `## Master Plan Template` section with the full template
- [ ] `prd/SKILL.md` contains `## Full PRD File Template` section with the full template
- [ ] Both new sections appear before `## Prerequisites`
- [ ] The full execution log template is present in the PRD File Template section

---

### Task 3: Expand testing rules, file-change spec, and task granularity in prd/SKILL.md

**Status:** PENDING
**Complexity:** Medium
**Depends on:** Task 2

#### File Changes

##### MODIFY: .claude/skills/prd/SKILL.md

**Replace the existing `## Testing Requirements` section** (currently 8 lines with "Key points" summary, lines ~204–211) with the full testing rules moved from prd-format.md. New section content:

```markdown
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

**Option A: Inline** — include test file in the same task. Best for small tasks with 1–2 test cases.

**Option B: Separate task** — create a dedicated test task depending on the implementation. Best for complex logic or substantial test suites.

### Integration Tests

Every PRD set MUST include a final integration test PRD (or final tasks in the last PRD) that:
- Tests the feature end-to-end
- Verifies PRD boundaries work together
- Runs the full test suite for regressions

Integration test PRD depends on all other PRDs and runs last.

### Acceptance Criteria Must Be Testable

Every acceptance criterion must be verifiable by:
1. Running a test: `npm test -- <file>.test.ts`
2. Running a command: `npm run typecheck`, `npm run lint`
3. Checking a specific behavior: "calling X with Y returns Z"

**BAD (not testable):**
- [ ] Component works correctly
- [ ] State is managed properly

**GOOD (testable):**
- [ ] `selectSettings(global)` returns `global.settings`
- [ ] `npm test -- settings.test.ts` passes
- [ ] `npm run typecheck` passes with no errors
```

**Replace the existing `## File Change Specification` section** (the condensed table at lines ~169–182) with the full version moved from prd-format.md:

```markdown
## File Change Specification

### For Small Changes (< 20 lines)
Show exact code with insertion point or before/after:
- "**Add after the line containing** `const lang = useLang();`:"
- Show the exact lines to add

### For Medium Changes (20–50 lines)
Show function signatures, key logic, and location:
- "**Add `processPayment` function** (after `validateForm`):"
- Show the function signature + numbered logic steps inside

### For Large Changes (50+ lines) or New Files
Show structure and exports with descriptions (not full code):
- New file purpose
- Exports list with method names and descriptions
- Key patterns used (what it extends, what storage keys it uses)

### Anchoring Changes

Always provide context anchors — not just line numbers:
- "After the line containing `const lang = useLang();`"
- "Inside the `handleSubmit` function, after the validation check"
- "At the end of the imports section"
- "Before the `export default` statement"

Line numbers are hints only. Anchors are the source of truth.
```

**Merge the task granularity rules** from prd-format.md into the existing `## Task Granularity Examples` section. Add the following rule text at the TOP of that section (before the existing Good/Bad/Good examples):

```markdown
## Task Granularity Rules and Examples

Tasks should be as small as possible:
- Adding a single lang key = 1 task
- Creating a component file = 1 task
- Adding an import + calling a function = 1 task
- Wiring state to a component = 1 task
- Writing unit tests for a module = 1 task

If a task description is longer than ~50 lines, split it.

**Key test:** Can an agent complete this task without making any decisions? If not, break it down further.

### Good (small, specific):
[existing good examples follow]
```

#### Acceptance Criteria

- [ ] `prd/SKILL.md` contains `## Testing Rules` section with the 5-item "Required For" list
- [ ] `prd/SKILL.md` contains the Integration Tests requirement
- [ ] `prd/SKILL.md` contains the BAD/GOOD acceptance criteria examples
- [ ] `prd/SKILL.md` contains `## File Change Specification` section with small/medium/large bands
- [ ] `prd/SKILL.md` contains the anchoring rules
- [ ] `prd/SKILL.md` contains the task granularity rule text ("tasks should be as small as possible")
- [ ] Old condensed `## Testing Requirements` section (the 8-line "Key points" version) is removed
- [ ] File does NOT contain `Follow the full testing rules in .claude/rules/prd-format.md` (the old reference to removed content)

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->
