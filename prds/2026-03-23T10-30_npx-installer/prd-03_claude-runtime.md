# PRD-03: Claude Code Runtime

Created: 2026-03-23 10:35 UTC
Status: COMPLETED
Depends on: PRD-02
Complexity: Medium

## Objective

Implement the Claude Code runtime installer: copy all workflow files to `.claude/` (local) or `~/.claude/` (global), generate `settings.local.json` with the correct absolute `MEMORY_FILE_PATH`, create project stubs, and append `.gitignore` entries.

## Context

This is one of three runtime modules (alongside PRD-04 Gemini and PRD-05 Antigravity). It imports shared utilities from `lib/installer.js`, `lib/manifest.js`, and `lib/gitignore.js` created in PRD-02. The `templates/` directory populated in PRD-01 is the source of all copied files.

## Tasks

---

### Task 1: Create `lib/runtimes/claude.js`

**Status:** COMPLETED
**Complexity:** Medium

#### File Changes

##### CREATE: lib/runtimes/claude.js

```js
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { copyDir, copyFile, writeFile } = require('../installer');
const { saveManifest }                 = require('../manifest');
const { appendGitignoreEntries }       = require('../gitignore');

const TEMPLATES = path.join(__dirname, '../../templates');

function getRootDir(scope, targetDir) {
  return scope === 'global' ? os.homedir() : targetDir;
}

async function installClaude({ scope, targetDir }) {
  const root      = getRootDir(scope, targetDir);
  const claudeDir = path.join(root, '.claude');
  const manifest  = [];

  // 1. Copy .claude/ content from templates (skills, agents, rules, settings.json, memory/.gitignore, context/current-topic.md)
  copyDir(path.join(TEMPLATES, '.claude'), claudeDir, manifest);

  // 2. Generate settings.local.json with absolute MEMORY_FILE_PATH
  const memoryPath = path.resolve(root, '.claude', 'memory', 'agent-memory.json');
  const settingsLocal = {
    mcpServers: {
      memory: {
        env: { MEMORY_FILE_PATH: memoryPath },
      },
    },
  };
  writeFile(
    path.join(claudeDir, 'settings.local.json'),
    JSON.stringify(settingsLocal, null, 2) + '\n',
    manifest
  );

  // 3. Copy CLAUDE.md to project root (local only — no project root for global)
  if (scope === 'local') {
    copyFile(path.join(TEMPLATES, 'CLAUDE.md'), path.join(targetDir, 'CLAUDE.md'), manifest);
  }

  // 4. Create prds/ stub (local only)
  if (scope === 'local') {
    const prdsGitkeep = path.join(targetDir, 'prds', '.gitkeep');
    writeFile(prdsGitkeep, '', manifest);
  }

  // 5. Create run-log/.gitkeep (ensures directory exists in git)
  writeFile(path.join(claudeDir, 'context', 'run-log', '.gitkeep'), '', manifest);

  // 6. Append .gitignore entries (local only)
  if (scope === 'local') {
    appendGitignoreEntries(targetDir);
  }

  // 7. Save manifest
  saveManifest(claudeDir, manifest);

  printSuccess(claudeDir, manifest.length, scope);
}

function printSuccess(claudeDir, count, scope) {
  console.log(`\n✓ Claude Code workflow installed`);
  console.log(`  Location : ${claudeDir}`);
  console.log(`  Files    : ${count} created`);
  if (scope === 'local') {
    console.log('\nNext steps:');
    console.log('  1. Open Claude Code in this project');
    console.log('  2. Run /set-context to configure the current topic');
    console.log('  3. Run /check-setup to verify MCP is working');
  }
}

module.exports = { installClaude };
```

#### Acceptance Criteria
- [ ] `node -e "require('./lib/runtimes/claude')"` loads without error
- [ ] `installClaude` is exported

---

### Task 2: Verify `settings.local.json` generation is correct

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 1

Write a manual verification script (not a permanent test file — just run and discard):

```bash
node -e "
const os = require('os');
const path = require('path');
const targetDir = '/tmp/cfe-test';
require('fs').mkdirSync(targetDir, { recursive: true });
process.chdir(targetDir);
const { installClaude } = require('./lib/runtimes/claude');
installClaude({ scope: 'local', targetDir }).then(() => {
  const local = require(path.join(targetDir, '.claude/settings.local.json'));
  const mp = local.mcpServers.memory.env.MEMORY_FILE_PATH;
  console.assert(path.isAbsolute(mp), 'MEMORY_FILE_PATH must be absolute');
  console.assert(mp.includes('.claude/memory/agent-memory.json'), 'path must include expected suffix');
  console.log('PASS: settings.local.json is correct');
  require('fs').rmSync(targetDir, { recursive: true });
});
"
```

#### Acceptance Criteria
- [ ] Script above prints `PASS: settings.local.json is correct`
- [ ] The generated `MEMORY_FILE_PATH` is an absolute path ending in `.claude/memory/agent-memory.json`
- [ ] The generated `MEMORY_FILE_PATH` does NOT contain `REPLACE_WITH_LOCAL_PATH`

---

### Task 3: End-to-end smoke test — local install

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Tasks 1, 2

Run a full local install to a temp directory and verify the file tree:

```bash
TMPDIR=$(mktemp -d)
node bin/install.js --claude --local <<< "
$TMPDIR
y
"
# Verify key files exist
test -f "$TMPDIR/.claude/skills/plan/SKILL.md"       && echo "PASS: plan skill"      || echo "FAIL: plan skill"
test -f "$TMPDIR/.claude/agents/security-expert.md"  && echo "PASS: agent"           || echo "FAIL: agent"
test -f "$TMPDIR/.claude/rules/workflow.md"          && echo "PASS: rules"           || echo "FAIL: rules"
test -f "$TMPDIR/.claude/settings.json"              && echo "PASS: settings.json"   || echo "FAIL: settings.json"
test -f "$TMPDIR/.claude/settings.local.json"        && echo "PASS: settings.local"  || echo "FAIL: settings.local"
test -f "$TMPDIR/CLAUDE.md"                          && echo "PASS: CLAUDE.md"       || echo "FAIL: CLAUDE.md"
test -f "$TMPDIR/prds/.gitkeep"                      && echo "PASS: prds stub"       || echo "FAIL: prds stub"
test -f "$TMPDIR/.claude/.install-manifest.json"     && echo "PASS: manifest"        || echo "FAIL: manifest"
# Verify settings.json has placeholder (not real path)
grep -q "REPLACE_WITH_LOCAL_PATH" "$TMPDIR/.claude/settings.json" && echo "PASS: placeholder present" || echo "FAIL: placeholder missing"
# Verify settings.local.json has real path
node -e "const s=require('$TMPDIR/.claude/settings.local.json'); const p=require('path'); console.assert(p.isAbsolute(s.mcpServers.memory.env.MEMORY_FILE_PATH)); console.log('PASS: absolute path in settings.local')"
rm -rf "$TMPDIR"
```

#### Acceptance Criteria
- [ ] All `PASS` lines print, no `FAIL` lines
- [ ] `templates/.claude/skills/` has 15 skills → all 15 appear in the installed `.claude/skills/`
- [ ] `templates/.claude/agents/` has 6 agents → all 6 appear in the installed `.claude/agents/`

---

### Task 4: End-to-end smoke test — merge strategy

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 3

Verify that re-running the installer skips existing files and does not overwrite them:

```bash
TMPDIR=$(mktemp -d)
# First install
node bin/install.js --claude --local <<< "
$TMPDIR
y
"
# Modify an installed file
echo "# MODIFIED" > "$TMPDIR/.claude/rules/workflow.md"
# Second install (merge)
node bin/install.js --claude --local <<< "
$TMPDIR
y
"
# Verify the modified file was NOT overwritten
grep -q "MODIFIED" "$TMPDIR/.claude/rules/workflow.md" && echo "PASS: merge skipped existing" || echo "FAIL: file was overwritten"
rm -rf "$TMPDIR"
```

#### Acceptance Criteria
- [ ] Script prints `PASS: merge skipped existing`
- [ ] A file modified by the user is never overwritten by a reinstall

---

## Execution Log

### Task 1: Create `lib/runtimes/claude.js`
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:30 UTC
- **Completed:** 2026-03-23 10:35 UTC
- **Status:** COMPLETED
- **Files created:**
  - lib/runtimes/claude.js
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node -e "require('./lib/runtimes/claude')"` - PASS
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `node -e "require('./lib/runtimes/claude')"` loads without error
  - [x] `installClaude` is exported

### Task 2: Verify `settings.local.json` generation is correct
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:35 UTC
- **Completed:** 2026-03-23 10:35 UTC
- **Status:** COMPLETED
- **Files created:** (none — verification only, temp dir cleaned up)
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `PASS: settings.local.json is correct`
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Script prints `PASS: settings.local.json is correct`
  - [x] The generated `MEMORY_FILE_PATH` is an absolute path ending in `.claude/memory/agent-memory.json`
  - [x] The generated `MEMORY_FILE_PATH` does NOT contain `REPLACE_WITH_LOCAL_PATH`

### Task 3: End-to-end smoke test — local install
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:35 UTC
- **Completed:** 2026-03-23 10:35 UTC
- **Status:** COMPLETED
- **Files created:** (none — temp dir cleaned up)
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** All 10 PASS lines, 0 FAIL lines
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] All PASS lines print, no FAIL lines
  - [x] 15 skills in installed .claude/skills/
  - [x] 6 agents in installed .claude/agents/

### Task 4: End-to-end smoke test — merge strategy
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:35 UTC
- **Completed:** 2026-03-23 10:35 UTC
- **Status:** COMPLETED
- **Files created:** (none — temp dir cleaned up)
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `PASS: merge skipped existing`
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Script prints `PASS: merge skipped existing`
  - [x] A file modified by the user is never overwritten by a reinstall
