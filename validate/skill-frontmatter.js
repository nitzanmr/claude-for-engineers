#!/usr/bin/env node
// Validates YAML frontmatter in all .claude/skills/<skill>/SKILL.md files.
// Checks: frontmatter exists, required fields present and non-empty.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skillsDir = path.join(root, '.claude', 'skills');
const REQUIRED_FIELDS = ['name', 'description'];

let errors = 0;
let checked = 0;

const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.warn('WARN: No SKILL.md found in', entry.name);
    continue;
  }

  checked++;
  const content = fs.readFileSync(skillFile, 'utf8');
  const relPath = `.claude/skills/${entry.name}/SKILL.md`;

  if (!content.startsWith('---')) {
    console.error(`FAIL: ${relPath} — no YAML frontmatter (file must start with ---)`);
    errors++;
    continue;
  }

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) {
    console.error(`FAIL: ${relPath} — unclosed YAML frontmatter (missing closing ---)`);
    errors++;
    continue;
  }

  const frontmatter = content.slice(3, endIdx);
  let fieldErrors = 0;

  for (const field of REQUIRED_FIELDS) {
    const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    if (!match || !match[1].trim()) {
      console.error(`FAIL: ${relPath} — missing or empty required field: "${field}"`);
      errors++;
      fieldErrors++;
    }
  }

  if (fieldErrors === 0) {
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    console.log(`OK: ${relPath} (name: ${nameMatch ? nameMatch[1].trim() : '?'})`);
  }
}

console.log(`\nChecked ${checked} skill file(s).`);

if (errors > 0) {
  console.error(`${errors} validation error(s) found.`);
  process.exit(1);
}

console.log('All skill frontmatter is valid.');
