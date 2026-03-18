# PRD-02: BLG-023 — Map PM categories to severity counts in review dashboard verdict

Created: 2026-03-18 06:18 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Make PM Needed/Desirable/Hard categories feed into the review dashboard's severity aggregate and Overall verdict, so the verdict reflects the PM's priority judgment alongside raw technical severity.

## Context

The review dashboard in `team-review/SKILL.md` Step 5 shows two disconnected things: (1) a severity aggregate (`Critical/High/Medium/Low`) from technical agent reports, and (2) PM backlog items in `Needed/Desirable/Hard` categories. The `Overall` verdict is computed only from the technical severity side. This means a feature with zero High/Critical technical issues but five PM-flagged Needed improvements gets a `PASS` verdict — misleading. The fix maps PM categories to severity levels and displays them in the dashboard.

## Tasks

### Task 1: Add PM category mapping to severity aggregate and verdict logic

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Change 1 — Add PM mapping to Step 5 "1. Compute severity aggregate"**

Find the block starting with "Scan all agent reports collected before Step 3." The block ends with:
```
- spec compliance: MAJOR_DEVIATION → High, MINOR_DEVIATION → Low
```

Add one line immediately after that final bullet:
```
- product-manager: Needed items → High, Desirable items → Medium, Hard items → informational (not counted in severity totals)
```

---

**Change 2 — Clarify Step 5 "2. Determine overall assessment"**

Find the three-bullet assessment block:
```
- `NEEDS_FIXES` — any Critical or High findings exist
- `PASS_WITH_ISSUES` — Medium or Low findings only
- `PASS` — no findings across all agents
```

Replace with:
```
- `NEEDS_FIXES` — any Critical or High findings exist (PM Needed items count as High)
- `PASS_WITH_ISSUES` — Medium or Low findings only (PM Desirable items count as Medium)
- `PASS` — no findings across all agents
```

---

**Change 3 — Add PM Categories row to the dashboard display in Step 5 "4. Show the dashboard"**

Find the Severity block inside the dashboard template:
```
Severity
  🔴 Critical: N    🟠 High: N
  🟡 Medium: N      🟢 Low: N
```

Replace with:
```
Severity
  🔴 Critical: N    🟠 High: N
  🟡 Medium: N      🟢 Low: N

PM Categories
  ⚠  Needed: N (→ NEEDS_FIXES if > 0)    📋 Desirable: N    🔴 Hard: N
```

#### Acceptance Criteria

- [ ] `team-review/SKILL.md` Step 5 severity aggregate list includes the `product-manager` mapping line
- [ ] Step 5 verdict rules include the parenthetical clarifications for Needed → High and Desirable → Medium
- [ ] The dashboard template shows a `PM Categories` row beneath the `Severity` row
- [ ] `Hard` items are documented as informational (not counted toward severity totals)

---

## Execution Log

### Task 1: Add PM category mapping to severity aggregate and verdict logic
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-18 06:37 UTC
- **Completed:** 2026-03-18 06:38 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - .claude/skills/team-review/SKILL.md (3 changes: severity mapping, verdict rules, dashboard PM row)
- **Files deleted:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Severity aggregate list includes the `product-manager` mapping line
  - [x] Verdict rules include parenthetical clarifications (Needed → High, Desirable → Medium)
  - [x] Dashboard template shows a `PM Categories` row beneath `Severity`
  - [x] Hard items documented as informational (not counted toward severity totals)
