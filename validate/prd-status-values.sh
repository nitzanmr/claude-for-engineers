#!/usr/bin/env bash
# Validates that all "Status:" lines in prds/ use values from the defined set.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

VALID="PENDING|IN_PROGRESS|COMPLETED|PARTIAL|BLOCKED|REVIEWED_PASS|REVIEWED_NEEDS_FIXES|DRAFT|APPROVED|PRDS_GENERATED|RETRO_COMPLETE|FAILED"

if [ ! -d "$ROOT/prds" ]; then
  echo "No prds/ directory — nothing to validate."
  exit 0
fi

# Find Status: lines that don't match the valid set
INVALID=$(grep -rn "^Status:" "$ROOT/prds/" 2>/dev/null \
  | grep -vE "Status:\s*($VALID)\s*$" \
  | grep -v "^Binary" || true)

if [ -n "$INVALID" ]; then
  echo "FAIL: Invalid status values found:"
  echo "$INVALID"
  echo ""
  echo "Valid values: $VALID"
  exit 1
fi

COUNT=$(grep -rn "^Status:" "$ROOT/prds/" 2>/dev/null | grep -v "^Binary" | wc -l | tr -d ' ')
echo "OK: All $COUNT status value(s) in prds/ are valid."
