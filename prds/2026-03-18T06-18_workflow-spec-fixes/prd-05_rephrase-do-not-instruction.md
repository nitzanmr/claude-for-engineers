# PRD-05: BLG-029 — Rephrase confusing "do NOT read" instruction in all 6 agent files

Created: 2026-03-18 06:18 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Replace the confusing negative "do NOT read `.claude/context/current-topic.md`" instruction in all 6 agent files with positive framing that eliminates the contradiction with the `## Current Topic` heading in the session bundle.

## Context

All 6 agent files contain this sentence under `### Step 1: Load Context from Session Memory`:

> "Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`."

The `## Session Memory` bundle that agents receive has a `## Current Topic` subsection. Agents and humans reading the file see "Current Topic" heading in the bundle immediately paired with "do NOT read current-topic.md" — creating cognitive dissonance about whether the instruction refers to the bundle section or the file. Positive framing removes the ambiguity.

## Tasks

### Task 1: Rephrase Step 1 opening sentence in all 6 agent files

**Status:** PENDING
**Complexity:** Low

#### File Changes

The same sentence appears identically in all 6 files. Apply the same replacement to each.

**Old sentence** (present in all 6 files):
```
The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.
```

**New sentence** (replace with in all 6 files):
```
The orchestrating skill has pre-assembled a session memory bundle for this run. Your context is pre-loaded in the `## Session Memory` section of this prompt — use it directly. There is no need to read files or call memory tools for context.
```

##### MODIFY: .claude/agents/product-manager.md
Apply the replacement above (line 14).

##### MODIFY: .claude/agents/security-expert.md
Apply the replacement above (line 14).

##### MODIFY: .claude/agents/dba-expert.md
Apply the replacement above (line 14).

##### MODIFY: .claude/agents/devops-engineer.md
Apply the replacement above (line 14).

##### MODIFY: .claude/agents/qa-automation.md
Apply the replacement above (line 14).

##### MODIFY: .claude/agents/penetration-agent.md
Apply the replacement above (line 29, which is inside the "How You Work" section, not the ethics section).

#### Acceptance Criteria

- [ ] `grep -r "do NOT read" .claude/agents/` returns no results
- [ ] All 6 agent files contain the phrase "Your context is pre-loaded in the `## Session Memory` section"
- [ ] The Step 1 section heading `### Step 1: Load Context from Session Memory` is unchanged in all 6 files

---

## Execution Log

### Task 1: Rephrase Step 1 opening sentence in all 6 agent files
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-18 06:37 UTC
- **Completed:** 2026-03-18 06:38 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - .claude/agents/product-manager.md
  - .claude/agents/security-expert.md
  - .claude/agents/dba-expert.md
  - .claude/agents/devops-engineer.md
  - .claude/agents/qa-automation.md
  - .claude/agents/penetration-agent.md
- **Files deleted:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `grep -r "do NOT read" .claude/agents/` returns no results
  - [x] All 6 agent files contain "Your context is pre-loaded in the `## Session Memory` section"
  - [x] Step 1 section heading unchanged in all 6 files
