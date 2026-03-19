# PRD-01: BLG-022 — Replace Execution Context with Research Context in team-research bundle

Created: 2026-03-18 06:18 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Replace the invalid `## Execution Context` section (inherited from the team-review schema) in the team-research Step 0 bundle with a `## Research Context` section appropriate for the research phase.

## Context

`team-research/SKILL.md` Step 0 says "Same schema as in `/team-review` Step 0". That schema includes an `## Execution Context` section with `Tasks completed: X/Y` and `Files changed:` — data that doesn't exist during a research session. This confuses research agents that read their session memory bundle. The fix adds an explicit override that replaces that section with `## Research Context`.

## Tasks

### Task 1: Replace Execution Context with Research Context in team-research Step 0

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Replace** the text of Step 0 step 4 (the line containing "Same schema as in `/team-review` Step 0"):

Before:
```
**4. Assemble and save bundle** — Same schema as in `/team-review` Step 0. Save to `.claude/context/run-log/<run-id>.md`. Use `YYYY-MM-DDTHH-MM-SS` format for the run ID to prevent collisions.
```

After:
```
**4. Assemble and save bundle** — Same schema as in `/team-review` Step 0, **except** replace the `## Execution Context` section with `## Research Context`:

~~~markdown
## Research Context
- Research area: <the topic/codebase area being researched>
- Relevant PRD directory: <prds/<dir>/ if already known, or "N/A — pre-planning research">
- Triggered by: /team-research during /plan
~~~

Save to `.claude/context/run-log/<run-id>.md`. Use `YYYY-MM-DDTHH-MM-SS` format for the run ID to prevent collisions.
```

#### Acceptance Criteria

- [ ] `.claude/skills/team-research/SKILL.md` Step 0 step 4 no longer says "Same schema as in `/team-review` Step 0" without qualification
- [ ] The bundle schema override explicitly defines `## Research Context` with `Research area`, `Relevant PRD directory`, and `Triggered by` fields
- [ ] The `## Execution Context` section is not referenced anywhere in `team-research/SKILL.md`

---

## Execution Log

### Task 1: Replace Execution Context with Research Context in team-research Step 0
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-18 06:37 UTC
- **Completed:** 2026-03-18 06:38 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - .claude/skills/team-research/SKILL.md (Step 0 step 4 updated with Research Context override)
- **Files deleted:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 0 step 4 no longer says "Same schema as in `/team-review` Step 0" without qualification
  - [x] The bundle schema override explicitly defines `## Research Context` with three fields
  - [x] The `## Execution Context` section is not referenced as a section to include in team-research/SKILL.md
