#!/usr/bin/env node
/**
 * Rejects AI attribution in commit messages and pull request text.
 *
 * This repository's standing convention is that no commit, pull request or
 * issue carries an AI co-author trailer or a "generated with" advertisement.
 * That was enforced by memory alone, which is not enforcement. Tooling defaults
 * to adding these, so one forgotten trailer lands in history permanently.
 *
 * Local hooks cannot be the guarantee: they are opt-in and `--no-verify` skips
 * them. This runs in CI, needs no install, and reads only git.
 *
 * Usage:
 *   node scripts/ci/check-no-ai-attribution.js --files a.txt b.txt
 *   node scripts/ci/check-no-ai-attribution.js --text "some text"
 *   node scripts/ci/check-no-ai-attribution.js <base-sha> <head-sha> [text-file]
 *
 * CI uses --files, reading commit messages fetched from the API. It does not
 * use the git range mode, because that needs the base commit and so a full
 * clone, and this repository carries 2.5 GB of history. The range mode stays
 * for local use, where the history is already on disk.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');

/**
 * Each pattern targets an attribution *form*, not a mention. Prose is allowed to
 * discuss Claude, AI or a generated file; only the machine-inserted credit is
 * rejected.
 *
 * The word boundary on "generated with" matters: an earlier draft without it
 * flagged the phrase "regenerated with only a new timestamp" in a real commit.
 */
const PATTERNS = [
  {
    name: 'AI co-author trailer',
    // Co-Authored-By naming a known agent, or any noreply address at an AI vendor.
    re: /^\s*co-authored-by:\s*.*(claude|copilot|cursor|devin|codex|chatgpt|openai|anthropic)/im,
  },
  {
    name: 'AI no-reply co-author address',
    re: /(noreply@anthropic\.com|cursoragent@cursor\.com|copilot@github\.com)/i,
  },
  {
    name: '"Generated with" advertisement',
    // \b stops this matching "regenerated with".
    re: /\bgenerated with\s*\[?\s*(claude|chatgpt|copilot|cursor|codex|ai\b)/i,
  },
  {
    name: 'robot generation marker',
    re: /🤖\s*generated/i,
  },
];

function findViolations(text, label) {
  const found = [];
  for (const { name, re } of PATTERNS) {
    const match = text.match(re);
    if (match) found.push({ label, name, snippet: match[0].trim().slice(0, 120) });
  }
  return found;
}

function commitsInRange(base, head) {
  const out = execFileSync('git', ['rev-list', `${base}..${head}`], { encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}

function commitMessage(sha) {
  return execFileSync('git', ['log', '-1', '--format=%B', sha], { encoding: 'utf8' });
}

function main() {
  const args = process.argv.slice(2);
  const violations = [];

  if (args[0] === '--text') {
    violations.push(...findViolations(args.slice(1).join(' '), 'text'));
  } else if (args[0] === '--files') {
    const files = args.slice(1);
    if (files.length === 0) {
      console.error('--files needs at least one path.');
      process.exitCode = 2;
      return;
    }
    for (const file of files) {
      if (!fs.existsSync(file)) {
        // A missing input means the check did not actually run over what it
        // claims to cover, which must not read as a pass.
        console.error(`Expected input file is missing: ${file}`);
        process.exitCode = 2;
        return;
      }
      violations.push(...findViolations(fs.readFileSync(file, 'utf8'), file));
    }
  } else {
    const [base, head, extraFile] = args;
    if (!base || !head) {
      console.error('Usage: check-no-ai-attribution.js <base-sha> <head-sha> [text-file]');
      process.exitCode = 2;
      return;
    }

    const shas = commitsInRange(base, head);
    if (shas.length === 0) {
      console.log('No commits in range. Nothing to check.');
    }
    for (const sha of shas) {
      violations.push(...findViolations(commitMessage(sha), `commit ${sha.slice(0, 8)}`));
    }

    // The pull request title and body travel into the squash commit, so they
    // are part of the history this protects.
    if (extraFile && fs.existsSync(extraFile)) {
      violations.push(...findViolations(fs.readFileSync(extraFile, 'utf8'), 'pull request text'));
    }
  }

  if (violations.length === 0) {
    console.log('No AI attribution found.');
    return;
  }

  console.error('AI attribution is not used in this repository. Found:\n');
  for (const v of violations) {
    console.error(`  ${v.label}: ${v.name}`);
    console.error(`    ${v.snippet}\n`);
  }
  console.error('Remove the trailer or advertisement and amend, then force push.');
  process.exitCode = 1;
}

main();
