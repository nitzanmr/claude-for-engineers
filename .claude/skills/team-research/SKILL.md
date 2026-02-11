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
