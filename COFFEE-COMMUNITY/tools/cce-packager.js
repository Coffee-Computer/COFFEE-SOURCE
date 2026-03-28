#!/usr/bin/env node
/**
 * Coffee Packager — validates and zips a folder into a .cce file.
 * Usage: node cce-packager.js <folder>
 * Output: <folder-name>.cce
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FORBIDDEN = [
  /react/i, /vue/i, /angular/i, /svelte/i,
  /tailwind|tw-|tailwindcss/i,
  /bootstrap|btn-primary|btn-secondary/i,
  /jquery|jQuery|\$\(/,
  /google-analytics|gtag|ga\(/,
  /cdn\.jsdelivr\.net.*react|unpkg\.com.*react/i,
  /cdn\.jsdelivr\.net.*vue|unpkg\.com.*vue/i,
];

function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function validateManifest(dir) {
  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Missing manifest.json');
  }
  const raw = readFile(manifestPath);
  let m;
  try {
    m = JSON.parse(raw);
  } catch {
    throw new Error('Invalid manifest.json');
  }
  if (!m.name || !m.id || !m.version) {
    throw new Error('manifest.json must have name, id, version');
  }
  if (!/^[a-z0-9-]+$/.test(m.id)) {
    throw new Error('manifest.id must be slug (a-z, 0-9, -)');
  }
  const entry = m.entry || 'index.html';
  const entryPath = path.join(dir, entry);
  if (!fs.existsSync(entryPath)) {
    throw new Error(`Entry not found: ${entry}`);
  }
  return { manifest: m, entry };
}

function validateEntry(dir, entryPath) {
  const content = readFile(entryPath);
  const appJs = path.join(dir, 'app.js');
  const allContent = content + (fs.existsSync(appJs) ? readFile(appJs) : '');

  for (const pattern of FORBIDDEN) {
    if (pattern.test(allContent)) {
      throw new Error(`Forbidden pattern: ${pattern}`);
    }
  }

  if (!/coffee-control|coffee\.control/i.test(allContent)) {
    throw new Error('Must load Coffee Control (coffee-control.js)');
  }
  if (!/coffee-ui|coffee\.ui/i.test(allContent)) {
    throw new Error('Must load Coffee UI (coffee-ui.js)');
  }
  if (!/coffee\.(button|textarea|input|slider|select|label|link|text|para|spinner|msg|card|heading|row|col|stack|appShell|container|injectTheme|inspector|camera|switchCamera|microphone|record|streamSpectrum|save|load|list|storageQuota|theme|graph|chatInput|chatBubble|connect|chat|drive|imageToBlob|toast|request|modal|dialog|form|table|scene3d|scene2d|animate|draw|synth|fuzz|nebula|brick|ai|context|bee|pix|plex|filterCss|shot|svg|que|wire|snake|rusty|skater|floatGroup|floatStack|iconButton|pillStrip|toolDock|omni|frame|yay|nostr|git|install|base)/.test(allContent)) {
    throw new Error('Must use Coffee UI/Control APIs (e.g. coffee.button, coffee.drive)');
  }
}

function addSignature(manifestPath) {
  const m = JSON.parse(readFile(manifestPath));
  m['coffee-signature'] = 'cce-v1';
  m['packaged-at'] = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2));
}

function zipFolder(srcDir, outPath) {
  const cwd = process.cwd();
  process.chdir(srcDir);
  try {
    execSync(`zip -r "${outPath}" . -x "*.DS_Store" -x "*.cce"`, { stdio: 'inherit' });
  } finally {
    process.chdir(cwd);
  }
}

function main() {
  const folder = process.argv[2];
  if (!folder || !fs.existsSync(folder)) {
    console.error('Usage: node cce-packager.js <folder>');
    process.exit(1);
  }

  const absDir = path.resolve(folder);
  const dirName = path.basename(absDir);
  const outName = dirName.endsWith('.cce') ? dirName : `${dirName}.cce`;
  const outPath = path.join(path.dirname(absDir), outName);

  console.log('☕ Coffee Packager — validating...');

  const { manifest, entry } = validateManifest(absDir);
  validateEntry(absDir, path.join(absDir, entry));

  console.log(`  ✓ manifest.json (${manifest.name} v${manifest.version})`);
  console.log(`  ✓ entry: ${entry}`);
  console.log(`  ✓ Coffee stack only, no forbidden deps`);

  addSignature(path.join(absDir, 'manifest.json'));
  console.log('  ✓ Coffee signature added');

  zipFolder(absDir, outPath);
  console.log(`\n✓ Packaged: ${outPath}`);
}

main();
