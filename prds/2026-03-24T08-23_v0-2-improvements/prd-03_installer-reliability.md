# PRD-03: Installer: Reliability Fixes

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: PRD-01
Complexity: Medium

## Objective

Fix three reliability gaps exposed after the overwrite model is in place: remove a residual MCP memory config from the Gemini runtime, update the upgrade prompt to reflect the new semantics, and create a `settings.local.json` stub on fresh installs.

## Context

The Gemini runtime still generates an MCP memory server entry that was supposed to be removed in a prior PR. The overwrite prompt still says "Merge install (skip existing files)" — wrong for the new upgrade model. Fresh installs also leave engineers wondering where to add their MCP servers since `settings.local.json` doesn't exist until they create it.

## Tasks

### Task 1: Remove residual MCP memory config from `lib/runtimes/gemini.js`

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: lib/runtimes/gemini.js

**Remove the `memoryPath` variable** from `generateOrMergeSettings` (the lines computing `memoryPath` at the top of the function):

Remove these lines (they appear at the start of `generateOrMergeSettings`):
```js
  const memoryPath = scope === 'local'
    ? path.resolve(targetDir, '.gemini', 'memory', 'agent-memory.json')
    : path.join(os.homedir(), '.gemini', 'memory', 'agent-memory.json');
```

**Remove the `scope` parameter** from `generateOrMergeSettings` call and its signature since it was only used for `memoryPath`. Update the call in `installGemini` from `generateOrMergeSettings(geminiDir, scope, targetDir, manifest)` to `generateOrMergeSettings(geminiDir, manifest)` and the function signature from `function generateOrMergeSettings(geminiDir, scope, targetDir, manifest)` to `function generateOrMergeSettings(geminiDir, manifest)`.

**Replace the `else` branch** of `generateOrMergeSettings` that creates a new settings file (the part that includes `mcpServers.memory`):

Replace:
```js
  } else {
    const settings = {
      mcpServers: {
        memory: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-memory@2026.1.26'],
          env: { MEMORY_FILE_PATH: memoryPath },
        },
      },
      experimental: { enableSubagents: true },
    };
    writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', manifest);
  }
```

With:
```js
  } else {
    const settings = {
      experimental: { enableSubagents: true },
    };
    writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', manifest);
  }
```

#### Acceptance Criteria

- [ ] `generateOrMergeSettings` no longer references `mcpServers` or `memoryPath`
- [ ] Fresh Gemini install generates a settings file containing only `experimental.enableSubagents`
- [ ] No `os` import becomes unused (it's still used by `getRootDir` — leave it)
- [ ] `node lib/runtimes/gemini.js` does not throw (smoke test via `node -e "require('./lib/runtimes/gemini')"`)

---

### Task 2: Update `promptOverwrite` in `lib/prompts.js` to reflect upgrade semantics

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: lib/prompts.js

**Add `require('../package.json')` at the top** of `promptOverwrite` to get the version:

**Replace the entire `promptOverwrite` function**:

```js
async function promptOverwrite(runtime, scope, targetDir) {
  const dirMap = { claude: '.claude', gemini: '.gemini', antigravity: '.agent' };
  const base = scope === 'global' ? os.homedir() : targetDir;
  const dir = path.join(base, dirMap[runtime]);
  const { version } = require('../package.json');
  const answer = await ask(
    `\n${dir} already exists.\n` +
    `Upgrade to v${version}? Package files (skills, agents, rules) will be updated.\n` +
    `Your settings.local.json and PRDs are never touched. [Y/n]: `
  );
  return !answer || answer.toLowerCase() === 'y';
}
```

#### Acceptance Criteria

- [ ] `promptOverwrite` message mentions "Upgrade to vX.Y.Z"
- [ ] Message explains that `settings.local.json` and PRDs are never touched
- [ ] Old "Merge install (skip existing files)" language is gone

---

### Task 3: Create `settings.local.json` stub on fresh local installs in `lib/runtimes/claude.js`

**Status:** PENDING
**Depends on:** Task 1 of PRD-01 (Task 3)
**Complexity:** Low

#### File Changes

##### MODIFY: lib/runtimes/claude.js

**Add a step to create `settings.local.json` stub** in `installClaude`, after step 5 (run-log `.gitkeep`) and before step 6 (gitignore), only on fresh local installs. Insert the following block:

```js
  // 5b. Create settings.local.json stub on fresh local installs (user-owned, never in manifest)
  if (!previousVersion && scope === 'local') {
    const localPath = path.join(claudeDir, 'settings.local.json');
    if (!fs.existsSync(localPath)) {
      fs.writeFileSync(
        localPath,
        '{\n  // Add MCP servers, API keys, and custom env vars here.\n  // This file is never overwritten by upgrades.\n}\n',
        'utf8'
      );
    }
  }
```

Note: `settings.local.json` is NOT added to `manifest` — it is user-owned and should not be removed by uninstall.

#### Acceptance Criteria

- [ ] A fresh local install creates `.claude/settings.local.json` with comment content
- [ ] Re-running the installer (upgrade) does NOT overwrite an existing `settings.local.json`
- [ ] `settings.local.json` is not included in the manifest (uninstall does not remove it)
- [ ] `node -e "require('./lib/runtimes/claude')"` does not throw

---

## Execution Log

### Task 1: Remove residual MCP memory config from `lib/runtimes/gemini.js`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:35 UTC
- **Completed:** 2026-03-24 10:40 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/runtimes/gemini.js (removed `memoryPath` variable; updated `generateOrMergeSettings` signature to `(geminiDir, manifest)`; removed `mcpServers.memory` from else branch)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node -e "require('./lib/runtimes/gemini')"` — OK
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `generateOrMergeSettings` no longer references `mcpServers` or `memoryPath`
  - [x] Function signature is `generateOrMergeSettings(geminiDir, manifest)`
  - [x] Smoke test passes

### Task 2: Update `promptOverwrite` in `lib/prompts.js` to reflect upgrade semantics
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:40 UTC
- **Completed:** 2026-03-24 10:42 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/prompts.js (replaced `promptOverwrite` body with upgrade-aware message mentioning version and settings.local.json)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Message mentions "Upgrade to vX.Y.Z"
  - [x] Message explains settings.local.json and PRDs are never touched
  - [x] Old "Merge install (skip existing files)" language gone

### Task 3: Create `settings.local.json` stub on fresh local installs in `lib/runtimes/claude.js`
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:42 UTC
- **Completed:** 2026-03-24 10:45 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - lib/runtimes/claude.js (added step 5b block to create settings.local.json stub on fresh local installs only, not in manifest)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node -e "require('./lib/runtimes/claude')"` — OK
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Fresh local install creates `.claude/settings.local.json` stub
  - [x] Upgrade (previousVersion set) does not overwrite existing file
  - [x] Not in manifest
  - [x] Smoke test passes
