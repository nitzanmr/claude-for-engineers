# Master Plan: Security Fixes, Test Suite, and Top Improvements

Created: 2026-03-18 11:15 UTC
Status: COMPLETED
PRDs Generated: 2026-03-18 11:40 UTC
Author: Nitzan (via /team-research audit)

## Overview

This feature implements the high-impact findings from a parallel security, QA, and improvement audit of the claude-for-engineers repo. It fixes two active security vulnerabilities (prompt injection and PII leak), adds a validate/ test suite to catch regressions, and extracts the session memory bundle schema into a single authoritative doc.

## Goals

- Fix prompt injection surface in plan/prd/retro skill files
- Remove developer's real filesystem path from committed settings.json
- Pin the npm MCP package to a specific version
- Block destructive MCP memory operations by default
- Establish a validate/ test suite that catches known failure modes
- Create a single authoritative session memory bundle schema doc
- Add /check-setup skill to catch configuration errors before they cause silent failures

## Architecture Decisions

- Decision 1: Move MEMORY_FILE_PATH to settings.local.json (gitignored) rather than keeping a placeholder in settings.json. This is the correct pattern — settings.json is the committed template, settings.local.json holds machine-specific values. Claude Code merges both files at startup.
- Decision 2: Sanitize {{argument}} in skill files by: (a) wrapping free-text args in `<user-request>` tags in plan/SKILL.md, and (b) adding an explicit validation instruction for path-used args in prd/SKILL.md and retro/SKILL.md. No preprocessing layer exists; the sanitization is instructional (LLM-enforced) — a noted limitation.
- Decision 3: validate/ scripts use only Node.js built-ins (fs, path) — no package.json needed. Shell scripts use bash builtins and grep only. No external tooling dependencies.
- Decision 4: Session memory schema extracted to .claude/rules/session-memory-schema.md. Skill files reference it instead of duplicating it. The "how to assemble" instructions stay in each skill but the schema format (what the bundle looks like) lives in one place.
- Decision 5: /check-setup skill depends on PRD-01 (correct settings.json structure) and PRD-03 (validate scripts exist) because it references both.

## PRD Dependency Graph

```
PRD-01 (no deps) ──┐
PRD-02 (no deps)   ├──> PRD-05 (depends: 01, 03)
PRD-03 (no deps) ──┘
PRD-04 (no deps) [independent — runs in parallel with all others]
```

## PRD Summary

| # | Name | Dependencies | Tasks | Complexity |
|---|------|-------------|-------|------------|
| 01 | Settings.json security fixes | None | 4 | Low |
| 02 | Input sanitization in skill files | None | 3 | Low |
| 03 | Validate test suite | None | 6 | Medium |
| 04 | Session memory bundle schema doc | None | 4 | Low |
| 05 | /check-setup validation skill | PRD-01, PRD-03 | 2 | Low |

## Out of Scope

- Cryptographic signing or integrity checks on skill files
- Server-side prompt injection prevention (impossible in current LLM architecture)
- CI/CD pipeline integration (GitHub Actions) — separate planning session needed
- Role-scoped session bundles (filtering what each agent receives) — too complex for this sprint
- Agent coordination rules doc — separate planning session needed
- Example PRD directory — separate planning session needed
- Swarm vs task mode decision tree — separate planning session needed

## Open Questions

(none — all resolved during audit)
