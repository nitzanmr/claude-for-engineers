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
