#!/usr/bin/env node
/**
 * CCE Check — live validation of a folder or .cce/.zip file.
 * Usage: node cce-check.js <folder|file.zip|file.cce>
 * Output: valid ✓ or rejected with errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const cceValidate = require('./cce-validate.js');

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
    return { valid: false, errors: ['Missing manifest.json'], manifest: null, entry: null };
  }
  const result = cceValidate.validateManifest(readFile(manifestPath));
  if (!result.valid) return { ...result, entry: null };
  const entry = result.manifest.entry || 'index.html';
  const entryPath = path.join(dir, entry);
  if (!fs.existsSync(entryPath)) {
    return { valid: false, errors: [`Entry not found: ${entry}`], manifest: result.manifest, entry: null };
  }
  return { ...result, entry, entryPath };
}

function validateEntry(dir, entryPath) {
  const content = readFile(entryPath);
  const appJs = path.join(dir, 'app.js');
  const allContent = content + (fs.existsSync(appJs) ? readFile(appJs) : '');
  return cceValidate.validateContent(allContent);
}

function extractZip(zipPath, outDir) {
  execSync(`unzip -o "${zipPath}" -d "${outDir}"`, { stdio: 'pipe' });
}

function main() {
  const input = process.argv[2];
  if (!input || !fs.existsSync(input)) {
    console.error('Usage: node cce-check.js <folder|file.zip|file.cce>');
    process.exit(1);
  }

  const absPath = path.resolve(input);
  let workDir = absPath;
  const stat = fs.statSync(absPath);

  if (stat.isFile()) {
    const ext = path.extname(absPath).toLowerCase();
    if (ext === '.zip' || ext === '.cce') {
      workDir = path.join(os.tmpdir(), `cce-check-${Date.now()}`);
      fs.mkdirSync(workDir, { recursive: true });
      try {
        extractZip(absPath, workDir);
      } catch (e) {
        console.error('Failed to extract zip:', e.message);
        process.exit(1);
      }
    } else if (ext === '.html') {
      console.log('☕ CCE Check — validating HTML (content + metadata)...\n');
      const content = readFile(absPath);
      const result = cceValidate.validateHtml(content);
      if (!result.valid) {
        console.error('❌ Rejected:');
        result.errors.forEach(e => console.error('   •', e));
        process.exit(1);
      }
      console.log('  ✓ Coffee stack only, no forbidden deps');
      if (result.metadata) {
        console.log('  ✓ metadata: ' + (result.metadata.name || '') + ' (' + (result.metadata.id || '') + ')');
      }
      console.log('\n✓ Valid');
      process.exit(0);
    } else {
      console.error('Expected folder, .html, .zip, or .cce file');
      process.exit(1);
    }
  }

  console.log('☕ CCE Check — validating...\n');

  const manifestResult = validateManifest(workDir);
  if (!manifestResult.valid) {
    console.error('❌ Rejected:');
    manifestResult.errors.forEach(e => console.error('   •', e));
    process.exit(1);
  }

  const contentResult = validateEntry(workDir, manifestResult.entryPath);
  if (!contentResult.valid) {
    console.error('❌ Rejected:');
    contentResult.errors.forEach(e => console.error('   •', e));
    process.exit(1);
  }

  console.log('  ✓ manifest.json (' + manifestResult.manifest.name + ' v' + manifestResult.manifest.version + ')');
  console.log('  ✓ entry: ' + manifestResult.entry);
  console.log('  ✓ Coffee stack only, no forbidden deps');
  console.log('\n✓ Valid');
}

main();
