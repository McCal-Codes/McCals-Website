# Repository Improvement Plan

> **Last updated:** 2026-06-14  
> **Architecture:** Vite/React 19 SPA (`sites/mcc-cal-vite`) — the widget-era `src/widgets/` architecture described in older versions of this doc has been retired.

This plan tracks ongoing improvement work organized by priority. Historical point-in-time audit reports live in `docs/archive/`.

---

## Active priorities

### H1 — Git history bloat (~3.3 GB, ~3,795 images tracked)
Image binaries under `src/images/Portfolios/` are the single largest problem. The CDN migration infrastructure already exists (`scripts/migrate-to-r2.js`, `docs/cdn-migration-plan.md`, and `vercel.json` already references `cdn.jsdelivr.net/gh/...`).

Steps:
1. Run `scripts/migrate-to-r2.js` to push portfolio images to R2/CDN.
2. Update app to load images from CDN; smoke test.
3. Add `src/images/Portfolios/**` to `.gitignore`.
4. Purge blobs from history with `git filter-repo`; coordinate force-push; all collaborators re-clone.
5. `git gc --aggressive --prune=now` after rewrite.
6. Delete leftover `.git-rewrite/`.

### H2 — Repo on Google Drive
Move working clone to a plain local path (`~/dev/McCals-Website`). This unblocks the `copyPublicSkipDeadFolder` workaround retirement and eliminates file-locking issues that corrupt `.git`.

---

## Build & config

| Item | Status | Notes |
|---|---|---|
| Delete dead `.eslintrc.json` (legacy format silently ignored by ESLint 9+) | **Pending local run** | `rm .eslintrc.json` |
| Remove unused root `react`/`react-dom`/`@types/react*` deps | ✅ Done 2026-06-14 | Root is Node tooling; React lives in `sites/mcc-cal-vite` |
| Add `tsconfig.test.json` + `typecheck:test` script | ✅ Done 2026-06-14 | Excludes cleared so test files are typechecked |
| npm workspaces (or explicit per-package doc) | Open | Root has `"workspaces": null`; five separate package.jsons |
| Wire `typecheck:test` into CI `vercel-deployment-checks.yml` | ✅ Done 2026-06-14 | Step added to `typecheck` job |

---

## Performance & SEO

| Item | Status | Notes |
|---|---|---|
| `preconnect`/`dns-prefetch` resource hints | ✅ Done 2026-06-14 | jsDelivr + Squarespace image CDNs |
| Font `preload` in `index.html` | Open | Needs build-time hash injection; static preload would double-download |
| Bundle analysis — split Sentry chunk | Open | Run `ANALYZE=true npm run build` first |
| Move toward nonce/hash CSP (drop `unsafe-inline`) | Open | Low priority until above lands |

---

## Testing & quality

| Item | Status | Notes |
|---|---|---|
| Vitest coverage thresholds | ✅ Done 2026-06-14 | Baselines set; ratchet up after measuring |
| `test:coverage` script | ✅ Done 2026-06-14 | `npm run test:coverage` in `sites/mcc-cal-vite` |
| Wire `typecheck:test` into CI | ✅ Done 2026-06-14 | See build & config above |

---

## Docs & workflows

| Item | Status | Notes |
|---|---|---|
| Archive old root-level audit/plan reports | ✅ Done 2026-06-14 | Moved to `docs/archive/` |
| WORKFLOWS.md inventory | ✅ Done 2026-06-14 | Full inventory with purpose, trigger, and consolidation notes |
| Disable dead cron jobs | ✅ Done 2026-06-14 | `playwright-performance` auto-trigger removed (widget-era paths); `ai-preflight-daily` cron removed (dispatch-only) |
| Remove `eslint.config.mjs` ignore for `src/widgets/**/versions/**` | Open | Stale widget-era ignore path |

---

## Retired (widget-era) items

The following items referenced `src/widgets/`, `_shared/site-widgets.css`, and a widget version policy. Those concepts no longer apply — the product is the Vite/React SPA in `sites/mcc-cal-vite`.

- Widget CSS modularization / BEM naming
- Widget version policy enforcement CI guard
- Widget unit/integration harness
