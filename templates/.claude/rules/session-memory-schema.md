# Session Memory Bundle Schema

This document is the single source of truth for the session memory bundle format. All orchestrating skills (`/execute`, `/team-review`, `/team-research`) assemble and pass this bundle to agents.

## Bundle Format

~~~markdown
# Session Memory — <run-id>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM-SS          (seconds precision — prevents collisions in the same minute)
- Triggered by: /<skill-name>           (execute | team-review | team-research)
- Phase: EXECUTION | REVIEW | RESEARCH
- PRD directory: prds/<dir>/ (or N/A)

## Current Topic (snapshot at run time)
Feature: <feature name>
Active PRD: <directory or "none">

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

1. **Auto-derive context** — Determine the active PRD directory (from skill argument, or from `Active PRD:` in `current-topic.md` if it exists):
   - If a PRD directory is known: read `prds/<dir>/master-plan.md` and extract the `Feature:` value from the file header
   - Compare with `current-topic.md` (if it exists). If the Feature or Active PRD differ, or if `current-topic.md` is missing: write an updated `current-topic.md` with the derived values
   - If no PRD directory is known and `current-topic.md` is missing or empty: use `Feature: Unknown` and `Active PRD: none` — proceed without stopping

2. **Build and save bundle** — Assemble the full bundle (Run Info + Current Topic snapshot + Phase Context). Save to `.claude/context/run-log/<run-id>.md`.

3. **Pass inline** — Include the full bundle in every agent prompt under `## Session Memory`. Agents do NOT read `current-topic.md` themselves — all context is in the bundle.

## Run ID Format

Run IDs MUST use `YYYY-MM-DDTHH-MM-SS` format (with seconds) to prevent collisions when two sessions start in the same minute. Example: `2026-03-18T11-12-48`.
