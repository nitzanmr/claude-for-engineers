# Backlog — Agent Session Memory, PM Backlog, and Review Dashboard

Last updated: 2026-03-18 06:41 UTC by /execute (workflow-spec-fixes)

## Sessions
- 2026-03-18T00-40-00: introduced BLG-001 through BLG-030
- 2026-03-18T06-37-23: resolved BLG-022, BLG-023, BLG-024, BLG-028, BLG-029

## Open

- [ ] BLG-005 [Needed] BACKLOG_OUTPUT parsing has no fallback: silent empty state when PM output is missing or malformed — flagged by qa on 2026-03-18
- [ ] BLG-006 [Needed] MCP health check incomplete: partial MCP availability (tool-level denial) not handled in Step 0 — flagged by code-quality on 2026-03-18
- [ ] BLG-010 [Needed] Dashboard Step 5 parse algorithm unspecified: reads backlog.md but no parse rule defined — flagged by integration on 2026-03-18
- [ ] BLG-011 [Needed] File conflict detection missing in execute: parallel tasks touching same file not checked before launch — flagged by code-quality on 2026-03-18
- [ ] BLG-012 [Needed] Unexpected file modification handling missing in execute: no rollback or decision path for out-of-scope edits — flagged by code-quality on 2026-03-18
- [ ] BLG-013 [Desirable] pm-backlog display format inconsistency: doesn't show checkbox syntax referenced by Step 4 edit instructions — flagged by integration on 2026-03-18
- [ ] BLG-014 [Desirable] PRD execution log timing ambiguous: unclear whether logs are written per-task or per-wave — flagged by code-quality on 2026-03-18
- [ ] BLG-015 [Desirable] MCP memory grows unbounded: no compaction strategy or size monitoring — flagged by devops on 2026-03-18
- [ ] BLG-016 [Desirable] Step 2b zero-match case unspecified: no fallback when keyword scan matches no specialists — flagged by code-quality on 2026-03-18
- [ ] BLG-017 [Desirable] Swarm mode dependency assignment unclear: PRD-level deps not mapped to task-level blocking — flagged by code-quality on 2026-03-18
- [ ] BLG-018 [Desirable] Test execution responsibility unclear between agent and orchestrator — flagged by code-quality on 2026-03-18
- [ ] BLG-019 [Desirable] PASS_WITH_ISSUES too strict: medium-only findings trigger REVIEWED_NEEDS_FIXES same as high findings — flagged by code-quality on 2026-03-18
- [ ] BLG-020 [Desirable] Agent roster hardcoded in 3+ files: roster changes require multi-file updates — flagged by code-quality on 2026-03-18
- [ ] BLG-021 [Desirable] Circular dependency check incomplete for 3+ node cycles — flagged by code-quality on 2026-03-18
- [ ] BLG-025 [Hard] Severity aggregate emoji conventions inconsistent with rest of workflow — flagged by code-quality on 2026-03-18
- [ ] BLG-026 [Hard] No run-log retention/cleanup policy specified — flagged by devops on 2026-03-18
- [ ] BLG-027 [Hard] No health check for MCP server pointing to correct memory file — flagged by devops on 2026-03-18
- [ ] BLG-030 [Hard] No observable MCP memory size indicator or warning threshold — flagged by devops on 2026-03-18

## Deferred

(none)

## Resolved

- [x] BLG-022 [Desirable] team-research Step 0 bundle schema includes Execution Context section that doesn't exist during research phase — resolved 2026-03-18 (replaced with Research Context in team-research/SKILL.md Step 0)
- [x] BLG-023 [Desirable] PM Needed/Desirable/Hard categories not mapped to severity counts in review dashboard — resolved 2026-03-18 (PM mapping added to severity aggregate and verdict logic in team-review/SKILL.md)
- [x] BLG-024 [Hard] MEMORY_FILE_PATH in settings.json is relative and CWD-sensitive: silent failure if not launched from project root — resolved 2026-03-18 (absolute path setup instruction added to CLAUDE.md)
- [x] BLG-028 [Hard] review.md and backlog.md session linkage inconsistency possible in multi-run scenarios — resolved 2026-03-18 (Sessions index block added to backlog.md format in team-review/SKILL.md)
- [x] BLG-029 [Hard] "do NOT read current-topic.md" phrasing near "Current Topic" heading creates confusion across all agent files — resolved 2026-03-18 (positive framing applied to all 6 agent files)
- [x] BLG-001 [Needed] Legacy skills conflict with new agent Step 1 — resolved 2026-03-18 (all 6 skills updated to build session memory bundle)
- [x] BLG-002 [Needed] Run ID collision at minute granularity — resolved 2026-03-18 (run ID format changed to YYYY-MM-DDTHH-MM-SS in team-review, team-research, execute)
- [x] BLG-003 [Needed] run-log/ not gitignored — resolved 2026-03-18 (added .claude/context/run-log/*.md to .gitignore)
- [x] BLG-004 [Needed] pm-backlog MCP/backlog.md divergence — resolved 2026-03-18 (pm-backlog now writes BACKLOG_UPDATE to MCP on resolve/defer)
- [x] BLG-007 [Needed] CLAUDE.md setup path contradictory — resolved 2026-03-18 (corrected destination to .claude/settings.json, added run-log gitignore step)
- [x] BLG-008 [Needed] team-research and execute missing current-topic.md guard — resolved 2026-03-18 (guard added to Step 0 of both skills)
- [x] BLG-009 [Needed] BACKLOG_UPDATE cross-reference ambiguous — resolved 2026-03-18 (concrete example added to product-manager.md Step 1)
