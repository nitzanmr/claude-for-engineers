'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Recursively copy srcDir into destDir.
 * Skips files that already exist at dest (merge strategy).
 * Appends created file paths to manifest array.
 */
function copyDir(srcDir, destDir, manifest = []) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath  = path.join(srcDir,  entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, manifest);
    } else if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      manifest.push(destPath);
    }
  }
  return manifest;
}

/**
 * Copy a single file. Skips if dest already exists.
 * Returns true if the file was created.
 */
function copyFile(src, dest, manifest = []) {
  if (fs.existsSync(dest)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  manifest.push(dest);
  return true;
}

/**
 * Write content to filePath. Skips if file already exists.
 * Returns true if the file was created.
 */
function writeFile(filePath, content, manifest = []) {
  if (fs.existsSync(filePath)) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  manifest.push(filePath);
  return true;
}

/**
 * Check whether the runtime's target directory already exists.
 */
function checkTargetExists(runtime, scope, targetDir) {
  const dirMap = { claude: '.claude', gemini: '.gemini', antigravity: '.agent' };
  const base = scope === 'global' ? os.homedir() : targetDir;
  return fs.existsSync(path.join(base, dirMap[runtime]));
}

module.exports = { copyDir, copyFile, writeFile, checkTargetExists };
