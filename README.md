# Claude for Engineers

A workflow system for engineers who use Claude Code to build features. Plan heavy, execute light.

## Philosophy

You write code with AI agents. But you're still an engineer. You want:

- **Full visibility** into what will change before it changes
- **No surprises** from agents making decisions on their own
- **Code-level review** of the plan, not just high-level summaries
- **Audit trail** of everything that happened during execution
- **Small, mechanical tasks** that agents can't mess up

Claude for Engineers gives you a structured workflow that puts you in control.

## The Workflow

```
/plan  ───>  /prd  ───>  /execute  ───>  /retro
 Talk         Spec        Build           Learn
```

### 1. `/plan` - Collaborative Planning

Have a conversation with Claude about what you want to build. Explore the codebase together. Discuss architecture, tradeoffs, and scope.

When exploration gets complex, use **`/team-research`** to launch parallel agents that explore different areas of the codebase simultaneously and report back.

The output is a **Master Plan** - a lightweight document listing PRDs and their dependencies. You approve it before anything else happens.

### 2. `/prd` - Detailed Specification

Claude generates detailed PRDs from the approved Master Plan. Each PRD contains tiny, hyper-specific tasks with exact file changes:

```markdown
### Task 3: Add trial label to PaymentScreen

##### MODIFY: src/components/PaymentScreen.tsx

**Add import** (after existing type imports):
  import type { TrialInfo } from '../../types/trial';

**Update render** (inside the header div, after title):
  <span className={styles.trialLabel}>
    {lang('TrialDaysRemaining', { days: trialInfo.daysLeft })}
  </span>
```

You review all PRDs in your editor like you'd review a PR. No code gets written until you approve.

### 3. `/execute` - Mechanical Execution

Agents follow the PRD tasks exactly. No decisions, no creativity. Two modes:

- **Task mode** - Parallel subagents, fire-and-forget (simpler, faster)
- **Swarm mode** - Coordinated team with shared task list (complex features, live progress)

Agents update the PRD files with execution logs, timestamps, and files touched.

### 4. `/team-review` - Code Review (Optional)

After execution, launch parallel review agents that verify the code matches the PRD specifications. Catches deviations, quality issues, and integration gaps.

`/team-review` auto-selects specialist agents based on PRD content (e.g., security-expert if auth patterns are found, dba-expert if schema changes are present). The PM agent synthesizes all findings into a structured backlog: **Needed** (fix before merge), **Desirable** (do soon), **Hard** (separate planning session).

### 5. `/retro` - Retrospective

Review what happened. What worked, what didn't, what the PRDs got wrong. Captured in a retrospective file for future reference.

## All Skills

### Workflow Skills

| Skill | Phase | What it does |
|-------|-------|-------------|
| `/plan` | Planning | Collaborative conversation -> Master Plan |
| `/team-research` | Planning | Parallel codebase exploration (used during `/plan`) |
| `/prd` | Specification | Generate detailed PRDs with exact file changes |
| `/execute` | Execution | Launch agents to implement tasks mechanically |
| `/team-review` | Review (optional) | Parallel code review against PRD specs |
| `/retro` | Retrospective | Capture learnings, update documentation |
| `/set-context` | Anytime | Update current-topic.md for the active feature |
| `/pm-backlog` | Anytime | View and manage the PM's open/deferred/resolved backlog |

### Specialist Review Skills

Each skill invokes a specialist agent for a focused, standalone review:

| Skill | Agent | What it reviews |
|-------|-------|----------------|
| `/pm-review` | Product Manager | Scope creep, priority calls, efficiency tradeoffs |
| `/qa-review` | QA Automation | Test coverage span, quality, acceptance criteria |
| `/security-review` | Security Expert | Auth, input validation, OWASP Top 10, CVEs |
| `/devops-review` | DevOps Engineer | Deployment safety, config, observability |
| `/dba-review` | DBA Expert | Query performance, schema decisions, indexes |
| `/pentest` | Penetration Agent | Attack vectors, business logic bypass paths |

## Quick Start

### Option A: Fork this repo

```bash
git clone https://github.com/your-username/claude-for-engineers.git my-project
cd my-project
claude
> /plan build a user authentication system
```

### Option B: Copy into existing project

```bash
cp -r claude-for-engineers/.claude/ your-project/.claude/
cp -r claude-for-engineers/prds/ your-project/prds/
# Merge CLAUDE.md contents if you already have one
```

### Option C: Use alongside project-specific skills

These skills are generic. Add your project-specific skills next to them:

```
.claude/
  skills/
    plan/             # From claude-for-engineers
    team-research/    # From claude-for-engineers
    prd/              # From claude-for-engineers
    execute/          # From claude-for-engineers
    team-review/      # From claude-for-engineers
    retro/            # From claude-for-engineers
    component/        # Your project skill
    review/           # Your project skill
  agents/
    builder.md        # Your project agent
  rules/
    workflow.md       # From claude-for-engineers
    prd-format.md     # From claude-for-engineers
    my-rules.md       # Your project rules
```

## PRD Structure

PRDs are generated in timestamped directories:

```
prds/
  2025-06-15T14-32_payment-feature/
    master-plan.md                  # From /plan
    prd-01_payment-types.md         # From /prd
    prd-02_payment-api.md
    prd-03_payment-ui.md
    prd-04_payment-integration.md
    review.md                       # From /team-review
    retrospective.md                # From /retro
```

Each PRD has:
- Dependency declarations (between PRDs and between tasks)
- Tiny tasks with exact file change specifications
- Acceptance criteria per task
- Execution log section (filled by agents with timestamps)

See `.claude/rules/prd-format.md` for the full format specification.

## Key Principles

### Engineer-First
This is for people who used to write code and now work with agents. You still want code ownership. You review the plan at the code level before execution.

### Plan Heavy, Execute Light
All thinking happens in `/plan` and `/prd`. By the time agents execute, every decision is already made. Tasks are so specific that agents can't introduce bugs through bad decisions.

### Many Small PRDs
Don't create one massive PRD. Break features into many small PRDs with clear dependencies. Tasks within PRDs should be tiny - even "add this import to line X" small.

### Full Audit Trail
Every PRD file tracks: creation time, execution start/end times, agent used, files touched, issues encountered, acceptance criteria results. You can reconstruct exactly what happened.

### No Surprises
Before execution starts, you know:
- Every file that will be created
- Every file that will be modified (and how)
- Every file that will be deleted
- What code will look like after execution

### Approval Gates
Nothing happens without your say-so:
1. Master Plan must be approved before PRDs are generated
2. PRDs must be reviewed before execution starts
3. You pick the execution mode (task vs swarm)
4. Failed tasks are reported - you decide how to handle them

## Project-Specific Customization

### Adding Skills

Put project-specific skills in `.claude/skills/`. PRD tasks can reference them:

```markdown
**Recommended skills:** `/component PaymentCard`, `/lang-key`
```

### Adding Agents

Put specialized agent definitions in `.claude/agents/`. PRD tasks can recommend them:

```markdown
**Recommended agent:** `component-builder`
```

### Adding Rules

Put project-specific rules in `.claude/rules/`. These are loaded automatically by Claude Code.

## Scrum Team Agents

Six specialist agents participate in planning and review. Each has a persistent memory of past findings on your project — so the security expert remembers open vulnerabilities across sessions, the DBA remembers schema decisions, etc.

| Agent | When it runs |
|-------|-------------|
| **Product Manager** | Always — synthesizes all review findings into a prioritized backlog |
| **QA Automation** | Auto-selected if test files detected in PRD |
| **Security Expert** | Auto-selected if auth/token/encrypt patterns detected |
| **DevOps Engineer** | Auto-selected if deploy/config/infra patterns detected |
| **DBA Expert** | Auto-selected if schema/query/migration patterns detected |
| **Penetration Agent** | Requires explicit engineer confirmation (even when auto-matched) |

Agents are invoked by `/team-review` automatically, or directly via the specialist review skills (`/security-review`, `/devops-review`, etc.).

### Session Memory

Before each review or execution run, the orchestrating skill assembles a **session memory bundle** containing:
- Current feature context (from `current-topic.md`)
- Pre-fetched past memories for each agent
- Run metadata (ID, phase, PRD directory)

This bundle is passed to every agent in the session. Agents don't fetch their own context — they use what's in the bundle. This keeps runs reproducible and prevents stale reads.

Session bundles are saved to `.claude/context/run-log/` for audit and retro use.

### PM Backlog

After each `/team-review`, the Product Manager writes a structured backlog to `prds/<dir>/backlog.md`:

- **Needed** — fix before merge (counts as High severity in the verdict)
- **Desirable** — do soon, not blocking (counts as Medium)
- **Hard** — needs its own planning session (informational only)

Backlog items persist across review runs. Use `/pm-backlog <dir>` to view, resolve, or defer items.

## File Reference

```
.claude/
  skills/
    plan/SKILL.md             # Collaborative planning conversation
    team-research/SKILL.md    # Parallel codebase exploration
    prd/SKILL.md              # PRD generation from Master Plan
    execute/SKILL.md          # Execution orchestrator (task + swarm)
    team-review/SKILL.md      # Parallel code review + PM synthesis
    retro/SKILL.md            # Session retrospective
    set-context/SKILL.md      # Update current-topic.md
    pm-backlog/SKILL.md       # View and manage PM backlog
    pm-review/SKILL.md        # Standalone PM scope review
    qa-review/SKILL.md        # Standalone QA coverage review
    security-review/SKILL.md  # Standalone security review
    devops-review/SKILL.md    # Standalone DevOps review
    dba-review/SKILL.md       # Standalone DBA review
    pentest/SKILL.md          # Standalone penetration test
  agents/
    product-manager.md        # PM agent definition + memory schema
    qa-automation.md          # QA agent definition
    security-expert.md        # Security agent definition
    devops-engineer.md        # DevOps agent definition
    dba-expert.md             # DBA agent definition
    penetration-agent.md      # Pentest agent definition
  context/
    current-topic.md          # Active feature context (update each session)
    run-log/                  # Session memory snapshots (gitignored)
  memory/
    agent-memory.json         # MCP memory DB (gitignored, project-local)
  rules/
    workflow.md               # Full workflow specification
    prd-format.md             # PRD structure and file change format
prds/                         # Generated PRDs go here
```

## Agent Memory Setup

To enable cross-session agent memory in your project:

1. Copy `.claude/settings.json` into your project's `.claude/` directory.
2. **Update `MEMORY_FILE_PATH`** to the absolute path of your project's memory file — the relative path in the template is CWD-sensitive and will silently fail if Claude Code is launched from outside the project root:
   ```json
   "MEMORY_FILE_PATH": "/absolute/path/to/your-project/.claude/memory/agent-memory.json"
   ```
3. Copy `.claude/context/current-topic.md` into your project. Update it at the start of each session, or use `/set-context`.
4. Copy `.claude/memory/.gitignore` to keep the memory DB out of git.
5. Add `.claude/context/run-log/*.md` to your `.gitignore` to keep run snapshots ephemeral.

Each project gets completely isolated agent memory. The memory file is created automatically on first use.

## Requirements

- [Claude Code](https://claude.ai/code) CLI

## License

MIT
