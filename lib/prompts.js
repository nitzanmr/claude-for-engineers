'use strict';

const readline = require('readline');
const path = require('path');
const os = require('os');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function promptRuntime() {
  console.log('Which AI runtime would you like to install for?\n');
  console.log('  1) Claude Code    (.claude/)');
  console.log('  2) Gemini CLI     (.gemini/)');
  console.log('  3) Antigravity    (.agent/)');
  const answer = await ask('\nEnter 1, 2, or 3: ');
  const map = { '1': 'claude', '2': 'gemini', '3': 'antigravity' };
  if (!map[answer]) {
    console.error('\nInvalid choice. Run again and enter 1, 2, or 3.');
    process.exit(1);
  }
  return map[answer];
}

async function promptScope() {
  const answer = await ask('Install globally (~/.<dir>/) or locally (project dir)? [local/global]: ');
  const norm = answer.toLowerCase();
  if (norm === '' || norm === 'local' || norm === 'l') return 'local';
  if (norm === 'global' || norm === 'g') return 'global';
  console.error('\nInvalid scope — enter "local" or "global".');
  process.exit(1);
}

async function promptTargetDir(scope) {
  if (scope === 'global') return os.homedir();
  const cwd = process.cwd();
  const answer = await ask(`Project directory [${cwd}]: `);
  return answer || cwd;
}

async function promptOverwrite(runtime, scope, targetDir) {
  const dirMap = { claude: '.claude', gemini: '.gemini', antigravity: '.agent' };
  const base = scope === 'global' ? os.homedir() : targetDir;
  const dir = path.join(base, dirMap[runtime]);
  const answer = await ask(`\n${dir} already exists.\nMerge install (skip existing files, add new ones)? [Y/n]: `);
  return !answer || answer.toLowerCase() === 'y';
}

module.exports = { promptRuntime, promptScope, promptTargetDir, promptOverwrite };
