---
name: team-research
description: Explore a codebase area in depth with parallel research agents before planning
argument-hint: <area to research, e.g. "authentication system" or "how payments work">
allowed-tools: Read, Glob, Grep, Task, Bash
tags: [research, exploration, team, parallel]
---

# Team Research Skill

Launch parallel research agents to deeply explore a codebase area. Used during `/plan` when the exploration is too broad or complex for a single conversation thread.

## When to Use

- During `/plan` when the feature touches multiple subsystems
- When you need to understand existing patterns before proposing architecture
- When the engineer asks "how does X work today?" and the answer spans many files
- When mapping out all files that will be affected by a change

## How It Works

### Step 0: Build Session Memory Bundle

Before launching research agents, assemble the shared context bundle.

**1. Read current topic** — Read `.claude/context/current-topic.md` verbatim. If the file is missing or all fields are placeholder comments, stop and tell the engineer: "Run `/set-context` to set the current topic before researching."

**2. Check MCP availability** — Attempt `search_nodes("mcp-health-check")`. Mark AVAILABLE or UNAVAILABLE.

**3. Pre-fetch agent memories** (if AVAILABLE) — Call `search_nodes` for each of the 6 agent names with the current topic name.

**4. Assemble and save bundle** — Same schema as in `/team-review` Step 0, **except** replace the `## Execution Context` section with `## Research Context`:

~~~markdown
## Research Context
- Research area: <the topic/codebase area being researched>
- Relevant PRD directory: <prds/<dir>/ if already known, or "N/A — pre-planning research">
- Triggered by: /team-research during /plan
~~~

Save to `.claude/context/run-log/<run-id>.md`. Use `YYYY-MM-DDTHH-MM-SS` format for the run ID to prevent collisions.

**5. Pass inline** — Include the full bundle in every agent prompt under a `## Session Memory` section.

### Step 1: Define Research Questions

Break the area into 2-4 focused research questions. Each question will be handled by a separate agent.

Example for "payment system":
1. **Agent 1 - Data layer:** What types, state, and selectors exist for payments?
2. **Agent 2 - API layer:** What API calls exist? How are payment endpoints structured?
3. **Agent 3 - UI layer:** What components render payment UI? What patterns do they follow?

Present the research questions to the engineer. Ask: "These are the areas I want to explore in parallel. Want to adjust?"

### Step 2: Launch Research Agents

Launch 2-4 agents in parallel using the `Task` tool with `subagent_type: "Explore"`.

Each agent gets a focused research prompt:

```
Research the following area of the codebase and provide a thorough report.

Question: <specific research question>

Your report should include:
1. **Files found** - Every relevant file path
2. **Patterns** - How the code is structured today
3. **Key types/interfaces** - Important type definitions
4. **Dependencies** - What this area depends on
5. **Integration points** - Where this area connects to other systems
6. **Potential impact** - Files that would need to change for modifications

Be thorough. List every file. Show key code structures.
Do NOT suggest changes - just report what exists.
```

### Step 3: Synthesize Results

After all agents report back:

1. Combine findings into a structured research summary
2. Identify overlaps and connections between areas
3. Flag any conflicts or surprises
4. List all affected files (deduplicated)
5. Note existing patterns the feature should follow

### Step 4: Present to Engineer

Share the synthesized research with the engineer. Format:

```markdown
## Research Summary: <Area>

### Files Inventory
<categorized list of all relevant files>

### Current Architecture
<how the system works today>

### Patterns to Follow
<patterns discovered that the new feature should match>

### Integration Points
<where new code would hook in>

### Risks / Surprises
<anything unexpected discovered>
```

This becomes input for the ongoing `/plan` conversation.

## Research Agent Guidelines

- Agents are READ-ONLY. They explore, they don't modify.
- Use `Explore` agent type for broad searches, `general-purpose` for targeted reads.
- Each agent should be scoped to one area. Don't overlap.
- Time-box: if an agent is taking too long on too many files, it should summarize what it found so far.
- Agents report facts, not opinions. No architecture suggestions.

## Specialist Agents in Research

When research touches a specialist's domain, you can include them as a research agent. Specialist agents bring their memory context into the research — they already know what they've seen in this project before.

| Specialist | When to include in research |
|------------|---------------------------|
| `dba-expert` | Mapping data access patterns, understanding schema, exploring query behavior |
| `product-manager` | Understanding existing scope decisions, mapping feature dependencies |
| `devops-engineer` | Mapping deployment topology, understanding infrastructure constraints |
| `security-expert` | Mapping authentication flows, understanding current security posture |
| `penetration-agent` | Mapping attack surface before a security-sensitive feature |
| `qa-automation` | Mapping existing test coverage before planning new test strategy |

To include a specialist in a research round, launch them the same way as a standard Explore agent but reference their agent file:

```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

Research question: <specific research question for this agent>

Your report should include:
1. Files found relevant to your domain
2. Patterns you observe
3. Concerns or flags from your specialist perspective
4. Relevant memories from past sessions in this project

Do NOT suggest changes — just report what exists and what you know.
```

Specialist research results are included in the synthesized research summary under a "Specialist Perspectives" section.

## Integration with /plan

Research results feed back into the planning conversation:

```
/plan payment feature
  ↓
  [discussion reveals complexity]
  ↓
  /team-research payment state, payment API, payment UI
  ↓
  [agents explore in parallel]
  ↓
  [synthesized results shared]
  ↓
  [planning conversation continues with full context]
  ↓
  Master Plan written
```

The engineer stays in the `/plan` conversation the whole time. Research is a sub-step, not a separate phase.

## Examples

### Small research (2 agents)
```
/team-research how user profiles work
→ Agent 1: Profile state and selectors
→ Agent 2: Profile UI components
```

### Medium research (3 agents)
```
/team-research authentication system
→ Agent 1: Auth state, tokens, session management
→ Agent 2: Auth API calls and error handling
→ Agent 3: Auth UI (login, signup, password reset)
```

### Large research (4 agents)
```
/team-research entire notification system
→ Agent 1: Notification types and state
→ Agent 2: Notification API and push integration
→ Agent 3: Notification UI components
→ Agent 4: Notification settings and preferences
```

## Notes

- Always get engineer approval before launching agents
- Present research questions first, let engineer adjust scope
- 4 agents max. If you need more, split into multiple research rounds.
- Research results should be concise but complete. List files, show patterns, note connections.
- This skill is used DURING `/plan`, not as a standalone phase.
