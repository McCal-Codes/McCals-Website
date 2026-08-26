# Archived scripts

This folder contains scripts that have been moved out of active use and are retained for historical reference.

Guidelines:

- Active scripts live under `scripts/manifest/`, `scripts/watchers/`, `scripts/utils/`, and `scripts/admin/`.
- If you find duplicate or legacy scripts at the repository root (e.g. `scripts/generate-universal-manifest.js`), they have been consolidated into the canonical locations under `scripts/manifest/`.
- To restore a script from this folder, copy it back into the appropriate active folder and update any `package.json` or workflow references.

Files archived here are intentionally left as read-only pointers and placeholders to avoid accidental usage.

## Duplicate & Timestamped Files Cleanup (2025-11-19)

Timestamp-suffixed variants (e.g., `generate-universal-manifest.js.archived-20251103-151500`) coexist with a base file. The consolidation policy retains ONLY one representative copy:

Retention rules:

- If both `name.ext` and `name.ext.archived-*` exist and neither differs materially (quick diff length check), keep `name.ext.archived-*` and delete the unsuffixed duplicate OR vice versa depending on canonical path moved to active folders.
- Scripts now superseded by versions under `scripts/manifest/` or other active subfolders are kept ONLY in their timestamped archived form.

Next maintenance window will remove redundant pairs after orphan-audit confirmation.

Last updated: 2025-11-19

## Recent Archives

- `validate-widgets.js` (archived 2026-03-05): Superseded by `scripts/utils/validate-widget-html.js` and no longer referenced by npm scripts/workflows.
- `generate-subfolder-manifests-from-aggregate.js` (archived 2026-03-05): Legacy migration helper for re-creating per-folder `manifest.json` files. Archived to align with aggregated-manifest policy and avoid reintroducing per-folder workflows.

## Deleted (no longer present, listed for history)

- `generate-cdn-snippets.js`, `date-overrides.js`, `find-latest-widget-versions.js`, `shared-date-parsing.js`, `auto-manifest-updater.js`, `deploy.js`, `generate-universal-manifest.js` — deleted 2026-08-26 as confirmed-dead duplicates/superseded files with no references anywhere in the repo.
- `auto-check-todo.js` — deleted from this folder 2026-08-26, but restored to `scripts/utils/` rather than removed: it was still `require()`'d by `scripts/utils/ai-finalize-session.js`, so archiving it had silently broken `npm run ai:finalize`.
