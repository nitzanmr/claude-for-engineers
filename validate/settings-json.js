#!/usr/bin/env node
/**
 * Validates .claude/settings.json structure.
 * Checks: valid JSON, MEMORY_FILE_PATH is absolute and not a placeholder,
 * MCP command is present, and npm package is pinned to a version.
 */

const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const settingsPath = path.join(root, '.claude', 'settings.json');

let settings;
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
  console.error('FAIL: .claude/settings.json is not valid JSON:', e.message);
  process.exit(1);
}

let errors = 0;

// 1. MCP command must be present
if (!settings?.mcpServers?.memory?.command) {
  console.error('FAIL: mcpServers.memory.command is missing from settings.json');
  errors++;
}

// 2. MEMORY_FILE_PATH must be present in settings.json or settings.local.json
const memoryPath = settings?.mcpServers?.memory?.env?.MEMORY_FILE_PATH;
if (!memoryPath) {
  console.error('FAIL: mcpServers.memory.env.MEMORY_FILE_PATH is missing from settings.json');
  errors++;
} else if (memoryPath.includes('REPLACE_WITH') || memoryPath.includes('PLACEHOLDER')) {
  // Placeholder in settings.json is expected — check settings.local.json for the real value
  const localPath = path.join(root, '.claude', 'settings.local.json');
  if (!fs.existsSync(localPath)) {
    console.error(
      'FAIL: settings.json has a placeholder MEMORY_FILE_PATH but settings.local.json does not exist.\n' +
      '      Create .claude/settings.local.json with your absolute path (see CLAUDE.md).'
    );
    errors++;
  } else {
    let local;
    try {
      local = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    } catch (e) {
      console.error('FAIL: .claude/settings.local.json is not valid JSON:', e.message);
      errors++;
    }
    if (local) {
      const localMemoryPath = local?.mcpServers?.memory?.env?.MEMORY_FILE_PATH;
      if (!localMemoryPath) {
        console.error(
          'FAIL: settings.local.json exists but mcpServers.memory.env.MEMORY_FILE_PATH is missing.\n' +
          '      Add your absolute path to settings.local.json.'
        );
        errors++;
      } else if (!path.isAbsolute(localMemoryPath)) {
        console.error('FAIL: MEMORY_FILE_PATH in settings.local.json is not absolute:', localMemoryPath);
        errors++;
      } else {
        console.log('OK: MEMORY_FILE_PATH (from settings.local.json):', localMemoryPath);
      }
    }
  }
} else if (!path.isAbsolute(memoryPath)) {
  console.error('FAIL: MEMORY_FILE_PATH in settings.json is not absolute:', memoryPath);
  errors++;
} else {
  console.log('OK: MEMORY_FILE_PATH:', memoryPath);
}

// 3. npm package should be pinned
const args = settings?.mcpServers?.memory?.args || [];
const pkgArg = args.find(a => a.includes('@modelcontextprotocol/server-memory'));
if (pkgArg && !pkgArg.match(/@modelcontextprotocol\/server-memory@\d/)) {
  console.warn('WARN: @modelcontextprotocol/server-memory is not pinned to a version (supply chain risk)');
} else if (pkgArg) {
  console.log('OK: npm package is pinned:', pkgArg);
}

if (errors > 0) {
  console.error('\n' + errors + ' error(s) found in settings.json');
  process.exit(1);
}

console.log('OK: settings.json is valid');
