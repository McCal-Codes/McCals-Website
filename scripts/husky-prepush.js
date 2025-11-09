#!/usr/bin/env node
const child = require('child_process');
const path = require('path');
try {
  // List staged image files (added, copied, modified)
  const cmd = "git diff --cached --name-only --diff-filter=ACM -- '*.jpg' '*.jpeg' '*.png' '*.webp' '*.avif' || true";
  const out = child.execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','ignore'] });
  const files = out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!files.length) {
    // No staged images
    process.exit(0);
  }

  console.log('Staged image files detected:', files.join(', '));

  // Run the optimizer on the staged files and auto-commit if optimized
  // Use --commit to create a commit with optimized images
  const args = files.concat(['--commit', '--commit-message', 'chore: optimize images (pre-push)']);
  const nodePath = process.execPath;
  const script = path.join(process.cwd(), 'scripts', 'optimize-images-local.js');
  const spawnArgs = [script].concat(args);

  const res = child.spawnSync(nodePath, spawnArgs, { stdio: 'inherit' });
  if (res.error) {
    console.error('Failed to run optimizer:', res.error);
    process.exit(1);
  }

  // If optimizer created a commit, re-stage any remaining changes
  try {
    child.execSync('git add -A', { stdio: 'inherit' });
  } catch (e) {
    // ignore
  }

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
