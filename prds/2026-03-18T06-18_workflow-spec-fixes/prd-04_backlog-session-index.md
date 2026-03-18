# PRD-04: BLG-028 — Add session index block to backlog.md for multi-run linkage

Created: 2026-03-18 06:18 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Add a `## Sessions` block to the top of backlog.md that records which review run introduced and resolved which backlog items, so items carry traceable origin across multiple `/team-review` runs.

## Context

`review.md` is appended on each `/team-review` run; `backlog.md` is overwritten. After the overwrite, backlog items only show `flagged by <agent> on YYYY-MM-DD` — but there's no link back to which session (run-id) generated them. In a multi-run scenario you can't easily trace "which review run produced BLG-028?" without hand-scanning review.md. The fix: add a `## Sessions` block at the top of backlog.md. Each run appends one entry. Item lines stay clean (no inline session tag).

## Tasks

### Task 1: Update team-review Step 4b to write and maintain a Sessions block in backlog.md

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Change 1 — Update the backlog.md format in Step 4b**

Find the backlog.md template block (starts with the triple-backtick markdown block under "Write (or overwrite) `prds/<dir>/backlog.md`"):

```
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
```

Replace the entire template with:

```
```markdown
# Backlog — <Feature Name>

Last updated: YYYY-MM-DD HH:MM UTC by /team-review

## Sessions
- <run-id>: introduced BLG-001, BLG-002, BLG-003

## Open
- [ ] BLG-001 [Needed] <title> — flagged by <agent> on YYYY-MM-DD
- [ ] BLG-002 [Needed] <title> — flagged by <agent> on YYYY-MM-DD
- [ ] BLG-003 [Desirable] <title> — flagged by <agent> on YYYY-MM-DD

## Deferred
- [ ] BLG-004 [Hard] <title> — deferred YYYY-MM-DD (reason: <why>)

## Resolved
- [x] BLG-005 [Needed] <title> — resolved YYYY-MM-DD
```
```

---

**Change 2 — Add multi-run Sessions block management instructions in Step 4b**

Find the prose immediately before the backlog.md template block. It currently reads:

```
Parse the `BACKLOG_OUTPUT:` section from the PM synthesis report. Write (or overwrite) `prds/<dir>/backlog.md`:
```

Replace with:

```
Parse the `BACKLOG_OUTPUT:` section from the PM synthesis report. Write (or overwrite) `prds/<dir>/backlog.md`:

**Sessions block (multi-run tracking):**
- If `backlog.md` does not yet exist: write a fresh `## Sessions` block with one entry for this run.
- If `backlog.md` already exists: read the existing `## Sessions` block, append a new line for this run, then write the full overwritten file with the updated block preserved.
- Each Sessions entry format: `- <run-id>: introduced BLG-NNN[, BLG-NNN...][, resolved BLG-NNN...]`
- List every new BLG ID introduced this run under `introduced`. List every BLG ID resolved this run under `resolved` (omit the `resolved` part if none).
```

#### Acceptance Criteria

- [ ] `team-review/SKILL.md` Step 4b backlog.md template includes `## Sessions` block above `## Open`
- [ ] The `Session: .claude/context/run-log/<run-id>.md` line is removed from the header (replaced by the Sessions block)
- [ ] Step 4b instructions describe how to preserve existing Sessions entries on overwrite
- [ ] Sessions entry format `- <run-id>: introduced BLG-NNN[, resolved BLG-NNN...]` is documented

---

## Execution Log

### Task 1: Update team-review Step 4b to write and maintain a Sessions block in backlog.md
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-18 06:38 UTC
- **Completed:** 2026-03-18 06:41 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - .claude/skills/team-review/SKILL.md (Step 4b: new Sessions block template + management instructions)
- **Files deleted:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 4b backlog.md template includes `## Sessions` block above `## Open`
  - [x] The `Session: .claude/context/run-log/<run-id>.md` line removed from header
  - [x] Step 4b instructions describe how to preserve existing Sessions entries on overwrite
  - [x] Sessions entry format documented
