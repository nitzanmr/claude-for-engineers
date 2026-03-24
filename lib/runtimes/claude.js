'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { copyFile, writeFile, overwriteDir, overwriteFile } = require('../installer');
const { saveManifest, getInstalledVersion }                = require('../manifest');
const { appendGitignoreEntries }       = require('../gitignore');

const TEMPLATES = path.join(__dirname, '../../templates');

function getRootDir(scope, targetDir) {
  return scope === 'global' ? os.homedir() : targetDir;
}

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

function runValidation(targetDir, scope) {
  if (scope !== 'local') return; // validation only meaningful for local installs
  const { execFileSync } = require('child_process');
  const validateScript = path.join(__dirname, '../../validate/settings-json.js');
  if (!require('fs').existsSync(validateScript)) return;
  try {
    // Run validator with the target dir as cwd so it finds the right settings files
    execFileSync(process.execPath, [validateScript], {
      cwd: targetDir,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn('\n⚠ Validation reported issues above. Check settings.local.json.');
  }
}

module.exports = { installClaude };
