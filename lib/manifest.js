'use strict';

const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = '.install-manifest.json';

function getManifestPath(runtimeDir) {
  return path.join(runtimeDir, MANIFEST_FILE);
}

/**
 * Write the install manifest to runtimeDir/.install-manifest.json
 */
function saveManifest(runtimeDir, files) {
  const { version } = require('../package.json');
  const manifest = {
    installedAt: new Date().toISOString(),
    version,
    runtime: path.basename(runtimeDir),
    files,
  };
  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.writeFileSync(getManifestPath(runtimeDir), JSON.stringify(manifest, null, 2), 'utf8');
}

/**
 * Load the manifest from runtimeDir. Returns null if not found.
 */
function loadManifest(runtimeDir) {
  const p = getManifestPath(runtimeDir);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Returns the version string from an existing manifest, or null if none.
 */
function getInstalledVersion(runtimeDir) {
  const m = loadManifest(runtimeDir);
  return m ? m.version : null;
}

/**
 * Remove all files listed in the manifest, then remove the manifest itself.
 */
function uninstall(runtimeDir) {
  const manifest = loadManifest(runtimeDir);
  if (!manifest) {
    console.error(`No install manifest found at ${runtimeDir}.\nRun the installer first.`);
    process.exit(1);
  }
  let removed = 0;
  for (const file of manifest.files) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      removed++;
    }
  }
  fs.unlinkSync(getManifestPath(runtimeDir));
  console.log(`\nUninstalled: ${removed} files removed from ${runtimeDir}`);
}

module.exports = { saveManifest, loadManifest, getInstalledVersion, uninstall };
