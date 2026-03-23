#!/usr/bin/env node
'use strict';

const { promptRuntime, promptScope, promptTargetDir, promptOverwrite } = require('../lib/prompts');
const { checkTargetExists } = require('../lib/installer');

const args = process.argv.slice(2);

// Flags
const isUninstall = args.includes('--uninstall');
const runtimeFlag = (['--claude', '--gemini', '--antigravity'].find(f => args.includes(f)) || '').slice(2) || null;
const scopeFlag   = (['--global', '--local'].find(f => args.includes(f)) || '').slice(2) || null;

async function main() {
  console.log('\nclaude-for-engineers installer\n');

  const runtime = runtimeFlag || await promptRuntime();
  const scope   = scopeFlag   || await promptScope();
  const targetDir = await promptTargetDir(scope);

  if (isUninstall) {
    const { uninstall } = require('../lib/manifest');
    const os = require('os');
    const path = require('path');
    const dirMap = { claude: '.claude', gemini: '.gemini', antigravity: '.agent' };
    const runtimeDir = scope === 'global'
      ? path.join(os.homedir(), dirMap[runtime])
      : path.join(targetDir, dirMap[runtime]);
    uninstall(runtimeDir);
    return;
  }

  if (checkTargetExists(runtime, scope, targetDir)) {
    const ok = await promptOverwrite(runtime, scope, targetDir);
    if (!ok) {
      console.log('\nInstallation cancelled.');
      process.exit(0);
    }
  }

  switch (runtime) {
    case 'claude': {
      const { installClaude } = require('../lib/runtimes/claude');
      await installClaude({ scope, targetDir });
      break;
    }
    case 'gemini': {
      const { installGemini } = require('../lib/runtimes/gemini');
      await installGemini({ scope, targetDir });
      break;
    }
    case 'antigravity': {
      const { installAntigravity } = require('../lib/runtimes/antigravity');
      await installAntigravity({ scope, targetDir });
      break;
    }
    default:
      console.error(`Unknown runtime: ${runtime}`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('\nInstallation failed:', err.message);
  process.exit(1);
});
