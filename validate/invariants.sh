#!/usr/bin/env bash
# Validates structural invariants in .claude/ files.
# Checks: no agent independently calls search_nodes, orchestrating skills
# use second-precision run IDs, orchestrating skills have set-context guard.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

# ──────────────────────────────────────────────────────────────────────
# 1. No agent independently calls search_nodes
#    (agents must use the pre-fetched bundle, not call MCP directly)
# ──────────────────────────────────────────────────────────────────────
echo "Checking: no agent calls search_nodes independently..."
COUNT=$(grep -rn "search_nodes(" "$ROOT/.claude/agents/" 2>/dev/null | grep -v "^Binary" | wc -l | tr -d ' ' || true)
if [ "$COUNT" -gt 0 ]; then
  echo "FAIL: agents/ contain $COUNT reference(s) to search_nodes() calls — agents must use the session bundle"
  grep -rn "search_nodes(" "$ROOT/.claude/agents/" 2>/dev/null
  ERRORS=$((ERRORS + 1))
else
  echo "OK: no agents independently call search_nodes"
fi

# ──────────────────────────────────────────────────────────────────────
# 2. Orchestrating skills use second-precision run ID format
#    (YYYY-MM-DDTHH-MM-SS — prevents collisions in same minute)
# ──────────────────────────────────────────────────────────────────────
echo "Checking: orchestrating skills specify second-precision run ID..."
for SKILL in team-review execute team-research; do
  SKILL_FILE="$ROOT/.claude/skills/$SKILL/SKILL.md"
  if ! grep -q "YYYY-MM-DDTHH-MM-SS" "$SKILL_FILE" 2>/dev/null; then
    echo "FAIL: .claude/skills/$SKILL/SKILL.md missing YYYY-MM-DDTHH-MM-SS run ID format"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK: $SKILL uses second-precision run ID"
  fi
done

# ──────────────────────────────────────────────────────────────────────
# 3. Orchestrating skills have current-topic guard
#    (must stop if current-topic.md is missing or all placeholders)
# ──────────────────────────────────────────────────────────────────────
echo "Checking: orchestrating skills have /set-context guard..."
for SKILL in team-review execute team-research; do
  SKILL_FILE="$ROOT/.claude/skills/$SKILL/SKILL.md"
  if ! grep -q "set-context\|/set-context" "$SKILL_FILE" 2>/dev/null; then
    echo "FAIL: .claude/skills/$SKILL/SKILL.md missing /set-context guard"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK: $SKILL has /set-context guard"
  fi
done

# ──────────────────────────────────────────────────────────────────────
echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "$ERRORS invariant(s) failed."
  exit 1
fi
echo "All invariants passed."
