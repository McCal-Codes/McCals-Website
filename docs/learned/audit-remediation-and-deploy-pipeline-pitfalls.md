# Lessons Learned: Site Audit Remediation & Deploy-Pipeline Pitfalls

**Period:** 2026-07-02 → 2026-07-07 (comprehensive site audit through PR #144 merge)
**Related:** `docs/audits/website-audit-2026-07-04.md`, PR #144, PR #157 (superseded)

Nine distinct issues were found and fixed across one audit-and-remediation cycle. Each entry
records the symptom, the actual root cause, and the guard that prevents a repeat.

---

## 1. Production canonical/OG URLs pointed at dev.mcc-cal.com (site-wide)

**Symptom:** Every prerendered route except `/` served `<link rel="canonical">` and `og:url`
pointing at `https://dev.mcc-cal.com/...` in production — wrong canonical signal to search
engines and broken social-share cards on ~21 pages.

**Root cause:** ~25 page components and the route-meta build script all read
`import.meta.env.VITE_SITE_URL` with a fallback. `VITE_SITE_URL=https://dev.mcc-cal.com` was
scoped too broadly in Vercel's environment settings, so production builds inherited the
preview value. The homepage escaped only because the meta generator skips `/`.

**Guard:** `resolveSiteUrl()` (in `generate-route-meta.js`) and the `define` block in
`vite.config.ts` now hardcode `https://mcc-cal.com` whenever `VERCEL_ENV === 'production'`,
ignoring `VITE_SITE_URL` entirely on production builds. `dev.mcc-cal.com` remains the
intentional preview/testing domain.

**Lesson:** A platform-guaranteed variable (`VERCEL_ENV`) beats a hand-scoped one for anything
environment-critical. Verify per-environment values with `curl` against the deployed HTML, not
just the dashboard.

## 2. /roadmap hard-404'd on direct load

**Symptom:** `/roadmap` — linked from the site footer — returned Vercel's platform `NOT_FOUND`
on direct load/refresh/share. Client-side navigation to it worked, which hid the bug.

**Root cause:** The route existed in `App.tsx` but not in `STATIC_PAGE_ROUTES`
(`src/config/public-routes.js`), so the build never emitted a prerendered `roadmap.html`, and
the SPA-fallback rewrite didn't cover it in production.

**Guard:** `STATIC_PAGE_ROUTES` is the single source of truth; adding the entry also required a
`pageSeoData.json` entry and the `roadmap` key in the route-component map plus the
`StaticRouteKey` type union (the typecheck caught the last two — let it).

**Lesson:** When a route list drives builds, sitemaps, and SEO, "registered in the router" is
not the same as "registered." Direct-load every nav/footer link with `curl`, not just clicks.

## 3. `npm run lint` was silently broken at the repo root

**Symptom:** Root lint exited 1 on a parse error (`import ... with { type: 'json' }`), meaning
the CI lint gate wasn't protecting anything.

**Root cause:** Not the root `eslint.config.mjs` — the *nested* `sites/mcc-cal-vite/eslint.config.mjs`
governs files under that subtree (nearest-flat-config-wins) and hardcoded `ecmaVersion: 2024`,
which can't parse import attributes. Also: ESLint's `"latest"` resolved to 2024 in the
installed version, so an explicit numeric `2025` was required.

**Lesson:** With flat config, the nearest `eslint.config.mjs` fully overrides ancestors. When a
lint fix "doesn't take," run `npx eslint --print-config <failing-file>` to see which config and
`ecmaVersion` actually applied. Also: piping lint through `tail` masks the exit code — check
`$?` unpiped.

## 4. vercel.json drift between root and app copies (found twice)

**Symptom:** `vercel-config.test.ts` parity test failing; root `vercel.json` CSP `img-src` and
`images.remotePatterns` lacked `images.mcc-cal.com` (the live R2 image host) while the
app-level copy had it. Fixed once on a branch, then reappeared during the main merge because
main's copy had drifted independently.

**Lesson:** Two copies of a security-relevant config guarantee drift; the parity test was the
only thing that kept catching it. Longer term, pick one authoritative `vercel.json` (verify via
Vercel's Root Directory setting) and delete the other. Until then, treat that test as
non-negotiable.

## 5. Google-Drive-hosted checkout crippled the toolchain

**Measured impact (same machine, same repo):**

| Task | Drive checkout | Local checkout (`~/Documents`) |
|---|---|---|
| Vitest suite | 698s | 6.9s |
| `tsc -b` + full build | ~2 hours | ~7s |
| Reliability | dropped 90 public assets from a "successful" build; corrupted `node_modules` (missing lighthouse locale files) | clean |

The Drive build's asset-dropping is especially dangerous: the build exits 0 while silently
omitting robots.txt, OG images, fonts, and PDFs (the `copy-public-skip-dead-folder` plugin
skips files Drive has locked). Production was unaffected only because Vercel builds from a
fresh GitHub clone.

**Lesson:** Never run builds/tests from a cloud-synced folder. Work in a plain local clone;
let git/GitHub be the sync mechanism. A local `npm run build` succeeding on the Drive copy
proves nothing about completeness.

**Epilogue (2026-07-11):** The first "local" replacement clone went to `~/Documents` — which
turned out to be iCloud-synced too (macOS Desktop & Documents sync was on), and with the disk
at 95% full, Optimize Mac Storage began evicting file contents (`dataless` flag on `.git`
files). Symptoms escalated from slow test runs (1,400s wall-clock) to `git commit` hanging
indefinitely on a blocked filesystem read — with `git status`/`log` still working, which made
it look like anything but the disk. Diagnosis that worked: `GIT_TRACE_PERFORMANCE=1` showed
the stall after "refresh index", then `ls -laO .git/` revealed `dataless` flags and
`brctl status` confirmed "Desktop & Documents: current=YES". On macOS, `~/Desktop` and
`~/Documents` are NOT plain local paths; use something like `~/dev` for working clones, and
watch disk pressure — eviction aggressiveness scales with it.

## 6. Vercel Production Branch was the feature branch, not main

**Symptom:** While debugging a "preview," its deployment record showed `target: production`
with the `mcc-cal.com` alias. Every push to `feature/supabase-image-storage` had been deploying
straight to the live site — there was no safe preview for that branch, and `main` was not what
production ran.

**Lesson:** Check Project Settings → Git → Production Branch before assuming push-to-branch is
safe. The PR/merge process only protects production if production actually tracks the base
branch. Now that PR #144 is merged, the Production Branch should be set back to `main` so the
normal PR flow gates production again.

## 7. Deployment Protection blocked Vercel's own image optimizer on previews

**Symptom:** Hero slideshow showed "Image unavailable" on a protected preview URL. Page HTML
loaded (SSO cookie), but every `<img>` request to `/_vercel/image?...` got a 302 to
`vercel.com/sso-api`, which an `<img>` tag cannot follow.

**Lesson:** Vercel Deployment Protection gates *all* paths, including `/_vercel/image`.
Image-optimization-dependent UI will silently break on protected previews. Either disable
protection for previews or expect this failure mode when reviewing them.

## 8. Hero srcset used a width not in the images.sizes allowlist (the real slideshow bug)

**Symptom:** After protection was disabled, the slideshow still failed intermittently —
consistently on large/high-DPI screens.

**Root cause:** `HERO_IMAGE_WIDTHS` included `2560`, but `vercel.json`'s `images.sizes`
allowlist jumps 1920 → 2048 → 3840. Vercel's optimizer rejects any non-allowlisted `w=` with a
400 (verified directly: `w=2560` → 400, `w=2048` → 200). Whenever the browser's srcset
selection picked the 2560w candidate, the image errored.

**Guard:** Changed to `2048`. Every `getResponsiveImageSrcSet()` width array must be a subset
of `images.sizes`. A small test or lint rule asserting that subset relationship would make this
class of bug impossible.

**Lesson:** An "Image unavailable" fallback rendering is a signal the request failed, not that
the source file is missing — test the actual `/_vercel/image?url=...&w=...` URL the browser
builds, at each width in the srcset.

## 9. npm dropped Linux platform binaries from the lockfile

**Symptom:** CI (Linux) failed with `Cannot find module @rollup/rollup-linux-x64-gnu` and
sharp's "Could not load the linux-x64 runtime" — after lockfiles had been regenerated on macOS.

**Root cause:** npm's long-standing optional-dependency bug
([npm/cli#4828](https://github.com/npm/cli/issues/4828)): an *incremental* `npm install` on one
platform can drop other platforms' optional binaries (`@rollup/rollup-*`, `@img/sharp-*`,
`@esbuild/*`) from the lockfile.

**Guard:** When a lockfile must be regenerated, delete both `node_modules` and
`package-lock.json` and reinstall from scratch, then verify before pushing:
`grep -c "rollup-linux-x64-gnu\|sharp-linux-x64" package-lock.json` should be non-zero.

**Lesson:** A lockfile that installs fine on your machine can still be broken for CI. The
30-second grep beats a 15-minute failed-CI round trip.

---

## Cross-cutting takeaways

- **Verify at the layer that failed.** Nearly every issue here was invisible from the layer
  above it: builds "succeeded" while dropping assets, lint "ran" under the wrong config,
  previews "worked" except for one width. `curl` the deployed artifact; print the resolved
  config; test the exact URL the browser constructs.
- **Single sources of truth, enforced by tests.** The route list, the vercel.json parity test,
  and the (proposed) srcset⊆sizes assertion all turn "remember to keep these in sync" into a
  CI failure.
- **Deployment topology is part of the code review.** Production Branch, Deployment
  Protection, and env-var scoping decided real behavior more than the diffs did.
