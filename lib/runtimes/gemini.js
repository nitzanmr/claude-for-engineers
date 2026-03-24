'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { copyFile, writeFile, overwriteDir, overwriteFile } = require('../installer');
const { saveManifest, getInstalledVersion }                = require('../manifest');
const { skillToToml }                  = require('../transformers/toml');

const TEMPLATES = path.join(__dirname, '../../templates');

function getRootDir(scope, targetDir) {
  return scope === 'global' ? os.homedir() : targetDir;
}

async function installGemini({ scope, targetDir }) {
  const root      = getRootDir(scope, targetDir);
  const geminiDir = path.join(root, '.gemini');
  const manifest  = [];

  const previousVersion = getInstalledVersion(geminiDir);

  // 1. Package-owned: always overwrite skills, agents, rules
  overwriteDir(path.join(TEMPLATES, '.claude', 'skills'), path.join(geminiDir, 'skills'), manifest);
  overwriteDir(path.join(TEMPLATES, '.claude', 'agents'), path.join(geminiDir, 'agents'), manifest);
  overwriteDir(path.join(TEMPLATES, '.claude', 'rules'),  path.join(geminiDir, 'rules'),  manifest);

  // 4. Generate TOML commands for each skill → .gemini/commands/cfe/<name>.toml
  generateTomlCommands(path.join(TEMPLATES, '.claude', 'skills'), path.join(geminiDir, 'commands', 'cfe'), manifest);

  // 5. Generate settings.json (new install) or merge experimental.enableSubagents (existing)
  generateOrMergeSettings(geminiDir, manifest);

  // 6. Copy CLAUDE.md → GEMINI.md
  const geminiMdDest = scope === 'local'
    ? path.join(targetDir, 'GEMINI.md')
    : path.join(root, '.gemini', 'GEMINI.md');
  copyFile(path.join(TEMPLATES, 'CLAUDE.md'), geminiMdDest, manifest);

  // 7. Save manifest
  saveManifest(geminiDir, manifest);

  printSuccess(geminiDir, manifest.length, previousVersion);
}

function generateTomlCommands(skillsSrc, commandsDir, manifest) {
  fs.mkdirSync(commandsDir, { recursive: true });
  for (const entry of fs.readdirSync(skillsSrc, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = path.join(skillsSrc, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    const toml = skillToToml(fs.readFileSync(skillMdPath, 'utf8'));
    if (!toml) continue;
    overwriteFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);
  }
}

function generateOrMergeSettings(geminiDir, manifest) {
  const settingsPath = path.join(geminiDir, 'settings.json');

  if (fs.existsSync(settingsPath)) {
    // Merge: add experimental.enableSubagents if missing, leave rest untouched
    let existing;
    try { existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
    catch { return; } // corrupted settings.json — leave it alone
    if (!existing.experimental?.enableSubagents) {
      existing.experimental = { ...(existing.experimental || {}), enableSubagents: true };
      fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
      // Note: not added to manifest since we modified, not created, the file
    }
  } else {
    const settings = {
      experimental: { enableSubagents: true },
    };
    writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', manifest);
  }
}

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

module.exports = { installGemini };
