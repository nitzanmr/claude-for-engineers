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
