import data from './github.json';

/**
 * Live repository facts, pulled by `scripts/sync-github.js` and committed.
 *
 * Anything measurable about a project lives here rather than in projects.ts:
 * current version, release history, languages, license, last push. The narrative
 * in projects.ts never restates these, so the two cannot drift apart.
 */

export interface GithubRelease {
  tag: string;
  name: string;
  date: string;
  prerelease: boolean;
  url: string;
}

export interface GithubLanguage {
  name: string;
  percent: number;
}

export interface GithubRepo {
  slug: string;
  owner: string;
  repo: string;
  fullName: string;
  url: string;
  private: boolean;
  description: string;
  homepage: string;
  license: string | null;
  topics: string[];
  languages: GithubLanguage[];
  createdAt: string;
  pushedAt: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  latestRelease: GithubRelease | null;
  releases: GithubRelease[];
}

interface GithubData {
  generatedBy: string;
  generatedAt: string;
  repos: GithubRepo[];
}

const github = data as GithubData;

export const GITHUB_SYNCED_AT = github.generatedAt;

export function getRepo(slug: string): GithubRepo | undefined {
  return github.repos.find((repo) => repo.slug === slug);
}

/** e.g. 'TypeScript 90% / Rust 7%'. Measured, not claimed. */
export function languageSummary(repo: GithubRepo | undefined): string | null {
  if (!repo || repo.languages.length === 0) return null;
  return repo.languages.map((l) => `${l.name} ${l.percent}%`).join(' / ');
}

/**
 * Months since the last push.
 *
 * Used to keep a written status honest: a project labelled "active" whose
 * repository has not been touched in months is the kind of claim this site
 * exists to avoid making.
 */
export function monthsSincePush(repo: GithubRepo | undefined, now = new Date()): number | null {
  if (!repo || !repo.pushedAt) return null;
  const pushed = new Date(`${repo.pushedAt}T00:00:00Z`);
  if (Number.isNaN(pushed.getTime())) return null;

  // Calendar months, not elapsed-days / 30.44. Dividing by an average month
  // undercounts: a full year comes out as eleven months, and this number is
  // rendered to the reader.
  let months =
    (now.getUTCFullYear() - pushed.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - pushed.getUTCMonth());

  // The final month has not completed until the day-of-month is reached.
  if (now.getUTCDate() < pushed.getUTCDate()) months -= 1;

  return Math.max(0, months);
}

/** '29 Jun 2026' from '2026-06-29'. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const name = months[Number(month) - 1];
  if (!name || !day || !year) return iso;
  return `${day} ${name} ${year}`;
}
