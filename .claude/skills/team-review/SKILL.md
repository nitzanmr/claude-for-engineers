---
name: team-review
description: Launch parallel code review agents to review execution results against PRD specifications
argument-hint: <prd-directory-name>
allowed-tools: Read, Glob, Grep, Task, Bash
tags: [review, quality, team, parallel]
---

# Team Review Skill

Launch parallel review agents to verify that executed PRD tasks produced correct results. Used after `/execute` or during `/retro`.

## When to Use

- After `/execute` completes to verify all work
- When the engineer wants a thorough review before merging
- During `/retro` for detailed quality analysis
- After partial execution to check what's been done so far

## How It Works

### Step 1: Read PRD Execution Logs

Read all PRD files in the target directory. For each completed task, collect:
- Files that were created
- Files that were modified
- Acceptance criteria
- The original task specification (expected changes)

### Step 2: Assign Review Agents

Launch parallel review agents, each focused on one aspect:

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

### Step 3: Synthesize Review

Combine all agent reports into a single review summary:

```markdown
## Code Review: <Feature Name>

Date: YYYY-MM-DD HH:MM UTC
PRD Directory: prds/<dir>/

### Overall Assessment
PASS | PASS_WITH_ISSUES | NEEDS_FIXES

### Spec Compliance
- Tasks matching spec exactly: X/Y
- Minor deviations: X
- Major deviations: X
<details per deviation>

### Code Quality
- Files reviewed: X
- Issues found: X (H high, M medium, L low)
<details per issue>

### Integration
- Cross-file integration: PASS | ISSUES_FOUND
<details if issues>

### Action Items
1. <specific fix needed>
2. <specific fix needed>
```

### Step 4: Present to Engineer

Share the review summary. The engineer decides what to fix. If fixes are needed, they can:
- Fix manually
- Update PRD tasks and re-execute
- Accept minor deviations

## Review Agents

- All agents are READ-ONLY. They review, they don't fix.
- Use `Explore` or `general-purpose` agent types.
- Each agent focuses on one review dimension.
- 2-3 agents max (spec compliance + code quality + optional integration).

## Integration with Workflow

```
/execute payment-feature
  ↓
  [execution completes]
  ↓
  /team-review payment-feature
  ↓
  [agents review in parallel]
  ↓
  [review summary presented]
  ↓
  [engineer decides on fixes]
  ↓
  /retro payment-feature
```

## Notes

- Review compares actual files against PRD specifications. If the PRD was wrong but code is "good", that's still a deviation to flag.
- Review agents don't have opinions about architecture. They check compliance and quality.
- The review output is appended to `prds/<dir>/review.md` for audit trail.
- If project has a linter, suggest running it as part of review: `npm run lint -- <files>`
