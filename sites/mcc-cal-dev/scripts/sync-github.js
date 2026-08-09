#!/usr/bin/env node
/*
 * sync-github.js
 *
 * Pulls real repository facts from the GitHub API into src/content/github.json.
 *
 * Everything factual about a project (current version, release history, languages,
 * license, last push) comes from here. The hand-written narrative in projects.ts
 * never restates any of it, so the two cannot drift.
 *
 * The output is committed. Builds read the JSON, never the network: the site's CSP
 * is `connect-src 'self'` and the build must work offline and deterministically.
 *
 * All configured repositories are public, so a token is optional. Without one you
 * get 60 requests/hour, which covers a run of this size. CI passes GITHUB_TOKEN.
 *
 * Usage:
 *   node scripts/sync-github.js
 *   node scripts/sync-github.js --dry-run
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '..', 'src', 'content', 'github.json');

/**
 * Repositories to track, keyed by the project slug in projects.ts.
 * A slug with no entry here simply renders without live data.
 */
const TARGETS = [
  { slug: 'terranova', owner: 'McCal-Codes', repo: 'TerraNova', releases: true },
  { slug: 'abridgd', owner: 'McCal-Codes', repo: 'abridgd', releases: true },
  { slug: 'void-ledger', owner: 'McCal-Codes', repo: 'void-ledger', releases: true },
];

function headers() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PRIVATE_REPO_TOKEN || '';
  const base = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'mccal-dev-portfolio-sync',
  };
  if (token) base.Authorization = `Bearer ${token}`;
  return base;
}

async function get(url) {
  const response = await fetch(url, { headers: headers(), cache: 'no-store' });
  const text = await response.text();

  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = (body && body.message) || text || `HTTP ${response.status}`;
    const error = new Error(`${url} -> ${response.status}: ${message}`);
    error.status = response.status;
    throw error;
  }

  return body;
}

/** Byte counts per language, reduced to the ones worth naming. */
function topLanguages(languages) {
  const total = Object.values(languages).reduce((sum, n) => sum + Number(n || 0), 0);
  if (!total) return [];

  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, share: Number(bytes) / total }))
    // Below 3% is noise: a stray config file or a single script.
    .filter((entry) => entry.share >= 0.03)
    .sort((a, b) => b.share - a.share)
    .map((entry) => ({ name: entry.name, percent: Math.round(entry.share * 100) }));
}

async function fetchTarget(target) {
  const base = `https://api.github.com/repos/${target.owner}/${target.repo}`;

  const repo = await get(base);
  const languages = await get(`${base}/languages`).catch(() => ({}));
  const releases = target.releases
    ? await get(`${base}/releases?per_page=20`).catch(() => [])
    : [];

  const published = (Array.isArray(releases) ? releases : [])
    .filter((release) => !release.draft)
    .map((release) => ({
      tag: release.tag_name,
      name: release.name || release.tag_name,
      date: (release.published_at || '').slice(0, 10),
      prerelease: Boolean(release.prerelease),
      url: release.html_url,
    }));

  return {
    slug: target.slug,
    owner: target.owner,
    repo: target.repo,
    fullName: repo.full_name,
    url: repo.html_url,
    private: Boolean(repo.private),
    description: repo.description || '',
    homepage: repo.homepage || '',
    license: (repo.license && repo.license.spdx_id) || null,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    languages: topLanguages(languages),
    createdAt: (repo.created_at || '').slice(0, 10),
    pushedAt: (repo.pushed_at || '').slice(0, 10),
    defaultBranch: repo.default_branch || 'main',
    stars: Number(repo.stargazers_count || 0),
    forks: Number(repo.forks_count || 0),
    // Newest published release. Drives the version marker on the case study.
    latestRelease: published[0] || null,
    releases: published,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const repos = [];

  for (const target of TARGETS) {
    process.stdout.write(`Fetching ${target.owner}/${target.repo} ... `);
    try {
      repos.push(await fetchTarget(target));
      process.stdout.write('ok\n');
    } catch (error) {
      process.stdout.write('FAILED\n');
      throw error;
    }
  }

  const payload = {
    generatedBy: 'sites/mcc-cal-dev/scripts/sync-github.js',
    generatedAt: new Date().toISOString(),
    repos,
  };

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${repos.length} repositories)`);
}

main().catch((error) => {
  console.error(`\nsync-github failed: ${error.message}`);
  if (error.status === 403) {
    console.error('Rate limited. Set GITHUB_TOKEN to raise the limit from 60/hour to 5000/hour.');
  }
  process.exitCode = 1;
});
