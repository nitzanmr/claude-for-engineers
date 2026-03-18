# Master Plan: Swarm Mode for Team Research and Team Review

Created: 2026-03-18 10:48 UTC
Status: COMPLETED
Author: Nitzan + Claude

## Overview

Add swarm mode (TeamCreate-based) as an opt-in alternative to the current task-mode (Task-based) parallel agent approach in both `/team-research` and `/team-review`. The engineer is prompted to choose a mode before agents launch — same UX pattern as `/execute`. In swarm mode, agents share a live task list and can consult each other via SendMessage, making it meaningfully different from task mode (not just a visibility upgrade).

## Goals

- Both `/team-research` and `/team-review` offer a Task mode / Swarm mode choice, matching `/execute` UX
- Swarm mode uses TeamCreate + TaskCreate + SendMessage for live coordination and cross-agent consultation
- Task mode behavior is unchanged — zero regression for existing users
- Mode prompt includes tradeoffs so the engineer can make an informed choice
- In swarm mode, agents are explicitly instructed to consult teammates when they find cross-domain findings

## Architecture Decisions

- **Mode prompt placement**: Ask AFTER the "confirm before launching" gate (research questions approved / specialist selection approved), but BEFORE any agents start. Consistent with `/execute` Step 2.
- **Swarm mode — team naming**: `research-<run-id>` and `review-<run-id>`, matching the session run ID already generated in Step 0.
- **Task dependencies in team-review swarm**: `pm-synthesis` task is created with `addBlockedBy` pointing to all review agent tasks. PM does not start until every review task is DONE — same wave-dependency pattern as `/execute`.
- **No dependencies in team-research swarm**: Research questions are independent by design. All tasks are unblocked from the start.
- **Agent consultation via SendMessage**: Swarm mode agent prompts explicitly instruct agents to SendMessage teammates when they find cross-domain findings. Task mode prompts are unchanged.
- **Frontmatter allowed-tools**: Both skill frontmatters need `TeamCreate, TaskCreate, TaskList, TaskUpdate, TaskGet, SendMessage` added. These are already allowed project-wide in `.claude/settings.json` (added in previous session).
- **Tradeoff language in mode prompt**: Mode prompt shows bullet-point tradeoffs. Swarm mode explicitly mentions "agents can consult each other" as a key differentiator.

## PRD Dependency Graph

```
PRD-01 (team-research swarm, no deps)
PRD-02 (team-review swarm, no deps)
```

Both PRDs are fully independent and can execute in parallel.

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | team-research swarm mode | None | 3 | Low | prd-01_team-research-swarm-mode.md |
| 02 | team-review swarm mode | None | 3 | Low | prd-02_team-review-swarm-mode.md |

## Out of Scope

- Changes to `/execute` swarm mode (already implemented)
- Changes to task mode behavior in either skill (zero regression)
- Adding swarm mode to any other skills (`/retro`, `/plan`, etc.)
- Changing the session memory bundle logic (unchanged in both skills)
- Changing the synthesis/dashboard output format (unchanged)
- Adding new agent types or specialist logic

## Open Questions

_(none — all resolved during planning)_
