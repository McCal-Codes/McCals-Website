#!/usr/bin/env node
/*
 * export-private-repo-metadata.js
 *
 * Generates a sanitized JSON file containing selected metadata for private repositories.
 * This allows browser widgets to consume repo signals without exposing tokens client-side.
 *
 * Usage examples:
 *   node scripts/utils/export-private-repo-metadata.js
 *   node scripts/utils/export-private-repo-metadata.js --repos McCal-Codes/abridgd --out src/data/private-repo-metadata.json
 *   node scripts/utils/export-private-repo-metadata.js --repos McCal-Codes/abridgd,McCal-Codes/another-private-repo --dry-run
 *
 * Env vars:
 *   GITHUB_PRIVATE_REPO_TOKEN  (preferred)
 *   GITHUB_TOKEN               (fallback)
 *   PRIVATE_REPO_TARGETS       (comma-separated owner/repo values)
 *   PRIVATE_REPO_OWNER         (default owner for repo-only values)
 *   PRIVATE_REPO_METADATA_OUT  (default output file path)
 */

const fs = require('fs').promises;
const path = require('path');

const DEFAULT_OWNER = process.env.PRIVATE_REPO_OWNER || 'McCal-Codes';
const DEFAULT_TARGETS = process.env.PRIVATE_REPO_TARGETS || `${DEFAULT_OWNER}/abridgd`;
const DEFAULT_OUTPUT = process.env.PRIVATE_REPO_METADATA_OUT || 'src/data/private-repo-metadata.json';

function parseArgs(argv) {
  const args = {
    repos: '',
    out: DEFAULT_OUTPUT,
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--repos' && argv[i + 1]) {
      args.repos = argv[i + 1];
      i += 1;
    } else if (token === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (token === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
}

function normalizeTargets(rawList, fallbackOwner) {
  return String(rawList || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.includes('/')) {
        const [owner, repo] = item.split('/');
        return {
          owner: String(owner || '').trim(),
          repo: String(repo || '').trim()
        };
      }

      return {
        owner: fallbackOwner,
        repo: item
      };
    })
    .filter((target) => target.owner && target.repo);
}

function buildHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'mccal-private-repo-metadata-exporter'
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers, cache: 'no-store' });
  const bodyText = await response.text();

  let body = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = (body && (body.message || body.error)) || bodyText || `HTTP ${response.status}`;
    const error = new Error(`GitHub API request failed (${response.status}): ${message}`);
    error.status = response.status;
    throw error;
  }

  return body || {};
}

async function fetchRepoMetadata(target, token) {
  const headers = buildHeaders(token);
  const base = `https://api.github.com/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}`;

  const repo = await fetchJson(base, headers);
  const languages = await fetchJson(`${base}/languages`, headers).catch(() => ({}));

  const sortedLanguages = Object.entries(languages)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .map(([name]) => name);

  return {
    owner: target.owner,
    repo: target.repo,
    private: Boolean(repo.private),
    htmlUrl: repo.html_url || `https://github.com/${target.owner}/${target.repo}`,
    homepage: repo.homepage || '',
    summary: repo.description || '',
    language: repo.language || null,
    languages: sortedLanguages,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    stats: {
      stars: Number(repo.stargazers_count || 0),
      forks: Number(repo.forks_count || 0),
      openIssues: Number(repo.open_issues_count || 0),
      watchers: Number(repo.subscribers_count || repo.watchers_count || 0),
      updatedAt: repo.pushed_at || repo.updated_at || null,
      defaultBranch: repo.default_branch || 'main'
    }
  };
}

async function ensureDir(filePath) {
  const dir = path.dirname(path.resolve(filePath));
  await fs.mkdir(dir, { recursive: true });
}

async function writeOutput(filePath, payload) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = process.env.GITHUB_PRIVATE_REPO_TOKEN || process.env.GITHUB_TOKEN || '';
  const targets = normalizeTargets(args.repos || DEFAULT_TARGETS, DEFAULT_OWNER);

  if (!targets.length) {
    throw new Error('No repositories configured. Provide --repos or PRIVATE_REPO_TARGETS.');
  }

  if (!token) {
    throw new Error(
      'Missing token. Set GITHUB_PRIVATE_REPO_TOKEN (preferred) or GITHUB_TOKEN before running export-private-repo-metadata.js.'
    );
  }

  const repos = [];

  for (const target of targets) {
    console.log(`Fetching metadata: ${target.owner}/${target.repo} - export-private-repo-metadata.js:166`);
    const metadata = await fetchRepoMetadata(target, token);
    repos.push(metadata);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    generatedBy: 'scripts/utils/export-private-repo-metadata.js',
    source: {
      type: 'github-api',
      repo: 'McCal-Codes/McCals-Website'
    },
    repos
  };

  if (args.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await writeOutput(args.out, payload);
  console.log(`Wrote private metadata JSON: ${args.out} - export-private-repo-metadata.js:190`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
