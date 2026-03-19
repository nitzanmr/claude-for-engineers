# PRD-01: team-research Swarm Mode

Created: 2026-03-18 10:48 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Add an opt-in swarm mode to `/team-research` that uses TeamCreate for live task coordination and cross-agent consultation via SendMessage.

## Context

`/team-research` currently launches parallel `Task` agents (Explore type) with no coordination between them. Swarm mode adds a shared task list and lets agents consult each other when they find cross-domain findings — matching the pattern established by `/execute` swarm mode.

---

## Tasks

### Task 1: Update frontmatter allowed-tools

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Replace the `allowed-tools` line** (line 5, inside the frontmatter block):

```
// Before:
allowed-tools: Read, Glob, Grep, Task, Bash

// After:
allowed-tools: Read, Glob, Grep, Task, Bash, TeamCreate, TaskCreate, TaskList, TaskUpdate, TaskGet, SendMessage
```

#### Acceptance Criteria

- [ ] `allowed-tools` line in frontmatter contains all 6 new tools
- [ ] Frontmatter YAML is valid (no extra spaces or broken formatting)

---

### Task 2: Add execution modes section and mode selection prompt

**Status:** PENDING
**Depends on:** Task 1
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Add a new `## Execution Modes` section** directly after the `## When to Use` section and before the `## How It Works` section (after the line containing `- This skill is used DURING \`/plan\`, not as a standalone phase.` — actually before "## How It Works"):

```markdown
## Execution Modes

### Task Mode (Default)
- Uses the `Task` tool to launch parallel Explore subagents
- Agents run independently, report back to the orchestrator
- Best for: quick research, 2-3 questions, when areas are clearly separate
- No coordination overhead

### Swarm Mode
- Uses `TeamCreate` to create a team with a shared task list
- Agents can consult each other via `SendMessage` when they find cross-domain findings
- Live task progress visible via `TaskList`
- Best for: broader research (3-4 questions), overlapping areas, or when you want visibility into what each agent is finding in real time
```

**Add the mode selection prompt** inside `## How It Works`, at the end of **Step 1** (after the line `Ask: "These are the areas I want to explore in parallel. Want to adjust?"`), as a new paragraph:

```markdown
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
```

#### Acceptance Criteria

- [ ] `## Execution Modes` section exists with both mode descriptions
- [ ] Mode selection prompt appears in Step 1, after the approval gate
- [ ] Prompt includes tradeoff bullet points for both modes
- [ ] Skill instructs to wait for confirmation before launching

---

### Task 3: Add swarm mode execution steps

**Status:** PENDING
**Depends on:** Task 2
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Replace the entire `### Step 2: Launch Research Agents` section** with the following expanded version that covers both modes:

```markdown
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
```

#### Acceptance Criteria

- [ ] Step 2 has two clearly labeled sub-sections: `#### Task Mode` and `#### Swarm Mode`
- [ ] Task mode content is identical to the current Step 2 content (no regression)
- [ ] Swarm mode lists all 5 steps: TeamCreate, TaskCreate, spawn agents, assign, monitor
- [ ] Swarm mode agent prompt includes the `## Team Coordination` consultation section
- [ ] `SendMessage` usage examples are included in the consultation instruction

---

## Execution Log

_(populated during execution)_
