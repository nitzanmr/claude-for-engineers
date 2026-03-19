## Code Review: Agent Session Memory, PM Backlog, and Review Dashboard

Date: 2026-03-18 00:40 UTC
PRD Directory: prds/2026-03-17T14-30_agent-session-memory/
Session Memory: .claude/context/run-log/2026-03-18T00-40.md

### Overall Assessment
NEEDS_FIXES

---

### Spec Compliance

**Result: PASS — 12/12 tasks EXACT**

All 3 PRDs, 12 tasks executed with exact spec compliance. Every acceptance criterion passed.

| PRD | Tasks | Result |
|-----|-------|--------|
| PRD-01: Session Memory Builder | 6/6 | EXACT |
| PRD-02: PM Backlog System | 3/3 | EXACT |
| PRD-03: Auto-Specialist + Dashboard | 3/3 | EXACT |

No deviations found. All files created/modified as specified.

---

### Code Quality

**Result: HAS_ISSUES — execute/SKILL.md is NEEDS_ATTENTION; all other files HAS_ISSUES**

**HIGH issues:**

- **team-review/SKILL.md** — Run ID at `YYYY-MM-DDTHH-MM` granularity allows concurrent runs to overwrite each other's session bundle
- **team-review/SKILL.md** — MCP health check treats availability as binary; no handling for partial availability (tool-level denial demonstrated this session)
- **execute/SKILL.md** — File conflict detection missing: parallel tasks touching same file not checked before launch
- **execute/SKILL.md** — Unexpected file modification policy missing: no rollback or decision path when agent modifies out-of-scope files
- **execute/SKILL.md** — PRD execution log timing ambiguous: unclear whether logs are written per-task or per-wave
- **product-manager.md** — Backlog retrieval instruction ambiguous: no example of how to reconstruct item state from BACKLOG_UPDATE cross-references

**MEDIUM issues (sample):**

- Agent list hardcoded in 3+ files (roster changes require multi-file updates)
- Step 2b zero-match case unspecified
- Swarm mode dependency assignment unclear
- team-research Step 0 bundle schema includes Execution Context (doesn't exist during research phase)
- PASS_WITH_ISSUES → REVIEWED_NEEDS_FIXES may be too strict for medium-only findings

---

### Integration

**Result: CRITICAL + HIGH issues found**

**CRITICAL:**
- **6 legacy review skills still use old pattern** — `.claude/skills/qa-review/`, `security-review/`, `devops-review/`, `dba-review/`, `pentest/`, `pm-review/` all still read `current-topic.md` directly and don't build a session memory bundle. The updated agent Step 1 instructions say "do NOT read current-topic.md yourself." These will silently misbehave on next use.

**HIGH:**
- **pm-backlog display format inconsistent** — display doesn't show checkbox syntax that Step 4 edit instructions reference
- **Dashboard parse algorithm unspecified** — Step 5 reads backlog.md but no task specifies how to parse it
- **PM Needed/Desirable/Hard categories not mapped to severity counts** — PM output format is orthogonal to Critical/High/Medium/Low aggregate

**MEDIUM:**
- PM categorization excluded from severity aggregate in dashboard

---

### Specialist Reviews

#### DevOps Review

**HIGH:**
- `.claude/context/run-log/` not gitignored — every run snapshot committed unless engineer manually adds rule
- No retention/cleanup policy for run-log snapshots
- MCP memory (`agent-memory.json`) grows unbounded — no compaction strategy, no size monitoring
- `CLAUDE.md` setup instruction contradictory: says copy `settings.json` to "project root" but destination should be `.claude/settings.json`

**MEDIUM:**
- Run ID collision at minute granularity (cross-agent pattern with code-quality)
- `MEMORY_FILE_PATH` in settings.json is relative and CWD-sensitive — silent failure if Claude Code not launched from project root

**LOW:**
- No health check for verifying MCP server is pointing to correct memory file
- No observable MCP size indicator

#### QA Review

**HIGH:**
- `BACKLOG_OUTPUT` parsing has no fallback — if PM emits no section or malformed output, `backlog.md` silently shows "No items yet." with no failure signal
- `team-research` and `execute` Step 0 missing current-topic.md guard (`team-review` has it; others don't)
- `pm-backlog` edits `backlog.md` directly but does NOT write `BACKLOG_UPDATE:` to MCP — after any `/pm-backlog` update, MCP memory and `backlog.md` permanently diverge

**MEDIUM:**
- BLG-NNN ID collision possible on parallel review sessions before MCP is flushed (cross-agent pattern)
- Several vague/untestable acceptance criteria (PRD-02 "links to run-log", PRD-03 "emoji indicators", PRD-03 "penetration-agent requires confirmation")

**Suggested quality gates:**
```sh
# No agent still calls search_nodes independently in Step 1
grep -r "search_nodes" .claude/agents/  # should only show "do NOT" prohibition lines

# workflow.md contains both new status values
grep -c "REVIEWED_PASS\|REVIEWED_NEEDS_FIXES" .claude/rules/workflow.md  # should return ≥ 2

# run-log directory tracked in git
git ls-files .claude/context/run-log/.gitkeep  # should return the file path
```

---

### PM Synthesis

**Cross-agent patterns (highest signal):**

1. **Run ID collision** — flagged by code-quality (HIGH) + devops (MEDIUM) + qa (indirectly). Same root cause as BLG-NNN collision.
2. **pm-backlog / MCP divergence** — flagged by QA (HIGH) + integration (HIGH display mismatch). Root cause: pm-backlog was spec'd as a file editor without MCP sync.
3. **current-topic.md guard gap** — team-review has it, team-research and execute don't. Inconsistency in guard coverage.
4. **Dashboard parse unspecified** — flagged by integration + code-quality. Step 5 assumes parsing that was never specified.

**Needed Improvements (do before next use):**
- BLG-001: Migrate 6 legacy skills to session memory pattern
- BLG-002: Fix Run ID collision (add randomness or second-level precision)
- BLG-003: Add `.gitignore` for run-log snapshots
- BLG-004: Add MCP BACKLOG_UPDATE write to pm-backlog skill
- BLG-005: Add BACKLOG_OUTPUT parse fallback to team-review Step 4b
- BLG-006: Handle partial MCP availability in Step 0 health check
- BLG-007: Fix CLAUDE.md setup path instruction
- BLG-008: Add current-topic.md guard to team-research and execute Step 0
- BLG-009: Clarify BACKLOG_UPDATE cross-reference example in product-manager.md
- BLG-010: Specify dashboard parse algorithm in team-review Step 5
- BLG-011: Add file conflict detection pre-check in execute
- BLG-012: Add out-of-scope file modification policy in execute

**Desirable (next iteration):**
- BLG-013 through BLG-023

**Hard Addons (separate planning session):**
- BLG-024 through BLG-030
