# PRD-04: Consolidate Review Skills and Agent Boilerplate

Created: 2026-03-19 07:46 UTC
Status: PENDING
Depends on: None
Complexity: Medium

## Objective

Eliminate ~4,800 chars of duplicated session memory assembly code across the 6 specialist review skills, and ~2,400 chars of repeated context-loading boilerplate across the 6 agent files.

## Context

All 6 specialist review skills (`pm-review`, `qa-review`, `security-review`, `devops-review`, `dba-review`, `pentest`) contain a near-identical 30-line Step 2 block for assembling the session memory bundle. The only differences are the agent name (appears in 3 places) and the memory label. This block is repeated verbatim 5 times, and the pentest variant adds one extra `search_nodes` call. Compressing each to ~10 lines eliminates the duplication while preserving the full behavior.

Similarly, all 6 agent files begin with a ~12-line "Step 1: Load Context from Session Memory" intro that explains the session memory bundle mechanism. This explanation is redundant with the bundle itself — the agent has already received the bundle. The intro can be compressed to 5 lines while keeping all the agent-specific instructions.

---

## Tasks

### Task 1: Compress Step 2 in 5 single-agent review skills

**Status:** PENDING
**Complexity:** Medium

Applies to these 5 files (each gets the same treatment):
- `.claude/skills/pm-review/SKILL.md`
- `.claude/skills/qa-review/SKILL.md`
- `.claude/skills/security-review/SKILL.md`
- `.claude/skills/devops-review/SKILL.md`
- `.claude/skills/dba-review/SKILL.md`

For each file, **replace the entire `### Step 2: Build Session Memory Bundle` section** with the compressed version below. Substitute the correct values for `<agent-name>`, `<skill-name>`, and `<memory-label>` per file:

| File | `<agent-name>` | `<skill-name>` | `<memory-label>` |
|------|----------------|----------------|-----------------|
| pm-review | `product-manager` | `pm-review` | `past decisions on this topic` |
| qa-review | `qa-automation` | `qa-review` | `past coverage findings on this topic` |
| security-review | `security-expert` | `security-review` | `past findings on this topic` |
| devops-review | `devops-engineer` | `devops-review` | `past production notes on this topic` |
| dba-review | `dba-expert` | `dba-review` | `past findings on this topic` |

Compressed Step 2 template:

```markdown
### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("<agent-name>", <Feature field from current-topic.md>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/<skill-name>`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, one memory section: `### <agent-name> — <memory-label>`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.
```

#### Acceptance Criteria

- [ ] `pm-review/SKILL.md` Step 2 is ≤ 10 lines
- [ ] `qa-review/SKILL.md` Step 2 is ≤ 10 lines
- [ ] `security-review/SKILL.md` Step 2 is ≤ 10 lines
- [ ] `devops-review/SKILL.md` Step 2 is ≤ 10 lines
- [ ] `dba-review/SKILL.md` Step 2 is ≤ 10 lines
- [ ] Each file uses the correct agent name, skill name, and memory label per the table above
- [ ] Each Step 2 still saves the bundle to `.claude/context/run-log/<run-id>.md`
- [ ] Each Step 2 still passes the bundle inline in the agent prompt
- [ ] Steps 1, 3, and 4 in each file are unchanged

---

### Task 2: Compress Step 2 in pentest/SKILL.md

**Status:** PENDING
**Complexity:** Low

The `pentest` skill pre-fetches TWO agent memories (penetration-agent + security-expert), so it gets a slightly different compressed Step 2.

#### File Changes

##### MODIFY: .claude/skills/pentest/SKILL.md

**Replace the entire `### Step 2: Build Session Memory Bundle` section** with:

```markdown
### Step 2: Build Session Memory Bundle

1. Read `.claude/context/current-topic.md`. If missing or all placeholder comments: stop — "Run `/set-context` before running this review."
2. Check MCP: `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.
3. If AVAILABLE: `search_nodes("penetration-agent", <Feature field>)` and `search_nodes("security-expert", <Feature field>)`
4. Assemble bundle (Run ID: `YYYY-MM-DDTHH-MM-SS`, Triggered by: `/pentest`, Phase: `REVIEW`, Current Topic verbatim, MCP Status, two memory sections: `### penetration-agent — past attack vectors on this topic` and `### security-expert — past findings on this topic`).
5. Save to `.claude/context/run-log/<run-id>.md`. Pass full bundle inline in agent prompt under `## Session Memory`.
```

#### Acceptance Criteria

- [ ] `pentest/SKILL.md` Step 2 is ≤ 10 lines
- [ ] Step 2 calls `search_nodes` for BOTH `penetration-agent` AND `security-expert`
- [ ] Bundle includes TWO memory sections (penetration-agent and security-expert)
- [ ] Steps 1, 3, and 4 are unchanged

---

### Task 3: Compress Step 1 context-loading intro in all 6 agent files

**Status:** PENDING
**Complexity:** Medium

Applies to all 6 agent files:
- `.claude/agents/product-manager.md`
- `.claude/agents/security-expert.md`
- `.claude/agents/dba-expert.md`
- `.claude/agents/devops-engineer.md`
- `.claude/agents/qa-automation.md`
- `.claude/agents/penetration-agent.md`

#### File Changes

**For all agents EXCEPT product-manager:**

Replace the intro block at the top of `### Step 1: Load Context from Session Memory` (everything from line 13 through the end of the "How to use" list — the section before that agent's first unique step). The product-manager has critical backlog logic in Step 1 that requires special handling (see below).

The current intro block (varies slightly per agent, but follows this pattern):

```
// Before (generic pattern, ~12 lines):
The orchestrating skill has pre-assembled a session memory bundle for this run. Your context is pre-loaded in the `## Session Memory` section of this prompt — use it directly. There is no need to read files or call memory tools for context.

The bundle is in the `## Session Memory` section of this prompt. It contains:
- **Current Topic** — [description]
- **MCP Status** — Whether memory server is available this session
- **Your Past [X] Findings** — Section `### <agent-name> — past <X> on this topic`
- **[Other Agent Findings / All Agent Findings]** — [description]

How to use:
1. Read **Current Topic** for project context
2. Find `### <agent-name>` in Pre-fetched Agent Memories — [description]
3. [agent-specific instruction about other sections]
4. If MCP Status is `UNAVAILABLE`, note this and proceed without past context
```

Replace with the compressed version (substitute `<agent-name>`, `<memory-label>`, and `<agent-specific-note>` per agent):

```
// After (~5 lines):
Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### <agent-name>` in Pre-fetched Agent Memories — <memory-label>
3. <agent-specific-note>
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

Values per agent:

| File | `<agent-name>` | `<memory-label>` | `<agent-specific-note>` |
|------|----------------|-----------------|------------------------|
| security-expert | `security-expert` | your past findings (open vulns, accepted risks) | Read `### penetration-agent` section for exploitable paths found in past sessions |
| dba-expert | `dba-expert` | your past findings on this topic | Read other agent sections for cross-domain context |
| devops-engineer | `devops-engineer` | your past production notes on this topic | Read other agent sections for cross-domain context |
| qa-automation | `qa-automation` | past coverage gaps and quality notes | Read other agent sections — their findings reveal untested risk areas |
| penetration-agent | `penetration-agent` | your past attack vectors on this topic | Read `### security-expert` section — their findings are your primary starting points |

**For product-manager only:**

The product-manager Step 1 contains critical backlog retrieval logic (lines 27–41 in the current file) that must be preserved exactly. Only compress the opening 4-line preamble (lines 13–14 in the current file):

```
// Before (opening preamble, lines 13-14):
The orchestrating skill has pre-assembled a session memory bundle for this run. Your context is pre-loaded in the `## Session Memory` section of this prompt — use it directly. There is no need to read files or call memory tools for context.

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

// After (compressed preamble):
Your context is in `## Session Memory` in this prompt — use it directly.
1. Read **Current Topic** for project context
2. Find `### product-manager` in Pre-fetched Agent Memories — your past decisions and scope calls
3. Read all other agent sections for team consultation (Step 4) — no additional `search_nodes` calls needed
4. If MCP Status is `UNAVAILABLE`, proceed without past context
```

All lines from line 27 onward in product-manager.md (starting with `5. **Retrieve carried-forward backlog**`) are unchanged.

#### Acceptance Criteria

- [ ] `security-expert.md` Step 1 intro is ≤ 6 lines; still references `### penetration-agent` section
- [ ] `dba-expert.md` Step 1 intro is ≤ 6 lines
- [ ] `devops-engineer.md` Step 1 intro is ≤ 6 lines
- [ ] `qa-automation.md` Step 1 intro is ≤ 6 lines
- [ ] `penetration-agent.md` Step 1 intro is ≤ 6 lines; still references `### security-expert` section
- [ ] `product-manager.md` Step 1 intro is ≤ 6 lines
- [ ] `product-manager.md` backlog retrieval logic (starting with `5. **Retrieve carried-forward backlog**`) is UNCHANGED
- [ ] All agents' Step 2 and beyond are unchanged (domain-specific review logic is untouched)
- [ ] No agent file says "There is no need to read files or call memory tools for context" (removed as part of compression)

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->
