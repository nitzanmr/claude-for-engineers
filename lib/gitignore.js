'use strict';

const fs = require('fs');
const path = require('path');

const CLAUDE_ENTRIES = [
  '.claude/context/run-log/*.md',
];

/**
 * Append gitignore entries to projectDir/.gitignore.
 * Skips entries that are already present. Does not overwrite existing content.
 */
function appendGitignoreEntries(projectDir, entries = CLAUDE_ENTRIES) {
  const gitignorePath = path.join(projectDir, '.gitignore');
  const existing = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8')
    : '';
  const toAdd = entries.filter(e => !existing.includes(e));
  if (toAdd.length === 0) return;
  const block = '\n# claude-for-engineers\n' + toAdd.join('\n') + '\n';
  fs.appendFileSync(gitignorePath, block, 'utf8');
}

module.exports = { appendGitignoreEntries, CLAUDE_ENTRIES };
