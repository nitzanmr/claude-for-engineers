# Master Plan: Token Efficiency Improvements

Created: 2026-03-19 07:46 UTC
Status: REVIEWED_NEEDS_FIXES
PRDs Generated: 2026-03-19 08:15 UTC
Author: Nitzan + Claude

## Overview

The claude-for-engineers workflow system loads excessive context on every conversation and passes bloated session memory bundles to every sub-agent. This plan eliminates duplicated content, moves phase-specific guidance to its correct scope, and makes session memory bundles dynamic so agents only receive what is relevant to their run.

## Goals

- Reduce per-run token cost by 50%+ with no behavior change
- Remove always-loaded context that is only relevant to specific phases
- Eliminate content duplication across skill files and agent files
- Accept minor quality tradeoffs (e.g., less illustrative examples) only where gains are large

## Architecture Decisions

- **Dynamic bundle over static bundle:** Session memory bundles will only include memory sections for agents actually participating in a given run. Pre-fetching all 6 agents unconditionally is the single largest per-run waste (~400–1,000 unused chars per bundle × 6–8 agents).
- **Phase-scoped rules over always-loaded rules:** prd-format.md contains ~34–40% content only relevant during `/prd` generation. This content moves into `prd/SKILL.md` where it belongs, reducing always-loaded context by ~1,700 chars.
- **Reference over repetition for examples:** Large illustrative template blocks in prd-format.md are condensed to compact references. The spec (required fields, naming, status values) stays; the illustrations are stripped.
- **Single source for shared blocks:** The 6 specialist review skills each repeat a 500–800 char session memory assembly block verbatim. This is extracted to a shared reference. Agent files repeat a ~400 char context-loading section across all 6 agents — same treatment.
- **Behavioral content only in skill files:** Conversational examples and workflow diagrams in plan/SKILL.md and team-research/SKILL.md are removed. The step sequences and rules already define behavior completely. The "When Research Gets Complex" section in plan/SKILL.md folds into Step 2 where it belongs.

## PRD Dependency Graph

```
PRD-01 (no deps)  ──────────────────────────────────┐
Dynamic session memory bundle                         │
                                                      │
PRD-02 (no deps)  ──────────────────────────────┐    │
prd-format.md restructure                        │    │──> PRD-05 (depends: 01, 02, 03, 04)
                                                 │    │    Integration verification
PRD-03 (depends: PRD-02) ───────────────────────┘    │
Trim skill files (plan, prd, team-research)          │
                                                      │
PRD-04 (no deps)  ──────────────────────────────────┘
Consolidate review skills + agent boilerplate
```

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | Dynamic session memory bundle | None | 4 | Medium |
| 02 | prd-format.md restructure | None | 3 | Medium |
| 03 | Trim skill files | PRD-02 | 2 | Low |
| 04 | Consolidate review skills + agent boilerplate | None | 3 | Medium |
| 05 | Integration verification | PRD-01, 02, 03, 04 | 2 | Low |

## Expected Savings

| Area | Current | After | Reduction |
|------|---------|-------|-----------|
| Always-loaded context (per conversation) | ~34,900 chars | ~31,500 chars | ~10% |
| Session memory bundle (per agent per run) | 2,700–4,600 chars | 1,200–2,000 chars | ~55% |
| Bundle cost per /execute run (6–8 agents) | 18,000–36,800 chars | 7,200–16,000 chars | ~55% |
| Invoked skill files (plan + prd + team-research) | ~22,000 chars | ~12,500 chars | ~43% |
| 6 review skills (total duplication) | ~4,800 chars duplicated | ~0 chars duplicated | ~100% |
| 6 agent files (total boilerplate) | ~2,400 chars duplicated | ~0 chars duplicated | ~100% |

## Out of Scope

- Changing any behavioral rules, approval gates, or step sequences
- Modifying execute/SKILL.md or team-review/SKILL.md beyond Step 0 (session memory assembly)
- Touching retro/SKILL.md, pm-backlog/SKILL.md, check-setup/SKILL.md, or set-context/SKILL.md
- Changing CLAUDE.md structure or content (minimal redundancy found, not worth the risk)
- Changing any agent domain logic (OWASP rules, DBA patterns, etc.)

## Open Questions

_(none — resolved during planning)_
