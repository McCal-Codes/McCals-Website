# Changelog

<!-- ...existing code... -->

## [1.6.2] - Unreleased
### Added
- Backdrop blur (with fallback) to improve text contrast while preserving background context.
- Accessibility: Escape key to close mobile menu, outside-click to close, aria-haspopup on toggle.
- Reduced motion support for users preferring less animation.
- Dev server auto-port selection (will try sequential ports if 3000 is occupied) to reduce friction when multiple sessions are open.

### Docs/Meta
- Added `.github/canvas-instructions.md` for ChatGPT Canvas usage and `.github/codex-instructions.md` for efficient VS Code agent usage under rate limits.
- Updated `copilot-instructions-guardian.yml` to enforce changelog entries when AI instructions change and to watch Canvas/Codex instruction files.
- Removed demo Event portfolio folders (Charity Gala 2024, Corporate Summit 2025, Product Launch Expo 2025) and regenerated `events-manifest.json` (now 4 real events). Cleanup documented for repository clarity.
- **Widget Standardization Complete**: Created comprehensive widget standards documentation with simplified naming:
  - `docs/standards/widget-standards.md` - Complete architecture, CSS patterns, performance guidelines, accessibility standards
  - `docs/standards/widget-reference.md` - Quick reference checklist for daily development
  - `docs/standards/README.md` - Standards directory organization and workflow guidance
  - Simplified all file names from UPPER-CASE-NAMES.md to lowercase-names.md for better organization
  - Updated main README, docs organization, and copilot instructions to reference new standards
- Created comprehensive widget enhancement framework: `docs/standards/widget-enhancements.md` documents proven optimization patterns, `docs/standards/widget-development.md` provides systematic implementation methodology for applying improvements across all widgets.
- Updated photojournalism widget documentation with enhancement pattern references and established QA standards for future widget development.

<!-- ...existing code... -->
// ...existing code...
- 2025-10-03: AI session — Validation: preflight/guardian/canvas/codex added and tasks wired
- 2025-10-03: AI session — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-05: AI session — Updated test widgets to latest versions - journalism widget updated from v3.0 to v4.9 with latest features
## 1.5.0 — 2025-09-29
- Added unified-portfolio-demo.html (master demo with ?type= and ?manifest=).
- Links to unified versions for Concert, Event, and Photojournalism.


## 1.5.1 — 2025-09-29
- Refined the unified portfolio theme to mirror the live Work section aesthetic with warm neutrals and uppercase headings.
- Updated unified widget cards to surface venue/tag metadata with graceful date fallbacks from the manifest.

## 1.5.2 — 2025-09-30
- Shifted the unified portfolio experience to a monochrome gradient palette with minimal accenting for a darker presentation.
- Moved card titles and dates into on-image overlays so each gallery mirrors the live Concert layout.

## 1.5.3 — 2025-09-30
- Rebuilt the unified portfolio layout with full-width imagery, vertical scrolling, and shuffled ordering so each view spotlights only a few shots at a time.
- Updated unified widgets to respect original asset proportions and manifest metadata without overlay cropping.
