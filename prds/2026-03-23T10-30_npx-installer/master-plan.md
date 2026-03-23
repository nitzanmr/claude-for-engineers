# Master Plan: Distributable NPX Installer

Created: 2026-03-23 10:30 UTC
Status: COMPLETED
PRDs Generated: 2026-03-23 10:45 UTC
Author: nitzan + claude

---

## Overview

Make `claude-for-engineers` installable via `npx claude-for-engineers`. A Node.js CLI installer copies the full workflow (skills, agents, rules, project instructions, MCP config) into a user's project — or globally — for their chosen AI runtime. Supports Claude Code, Gemini CLI, and Antigravity in v1.

Inspired by [`get-shit-done-cc`](https://github.com/gsd-build/get-shit-done).

---

## Goals

1. `npx claude-for-engineers` installs the full workflow with zero manual steps.
2. Supports three runtimes: Claude Code, Gemini CLI, Antigravity.
3. Supports both global (`~/.claude/`, `~/.gemini/`) and local (`.claude/`, `.gemini/`, `.agent/`) install targets.
4. Merge strategy: skip files that already exist, copy files that don't.
5. `--uninstall` flag removes only what the installer put there.
6. Zero npm runtime dependencies (Node built-ins only).
7. No user's absolute path ships in the npm tarball.

---

## Architecture Decisions

### AD-01: Single canonical source, runtime-specific transformation at install time
All source files live under `templates/`. The installer reads from `templates/` and transforms/routes per runtime. No pre-built Gemini or Antigravity template directories. One source of truth.

### AD-02: `files` allowlist in package.json (not `.npmignore`)
`package.json` `files` array is an allowlist — anything not listed is excluded. Safer than a denylist because new files default to excluded. Prevents `settings.local.json` and `agent-memory.json` from ever shipping.

### AD-03: `settings.json` ships with a placeholder path
`templates/.claude/settings.json` has `"REPLACE_WITH_LOCAL_PATH"` as `MEMORY_FILE_PATH`. The installer generates `settings.local.json` at install time using `path.resolve(process.cwd())`. No user's real path ever in the npm package.

### AD-04: Agents map differently per runtime
- Claude Code: `.claude/agents/*.md` (direct copy)
- Gemini CLI: `.gemini/agents/*.md` (direct copy — Gemini supports subagents via `experimental.enableSubagents: true`)
- Antigravity: no dedicated agents dir — agent `.md` files are installed as skills under `.agent/skills/<name>/SKILL.md`

### AD-05: Gemini slash commands via TOML
Gemini CLI slash commands require TOML files in `.gemini/commands/<namespace>/<name>.toml`. The installer converts each SKILL.md into a TOML file under `.gemini/commands/cfe/<name>.toml`. Invoked as `/cfe:plan`, `/cfe:prd`, etc.

### AD-05b: Gemini settings.json must include `experimental.enableSubagents: true`
The Gemini CLI runtime generates a `settings.json` (or merges into an existing one) that explicitly sets:
```json
{
  "experimental": {
    "enableSubagents": true
  }
}
```
Without this flag, `.gemini/agents/*.md` files are not loaded. The installer is responsible for ensuring this flag is present — both for new installs (write it) and merge installs (add the key if missing, don't overwrite the rest).

### AD-06: Merge strategy — skip existing, add new
If a file already exists at the destination, skip it. If it doesn't exist, copy it. No per-file prompts. One upfront confirmation if the target directory already exists.

### AD-07: Manifest tracking for uninstall
On install, write `.claude/.install-manifest.json` (or `.gemini/.install-manifest.json` / `.agent/.install-manifest.json`) listing every file the installer created. `--uninstall` reads this manifest and removes only those files.

### AD-08: Zero runtime dependencies
`bin/install.js` and all `lib/` files use only Node.js built-ins: `fs`, `path`, `os`, `readline`. No `inquirer`, no `chalk`, no `commander`. Matches GSD pattern. Node 20+ minimum.

---

## Runtime File Mapping

### Claude Code

| Source (templates/) | Destination (local) | Destination (global) |
|---|---|---|
| `.claude/skills/*/SKILL.md` | `.claude/skills/*/SKILL.md` | `~/.claude/skills/*/SKILL.md` |
| `.claude/agents/*.md` | `.claude/agents/*.md` | `~/.claude/agents/*.md` |
| `.claude/rules/*.md` | `.claude/rules/*.md` | `~/.claude/rules/*.md` |
| `.claude/settings.json` | `.claude/settings.json` | `~/.claude/settings.json` |
| `.claude/memory/.gitignore` | `.claude/memory/.gitignore` | `~/.claude/memory/.gitignore` |
| `CLAUDE.md` | `CLAUDE.md` | *(skip — no global project file)* |
| *(generated)* | `.claude/settings.local.json` | `~/.claude/settings.local.json` |
| *(generated)* | `prds/.gitkeep` | — |
| *(generated)* | `.claude/context/run-log/.gitkeep` | — |

### Gemini CLI

| Source (templates/) | Destination (local) | Destination (global) |
|---|---|---|
| `.claude/skills/*/SKILL.md` | `.gemini/skills/*/SKILL.md` | `~/.gemini/skills/*/SKILL.md` |
| `.claude/agents/*.md` | `.gemini/agents/*.md` | `~/.gemini/agents/*.md` |
| `.claude/rules/*.md` | `.gemini/rules/*.md` | `~/.gemini/rules/*.md` |
| `.claude/settings.json` | `.gemini/settings.json` + `experimental.enableSubagents: true` | `~/.gemini/settings.json` |
| `CLAUDE.md` | `GEMINI.md` | `~/.gemini/GEMINI.md` |
| *(generated TOML)* | `.gemini/commands/cfe/<name>.toml` | `~/.gemini/commands/cfe/<name>.toml` |

### Antigravity

| Source (templates/) | Destination (local) | Destination (global) |
|---|---|---|
| `.claude/skills/*/SKILL.md` | `.agent/skills/*/SKILL.md` | `~/.gemini/antigravity/skills/*/SKILL.md` |
| `.claude/agents/*.md` | `.agent/skills/<name>/SKILL.md` | `~/.gemini/antigravity/skills/<name>/SKILL.md` |
| `.claude/rules/*.md` | `.agent/rules/*.md` | `~/.gemini/antigravity/rules/*.md` |
| `CLAUDE.md` | `GEMINI.md` | — |
| *(generated)* | `.agent/AGENTS.md` | — |
| *(generated TOML)* | `.gemini/commands/cfe/<name>.toml` | `~/.gemini/commands/cfe/<name>.toml` |

---

## PRD Dependency Graph

```
PRD-01: Package Foundation
  └── PRD-02: Core Installer Engine
        ├── PRD-03: Claude Runtime ────────┐
        ├── PRD-04: Gemini CLI Runtime ────┼── PRD-06: Uninstall + Validation
        └── PRD-05: Antigravity Runtime ───┘
```

PRD-01 must complete before PRD-02.
PRD-02 must complete before PRD-03, PRD-04, PRD-05.
PRD-03, PRD-04, PRD-05 are independent and run in parallel.
PRD-06 depends on PRD-03, PRD-04, PRD-05.

---

## PRD Summary

| PRD | Title | Complexity | Depends On | Tasks (est.) |
|---|---|---|---|---|
| PRD-01 | Package Foundation | Low | — | 4 |
| PRD-02 | Core Installer Engine | Medium | PRD-01 | 5 |
| PRD-03 | Claude Code Runtime | Medium | PRD-02 | 4 |
| PRD-04 | Gemini CLI Runtime | Medium | PRD-02 | 4 |
| PRD-05 | Antigravity Runtime | Medium | PRD-02 | 4 |
| PRD-06 | Uninstall + Validation | Low | PRD-03, 04, 05 | 3 |

Total: 6 PRDs, 24 tasks.

---

## Out of Scope (v1)

- MCP server distribution (`--mcp` flag / `@claude-for-engineers/mcp` package)
- Codex / Cursor / OpenCode runtime support
- Upgrade detection (version stamps, diff-based updates)
- Automatic Makefile merging (skip if Makefile already exists)
- Per-file conflict resolution (prompt per file)
- CI/CD for npm publish (manual `npm publish` for v1)
- Web installer / install script (`curl | bash` style)
- Telemetry or install analytics

---

## Open Questions

*(All resolved during planning)*

| Question | Decision |
|---|---|
| Which runtimes for v1? | All three: Claude Code, Gemini CLI, Antigravity |
| MCP server in v1? | No — file-copy only |
| Global + local? | Yes, both |
| Package name? | `claude-for-engineers` |
| settings.json handling? | Installer auto-generates `settings.local.json` from `process.cwd()` |
| File sourcing? | `templates/` bundle in npm package (option a) |
| Agents on Gemini/Antigravity? | Gemini: direct copy to `.gemini/agents/`; Antigravity: convert to skills |
| Conflict handling? | Merge: skip existing, copy new |
