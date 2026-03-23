# PRD-02: Simplify Session Memory Schema and All Skills

Created: 2026-03-23 10:30 UTC
Status: COMPLETED
Depends on: PRD-01, PRD-03
Complexity: Medium

## Objective

Remove MCP health check and pre-fetch steps from session-memory-schema.md and all 9 orchestrating/review skills. Add auto-context derivation (from active PRD) and remove hard-fail gates. Update `/plan` to auto-write context after master plan approval.

## Context

The session memory bundle currently has 3 layers: Current Topic + MCP Status + Pre-fetched Agent Memories. With MCP removed (PRD-01) and current-topic.md simplified (PRD-03), the bundle collapses to: Current Topic + Phase Context. Assembly steps go from 6 steps to 3. The hard-fail gate ("run /set-context") is replaced with auto-derivation from the active PRD's master-plan.md.

## Tasks

---

### Task 1: Rewrite session-memory-schema.md

**Status:** COMPLETED
**Complexity:** Medium

#### File Changes

##### MODIFY: `.claude/rules/session-memory-schema.md`

Replace the entire file content with:

```markdown
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
```

#### Acceptance Criteria
- [ ] Bundle format has no `## MCP Status` section
- [ ] Bundle format has no `## Pre-fetched Agent Memories` section
- [ ] Assembly steps are exactly 3 (auto-derive, build+save, pass inline)
- [ ] No `search_nodes` references remain
- [ ] Hard-fail gate removed — skills proceed even if current-topic.md is missing

---

### Task 2: Update /execute skill — remove MCP, add auto-context

**Status:** COMPLETED
**Complexity:** Medium
**Depends on:** Task 1

#### File Changes

##### MODIFY: `.claude/skills/execute/SKILL.md`

**Replace "### Step 0: Build Session Memory Bundle"** with the simplified version:

Old Step 0 (lines starting from "### Step 0: Build Session Memory Bundle" through end of "**3. Assemble partial bundle**"):
```markdown
### Step 0: Build Session Memory Bundle

Before launching any task agents, assemble the shared context bundle.

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before executing."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.

**3. Assemble partial bundle** — Build the Run Info + Current Topic + MCP Status sections only (no Pre-fetched Agent Memories yet). Set `Triggered by: /execute` and `Phase: EXECUTION`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format for the run ID. Agent memories will be added in Step 1b after PRD discovery.
```

New Step 0:
```markdown
### Step 0: Build Session Memory Bundle

Before launching any task agents, assemble the shared context bundle.

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. The PRD directory is the skill argument. Set `Triggered by: /execute` and `Phase: EXECUTION`.

Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format. Include the full bundle in every agent prompt under `## Session Memory`.
```

**Remove "### Step 1b: Finalize Session Memory Bundle"** entirely (the full section that calls `search_nodes` per agent).

#### Acceptance Criteria
- [ ] Step 0 references session-memory-schema.md assembly steps — no inline MCP logic
- [ ] No Step 1b exists in the file
- [ ] No `search_nodes` references remain in the skill
- [ ] No hard-fail gate on current-topic.md

---

### Task 3: Update /team-research skill — remove MCP, add auto-context

**Status:** COMPLETED
**Complexity:** Medium
**Depends on:** Task 1

#### File Changes

##### MODIFY: `.claude/skills/team-research/SKILL.md`

**Replace "### Step 0: Build Session Memory Bundle"** section:

Old Step 0 (the full block including sub-steps 1, 2, 3):
```markdown
### Step 0: Build Session Memory Bundle

Before launching research agents, assemble the shared context bundle.

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before researching."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.

**3. Assemble partial bundle** — Build the Run Info + Current Topic + MCP Status sections only. Use the **Research Context** phase variant. Set `Triggered by: /team-research during /plan` and `Phase: RESEARCH`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format. Specialist agent memories will be added in Step 1b after research questions are defined.
```

New Step 0:
```markdown
### Step 0: Build Session Memory Bundle

Before launching research agents, assemble the shared context bundle.

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Use the **Research Context** phase variant. Set `Triggered by: /team-research during /plan` and `Phase: RESEARCH`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format.
```

**Remove "### Step 1b: Finalize Session Memory Bundle"** entirely (the full section that calls `search_nodes` for specialist agents and appends the Pre-fetched Memories section).

**Remove the "Specialist Agents in Research" section** that describes calling `search_nodes` per specialist agent — the entire block from "### Specialist Agents in Research" through the end of the specialist prompt template.

Replace that section with:
```markdown
## Specialist Agents in Research

When research touches a specialist's domain, include them as a research agent. Launch them the same way as a standard Explore agent but reference their agent file:

```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

Research question: <specific research question for this agent>

Your report should include:
1. Files found relevant to your domain
2. Patterns you observe
3. Concerns or flags from your specialist perspective

Do NOT suggest changes — just report what exists.
```
```

#### Acceptance Criteria
- [ ] Step 0 references session-memory-schema.md — no inline MCP logic
- [ ] No Step 1b exists in the file
- [ ] No `search_nodes` references remain
- [ ] No hard-fail gate on current-topic.md

---

### Task 4: Update /team-review skill — remove MCP, update PM context

**Status:** COMPLETED
**Complexity:** Medium
**Depends on:** Task 1

#### File Changes

##### MODIFY: `.claude/skills/team-review/SKILL.md`

**Replace "### Step 0: Build Session Memory Bundle"** section:

Old Step 0 (the full block including sub-steps 1, 2, 3):
```markdown
### Step 0: Build Session Memory Bundle

Before launching any agents, assemble the shared context bundle. This runs once — all agents in this review session receive the same bundle.

**1. Read current topic**
Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before reviewing."

**2. Check MCP availability**
Attempt to call `search_nodes` with query `"mcp-health-check"`. If the tool responds (even with no results): MCP Status = `AVAILABLE`. If the tool is not found or errors: MCP Status = `UNAVAILABLE`.

**3. Assemble partial bundle** — Build the Run Info + Current Topic + MCP Status sections only (no Pre-fetched Agent Memories yet). Set `Triggered by: /team-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format. Agent memories will be added in Step 2c after specialist selection is confirmed.
```

New Step 0:
```markdown
### Step 0: Build Session Memory Bundle

Before launching any agents, assemble the shared context bundle. This runs once — all agents in this review session receive the same bundle.

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /team-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format.
```

**Find and remove "#### Step 2c: Finalize Session Memory Bundle"** (or equivalent step that calls `search_nodes` for product-manager and specialist agents). Remove the entire sub-step.

**In the PM synthesis agent prompt**, find the instruction referencing Pre-fetched Agent Memories and replace it. The PM agent now reads `backlog.md` directly (as updated in PRD-01), so remove any instruction telling PM where to find memories in the bundle.

Find the line in the PM prompt similar to:
```
Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```
Replace with:
```
Complete all steps in your agent instructions. Your context is in the Session Memory section above. The PRD directory for this review is: prds/<dir>/
```

#### Acceptance Criteria
- [ ] Step 0 references session-memory-schema.md — no inline MCP logic
- [ ] No Step 2c (or equivalent pre-fetch step) exists
- [ ] No `search_nodes` references remain
- [ ] No hard-fail gate on current-topic.md
- [ ] PM agent prompt includes PRD directory so it can read backlog.md

---

### Task 5: Update all 6 specialist review skills — remove MCP

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 1

Apply the same change to all 6 specialist review skills:
- `.claude/skills/pm-review/SKILL.md`
- `.claude/skills/qa-review/SKILL.md`
- `.claude/skills/security-review/SKILL.md`
- `.claude/skills/devops-review/SKILL.md`
- `.claude/skills/dba-review/SKILL.md`
- `.claude/skills/pentest/SKILL.md`

#### File Changes (apply to all 6 files)

##### MODIFY: each specialist skill's SKILL.md

**Replace "### Step 2: Build Session Memory Bundle"** in each file.

The current pattern in all 6 files is:
```markdown
### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("<agent-name>", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/<skill-name>`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### <agent-name> — past decisions on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.
```

(Note: `/pentest` calls `search_nodes` twice — for both `penetration-agent` and `security-expert`. The replacement is the same.)

Replace with:
```markdown
### Step 2: Build Session Memory Bundle

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /<skill-name>` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md`. Pass the full bundle inline in the agent prompt under `## Session Memory`.
```

**Also update the agent prompt instruction** in Step 3 (or equivalent step that launches the agent). Find the line:
```
do NOT independently read current-topic.md or call search_nodes
```
Replace with:
```
do NOT independently read current-topic.md
```

For `/pm-review` specifically: also pass the PRD directory to the agent so it can read backlog.md. Add to the PM agent prompt:
```
The PRD directory for this review is: <active PRD from current-topic.md, or "none">
```

#### Acceptance Criteria
- [ ] All 6 specialist skills have Step 2 referencing session-memory-schema.md — no inline MCP logic
- [ ] No `search_nodes` references remain in any of the 6 files
- [ ] No hard-fail gates on current-topic.md in any of the 6 files
- [ ] pm-review passes PRD directory to agent prompt

---

### Task 6: Update /plan skill — auto-write context after master plan approval

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/skills/plan/SKILL.md`

**In "### Step 5: Write the Master Plan"**, after "Gate 2", add the auto-context update step:

Find Gate 2 text:
```markdown
**Gate 2:** After writing, tell the engineer: "Master Plan written to `prds/<dir>/master-plan.md`. Please review it. Want to change anything before I generate the detailed PRDs?"

Only after explicit approval, set the Status to `APPROVED` and tell the engineer to run `/prd <directory-name>`.
```

Replace with:
```markdown
**Gate 2:** After writing, tell the engineer: "Master Plan written to `prds/<dir>/master-plan.md`. Please review it. Want to change anything before I generate the detailed PRDs?"

Only after explicit approval:
1. Set the Master Plan Status to `APPROVED`
2. Auto-update `.claude/context/current-topic.md`:
   ```
   # Current Topic

   Updated: <current UTC time>
   Feature: <feature name from master plan>
   Active PRD: <directory name>
   ```
3. Tell the engineer to run `/prd <directory-name>`.
```

#### Acceptance Criteria
- [ ] After Gate 2 approval, `/plan` writes `current-topic.md` with Feature + Active PRD
- [ ] No manual `/set-context` step required after `/plan`

---

### Task 7: Update templates/session-memory-schema.md

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 1

#### File Changes

##### MODIFY: `templates/.claude/rules/session-memory-schema.md`

Apply the identical content change as Task 1 (the full rewrite). The template must match the live file.

#### Acceptance Criteria
- [ ] `templates/.claude/rules/session-memory-schema.md` content matches `.claude/rules/session-memory-schema.md`

---

## Execution Log

### Task 1: Rewrite session-memory-schema.md
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:00 UTC
- **Completed:** 2026-03-23 10:05 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/rules/session-memory-schema.md` (full rewrite: removed MCP Status + Pre-fetched Agent Memories sections, reduced assembly steps from 6 to 3, added auto-derive context step, removed hard-fail gate)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Bundle format has no `## MCP Status` section
  - [x] Bundle format has no `## Pre-fetched Agent Memories` section
  - [x] Assembly steps are exactly 3 (auto-derive, build+save, pass inline)
  - [x] No `search_nodes` references remain
  - [x] Hard-fail gate removed — skills proceed even if current-topic.md is missing

### Task 2: Update /execute skill — remove MCP, add auto-context
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:05 UTC
- **Completed:** 2026-03-23 10:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/execute/SKILL.md` (replaced Step 0 with schema reference, removed Step 1b entirely)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 0 references session-memory-schema.md assembly steps — no inline MCP logic
  - [x] No Step 1b exists in the file
  - [x] No `search_nodes` references remain in the skill
  - [x] No hard-fail gate on current-topic.md

### Task 3: Update /team-research skill — remove MCP, add auto-context
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:05 UTC
- **Completed:** 2026-03-23 10:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/team-research/SKILL.md` (replaced Step 0, removed Step 1b, simplified Specialist Agents section)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 0 references session-memory-schema.md — no inline MCP logic
  - [x] No Step 1b exists in the file
  - [x] No `search_nodes` references remain
  - [x] No hard-fail gate on current-topic.md

### Task 4: Update /team-review skill — remove MCP, update PM context
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:05 UTC
- **Completed:** 2026-03-23 10:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/team-review/SKILL.md` (replaced Step 0, removed Step 2c, updated PM agent prompt to include PRD directory)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 0 references session-memory-schema.md — no inline MCP logic
  - [x] No Step 2c (or equivalent pre-fetch step) exists
  - [x] No `search_nodes` references remain
  - [x] No hard-fail gate on current-topic.md
  - [x] PM agent prompt includes PRD directory so it can read backlog.md

### Task 5: Update all 6 specialist review skills — remove MCP
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:05 UTC
- **Completed:** 2026-03-23 10:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/pm-review/SKILL.md` (replaced Step 2, updated agent prompt, added PRD directory)
  - `.claude/skills/qa-review/SKILL.md` (replaced Step 2, updated agent prompt)
  - `.claude/skills/security-review/SKILL.md` (replaced Step 2, updated agent prompt)
  - `.claude/skills/devops-review/SKILL.md` (replaced Step 2, updated agent prompt)
  - `.claude/skills/dba-review/SKILL.md` (replaced Step 2, updated agent prompt)
  - `.claude/skills/pentest/SKILL.md` (replaced Step 2, updated agent prompt)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] All 6 specialist skills have Step 2 referencing session-memory-schema.md — no inline MCP logic
  - [x] No `search_nodes` references remain in any of the 6 files
  - [x] No hard-fail gates on current-topic.md in any of the 6 files
  - [x] pm-review passes PRD directory to agent prompt

### Task 6: Update /plan skill — auto-write context after master plan approval
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:05 UTC
- **Completed:** 2026-03-23 10:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/plan/SKILL.md` (updated Gate 2 in Step 5 to auto-write current-topic.md after master plan approval)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] After Gate 2 approval, `/plan` writes `current-topic.md` with Feature + Active PRD
  - [x] No manual `/set-context` step required after `/plan`

### Task 7: Update templates/session-memory-schema.md
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:05 UTC
- **Completed:** 2026-03-23 10:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `templates/.claude/rules/session-memory-schema.md` (content replaced to match live file exactly)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `templates/.claude/rules/session-memory-schema.md` content matches `.claude/rules/session-memory-schema.md`
