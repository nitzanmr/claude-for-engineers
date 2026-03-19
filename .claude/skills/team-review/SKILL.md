---
name: team-review
description: Launch parallel code review agents to review execution results against PRD specifications
argument-hint: <prd-directory-name>
allowed-tools: Read, Glob, Grep, Task, Bash, TeamCreate, TaskCreate, TaskList, TaskUpdate, TaskGet, SendMessage
tags: [review, quality, team, parallel]
---

# Team Review Skill

Launch parallel review agents to verify that executed PRD tasks produced correct results. Used after `/execute` or during `/retro`.

## When to Use

- After `/execute` completes to verify all work
- When the engineer wants a thorough review before merging
- During `/retro` for detailed quality analysis
- After partial execution to check what's been done so far

## Execution Modes

### Task Mode (Default)
- Uses the `Task` tool to launch parallel review subagents
- Agents run independently, PM synthesis runs after all agents finish
- Best for: straightforward reviews, small feature PRDs, quick checks

### Swarm Mode
- Uses `TeamCreate` to create a team with a shared task list
- PM synthesis task is created with `addBlockedBy` on all review tasks — starts automatically when all reviews are done
- Agents can consult each other via `SendMessage` when they find cross-domain findings (e.g., code-quality agent spots something security-relevant)
- Live task progress visible via `TaskList`
- Best for: large reviews with many specialists, or when you want visibility into reviewer progress in real time

## How It Works

### Step 0: Build Session Memory Bundle

Before launching any agents, assemble the shared context bundle. This runs once — all agents in this review session receive the same bundle.

**1. Read current topic**
Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before reviewing."

**2. Check MCP availability**
Attempt to call `search_nodes` with query `"mcp-health-check"`. If the tool responds (even with no results): MCP Status = `AVAILABLE`. If the tool is not found or errors: MCP Status = `UNAVAILABLE`.

**3. Assemble partial bundle** — Build the Run Info + Current Topic + MCP Status sections only (no Pre-fetched Agent Memories yet). Set `Triggered by: /team-review` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format. Agent memories will be added in Step 2c after specialist selection is confirmed.

### Step 1: Read PRD Execution Logs

Read all PRD files in the target directory. For each completed task, collect:
- Files that were created
- Files that were modified
- Acceptance criteria
- The original task specification (expected changes)

### Step 2: Assign Review Agents

#### Task Mode

Launch parallel review agents using the `Task` tool with `subagent_type: "Explore"` or `"general-purpose"`, each focused on one aspect:

**Agent 1 - Spec Compliance:**
```
Review whether the executed code matches the PRD task specifications exactly.

For each completed task in the PRD files:
1. Read the task specification (expected file changes)
2. Read the actual files that were created/modified
3. Compare: does the actual code match what was specified?
4. Check: were all acceptance criteria met?
5. Flag: any deviation from spec (additions, omissions, differences)

Report format per task:
- Task: <name>
- Spec match: EXACT | MINOR_DEVIATION | MAJOR_DEVIATION
- Deviations: <list specific differences>
- Acceptance criteria: <which passed, which failed>
```

**Agent 2 - Code Quality:**
```
Review the code quality of all files created or modified during PRD execution.

For each file:
1. Check for common issues:
   - TypeScript errors or type safety issues
   - Missing error handling
   - Unused imports or variables
   - Code style violations
2. Check consistency with project patterns
3. Flag any anti-patterns or potential bugs

Report format:
- File: <path>
- Issues found: <list>
- Severity: LOW | MEDIUM | HIGH
```

**Agent 3 - Integration (optional, for multi-PRD executions):**
```
Review how the executed code integrates across PRD boundaries.

Check:
1. Import chains work correctly across new files
2. Type definitions are consistent
3. State flows correctly between components
4. No circular dependencies introduced
5. All integration points from PRD specs are wired correctly
6. **Consumer completeness:** For every field, type, or interface that was changed,
   grep the ENTIRE codebase for all usages. Verify that every consumer was updated.
   This includes controllers, services, jobs, utilities, admin code, and scripts —
   not just the files listed in the PRDs. Report any call sites still using the
   old field name, old type, or old access pattern.
7. **Index/constraint consistency:** For every model that was modified, verify that
   model indexes and database constraints reference the correct (new) column names.

Report: list any integration gaps, missed consumers, or stale references.
```

#### Swarm Mode

1. **Create team:** `TeamCreate` with name `review-<run-id>` (use the run ID from Step 0)
2. **Create review tasks:** `TaskCreate` one task per review agent (spec-compliance, code-quality, and any auto-selected specialists from Step 2b). Use the agent prompts above as the task description.
3. **Create PM synthesis task:** `TaskCreate` with name `pm-synthesis`, description containing the full PM synthesis prompt from Step 3. Set `addBlockedBy` to all review task IDs created in step 2 — PM does not start until every review task is DONE.
4. **Spawn agents:** Launch review agents using the `Task` tool with `team_name: "review-<run-id>"`. Launch all review agents simultaneously. Also launch the PM agent with `team_name` — it will wait on its blocked task automatically.
5. **Assign tasks:** `TaskUpdate` each review task with the corresponding agent as `owner`
6. **Monitor:** Track progress via `TaskList`. When `pm-synthesis` status transitions to `IN_PROGRESS`, all review tasks have completed.
7. **Collect results:** After `pm-synthesis` is DONE, read all task outputs and proceed to Step 4 (write review.md, backlog.md, show dashboard) — same as task mode.

**Swarm mode agent prompt addition** — append this to every review agent's prompt when in swarm mode (NOT to the PM synthesis prompt):

```
## Team Coordination

You are part of a review team. Other specialist agents are reviewing adjacent dimensions simultaneously.

If you find an issue that is clearly in another specialist's domain, send them a message:
- Use `SendMessage` to the relevant teammate
- Example: "Found potential SQL injection in src/api/payments.ts line 42 — flagging for security-expert"
- Example: "PaymentService has no retry logic on API failure — may be relevant to devops-engineer"

Keep messages brief and specific: file path + line/function + why it's relevant to them.
Do NOT wait for replies before completing your own review.
```

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

`penetration-agent` always requires explicit engineer confirmation even when auto-matched.

After engineer confirms the specialist selection, ask:

```
Review with <N> agents: <list agent names>.
  • Task mode  — agents run independently, PM synthesis runs after all finish
  • Swarm mode — agents share a task list and can consult each other via messages;
                 PM synthesis is blocked until all reviews complete; live progress
                 visible via TaskList

Which mode?
```

Wait for confirmation before launching any agents.

### Step 2c: Finalize Session Memory Bundle

Now that the specialist set is confirmed:
1. If MCP is AVAILABLE: call `search_nodes("<agent-name>", <topic>)` for `product-manager` (always) + each confirmed specialist agent.
2. Append `## Pre-fetched Agent Memories` to the saved bundle (one `### <agent-name>` section per active agent).
3. The finalized bundle is ready — include it in every agent prompt for this run under `## Session Memory`.

Example launch prompt for a specialist:
```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

Review target: <PRD directory>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

### Step 3: PM Synthesis (Always Run)

After all review agents (standard + any specialists) have reported, **always** invoke the PM agent to synthesize findings into a prioritized improvement plan.

Collect all agent reports into a single input, then launch a `general-purpose` agent:

```
You are the product manager agent. Follow the instructions in `.claude/agents/product-manager.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

## Your task: synthesize the review findings below into a prioritized improvement plan.

All agent reports from this review session:
<paste all reports from Step 2 agents here — spec compliance, code quality, integration, and any specialists>

For each finding across all reports:
1. Categorize as: Needed Improvement | Desirable Addition | Hard Addon
2. Sequence work in the right order (respect dependencies)
3. Identify what should be done NOW vs deferred vs optional polish
4. Note cross-agent patterns (e.g., security and devops both flagged the same area)
5. Write a clear, actionable improvement plan the engineer can follow

Output format:
## PM Synthesis — <feature name>

### Needed Improvements (do before merge/deploy)
- [ ] <item> — <why + which agent flagged it>

### Desirable Additions (do soon, not blocking)
- [ ] <item> — <rationale>

### Hard Addons (separate planning session needed)
- [ ] <item> — <why it's expensive>

### Cross-Agent Patterns
<findings that multiple agents flagged — these are the highest-signal issues>

### Improvement Plan (sequenced)
1. <first thing to fix, with dependency rationale>
2. <next>
...
```

Store PM decisions in memory as usual before completing.

### Step 4: Write Review and Backlog to Files

**4a. Write review.md**

Append the full review to `prds/<dir>/review.md`:

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

**Sessions block (multi-run tracking):**
- If `backlog.md` does not yet exist: write a fresh `## Sessions` block with one entry for this run.
- If `backlog.md` already exists: read the existing `## Sessions` block, append a new line for this run, then write the full overwritten file with the updated block preserved.
- Each Sessions entry format: `- <run-id>: introduced BLG-NNN[, BLG-NNN...][, resolved BLG-NNN...]`
- List every new BLG ID introduced this run under `introduced`. List every BLG ID resolved this run under `resolved` (omit the `resolved` part if none).

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

If no backlog items exist in the PM output, write an empty backlog.md with "No items yet."

### Step 5: Present Review Dashboard

Show the engineer a structured dashboard in the conversation. Full details are in `review.md` and `backlog.md`.

**1. Compute severity aggregate**

Scan all agent reports collected before Step 3. Count findings by severity using these mappings:
- security-expert: 🔴 Critical → Critical, 🟠 High → High, 🟡 Medium → Medium
- code-quality agent: HIGH → High, MEDIUM → Medium, LOW → Low
- dba-expert: 🔴 Critical → Critical, 🟡 Warning → Medium
- devops-engineer: 🔴 Blocker → Critical, 🟡 Risk → Medium
- qa-automation: 🔴 Critical gap → High, 🟡 Weak coverage → Medium
- integration agent: gaps → Medium
- spec compliance: MAJOR_DEVIATION → High, MINOR_DEVIATION → Low
- product-manager: Needed items → High, Desirable items → Medium, Hard items → informational (not counted in severity totals)

**2. Determine overall assessment**

- `NEEDS_FIXES` — any Critical or High findings exist (PM Needed items count as High)
- `PASS_WITH_ISSUES` — Medium or Low findings only (PM Desirable items count as Medium)
- `PASS` — no findings across all agents

**3. Update PRD status**

Update the Status field in `master-plan.md` (or the reviewed PRD file):
- NEEDS_FIXES or PASS_WITH_ISSUES → set Status to `REVIEWED_NEEDS_FIXES`
- PASS → set Status to `REVIEWED_PASS`

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

PM Categories
  ⚠  Needed: N (→ NEEDS_FIXES if > 0)    📋 Desirable: N    🔴 Hard: N

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

- Fix Needed items manually, then re-run `/team-review` to clear them
- Update PRD tasks and re-execute the relevant PRD
- Defer an item: run `/pm-backlog <dir>` and mark it deferred
- Accept minor deviations: add a note in `review.md` under the relevant finding

## Review Agents

- All agents are READ-ONLY. They review, they don't fix.
- Use `Explore` or `general-purpose` agent types.
- Each agent focuses on one review dimension.
- 2-3 agents max (spec compliance + code quality + optional integration).

## Integration with Workflow

```
/execute payment-feature
  ↓
  [execution completes]
  ↓
  /team-review payment-feature
  ↓
  [agents review in parallel]
  ↓
  [review summary presented]
  ↓
  [engineer decides on fixes]
  ↓
  /retro payment-feature
```

## Notes

- Review compares actual files against PRD specifications. If the PRD was wrong but code is "good", that's still a deviation to flag.
- Review agents don't have opinions about architecture. They check compliance and quality.
- The review output is appended to `prds/<dir>/review.md` for audit trail.
- If project has a linter, suggest running it as part of review: `npm run lint -- <files>`
- Run `/pm-backlog <dir>` to view or update backlog items between review sessions
- Session memory snapshots are saved to `.claude/context/run-log/` for audit and retro use
