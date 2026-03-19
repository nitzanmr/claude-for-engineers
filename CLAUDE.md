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

### Workflow Skills

| Skill | When | What it does |
|-------|------|-------------|
| `/plan` | Start of feature | Collaborative conversation -> Master Plan |
| `/team-research` | During `/plan` | Parallel agents explore codebase areas |
| `/prd` | After Master Plan approved | Generate detailed PRDs with exact file changes |
| `/execute` | After PRDs approved | Launch agents to implement tasks mechanically |
| `/team-review` | After execution (optional) | Parallel agents review code against PRD specs |
| `/retro` | After review | Capture learnings, update documentation |
| `/set-context` | Start of session | Update current-topic.md interactively |
| `/pm-backlog` | Anytime | View and manage the PM's structured backlog |
| `/check-setup` | Before first use or when MCP feels broken | Verify settings, MCP, and topic are configured |

### Specialist Review Skills

Invoke a specialist agent directly for a focused review without running a full `/team-review`:

| Skill | Agent | What it reviews |
|-------|-------|----------------|
| `/pm-review` | Product Manager | Scope, priority, efficiency tradeoffs |
| `/qa-review` | QA Automation | Test coverage, quality, acceptance criteria |
| `/security-review` | Security Expert | Auth, input validation, OWASP Top 10 |
| `/devops-review` | DevOps Engineer | Deployment readiness, infra, observability, tool discovery and integration |
| `/dba-review` | DBA Expert | Queries, schema, indexes, data access patterns |
| `/pentest` | Penetration Agent | Attack vectors, business logic bypass |

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

## Agent Memory Setup

Each project that uses the scrum team agents needs a one-time setup:

1. **Copy `.claude/settings.json`** from this repo into your project's `.claude/` directory. This configures the MCP memory server.

   **Create `.claude/settings.local.json`** (gitignored — do NOT commit it) with your absolute path:
   ```json
   {
     "mcpServers": {
       "memory": {
         "env": {
           "MEMORY_FILE_PATH": "/Users/yourname/your-project/.claude/memory/agent-memory.json"
         }
       }
     },
     "permissions": {
       "allow": [
         "mcp__memory__search_nodes"
       ]
     }
   }
   ```

   Claude Code merges `settings.json` and `settings.local.json` at startup. The local file holds your machine-specific path; the committed file stays clean for other users.

   **Important:** Never put your real absolute path in `settings.json` — it leaks your username and directory structure if the repo is public.

2. **Copy `.claude/context/current-topic.md`** into your project. Update it at the start of each planning session, or use `/set-context` to update it interactively.

3. **Copy `.claude/memory/.gitignore`** into your project to prevent the memory DB from being committed.

4. **Add to your project's `.gitignore`**: `.claude/context/run-log/*.md` — this prevents run snapshots from being committed. The `.gitkeep` file keeps the directory in git; the snapshot files are ephemeral.

The memory file is created automatically on first agent use. Each project has completely isolated agent memory.

## Scrum Team Agents

The workflow ships with six specialist agents that bring domain expertise to planning and review:

| Agent | File | Role |
|-------|------|------|
| Product Manager | `.claude/agents/product-manager.md` | Scope, priority, backlog management |
| QA Automation | `.claude/agents/qa-automation.md` | Test coverage, quality gates |
| Security Expert | `.claude/agents/security-expert.md` | Auth, input validation, vulnerability patterns |
| DevOps Engineer | `.claude/agents/devops-engineer.md` | Deployment safety, infra, observability |
| DBA Expert | `.claude/agents/dba-expert.md` | Queries, schema, indexes |
| Penetration Agent | `.claude/agents/penetration-agent.md` | Attack surface, business logic bypass |

These agents are invoked by `/team-review` (automatically, based on PRD content) and by the specialist review skills above. They share memory across sessions via the MCP memory server.

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
    pm-backlog/       # From claude-for-engineers
    set-context/      # From claude-for-engineers
    pm-review/        # From claude-for-engineers
    qa-review/        # From claude-for-engineers
    security-review/  # From claude-for-engineers
    devops-review/    # From claude-for-engineers
    dba-review/       # From claude-for-engineers
    pentest/          # From claude-for-engineers
    component/        # Your project skill
    review/           # Your project skill
  agents/
    product-manager.md   # From claude-for-engineers
    qa-automation.md     # From claude-for-engineers
    security-expert.md   # From claude-for-engineers
    devops-engineer.md   # From claude-for-engineers
    dba-expert.md        # From claude-for-engineers
    penetration-agent.md # From claude-for-engineers
    my-builder.md        # Your project agent
  rules/
    workflow.md       # From claude-for-engineers
    prd-format.md     # From claude-for-engineers
    coding-style.md   # Your project rules
```
