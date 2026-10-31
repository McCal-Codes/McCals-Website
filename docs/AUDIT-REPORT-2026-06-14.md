# McCals-Website — Repository Audit & Remediation Plan

**Date:** 2026-06-14
**Scope (by request):** Code quality & architecture · Performance & SEO · Tooling, CI & docs
**Branch audited:** `codex/sentry-observability`
**Method:** Static review of configs, source, CI workflows, git metadata, and docs. No code was changed.

---

## Executive summary

This is a mature, well-disciplined codebase. TypeScript is in full `strict` mode, the React/Vite app uses lazy routes, error boundaries, Sentry, and a config-driven router; `vercel.json` ships a comprehensive security-header + caching + image-optimization setup; SEO fundamentals (OG/Twitter/JSON-LD/canonical/sitemap/robots) are strong; CI gates PRs on build, lint, typecheck, and Vitest; Dependabot and CodeQL are enabled. A grep of the entire app source surfaced only **8** instances of `any` / `console` / `TODO` / `@ts-ignore` combined — unusually clean.

The biggest problems are **not in the application code** — they are in **repository health and operational hygiene**:

1. **The git repository is ~3.3 GB** because ~3,795 portfolio images are tracked in history. This is the single highest-impact issue.
2. **The working copy lives on Google Drive**, which has forced fragile build-time workarounds (locked-folder skipping, copy timeouts, long-path fixes).
3. **Configuration and documentation drift** — a dead legacy ESLint config, ~27 live GitHub workflows, root-level audit-report clutter, and a planning doc describing an architecture the project no longer uses.

The plan at the end sequences fixes into four phases, quick wins first.

### Severity counts

| Severity | Count |
|---|---|
| High | 2 |
| Medium | 7 |
| Low | 4 |
| Strengths to preserve | (see final section) |

---

## Findings

Each finding lists **Severity**, **Effort** (XS < 1h, S = half-day, M = 1–3 days, L = multi-day), **Evidence**, and **Recommendation**.

---

### H1 — Git history bloat: ~3.3 GB pack, ~3,795 images tracked
**Severity: High · Effort: L**

**Evidence**
- `git count-objects -vH` → `size-pack: 3.27 GiB`, 43,825 packed objects.
- `git ls-files` → 5,254 tracked files, of which **3,795 are images** under `src/images/Portfolios/...` (single event folders hold 130–214 JPGs each).
- A leftover `.git-rewrite/` directory and `fix-long-paths.ps1` indicate a history-rewrite was attempted and not completed.
- The infrastructure to move off git already exists: `docs/cdn-migration-plan.md`, `scripts/migrate-to-r2.js`, and `vercel.json` already references a `cdn.jsdelivr.net/gh/...` remote image pattern.

**Why it matters:** every clone/fetch transfers gigabytes; CI checkouts are slow; the repo is painful to mirror or fork; Google Drive sync (see H2) struggles with the volume.

**Recommendation**
1. Stop adding image binaries to git. Add `src/images/Portfolios/**` (or the binary extensions) to `.gitignore` once a CDN is the source of truth.
2. Finish the planned migration to R2/CDN (`scripts/migrate-to-r2.js`) so the app loads portfolio images from the CDN, not the repo.
3. Purge image blobs from history with `git filter-repo` (preferred) or BFG, then force-push and have all collaborators re-clone. Coordinate timing — this rewrites SHAs.
4. Delete the stale `.git-rewrite/` directory.
5. After rewrite, run `git gc --aggressive --prune=now`.

---

### H2 — Working repository hosted on Google Drive (cloud-sync) forces fragile build hacks
**Severity: High · Effort: M (process change)**

**Evidence**
- Repo path is under `…/CloudStorage/GoogleDrive-…/My Drive/…`.
- `vite.config.ts` contains a bespoke `copyPublicSkipDeadFolder()` plugin that skips a folder named `one-nation-divided` and any `*.drive-stuck` files, and uses `PUBLIC_COPY_TIMEOUT_MS` with `/bin/cp` because the normal copy "can be stuck with EPERM on some Windows / exFAT drives."
- `fix-long-paths.ps1` at the repo root exists to work around Windows path-length limits.
- During this audit, several files reported `Resource deadlock avoided` / appeared as 0-byte stubs because they were cloud-only placeholders.

**Why it matters:** cloud-sync daemons lock files mid-build, produce phantom/partial files, and corrupt `.git` (which is also why H1 is so painful). The build has accreted code purely to survive this environment.

**Recommendation**
- Move the working clone to a **plain local path** (e.g. `~/dev/McCals-Website`) and use the git remote (GitHub) for backup/sync instead of Drive. Keep Drive for deliverables only.
- Once off Drive, the `copyPublicSkipDeadFolder` workaround and `fix-long-paths.ps1` can be retired, simplifying the build. (Keep them until the migration is verified on all dev machines.)

---

### M1 — Dead/duplicate ESLint configuration at repo root
**Severity: Medium · Effort: XS**

**Evidence**
- Root has **both** `.eslintrc.json` (legacy eslintrc format) and `eslint.config.mjs` (flat config). With ESLint 9/10's flat config, `.eslintrc.json` is **silently ignored**.
- The two define different rules (e.g. legacy uses `plugin:prettier/recommended`; flat config does not), so the legacy file misleads contributors about what actually runs.

**Recommendation:** delete `.eslintrc.json`. If Prettier-as-lint is wanted at the root, port it into `eslint.config.mjs`. Note the root flat config only lints `.js/.mjs/.cjs` — confirm that's intended (TS lives in `sites/*`, which have their own configs).

---

### M2 — GitHub Actions workflow sprawl (~27 active workflows + an archive)
**Severity: Medium · Effort: M**

**Evidence**
- `.github/workflows/` contains ~27 active `.yml` files plus an `archive/` of 6 more. Many are scheduled jobs (manifests, SEO auto-update, OG-image optimization, duplicates report, AI preflight, nightly smoke, workflow-health-check).
- There is meaningful overlap and duplicated checkout/setup boilerplate across files (only manifests use a `reusable-manifest.yml`).

**Why it matters:** high cron volume = ongoing Actions minutes and notification noise; many small workflows are hard to reason about and keep individually green.

**Recommendation**
- Inventory each workflow's purpose/owner in `.github/WORKFLOWS.md` (file exists — verify it's current).
- Consolidate related scheduled jobs and extract shared setup into composite actions or reusable workflows (as already done for manifests).
- Retire anything in `archive/` that is truly dead rather than keeping it in-tree.

---

### M3 — No npm workspaces across 5 packages; React version split
**Severity: Medium · Effort: M**

**Evidence**
- Five independent `package.json` + five `package-lock.json` files: root, `sites/mcc-cal-vite`, `sites/mcc-cal-admin`, `mcp`, `tools/image-compress`. Root `package.json` has no `workspaces` field.
- Root declares `react@^18.3.1` while `sites/mcc-cal-vite` uses `react@^19.0.0`.

**Why it matters:** dependencies must be installed/updated per package; Dependabot must track five manifests; the React 18-vs-19 split is confusing (root React appears unused by the app and is a stale maintenance liability).

**Recommendation**
- Adopt npm workspaces (root `"workspaces": ["sites/*", "mcp", "tools/*"]`) for a single install and dedup, **or** explicitly document that these are intentionally separate packages and why.
- Remove `react`/`react-dom`/`@types/react*` from the root `package.json` if the root only runs Node tooling/scripts (verify nothing at root imports React).

---

### M4 — Test files are excluded from the typecheck
**Severity: Medium · Effort: S**

**Evidence**
- `sites/mcc-cal-vite/tsconfig.app.json` excludes `src/**/*.test.ts(x)` and `src/test/**`. The build's typecheck (`tsc -b`) therefore never type-checks the 17 Vitest test files.

**Why it matters:** test code can drift out of type-safety; refactors that break test types won't be caught until the test runs (and only if that path is exercised).

**Recommendation:** add a `tsconfig.test.json` (or a project reference) that includes the test files and the testing-library types, and run it as part of `tsc -b` / a CI typecheck step.

---

### M5 — No coverage thresholds enforced
**Severity: Medium · Effort: S**

**Evidence**
- `vitest.config.ts` configures the v8 coverage provider and reporters but sets **no `thresholds`**. The CI `unit-tests` job runs `test:run` (no coverage). 17 unit test files exist for a large app surface.

**Recommendation:** add modest `coverage.thresholds` (e.g. start at current levels and ratchet up), add a `test:coverage` script, and optionally surface coverage as a non-blocking CI artifact before making it a gate.

---

### M6 — Root-level audit/report clutter
**Severity: Medium · Effort: XS**

**Evidence** — root contains `AUDIT-REPORT-2026-04-05.md`, `COMPREHENSIVE-AUDIT-REPORT-2026-04-09.md`, `REMEDIATION-PLAN-2026-04-09.md`, `IMPROVEMENTS-SUMMARY.md` alongside the standard project docs.

**Recommendation:** move point-in-time reports to `docs/archive/` (this report is already placed in `docs/`). Keep the root limited to README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, CHANGELOG, LICENSE, AGENTS.

---

### M7 — Planning docs describe an architecture the project no longer uses
**Severity: Medium · Effort: S**

**Evidence** — `docs/repo-improvement-plan.md` repeatedly references `src/widgets/`, `_shared/site-widgets.css`, and a "widget version policy," but the active product is the Vite/React app in `sites/mcc-cal-vite`. The root flat-config also still ignores `src/widgets/**/versions/**`.

**Recommendation:** reconcile docs with the current Vite architecture; archive widget-era guidance. Stale plans erode trust in all docs and mislead new contributors/agents.

---

### L1 — Missing resource hints (preconnect / preload) in `index.html`
**Severity: Low · Effort: S**

**Evidence** — `index.html` has excellent meta/SEO but no `<link rel="preconnect">`/`dns-prefetch` for the image CDN (`cdn.jsdelivr.net`), Sentry, or Vercel insights, and no `preload` of the LCP hero image or `woff2` fonts (`src/styles/fonts.css` exists). `docs/repo-improvement-plan.md` lists this quick win as not done.

**Recommendation:** add `preconnect` for the CDN/analytics origins and `preload` the above-the-fold hero image + primary font. Measure LCP before/after with the existing Lighthouse setup.

---

### L2 — Minimal manual chunking; verify vendor split
**Severity: Low · Effort: S**

**Evidence** — `vite.config.ts` `manualChunks` only splits `react-router-dom` and `@tanstack/react-query`. Sentry (`@sentry/react`) and other large deps fall into the main/vendor chunk.

**Recommendation:** run the existing `ANALYZE=true` visualizer, and if Sentry or other libs are large, give them their own chunk or lazy-init Sentry. Don't over-split — validate with the bundle report first.

---

### L3 — CSP relies on `'unsafe-inline'` for scripts and styles
**Severity: Low · Effort: M**

**Evidence** — the `vercel.json` CSP includes `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'`. This is driven by the inline theme-bootstrap script in `index.html` and inline styles. (Security was not a top priority for this pass; noted for completeness.)

**Recommendation:** move toward nonce/hash-based CSP for the inline theme script and audit inline styles, so `'unsafe-inline'` can eventually be dropped from `script-src`.

---

### L4 — Leftover artifacts in the working tree
**Severity: Low · Effort: XS**

**Evidence** — `.git-rewrite/` (aborted history rewrite, see H1), plus the existence of `*.drive-stuck` handling implies such files appear in the tree. Confirm none are tracked.

**Recommendation:** remove `.git-rewrite/`; verify `.gitignore` covers `*.drive-stuck`, `.DS_Store` (none tracked — good), and any other sync detritus.

---

## Strengths to preserve

These are doing the right thing and should not be regressed:

- **TypeScript** in full `strict` with `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`.
- **Very clean source** — only 8 combined `any`/`console`/`TODO`/`@ts-ignore` across the app.
- **App architecture** — config-driven router, lazy-loaded routes, `ErrorBoundary` + `Suspense`, dev-only routes gated behind `import.meta.env.DEV`, Sentry router instrumentation.
- **`vercel.json`** — thorough security headers (CSP, HSTS preload, Permissions-Policy, COOP, frame/MIME protections), tiered cache-control, and a full responsive image pipeline (AVIF/WebP).
- **SEO** — complete OG/Twitter cards, canonical, JSON-LD Organization, adaptive favicons, flash-free theming, generated per-route meta, sitemap/robots/webmanifest present.
- **CI gates on PRs** — `vercel-deployment-checks.yml` runs build + ESLint + `tsc -b` + Vitest with an aggregate status; CodeQL, security scans, and an axe (Firefox) a11y job exist; **Dependabot is configured**.

---

## Phased remediation plan

### Phase 0 — Quick wins (≤ 1 day total)
- Delete `.eslintrc.json` (M1) and `.git-rewrite/` (L4).
- Move the four root audit/plan reports into `docs/archive/` (M6).
- Add `preconnect`/`preload` resource hints to `index.html` (L1).
- Add Vitest `coverage.thresholds` + a `test:coverage` script (M5).

### Phase 1 — Repository health (highest impact)
- Execute the CDN/R2 image migration and stop tracking image binaries (H1, steps 1–2).
- Rewrite history to purge image blobs; force-push; everyone re-clones; `git gc` (H1, steps 3–5).
- Move the working repo off Google Drive to a local path (H2).

### Phase 2 — Build & config simplification (after Phase 1 verified)
- Retire `copyPublicSkipDeadFolder` workaround and `fix-long-paths.ps1` once off Drive (H2).
- Adopt npm workspaces or document the multi-package structure; remove unused root React deps (M3).
- Add test typecheck project (M4).

### Phase 3 — Operational hygiene
- Inventory, consolidate, and document GitHub workflows; extract shared setup (M2).
- Reconcile `docs/repo-improvement-plan.md` and other widget-era docs with the current Vite architecture (M7).

### Phase 4 — Hardening (optional / lower priority)
- Bundle analysis and any vendor-chunk refinements (L2).
- Move to nonce/hash-based CSP to drop `'unsafe-inline'` from `script-src` (L3).

---

*Generated for Caleb (McCal Media). No source files were modified during this audit.*
