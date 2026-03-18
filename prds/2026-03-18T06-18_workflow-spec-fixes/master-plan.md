# Master Plan: Workflow Spec Fixes (BLG-022, 023, 024, 028, 029)

Created: 2026-03-18 06:18 UTC
Status: COMPLETED
Author: Nitzan + Claude

## Overview

Five targeted fixes to the workflow skill and agent spec files, all identified during the agent-session-memory review session. All changes are documentation/spec-only (markdown files in `.claude/`). No execution logic or MCP schema changes.

## Goals

- Remove invalid "Execution Context" section from team-research bundle schema (BLG-022)
- Align PM category severity with the review dashboard verdict logic (BLG-023)
- Prevent silent MCP memory failures caused by relative MEMORY_FILE_PATH (BLG-024)
- Make backlog.md session linkage traceable across multiple review runs (BLG-028)
- Eliminate confusing "do NOT read" phrasing in all 6 agent files (BLG-029)

## Architecture Decisions

- **BLG-022**: Replace `## Execution Context` in team-research Step 0 bundle schema with `## Research Context` containing: topic, relevant PRD dir (if any), reason research was triggered. No execution data exists at research time.
- **BLG-023**: Extend the verdict logic in team-review Step 5. PM `Needed` items are treated as `High` severity (→ NEEDS_FIXES). PM `Desirable` items are treated as `Medium` (→ PASS_WITH_ISSUES). This is an additive rule — existing technical severity rules are unchanged. The dashboard severity section gains a "PM Categories" row.
- **BLG-024**: Add an explicit step to the CLAUDE.md "Agent Memory Setup" section instructing users to replace the relative `MEMORY_FILE_PATH` value with an absolute path after copying settings.json. No change to the settings.json template itself (it can't know the project path).
- **BLG-028**: Add a `## Sessions` block at the top of backlog.md (above `## Open`). Each `/team-review` run appends one line: `- <run-id>: introduced BLG-NNN[, BLG-NNN...][, resolved BLG-NNN...]`. team-review Step 4b updated to build and maintain this block on every overwrite. Item lines remain clean (no inline session tags).
- **BLG-029**: Replace the contradictory negative instruction ("do NOT read `current-topic.md`") in all 6 agent files with positive framing: "Context is pre-loaded in the `## Session Memory` section of this prompt — use it directly." The heading remains "Step 1: Load Context from Session Memory".

## PRD Dependency Graph

```
PRD-01 (no deps) ─┐
PRD-02 (no deps) ─┤
PRD-03 (no deps) ─┼── all parallel, no dependencies
PRD-04 (no deps) ─┤
PRD-05 (no deps) ─┘
```

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | BLG-022: team-research Research Context section | None | 1 | Low |
| 02 | BLG-023: PM category severity in verdict logic | None | 1 | Low |
| 03 | BLG-024: Absolute path setup instruction in CLAUDE.md | None | 1 | Low |
| 04 | BLG-028: Session index block in backlog.md | None | 1 | Low |
| 05 | BLG-029: Rephrase do-NOT instruction in 6 agent files | None | 1 | Low |

## Out of Scope

- Changes to MCP memory schema or observation format
- Changes to execution logic (execute/SKILL.md Step 1+)
- Changes to pm-backlog skill
- Any non-markdown file changes
- Fixing other open backlog items (BLG-005 through BLG-021, BLG-025 through BLG-027, BLG-030)

## Open Questions

(none)
