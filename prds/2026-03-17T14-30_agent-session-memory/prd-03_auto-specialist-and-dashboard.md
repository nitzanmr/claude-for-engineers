# PRD-03: Auto-Specialist Selection and Review Dashboard

Created: 2026-03-17 14:30 UTC
Status: COMPLETED
Depends on: PRD-01, PRD-02
Complexity: Medium

## Objective

Replace the manual specialist selection in `/team-review` with rule-based auto-selection that scans PRD content. Add a structured dashboard shown to the engineer after every review — severity aggregate, backlog status, and PRD review status badge.

## Context

Currently the engineer must manually decide which specialist agents to include in a review. There's also no structured summary at the end — the engineer gets PM synthesis but no severity counts, no backlog status, and no way to know at a glance if the PRD is ready to merge. This PRD fixes both gaps.

PRD-03 depends on PRD-01 (session memory bundle must be in team-review before we update step ordering) and PRD-02 (dashboard shows backlog items that are now written by team-review Step 4).

## Tasks

---

### Task 1: Update team-review/SKILL.md — replace Step 2b with auto-selection

**Status:** PENDING
**Complexity:** Medium
**Depends on:** PRD-01 Task 2, PRD-02 Task 2 (all three tasks modify team-review; must run sequentially)

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Replace "### Step 2b: Optional Specialist Agents"** with:

```markdown
### Step 2b: Auto-Select Specialist Agents

Before launching agents, scan the PRD files and execution logs collected in Step 1 for the following keyword patterns. Include the mapped specialist automatically if any match is found.

| Pattern (case-insensitive) | Specialist auto-included |
|----------------------------|--------------------------|
| `schema`, `migration`, `query`, `index`, `sql`, `nosql`, `database`, `orm`, `table`, `column` | `dba-expert` |
| `auth`, `token`, `password`, `permission`, `role`, `encrypt`, `session`, `jwt`, `csrf`, `oauth` | `security-expert` |
| `config`, `deploy`, `service`, `env`, `docker`, `ci`, `infrastructure`, `health`, `runbook`, `secret` | `devops-engineer` |
| `.test.`, `.spec.`, `coverage`, `jest`, `mocha`, `vitest`, `describe(`, `it(` | `qa-automation` |
| `payment`, `pii`, `sensitive`, `credit card`, `ssn`, `personal data` | `penetration-agent` (ask engineer) |

**Show the engineer before launching:**

```
Auto-selected specialists based on PRD content:
  ✓ dba-expert       — matched: "migration", "schema"
  ✓ security-expert  — matched: "auth", "token"
  ✗ devops-engineer  — no config/deploy patterns found
  ✓ qa-automation    — matched: ".test.", "coverage"
  ? penetration-agent — matched: "payment" — adversarial review recommended

Proceed with these specialists? (y / adjust)
```

Wait for engineer confirmation. If "adjust", let them add or remove specialists before continuing.

To include a specialist, launch them with the session memory bundle (same as other agents):

```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

Review target: <PRD directory>

Complete all steps in your agent instructions. Your context is in the Session Memory section above.
```
```

#### Acceptance Criteria
- [ ] Step 2b contains keyword-to-specialist mapping table
- [ ] Step 2b shows auto-selection results to engineer before launching
- [ ] Engineer can confirm or adjust the selection
- [ ] Specialist launch prompt uses session memory bundle (not inline current-topic.md)
- [ ] `penetration-agent` requires explicit engineer confirmation even when auto-matched

---

### Task 2: Update team-review/SKILL.md — replace Step 5 with review dashboard

**Status:** PENDING
**Complexity:** Medium
**Depends on:** Task 1 (same file, must be sequential)

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Replace "### Step 5: Present to Engineer"** with:

```markdown
### Step 5: Present Review Dashboard

Show the engineer a structured dashboard summary in the conversation. This is the primary output — full details are in `review.md` and `backlog.md`.

**1. Compute severity aggregate**

Scan all agent reports collected before Step 3:
- Count findings by severity: Critical (🔴), High (🟠), Medium (🟡), Low (🟢)
- Use these severity mappings:
  - security-expert: 🔴 Critical → Critical, 🟠 High → High, 🟡 Medium → Medium
  - code-quality agent: HIGH → High, MEDIUM → Medium, LOW → Low
  - dba-expert: 🔴 Critical → Critical, 🟡 Warning → Medium
  - devops-engineer: 🔴 Blocker → Critical, 🟡 Risk → Medium
  - qa-automation: 🔴 Critical gap → High, 🟡 Weak coverage → Medium
  - integration agent: integration gaps → Medium
  - spec compliance: MAJOR_DEVIATION → High, MINOR_DEVIATION → Low

**2. Determine overall assessment**

- `NEEDS_FIXES` — any Critical or High findings exist
- `PASS_WITH_ISSUES` — Medium or Low findings only
- `PASS` — no findings across all agents

**3. Update PRD status**

Update the PRD-level Status field in the master-plan.md (or the specific PRD file if a single PRD was reviewed):
- `NEEDS_FIXES` → set Status to `REVIEWED_NEEDS_FIXES`
- `PASS_WITH_ISSUES` → set Status to `REVIEWED_NEEDS_FIXES` (still needs attention)
- `PASS` → set Status to `REVIEWED_PASS`

**4. Show the dashboard**

```
────────────────────────────────────────────────
Review Complete — <feature-name>
Date: YYYY-MM-DD HH:MM UTC
────────────────────────────────────────────────
Specialists run: spec-compliance, code-quality[, + auto-selected names]

Severity
  🔴 Critical: N    🟠 High: N
  🟡 Medium: N      🟢 Low: N

Open Backlog Items (N):
  ⚠  [Needed]    BLG-001 — <title> — <agent>
  ⚠  [Needed]    BLG-002 — <title> — <agent>
  📋 [Desirable] BLG-003 — <title> — <agent>
  🔵 [Deferred]  BLG-004 — <title> — carried from YYYY-MM-DD

Resolved This Session (N):
  ✅ BLG-XXX — <title>

Overall: PASS | PASS_WITH_ISSUES | NEEDS_FIXES
PRD Status updated to: REVIEWED_PASS | REVIEWED_NEEDS_FIXES
────────────────────────────────────────────────
Full report:  prds/<dir>/review.md
Backlog:      prds/<dir>/backlog.md
Session log:  .claude/context/run-log/<run-id>.md
────────────────────────────────────────────────
```

**5. Engineer decides what to fix**

Tell the engineer their options:
- Fix Needed items manually, then re-run `/team-review` to clear them
- Update PRD tasks and re-execute the relevant PRD
- Defer an item: run `/pm-backlog <dir>` and mark it deferred
- Accept minor deviations: add a note in `review.md` under the relevant finding
```

**Also update the "## Notes" section** — add after the existing notes:

```markdown
- Run `/pm-backlog <dir>` to view or update backlog items between review sessions
- Session memory snapshots are saved to `.claude/context/run-log/` for audit and retro use
```

#### Acceptance Criteria
- [ ] Step 5 computes severity aggregate from all agent reports
- [ ] Step 5 maps each agent's severity labels to Critical/High/Medium/Low
- [ ] Step 5 determines overall assessment (PASS/PASS_WITH_ISSUES/NEEDS_FIXES)
- [ ] Step 5 updates master-plan.md PRD status to REVIEWED_PASS or REVIEWED_NEEDS_FIXES
- [ ] Step 5 shows dashboard with severity counts, backlog items (open + resolved this session), overall status, and file paths
- [ ] Dashboard references the session run-log file

---

### Task 3: Update workflow.md — add REVIEWED_PASS and REVIEWED_NEEDS_FIXES status values

**Status:** PENDING
**Complexity:** Low
**Depends on:** Tasks 1, 2 (uses the new status values defined there)

#### File Changes

##### MODIFY: .claude/rules/workflow.md

**Update "### Status Transitions"** — find the PRD status block and extend it:

Before:
```markdown
**PRD:**
```
PENDING → IN_PROGRESS → COMPLETED
                      → PARTIAL (some tasks failed)
                      → BLOCKED (dependency failed)
```
```

After:
```markdown
**PRD:**
```
PENDING → IN_PROGRESS → COMPLETED → REVIEWED_PASS
                                  → REVIEWED_NEEDS_FIXES
                      → PARTIAL (some tasks failed)
                      → BLOCKED (dependency failed)
```
```

**Update "### Phase 4: Review (Optional)"** — replace the "How it works" bullet list to mention auto-selection and dashboard:

Before:
```markdown
How it works:
- Launch parallel review agents (spec compliance + code quality)
- Compare actual files against PRD specifications
- Report deviations, issues, and quality problems
- Engineer decides what to fix
```

After:
```markdown
How it works:
- Build session memory bundle (context snapshot + pre-fetched agent memories)
- Scan PRD content to auto-select specialist agents; show selection to engineer
- Launch parallel review agents (spec compliance + code quality + auto-selected specialists)
- PM synthesizes all findings into prioritized backlog (Needed / Desirable / Hard)
- Write `review.md` (full reports) and `backlog.md` (structured issue list)
- Show review dashboard: severity aggregate, backlog status, PRD status badge
- Engineer decides what to fix (or run `/pm-backlog <dir>` to manage items)
```

#### Acceptance Criteria
- [ ] workflow.md PRD status block includes `REVIEWED_PASS` and `REVIEWED_NEEDS_FIXES` as valid transitions from `COMPLETED`
- [ ] Phase 4 description updated to mention session memory, auto-selection, backlog.md, and dashboard

---

## Execution Log

### Task 1: Update team-review/SKILL.md — auto-selection (Step 2b)
- **Agent:** orchestrator (direct)
- **Completed:** 2026-03-18 00:22 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/skills/team-review/SKILL.md` (replaced Step 2b with keyword-based auto-selection table + engineer confirmation flow)

### Task 2: Update team-review/SKILL.md — dashboard (Step 5)
- **Agent:** orchestrator (direct)
- **Completed:** 2026-03-18 00:23 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/skills/team-review/SKILL.md` (replaced Step 5 with severity aggregate, PRD status update, dashboard format)

### Task 3: Update workflow.md — new status values
- **Agent:** orchestrator (direct)
- **Completed:** 2026-03-18 00:24 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/rules/workflow.md` (added REVIEWED_PASS/REVIEWED_NEEDS_FIXES to PRD status transitions, updated Phase 4 description)
