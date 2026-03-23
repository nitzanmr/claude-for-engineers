# claude-for-engineers

A workflow system for planning and executing features with Claude Code, Gemini CLI, and Antigravity.

Inspired by [get-shit-done-cc](https://github.com/gsd-build/get-shit-done).

## Install

```bash
npx claude-for-engineers
```

The installer will ask which AI runtime to install for and whether to install globally or locally.

## Runtimes

| Runtime | Install target (local) | Install target (global) |
|---|---|---|
| Claude Code | `.claude/` | `~/.claude/` |
| Gemini CLI | `.gemini/` | `~/.gemini/` |
| Antigravity | `.agent/` | `~/.gemini/antigravity/` |

## Flags

```bash
# Non-interactive — specify runtime and scope directly
npx claude-for-engineers --claude --local
npx claude-for-engineers --gemini --global
npx claude-for-engineers --antigravity --local

# Uninstall (removes only installer-created files)
npx claude-for-engineers --claude --local --uninstall
```

## What Gets Installed

- **15 workflow skills**: `/plan`, `/prd`, `/execute`, `/retro`, `/team-research`, `/team-review`, and more
- **6 specialist agents**: Product Manager, QA Automation, Security Expert, DevOps Engineer, DBA Expert, Penetration Agent
- **3 rule documents**: workflow spec, PRD format, session memory schema
- **Project instructions**: `CLAUDE.md` (Claude) or `GEMINI.md` (Gemini/Antigravity)
- **MCP memory config**: `settings.json` + auto-generated `settings.local.json` with your project's absolute path

## Workflow

```
/plan  -->  /prd  -->  /execute  -->  /retro
 Talk       Spec       Build         Learn
```

See [CLAUDE.md](./CLAUDE.md) for the full workflow documentation.

## Requirements

- Node.js 20+
- One of: Claude Code, Gemini CLI 0.24+, or Antigravity

## Uninstall

```bash
npx claude-for-engineers --claude --local --uninstall
```

Removes only the files created by the installer. Your own skills, agents, and PRDs are never touched.
