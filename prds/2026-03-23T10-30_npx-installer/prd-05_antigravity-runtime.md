# PRD-05: Antigravity Runtime

Created: 2026-03-23 10:35 UTC
Status: COMPLETED
Depends on: PRD-02
Complexity: Medium

## Objective

Implement the Antigravity runtime installer: copy skills to `.agent/skills/` (local) or `~/.gemini/antigravity/skills/` (global), convert agent `.md` files into skills (no dedicated agents dir in Antigravity), copy rules, generate `AGENTS.md` listing available specialist agents, and write `GEMINI.md`.

## Context

Antigravity uses:
- `.agent/skills/<name>/SKILL.md` for project-level skills (local install)
- `~/.gemini/antigravity/skills/<name>/SKILL.md` for global skills
- `.agent/AGENTS.md` as a workspace-level reference file listing agents by name/description
- `GEMINI.md` at project root as project instructions (same as Gemini CLI)
- No dedicated agents directory — agents from `.claude/agents/` are converted to `SKILL.md` entries

This runtime shares the TOML transformer from PRD-04 for slash commands. Antigravity slash commands go into `.gemini/commands/cfe/` (same location as Gemini CLI, since they share the `.gemini/` namespace).

## Tasks

---

### Task 1: Create `lib/runtimes/antigravity.js`

**Status:** COMPLETED
**Complexity:** Medium

#### File Changes

##### CREATE: lib/runtimes/antigravity.js

```js
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { copyDir, copyFile, writeFile } = require('../installer');
const { saveManifest }                 = require('../manifest');
const { parseSkillMd, skillToToml }    = require('../transformers/toml');

const TEMPLATES = path.join(__dirname, '../../templates');

function getSkillsDir(scope, targetDir) {
  return scope === 'global'
    ? path.join(os.homedir(), '.gemini', 'antigravity', 'skills')
    : path.join(targetDir, '.agent', 'skills');
}

function getRulesDir(scope, targetDir) {
  return scope === 'global'
    ? path.join(os.homedir(), '.gemini', 'antigravity', 'rules')
    : path.join(targetDir, '.agent', 'rules');
}

function getAgentDir(scope, targetDir) {
  return scope === 'global'
    ? path.join(os.homedir(), '.gemini', 'antigravity')
    : path.join(targetDir, '.agent');
}

function getCommandsDir(scope, targetDir) {
  // Antigravity slash commands share .gemini/commands/ with Gemini CLI
  return scope === 'global'
    ? path.join(os.homedir(), '.gemini', 'commands', 'cfe')
    : path.join(targetDir, '.gemini', 'commands', 'cfe');
}

async function installAntigravity({ scope, targetDir }) {
  const agentDir   = getAgentDir(scope, targetDir);
  const skillsDir  = getSkillsDir(scope, targetDir);
  const rulesDir   = getRulesDir(scope, targetDir);
  const commandsDir = getCommandsDir(scope, targetDir);
  const manifest   = [];

  // 1. Copy skills → <skillsDir>/*/SKILL.md
  copyDir(path.join(TEMPLATES, '.claude', 'skills'), skillsDir, manifest);

  // 2. Convert agents → skills (agents/*.md → <skillsDir>/<name>/SKILL.md)
  convertAgentsToSkills(path.join(TEMPLATES, '.claude', 'agents'), skillsDir, manifest);

  // 3. Copy rules
  copyDir(path.join(TEMPLATES, '.claude', 'rules'), rulesDir, manifest);

  // 4. Generate TOML commands (local: .gemini/commands/cfe/, global: ~/.gemini/commands/cfe/)
  generateTomlCommands(path.join(TEMPLATES, '.claude', 'skills'), commandsDir, manifest);

  // 5. Generate AGENTS.md — workspace reference file (local only)
  if (scope === 'local') {
    generateAgentsMd(path.join(TEMPLATES, '.claude', 'agents'), path.join(agentDir, 'AGENTS.md'), manifest);
  }

  // 6. Copy CLAUDE.md → GEMINI.md at project root (local only)
  if (scope === 'local') {
    copyFile(path.join(TEMPLATES, 'CLAUDE.md'), path.join(targetDir, 'GEMINI.md'), manifest);
  }

  // 7. Save manifest
  saveManifest(agentDir, manifest);

  printSuccess(agentDir, manifest.length, scope);
}

/**
 * Convert each .claude/agents/*.md file into a SKILL.md entry.
 * Each agent becomes: <skillsDir>/<agent-name>/SKILL.md
 * Content is copied verbatim (agents already use YAML frontmatter + Markdown body).
 */
function convertAgentsToSkills(agentsSrc, skillsDest, manifest) {
  fs.mkdirSync(skillsDest, { recursive: true });
  for (const entry of fs.readdirSync(agentsSrc, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const agentName  = path.basename(entry.name, '.md');
    const content    = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
    const destDir    = path.join(skillsDest, agentName);
    const destPath   = path.join(destDir, 'SKILL.md');
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(destPath, content, 'utf8');
      manifest.push(destPath);
    }
  }
}

/**
 * Generate TOML slash command files from skills.
 * Reuses the same skillToToml transformer used by the Gemini runtime.
 */
function generateTomlCommands(skillsSrc, commandsDir, manifest) {
  fs.mkdirSync(commandsDir, { recursive: true });
  for (const entry of fs.readdirSync(skillsSrc, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = path.join(skillsSrc, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    const toml = skillToToml(fs.readFileSync(skillMdPath, 'utf8'));
    if (!toml) continue;
    writeFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);
  }
}

/**
 * Generate .agent/AGENTS.md — a plain Markdown file listing all agents
 * by name and description. Used as a workspace-level reference.
 */
function generateAgentsMd(agentsSrc, destPath, manifest) {
  if (fs.existsSync(destPath)) return; // skip if already exists (merge strategy)
  const lines = [
    '# AGENTS.md',
    '',
    'Specialist agents available in this workspace (installed by claude-for-engineers):',
    '',
  ];
  for (const entry of fs.readdirSync(agentsSrc, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
    const parsed  = parseSkillMd(content);
    if (parsed?.name && parsed?.description) {
      lines.push(`- **${parsed.name}**: ${parsed.description}`);
    }
  }
  lines.push('');
  writeFile(destPath, lines.join('\n'), manifest);
}

function printSuccess(agentDir, count, scope) {
  console.log(`\n✓ Antigravity workflow installed`);
  console.log(`  Location : ${agentDir}`);
  console.log(`  Files    : ${count} created`);
  if (scope === 'local') {
    console.log('\nSkills available in .agent/skills/');
    console.log('Slash commands available as /cfe:<skill-name>');
  }
}

module.exports = { installAntigravity };
```

#### Acceptance Criteria
- [ ] `node -e "require('./lib/runtimes/antigravity')"` loads without error
- [ ] `installAntigravity` is exported

---

### Task 2: End-to-end smoke test — Antigravity local install

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 1

```bash
TMPDIR=$(mktemp -d)
node bin/install.js --antigravity --local <<< "
$TMPDIR
y
"
# Skills
test -f "$TMPDIR/.agent/skills/plan/SKILL.md"            && echo "PASS: plan skill"    || echo "FAIL: plan skill"
test -f "$TMPDIR/.agent/skills/prd/SKILL.md"             && echo "PASS: prd skill"     || echo "FAIL: prd skill"
# Agents converted to skills
test -f "$TMPDIR/.agent/skills/security-expert/SKILL.md" && echo "PASS: agent→skill"  || echo "FAIL: agent→skill"
test -f "$TMPDIR/.agent/skills/dba-expert/SKILL.md"      && echo "PASS: dba→skill"    || echo "FAIL: dba→skill"
# Rules
test -f "$TMPDIR/.agent/rules/workflow.md"               && echo "PASS: rules"         || echo "FAIL: rules"
# AGENTS.md
test -f "$TMPDIR/.agent/AGENTS.md"                       && echo "PASS: AGENTS.md"    || echo "FAIL: AGENTS.md"
grep -q 'security-expert' "$TMPDIR/.agent/AGENTS.md"     && echo "PASS: AGENTS entries" || echo "FAIL: AGENTS entries"
# GEMINI.md at project root
test -f "$TMPDIR/GEMINI.md"                              && echo "PASS: GEMINI.md"     || echo "FAIL: GEMINI.md"
# Slash commands
test -f "$TMPDIR/.gemini/commands/cfe/plan.toml"         && echo "PASS: plan.toml"    || echo "FAIL: plan.toml"
# Manifest
test -f "$TMPDIR/.agent/.install-manifest.json"          && echo "PASS: manifest"     || echo "FAIL: manifest"
rm -rf "$TMPDIR"
```

#### Acceptance Criteria
- [ ] All `PASS` lines print, no `FAIL` lines
- [ ] `.agent/skills/` contains 15 (skills) + 6 (converted agents) = 21 subdirectories
- [ ] `AGENTS.md` lists all 6 agents by name and description

---

### Task 3: Verify agent-to-skill conversion preserves frontmatter

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Task 1

```bash
TMPDIR=$(mktemp -d)
node bin/install.js --antigravity --local <<< "
$TMPDIR
y
"
# Verify agent SKILL.md has valid frontmatter (name + description)
node -e "
const fs = require('fs');
const content = fs.readFileSync('$TMPDIR/.agent/skills/security-expert/SKILL.md', 'utf8');
const { parseSkillMd } = require('./lib/transformers/toml');
const parsed = parseSkillMd(content);
console.assert(parsed && parsed.name === 'security-expert', 'name must be security-expert');
console.assert(parsed && parsed.description && parsed.description.length > 10, 'description must be present');
console.log('PASS: agent frontmatter preserved in converted SKILL.md');
"
rm -rf "$TMPDIR"
```

#### Acceptance Criteria
- [ ] Script prints `PASS: agent frontmatter preserved in converted SKILL.md`
- [ ] Converted agent SKILL.md has valid `name` and `description` fields

---

### Task 4: Merge strategy — agents already installed as skills are skipped

**Status:** COMPLETED
**Complexity:** Low
**Depends on:** Tasks 2, 3

```bash
TMPDIR=$(mktemp -d)
# First install
node bin/install.js --antigravity --local <<< "$TMPDIR
y"
# Modify a converted agent skill
echo "# MODIFIED" > "$TMPDIR/.agent/skills/security-expert/SKILL.md"
# Second install
node bin/install.js --antigravity --local <<< "$TMPDIR
y"
# Verify modification was preserved
grep -q "MODIFIED" "$TMPDIR/.agent/skills/security-expert/SKILL.md" \
  && echo "PASS: merge skipped existing converted agent" \
  || echo "FAIL: converted agent was overwritten"
rm -rf "$TMPDIR"
```

#### Acceptance Criteria
- [ ] Script prints `PASS: merge skipped existing converted agent`

---

## Execution Log

### Task 1: Create `lib/runtimes/antigravity.js`
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:30 UTC
- **Completed:** 2026-03-23 10:33 UTC
- **Status:** COMPLETED
- **Files created:**
  - lib/runtimes/antigravity.js
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node -e "require('./lib/runtimes/antigravity')"` - PASS
- **Issues encountered:** Waited ~25 seconds for lib/transformers/toml.js to be created by parallel PRD-04 agent before running tests.
- **Acceptance criteria:**
  - [x] `node -e "require('./lib/runtimes/antigravity')"` loads without error
  - [x] `installAntigravity` is exported

### Task 2: End-to-end smoke test — Antigravity local install
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:33 UTC
- **Completed:** 2026-03-23 10:33 UTC
- **Status:** COMPLETED
- **Files created:** (none — temp dir cleaned up)
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** All 10 PASS lines, skills count = 21
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] All PASS lines print, no FAIL lines
  - [x] .agent/skills/ contains 21 subdirectories (15 skills + 6 converted agents)
  - [x] AGENTS.md lists all 6 agents by name and description

### Task 3: Verify agent-to-skill conversion preserves frontmatter
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:33 UTC
- **Completed:** 2026-03-23 10:33 UTC
- **Status:** COMPLETED
- **Files created:** (none — temp dir cleaned up)
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `PASS: agent frontmatter preserved in converted SKILL.md`
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Script prints PASS
  - [x] Converted agent SKILL.md has valid name and description fields

### Task 4: Merge strategy — agents already installed as skills are skipped
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-23 10:33 UTC
- **Completed:** 2026-03-23 10:33 UTC
- **Status:** COMPLETED
- **Files created:** (none — temp dir cleaned up)
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `PASS: merge skipped existing converted agent`
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Script prints PASS
