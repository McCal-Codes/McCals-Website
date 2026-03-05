#!/usr/bin/env node

/**
 * Cross-platform repository maintenance utilities.
 *
 * Usage:
 *   node scripts/utils/repo-maintenance.js clean
 *   node scripts/utils/repo-maintenance.js analyze-large-files [--min-mb=1]
 *   node scripts/utils/repo-maintenance.js analyze-duplicates
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'test-results',
  '.next',
  'out',
  'build',
  'coverage'
]);

function toRelative(targetPath) {
  return path.relative(ROOT, targetPath).split(path.sep).join('/');
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

async function pathExists(targetPath) {
  try {
    await fsp.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dirPath, collector) {
  let entries;
  try {
    entries = await fsp.readdir(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await walkFiles(fullPath, collector);
      continue;
    }

    if (!entry.isFile()) continue;

    try {
      const stat = await fsp.stat(fullPath);
      collector.push({ fullPath, size: stat.size });
    } catch {
      // Skip files that can't be stat'ed.
    }
  }
}

async function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function clean() {
  const targets = [
    'dist',
    path.join('site-workspace', 'temp'),
    path.join('site-workspace', 'drafts')
  ];

  let removedDirs = 0;
  for (const rel of targets) {
    const full = path.join(ROOT, rel);
    if (!(await pathExists(full))) continue;
    await fsp.rm(full, { recursive: true, force: true });
    removedDirs += 1;
    console.log(`removed: ${toRelative(full)} - repo-maintenance.js:107`);
  }

  const logsDir = path.join(ROOT, 'logs');
  let removedLogs = 0;
  if (await pathExists(logsDir)) {
    const entries = await fsp.readdir(logsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.log')) continue;
      const full = path.join(logsDir, entry.name);
      await fsp.rm(full, { force: true });
      removedLogs += 1;
      console.log(`removed: ${toRelative(full)} - repo-maintenance.js:119`);
    }
  }

  console.log(`\nclean complete: ${removedDirs} directory target(s), ${removedLogs} log file(s) - repo-maintenance.js:123`);
}

async function analyzeLargeFiles(minMbArg) {
  const minMb = Number.isFinite(minMbArg) && minMbArg > 0 ? minMbArg : 1;
  const threshold = minMb * 1024 * 1024;

  const files = [];
  await walkFiles(ROOT, files);

  const large = files
    .filter((f) => f.size >= threshold)
    .sort((a, b) => b.size - a.size);

  if (!large.length) {
    console.log(`No files >= ${minMb} MB found (excluding common build/dependency dirs). - repo-maintenance.js:138`);
    return;
  }

  console.log(`Files >= ${minMb} MB (${large.length}): - repo-maintenance.js:142`);
  for (const file of large) {
    console.log(`${formatBytes(file.size).padStart(8)}  ${toRelative(file.fullPath)} - repo-maintenance.js:144`);
  }
}

async function analyzeDuplicates() {
  const files = [];
  await walkFiles(ROOT, files);

  const bySize = new Map();
  for (const file of files) {
    if (!bySize.has(file.size)) bySize.set(file.size, []);
    bySize.get(file.size).push(file);
  }

  const sizeCandidates = Array.from(bySize.values()).filter((group) => group.length > 1);
  if (!sizeCandidates.length) {
    console.log('No duplicate files found. - repo-maintenance.js:160');
    return;
  }

  const hashMap = new Map();
  for (const group of sizeCandidates) {
    for (const file of group) {
      try {
        const hash = await sha256(file.fullPath);
        const key = `${file.size}:${hash}`;
        if (!hashMap.has(key)) hashMap.set(key, []);
        hashMap.get(key).push(file);
      } catch {
        // ignore unreadable files
      }
    }
  }

  const duplicates = Array.from(hashMap.values())
    .filter((group) => group.length > 1)
    .sort((a, b) => (b[0]?.size || 0) - (a[0]?.size || 0));

  if (!duplicates.length) {
    console.log('No exact duplicate files found (size+hash). - repo-maintenance.js:183');
    return;
  }

  let groupIndex = 0;
  for (const group of duplicates) {
    groupIndex += 1;
    const sizeText = formatBytes(group[0].size);
    const wasted = (group.length - 1) * group[0].size;
    console.log(`\n[${groupIndex}] ${group.length} duplicates • ${sizeText} each • potential reclaim ${formatBytes(wasted)} - repo-maintenance.js:192`);
    group.forEach((file) => console.log(toRelative(file.fullPath)));
  }

  const wastedTotal = duplicates.reduce((sum, group) => sum + (group.length - 1) * group[0].size, 0);
  console.log(`\nExact duplicate groups: ${duplicates.length} - repo-maintenance.js:197`);
  console.log(`Potential reclaim if deduped: ${formatBytes(wastedTotal)} - repo-maintenance.js:198`);
}

async function main() {
  const [, , command, ...args] = process.argv;

  if (!command) {
    console.error('Missing command. Use: clean | analyzelargefiles | analyzeduplicates - repo-maintenance.js:205');
    process.exit(1);
  }

  if (command === 'clean') {
    await clean();
    return;
  }

  if (command === 'analyze-large-files') {
    const minMbFlag = args.find((arg) => arg.startsWith('--min-mb='));
    const minMb = minMbFlag ? Number(minMbFlag.split('=')[1]) : 1;
    await analyzeLargeFiles(minMb);
    return;
  }

  if (command === 'analyze-duplicates') {
    await analyzeDuplicates();
    return;
  }

  console.error(`Unknown command: ${command} - repo-maintenance.js:226`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
