'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { copyFile, writeFile, overwriteDir, overwriteFile } = require('../installer');
const { saveManifest, getInstalledVersion }                = require('../manifest');
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

  const previousVersion = getInstalledVersion(agentDir);

  // 1. Package-owned: always overwrite skills
  overwriteDir(path.join(TEMPLATES, '.claude', 'skills'), skillsDir, manifest);

  // 2. Package-owned: always convert agents → skills (overwrite)
  convertAgentsToSkills(path.join(TEMPLATES, '.claude', 'agents'), skillsDir, manifest);

  // 3. Package-owned: always overwrite rules
  overwriteDir(path.join(TEMPLATES, '.claude', 'rules'), rulesDir, manifest);

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

  printSuccess(agentDir, manifest.length, scope, previousVersion);
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
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destPath, content, 'utf8');
    manifest.push(destPath);
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
    overwriteFile(path.join(commandsDir, `${entry.name}.toml`), toml, manifest);
  }
}

/**
 * Generate .agent/AGENTS.md — a plain Markdown file listing all agents
 * by name and description. Used as a workspace-level reference.
 */
function generateAgentsMd(agentsSrc, destPath, manifest) {
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
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, lines.join('\n'), 'utf8');
  manifest.push(destPath);
}

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

module.exports = { installAntigravity };
