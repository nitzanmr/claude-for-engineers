# Master Plan: v0.2 — Installer Upgrades, Workflow Spec Hardening, Skill & Agent Quality

Created: 2026-03-24 08:23 UTC
Status: COMPLETED
PRDs Generated: 2026-03-24 09:15 UTC
Author: nitzanmr

---

## Overview

This release hardens the entire claude-for-engineers system across four areas discovered during a full `/team-research` audit:

1. **Installer** — Change from "skip existing files" to "overwrite package-owned files on every run," enabling upgrades. Add reliability fixes, JSONC comments to settings.json, and integration tests.
2. **Workflow rules** — Fill spec gaps: define PARTIAL semantics, formalize task-level dependencies, add integration test PRD guidance, clarify review→merge decision path.
3. **Skills** — Add missing `allowed-tools` declarations, expand underdeveloped utility skills, improve approval gate consistency.
4. **Agents** — Standardize emoji severity across all 6 specialists, eliminate repeated session bundle assembly instructions by pointing to the canonical schema.

Version bump: `0.1.0` → `0.2.0`

---

## Goals

- Users who re-run the installer get the latest skills, agents, and rules automatically (upgrade path exists)
- `settings.json` explains its own permissions via JSONC comments so engineers understand swarm mode requirements
- Workflow spec has no undefined states or missing templates (PARTIAL, task deps, integration test PRD, merge decision)
- All 15 skills declare their tool access explicitly
- All 6 agents use the same severity emoji scale, reducing dashboard mapping fragility
- Session bundle assembly is DRY — skills reference the schema, not repeat the steps

---

## Architecture Decisions

### AD-1: File Ownership Model
Files from `templates/` are **package-owned** and overwritten on every install/upgrade:
- `.claude/skills/*/SKILL.md`
- `.claude/agents/*.md`
- `.claude/rules/*.md`
- `settings.json` (only package permissions + env var — no user MCP content)
- `CLAUDE.md` / `GEMINI.md` / `AGENTS.md`

Files that are **never touched** by the installer:
- `settings.local.json` — user MCP servers, API keys, custom env vars
- `.claude/context/current-topic.md` — user project context
- `prds/` — all PRD content
- `.claude/context/run-log/` — ephemeral session snapshots

Files that are **append-only** (check before appending, no duplicates):
- `.gitignore`

### AD-2: Upgrade Detection
Installer checks for existing manifest (`.install-manifest.json`). If found: "Upgrading from vX.Y.Z → 0.2.0 — updated N files." If not found: "Installing claude-for-engineers 0.2.0."

Show count of updated files, not a file-by-file diff.

### AD-3: settings.json as JSONC
`templates/.claude/settings.json` uses JSONC format (inline `//` comments). Comments explain what each permission enables and why swarm mode requires them. Users are directed to `settings.local.json` for MCP servers and custom config.

### AD-4: PARTIAL Task Status Semantics
`PARTIAL` for a task means: the task ran to completion but not all acceptance criteria passed. It is distinct from `FAILED` (task could not complete). A `PARTIAL` task blocks dependent tasks by default unless the engineer explicitly overrides.

### AD-5: Task-Level Dependencies
Tasks within a PRD can declare `Depends on: Task N` in their header. `/execute` validates these within-PRD chains the same way it validates PRD-level DAGs. Circular task deps are an error.

### AD-6: Integration Test PRD Convention
Every feature MUST end with an integration test PRD that depends on all implementation PRDs. It is named `prd-NN_integration-tests.md` and contains only test tasks. It counts toward the PRD total.

### AD-7: Review → Merge Decision
After `/team-review`, backlog categories determine merge readiness:
- **Needed** → must be fixed before merge (create follow-up PRDs or fix inline)
- **Desirable** → can merge, track in issue tracker
- **Hard** → requires re-planning; do not merge

### AD-8: Severity Emoji Standardization
All 6 agents use one shared scale:
- 🔴 Critical — must fix before merge
- 🟠 High — should fix soon, blocks recommended merge
- 🟡 Medium — fix in follow-up
- 🟢 Low / Note — informational

### AD-9: DRY Session Bundle
Skill files remove their inline session bundle assembly steps. They reference `.claude/rules/session-memory-schema.md` instead: "Follow the assembly steps in `.claude/rules/session-memory-schema.md`." The schema file is the single source of truth.

---

## PRD Dependency Graph

```
PRD-01 (Installer: overwrite + upgrade detection)
  ├──► PRD-02 (Installer: settings.json JSONC + settings.local.json guidance)
  ├──► PRD-03 (Installer: reliability fixes)
  └──► (all above) ──► PRD-04 (Installer: integration tests)

PRD-05 (Rules: PARTIAL + task deps + Master Plan status)
  └──► PRD-06 (Rules: integration test PRD template + review→merge decision)

PRD-07 (Skills: allowed-tools + approval gate consistency)   [independent]
PRD-08 (Skills: expand /retro, /check-setup, /set-context, team-research swarm)  [independent]
PRD-09 (Agents: severity standardization + DRY session bundle)  [independent]
PRD-10 (Package: version bump 0.1.0 → 0.2.0)  [depends on all above]
```

Wave plan:
- **Wave 1 (parallel):** PRD-01, PRD-05, PRD-07, PRD-08, PRD-09
- **Wave 2 (parallel):** PRD-02, PRD-03, PRD-06 (after PRD-01 and PRD-05 complete)
- **Wave 3:** PRD-04 (after PRD-02 and PRD-03 complete)
- **Wave 4:** PRD-10 (after all complete)

---

## PRD Summary

| PRD | Title | Depends On | Complexity | Tasks |
|-----|-------|-----------|-----------|-------|
| PRD-01 | Installer: overwrite logic + upgrade detection | None | Medium | 4 |
| PRD-02 | Installer: settings.json JSONC comments | PRD-01 | Low | 2 |
| PRD-03 | Installer: reliability fixes | PRD-01 | Medium | 3 |
| PRD-04 | Installer: integration tests | PRD-01, PRD-02, PRD-03 | Medium | 3 |
| PRD-05 | Rules: PARTIAL semantics + task deps + Master Plan status | None | Medium | 3 |
| PRD-06 | Rules: integration test PRD template + review→merge decision | PRD-05 | Low | 2 |
| PRD-07 | Skills: allowed-tools + approval gate consistency | None | Low | 2 |
| PRD-08 | Skills: expand /retro, /check-setup, /set-context, team-research swarm | None | Medium | 4 |
| PRD-09 | Agents: severity standardization + DRY session bundle | None | Low | 2 |
| PRD-10 | Package: version bump 0.1.0 → 0.2.0 | All | Low | 1 |

Total: 10 PRDs, 26 tasks

---

## Out of Scope

- New agent domains (performance expert, accessibility expert) — deferred to v0.3
- Dry-run installer flag — deferred
- Verbose installer flag — deferred
- Runtime verification (checking if Claude Code / Gemini CLI is installed) — deferred
- Custom template paths — deferred
- Selective installation (install subset of skills) — deferred
- Windows platform testing — deferred
- Cursor / Codex / open-source runtime support — deferred

---

## Open Questions

_(none — all resolved during planning conversation)_
