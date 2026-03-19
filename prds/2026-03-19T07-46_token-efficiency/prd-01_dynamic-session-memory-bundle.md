# PRD-01: Dynamic Session Memory Bundle

Created: 2026-03-19 07:46 UTC
Status: PENDING
Depends on: None
Complexity: Medium

## Objective

Change the session memory bundle from always pre-fetching all 6 agent memories to only pre-fetching memories for agents that will actively participate in the current run.

## Context

Currently every orchestrating skill (`/execute`, `/team-review`, `/team-research`) calls `search_nodes` for all 6 agents and embeds all 6 memory sections in every agent's prompt. In most `/execute` runs no specialists are active, making all 6 sections unused overhead. The bundle is sent to 6–8 agents per run, multiplying the waste. This PRD defers the memory pre-fetch to after the active agent list is known and limits it to only the agents that will actually run.

---

## Tasks

### Task 1: Update session-memory-schema.md — dynamic bundle format

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/rules/session-memory-schema.md

**Replace the `## Pre-fetched Agent Memories` block in the Bundle Format section** (the block starting at `## Pre-fetched Agent Memories` and ending before `## Phase Context`):

```
// Before:
## Pre-fetched Agent Memories
### product-manager — past decisions on this topic
<search_nodes results, or "None" if no results or MCP UNAVAILABLE>

### security-expert — past findings on this topic
<search_nodes results, or "None">

### dba-expert — past findings on this topic
<search_nodes results, or "None">

### devops-engineer — past production notes on this topic
<search_nodes results, or "None">

### qa-automation — past coverage findings on this topic
<search_nodes results, or "None">

### penetration-agent — past attack vectors on this topic
<search_nodes results, or "None">

// After:
## Pre-fetched Agent Memories
<One section per active agent only. Omit this entire section if no agents are active or MCP is UNAVAILABLE.>

### <agent-name> — <relevant label for this agent>
<search_nodes results, or "None" if no results>
```

**Replace Assembly Step 3** (the line starting with `3. **Pre-fetch memories**`):

```
// Before:
3. **Pre-fetch memories** (only if AVAILABLE) — Call `search_nodes` once per agent with the current topic name (the `Feature:` field value from current-topic.md). Agents: `product-manager`, `security-expert`, `dba-expert`, `devops-engineer`, `qa-automation`, `penetration-agent`.

// After:
3. **Pre-fetch memories** (only if AVAILABLE) — Call `search_nodes` only for agents actively participating in this run. Use the `Feature:` field value from current-topic.md as the query. Active agent set depends on the triggering skill:
   - `/execute`: agents listed as `Recommended agent:` in PRD task files — determined after Step 1 discovery. Skip pre-fetch if none.
   - `/team-review`: `product-manager` (always) + specialists confirmed by engineer in Step 2b — done after Step 2b, not at run start.
   - `/team-research`: specialist agents included in this research round from Step 1 — done after Step 1. Skip if only general Explore agents.
   - Specialist review skills (`/pm-review`, `/qa-review`, etc.): the single agent for that skill only.
   Omit the `## Pre-fetched Agent Memories` section entirely if no agents are active.
```

#### Acceptance Criteria

- [ ] Bundle format shows a single generic `### <agent-name>` section (not 6 fixed sections)
- [ ] Assembly Step 3 references "active agents" not a fixed list of 6
- [ ] The note about omitting the section when no agents are active is present
- [ ] File still has all other sections intact (Run Info, Current Topic, MCP Status, Phase Context Variants, Assembly Steps 1-2 and 4-6, Run ID Format)

---

### Task 2: Update execute/SKILL.md — defer memory pre-fetch to after Step 1

**Status:** PENDING
**Complexity:** Medium
**Depends on:** Task 1

#### File Changes

##### MODIFY: .claude/skills/execute/SKILL.md

**Replace Step 0 sub-steps 3 and 4** (inside `### Step 0: Build Session Memory Bundle`):

```
// Before (sub-steps 3 and 4):
**3. Pre-fetch agent memories** (if AVAILABLE) — Call `search_nodes` for each of the 6 agent names with the current topic name.

**4. Assemble and save bundle** — Follow the bundle schema in `.claude/rules/session-memory-schema.md`. Use the **Execution Context** phase variant. Set `Triggered by: /execute` and `Phase: EXECUTION`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format for the run ID.

// After (sub-steps 3 and 4):
**3. Skip memory pre-fetch for now** — The active agent list is determined in Step 1 (Discovery) by reading PRD files. Memory pre-fetch is deferred to Step 1b after discovery completes.

**4. Assemble partial bundle** — Build Run Info + Current Topic snapshot + MCP Status only. Leave out `## Pre-fetched Agent Memories` for now. Do not save yet — the bundle is finalized in Step 1b.
```

**Add new Step 1b** (insert after the existing `### Step 1: Discovery and Validation` section, before `### Step 2: Present Execution Plan`):

```
### Step 1b: Finalize Session Memory Bundle

Now that PRD files have been read in Step 1, collect the active agents list:
1. Scan all PRD task files for `Recommended agent:` fields
2. Collect unique values, excluding `general-purpose`
3. If the active list is empty (all tasks use `general-purpose`): finalize the bundle without a `## Pre-fetched Agent Memories` section
4. If the list is non-empty and MCP is AVAILABLE: call `search_nodes(<agent-name>, <topic>)` for each active agent; add results to the bundle as `## Pre-fetched Agent Memories` with one section per agent
5. Save the finalized bundle to `.claude/context/run-log/<run-id>.md`
```

**Update Step 0 sub-step 5** (currently says "Pass inline"):
No change needed — sub-step 5 still applies; agents receive the finalized bundle assembled in Step 1b.

#### Acceptance Criteria

- [ ] Step 0 sub-step 3 no longer calls `search_nodes` for 6 agents
- [ ] Step 1b is present between Step 1 and Step 2
- [ ] Step 1b describes scanning PRD files for `Recommended agent:` fields
- [ ] Step 1b describes the empty-list case (no memory section in bundle)
- [ ] All original Step 0 sub-steps 1, 2, 5 are unchanged
- [ ] All original Step 1 content is unchanged

---

### Task 3: Update team-review/SKILL.md — defer memory pre-fetch to after Step 2b

**Status:** PENDING
**Complexity:** Medium
**Depends on:** Task 1

#### File Changes

##### MODIFY: .claude/skills/team-review/SKILL.md

**Replace Step 0 sub-steps 3, 4, and 5** (inside `### Step 0: Build Session Memory Bundle`):

```
// Before (sub-steps 3, 4, 5):
**3. Pre-fetch agent memories** (only if MCP is AVAILABLE)
Call `search_nodes` once per agent with the current topic name (the value of the `Feature:` field in current-topic.md):
- `search_nodes("product-manager", <topic>)`
- `search_nodes("security-expert", <topic>)`
- `search_nodes("dba-expert", <topic>)`
- `search_nodes("devops-engineer", <topic>)`
- `search_nodes("qa-automation", <topic>)`
- `search_nodes("penetration-agent", <topic>)`

**4. Assemble the bundle**
Follow the bundle schema defined in `.claude/rules/session-memory-schema.md`. Use the **Execution Context** phase variant (this is a `/team-review` run). Fill in all values from steps 1-3 above.

**5. Save the bundle**
Write the assembled bundle to `.claude/context/run-log/<run-id>.md` (e.g. `2026-03-17T14-22-05.md`). Use seconds in the run ID (`YYYY-MM-DDTHH-MM-SS`) to prevent collisions when two sessions start in the same minute.

// After (sub-steps 3, 4, 5):
**3. Skip memory pre-fetch for now** — The specialist list is confirmed by the engineer in Step 2b. Memory pre-fetch is deferred to Step 2c after specialist selection.

**4. Assemble partial bundle** — Build Run Info + Current Topic snapshot + MCP Status only. Leave out `## Pre-fetched Agent Memories`. Do not save yet — the bundle is finalized in Step 2c.

**5. Placeholder save** — Write the partial bundle to `.claude/context/run-log/<run-id>.md`. It will be overwritten with the finalized version in Step 2c.
```

**Add new Step 2c** (insert after `### Step 2b: Auto-Select Specialist Agents` and the engineer confirmation, before `### Step 3: PM Synthesis`):

```
### Step 2c: Finalize Session Memory Bundle

Now that the specialist list is confirmed by the engineer, pre-fetch memories for the active agents:
1. Active agents = `product-manager` (always included — PM always synthesizes) + all confirmed specialists from Step 2b
2. If MCP is AVAILABLE: call `search_nodes(<agent-name>, <topic>)` for each active agent
3. Add `## Pre-fetched Agent Memories` section to the bundle with one section per active agent
4. Overwrite the partial bundle at `.claude/context/run-log/<run-id>.md` with the finalized version

All review agents launched in Step 2 and Step 3 receive this finalized bundle.
```

#### Acceptance Criteria

- [ ] Step 0 sub-step 3 no longer calls `search_nodes` for 6 agents
- [ ] Step 0 sub-step 4 describes assembling a partial bundle (no memories yet)
- [ ] Step 2c is present between Step 2b and Step 3
- [ ] Step 2c always includes `product-manager` in the active agents list
- [ ] Step 2c overwrites the partial bundle saved in Step 0
- [ ] All original Step 0 sub-steps 1, 2, 6 are unchanged
- [ ] All original Step 2b content is unchanged

---

### Task 4: Update team-research/SKILL.md — defer memory pre-fetch to after Step 1

**Status:** PENDING
**Complexity:** Low
**Depends on:** Task 1

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Replace Step 0 sub-step 3** (inside `### Step 0: Build Session Memory Bundle`, the line starting with `**3. Pre-fetch agent memories**`):

```
// Before:
**3. Pre-fetch agent memories** (if AVAILABLE) — Call `search_nodes` for each of the 6 agent names with the current topic name.

// After:
**3. Skip memory pre-fetch for now** — The specialist list (if any) is determined in Step 1 when research questions are defined. Memory pre-fetch is deferred to Step 1b after questions are approved.
```

**Replace Step 0 sub-step 4** (the line starting with `**4. Assemble and save bundle**`):

```
// Before:
**4. Assemble and save bundle** — Follow the bundle schema in `.claude/rules/session-memory-schema.md`. Use the **Research Context** phase variant (not Execution Context). Set `Triggered by: /team-research during /plan` and `Phase: RESEARCH`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format for the run ID.

// After:
**4. Assemble partial bundle** — Build Run Info + Current Topic + MCP Status. Use the **Research Context** phase variant. Set `Triggered by: /team-research during /plan` and `Phase: RESEARCH`. Leave out `## Pre-fetched Agent Memories`. Do not save yet.
```

**Add new Step 1b** (insert after `### Step 1: Define Research Questions` and engineer approval, before `### Step 2: Launch Research Agents`):

```
### Step 1b: Finalize Session Memory Bundle

Based on the approved research questions from Step 1:
1. Identify any specialist agents included in the research round (from the "Specialist Agents in Research" section)
2. If no specialists are included (all general Explore agents): finalize the bundle without a `## Pre-fetched Agent Memories` section
3. If specialists are included and MCP is AVAILABLE: call `search_nodes(<agent-name>, <topic>)` for each specialist; add `## Pre-fetched Agent Memories` with one section per specialist
4. Save the finalized bundle to `.claude/context/run-log/<run-id>.md`
```

#### Acceptance Criteria

- [ ] Step 0 sub-step 3 no longer calls `search_nodes` for 6 agents
- [ ] Step 0 sub-step 4 describes assembling a partial bundle
- [ ] Step 1b is present between Step 1 and Step 2
- [ ] Step 1b describes the no-specialist case (bundle has no memory section)
- [ ] All original Step 0 sub-steps 1, 2, 5 are unchanged
- [ ] All original Step 1 content is unchanged

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->
