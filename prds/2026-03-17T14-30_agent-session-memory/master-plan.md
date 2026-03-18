# Master Plan: Agent Session Memory, PM Backlog, and Review Dashboard

Created: 2026-03-17 14:30 UTC
Status: REVIEWED_NEEDS_FIXES
PRDs Generated: 2026-03-18 00:00 UTC
Author: Nitzan + Claude

## Overview

Today each agent independently fetches its own context — reading `current-topic.md`, querying MCP memory, and checking related agent findings. This is inconsistent, unobservable, and silently degrades when MCP is unavailable. There is also no persistent PM backlog and no structured visibility into review findings.

This feature introduces three connected improvements: a shared session memory bundle assembled once per run and delivered to all agents, a structured PM backlog with lifecycle tracking, and an automated review dashboard with specialist auto-selection.

## Goals

- All agents in a run share the same context snapshot — no per-agent independent fetching
- MCP health check happens once upfront; all agents know the result
- PM tracks issues as structured backlog items with status lifecycle (Open → Deferred → Resolved)
- Backlog visible as both a file (`backlog.md`) and queryable via `/pm-backlog`
- Carried-forward open items shown automatically at the start of every review
- `/team-review` automatically selects specialist agents based on PRD content
- Engineer sees a structured dashboard summary (severity aggregate + backlog status) after every review

## Architecture Decisions

- **Session memory is assembled by the orchestrating skill, not by agents.** Agents stop self-fetching. They receive a pre-built context bundle inline. This ensures all agents in one run have identical context.
- **Session memory is snapshotted.** Every run saves a dated file in `.claude/context/run-log/`. Retro and review agents can read the historical snapshot instead of today's `current-topic.md`.
- **Backlog lives in both MCP memory and `backlog.md`.** MCP memory is the source of truth (queryable via `/pm-backlog`). `backlog.md` is the human-readable view, written after every review.
- **Auto-specialist selection is rule-based.** The skill scans PRD content for keywords/patterns and selects specialists deterministically. Engineer sees which specialists were selected before agents launch, with option to add/remove.
- **PRD status extended** to include `REVIEWED_PASS` and `REVIEWED_NEEDS_FIXES` alongside existing `COMPLETED`.

## PRD Dependency Graph

```
PRD-01: Session Memory Builder  (no deps)
PRD-02: PM Backlog System       (no deps)
         │                  │
         └────────┬─────────┘
                  ↓
PRD-03: Auto-Specialist + Review Dashboard
        (depends on PRD-01, PRD-02)
```

PRD-01 and PRD-02 can run in parallel. PRD-03 runs after both complete.

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | Session Memory Builder | None | 6 | Medium |
| 02 | PM Backlog System | None | 3 | Medium |
| 03 | Auto-Specialist Selection + Review Dashboard | PRD-01, PRD-02 | 3 | Medium |

## Session Memory Bundle Schema

The bundle is a Markdown file assembled by the orchestrating skill and passed inline to agents:

```markdown
# Session Memory — <Run ID>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM
- Triggered by: /team-review | /execute | /team-research
- Phase: PLANNING | PRD | EXECUTION | REVIEW
- PRD directory: prds/<dir>/ (if applicable)

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <if UNAVAILABLE, agents proceed without past memory>

## Pre-fetched Agent Memories
### product-manager — past decisions on this topic
<results of search_nodes("product-manager", topic) or "None">

### security-expert — past findings on this topic
<results of search_nodes("security-expert", topic) or "None">

### dba-expert — past findings on this topic
<results of search_nodes("dba-expert", topic) or "None">

### devops-engineer — past production notes on this topic
<results of search_nodes("devops-engineer", topic) or "None">

### qa-automation — past coverage findings on this topic
<results of search_nodes("qa-automation", topic) or "None">

### penetration-agent — past attack vectors on this topic
<results of search_nodes("penetration-agent", topic) or "None">

## Execution Context (if /execute or /team-review)
- Tasks completed: X/Y
- Files changed: <list>
```

## PM Backlog Item Schema

Stored as MCP memory observations on entity `product-manager`:

```
[<topic>] BACKLOG: id=BLG-NNN | title="<short title>" | status=OPEN |
  category=Needed|Desirable|Hard | source=<agent-name> | created=YYYY-MM-DD
```

Status transitions stored as separate observations:
```
[<topic>] BACKLOG_UPDATE: id=BLG-NNN | status=RESOLVED | resolved=YYYY-MM-DD |
  resolved_by=prd-NN_<name>
[<topic>] BACKLOG_UPDATE: id=BLG-NNN | status=DEFERRED | reason=<why>
```

## Auto-Specialist Trigger Rules

| Pattern in PRD content | Specialist auto-included |
|------------------------|--------------------------|
| `schema`, `migration`, `query`, `index`, `SQL`, `NoSQL`, `database` | `dba-expert` |
| `auth`, `token`, `password`, `permission`, `role`, `encrypt`, `session` | `security-expert` |
| `config`, `deploy`, `service`, `env`, `docker`, `CI`, `infrastructure` | `devops-engineer` |
| `test`, `.test.`, `.spec.`, `coverage`, `jest`, `mocha` | `qa-automation` |
| `security`, `auth`, `encrypt`, `payment`, `PII`, `sensitive` | `penetration-agent` (optional, ask) |

Engineer sees selected specialists before launch, can adjust.

## Review Dashboard Format

Shown in conversation after every `/team-review`:

```
Review Complete — <feature-name>
Date: YYYY-MM-DD

Specialists run: spec-compliance, code-quality, [+ auto-selected list]

Severity: Critical: N | High: N | Medium: N | Low: N

Open Backlog Items (N):
  ⚠ [Needed]    BLG-001 — <title> — flagged by <agent>
  ⚠ [Needed]    BLG-002 — <title> — flagged by <agent>
  📋 [Desirable] BLG-003 — <title> — flagged by <agent>
  🔵 [Deferred]  BLG-004 — <title> — carried from YYYY-MM-DD

Resolved This Session (N):
  ✅ BLG-XXX — <title>

Overall: PASS | PASS_WITH_ISSUES | NEEDS_FIXES
PRD Status: REVIEWED_PASS | REVIEWED_NEEDS_FIXES

Full report:  prds/<dir>/review.md
Backlog file: prds/<dir>/backlog.md
```

## Out of Scope

- Shared memory across engineers (vector DB / Qdrant) — separate planning session
- PM assigning backlog items to specific engineers
- Web dashboard or external issue tracker integration
- Real-time review progress (agents still run and report sequentially per type)
- Changes to `/plan` or `/prd` skills

## Open Questions

None — all resolved during planning.
