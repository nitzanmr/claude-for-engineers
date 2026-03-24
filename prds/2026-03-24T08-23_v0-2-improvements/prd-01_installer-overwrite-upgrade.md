# PRD-01: Installer: Overwrite Logic + Upgrade Detection

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: None
Complexity: Medium

## Objective

Replace the "skip existing files" install strategy with a model that overwrites package-owned files on every run, enabling upgrade paths, while never touching user-owned files.

## Context

The current installer uses `copyDir` which skips files if the destination already exists. Re-running the installer after updating the package has no effect — users get stale skills, agents, and rules. This PRD introduces `overwriteDir`/`overwriteFile` for package-owned files and adds upgrade detection so the installer can print "Upgrading v0.1.0 → v0.2.0" instead of always saying "Installing."

## Tasks

### Task 1: Add `overwriteDir` and `overwriteFile` to `lib/installer.js`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: lib/installer.js

**Add after the `writeFile` function** (after line 49, before `function checkTargetExists`):

```js
/**
 * Recursively copy srcDir into destDir, overwriting any existing files.
 * Appends written file paths to manifest array.
 */
function overwriteDir(srcDir, destDir, manifest = []) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath  = path.join(srcDir,  entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      overwriteDir(srcPath, destPath, manifest);
    } else {
      fs.copyFileSync(srcPath, destPath);
      manifest.push(destPath);
    }
  }
  return manifest;
}

/**
 * Copy a single file unconditionally, overwriting if dest exists.
 * Returns true always.
 */
function overwriteFile(src, dest, manifest = []) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  manifest.push(dest);
  return true;
}
```

**Update `module.exports`** (replace existing export line):

```js
module.exports = { copyDir, copyFile, writeFile, checkTargetExists, overwriteDir, overwriteFile };
```

#### Unit Tests

Tests for `overwriteDir` and `overwriteFile` are in PRD-04 Task 2 (`tests/installer.test.js`).

#### Acceptance Criteria

- [ ] `overwriteDir` function is exported from `lib/installer.js`
- [ ] `overwriteFile` function is exported from `lib/installer.js`
- [ ] Both functions are present in `module.exports`

---

### Task 2: Add `getInstalledVersion` to `lib/manifest.js`

**Status:** PENDING
**Depends on:** Task 1
**Complexity:** Low

#### File Changes

##### MODIFY: lib/manifest.js

**Add after `loadManifest` function** (after line 38, before `function uninstall`):

```js
/**
 * Returns the version string from an existing manifest, or null if none.
 */
function getInstalledVersion(runtimeDir) {
  const m = loadManifest(runtimeDir);
  return m ? m.version : null;
}
```

**Update `module.exports`** (replace existing export line):

```js
module.exports = { saveManifest, loadManifest, getInstalledVersion, uninstall };
```

#### Unit Tests

Tests for `getInstalledVersion` are in PRD-04 Task 3 (`tests/manifest.test.js`).

#### Acceptance Criteria

- [ ] `getInstalledVersion` is exported from `lib/manifest.js`
- [ ] Returns `null` when no manifest exists
- [ ] Returns the version string when a manifest exists

---

### Task 3: Update `lib/runtimes/claude.js` — overwrite + upgrade detection

**Status:** PENDING
**Depends on:** Task 1, Task 2
**Complexity:** Medium

#### File Changes

##### MODIFY: lib/runtimes/claude.js

**Update imports** (replace `const { copyDir, copyFile, writeFile } = require('../installer');`):

```js
const { copyFile, writeFile, overwriteDir, overwriteFile } = require('../installer');
```

**Update manifest import** (replace `const { saveManifest } = require('../manifest');`):

```js
const { saveManifest, getInstalledVersion }                = require('../manifest');
```

**Update `installClaude` function** — replace the entire function body with:

```js
async function installClaude({ scope, targetDir }) {
  const root      = getRootDir(scope, targetDir);
  const claudeDir = path.join(root, '.claude');
  const manifest  = [];

  const previousVersion = getInstalledVersion(claudeDir);

  // 1. Package-owned: always overwrite skills, agents, rules, settings.json
  overwriteDir(path.join(TEMPLATES, '.claude', 'skills'),   path.join(claudeDir, 'skills'),   manifest);
  overwriteDir(path.join(TEMPLATES, '.claude', 'agents'),   path.join(claudeDir, 'agents'),   manifest);
  overwriteDir(path.join(TEMPLATES, '.claude', 'rules'),    path.join(claudeDir, 'rules'),    manifest);
  overwriteFile(path.join(TEMPLATES, '.claude', 'settings.json'), path.join(claudeDir, 'settings.json'), manifest);

  // 2. User-owned: only create if missing (never overwrite)
  copyFile(path.join(TEMPLATES, '.claude', 'context', 'current-topic.md'), path.join(claudeDir, 'context', 'current-topic.md'), manifest);

  // 3. CLAUDE.md at project root is package-owned (local only)
  if (scope === 'local') {
    overwriteFile(path.join(TEMPLATES, 'CLAUDE.md'), path.join(targetDir, 'CLAUDE.md'), manifest);
  }

  // 4. Create prds/ stub (local only, user-owned)
  if (scope === 'local') {
    writeFile(path.join(targetDir, 'prds', '.gitkeep'), '', manifest);
  }

  // 5. Create run-log/.gitkeep (ensures directory exists in git)
  writeFile(path.join(claudeDir, 'context', 'run-log', '.gitkeep'), '', manifest);

  // 6. Append .gitignore entries (local only)
  if (scope === 'local') {
    appendGitignoreEntries(targetDir);
  }

  // 7. Save manifest
  saveManifest(claudeDir, manifest);

  printSuccess(claudeDir, manifest.length, scope, previousVersion);

  // 8. Run post-install validation
  runValidation(targetDir, scope);
}
```

**Update `printSuccess` function** — replace with:

```js
function printSuccess(claudeDir, count, scope, previousVersion) {
  const { version } = require('../../package.json');
  if (previousVersion) {
    console.log(`\n✓ Claude Code workflow upgraded (${previousVersion} → ${version})`);
    console.log(`  Location : ${claudeDir}`);
    console.log(`  Updated  : ${count} files`);
  } else {
    console.log(`\n✓ Claude Code workflow installed`);
    console.log(`  Location : ${claudeDir}`);
    console.log(`  Files    : ${count} created`);
  }
  if (scope === 'local') {
    console.log('\nNext steps:');
    console.log('  1. Open Claude Code in this project');
    console.log('  2. Run /set-context to configure the current topic');
    console.log('  3. Run /check-setup to verify the workflow is configured');
  }
}
```

#### Acceptance Criteria

- [ ] `copyDir` import removed; `overwriteDir`, `overwriteFile` imported
- [ ] `getInstalledVersion` imported from manifest
- [ ] `installClaude` uses `overwriteDir` for skills, agents, rules; `overwriteFile` for settings.json and CLAUDE.md
- [ ] `installClaude` uses `copyFile` (skip-if-exists) for `current-topic.md`
- [ ] `printSuccess` prints "upgraded (vX → vY)" when `previousVersion` is set
- [ ] `printSuccess` prints "installed" when `previousVersion` is null

---

### Task 4: Update `lib/runtimes/gemini.js` and `lib/runtimes/antigravity.js` — overwrite + upgrade detection

**Status:** PENDING
**Depends on:** Task 1, Task 2
**Complexity:** Medium

#### File Changes

##### MODIFY: lib/runtimes/gemini.js

**Update imports** (replace `const { copyDir, copyFile, writeFile } = require('../installer');`):

```js
const { copyFile, writeFile, overwriteDir, overwriteFile } = require('../installer');
```

**Update manifest import** (replace `const { saveManifest } = require('../manifest');`):

```js
const { saveManifest, getInstalledVersion }                = require('../manifest');
```

**Update `installGemini` function** — add `previousVersion` detection after `const manifest  = [];`:

```js
const previousVersion = getInstalledVersion(geminiDir);
```

**Replace `copyDir` calls for skills/agents/rules** (lines 22-28):

```js
// 1. Package-owned: always overwrite skills, agents, rules
overwriteDir(path.join(TEMPLATES, '.claude', 'skills'), path.join(geminiDir, 'skills'), manifest);
overwriteDir(path.join(TEMPLATES, '.claude', 'agents'), path.join(geminiDir, 'agents'), manifest);
overwriteDir(path.join(TEMPLATES, '.claude', 'rules'),  path.join(geminiDir, 'rules'),  manifest);
```

**Update `generateTomlCommands`** — change `writeFile` to `overwriteFile` (so TOML commands update on upgrade):

Replace `writeFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);`
with: `overwriteFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);`

**Update `printSuccess`** — add `previousVersion` parameter and upgrade/install messaging:

```js
function printSuccess(geminiDir, count, previousVersion) {
  const { version } = require('../../package.json');
  if (previousVersion) {
    console.log(`\n✓ Gemini CLI workflow upgraded (${previousVersion} → ${version})`);
    console.log(`  Location : ${geminiDir}`);
    console.log(`  Updated  : ${count} files`);
  } else {
    console.log(`\n✓ Gemini CLI workflow installed`);
    console.log(`  Location : ${geminiDir}`);
    console.log(`  Files    : ${count} created`);
  }
  console.log('\nSlash commands available as /cfe:<skill-name> (e.g. /cfe:plan)');
  console.log('Agents require Gemini CLI 0.24+ with experimental.enableSubagents: true (already set).');
}
```

Update the `printSuccess` call in `installGemini` to pass `previousVersion`:
```js
printSuccess(geminiDir, manifest.length, previousVersion);
```

##### MODIFY: lib/runtimes/antigravity.js

**Update imports** (replace `const { copyDir, copyFile, writeFile } = require('../installer');`):

```js
const { copyFile, writeFile, overwriteDir, overwriteFile } = require('../installer');
```

**Update manifest import** (replace `const { saveManifest } = require('../manifest');`):

```js
const { saveManifest, getInstalledVersion }                = require('../manifest');
```

**Update `installAntigravity` function** — add `previousVersion` detection after `const manifest   = [];`:

```js
const previousVersion = getInstalledVersion(agentDir);
```

**Replace `copyDir` calls for skills/agents/rules** (lines 45-51):

```js
// 1. Package-owned: always overwrite skills
overwriteDir(path.join(TEMPLATES, '.claude', 'skills'), skillsDir, manifest);

// 2. Package-owned: always convert agents → skills (overwrite)
convertAgentsToSkills(path.join(TEMPLATES, '.claude', 'agents'), skillsDir, manifest);

// 3. Package-owned: always overwrite rules
overwriteDir(path.join(TEMPLATES, '.claude', 'rules'), rulesDir, manifest);
```

**Update `convertAgentsToSkills`** — remove the `!fs.existsSync(destPath)` guard so agents overwrite on upgrade:

Replace:
```js
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(destPath, content, 'utf8');
      manifest.push(destPath);
    }
```

With:
```js
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destPath, content, 'utf8');
    manifest.push(destPath);
```

**Update `generateTomlCommands`** — change `writeFile` to `overwriteFile`:

Replace `writeFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);`
with: `overwriteFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);`

**Update `generateAgentsMd`** — remove skip-if-exists guard so AGENTS.md regenerates on upgrade:

Remove the first line of the function body:
```js
  if (fs.existsSync(destPath)) return; // skip if already exists (merge strategy)
```

Change the `writeFile` call to `fs.writeFileSync` + `manifest.push`:

Replace:
```js
  writeFile(destPath, lines.join('\n'), manifest);
```
With:
```js
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, lines.join('\n'), 'utf8');
  manifest.push(destPath);
```

**Update `printSuccess`** — add `previousVersion` parameter and upgrade/install messaging:

```js
function printSuccess(agentDir, count, scope, previousVersion) {
  const { version } = require('../../package.json');
  if (previousVersion) {
    console.log(`\n✓ Antigravity workflow upgraded (${previousVersion} → ${version})`);
    console.log(`  Location : ${agentDir}`);
    console.log(`  Updated  : ${count} files`);
  } else {
    console.log(`\n✓ Antigravity workflow installed`);
    console.log(`  Location : ${agentDir}`);
    console.log(`  Files    : ${count} created`);
  }
  if (scope === 'local') {
    console.log('\nSkills available in .agent/skills/');
    console.log('Slash commands available as /cfe:<skill-name>');
  }
}
```

Update the `printSuccess` call to pass `previousVersion`:
```js
printSuccess(agentDir, manifest.length, scope, previousVersion);
```

#### Acceptance Criteria

- [ ] `lib/runtimes/gemini.js` uses `overwriteDir` for skills/agents/rules
- [ ] `lib/runtimes/gemini.js` uses `overwriteFile` for TOML commands
- [ ] `lib/runtimes/gemini.js` `printSuccess` shows upgrade vs install message
- [ ] `lib/runtimes/antigravity.js` uses `overwriteDir` for skills/rules
- [ ] `lib/runtimes/antigravity.js` `convertAgentsToSkills` no longer skips existing files
- [ ] `lib/runtimes/antigravity.js` `generateAgentsMd` no longer skips if file exists
- [ ] `lib/runtimes/antigravity.js` `printSuccess` shows upgrade vs install message

---

## Execution Log

### Task 1: Add `overwriteDir` and `overwriteFile` to `lib/installer.js`
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-24 08:30 UTC
- **Completed:** 2026-03-24 09:00 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/installer.js (added `overwriteDir`, `overwriteFile` functions; updated `module.exports`)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `overwriteDir` function is exported from `lib/installer.js`
  - [x] `overwriteFile` function is exported from `lib/installer.js`
  - [x] Both functions are present in `module.exports`

### Task 2: Add `getInstalledVersion` to `lib/manifest.js`
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-24 09:00 UTC
- **Completed:** 2026-03-24 09:05 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/manifest.js (added `getInstalledVersion` function; updated `module.exports`)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `getInstalledVersion` is exported from `lib/manifest.js`
  - [x] Returns `null` when no manifest exists
  - [x] Returns the version string when a manifest exists

### Task 3: Update `lib/runtimes/claude.js` — overwrite + upgrade detection
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-24 09:05 UTC
- **Completed:** 2026-03-24 09:15 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/runtimes/claude.js (updated imports; rewrote `installClaude` to use overwriteDir/overwriteFile; updated `printSuccess` to show upgrade vs install message)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `copyDir` import removed; `overwriteDir`, `overwriteFile` imported
  - [x] `getInstalledVersion` imported from manifest
  - [x] `installClaude` uses `overwriteDir` for skills, agents, rules; `overwriteFile` for settings.json and CLAUDE.md
  - [x] `installClaude` uses `copyFile` (skip-if-exists) for `current-topic.md`
  - [x] `printSuccess` prints "upgraded (vX → vY)" when `previousVersion` is set
  - [x] `printSuccess` prints "installed" when `previousVersion` is null

### Task 4: Update `lib/runtimes/gemini.js` and `lib/runtimes/antigravity.js` — overwrite + upgrade detection
- **Agent:** general-purpose
- **Mode:** task
- **Started:** 2026-03-24 09:15 UTC
- **Completed:** 2026-03-24 09:30 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/runtimes/gemini.js (updated imports; replaced `copyDir` with `overwriteDir`; `overwriteFile` for TOML; upgrade-aware `printSuccess`)
  - lib/runtimes/antigravity.js (updated imports; replaced `copyDir` with `overwriteDir`; removed skip-if-exists guards in `convertAgentsToSkills` and `generateAgentsMd`; `overwriteFile` for TOML; upgrade-aware `printSuccess`)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `lib/runtimes/gemini.js` uses `overwriteDir` for skills/agents/rules
  - [x] `lib/runtimes/gemini.js` uses `overwriteFile` for TOML commands
  - [x] `lib/runtimes/gemini.js` `printSuccess` shows upgrade vs install message
  - [x] `lib/runtimes/antigravity.js` uses `overwriteDir` for skills/rules
  - [x] `lib/runtimes/antigravity.js` `convertAgentsToSkills` no longer skips existing files
  - [x] `lib/runtimes/antigravity.js` `generateAgentsMd` no longer skips if file exists
  - [x] `lib/runtimes/antigravity.js` `printSuccess` shows upgrade vs install message
