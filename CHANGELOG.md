# Changelog

<!-- ...existing code... -->

## [1.6.2] - Unreleased
### Added
- Backdrop blur (with fallback) to improve text contrast while preserving background context.
- Accessibility: Escape key to close mobile menu, outside-click to close, aria-haspopup on toggle.
- Reduced motion support for users preferring less animation.

### Docs/Meta
- Added `.github/canvas-instructions.md` for ChatGPT Canvas usage and `.github/codex-instructions.md` for efficient VS Code agent usage under rate limits.
- Updated `copilot-instructions-guardian.yml` to enforce changelog entries when AI instructions change and to watch Canvas/Codex instruction files.

<!-- ...existing code... -->
// ...existing code...
- 2025-10-03: AI session — Enhanced Featured Portfolio Widget v1.5 with journalism title extraction, ultra-minimal scrollbars, improved spacing, and production deployment
- 2025-10-03: AI session — Validation: preflight/guardian/canvas/codex added and tasks wired
- 2025-10-03: AI session — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03: AI session — Session complete: minor updates.
- 2025-10-03: AI session — Featured Portfolio Widget v1.5 complete: Enhanced journalism titles, ultra-minimal scrollbars (4px, 0.15 opacity), improved masonry spacing (16px gaps), randomized cover images with Fisher-Yates shuffle, minimal gray accents (#888888), production-ready deployment with 15-item limit, scrollable lightbox, and comprehensive changelog documentation
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
