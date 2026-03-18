---
name: pm-backlog
description: View and manage the PM backlog for a feature. Shows open, deferred, and resolved items from all review sessions. Lets you mark items resolved or deferred.
argument-hint: <prd-directory-name>
allowed-tools: Read, Glob, Grep, Edit, mcp__memory__add_observations
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
  ⚠  [Needed]    BLG-001 — <title> — flagged by <agent>
  ⚠  [Needed]    BLG-002 — <title> — flagged by <agent>
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

**No update:** Done.

### Step 5: Summary

Show final counts: "Backlog updated. Open: N | Deferred: N | Resolved: N"
