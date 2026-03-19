# PRD-02: PM Backlog System

Created: 2026-03-17 14:30 UTC
Status: COMPLETED
Depends on: None
Complexity: Medium

## Objective

Give the PM agent a structured backlog with persistent item lifecycle (OPEN → DEFERRED → RESOLVED). Backlog items are stored in MCP memory and written to `backlog.md` after every review. Carried-forward open items are shown automatically at the start of each review. A new `/pm-backlog` skill lets the engineer view and update items at any time.

## Context

The PM currently stores free-text decisions as MCP observations. There is no way to ask "what issues are still open?" across sessions. This PRD adds a structured BACKLOG observation format on top of the existing MCP memory, a `backlog.md` output file written by `/team-review`, and a `/pm-backlog` skill to query and update items.

## Tasks

---

### Task 1: Update product-manager.md — backlog retrieval and creation

**Status:** PENDING
**Complexity:** Medium

#### File Changes

##### MODIFY: .claude/agents/product-manager.md

**Update "### Step 1: Load Context from Session Memory"** — add backlog retrieval after the existing 4 steps (append to the end of Step 1):

```markdown
5. **Retrieve carried-forward backlog** — In the `### product-manager` section of the Session Memory bundle, find all observations containing `BACKLOG:`. Separate them by status:
   - Lines containing `status=OPEN` → Open items
   - Lines containing `status=DEFERRED` → Deferred items
   - Cross-reference with `BACKLOG_UPDATE:` lines to apply any status changes that happened after creation

   Show these at the top of your report under "Carried-Forward Backlog Items" before any new findings.
```

**Replace "### Step 5: Store Your Decisions"** with:

```markdown
### Step 5: Create Backlog Items and Store Decisions

**Assign IDs** — Find the highest existing `BLG-NNN` ID in the Session Memory bundle. New items start at the next number. If no existing items: start at BLG-001.

**For each finding in your synthesis** (Needed Improvements, Desirable Additions, Hard Addons), store a BACKLOG observation:

```
add_observations({
  entityName: "product-manager",
  observations: [
    "[<topic>] DECISION: <what was decided> | REASON: <why> (date: <today>)",
    "[<topic>] BACKLOG: id=BLG-001 | title='<short title>' | status=OPEN | category=Needed | source=<agent-that-flagged-it> | created=<today>",
    "[<topic>] BACKLOG: id=BLG-002 | title='<short title>' | status=OPEN | category=Desirable | source=<agent> | created=<today>",
    "[<topic>] BACKLOG: id=BLG-003 | title='<short title>' | status=OPEN | category=Hard | source=<agent> | created=<today>"
  ]
})
```

**For any previously-open items now resolved** (i.e., the finding was fixed in this review session's execution), store a BACKLOG_UPDATE:

```
add_observations({
  entityName: "product-manager",
  observations: [
    "[<topic>] BACKLOG_UPDATE: id=BLG-XXX | status=RESOLVED | resolved=<today> | resolved_by=this-review-session"
  ]
})
```

**Return the structured backlog list** at the end of your synthesis output. The orchestrating skill (`/team-review`) will write this to `backlog.md`. Format each item as:

```
BACKLOG_OUTPUT:
- BLG-001 [Needed] OPEN — <title> — flagged by <agent> on <today>
- BLG-002 [Desirable] OPEN — <title> — flagged by <agent> on <today>
- BLG-003 [Hard] OPEN — <title> — flagged by <agent> on <today>
- BLG-XXX [Needed] RESOLVED — <title> — resolved <today>
```
```

**Update the PM Report Format** — add "Carried-Forward Backlog Items" section before "### Past Decisions Retrieved":

```markdown
### Carried-Forward Backlog Items

**Open from previous reviews:**
- BLG-NNN [Needed] <title> — flagged by <agent> on YYYY-MM-DD
- (or "None")

**Deferred:**
- BLG-NNN [Desirable] <title> — deferred YYYY-MM-DD (reason: <why>)
- (or "None")
```

#### Acceptance Criteria
- [ ] PM Step 1 retrieves and shows carried-forward BACKLOG items from session memory
- [ ] PM Step 5 assigns BLG-NNN IDs to all findings and stores as BACKLOG observations
- [ ] PM Step 5 marks resolved items with BACKLOG_UPDATE observations
- [ ] PM synthesis output includes a `BACKLOG_OUTPUT:` section with structured item list
- [ ] PM report format includes "Carried-Forward Backlog Items" section

---

### Task 2: Update team-review/SKILL.md Step 4 — write backlog.md

**Status:** PENDING
**Complexity:** Low
**Depends on:** Task 1 (PM now outputs BACKLOG_OUTPUT section that Step 4 reads)

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Replace "### Step 4: Write Review to File"** with:

```markdown
### Step 4: Write Review and Backlog to Files

**4a. Write review.md**

Append the full review to `prds/<dir>/review.md` (same format as before):

```markdown
## Code Review: <Feature Name>

Date: YYYY-MM-DD HH:MM UTC
PRD Directory: prds/<dir>/
Session Memory: .claude/context/run-log/<run-id>.md

### Overall Assessment
PASS | PASS_WITH_ISSUES | NEEDS_FIXES

### Spec Compliance
<agent 1 report>

### Code Quality
<agent 2 report>

### Integration
<agent 3 report, if run>

### Specialist Reviews
<any specialist agent reports>

### PM Synthesis
<PM improvement plan>
```

**4b. Write backlog.md**

Parse the `BACKLOG_OUTPUT:` section from the PM synthesis report. Write (or overwrite) `prds/<dir>/backlog.md`:

```markdown
# Backlog — <Feature Name>

Last updated: YYYY-MM-DD HH:MM UTC by /team-review
Session: .claude/context/run-log/<run-id>.md

## Open
- [ ] BLG-001 [Needed] <title> — flagged by <agent> on YYYY-MM-DD
- [ ] BLG-002 [Needed] <title> — flagged by <agent> on YYYY-MM-DD
- [ ] BLG-003 [Desirable] <title> — flagged by <agent> on YYYY-MM-DD

## Deferred
- [ ] BLG-004 [Hard] <title> — deferred YYYY-MM-DD (reason: <why>)

## Resolved
- [x] BLG-005 [Needed] <title> — resolved YYYY-MM-DD
```

If no backlog items exist in the PM output, write an empty backlog.md with "No items yet."
```

#### Acceptance Criteria
- [ ] `review.md` now includes a `Session Memory:` reference line in the header
- [ ] `backlog.md` is created/overwritten in `prds/<dir>/` after every review
- [ ] `backlog.md` has Open / Deferred / Resolved sections
- [ ] `backlog.md` links to the session run-log file

---

### Task 3: Create pm-backlog/SKILL.md

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/skills/pm-backlog/SKILL.md

```markdown
---
name: pm-backlog
description: View and manage the PM backlog for a feature. Shows open, deferred, and resolved items from all review sessions. Lets you mark items resolved or deferred.
argument-hint: <prd-directory-name>
allowed-tools: Read, Glob, Grep, Edit
tags: [backlog, product, pm, tracking]
---

# PM Backlog Skill

View and update the PM's structured backlog for a feature. Items are written by `/team-review` after each review session.

## Steps

### Step 1: Determine Target

If an argument was provided, look for `prds/<argument>/backlog.md`.
Otherwise list available PRD directories and ask: "Which feature's backlog?"

### Step 2: Read Backlog File

Read `prds/<dir>/backlog.md`. If it doesn't exist, tell the engineer: "No backlog yet for this feature. Run `/team-review <dir>` to generate one."

### Step 3: Display

Show the backlog to the engineer organized by status:

```
Backlog — <feature-name>
Last updated: YYYY-MM-DD

Open (N items):
  ⚠ [Needed]    BLG-001 — <title> — flagged by <agent>
  ⚠ [Needed]    BLG-002 — <title> — flagged by <agent>
  📋 [Desirable] BLG-003 — <title> — flagged by <agent>
  🔴 [Hard]      BLG-004 — <title> — flagged by <agent>

Deferred (N items):
  🔵 BLG-005 — <title> — deferred YYYY-MM-DD (reason: <why>)

Resolved (N items):
  ✅ BLG-006 — <title> — resolved YYYY-MM-DD
```

### Step 4: Optional Update

Ask: "Want to update any items? Options: (r) mark resolved, (d) defer with reason, (n) nothing"

**Mark resolved:**
In `backlog.md`: move the item from Open to Resolved, change `- [ ]` to `- [x]`, add `— resolved YYYY-MM-DD`.

**Defer:**
In `backlog.md`: move the item from Open to Deferred, add `(reason: <engineer's reason>)`.

**No update:** Done.

### Step 5: Summary

Show final counts: "Backlog updated. Open: N | Deferred: N | Resolved: N"
```

#### Acceptance Criteria
- [ ] File created at `.claude/skills/pm-backlog/SKILL.md`
- [ ] Skill reads `prds/<dir>/backlog.md`
- [ ] Skill displays items grouped by status with emoji indicators
- [ ] Skill allows marking items resolved or deferred by editing backlog.md
- [ ] Skill shows final counts after update

---

## Execution Log

### Task 1: Update product-manager.md — backlog retrieval and creation
- **Agent:** orchestrator (direct)
- **Completed:** 2026-03-18 00:18 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/agents/product-manager.md` (added backlog retrieval to Step 1, replaced Step 5 with backlog creation, added Carried-Forward section to report format)

### Task 2: Update team-review/SKILL.md Step 4 — write backlog.md
- **Agent:** orchestrator (direct)
- **Completed:** 2026-03-18 00:20 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/skills/team-review/SKILL.md` (replaced Step 4 with 4a review.md + 4b backlog.md)

### Task 3: Create pm-backlog/SKILL.md
- **Agent:** orchestrator (direct)
- **Completed:** 2026-03-18 00:17 UTC
- **Status:** COMPLETED
- **Files created:** `.claude/skills/pm-backlog/SKILL.md`
