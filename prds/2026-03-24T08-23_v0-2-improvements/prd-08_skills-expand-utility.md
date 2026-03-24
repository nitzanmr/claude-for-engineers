# PRD-08: Skills: Expand `/retro`, `/check-setup`, `/set-context`, Team-Research Session Bundle

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: None
Complexity: Medium

## Objective

Expand four underdeveloped skills: `/retro` should incorporate `review.md`/`backlog.md` into its analysis; `/check-setup` should mention `settings.local.json`; `/set-context` should display a current-values table before asking for input; and `team-research` task mode should pass the session memory bundle to agents (it builds it in Step 0 but never passes it in task mode prompts).

## Context

All four skills have identified gaps from the v0.2 team-research audit:
1. `/retro` reads PRD execution logs but ignores `review.md`/`backlog.md` — the review context is lost
2. `/check-setup` verifies configuration but never mentions `settings.local.json`, leaving engineers wondering where their custom config went
3. `/set-context` asks for input without showing what the current values are, forcing engineers to remember the prior state
4. `team-research` builds a session bundle in Step 0 but the task mode agent prompt template has no `## Session Memory` section — the bundle is silently discarded

Changes apply to both `templates/.claude/skills/` and `.claude/skills/`.

## Tasks

### Task 1: Expand `/retro` to include review findings and merge decision reference

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/skills/retro/SKILL.md AND .claude/skills/retro/SKILL.md

**In Step 1 ("Read Execution Logs")**, add after `3. Collect: completion times, issues, failed tasks, agent notes`:

```markdown
4. If `review.md` exists in the PRD directory, read it — extract Overall Assessment, Spec Compliance, and PM Synthesis sections
5. If `backlog.md` exists, read it — note Open and Deferred items
```

**In Step 2 ("Analyze")**, add a new section to the retrospective template, after `## Suggestions for Next Time`:

```markdown
## Review Findings Summary
(Include only if review.md exists)
- Overall assessment: PASS | PASS_WITH_ISSUES | NEEDS_FIXES
- Open backlog items: N Needed, M Desirable
- Key patterns flagged across agents: <list>
- Merge readiness: <READY | FIX_NEEDED | RE-PLAN based on backlog categories>

## Merge Decision
(Based on review.md backlog — see workflow.md "Review → Merge Decision")
- [ ] All Needed items cleared
- [ ] Desirable items tracked
- [ ] No Hard items requiring re-planning
```

**In Step 5 ("Suggest Documentation Updates")**, add at the end:

```markdown
If the review flagged patterns that should be added to `.claude/rules/` or `CLAUDE.md`, propose specific rule additions. Do not apply without engineer approval.
```

#### Acceptance Criteria

- [ ] `/retro` Step 1 lists reading `review.md` and `backlog.md` as optional steps
- [ ] Retrospective template includes "Review Findings Summary" and "Merge Decision" sections
- [ ] Both `templates/` and `.claude/` copies are updated

---

### Task 2: Add `settings.local.json` guidance to `/check-setup`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/skills/check-setup/SKILL.md AND .claude/skills/check-setup/SKILL.md

**Add Step 1.5** between Step 1 and Step 2 (the `.gitignore` check):

```markdown
### Step 1.5: Check settings.local.json (informational)

Read `.claude/settings.local.json`.

- If the file **does not exist**: report "INFO: No settings.local.json found. This file is optional — create it to add MCP servers, API keys, or custom env vars. It is never overwritten by upgrades."
- If the file **exists**: report "OK: settings.local.json exists (your custom config is preserved on upgrades)."
```

**Update Step 4 ("Present Summary")** — add `settings.local.json` row to the table:

Replace the summary table:
```
────────────────────────────────────────
Claude for Engineers — Setup Check
────────────────────────────────────────
settings.json              OK | FAIL
Gitignore rules            OK | WARN
current-topic.md           OK | WARN (not set) | FAIL (missing)
────────────────────────────────────────
Overall: READY | NEEDS_FIXES
```

With:
```
────────────────────────────────────────
Claude for Engineers — Setup Check
────────────────────────────────────────
settings.json              OK | FAIL
settings.local.json        OK | INFO (not found — optional)
Gitignore rules            OK | WARN
current-topic.md           OK | WARN (not set) | FAIL (missing)
────────────────────────────────────────
Overall: READY | NEEDS_FIXES
```

Note: `settings.local.json` is INFO-only — it never blocks READY status.

#### Acceptance Criteria

- [ ] Step 1.5 is present in both `templates/` and `.claude/` copies
- [ ] Summary table includes `settings.local.json` row
- [ ] Missing `settings.local.json` reports INFO (not FAIL), does not affect Overall status

---

### Task 3: Show current-values table in `/set-context` before asking for input

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/skills/set-context/SKILL.md AND .claude/skills/set-context/SKILL.md

**Replace Step 1 ("Read Current State")** entirely:

```markdown
### Step 1: Read and Display Current State

Read `.claude/context/current-topic.md`.

Show the current values in a table before asking for changes:

```
Current topic:
  Feature   : <value or "(not set)">
  Active PRD : <value or "(none)">
  Updated    : <value or "never">
```

If an argument was provided (`{{argument}}`), use it as the new Feature name directly — skip asking.

Otherwise ask the engineer:
- What is the new feature/topic name? (press Enter to keep current)
- Which PRD directory is now active? (press Enter to keep current, type "none" to clear)
```

#### Acceptance Criteria

- [ ] Step 1 displays the current table before prompting
- [ ] Argument bypass still works (if argument provided, skip prompt)
- [ ] Both `templates/` and `.claude/` copies are updated

---

### Task 4: Pass session memory bundle in `team-research` task mode agent prompts

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/skills/team-research/SKILL.md AND .claude/skills/team-research/SKILL.md

**In Step 2 ("Launch Research Agents"), Task Mode section**, find the agent prompt template block that starts with:

```
```
Research the following area of the codebase and provide a thorough report.

Question: <specific research question>
```

Add `## Session Memory` to the end of the prompt template, before the closing triple-backtick:

```markdown
## Session Memory
<full contents of the session memory bundle built in Step 0>
```

The complete task mode agent prompt template should end with:

```
...
Do NOT suggest changes - just report what exists.

## Session Memory
<full contents of the session memory bundle built in Step 0>
```

#### Acceptance Criteria

- [ ] Task mode agent prompt in `team-research` includes `## Session Memory` section
- [ ] The section instructs including the full bundle built in Step 0
- [ ] Both `templates/` and `.claude/` copies are updated
- [ ] Swarm mode prompt (which already has coordination instructions) is not changed

---

## Execution Log

### Task 1: Expand `/retro` to include review findings and merge decision reference
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 11:15 UTC
- **Completed:** 2026-03-24 11:20 UTC
- **Status:** COMPLETED
- **Files modified:** .claude/skills/retro/SKILL.md, templates/.claude/skills/retro/SKILL.md (added steps 4+5 to Step 1; added Review Findings Summary + Merge Decision sections to template; added rule to Step 5)
- **Acceptance criteria:**
  - [x] Step 1 lists reading review.md and backlog.md (steps 4 and 5)
  - [x] Template includes "Review Findings Summary" and "Merge Decision" sections
  - [x] Both copies updated

### Task 2: Add `settings.local.json` guidance to `/check-setup`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 11:20 UTC
- **Completed:** 2026-03-24 11:25 UTC
- **Status:** COMPLETED
- **Files modified:** .claude/skills/check-setup/SKILL.md, templates/.claude/skills/check-setup/SKILL.md (added Step 1.5; updated summary table with settings.local.json row)
- **Acceptance criteria:**
  - [x] Step 1.5 present in both copies
  - [x] Summary table includes settings.local.json row
  - [x] Missing file reports INFO, does not affect Overall status

### Task 3: Show current-values table in `/set-context` before asking for input
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 11:25 UTC
- **Completed:** 2026-03-24 11:28 UTC
- **Status:** COMPLETED
- **Files modified:** .claude/skills/set-context/SKILL.md, templates/.claude/skills/set-context/SKILL.md (replaced Step 1 with display-then-ask flow)
- **Acceptance criteria:**
  - [x] Step 1 displays current table before prompting
  - [x] Argument bypass works
  - [x] Both copies updated

### Task 4: Pass session memory bundle in `team-research` task mode agent prompts
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 11:28 UTC
- **Completed:** 2026-03-24 11:30 UTC
- **Status:** COMPLETED
- **Files modified:** .claude/skills/team-research/SKILL.md, templates/.claude/skills/team-research/SKILL.md (added `## Session Memory` section before closing backtick in task mode prompt)
- **Acceptance criteria:**
  - [x] Task mode prompt includes `## Session Memory` section
  - [x] Swarm mode prompt unchanged
  - [x] Both copies updated
