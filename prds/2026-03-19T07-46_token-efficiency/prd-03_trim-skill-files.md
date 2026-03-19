# PRD-03: Trim Skill Files

Created: 2026-03-19 07:46 UTC
Status: PENDING
Depends on: PRD-02
Complexity: Low

## Objective

Remove purely pedagogical content from `plan/SKILL.md` and `team-research/SKILL.md` — conversation examples, workflow diagrams, and repeated scenario illustrations that don't change behavior.

## Context

`plan/SKILL.md` contains a 40-line simulated conversation example (lines 124–164) that illustrates what the skill does but adds zero new instructions — the 5-step process and rules already fully define the behavior. Similarly, `team-research/SKILL.md` contains three repeated scenario examples (small/medium/large research) and a redundant workflow diagram. Together these are ~7,500 chars of illustrative overhead that gets loaded every time these skills are invoked. The behavioral content (steps, rules, gates, templates) is untouched.

---

## Tasks

### Task 1: Trim plan/SKILL.md — remove example, fold research section

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/plan/SKILL.md

**Remove the `## Conversation Flow Example` section** (lines 124–164 in the current file — the entire section from `## Conversation Flow Example` heading through the closing ` ``` ` of the code block):

```
// Remove this entire section:
## Conversation Flow Example

```
Engineer: /plan add user settings panel
...
Claude: "Run `/prd <directory-name>` to generate the detailed PRDs."
```
```

**Fold `## When Research Gets Complex` section into Step 2** (lines 166–177 in the current file). This section repeats the team-research invocation pattern already described in Step 2 (lines 45–54). Merge its key value — the specific ask message — into Step 2 and remove the standalone section.

Replace the last paragraph of Step 2 (lines 45–54, the "When exploration gets complex" block) with this expanded version:

```
// Before (Step 2, team-research block):
**When exploration gets complex**, use `/team-research` to parallelize:

1. Propose 2-4 focused research questions to the engineer
2. Wait for engineer approval
3. Launch `/team-research` with those questions
4. Agents explore in parallel and report back
5. Synthesize findings into a research summary
6. Continue the planning conversation with full context

See `.claude/skills/team-research/SKILL.md` for how research agents work.

// After (Step 2, team-research block — folds in the message template):
**When exploration gets complex**, use `/team-research` to parallelize:

1. Propose 2-4 focused research questions to the engineer using this format:
   "This touches a lot of the codebase. I'd like to spin up `/team-research` to explore in parallel. Here are the questions I'd send:
   1. [area 1 question]
   2. [area 2 question]
   Want me to go ahead?"
2. Wait for engineer approval
3. Launch `/team-research` with those questions
4. Agents explore in parallel and report back
5. Synthesize findings into a research summary
6. Continue the planning conversation with full context
```

**Remove the now-empty `## When Research Gets Complex` standalone section** (lines 166–177) entirely since its content was folded into Step 2 above.

**Remove the `## Skill Dependencies` section** (lines 179–185). This section just lists `/team-research` as an input and `/prd` as output — information already stated in the steps above.

#### Acceptance Criteria

- [ ] File does NOT contain `## Conversation Flow Example`
- [ ] File does NOT contain `Engineer: /plan add user settings panel`
- [ ] File does NOT contain standalone `## When Research Gets Complex` section
- [ ] File does NOT contain standalone `## Skill Dependencies` section
- [ ] Step 2 still contains the team-research invocation pattern with the ask message template
- [ ] All 5 steps (Understand, Explore, Discuss, Break Into PRDs, Write Master Plan) are present and unchanged
- [ ] `## Rules` section is present and unchanged (8 NEVER/DO statements)
- [ ] `## What the Master Plan Is NOT` section is present and unchanged
- [ ] File is ≤ 120 lines

---

### Task 2: Trim team-research/SKILL.md — remove examples and diagram

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: .claude/skills/team-research/SKILL.md

**Remove the `## Examples` section** near the bottom of the file. This section contains three scenarios (small/medium/large) showing the same invocation pattern three times:

```
// Remove this entire section:
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
```

**Remove the `## Integration with /plan` section.** This section contains a markdown ASCII flowchart showing the research sub-step within `/plan`. The same information is stated in the prose above it.

```
// Remove this entire section:
## Integration with /plan

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
```

**Remove the `## Notes` section** at the end of the file (the 4-line section starting "Always get engineer approval before launching agents"). These notes restate rules already present in Steps 1 and 2.

**Condense the `## Execution Modes` section** — each mode description is currently 3–4 lines. Reduce each to 2 lines:

```
// Before:
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

// After:
### Task Mode (Default)
- Parallel Explore agents via `Task` tool, run independently. Best for 2–3 focused questions.

### Swarm Mode
- Team via `TeamCreate`, agents share task list and can message each other. Best for 3–4 overlapping areas or when live progress visibility matters.
```

**Condense the `## When to Use` section** from 4 bullet points to 2:

```
// Before:
- During `/plan` when the feature touches multiple subsystems
- When you need to understand existing patterns before proposing architecture
- When the engineer asks "how does X work today?" and the answer spans many files
- When mapping out all files that will be affected by a change

// After:
- During `/plan` when exploration spans multiple subsystems or many files
- When you need to understand existing patterns before proposing architecture
```

#### Acceptance Criteria

- [ ] File does NOT contain `## Examples` section
- [ ] File does NOT contain `Small research (2 agents)`
- [ ] File does NOT contain `## Integration with /plan` section
- [ ] File does NOT contain standalone `## Notes` section at end of file
- [ ] `## Execution Modes` section is present with condensed 2-line descriptions
- [ ] `## When to Use` section is present with 2 bullet points
- [ ] All steps (Step 0, Step 1, Step 2, Step 3, Step 4) are present and complete
- [ ] `## Research Agent Guidelines` section is present (do not remove)
- [ ] `## Specialist Agents in Research` section is present (do not remove)
- [ ] File is ≤ 180 lines

---

## Execution Log

<!-- Filled by agents during execution. Do not edit manually. -->
