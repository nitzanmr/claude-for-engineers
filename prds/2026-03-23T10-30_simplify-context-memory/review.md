## Code Review: Simplify Context and Memory Infrastructure

Date: 2026-03-23 11:30 UTC
PRD Directory: prds/2026-03-23T10-30_simplify-context-memory/
Session Memory: .claude/context/run-log/2026-03-23T11-00-00.md

### Overall Assessment
PASS_WITH_ISSUES

### Spec Compliance
- **Task 1: Remove MCP from security-expert**: EXACT match.
- **Task 2: Remove MCP from devops-engineer**: EXACT match.
- **Tasks 3-6 (qa-automation, dba-expert, penetration-agent, product-manager)**: Files modified according to execution log.
- **PRD-02 & PRD-03**: Structural changes (file deletions/modifications) align with PRD objectives.

### Code Quality
- **Agent Definitions**: Correctly updated (product-manager.md, security-expert.md). Logic for parsing backlog.md is clear.
- **Recommendation**: Follow-up review on auto-deriving context in SKILL files to ensure robustness and graceful handling of missing files.

### Specialist Reviews

#### dba-expert Report
- **Collision Prevention**: Run ID format with seconds (YYYY-MM-DDTHH-MM-SS) ensures unique IDs.
- **Data Integrity**: Using backlog.md and master-plan.md as direct sources of truth eliminates redundancy and desynchronization.
- **Simplified Assembly**: session-memory-schema.md provides clear, consolidated logic for building agent context bundles.

#### security-expert Report
- **Complexity Reduction**: Good. Removed complex dependency.
- **Potential Risk (Medium)**: Potential path traversal risk in context derivation logic in `.claude/rules/session-memory-schema.md` and `.claude/skills/execute/SKILL.md`. Malicious PRD directory input (e.g., `../secrets`) might allow reading/writing files outside `prds/`.
- **Recommendation**: Validate directory names to contain only safe characters (alphanumeric, hyphens, underscores).

#### devops-engineer Report
- **Risk (Yellow)**: `CLAUDE.md` and `templates/CLAUDE.md` still contain setup instructions and permissions for the now-removed MCP memory workflow.
- **Cleared**: Backward compatibility confirmed. Orchestration stability improved with auto-derived context.
- **Observability**: Improved with file-based run logs.

### PM Synthesis
## PM Synthesis — Simplify Context and Memory Infrastructure

### Needed Improvements (do before merge/deploy)
- [ ] **Validate PRD directory names for path traversal** — Potential path traversal risk in context derivation logic in `.claude/rules/session-memory-schema.md` and `.claude/skills/execute/SKILL.md`. Malicious PRD directory input (e.g., `../secrets`) might allow reading/writing files outside `prds/`. Flagged by **security-expert**.
- [ ] **Remove stale MCP references from CLAUDE.md** — `CLAUDE.md` and `templates/CLAUDE.md` still contain setup instructions and permissions for the now-removed MCP memory workflow. Flagged by **devops-engineer**.

### Desirable Additions (do soon, not blocking)
- [ ] **Robust auto-deriving context in SKILL files** — Enhance SKILL files to ensure robustness and graceful handling of missing files during context assembly. Flagged by **code-quality**.

### Hard Addons (separate planning session needed)
- None

### Cross-Agent Patterns
Both **security-expert** and **devops-engineer** flagged issues related to the transition: security identified a safety risk in the new logic (path traversal), while devops found lingering artifacts (stale documentation and permissions) of the old logic. This confirms that while the core migration is successful, "last mile" hardening and cleanup are the primary remaining tasks for stability and security.

### Improvement Plan (sequenced)
1. **Harden Path Traversal Checks (BLG-001)**: Implement validation (e.g., regex restricting to alphanumeric/hyphens/underscores) for PRD directory names in `session-memory-schema.md` and `execute/SKILL.md`. This is the top priority to ensure system integrity.
2. **Complete Documentation Scrub (BLG-002)**: Thoroughly remove all setup instructions and permission blocks related to the deprecated MCP workflow from `CLAUDE.md` and `templates/CLAUDE.md` to prevent developer confusion and reduce unnecessary permission overhead.
3. **Enhance Context Robustness (BLG-003)**: Add defensive checks (e.g., file existence verification) and graceful fallbacks in context-derivation logic to ensure the system handles missing files without crashing.
