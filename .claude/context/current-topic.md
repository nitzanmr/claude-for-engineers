# Current Topic

Updated: 2026-03-18 00:35 UTC
Active PRD: prds/2026-03-17T14-30_agent-session-memory/
Feature: Agent Session Memory, PM Backlog, and Review Dashboard
Phase: REVIEW

## What We're Building
A shared session memory bundle assembled once per run and delivered to all agents, replacing per-agent independent context fetching. Includes a structured PM backlog with lifecycle tracking (Open/Deferred/Resolved) stored in MCP memory and `backlog.md`, queryable via `/pm-backlog`. Also includes auto-specialist selection for `/team-review` based on PRD content, and a structured review dashboard showing severity aggregates and backlog status.

## Key Decisions So Far
- Session memory is assembled by the orchestrating skill, not agents — agents stop self-fetching
- Session memory is snapshotted to `.claude/context/run-log/` per run for audit/retro use
- Backlog lives in both MCP memory (machine-queryable) and `backlog.md` (human-readable)
- Auto-specialist selection is rule-based (keyword scanning of PRD content)
- `penetration-agent` always requires explicit engineer confirmation even when auto-matched
- PRD status extended with `REVIEWED_PASS` and `REVIEWED_NEEDS_FIXES`

## Open Questions
- None — all resolved during planning and execution

## Team Notes
- Execution complete: 3/3 PRDs, 12/12 tasks completed (2026-03-18)
- Retro complete (2026-03-18)
- Files created: `.claude/context/run-log/.gitkeep`, `.claude/skills/pm-backlog/SKILL.md`
- Files modified: team-review, team-research, execute skills; all 6 agent files; workflow.md
