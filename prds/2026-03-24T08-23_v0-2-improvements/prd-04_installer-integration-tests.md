# PRD-04: Installer: Integration Tests

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: PRD-01, PRD-02, PRD-03
Complexity: Medium

## Objective

Add a `test` script to `package.json` and write unit/integration tests for the new `overwriteDir`/`overwriteFile` functions and the manifest module's `getInstalledVersion`.

## Context

The existing test file `lib/transformers/toml.test.js` uses Node's built-in test runner (`node:test`). PRD-01 added `overwriteDir`, `overwriteFile`, and `getInstalledVersion` — all testable functions with real file-system behavior. A test script in `package.json` ties the suite together so `npm test` runs everything.

## Tasks

### Task 1: Add `test` script to `package.json`

**Status:** COMPLETED
**Complexity:** Low

#### File Changes

##### MODIFY: package.json

**Add a `scripts` section** after the `"engines"` block (before `"bin"`):

```json
"scripts": {
  "test": "node --test lib/transformers/toml.test.js tests/installer.test.js tests/manifest.test.js",
  "validate": "make validate"
},
```

#### Acceptance Criteria

- [ ] `npm test` runs without errors
- [ ] All tests listed in the script exist (after Tasks 2 and 3 complete)

---

### Task 2: Create `tests/installer.test.js`

**Status:** COMPLETED
**Depends on:** Task 1 of PRD-01
**Complexity:** Medium

#### File Changes

##### CREATE: tests/installer.test.js

```js
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const { copyDir, copyFile, overwriteDir, overwriteFile } = require('../lib/installer');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cfe-installer-'));
}
function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ── overwriteDir ──────────────────────────────────────────────────────────────

describe('overwriteDir', () => {
  test('copies a flat directory tree to dest', () => {
    const src  = makeTmpDir();
    const dest = makeTmpDir();
    fs.writeFileSync(path.join(src, 'a.md'), 'hello');
    fs.mkdirSync(path.join(src, 'sub'));
    fs.writeFileSync(path.join(src, 'sub', 'b.md'), 'world');

    const manifest = [];
    overwriteDir(src, dest, manifest);

    assert.strictEqual(fs.readFileSync(path.join(dest, 'a.md'), 'utf8'), 'hello');
    assert.strictEqual(fs.readFileSync(path.join(dest, 'sub', 'b.md'), 'utf8'), 'world');
    assert.strictEqual(manifest.length, 2);
    cleanup(src); cleanup(dest);
  });

  test('overwrites existing files at dest', () => {
    const src  = makeTmpDir();
    const dest = makeTmpDir();
    fs.writeFileSync(path.join(src,  'a.md'), 'new content');
    fs.writeFileSync(path.join(dest, 'a.md'), 'old content');

    overwriteDir(src, dest, []);

    assert.strictEqual(fs.readFileSync(path.join(dest, 'a.md'), 'utf8'), 'new content');
    cleanup(src); cleanup(dest);
  });

  test('creates dest directory if it does not exist', () => {
    const src  = makeTmpDir();
    const dest = path.join(makeTmpDir(), 'new', 'nested');
    fs.writeFileSync(path.join(src, 'f.md'), 'x');

    overwriteDir(src, dest, []);

    assert.ok(fs.existsSync(path.join(dest, 'f.md')));
    cleanup(src); cleanup(path.dirname(path.dirname(dest)));
  });
});

// ── copyDir (skip-existing behavior must be preserved) ───────────────────────

describe('copyDir (skip-existing)', () => {
  test('does not overwrite files that already exist at dest', () => {
    const src  = makeTmpDir();
    const dest = makeTmpDir();
    fs.writeFileSync(path.join(src,  'a.md'), 'new');
    fs.writeFileSync(path.join(dest, 'a.md'), 'existing');

    copyDir(src, dest, []);

    assert.strictEqual(fs.readFileSync(path.join(dest, 'a.md'), 'utf8'), 'existing');
    cleanup(src); cleanup(dest);
  });

  test('copies files that do not exist at dest', () => {
    const src  = makeTmpDir();
    const dest = makeTmpDir();
    fs.writeFileSync(path.join(src, 'new.md'), 'content');

    const manifest = [];
    copyDir(src, dest, manifest);

    assert.strictEqual(fs.readFileSync(path.join(dest, 'new.md'), 'utf8'), 'content');
    assert.strictEqual(manifest.length, 1);
    cleanup(src); cleanup(dest);
  });
});

// ── overwriteFile ─────────────────────────────────────────────────────────────

describe('overwriteFile', () => {
  test('creates a file and adds it to the manifest', () => {
    const src  = makeTmpDir();
    const dest = makeTmpDir();
    fs.writeFileSync(path.join(src, 'f.md'), 'content');

    const manifest = [];
    overwriteFile(path.join(src, 'f.md'), path.join(dest, 'f.md'), manifest);

    assert.strictEqual(fs.readFileSync(path.join(dest, 'f.md'), 'utf8'), 'content');
    assert.strictEqual(manifest.length, 1);
    cleanup(src); cleanup(dest);
  });

  test('overwrites an existing file', () => {
    const src  = makeTmpDir();
    const dest = makeTmpDir();
    fs.writeFileSync(path.join(src,  'f.md'), 'new');
    fs.writeFileSync(path.join(dest, 'f.md'), 'old');

    overwriteFile(path.join(src, 'f.md'), path.join(dest, 'f.md'), []);

    assert.strictEqual(fs.readFileSync(path.join(dest, 'f.md'), 'utf8'), 'new');
    cleanup(src); cleanup(dest);
  });

  test('creates nested destination directory if missing', () => {
    const src  = makeTmpDir();
    const dest = path.join(makeTmpDir(), 'deep', 'nested', 'f.md');
    fs.writeFileSync(path.join(src, 'f.md'), 'hello');

    overwriteFile(path.join(src, 'f.md'), dest, []);

    assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'hello');
    cleanup(src); cleanup(path.dirname(path.dirname(path.dirname(dest))));
  });
});
```

#### Acceptance Criteria

- [ ] `node --test tests/installer.test.js` exits 0
- [ ] All 8 test cases pass
- [ ] `overwriteDir` overwrite behavior is verified
- [ ] `copyDir` skip-existing behavior is still verified

---

### Task 3: Create `tests/manifest.test.js`

**Status:** COMPLETED
**Depends on:** Task 2 of PRD-01
**Complexity:** Low

#### File Changes

##### CREATE: tests/manifest.test.js

```js
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const { saveManifest, loadManifest, getInstalledVersion } = require('../lib/manifest');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cfe-manifest-'));
}
function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ── saveManifest + loadManifest round-trip ────────────────────────────────────

describe('saveManifest / loadManifest', () => {
  test('round-trips version and file list', () => {
    const dir = makeTmpDir();
    saveManifest(dir, ['/some/file.md', '/other/file.md']);

    const m = loadManifest(dir);
    assert.ok(m, 'manifest should exist');
    assert.ok(typeof m.version === 'string', 'version should be a string');
    assert.deepStrictEqual(m.files, ['/some/file.md', '/other/file.md']);
    cleanup(dir);
  });

  test('manifest file is written as valid JSON', () => {
    const dir = makeTmpDir();
    saveManifest(dir, []);

    const raw = fs.readFileSync(path.join(dir, '.install-manifest.json'), 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw));
    cleanup(dir);
  });
});

// ── loadManifest edge cases ───────────────────────────────────────────────────

describe('loadManifest', () => {
  test('returns null when no manifest file exists', () => {
    const dir = makeTmpDir();
    assert.strictEqual(loadManifest(dir), null);
    cleanup(dir);
  });

  test('returns null when manifest file is corrupted JSON', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, '.install-manifest.json'), 'not json', 'utf8');
    assert.strictEqual(loadManifest(dir), null);
    cleanup(dir);
  });
});

// ── getInstalledVersion ───────────────────────────────────────────────────────

describe('getInstalledVersion', () => {
  test('returns the version string from an existing manifest', () => {
    const dir = makeTmpDir();
    saveManifest(dir, []);

    const v = getInstalledVersion(dir);
    assert.ok(typeof v === 'string' && v.length > 0);
    cleanup(dir);
  });

  test('returns null when no manifest exists', () => {
    const dir = makeTmpDir();
    assert.strictEqual(getInstalledVersion(dir), null);
    cleanup(dir);
  });

  test('returns null when manifest is corrupted', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, '.install-manifest.json'), '{bad json', 'utf8');
    assert.strictEqual(getInstalledVersion(dir), null);
    cleanup(dir);
  });
});
```

#### Acceptance Criteria

- [ ] `node --test tests/manifest.test.js` exits 0
- [ ] All 7 test cases pass
- [ ] `getInstalledVersion` is imported and used — confirms it is exported from `lib/manifest.js`

---

## Execution Log

### Task 1: Add `test` script to `package.json`
- **Agent:** orchestrator (direct execution)
- **Mode:** task
- **Started:** 2026-03-24 14:10 UTC
- **Completed:** 2026-03-24 14:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:** package.json — added `scripts` block with `test` and `validate` entries after `engines`
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none — prerequisite for later tasks)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `npm test` runs without errors (verified after Tasks 2 and 3 complete)
  - [x] All tests listed in the script exist (confirmed after Tasks 2 and 3 complete)

### Task 2: Create `tests/installer.test.js`
- **Agent:** orchestrator (direct execution)
- **Mode:** task
- **Started:** 2026-03-24 14:10 UTC
- **Completed:** 2026-03-24 14:11 UTC
- **Status:** COMPLETED
- **Files created:** tests/installer.test.js
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node --test tests/installer.test.js` — 8 tests PASS
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `node --test tests/installer.test.js` exits 0
  - [x] All 8 test cases pass
  - [x] `overwriteDir` overwrite behavior is verified
  - [x] `copyDir` skip-existing behavior is still verified

### Task 3: Create `tests/manifest.test.js`
- **Agent:** orchestrator (direct execution)
- **Mode:** task
- **Started:** 2026-03-24 14:11 UTC
- **Completed:** 2026-03-24 14:11 UTC
- **Status:** COMPLETED
- **Files created:** tests/manifest.test.js
- **Files modified:** (none)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** `node --test tests/manifest.test.js` — 7 tests PASS; full suite (`npm test`) — 21 tests PASS
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] `node --test tests/manifest.test.js` exits 0
  - [x] All 7 test cases pass
  - [x] `getInstalledVersion` is imported and used — confirms it is exported from `lib/manifest.js`
