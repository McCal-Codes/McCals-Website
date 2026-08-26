# Workflows: organization & best practices

**Last updated:** 2026-08-26

This document describes the active workflows in `.github/workflows/` and the conventions that govern them.

---

## Conventions

- **Deterministic installs:** always use `npm ci --prefer-offline --no-audit --no-fund`.
- **Cache deps:** cache `~/.npm` keyed by `package-lock.json` hash; cache Playwright browsers separately.
- **Dry-runs:** prefer `--dry` flags when validating generators to avoid accidental writes.
- **Artifacts:** upload reports with `actions/upload-artifact`; don't print large blobs to logs.
- **Guard destructive steps:** commit/push/archive steps must be gated behind `workflow_dispatch` and maintainer checks.
- **Validation:** after changing workflow files, run `node scripts/utils/ci-validate-workflows.js` locally.

---

## Active workflow inventory

### Core CI (run on every PR/push to main/staging/dev)

| File | Purpose |
|---|---|
| `vercel-deployment-checks.yml` | Build · ESLint · `tsc -b` · `typecheck:test` · Vitest — the PR gate |
| `security-scans.yml` | Dependency review · Gitleaks secret scan · npm audit |
| `codeql-analysis.yml` | GitHub CodeQL (SAST) |
| `changelog-validator.yml` | Enforce CHANGELOG entry on non-exempt PRs |
| `a11y-axe-firefox.yml` | Accessibility audit (axe-core / Playwright / Firefox) |
| `validate-manifests.yml` | Validate portfolio/blog JSON manifests |
| `validate-workflows.yml` | Verify workflow script paths and `npm ci` patterns |
| `ci-scripts-smoke.yml` | Validate root script references + minimal smoke test |

### Manifests & CDN

| File | Purpose |
|---|---|
| `auto-manifests.yml` | Auto-generate manifests on `src/content/**` changes |
| `regenerate-all-manifests.yml` | Full regeneration (dispatch or `src/images/**` push) |
| `publish-manifests-cdn.yml` | Publish generated manifests to jsDelivr CDN |
| `reusable-manifest.yml` | Shared reusable workflow called by manifest jobs |
| `deploy-worker.yml` | Deploy Cloudflare Worker (manifest webhook receiver) |

### PR automation

| File | Purpose |
|---|---|
| `agent-checks.yml` | Post git-hygiene + workspace-org report as PR comment |
| `changelog-validator.yml` | (see Core CI above) |
| `copilot-instructions-guardian.yml` | Warn if Copilot instructions file is modified |
| `optimize-og-images.yml` | Optimize OG images added to `public-vite/images/og/` |
| `lint-scripts.yml` | Path-filtered ESLint on `scripts/**` changes |

### Scheduled jobs

| File | Schedule | Purpose |
|---|---|---|
| `nightly-smoke-test.yml` | Daily 04:00 UTC | Node smoke test — checks scripts and manifests load |
| `playwright-smoke.yml` | Daily 05:00 UTC | Playwright smoke test — verifies live site routes respond |
| `private-repo-metadata-sync.yml` | Weekly | Syncs metadata from private companion repo |
| `weekly-duplicates-report.yml` | Weekly | Scans for duplicate scripts; uploads report artifact |
| `workflow-health-check.yml` | Daily 12:00 UTC | Checks manifest files and generation scripts exist |
| `seo-auto-update.yml` | Push to main | Regenerates sitemap and structured-data after deploys |

### Dispatch-only (manual trigger)

| File | Purpose |
|---|---|
| `ai-preflight-daily.yml` | Run AI instructions preflight check on demand (was daily cron — disabled 2026-06-14) |
| `playwright-performance.yml` (titled "Performance Budget") | **Active, not dispatch-only** — this entry is stale. It runs on every PR touching `sites/mcc-cal-vite/**`, asserting CLS/LCP/FCP/JS/CSS/image budgets against a production build. It is not widget-related; the 2026-06-14 removal was of an actual widget-path trigger that predates this file's current form. Move to "Core CI" above if this stays a required PR gate. |
| `test-notify-manifest-webhook.yml` | Test manifest webhook notification |

---

## Notes on potential consolidation

- **`nightly-smoke-test` vs `playwright-smoke`** run an hour apart and test different things (Node script vs browser); intentionally separate.
- **`lint-scripts` vs `ci-scripts-smoke`** overlap on script validation; `lint-scripts` is path-filtered (only fires on `scripts/**` changes) while `ci-scripts-smoke` runs on all PRs and does more. Both are intentional.
- **`playwright-performance`** (see "Dispatch-only" above) is misfiled — it's actually an active `pull_request`-triggered gate on `sites/mcc-cal-vite/**`, not dispatch-only. Move it to "Core CI" once confirmed as a required check.
