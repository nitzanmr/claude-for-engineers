# Master Plan: Simplify Context and Memory Infrastructure

Created: 2026-03-23 10:30 UTC
Status: REVIEWED_NEEDS_FIXES
Author: Nitzan + Claude

---

## Overview

The current workflow has two pieces of infrastructure that add friction without proportional value:

1. **`current-topic.md`** — a manually maintained context file that skills hard-fail without. Most of its fields are never parsed; the `Feature:` field (the only machine-read one) can be auto-derived from the active PRD.
2. **MCP memory** — a knowledge graph used to persist agent observations across sessions. In practice, only the PM ever wrote anything, and its data is redundant with `backlog.md`. The other 5 agents have zero entries.

This plan removes MCP memory from the workflow entirely, simplifies `current-topic.md` to two fields, makes context auto-maintaining (derived from active PRD + auto-updated before agent launch), and removes all hard-fail gates.

---

## Goals

1. Remove MCP memory write/read from all agent definitions and all skills
2. PM reads `backlog.md` directly instead of MCP observations
3. Simplify `current-topic.md` to `Feature:` + `Active PRD:` only
4. Skills auto-derive context from the active PRD's `master-plan.md` — no manual `/set-context` required
5. Before launching agents, skills auto-check and auto-update `current-topic.md` if the active PRD has changed
6. Remove hard-fail gates — skills proceed without `current-topic.md`
7. `/set-context` becomes a lightweight optional override

---

## Architecture Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Remove MCP memory entirely from workflow | Only PM ever used it; PM's data is fully covered by `backlog.md`. Other 5 agents never wrote anything. Zero value for 5/6 agents, redundant for 1/6. |
| 2 | PM reads `backlog.md` directly | `backlog.md` is the source of truth for backlog items. MCP was a second copy. Direct file read is simpler and more reliable. |
| 3 | `current-topic.md` reduced to Feature + Active PRD | Only `Feature:` was machine-read (for `search_nodes` queries, now removed). Narrative fields belong in `master-plan.md`. |
| 4 | Auto-derive context from active PRD | If `Active PRD:` is set, skills read `Feature:` from `prds/<dir>/master-plan.md` automatically. No manual update needed. |
| 5 | Auto-context check before agent launch | Before launching agents, skills compare current task to `current-topic.md`. If PRD changed, auto-update. Engineer never needs to run `/set-context` manually. |
| 6 | Remove hard-fail gate | Skills no longer stop if `current-topic.md` is missing or uninitialized. They derive what they can and proceed. |
| 7 | `/set-context` becomes optional override | Still useful when no PRD exists (early research) or when engineer wants to manually override the feature name. |
| 8 | Session memory bundle retains Current Topic section | Bundle still includes `Feature:` + `Active PRD:` for agent context, just no MCP sections. |

---

## PRD Dependency Graph

```
PRD-01                    PRD-03
Simplify agent            Simplify current-topic.md
definitions               + set-context
(remove MCP writes,       (reduce schema,
 PM reads backlog.md)     remove hard-fail)
       │                        │
       └──────────┬─────────────┘
                  ▼
              PRD-02
              Simplify session memory
              schema + all skills
              (remove MCP pre-fetch,
               add auto-context check,
               /plan uses active PRD)
```

PRD-01 and PRD-03 are independent and can run in parallel.
PRD-02 depends on both PRD-01 and PRD-03.

---

## PRD Summary

| PRD | Description | Depends On | Complexity | Files |
|-----|-------------|------------|------------|-------|
| PRD-01 | Simplify agent definitions — remove MCP writes, PM reads backlog.md | None | Low | 6 tasks, 6 agent .md files |
| PRD-02 | Simplify session memory schema + all skills — remove MCP pre-fetch, add auto-context check | PRD-01, PRD-03 | Medium | 7 tasks, session-memory-schema.md + 9 skill SKILL.md files |
| PRD-03 | Simplify current-topic.md + /set-context — reduce to 2 fields, remove hard-fail | None | Low | 4 tasks, current-topic.md, templates/current-topic.md, set-context/SKILL.md, pm-backlog/SKILL.md |

---

## Out of Scope

- Removing the MCP server from `settings.json` (harmless to keep, may be used for other purposes)
- Changes to `/prd`, `/retro`, `/pm-backlog`, `/plan` skill logic beyond context auto-derivation
- Changes to PRD file format or execution log format
- Any changes to how agents perform their core review/analysis work

---

## Open Questions

None — all decisions made during planning session.
