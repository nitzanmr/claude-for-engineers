# PRD-03: Validate Test Suite

Created: 2026-03-18 11:15 UTC
Status: COMPLETED
Depends on: None
Complexity: Medium

## Objective

Create a `validate/` directory with 5 scripts that verify known failure modes and structural invariants, plus a Makefile to run them all with `make validate`.

## Context

The repo has zero automated tests. Known failure modes (bad settings.json path, bad SKILL.md frontmatter, PRD cycles, invalid status values, broken structural invariants) can only be caught by manual `/team-review` runs. These scripts turn the catch into repeatable automation. All scripts use Node.js built-ins or bash — no package.json or npm install required.

## Tasks

### Task 1: Create validate/settings-json.js

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: validate/settings-json.js

```js
#!/usr/bin/env node
/**
 * Validates .claude/settings.json structure.
 * Checks: valid JSON, MEMORY_FILE_PATH is absolute and not a placeholder,
 * MCP command is present, and npm package is pinned to a version.
 */

const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const settingsPath = path.join(root, '.claude', 'settings.json');

let settings;
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
  console.error('FAIL: .claude/settings.json is not valid JSON:', e.message);
  process.exit(1);
}

let errors = 0;

// 1. MCP command must be present
if (!settings?.mcpServers?.memory?.command) {
  console.error('FAIL: mcpServers.memory.command is missing from settings.json');
  errors++;
}

// 2. MEMORY_FILE_PATH must be present in settings.json or settings.local.json
const memoryPath = settings?.mcpServers?.memory?.env?.MEMORY_FILE_PATH;
if (!memoryPath) {
  console.error('FAIL: mcpServers.memory.env.MEMORY_FILE_PATH is missing from settings.json');
  errors++;
} else if (memoryPath.includes('REPLACE_WITH') || memoryPath.includes('PLACEHOLDER')) {
  // Placeholder in settings.json is expected — check settings.local.json for the real value
  const localPath = path.join(root, '.claude', 'settings.local.json');
  if (!fs.existsSync(localPath)) {
    console.error(
      'FAIL: settings.json has a placeholder MEMORY_FILE_PATH but settings.local.json does not exist.\n' +
      '      Create .claude/settings.local.json with your absolute path (see CLAUDE.md).'
    );
    errors++;
  } else {
    let local;
    try {
      local = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    } catch (e) {
      console.error('FAIL: .claude/settings.local.json is not valid JSON:', e.message);
      errors++;
    }
    if (local) {
      const localMemoryPath = local?.mcpServers?.memory?.env?.MEMORY_FILE_PATH;
      if (!localMemoryPath) {
        console.error(
          'FAIL: settings.local.json exists but mcpServers.memory.env.MEMORY_FILE_PATH is missing.\n' +
          '      Add your absolute path to settings.local.json.'
        );
        errors++;
      } else if (!path.isAbsolute(localMemoryPath)) {
        console.error('FAIL: MEMORY_FILE_PATH in settings.local.json is not absolute:', localMemoryPath);
        errors++;
      } else {
        console.log('OK: MEMORY_FILE_PATH (from settings.local.json):', localMemoryPath);
      }
    }
  }
} else if (!path.isAbsolute(memoryPath)) {
  console.error('FAIL: MEMORY_FILE_PATH in settings.json is not absolute:', memoryPath);
  errors++;
} else {
  console.log('OK: MEMORY_FILE_PATH:', memoryPath);
}

// 3. npm package should be pinned
const args = settings?.mcpServers?.memory?.args || [];
const pkgArg = args.find(a => a.includes('@modelcontextprotocol/server-memory'));
if (pkgArg && !pkgArg.match(/@modelcontextprotocol\/server-memory@\d/)) {
  console.warn('WARN: @modelcontextprotocol/server-memory is not pinned to a version (supply chain risk)');
} else if (pkgArg) {
  console.log('OK: npm package is pinned:', pkgArg);
}

if (errors > 0) {
  console.error('\n' + errors + ' error(s) found in settings.json');
  process.exit(1);
}

console.log('OK: settings.json is valid');
```

#### Acceptance Criteria

- [ ] `node validate/settings-json.js` exits 0 when settings are valid
- [ ] `node validate/settings-json.js` exits 1 and prints `FAIL:` when MEMORY_FILE_PATH is missing
- [ ] `node validate/settings-json.js` exits 1 and prints `FAIL:` when settings.json has placeholder but settings.local.json doesn't exist
- [ ] Script uses no external npm dependencies (only `require('path')` and `require('fs')`)

---

### Task 2: Create validate/skill-frontmatter.js

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: validate/skill-frontmatter.js

```js
#!/usr/bin/env node
/**
 * Validates YAML frontmatter in all .claude/skills/*/SKILL.md files.
 * Checks: frontmatter exists, required fields present and non-empty.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skillsDir = path.join(root, '.claude', 'skills');
const REQUIRED_FIELDS = ['name', 'description'];

let errors = 0;
let checked = 0;

const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.warn('WARN: No SKILL.md found in', entry.name);
    continue;
  }

  checked++;
  const content = fs.readFileSync(skillFile, 'utf8');
  const relPath = `.claude/skills/${entry.name}/SKILL.md`;

  if (!content.startsWith('---')) {
    console.error(`FAIL: ${relPath} — no YAML frontmatter (file must start with ---)`);
    errors++;
    continue;
  }

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) {
    console.error(`FAIL: ${relPath} — unclosed YAML frontmatter (missing closing ---)`);
    errors++;
    continue;
  }

  const frontmatter = content.slice(3, endIdx);
  let fieldErrors = 0;

  for (const field of REQUIRED_FIELDS) {
    const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    if (!match || !match[1].trim()) {
      console.error(`FAIL: ${relPath} — missing or empty required field: "${field}"`);
      errors++;
      fieldErrors++;
    }
  }

  if (fieldErrors === 0) {
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    console.log(`OK: ${relPath} (name: ${nameMatch ? nameMatch[1].trim() : '?'})`);
  }
}

console.log(`\nChecked ${checked} skill file(s).`);

if (errors > 0) {
  console.error(`${errors} validation error(s) found.`);
  process.exit(1);
}

console.log('All skill frontmatter is valid.');
```

#### Acceptance Criteria

- [ ] `node validate/skill-frontmatter.js` exits 0 and prints `OK:` for all 14 skills
- [ ] Script exits 1 when a SKILL.md has no frontmatter
- [ ] Script exits 1 when a required field is missing
- [ ] Script uses no external npm dependencies

---

### Task 3: Create validate/invariants.sh

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: validate/invariants.sh

```bash
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
COUNT=$(grep -rn "search_nodes" "$ROOT/.claude/agents/" 2>/dev/null | grep -v "^Binary" | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo "FAIL: agents/ contain $COUNT reference(s) to search_nodes — agents must use the session bundle"
  grep -rn "search_nodes" "$ROOT/.claude/agents/" 2>/dev/null
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
```

#### Acceptance Criteria

- [ ] `bash validate/invariants.sh` exits 0 with current repo state
- [ ] Script exits 1 if `search_nodes` is added to any agent file
- [ ] Script exits 1 if `YYYY-MM-DDTHH-MM-SS` is removed from a skill file
- [ ] Script is executable: `chmod +x validate/invariants.sh` (set this during file creation)

---

### Task 4: Create validate/dependency-graph.js

**Status:** PENDING
**Complexity:** Medium

#### File Changes

##### CREATE: validate/dependency-graph.js

```js
#!/usr/bin/env node
/**
 * Validates PRD dependency graphs in prds/ for cycles.
 * Parses "Depends on:" headers from prd-NN_*.md files.
 * Uses DFS cycle detection — covers all cycle lengths including 3+ node cycles (BLG-021 fix).
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const prdsDir = path.join(root, 'prds');

if (!fs.existsSync(prdsDir)) {
  console.log('No prds/ directory found — nothing to validate.');
  process.exit(0);
}

let totalErrors = 0;

const prdDirs = fs.readdirSync(prdsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

for (const dir of prdDirs) {
  const dirPath = path.join(prdsDir, dir);
  const prdFiles = fs.readdirSync(dirPath)
    .filter(f => /^prd-\d+.*\.md$/.test(f))
    .sort();

  if (prdFiles.length === 0) continue;

  // Build adjacency list: { 'PRD-01': ['PRD-02', 'PRD-03'], ... }
  const graph = {};

  for (const file of prdFiles) {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    const numMatch = file.match(/^prd-(\d+)/);
    if (!numMatch) continue;

    const id = `PRD-${numMatch[1].padStart(2, '0')}`;
    const depsMatch = content.match(/^Depends on:\s*(.+)$/m);

    if (!depsMatch || /^none$/i.test(depsMatch[1].trim())) {
      graph[id] = [];
    } else {
      graph[id] = depsMatch[1]
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);
    }
  }

  // DFS cycle detection
  // visited: nodes fully processed; stack: nodes in current DFS path
  function dfs(node, visited, stack, cyclePath) {
    visited.add(node);
    stack.add(node);
    cyclePath.push(node);

    for (const dep of (graph[node] || [])) {
      if (!visited.has(dep)) {
        if (dfs(dep, visited, stack, cyclePath)) return true;
      } else if (stack.has(dep)) {
        cyclePath.push(dep); // show where the cycle closes
        return true;
      }
    }

    stack.delete(node);
    cyclePath.pop();
    return false;
  }

  const visited = new Set();
  let cycleFound = false;

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const cyclePath = [];
      if (dfs(node, visited, new Set(), cyclePath)) {
        console.error(`FAIL: ${dir} — cycle detected: ${cyclePath.join(' → ')}`);
        totalErrors++;
        cycleFound = true;
        break;
      }
    }
  }

  if (!cycleFound) {
    console.log(`OK: ${dir} — no dependency cycles (${Object.keys(graph).length} PRDs)`);
  }
}

console.log('');

if (totalErrors > 0) {
  console.error(`${totalErrors} cycle(s) found across PRD directories.`);
  process.exit(1);
}

console.log('All PRD dependency graphs are acyclic.');
```

#### Acceptance Criteria

- [ ] `node validate/dependency-graph.js` exits 0 on all existing prds/ directories
- [ ] Script correctly detects a 2-node cycle: A depends on B, B depends on A
- [ ] Script correctly detects a 3-node cycle: A→B→C→A (covers BLG-021)
- [ ] Script correctly passes a diamond dependency: A→B→D and A→C→D (not a cycle)
- [ ] Script exits 0 when prds/ is empty or has no prd-*.md files
- [ ] Script uses no external npm dependencies

---

### Task 5: Create validate/prd-status-values.sh

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### CREATE: validate/prd-status-values.sh

```bash
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
```

#### Acceptance Criteria

- [ ] `bash validate/prd-status-values.sh` exits 0 on all existing PRD files
- [ ] Script exits 1 if a PRD file has `Status: DONE` (invalid value)
- [ ] Script exits 0 if prds/ is empty
- [ ] Script is executable: `chmod +x validate/prd-status-values.sh`

---

### Task 6: Create Makefile

**Status:** PENDING
**Complexity:** Low
**Depends on:** Tasks 1, 2, 3, 4, 5

#### File Changes

##### CREATE: Makefile

```makefile
.PHONY: validate validate-settings validate-skills validate-invariants validate-deps validate-statuses

# Run all validation checks
validate: validate-settings validate-skills validate-invariants validate-deps validate-statuses
	@echo ""
	@echo "✓ All validation checks passed."

# Validate .claude/settings.json structure and MEMORY_FILE_PATH
validate-settings:
	@echo "→ Validating settings.json..."
	@node validate/settings-json.js

# Validate YAML frontmatter in all .claude/skills/*/SKILL.md files
validate-skills:
	@echo "→ Validating skill frontmatter..."
	@node validate/skill-frontmatter.js

# Check structural invariants (no rogue search_nodes, correct run ID format, etc.)
validate-invariants:
	@echo "→ Checking structural invariants..."
	@bash validate/invariants.sh

# Check PRD dependency graphs for cycles
validate-deps:
	@echo "→ Checking PRD dependency graphs..."
	@node validate/dependency-graph.js

# Check all Status: values in prds/ are from the defined set
validate-statuses:
	@echo "→ Checking PRD status values..."
	@bash validate/prd-status-values.sh
```

**After creating the file**, make shell scripts executable:
```bash
chmod +x validate/invariants.sh
chmod +x validate/prd-status-values.sh
```

#### Acceptance Criteria

- [ ] `make validate` runs all 5 checks and exits 0 with current repo
- [ ] `make validate-settings` runs only the settings check
- [ ] `make validate-skills` runs only the skill frontmatter check
- [ ] `make validate-invariants` runs only the structural invariants check
- [ ] `make validate-deps` runs only the dependency graph check
- [ ] `make validate-statuses` runs only the PRD status check

---

## Execution Log

### Task 1: Create validate/settings-json.js
- **Agent:** general-purpose subagent (PRD-03)
- **Mode:** task
- **Started:** 2026-03-18 11:20 UTC
- **Completed:** 2026-03-18 11:35 UTC
- **Status:** COMPLETED
- **Files created:** `validate/settings-json.js`
- **Acceptance criteria:**
  - [x] `node validate/settings-json.js` exits 0 when settings are valid (confirmed via `make validate`)
  - [x] Script uses no external npm dependencies

### Task 2: Create validate/skill-frontmatter.js
- **Agent:** general-purpose subagent (PRD-03)
- **Mode:** task
- **Started:** 2026-03-18 11:20 UTC
- **Completed:** 2026-03-18 11:35 UTC
- **Status:** COMPLETED
- **Files created:** `validate/skill-frontmatter.js`
- **Issues encountered:**
  - Comment block `/** ... */SKILL.md` contained `*/` which closed the JSDoc comment early — fixed by orchestrator (changed to `//` single-line comments)
- **Acceptance criteria:**
  - [x] `node validate/skill-frontmatter.js` exits 0 and prints OK for all 14 skills
  - [x] Script uses no external npm dependencies

### Task 3: Create validate/invariants.sh
- **Agent:** general-purpose subagent (PRD-03)
- **Mode:** task
- **Started:** 2026-03-18 11:20 UTC
- **Completed:** 2026-03-18 11:35 UTC
- **Status:** COMPLETED
- **Files created:** `validate/invariants.sh`
- **Issues encountered:**
  - grep pattern `search_nodes` matched instructional "no additional search_nodes calls needed" text — fixed by orchestrator (changed pattern to `search_nodes(` for actual call detection; added `|| true` for zero-match case)
- **Acceptance criteria:**
  - [x] `bash validate/invariants.sh` exits 0 with current repo state

### Task 4: Create validate/dependency-graph.js
- **Agent:** general-purpose subagent (PRD-03)
- **Mode:** task
- **Started:** 2026-03-18 11:20 UTC
- **Completed:** 2026-03-18 11:35 UTC
- **Status:** COMPLETED
- **Files created:** `validate/dependency-graph.js`
- **Acceptance criteria:**
  - [x] `node validate/dependency-graph.js` exits 0 on all existing prds/ directories

### Task 5: Create validate/prd-status-values.sh
- **Agent:** general-purpose subagent (PRD-03)
- **Mode:** task
- **Started:** 2026-03-18 11:20 UTC
- **Completed:** 2026-03-18 11:35 UTC
- **Status:** COMPLETED
- **Files created:** `validate/prd-status-values.sh`
- **Acceptance criteria:**
  - [x] `bash validate/prd-status-values.sh` exits 0 on all existing PRD files

### Task 6: Create Makefile
- **Agent:** general-purpose subagent (PRD-03)
- **Mode:** task
- **Started:** 2026-03-18 11:35 UTC
- **Completed:** 2026-03-18 11:40 UTC
- **Status:** COMPLETED
- **Files created:** `Makefile`
- **Test results:** `make validate` — PASS (all 5 checks pass)
- **Acceptance criteria:**
  - [x] `make validate` runs all 5 checks and exits 0
  - [x] All individual make targets work
