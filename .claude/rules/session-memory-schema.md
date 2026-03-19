# Session Memory Bundle Schema

This document is the single source of truth for the session memory bundle format. All orchestrating skills (`/execute`, `/team-review`, `/team-research`) assemble and pass this bundle to agents.

## Bundle Format

~~~markdown
# Session Memory — <run-id>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM-SS          (seconds precision — prevents collisions in the same minute)
- Triggered by: /<skill-name>           (execute | team-review | team-research)
- Phase: EXECUTION | REVIEW | RESEARCH
- PRD directory: prds/<dir>/

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <only include this line if UNAVAILABLE — "All agents proceed without past memory this session">

## Pre-fetched Agent Memories
<One section per active agent only. Omit this entire section if no agents are active or MCP is UNAVAILABLE.>

### <agent-name> — <relevant label for this agent>
<search_nodes results, or "None" if no results>

## Phase Context
<Use the phase-specific section below that matches the triggering skill>
~~~

## Phase Context Variants

### For /execute and /team-review

~~~markdown
## Execution Context
- Tasks completed: X/Y (from PRD execution logs)
- Files changed: <list of files from PRD execution logs>
~~~

### For /team-research

~~~markdown
## Research Context
- Research area: <the topic/codebase area being researched>
- Relevant PRD directory: <prds/<dir>/ if already known, or "N/A — pre-planning research">
- Triggered by: /team-research during /plan
~~~

## Assembly Steps (same for all skills)

1. **Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before proceeding."

2. **Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. If it responds (even with no results): MCP Status = `AVAILABLE`. If it errors or the tool is not found: MCP Status = `UNAVAILABLE`.

3. **Pre-fetch memories** (only if AVAILABLE) — Call `search_nodes` only for agents actively participating in this run. Use the `Feature:` field value from current-topic.md as the query. Active agent set depends on the triggering skill:
   - `/execute`: agents listed as `Recommended agent:` in PRD task files — determined after Step 1 discovery. Skip pre-fetch if none.
   - `/team-review`: `product-manager` (always) + specialists confirmed by engineer in Step 2b — done after Step 2b, not at run start.
   - `/team-research`: specialist agents included in this research round from Step 1 — done after Step 1. Skip if only general Explore agents.
   - Specialist review skills (`/pm-review`, `/qa-review`, etc.): the single agent for that skill only.
   Omit the `## Pre-fetched Agent Memories` section entirely if no agents are active.

4. **Fill the bundle** — Use the format above. Set the Phase Context section to the variant matching the current skill.

5. **Save to run-log** — Write the assembled bundle to `.claude/context/run-log/<run-id>.md`.

6. **Pass inline** — Include the full bundle in every agent prompt under `## Session Memory`. Agents do NOT read `current-topic.md` themselves or call `search_nodes` — all context is already in the bundle.

## Run ID Format

Run IDs MUST use `YYYY-MM-DDTHH-MM-SS` format (with seconds) to prevent collisions when two sessions start in the same minute. Example: `2026-03-18T11-12-48`.
