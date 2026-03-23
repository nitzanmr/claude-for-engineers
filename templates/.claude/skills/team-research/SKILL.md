---
name: team-research
description: Explore a codebase area in depth with parallel research agents before planning
argument-hint: <area to research, e.g. "authentication system" or "how payments work">
allowed-tools: Read, Glob, Grep, Task, Bash, TeamCreate, TaskCreate, TaskList, TaskUpdate, TaskGet, SendMessage
tags: [research, exploration, team, parallel]
---

# Team Research Skill

Launch parallel research agents to deeply explore a codebase area. Used during `/plan` when the exploration is too broad or complex for a single conversation thread.

## When to Use

- During `/plan` when the feature touches multiple subsystems
- When you need to understand existing patterns before proposing architecture
- When the engineer asks "how does X work today?" and the answer spans many files
- When mapping out all files that will be affected by a change

## Execution Modes

**Task Mode (Default):** `Task` tool, parallel Explore agents, independent, no coordination. Best for quick research, 2-3 questions.

**Swarm Mode:** `TeamCreate` + shared task list, agents can consult via `SendMessage`. Best for 3-4 overlapping questions or when live progress visibility is needed.

## How It Works

### Step 0: Build Session Memory Bundle

Before launching research agents, assemble the shared context bundle.

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Use the **Research Context** phase variant. Set `Triggered by: /team-research during /plan` and `Phase: RESEARCH`. Save to `.claude/context/run-log/<run-id>.md` using `YYYY-MM-DDTHH-MM-SS` format.

### Step 1: Define Research Questions

Break the area into 2-4 focused research questions. Each question will be handled by a separate agent.

Example for "payment system":
1. **Agent 1 - Data layer:** What types, state, and selectors exist for payments?
2. **Agent 2 - API layer:** What API calls exist? How are payment endpoints structured?
3. **Agent 3 - UI layer:** What components render payment UI? What patterns do they follow?

Present the research questions to the engineer. Ask: "These are the areas I want to explore in parallel. Want to adjust?"

After engineer approves the research questions, ask:

```
Research <N> questions with <N> agents.
  • Task mode  — agents run independently, no coordination, best for quick/focused research
  • Swarm mode — agents share a task list and can consult each other via messages when
                 they find cross-domain findings; best when areas overlap or you want
                 live visibility into progress

Which mode?
```

Wait for confirmation before launching any agents.

### Step 2: Launch Research Agents

#### Task Mode

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

#### Swarm Mode

1. **Create team:** `TeamCreate` with name `research-<run-id>` (use the run ID from Step 0)
2. **Create tasks:** `TaskCreate` one task per research question, with the full research prompt as the description (same prompt as task mode above, plus the consultation instruction below)
3. **Spawn agents:** Launch Explore agents using the `Task` tool with `team_name: "research-<run-id>"`. One agent per research question. Launch all simultaneously.
4. **Assign tasks:** `TaskUpdate` each task with the corresponding agent as `owner`
5. **Monitor:** Track progress via `TaskList`. Agents will pick up their tasks and update status as they work.
6. **Collect results:** Read agent completion reports and task outputs

**Swarm mode agent prompt addition** — append this to every agent's research prompt when in swarm mode:

```
## Team Coordination

You are part of a research team. Other agents are exploring adjacent areas simultaneously.

If you find something that is clearly relevant to another agent's research area, send them a message:
- Use `SendMessage` to the teammate assigned to that question
- Keep it brief: "Found [X] in [file] — may be relevant to your area"

If you are unsure whether your area overlaps with another agent's, you can ask:
- `SendMessage`: "Are you covering [topic]? I found something that might be in your scope"

Do NOT wait for replies before completing your own research. Consultation is optional and async.
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

When research touches a specialist's domain, include them as a research agent. Launch them the same way as a standard Explore agent but reference their agent file:

```
You are the <agent-name> agent. Follow the instructions in `.claude/agents/<agent-name>.md`.

## Session Memory
<full contents of the session memory bundle built in Step 0>

Research question: <specific research question for this agent>

Your report should include:
1. Files found relevant to your domain
2. Patterns you observe
3. Concerns or flags from your specialist perspective

Do NOT suggest changes — just report what exists.
```

## Notes

- Always get engineer approval before launching agents
- Present research questions first, let engineer adjust scope
- 4 agents max. If you need more, split into multiple research rounds.
- Research results should be concise but complete. List files, show patterns, note connections.
- This skill is used DURING `/plan`, not as a standalone phase.
