# PRD-03: Simplify current-topic.md and /set-context

Created: 2026-03-23 10:30 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Reduce `current-topic.md` to two fields (`Feature:` and `Active PRD:`), update the template, simplify `/set-context` to match, and update `/pm-backlog` to remove MCP writes.

## Context

The current `current-topic.md` has 7+ fields and narrative sections. The research showed only `Feature:` was machine-read (for MCP queries, now removed). All narrative sections belong in `master-plan.md`. The file should be minimal: just enough to identify what's being worked on and which PRD directory is active.

`/pm-backlog` currently writes `BACKLOG_UPDATE` observations to MCP when items are resolved or deferred. Since MCP is being removed, it should only update `backlog.md`.

## Tasks

---

### Task 1: Reduce current-topic.md to 2 fields

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/context/current-topic.md`

Replace the entire file content with:

```markdown
# Current Topic

Updated: 2026-03-23 10:00 UTC
Feature: Distributable NPX Package & MCP Server for claude-for-engineers
Active PRD: none
```

(Preserve the actual current Feature and Active PRD values — only remove the extra fields and narrative sections.)

#### Acceptance Criteria
- [ ] File contains only `Updated:`, `Feature:`, and `Active PRD:` fields
- [ ] No `Phase:`, `## What We're Building`, `## Key Decisions`, `## Open Questions`, or `## Team Notes` sections remain

---

### Task 2: Update current-topic.md template

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `templates/.claude/context/current-topic.md`

Replace the entire file content with:

```markdown
# Current Topic

Updated: REPLACE_WITH_DATE
Feature: REPLACE_WITH_FEATURE_NAME
Active PRD: none
```

#### Acceptance Criteria
- [ ] Template contains only `Updated:`, `Feature:`, and `Active PRD:` fields
- [ ] No narrative sections remain

---

### Task 3: Simplify /set-context skill

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/skills/set-context/SKILL.md`

Replace the entire Steps section with:

```markdown
## Steps

### Step 1: Read Current State
Read `.claude/context/current-topic.md` to show the current values (if the file exists).

If an argument was provided, use it as the new feature name directly without asking.

Otherwise ask the engineer:
- What is the feature/topic name?
- Which PRD directory is active? (or "none")

### Step 2: Update the File
Write `.claude/context/current-topic.md` with:
```markdown
# Current Topic

Updated: <current UTC time>
Feature: <feature name>
Active PRD: <directory name or "none">
```

### Step 3: Confirm
Show the engineer the updated content.
```

#### Acceptance Criteria
- [ ] Skill only asks for Feature and Active PRD
- [ ] Skill writes only those two fields (plus Updated timestamp)
- [ ] No questions about Phase, decisions, or open questions remain

---

### Task 4: Remove MCP writes from /pm-backlog

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/skills/pm-backlog/SKILL.md`

**In Step 4, "Mark resolved" sub-section** — remove the MCP write block:

Old:
```markdown
**Mark resolved:**
1. In `backlog.md`: move the item from Open to Resolved, change `- [ ]` to `- [x]`, add `— resolved YYYY-MM-DD`.
2. Write a `BACKLOG_UPDATE:` observation to MCP to keep memory in sync:
   ```
   add_observations({
     entityName: "product-manager",
     observations: [
       "[<topic>] BACKLOG_UPDATE: id=<BLG-NNN> | status=RESOLVED | resolved=YYYY-MM-DD | resolved_by=pm-backlog"
     ]
   })
   ```
   Where `<topic>` is the feature name from the backlog.md header. If MCP is unavailable, skip this step and note it in the summary.
```

New:
```markdown
**Mark resolved:**
1. In `backlog.md`: move the item from Open to Resolved, change `- [ ]` to `- [x]`, add `— resolved YYYY-MM-DD`.
```

**In Step 4, "Defer" sub-section** — remove the MCP write block:

Old:
```markdown
**Defer:**
1. In `backlog.md`: move the item from Open to Deferred, add `(reason: <engineer's reason>)`.
2. Write a `BACKLOG_UPDATE:` observation to MCP:
   ```
   add_observations({
     entityName: "product-manager",
     observations: [
       "[<topic>] BACKLOG_UPDATE: id=<BLG-NNN> | status=DEFERRED | reason=<engineer's reason>"
     ]
   })
   ```
   If MCP is unavailable, skip this step and note it in the summary.
```

New:
```markdown
**Defer:**
1. In `backlog.md`: move the item from Open to Deferred, add `(reason: <engineer's reason>)`.
```

Also remove `mcp__memory__add_observations` from the `allowed-tools` frontmatter line:

Old:
```
allowed-tools: Read, Glob, Grep, Edit, mcp__memory__add_observations
```

New:
```
allowed-tools: Read, Glob, Grep, Edit
```

#### Acceptance Criteria
- [ ] No `add_observations` calls exist in the file
- [ ] `mcp__memory__add_observations` removed from `allowed-tools`
- [ ] Resolve and defer flows only update `backlog.md`

---

## Execution Log

### Task 1: Reduce current-topic.md to 2 fields
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/context/current-topic.md` (reduced to Updated/Feature/Active PRD only)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] File contains only `Updated:`, `Feature:`, and `Active PRD:` fields
  - [x] No `Phase:`, `## What We're Building`, `## Key Decisions`, `## Open Questions`, or `## Team Notes` sections remain

### Task 2: Update current-topic.md template
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `templates/.claude/context/current-topic.md` (replaced with minimal 3-field template)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Template contains only `Updated:`, `Feature:`, and `Active PRD:` fields
  - [x] No narrative sections remain

### Task 3: Simplify /set-context skill
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/set-context/SKILL.md` (replaced entire Steps section with simplified 3-step version)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Skill only asks for Feature and Active PRD
  - [x] Skill writes only those two fields (plus Updated timestamp)
  - [x] No questions about Phase, decisions, or open questions remain

### Task 4: Remove MCP writes from /pm-backlog
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/skills/pm-backlog/SKILL.md` (removed mcp__memory__add_observations from allowed-tools, removed add_observations blocks from resolve and defer flows)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] No `add_observations` calls exist in the file
  - [x] `mcp__memory__add_observations` removed from `allowed-tools`
  - [x] Resolve and defer flows only update `backlog.md`
