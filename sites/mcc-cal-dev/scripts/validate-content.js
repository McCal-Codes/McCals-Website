#!/usr/bin/env node
/*
 * validate-content.js
 *
 * Catches the failure mode TypeScript cannot see: a slug written in a .ts content
 * file that has no matching record in a synced .json file. Types check the shape
 * of a string, not whether it resolves to anything, so a mistyped `repoSlug`
 * silently renders as a missing link rather than an error.
 *
 * Runs as part of `npm run build`.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const problems = [];
const warnings = [];

async function readJson(relative) {
  return JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
}

async function readText(relative) {
  return fs.readFile(path.join(root, relative), 'utf8');
}

/** Pulls string literals for a given key out of a TS source file. */
function collectField(source, field) {
  const pattern = new RegExp(`${field}:\\s*'([^']*)'`, 'g');
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

async function main() {
  const github = await readJson('src/content/github.json');
  const sites = await readJson('src/content/sites.json');
  const websitesSource = await readText('src/content/websites.ts');
  const projectsSource = await readText('src/content/projects.ts');

  const repoSlugs = new Set(github.repos.map((repo) => repo.slug));
  const siteSlugs = new Set(sites.sites.map((site) => site.slug));

  // Every repoSlug in websites.ts must resolve, or the Source link vanishes.
  for (const slug of collectField(websitesSource, 'repoSlug')) {
    if (!repoSlugs.has(slug)) {
      problems.push(
        `websites.ts references repoSlug '${slug}', which is not in github.json. ` +
          `Add it to TARGETS in scripts/sync-github.js and re-run npm run sync:github.`,
      );
    }
  }

  // Every website needs a live record, or its card renders with no status at all.
  const websiteSlugs = collectField(websitesSource, 'slug').filter(
    (slug) => !collectField(websitesSource, 'repoSlug').includes(slug) || true,
  );
  for (const slug of websiteSlugs) {
    if (!siteSlugs.has(slug) && !repoSlugs.has(slug)) {
      problems.push(
        `websites.ts declares slug '${slug}' with no record in sites.json. ` +
          `Add it to TARGETS in scripts/sync-sites.js and re-run npm run sync:sites.`,
      );
    }
  }

  // A project claiming a live status while its repo has gone quiet is the exact
  // overclaim this site exists to avoid. Warn rather than fail: dormancy is a
  // judgement call, and the fix may be to edit the prose instead of the status.
  const activeStatuses = ['active-alpha', 'active-development'];
  const STALE_MONTHS = 4;
  const now = Date.now();

  for (const repo of github.repos) {
    if (!repo.pushedAt) continue;
    const months = (now - new Date(`${repo.pushedAt}T00:00:00Z`).getTime()) / 2.6298e9;
    const declaresActive = activeStatuses.some((status) =>
      new RegExp(`slug: '${repo.slug}'[\\s\\S]{0,900}?status: '${status}'`).test(
        projectsSource,
      ),
    );
    if (declaresActive && months > STALE_MONTHS) {
      warnings.push(
        `'${repo.slug}' is marked active but was last pushed ${repo.pushedAt} ` +
          `(${Math.floor(months)} months ago). Update the status or the repository.`,
      );
    }
  }

  // An unstated role renders as nothing. That is correct behaviour, but it should
  // not be forgotten about silently.
  const pendingRoles = (websitesSource.match(/role: ROLE_PENDING/g) || []).length;
  if (pendingRoles > 0) {
    warnings.push(
      `${pendingRoles} website${pendingRoles === 1 ? '' : 's'} still have ROLE_PENDING. ` +
        `Their role line is hidden until set.`,
    );
  }

  for (const warning of warnings) console.warn(`  warn  ${warning}`);
  for (const problem of problems) console.error(`  ERROR ${problem}`);

  if (problems.length) {
    console.error(`\nvalidate-content: ${problems.length} problem(s).`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `validate-content: ok (${repoSlugs.size} repos, ${siteSlugs.size} sites` +
      `${warnings.length ? `, ${warnings.length} warning(s)` : ''})`,
  );
}

main().catch((error) => {
  console.error(`validate-content failed: ${error.message}`);
  process.exitCode = 1;
});
