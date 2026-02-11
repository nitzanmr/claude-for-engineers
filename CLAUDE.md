# CLAUDE.md

This repo uses the **Claude for Engineers** workflow for planning and executing features with Claude Code.

## Workflow

```
/plan  -->  /prd  -->  /execute  -->  /retro
 Talk       Spec       Build         Learn
```

1. **`/plan`** - Collaborative planning conversation. Discuss, explore, align. Produces a Master Plan.
   - Use `/team-research` during planning for deep parallel codebase exploration.
2. **`/prd`** - Generate detailed PRDs from the approved Master Plan. Hyper-specific tasks with exact file changes.
3. **`/execute`** - Mechanical execution. Agents follow PRD tasks exactly. Choose task mode or swarm mode.
   - Use `/team-review` after execution for parallel code review.
4. **`/retro`** - Retrospective. Review what happened, capture learnings.

## All Skills

| Skill | When | What it does |
|-------|------|-------------|
| `/plan` | Start of feature | Collaborative conversation -> Master Plan |
| `/team-research` | During `/plan` | Parallel agents explore codebase areas |
| `/prd` | After Master Plan approved | Generate detailed PRDs with exact file changes |
| `/execute` | After PRDs approved | Launch agents to implement tasks mechanically |
| `/team-review` | After execution (optional) | Parallel agents review code against PRD specs |
| `/retro` | After review | Capture learnings, update documentation |

## Core Principles

- **Engineer stays in control.** Every file change is specified before execution. No surprises.
- **Plan heavy, execute light.** All thinking happens in planning. Agents just follow instructions.
- **Many small PRDs.** Break features into multiple PRDs with dependencies. Tasks within PRDs are tiny.
- **Full audit trail.** Timestamps, progress logs, files touched - everything tracked in PRD files.
- **Review before execute.** Engineer reviews all PRDs like a PR - at the code level.

## Rules

- See `.claude/rules/workflow.md` for the full workflow specification
- See `.claude/rules/prd-format.md` for PRD structure and formatting rules

## PRDs Location

All PRDs live in `prds/` with timestamped directories:

```
prds/
  2025-06-15T14-32_payment-feature/
    master-plan.md
    prd-01_payment-types.md
    prd-02_payment-ui.md
    review.md
    retrospective.md
```

## Project-Specific Setup

This is a generic workflow. Add your project-specific skills, agents, and rules alongside these:

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
    my-builder.md     # Your project agent
  rules/
    workflow.md       # From claude-for-engineers
    prd-format.md     # From claude-for-engineers
    coding-style.md   # Your project rules
```
