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

  // 8. Run post-install validation
  runValidation(targetDir, scope);
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
