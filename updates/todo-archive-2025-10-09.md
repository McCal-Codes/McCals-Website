# ARCHIVE: Previous General TODOs & Optimizations (2025-10-09)

This file preserves the previous, more general-purpose TODO list for reference. Use this as a historical snapshot or for inspiration when adding new tasks. For the current actionable and standards-driven checklist, see `updates/todo.md`.

---

## Widget Development & Enhancements
- [ ] Review all widget READMEs in `src/widgets/**` for outdated instructions or missing embedding notes.
- [ ] Audit widget versioning—ensure each widget has a clear version history and CHANGELOG.
- [ ] Refactor any widget with duplicated or inconsistent lightbox/gallery code to use the latest stable pattern (see journalism v4.9, concert v4.6).
- [ ] Add or improve structured data (SEO) in all portfolio widgets (see concert v4.5+ for reference).
- [ ] Standardize alt text and accessibility features across all widgets (see docs/standards/image-seo-standards.md).
- [ ] Migrate any widget using external CSS/JS to fully inline, self-contained code for Squarespace compatibility.
- [ ] Add debug mode (`?debug=true`) and metrics reporting to all major widgets.
- [ ] Review widget configuration via data attributes—document all supported options in each widget README.
- [ ] Archive or clean up any unused or experimental widgets (move to `src/widgets/_archived/`).

## Performance & Optimization
- [ ] Audit all widgets for Lighthouse performance (see docs/standards/performance-standards.md, use concert v4.6 as reference).
- [ ] Remove unused CSS/JS from widget HTML files.
- [ ] Ensure all images in widgets use lazy loading and responsive sizing.
- [ ] Add resource hints (preload, prefetch) where appropriate in widget HTML.
- [ ] Validate all manifest generators for efficiency and error handling (see scripts/manifest/).
- [ ] Run `npm run analyze:large-files` and `npm run analyze:duplicates` to identify and address asset bloat.

## Minor Improvements & Maintenance
- [ ] Update main README.md with any new widgets, status changes, or major documentation updates.
- [ ] Review and update CHANGELOG.md for all significant changes (especially in docs/ and scripts/).  <!-- TODO: Tree tag for changelog/code-related -->
- [ ] Run `npm run ai:preflight:short` before major changes to validate workspace health.
- [ ] Validate all npm scripts and workflows after any reorganization or script changes.
- [ ] Periodically run `npm run repo:health` to check for repository issues.
- [ ] Add or update status indicators (production, WIP, archived) for all widgets in main README and per-widget STATUS.md.

## Major Changes & Refactoring
- [ ] Refactor scripts/ folder to ensure all scripts are in the correct subfolders (manifest/, watchers/, utils/, admin/, _archived/).
- [ ] Review and update all documentation in docs/standards/ for accuracy and completeness.
- [ ] Implement any missing or incomplete widget enhancement patterns (see docs/standards/widget-enhancements.md).
- [ ] Create or update comprehensive test harnesses in `src/site/` for local widget preview and debugging.
- [ ] Review and improve error resilience in all widgets (graceful degradation, fallback cards, etc.).

---

This file is for reference only. For the current actionable checklist, see `updates/todo.md`.
