# Scripts organization & suggested reorg

This file documents the current layout of `scripts/`, findings from an automated scan, and recommended next steps for a low-risk reorganization.

Canonical folders (current)

- `scripts/manifest/` - manifest generators (canonical)
- `scripts/watchers/` - file watchers (chokidar-based)
- `scripts/utils/` - small utilities used by CI/local workflows
- `scripts/admin/` - interactive admin helpers (now home to `setup-repo.js` and `welcome.js`, with thin wrappers left in the root for backward compatibility)
- `scripts/_archived/` - archived legacy scripts

Suggested new group folders (placeholders only — no files were moved):

- `scripts/cli/` - small CLI entrypoints intended to be run directly
- `scripts/maintenance/` - background maintenance utilities, cleanup tasks
- `scripts/tools/` - helper tools used by other scripts

Unreferenced script files (detected by `node scripts/utils/find-unreferenced-scripts.js`)
(these may be safe to archive or review; they are not referenced by package.json scripts or workflows):

- scripts/deploy.js
- scripts/utils/add-shebangs-and-chmod.js
- scripts/utils/cleanup-manifests.js
- scripts/utils/find-unreferenced-scripts.js
- scripts/utils/logo-downloader.js
- scripts/utils/refresh-concerts.js

Archived 2025-12-06 (Phase 2 cleanup), later deleted 2026-08-26 as confirmed-dead duplicates/superseded files:

- scripts/utils/date-overrides.js and scripts/utils/shared-date-parsing.js were archived as duplicates, but active copies under scripts/utils/ (required by the manifest generators) were never actually removed — only the stray `_archived/` duplicates existed to delete.
- scripts/utils/find-latest-widget-versions.js → deleted (operated on the now-removed src/widgets/ directory)
- scripts/watchers/auto-manifest-updater.js → deleted (replaced by watch-auto-manifest.js)
- scripts/utils/auto-check-todo.js was archived here too, but it was still `require()`'d by scripts/utils/ai-finalize-session.js — archiving it had silently broken `npm run ai:finalize`. Restored to scripts/utils/ 2026-08-26.

Recently archived (2025-11-03):

- scripts/manifest/gen-manifest.js → scripts/\_archived/gen-manifest.js.archived-20251103-145720
- scripts/manifest/generate-individual-manifests.js → scripts/\_archived/generate-individual-manifests.js.archived-20251103-145720
- scripts/manifest/generate-journalism-manifest.js → scripts/\_archived/generate-journalism-manifest.js.archived-20251103-145720
- scripts/manifest/simple-concert-manifest.js → scripts/\_archived/simple-concert-manifest.js.archived-20251103-145720

Next steps (recommended, conservative)

- Review each unreferenced script manually to ensure it isn't called by an external process or used interactively.
- If a script is truly unused, move it to `scripts/_archived/` with a `.archived-YYYYMMDD-HHMMSS` suffix and add a one-line pointer to the canonical implementation.
- For frequently used CLI utilities, move to `scripts/cli/` and add an npm script that references them.

No files were moved by this automatic step. Use the archival script (`ci:archive-duplicates`) or manual git moves for any destructive changes.

Last scanned: 2025-12-06
