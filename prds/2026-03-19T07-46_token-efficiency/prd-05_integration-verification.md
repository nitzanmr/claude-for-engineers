# PRD-05: Integration Verification

Created: 2026-03-19 07:46 UTC
Status: PENDING
Depends on: PRD-01, PRD-02, PRD-03, PRD-04
Complexity: Low

## Objective

Verify that all modified files remain internally consistent, that cross-references between files are valid, and that no behavioral content was accidentally removed during trimming.

## Context

PRDs 01–04 touch 18 files across skills, agents, and rules. Most changes are removals or compressions. This PRD ensures nothing important was dropped: step sequences are intact, approval gates are preserved, cross-references point to valid locations, and the dynamic bundle concept is consistently implemented across the three orchestrating skills.

---

## Tasks

### Task 1: Verify behavioral integrity of modified skill and agent files

**Status:** PENDING
**Complexity:** Low

#### Verification Steps

Read each modified file and verify the listed criteria. Report any file that fails a check — do not modify any files.

**`.claude/rules/session-memory-schema.md`**
- [ ] Contains `## Bundle Format` section
- [ ] Contains `## Assembly Steps` section with steps 1–6
- [ ] Step 3 references "active agents" (not a fixed list of 6)
- [ ] Contains `## Phase Context Variants` with both `/execute`/`/team-review` variant and `/team-research` variant
- [ ] Contains `## Run ID Format` section

**`.claude/skills/execute/SKILL.md`**
- [ ] Contains `### Step 0: Build Session Memory Bundle`
- [ ] Step 0 does NOT call `search_nodes` for 6 agents
- [ ] Contains `### Step 1b: Finalize Session Memory Bundle` (new step from PRD-01)
- [ ] Step 1b describes scanning PRD files for `Recommended agent:` fields
- [ ] Contains `### Step 2: Present Execution Plan` through `### Step 7: Final Report` — all present
- [ ] Contains `## Error Handling` section

**`.claude/skills/team-review/SKILL.md`**
- [ ] Contains `### Step 0: Build Session Memory Bundle`
- [ ] Step 0 does NOT call `search_nodes` for 6 agents
- [ ] Contains `### Step 2c: Finalize Session Memory Bundle` (new step from PRD-01)
- [ ] Step 2c includes `product-manager` as always-fetched agent
- [ ] Contains `### Step 2b: Auto-Select Specialist Agents` — unchanged
- [ ] Contains `### Step 3: PM Synthesis` — unchanged
- [ ] Contains `### Step 4: Write Review and Backlog to Files` — unchanged
- [ ] Contains `### Step 5: Present Review Dashboard` — unchanged

**`.claude/skills/team-research/SKILL.md`**
- [ ] Contains `### Step 0: Build Session Memory Bundle`
- [ ] Step 0 does NOT call `search_nodes` for 6 agents
- [ ] Contains `### Step 1b: Finalize Session Memory Bundle` (new step from PRD-01)
- [ ] Step 1b describes no-specialist case (bundle has no memory section)
- [ ] Contains `### Step 1: Define Research Questions` — unchanged
- [ ] Contains `### Step 2: Launch Research Agents` — unchanged (Task Mode + Swarm Mode)
- [ ] Contains `### Step 3: Synthesize Results` — unchanged
- [ ] Contains `### Step 4: Present to Engineer` — unchanged
- [ ] Does NOT contain `## Examples` section (removed in PRD-03)
- [ ] Does NOT contain `## Integration with /plan` section (removed in PRD-03)
- [ ] `## Execution Modes` contains condensed 2-line descriptions (PRD-03)

**`.claude/skills/plan/SKILL.md`**
- [ ] Contains all 5 steps: Step 1 (Understand), Step 2 (Explore), Step 3 (Discuss), Step 4 (Break Into PRDs), Step 5 (Write Master Plan)
- [ ] Step 2 contains team-research invocation pattern with ask message template
- [ ] Contains `## Rules` section with NEVER/DO statements
- [ ] Contains `## What the Master Plan Is NOT` section
- [ ] Gate 1 ("Ready for me to write the Master Plan?") is present in Step 5
- [ ] Gate 2 (review before proceeding to PRDs) is present in Step 5
- [ ] Does NOT contain `## Conversation Flow Example` section
- [ ] Does NOT contain standalone `## When Research Gets Complex` section

**`.claude/rules/prd-format.md`**
- [ ] File is ≤ 90 lines
- [ ] Contains `## Directory Structure` with naming conventions
- [ ] Contains `## Master Plan Required Fields` with status values
- [ ] Contains `## PRD File Required Fields` with all field names
- [ ] Contains `## Status Transition Rules`
- [ ] Contains `## Execution Log Format` with full template (Agent, Mode, Started, Completed, Status, Files, Skills, Test results, Issues, Acceptance criteria)
- [ ] Contains `## Key Rules` (anchors, acceptance criteria, test location)
- [ ] Does NOT contain `## File Change Specification Rules`
- [ ] Does NOT contain `## Task Granularity Rules`
- [ ] Does NOT contain `## Testing Rules`

**`.claude/skills/prd/SKILL.md`**
- [ ] Contains `## Master Plan Template` section with full template
- [ ] Contains `## Full PRD File Template` section with full template including execution log
- [ ] Contains `## Testing Rules` section with "Required For" and "Optional For" lists
- [ ] Contains `## File Change Specification` section with small/medium/large bands
- [ ] Contains `## Task Granularity Rules and Examples` section
- [ ] Contains the BAD/GOOD acceptance criteria examples
- [ ] Contains `## Prerequisites` section — unchanged
- [ ] Contains `## Execution Steps` (Steps 1–6) — unchanged
- [ ] Does NOT reference `Follow the full testing rules in .claude/rules/prd-format.md` (old removed reference)

**6 specialist review skills** (`pm-review`, `qa-review`, `security-review`, `devops-review`, `dba-review`, `pentest`):
- [ ] Each file Step 2 is ≤ 10 lines
- [ ] `pentest/SKILL.md` Step 2 calls `search_nodes` for both `penetration-agent` AND `security-expert`
- [ ] Each Step 3 agent invocation prompt is unchanged (references correct agent file)
- [ ] Each Step 4 (Present Report) is unchanged

**6 agent files** (`product-manager`, `security-expert`, `dba-expert`, `devops-engineer`, `qa-automation`, `penetration-agent`):
- [ ] Each file Step 1 intro is ≤ 6 lines
- [ ] `product-manager.md` backlog retrieval logic (`5. **Retrieve carried-forward backlog**`) is intact
- [ ] `security-expert.md` still references `### penetration-agent` section in Step 1
- [ ] `penetration-agent.md` still references `### security-expert` section in Step 1
- [ ] All agents' Step 2+ domain logic is unchanged

#### Acceptance Criteria

- [ ] All 18 modified files pass their verification checks above
- [ ] Any failed check is reported to the engineer with the exact file and criterion that failed
- [ ] No files are modified in this task — read-only verification

---

### Task 2: Cross-reference consistency check

**Status:** PENDING
**Complexity:** Low
**Depends on:** Task 1

#### Verification Steps

Check that cross-references between files are valid after the restructure.

1. **prd-format.md references prd/SKILL.md** — `prd-format.md` now says "Full template with examples: `.claude/skills/prd/SKILL.md`" in two places. Verify that `prd/SKILL.md` actually contains the referenced content (Master Plan template and PRD File template).

2. **execute/SKILL.md references session-memory-schema.md** — Step 0 says to "Follow the bundle schema in `.claude/rules/session-memory-schema.md`". Verify the schema file exists and has the `## Bundle Format` section.

3. **team-review/SKILL.md references session-memory-schema.md** — Same check as above.

4. **team-research/SKILL.md references session-memory-schema.md** — Same check.

5. **plan/SKILL.md Step 2 references team-research** — Step 2 says "Launch `/team-research` with those questions". Verify `.claude/skills/team-research/SKILL.md` exists.

6. **Review skills reference agent files** — Each review skill Step 3 prompt says "Follow the instructions in `.claude/agents/<agent-name>.md`". Verify each referenced agent file exists.

7. **prd/SKILL.md references prd-format.md** — The existing line "Follow these rules from `.claude/rules/prd-format.md`" (if still present in any section) should still reference a valid file. Verify prd-format.md exists.

8. **Execution agents need execution log format** — Verify that `prd-format.md` still contains the `## Execution Log Format` section that `/execute` agents use to write logs. (This is the most critical cross-reference after the restructure.)

#### Acceptance Criteria

- [ ] `prd-format.md` references `prd/SKILL.md` for full templates (2 references)
- [ ] `prd/SKILL.md` contains Master Plan template AND PRD File template
- [ ] `session-memory-schema.md` exists and has `## Bundle Format` section
- [ ] All 3 orchestrating skills reference `session-memory-schema.md` correctly
- [ ] All 6 review skills reference valid agent `.md` files
- [ ] `prd-format.md` still has `## Execution Log Format` section
- [ ] No broken cross-references found
- [ ] Any broken reference is reported to the engineer

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->
