#!/usr/bin/env node
/**
 * Validates PRD dependency graphs in prds/ for cycles.
 * Parses "Depends on:" headers from prd-NN_*.md files.
 * Uses DFS cycle detection — covers all cycle lengths including 3+ node cycles (BLG-021 fix).
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const prdsDir = path.join(root, 'prds');

if (!fs.existsSync(prdsDir)) {
  console.log('No prds/ directory found — nothing to validate.');
  process.exit(0);
}

let totalErrors = 0;

const prdDirs = fs.readdirSync(prdsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

for (const dir of prdDirs) {
  const dirPath = path.join(prdsDir, dir);
  const prdFiles = fs.readdirSync(dirPath)
    .filter(f => /^prd-\d+.*\.md$/.test(f))
    .sort();

  if (prdFiles.length === 0) continue;

  // Build adjacency list: { 'PRD-01': ['PRD-02', 'PRD-03'], ... }
  const graph = {};

  for (const file of prdFiles) {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    const numMatch = file.match(/^prd-(\d+)/);
    if (!numMatch) continue;

    const id = `PRD-${numMatch[1].padStart(2, '0')}`;
    const depsMatch = content.match(/^Depends on:\s*(.+)$/m);

    if (!depsMatch || /^none$/i.test(depsMatch[1].trim())) {
      graph[id] = [];
    } else {
      graph[id] = depsMatch[1]
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);
    }
  }

  // DFS cycle detection
  // visited: nodes fully processed; stack: nodes in current DFS path
  function dfs(node, visited, stack, cyclePath) {
    visited.add(node);
    stack.add(node);
    cyclePath.push(node);

    for (const dep of (graph[node] || [])) {
      if (!visited.has(dep)) {
        if (dfs(dep, visited, stack, cyclePath)) return true;
      } else if (stack.has(dep)) {
        cyclePath.push(dep); // show where the cycle closes
        return true;
      }
    }

    stack.delete(node);
    cyclePath.pop();
    return false;
  }

  const visited = new Set();
  let cycleFound = false;

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const cyclePath = [];
      if (dfs(node, visited, new Set(), cyclePath)) {
        console.error(`FAIL: ${dir} — cycle detected: ${cyclePath.join(' → ')}`);
        totalErrors++;
        cycleFound = true;
        break;
      }
    }
  }

  if (!cycleFound) {
    console.log(`OK: ${dir} — no dependency cycles (${Object.keys(graph).length} PRDs)`);
  }
}

console.log('');

if (totalErrors > 0) {
  console.error(`${totalErrors} cycle(s) found across PRD directories.`);
  process.exit(1);
}

console.log('All PRD dependency graphs are acyclic.');
