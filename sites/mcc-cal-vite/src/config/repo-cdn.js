/**
 * Where portfolio photographs are served from, at which git ref, and whether
 * Vercel's image optimizer is allowed to fetch a given url.
 *
 * The photographs are not deployed with the site. They live in this repository
 * and are served by jsDelivr from a git ref, so the ref decides what a
 * deployment can show.
 *
 * Production reads `main`. A preview deployment reads its own commit instead,
 * because a pull request that adds photographs is otherwise reviewed against a
 * `main` that does not have them yet: the curated frames under
 * src/images/Portfolios/Selected/ returned 404 at `@main` and 200 at the branch
 * commit when checked. A commit SHA rather than a branch name, because a SHA
 * cannot come to mean different files.
 *
 * Both the browser bundle (import.meta.env) and Node build scripts
 * (process.env) call this with their own environment, so each reads the same
 * decision. Vercel exposes the variables to Vite builds as VITE_VERCEL_ENV and
 * VITE_VERCEL_GIT_COMMIT_SHA, and to build scripts without the prefix; the app
 * already relies on VITE_VERCEL_ENV.
 */

export const REPO_CDN_ORIGIN = 'https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website';

export const PRODUCTION_REF = 'main';

const COMMIT_SHA = /^[0-9a-f]{40}$/;

/**
 * The optimizer's allowlist for jsDelivr, identical to the jsDelivr
 * `remotePatterns[].pathname` in vercel.json. A test compares the two strings.
 *
 * It deliberately allows `@main` only. vercel.json is shared by preview and
 * production, so widening it to commit SHAs would let production's optimizer
 * transform an image from any commit in the history, which is a far larger
 * billable surface than the one tree on `main`. Instead a url outside this
 * pattern is simply not sent through the optimizer: previews load their branch
 * photographs straight from jsDelivr, which the CSP img-src already allows.
 */
export const OPTIMIZABLE_CDN_PATHNAME =
  '^/gh/McCal-Codes/McCals-Website@main/src/images/Portfolios/.*$';

const OPTIMIZABLE_CDN_PATHNAME_RE = new RegExp(OPTIMIZABLE_CDN_PATHNAME);

/**
 * `main` everywhere except a preview deployment that knows its commit.
 * Anything that is not a full lowercase SHA falls back to `main` rather than
 * producing a url that points nowhere.
 */
export function resolveCdnRef(env = {}) {
  const vercelEnv = env.VITE_VERCEL_ENV ?? env.VERCEL_ENV;
  const sha = env.VITE_VERCEL_GIT_COMMIT_SHA ?? env.VERCEL_GIT_COMMIT_SHA;

  if (vercelEnv === 'preview' && typeof sha === 'string' && COMMIT_SHA.test(sha)) {
    return sha;
  }
  return PRODUCTION_REF;
}

export function repoCdnBase(env = {}) {
  return `${REPO_CDN_ORIGIN}@${resolveCdnRef(env)}`;
}

/** Whether the optimizer's allowlist accepts this jsDelivr url. */
export function isOptimizableCdnUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'cdn.jsdelivr.net' && OPTIMIZABLE_CDN_PATHNAME_RE.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}
