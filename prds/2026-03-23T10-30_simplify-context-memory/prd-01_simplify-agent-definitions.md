# PRD-01: Simplify Agent Definitions

Created: 2026-03-23 10:30 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Remove MCP memory write instructions from all 6 specialist agents, and replace the PM's MCP-based backlog read with a direct `backlog.md` read.

## Context

All 6 agent definition files currently instruct agents to call `add_observations`, `create_entities`, or `create_relations` at the end of their work. In practice, only PM ever ran and wrote anything. The other 5 have zero entries in `agent-memory.json`. The PM's memory is fully redundant with `backlog.md`. Removing MCP from agents eliminates dead instructions and makes agent behavior simpler and more predictable.

## Tasks

---

### Task 1: Remove MCP from security-expert

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/agents/security-expert.md`

**Replace Step 1** (the full "### Step 1: Load Context from Session Memory" section):

Old:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### security-expert` in Pre-fetched Agent Memories — your past findings (open vulns, accepted risks)
3. Read `### penetration-agent` section for exploitable paths found in past sessions
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

New:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Read the `### penetration-agent` section in Session Memory for exploitable paths found in this session
```

**Remove Step 4 entirely** (the "### Step 4: Update Security State" section including the `add_observations` code block).

**In the Report Format block**, remove the "Current Security State (from memory)" section:

Old:
```markdown
### Current Security State (from memory)
Open vulnerabilities carried forward:
- <previous open items>

### New Findings
```

New:
```markdown
### Findings
```

#### Acceptance Criteria
- [ ] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
- [ ] No `add_observations` call exists in the file
- [ ] Report Format no longer has "Current Security State (from memory)" section

---

### Task 2: Remove MCP from devops-engineer

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/agents/devops-engineer.md`

**Replace Step 1**:

Old:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### devops-engineer` in Pre-fetched Agent Memories — your past production notes on this topic
3. Read other agent sections for cross-domain context
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

New:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Read other agent sections in Session Memory for cross-domain context
```

**Remove Step 4 entirely** (the "### Step 4: Store Production Notes" section including the `add_observations` code block).

**In the Report Format block**, remove the "Past Production Notes Retrieved" section:

Old:
```markdown
### Past Production Notes Retrieved
<relevant memories, or "None">

### Deployment Safety
```

New:
```markdown
### Deployment Safety
```

#### Acceptance Criteria
- [ ] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
- [ ] No `add_observations` call exists in the file
- [ ] Report Format no longer has "Past Production Notes Retrieved" section

---

### Task 3: Remove MCP from qa-automation

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/agents/qa-automation.md`

**Replace Step 1**:

Old:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### qa-automation` in Pre-fetched Agent Memories — past coverage gaps and quality notes
3. Read other agent sections — their findings reveal untested risk areas
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

New:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Read other agent sections in Session Memory — their findings reveal untested risk areas
```

**Remove Step 4 entirely** (the "### Step 4: Store Findings" section including the `add_observations` code block).

**In the Report Format block**, remove the "Past Coverage Findings Retrieved" section:

Old:
```markdown
### Past Coverage Findings Retrieved
<previous gaps or quality notes, or "None">

### Coverage Span Assessment
```

New:
```markdown
### Coverage Span Assessment
```

#### Acceptance Criteria
- [ ] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
- [ ] No `add_observations` call exists in the file
- [ ] Report Format no longer has "Past Coverage Findings Retrieved" section

---

### Task 4: Remove MCP from dba-expert

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/agents/dba-expert.md`

**Replace Step 1**:

Old:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### dba-expert` in Pre-fetched Agent Memories — your past findings on this topic
3. Read other agent sections for cross-domain context
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

New:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Read other agent sections in Session Memory for cross-domain context
```

**Replace Step 3** (currently "Consult Cross-Agent Context"):

Old:
```markdown
### Step 3: Consult Cross-Agent Context
- Read the `### security-expert` and `### devops-engineer` sections in the Session Memory bundle (Pre-fetched Agent Memories) — no additional `search_nodes` calls needed
- Note conflicts or alignment points
```

New:
```markdown
### Step 3: Consult Cross-Agent Context
- Read the `### security-expert` and `### devops-engineer` sections in Session Memory if present
- Note conflicts or alignment points
```

**Remove Step 4 entirely** (the "### Step 4: Store Your Findings" section including `add_observations`, `create_entities`, and `create_relations` code blocks — lines starting from "### Step 4" through the final closing ``` of `create_relations`).

**In the Report Format block**, remove the "Past Context Retrieved" section:

Old:
```markdown
### Past Context Retrieved
<relevant memories from previous sessions, or "None">

### Findings
```

New:
```markdown
### Findings
```

#### Acceptance Criteria
- [ ] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
- [ ] No `add_observations`, `create_entities`, or `create_relations` calls exist in the file
- [ ] Step 3 has no `search_nodes` reference
- [ ] Report Format no longer has "Past Context Retrieved" section

---

### Task 5: Remove MCP from penetration-agent

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/agents/penetration-agent.md`

**Replace Step 1**:

Old:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### penetration-agent` in Pre-fetched Agent Memories — your past attack vectors on this topic
3. Read `### security-expert` section — their findings are your primary starting points
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

New:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Read `### security-expert` section in Session Memory — their findings are your primary starting points
```

**Replace Step 3** ("### Step 3: Report and Store") — remove the MCP write blocks, keep just the heading:

Old:
```markdown
### Step 3: Report and Store
Store all attack vectors found:
```
add_observations({
  entityName: "penetration-agent",
  observations: [
    "[<topic>] ATTACK VECTOR: <type> at <location> — <severity> — <exploit path> (date: <today>)"
  ]
})
```

Also create a relation to the security-expert so they can track it:
```
create_relations([{
  from: "penetration-agent",
  to: "security-expert",
  relationType: "reported-finding"
}])
```
```

New:
```markdown
### Step 3: Report
Format your findings using the report format below. All attack vectors should be included in your written report — the security-expert will track remediation.
```

**In the Report Format block**, remove the "Past Findings Retrieved" section:

Old:
```markdown
### Past Findings Retrieved
<previously found vectors, remediation status>

### Attack Vectors Found
```

New:
```markdown
### Attack Vectors Found
```

#### Acceptance Criteria
- [ ] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
- [ ] No `add_observations` or `create_relations` calls exist in the file
- [ ] Report Format no longer has "Past Findings Retrieved" section

---

### Task 6: Update product-manager — read backlog.md directly, remove MCP writes

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: `.claude/agents/product-manager.md`

**Replace Step 1**:

Old:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### product-manager` in Pre-fetched Agent Memories — your past decisions and scope calls
3. Read all other agent sections for team consultation (Step 4) — no additional `search_nodes` calls needed
4. If MCP Status is `UNAVAILABLE`, proceed without past context
5. **Retrieve carried-forward backlog** — In the `### product-manager` section of the Session Memory bundle, find all observations containing `BACKLOG:`. Separate them by status:
   - Lines containing `status=OPEN` → Open items
   - Lines containing `status=DEFERRED` → Deferred items
   - Cross-reference with `BACKLOG_UPDATE:` lines to apply status overrides. Process observations in order — later `BACKLOG_UPDATE:` entries override earlier `BACKLOG:` status.

   **Example:** Given these observations in the bundle:
   ```
   [MyFeature] BACKLOG: id=BLG-001 | title='Fix auth bug' | status=OPEN | ...
   [MyFeature] BACKLOG: id=BLG-002 | title='Add retry logic' | status=OPEN | ...
   [MyFeature] BACKLOG_UPDATE: id=BLG-001 | status=RESOLVED | resolved=2026-03-18 | resolved_by=prd-02
   [MyFeature] BACKLOG_UPDATE: id=BLG-002 | status=DEFERRED | reason=not a blocker
   ```
   Result: BLG-001 is RESOLVED (skip from Open list), BLG-002 is DEFERRED (move to Deferred list).

   Show these at the top of your report under "Carried-Forward Backlog Items" before any new findings.
```

New:
```markdown
### Step 1: Load Context from Session Memory

Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context — find the `Active PRD:` field to locate the PRD directory
2. Read all other agent sections in Session Memory for team consultation (Step 4)
3. **Retrieve carried-forward backlog** — Read `prds/<active-prd-dir>/backlog.md` directly (use the Active PRD directory from Current Topic). If the file does not exist, start with an empty backlog.
   - Parse Open items (lines with `OPEN`)
   - Parse Deferred items (lines with `DEFERRED`)
   - Parse Resolved items (lines with `RESOLVED`) — show count only, not full list

   Show Open and Deferred items at the top of your report under "Carried-Forward Backlog Items" before any new findings.
```

**Replace Step 5** ("### Step 5: Create Backlog Items and Store Decisions") — remove `add_observations` calls, keep only the BACKLOG_OUTPUT instruction:

Old content of Step 5 (full section with `add_observations` code blocks):
```markdown
### Step 5: Create Backlog Items and Store Decisions

**Assign IDs** — Find the highest existing `BLG-NNN` ID in the Session Memory bundle. New items start at the next number. If no existing items: start at BLG-001.

**For each finding in your synthesis** (Needed Improvements, Desirable Additions, Hard Addons), store a BACKLOG observation and a DECISION:

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

**For any previously-open items now resolved** (fixed in this review session's execution), store a BACKLOG_UPDATE:

```
add_observations({
  entityName: "product-manager",
  observations: [
    "[<topic>] BACKLOG_UPDATE: id=BLG-XXX | status=RESOLVED | resolved=<today> | resolved_by=this-review-session"
  ]
})
```

**Return the structured backlog list** at the end of your synthesis output under a `BACKLOG_OUTPUT:` section. The orchestrating skill will write this to `backlog.md`. Format:

```
BACKLOG_OUTPUT:
- BLG-001 [Needed] OPEN — <title> — flagged by <agent> on <today>
- BLG-002 [Desirable] OPEN — <title> — flagged by <agent> on <today>
- BLG-003 [Hard] OPEN — <title> — flagged by <agent> on <today>
- BLG-XXX [Needed] RESOLVED — <title> — resolved <today>
```
```

New content of Step 5:
```markdown
### Step 5: Create Backlog Items

**Assign IDs** — Find the highest existing `BLG-NNN` ID in the backlog you read in Step 1. New items start at the next number. If no existing items: start at BLG-001.

**Return the structured backlog list** at the end of your synthesis output under a `BACKLOG_OUTPUT:` section. The orchestrating skill will write this to `backlog.md`. Format:

```
BACKLOG_OUTPUT:
- BLG-001 [Needed] OPEN — <title> — flagged by <agent> on <today>
- BLG-002 [Desirable] OPEN — <title> — flagged by <agent> on <today>
- BLG-003 [Hard] OPEN — <title> — flagged by <agent> on <today>
- BLG-XXX [Needed] RESOLVED — <title> — resolved <today>
```
```

#### Acceptance Criteria
- [ ] Step 1 reads `backlog.md` directly — no references to Pre-fetched Agent Memories or MCP
- [ ] No `add_observations` calls exist in the file
- [ ] Step 5 only contains BACKLOG_OUTPUT instructions
- [ ] Step 4 "Consult the Team" still reads from Session Memory agent sections (no change needed there)

---

## Execution Log

### Task 1: Remove MCP from security-expert
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/agents/security-expert.md` (simplified Step 1, removed Step 4 add_observations, renamed New Findings section)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
  - [x] No `add_observations` call exists in the file
  - [x] Report Format no longer has "Current Security State (from memory)" section

### Task 2: Remove MCP from devops-engineer
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/agents/devops-engineer.md` (simplified Step 1, removed Step 4 add_observations, removed Past Production Notes section)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
  - [x] No `add_observations` call exists in the file
  - [x] Report Format no longer has "Past Production Notes Retrieved" section

### Task 3: Remove MCP from qa-automation
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/agents/qa-automation.md` (simplified Step 1, removed Step 4 add_observations, removed Past Coverage Findings section)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
  - [x] No `add_observations` call exists in the file
  - [x] Report Format no longer has "Past Coverage Findings Retrieved" section

### Task 4: Remove MCP from dba-expert
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/agents/dba-expert.md` (simplified Step 1, simplified Step 3, removed Step 4 with all MCP write calls, removed Past Context Retrieved section)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
  - [x] No `add_observations`, `create_entities`, or `create_relations` calls exist in the file
  - [x] Step 3 has no `search_nodes` reference
  - [x] Report Format no longer has "Past Context Retrieved" section

### Task 5: Remove MCP from penetration-agent
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/agents/penetration-agent.md` (simplified Step 1, replaced Step 3 removing MCP write blocks, removed Past Findings Retrieved section)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 1 contains no references to Pre-fetched Agent Memories or MCP Status
  - [x] No `add_observations` or `create_relations` calls exist in the file
  - [x] Report Format no longer has "Past Findings Retrieved" section

### Task 6: Update product-manager — read backlog.md directly, remove MCP writes
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 09:44 UTC
- **Completed:** 2026-03-23 10:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - `.claude/agents/product-manager.md` (replaced Step 1 to read backlog.md directly, replaced Step 5 removing all add_observations blocks)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 1 reads `backlog.md` directly — no references to Pre-fetched Agent Memories or MCP
  - [x] No `add_observations` calls exist in the file
  - [x] Step 5 only contains BACKLOG_OUTPUT instructions
  - [x] Step 4 "Consult the Team" still reads from Session Memory agent sections (no change)
