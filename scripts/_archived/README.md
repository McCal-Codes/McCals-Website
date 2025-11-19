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
