# Manifest migration — 2025-11-04

This document summarizes the repository changes made during the migration to a single aggregated manifest per portfolio and the Portrait widget v1.1 release. It lists the files created or edited, why they were changed, and quick revert / rerun hints.

Summary
- Goal: simplify manifest generation and consumption by producing a single aggregated manifest per portfolio type (e.g., `portrait-manifest.json`, `concert-manifest.json`) and remove per-folder `manifest.json` files that caused churn.
- Secondary: fix Portrait widget initialization, add features (client-first-name title, rotating subset selection, subject tabs), and harden structured-data injection.
- Result: generators now perform idempotent writes (skip unchanged files); a `--force` option is available; legacy per-folder manifests removed via cleanup script; CI workflows updated to use aggregated manifests; manifests validated.

Files created or significantly changed

- `src/widgets/portrait-portfolio/versions/v1.0.html`
  - Purpose: Portrait portfolio widget (released as v1.1 in repo docs).
  - Changes: Restored and hardened structured-data helper; extract client first name for titles; implement rotating subset selection (1–4 panes per session) and round-robin selection; dynamic subject tabs auto-generated from aggregated manifest collections; lightbox UX/accessibility improvements (safe-area close, hidden scrollbars, keyboard navigation); debug-panel improvements and cache key bump.
  - Revert: checkout this file from the commit tagged in the changelog or use git to restore previous version.

- `scripts/manifest/generate-portrait-manifest.js`
  - Purpose: Generate the aggregated `src/images/Portfolios/Portrait/portrait-manifest.json`.
  - Changes: Stop writing per-folder `manifest.json` files; idempotent write (compare existing JSON before writing); support `--force` to overwrite even if unchanged; improved logging for CI/developer use.
  - How to re-run: `node scripts/manifest/generate-portrait-manifest.js` or `npm run manifest:portrait` (if available). Use `--force` to force write.

- `scripts/manifest/generate-concert-manifest.js`
  - Purpose: Generate `src/images/Portfolios/Concert/concert-manifest.json`.
  - Changes: Idempotent write behavior; `--force` support; removed per-folder writes.
  - How to re-run: `node scripts/manifest/generate-concert-manifest.js` or `npm run manifest:concert`.

- `scripts/manifest/enhanced-manifest-generator.js`
  - Purpose: Enhanced generator used by concert & other portfolio scripts (EXIF parsing, filename date extraction).
  - Changes: Continue to support `--force` and `--dry` flags; updated to return manifest objects for top-level aggregation rather than writing per-folder manifest files by default.

- `scripts/manifest/remove-subfolder-manifests.js`
  - Purpose: Cleanup script to delete legacy per-folder `manifest.json` files under `src/images/Portfolios/*/`.
  - Changes: Added; executed during migration to remove per-folder manifest files. This file includes safety checks to only remove `manifest.json` files inside subfolders, not the aggregated manifests in portfolio root.
  - How to re-run: `node scripts/manifest/remove-subfolder-manifests.js` (dry-run or backup recommended). It is idempotent.

- `scripts/utils/validate-manifests.js`
  - Purpose: Validate aggregated manifests under `src/images/Portfolios/` for JSON validity and basic shape checks.
  - Changes: Added; used to verify migration success.
  - How to run: `node scripts/utils/validate-manifests.js`.

- `scripts/watchers/watch-auto-manifest.js`
  - Purpose: Local watcher that triggers manifest generation when files change.
  - Changes: Now forwards `--force` to underlying generator scripts when requested; logs executed commands to improve debugging.
  - How to run: `npm run watch:auto-manifest`.

- `.github/workflows/*.yml` (multiple)
  - Purpose: CI jobs that generate and validate manifests and commit aggregated manifest changes.
  - Changes: Removed steps that staged or added per-folder `manifest.json` files; updated comments and guidance to reflect the single-portfolio manifest policy; retained backup/rollback/validation logic for aggregated manifests.
  - Files changed: `build-manifest.yml`, `events-manifest.yml`, `journalism-manifest.yml`, `nature-manifest.yml`, `portrait-manifest.yml`, `regenerate-all-manifests.yml`, `workflow-health-check.yml` (and other related workflows). See git history for exact diffs.

- `docs/standards/workspace-organization.md`
  - Purpose: Workspace standards and policy.
  - Changes: Added "Single-Portfolio Manifest Policy (2025-11)" guidance instructing maintainers to use aggregated manifests and pointing to the cleanup script.

- `.github/copilot-instructions.md`
  - Purpose: Agent instructions and recent updates.
  - Changes: Added an entry describing the migration, the portrait v1.1 release, idempotent generator behavior, `--force` support, and validation results.

Notes about what was removed

- Per-folder `manifest.json` files (legacy): removed across many subfolders inside `src/images/Portfolios/*/*/manifest.json` during the cleanup. The `remove-subfolder-manifests.js` script ensures only manifest files in subfolders were removed and leaves aggregated manifests in portfolio roots intact.

Validation performed during migration

- Manifest regeneration: `npm run manifest:generate` (task run) — completed successfully on 2025-11-04.
- Manifest validation: `node scripts/utils/validate-manifests.js` — verified aggregated manifests (8 files) and reported 0 errors.

Quick revert & rerun hints

- Revert a file: `git checkout -- <path/to/file>` or use the commit that changed the file.
- Re-run full manifest generation: `npm run manifest:generate`.
- Force manifest write: `node scripts/manifest/generate-portrait-manifest.js --force` (or add `--force` to watcher invocation).

Follow-ups and recommendations

- If you maintain other tooling that expects per-folder `manifest.json` files (external scripts, other repos), update them to read the aggregated manifests (e.g., `src/images/Portfolios/Portrait/portrait-manifest.json`) or add a small adapter script.
- Keep `scripts/manifest/remove-subfolder-manifests.js` available for any future cleanup operations.
- If you want, I can create a secondary script that produces a small compatibility layer that writes a per-folder manifest for tools that cannot be updated immediately (but prefer the single aggregated manifest approach long-term).

Compatibility shim (optional)

To ease a transition for external tooling that still expects per-folder `manifest.json` files, a compatibility shim script was added:

- Script: `scripts/manifest/generate-subfolder-manifests-from-aggregate.js`
  - Purpose: generate per-folder `manifest.json` files from existing aggregated manifests (one-off or on-demand).
  - Key flags:
    - `--dry` : preview what would be written without changing files.
    - `--force` : overwrite existing per-folder manifests even when identical.
    - `--include-empty` : also create manifests for collections with zero images.
  - Safety: idempotent by default (skips identical files), creates target directories if missing, and only writes files when explicitly run. Use `--dry` first to confirm the actions.

Usage examples (zsh):

```bash
# Dry-run (preview):
node scripts/manifest/generate-subfolder-manifests-from-aggregate.js --dry

# Write per-folder manifests (safe, idempotent):
node scripts/manifest/generate-subfolder-manifests-from-aggregate.js

# Force overwrite existing per-folder manifests:
node scripts/manifest/generate-subfolder-manifests-from-aggregate.js --force

# Include empty collections as well:
node scripts/manifest/generate-subfolder-manifests-from-aggregate.js --include-empty
```

Notes:
- The shim is intended as a temporary compatibility aid. Prefer updating consuming tools to read the aggregated manifest(s) long-term.
- The dry-run output reported 34 per-folder manifests that would be written in this repository state; run dry-run locally to confirm before writing.

---

If you want the full, per-file commit references included in this markdown (sha + commit message), I can append them — say “Include commit refs” and I’ll add the list.
