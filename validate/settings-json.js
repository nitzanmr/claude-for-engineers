#!/usr/bin/env node
/**
 * Validates .claude/settings.json structure.
 * Checks: valid JSON, CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS env is set,
 * and required team/task permissions are present.
 */

const path = require('path');
const fs = require('fs');

const root = process.cwd();
const settingsPath = path.join(root, '.claude', 'settings.json');

let settings;
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
  console.error('FAIL: .claude/settings.json is not valid JSON:', e.message);
  process.exit(1);
}

let errors = 0;

// 1. CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS must be "1"
const agentTeams = settings?.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
if (agentTeams !== '1') {
  console.error('FAIL: env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS must be "1" in settings.json');
  errors++;
} else {
  console.log('OK: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1');
}

// 2. Required permissions must be present
const REQUIRED_PERMISSIONS = [
  'TeamCreate',
  'TaskCreate',
  'TaskList',
  'TaskUpdate',
  'TaskGet',
  'SendMessage',
];
const allowed = settings?.permissions?.allow || [];
const missing = REQUIRED_PERMISSIONS.filter(p => !allowed.includes(p));
if (missing.length > 0) {
  console.error('FAIL: Missing required permissions in settings.json:', missing.join(', '));
  errors++;
} else {
  console.log('OK: All required permissions are present');
}

if (errors > 0) {
  console.error('\n' + errors + ' error(s) found in settings.json');
  process.exit(1);
}

console.log('OK: settings.json is valid');
