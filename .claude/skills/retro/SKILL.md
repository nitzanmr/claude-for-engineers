---
name: retro
description: Retrospective - review execution, capture learnings, update documentation
argument-hint: <prd-directory-name>
allowed-tools: Read, Glob, Grep, Write, Edit
tags: [retrospective, review, documentation]
---

# Retro Skill

Review a completed (or partially completed) execution and capture learnings.

## Purpose

After execution, review what happened:
- What went well
- What didn't work
- What the PRDs got wrong
- What patterns to carry forward
- What to update in project documentation

## Execution Steps

### Step 1: Read Execution Logs

**Before using the argument as a path:** Validate that `{{argument}}` contains only safe characters: letters, digits, hyphens, underscores, and the letter `T` (for timestamp separators). If the argument contains slashes, dots, spaces, or any other character, STOP and report: "Invalid PRD directory name — argument must be a safe directory name like `2026-03-18T11-15_feature-name`."

Read all PRD files in `prds/{{argument}}/`:
1. Master Plan - check overall status
2. Each PRD file - read execution log sections
3. Collect: completion times, issues, failed tasks, agent notes
4. If `review.md` exists in the PRD directory, read it — extract Overall Assessment, Spec Compliance, and PM Synthesis sections
5. If `backlog.md` exists, read it — note Open and Deferred items

### Step 2: Analyze

Produce a retrospective summary:

```markdown
# Retrospective: <Feature Name>

Date: YYYY-MM-DD HH:MM UTC
PRD Directory: prds/<dir>/

## Summary
- Total PRDs: X
- Completed: X
- Failed: X
- Total tasks: X
- Completed: X
- Failed: X
- Total execution time: Xm Ys

## What Went Well
- <pattern or outcome that worked>
- <task that executed smoothly>

## What Didn't Work
- <task that failed and why>
- <PRD specification that was ambiguous>
- <dependency that was missing>

## PRD Quality Issues
- <tasks that were too large>
- <missing file change specifications>
- <wrong assumptions about codebase>

## Patterns to Keep
- <good patterns discovered during execution>
- <effective task granularity examples>

## Suggestions for Next Time
- <improvements to planning>
- <improvements to PRD format>
- <improvements to execution>

## Review Findings Summary
(Include only if review.md exists)
- Overall assessment: PASS | PASS_WITH_ISSUES | NEEDS_FIXES
- Open backlog items: N Needed, M Desirable
- Key patterns flagged across agents: <list>
- Merge readiness: <READY | FIX_NEEDED | RE-PLAN based on backlog categories>

## Merge Decision
(Based on review.md backlog — see workflow.md "Review → Merge Decision")
- [ ] All Needed items cleared
- [ ] Desirable items tracked
- [ ] No Hard items requiring re-planning
```

### Step 3: Update PRD Directory

Write the retrospective to:
```
prds/<dir>/retrospective.md
```

### Step 4: Update Master Plan

Set Master Plan status to `RETRO_COMPLETE`.

### Step 5: Suggest Documentation Updates

If patterns were learned that should be captured in project rules or CLAUDE.md, suggest specific updates. Don't apply them without engineer approval.

If the review flagged patterns that should be added to `.claude/rules/` or `CLAUDE.md`, propose specific rule additions. Do not apply without engineer approval.

## Optional: Code Review

If `/team-review` or a project-specific review skill exists, suggest running it on the changes made during execution. This catches issues that individual task agents might have missed.

## Notes

- The retrospective is for the engineer, not the AI. Write it clearly and honestly.
- Don't sugarcoat failures. If PRDs were bad, say so.
- Focus on actionable improvements, not blame.
- The retro file becomes part of the project's institutional knowledge.
