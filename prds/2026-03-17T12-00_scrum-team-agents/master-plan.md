# Master Plan: Scrum Team Agent Personas

Created: 2026-03-17 12:00 UTC
Status: COMPLETED
Author: Nitzan + Claude

## Overview

Build a persistent, memory-aware scrum team of 6 specialist agents (DBA, PM, DevOps, Security, Pentest, QA) that participate in `/team-review` and `/team-research`, can be invoked independently, and maintain per-project memory using the MCP memory server. Agents pick up the current working context automatically and remember their findings across sessions.

## Goals

- 6 specialist agents with distinct personas and domain expertise
- Each agent reads the current project topic on invocation — never asks "what are we working on?"
- Per-project memory isolation via MCP memory server — Agent memory in Project A never bleeds into Project B
- Agents integrate into `/team-review` and `/team-research` as optional specialist reviewers
- Each agent is independently invocable via a companion skill

## Architecture Decisions

- **MCP memory server:** Use `@modelcontextprotocol/server-memory` (official, knowledge graph based). Per-project isolation via `.claude/settings.json` pointing to `.claude/memory/agent-memory.json` in each project.
- **Current topic:** Shared context file at `.claude/context/current-topic.md` — updated by `/plan`, `/execute`, or `/set-context`. Agents read this on every invocation.
- **Agent files:** `.claude/agents/<name>.md` with YAML frontmatter + system prompt. Agents are NOT tool-restricted so they can access MCP memory tools.
- **Companion skills:** One skill per agent for independent invocation. Skills handle reading context and invoking the agent.
- **Memory namespace:** Within each project's memory file, entries are tagged by agent name and topic so any agent can query cross-agent context when needed.

## PRD Dependency Graph

```
PRD-01 (no deps)
  └──> PRD-02 (depends: PRD-01)
         └──> PRD-03 (depends: PRD-02)
```

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | MCP Memory + Context Setup | None | 4 | Low |
| 02 | Agent Files | PRD-01 | 7 | Medium |
| 03 | Skills + Integrations | PRD-02 | 9 | Medium |

## Out of Scope

- Embedding-based vector search (using knowledge graph for now; can upgrade later)
- Agent-to-agent real-time communication during a session
- Dashboard or UI for browsing agent memory
- Automatic memory pruning or summarization

## Open Questions

None — all resolved during planning.
