# PRD-01: Session Memory Builder

Created: 2026-03-17 14:30 UTC
Status: COMPLETED
Depends on: None
Complexity: Medium

## Objective

Add a "Step 0: Build Session Memory Bundle" to the three orchestrating skills (`/team-review`, `/team-research`, `/execute`) that assembles context once per run and passes it inline to all agents. Update all 6 agent files to read from the bundle instead of self-fetching.

## Context

Today each agent independently reads `current-topic.md` and calls `search_nodes`. This is inconsistent and unobservable — agents may silently operate with stale or missing context. This PRD introduces a single assembly step that runs before any agents launch, producing a shared bundle that all agents receive. Agents stop fetching their own context.

## Tasks

---

### Task 1: Create run-log directory

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: .claude/context/run-log/.gitkeep

Empty file. Its only purpose is to create the `run-log/` directory in git so the directory exists in every cloned copy of this repo.

#### Acceptance Criteria
- [ ] File `.claude/context/run-log/.gitkeep` exists (empty)
- [ ] Directory `.claude/context/run-log/` is visible in git

---

### Task 2: Add Step 0 to team-review/SKILL.md

**Status:** PENDING
**Complexity:** Medium

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Add new section** (after the "## How It Works" heading, before the existing "### Step 1: Read PRD Execution Logs"):

```markdown
### Step 0: Build Session Memory Bundle

Before launching any agents, assemble the shared context bundle. This runs once — all agents in this review session receive the same bundle.

**1. Read current topic**
Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before reviewing."

**2. Check MCP availability**
Attempt to call `search_nodes` with query `"mcp-health-check"`. If the tool responds (even with no results): MCP Status = `AVAILABLE`. If the tool is not found or errors: MCP Status = `UNAVAILABLE`.

**3. Pre-fetch agent memories** (only if MCP is AVAILABLE)
Call `search_nodes` once per agent with the current topic name (the value of the `Feature:` field in current-topic.md):
- `search_nodes("product-manager", <topic>)`
- `search_nodes("security-expert", <topic>)`
- `search_nodes("dba-expert", <topic>)`
- `search_nodes("devops-engineer", <topic>)`
- `search_nodes("qa-automation", <topic>)`
- `search_nodes("penetration-agent", <topic>)`

**4. Assemble the bundle**
Create the following Markdown document (fill in actual values):

```markdown
# Session Memory — <run-id>

## Run Info
- Run ID: YYYY-MM-DDTHH-MM
- Triggered by: /team-review
- Phase: REVIEW
- PRD directory: prds/<dir>/

## Current Topic (snapshot at run time)
<verbatim content of .claude/context/current-topic.md>

## MCP Status
- Server: AVAILABLE | UNAVAILABLE
- Memory file: .claude/memory/agent-memory.json
- Note: <if UNAVAILABLE: "All agents proceed without past memory this session">

## Pre-fetched Agent Memories
### product-manager — past decisions on this topic
<search_nodes results or "None">

### security-expert — past findings on this topic
<search_nodes results or "None">

### dba-expert — past findings on this topic
<search_nodes results or "None">

### devops-engineer — past production notes on this topic
<search_nodes results or "None">

### qa-automation — past coverage findings on this topic
<search_nodes results or "None">

### penetration-agent — past attack vectors on this topic
<search_nodes results or "None">

## Execution Context
- Tasks completed: X/Y (from PRD execution logs)
- Files changed: <list of files from execution logs>
```

**5. Save the bundle**
Write the assembled bundle to `.claude/context/run-log/<run-id>.md` (e.g. `2026-03-17T14-22.md`).

**6. Pass inline to all agents**
Include the full bundle text in every agent prompt for this run under a `## Session Memory` section. Agents do NOT read `current-topic.md` themselves or call `search_nodes` — all context is already in the bundle.
```

**Renumber existing steps** (after the insertion, all existing step numbers shift by 1):
- "### Step 1: Read PRD Execution Logs" stays Step 1 (no renumbering needed — Step 0 is a new prefix)

**Update the specialist agent invocation example** (in the current "Step 2b: Optional Specialist Agents" section). Replace the example launch prompt:

Before:
```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

Current topic context:
<contents of .claude/context/current-topic.md>

Review target: <PRD directory>

Complete all steps in your agent instructions including memory load, review, and memory store.
```

After:
```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

Review target: <PRD directory>

Complete all steps in your agent instructions. Your context is in the Session Memory section above — do NOT independently read current-topic.md or call search_nodes.
```

**Update the PM synthesis invocation** (in "### Step 3: PM Synthesis"). Replace the current launch prompt opening:

Before:
```
You are the product manager agent. Follow the instructions in `.claude/agents/product-manager.md`.

Current topic context:
<contents of .claude/context/current-topic.md>
```

After:
```
You are the product manager agent. Follow the instructions in `.claude/agents/product-manager.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>
```

#### Acceptance Criteria
- [ ] Step 0 appears in team-review/SKILL.md before Step 1
- [ ] Step 0 specifies: read current-topic.md, check MCP, pre-fetch 6 agent memories, assemble bundle, save to run-log/, pass inline
- [ ] Specialist agent example prompt uses Session Memory bundle instead of inlining current-topic.md directly
- [ ] PM synthesis prompt uses Session Memory bundle

---

### Task 3: Add Step 0 to team-research/SKILL.md

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Add new section** (after "## How It Works", before "### Step 1: Define Research Questions"):

```markdown
### Step 0: Build Session Memory Bundle

Before launching research agents, assemble the shared context bundle.

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim.

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.

**3. Pre-fetch agent memories** (if AVAILABLE) — Call `search_nodes` for each of the 6 agent names with the current topic name.

**4. Assemble and save bundle** — Same schema as in `/team-review` Step 0. Save to `.claude/context/run-log/<run-id>.md`.

**5. Pass inline** — Include the full bundle in every agent prompt under a `## Session Memory` section.
```

**Update the specialist research prompt template** (in "## Specialist Agents in Research"). Replace:

Before:
```
Current topic context:
<contents of .claude/context/current-topic.md>
```

After:
```
## Session Memory
<full contents of the session memory bundle built in Step 0>
```

#### Acceptance Criteria
- [ ] Step 0 appears in team-research/SKILL.md before Step 1
- [ ] Specialist research prompt template uses Session Memory bundle

---

### Task 4: Add Step 0 to execute/SKILL.md

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/execute/SKILL.md

**Add new section** (after "## Execution Flow", before "### Step 1: Discovery and Validation"):

```markdown
### Step 0: Build Session Memory Bundle

Before launching any task agents, assemble the shared context bundle.

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim.

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.

**3. Pre-fetch agent memories** (if AVAILABLE) — Call `search_nodes` for each of the 6 agent names with the current topic name.

**4. Assemble and save bundle** — Same schema as in `/team-review` Step 0. Save to `.claude/context/run-log/<run-id>.md`. Set `Triggered by: /execute` in the Run Info section.

**5. Pass inline** — Include the full bundle in every agent prompt under a `## Session Memory` section. This is in addition to the full task spec (which is still passed inline as before).
```

**Update the agent prompt template** (in "### Step 3: Execute Wave → Task Mode"). Append to the existing template, after `## Rules`:

```markdown
## Session Memory
<full contents of the session memory bundle built in Step 0>
```

#### Acceptance Criteria
- [ ] Step 0 appears in execute/SKILL.md before Step 1
- [ ] Task agent prompt template includes `## Session Memory` section

---

### Task 5: Update agent Step 1 — dba-expert, security-expert, penetration-agent

**Status:** PENDING
**Complexity:** Low
**Depends on:** Tasks 2, 3, 4 (so agents match how orchestrators now deliver context)

#### File Changes

##### MODIFY: .claude/agents/dba-expert.md

**Replace "### Step 1: Load Context"** (lines 12-16) with:

```markdown
### Step 1: Load Context from Session Memory

The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — What the team is working on (Feature, Phase, Decisions, Open Questions)
- **MCP Status** — Whether memory server is available this session
- **Your Past Findings** — Section `### dba-expert — past findings on this topic`
- **Other Agent Findings** — Sections for all other specialists (read these for cross-agent context in Step 3)

How to use:
1. Read **Current Topic** for project context
2. Find `### dba-expert` in Pre-fetched Agent Memories — these are your past findings
3. If MCP Status is `UNAVAILABLE`, note this in your report and proceed without past context
```

**Update "### Step 3: Consult Cross-Agent Context"** — Replace the instruction to call `search_nodes`:

Before:
```
- Use `search_nodes` to check if the security-expert or devops-engineer has flagged anything related to the data layer
```

After:
```
- Read the `### security-expert` and `### devops-engineer` sections in the Session Memory bundle (Pre-fetched Agent Memories) — no additional `search_nodes` calls needed
```

##### MODIFY: .claude/agents/security-expert.md

**Replace "### Step 1: Load Context"** (lines 12-16) with:

```markdown
### Step 1: Load Context from Session Memory

The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — What the team is working on
- **MCP Status** — Whether memory server is available this session
- **Your Past Findings** — Section `### security-expert — past findings on this topic`
- **Other Agent Findings** — All specialists (including `### penetration-agent` for step 4 below)

How to use:
1. Read **Current Topic** for project context
2. Find `### security-expert` in Pre-fetched Agent Memories — your past security state (open vulns, accepted risks)
3. If MCP Status is `UNAVAILABLE`, note this and proceed without past context
4. Read `### penetration-agent` section for any exploitable paths found in past sessions
```

##### MODIFY: .claude/agents/penetration-agent.md

**Replace "### Step 1: Load Context"** (lines 27-31) with:

```markdown
### Step 1: Load Context from Session Memory

The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — What the team is working on
- **MCP Status** — Whether memory server is available this session
- **Your Past Findings** — Section `### penetration-agent — past attack vectors on this topic`
- **Security Expert Findings** — Section `### security-expert` (your starting points)
- **DBA Findings** — Section `### dba-expert` (database issues are often exploitable)

How to use:
1. Read **Current Topic** for project context
2. Find `### penetration-agent` in Pre-fetched Agent Memories — your past attack vectors and their status
3. Read `### security-expert` — these are your primary starting points
4. Read `### dba-expert` — look for database issues with exploit potential
5. If MCP Status is `UNAVAILABLE`, note this and proceed without past context
```

#### Acceptance Criteria
- [ ] `dba-expert.md` Step 1 reads from session memory bundle, not current-topic.md
- [ ] `dba-expert.md` Step 3 reads from bundle instead of calling search_nodes
- [ ] `security-expert.md` Step 1 reads from session memory bundle
- [ ] `penetration-agent.md` Step 1 reads from session memory bundle
- [ ] None of the 3 files call `search_nodes` in Step 1 anymore

---

### Task 6: Update agent Step 1 — product-manager, devops-engineer, qa-automation

**Status:** PENDING
**Complexity:** Low
**Depends on:** Tasks 2, 3, 4

#### File Changes

##### MODIFY: .claude/agents/product-manager.md

**Replace "### Step 1: Load Context"** (lines 13-16) with:

```markdown
### Step 1: Load Context from Session Memory

The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — Feature, Phase, Key Decisions, Open Questions
- **MCP Status** — Whether memory server is available this session
- **Your Past Decisions** — Section `### product-manager — past decisions on this topic`
- **All Agent Findings** — Sections for security-expert, dba-expert, devops-engineer, qa-automation, penetration-agent

How to use:
1. Read **Current Topic** for project context
2. Find `### product-manager` in Pre-fetched Agent Memories — your past decisions and scope calls
3. Read all other agent sections for team consultation (Step 4) — no additional `search_nodes` calls needed
4. If MCP Status is `UNAVAILABLE`, note this and proceed without past context
```

**Update "### Step 4: Consult the Team"** — Replace search_nodes instructions:

Before:
```
- Check what the DBA, DevOps, Security, and QA agents have said about it
- Use `search_nodes` to find relevant findings from other agents
```

After:
```
- Read the `### dba-expert`, `### devops-engineer`, `### security-expert`, and `### qa-automation` sections in the Session Memory bundle (Pre-fetched Agent Memories)
- No additional `search_nodes` calls needed — all agent memories are pre-loaded in the bundle
```

##### MODIFY: .claude/agents/devops-engineer.md

**Replace "### Step 1: Load Context"** (lines 12-16) with:

```markdown
### Step 1: Load Context from Session Memory

The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — What the team is working on
- **MCP Status** — Whether memory server is available this session
- **Your Past Production Notes** — Section `### devops-engineer — past production notes on this topic`
- **Security and DBA Findings** — Sections `### security-expert` and `### dba-expert`

How to use:
1. Read **Current Topic** for project context
2. Find `### devops-engineer` in Pre-fetched Agent Memories — past production notes and risks
3. Read `### security-expert` for infrastructure-related security concerns
4. Read `### dba-expert` for migration-related deployment concerns
5. If MCP Status is `UNAVAILABLE`, note this and proceed without past context
```

##### MODIFY: .claude/agents/qa-automation.md

**Replace "### Step 1: Load Context"** (lines 12-15) with:

```markdown
### Step 1: Load Context from Session Memory

The orchestrating skill has pre-assembled a session memory bundle for this run. Use it directly — do NOT read `.claude/context/current-topic.md` yourself or call `search_nodes`.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — What the team is working on
- **MCP Status** — Whether memory server is available this session
- **Your Past Coverage Findings** — Section `### qa-automation — past coverage findings on this topic`
- **Other Agent Findings** — Read these to find untested risk areas they flagged

How to use:
1. Read **Current Topic** for project context
2. Find `### qa-automation` in Pre-fetched Agent Memories — past coverage gaps and quality notes
3. Read other agent sections — their findings often reveal untested risk areas
4. If MCP Status is `UNAVAILABLE`, note this and proceed without past context
```

#### Acceptance Criteria
- [ ] `product-manager.md` Step 1 reads from session memory bundle
- [ ] `product-manager.md` Step 4 reads from bundle instead of calling search_nodes
- [ ] `devops-engineer.md` Step 1 reads from session memory bundle
- [ ] `qa-automation.md` Step 1 reads from session memory bundle
- [ ] None of the 3 files call `search_nodes` in Step 1 anymore

---

## Execution Log

### Task 1: Create run-log directory
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-18 00:10 UTC
- **Completed:** 2026-03-18 00:10 UTC
- **Status:** COMPLETED
- **Files created:** `.claude/context/run-log/.gitkeep`
- **Issues encountered:** Subagent Write tool blocked by permissions; executed directly

### Task 2: Add Step 0 to team-review/SKILL.md
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Completed:** 2026-03-18 00:15 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/skills/team-review/SKILL.md` (added Step 0, updated specialist prompt, updated PM synthesis prompt)

### Task 3: Add Step 0 to team-research/SKILL.md
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Completed:** 2026-03-18 00:12 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/skills/team-research/SKILL.md` (added Step 0, updated specialist prompt)

### Task 4: Add Step 0 to execute/SKILL.md
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Completed:** 2026-03-18 00:12 UTC
- **Status:** COMPLETED
- **Files modified:** `.claude/skills/execute/SKILL.md` (added Step 0, added Session Memory to agent prompt template)

### Task 5: Update agent Step 1 — dba-expert, security-expert, penetration-agent
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Completed:** 2026-03-18 00:13 UTC
- **Status:** COMPLETED
- **Files modified:**
  - `.claude/agents/dba-expert.md` (replaced Step 1, updated Step 3 cross-agent)
  - `.claude/agents/security-expert.md` (replaced Step 1)
  - `.claude/agents/penetration-agent.md` (replaced Step 1)

### Task 6: Update agent Step 1 — product-manager, devops-engineer, qa-automation
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Completed:** 2026-03-18 00:16 UTC
- **Status:** COMPLETED
- **Files modified:**
  - `.claude/agents/product-manager.md` (replaced Step 1, updated Step 4 cross-agent)
  - `.claude/agents/devops-engineer.md` (replaced Step 1)
  - `.claude/agents/qa-automation.md` (replaced Step 1)
