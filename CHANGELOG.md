
## 2025-10-09
- Added npm script `welcome` to run the dashboard (`node scripts/welcome.js`).
- Enhanced TODO auto-checker: now supports keyword and file-diff based heuristics for marking checklist items as done (see `scripts/welcome.js`).
- Documented the new system in `docs/standards/widget-standards.md` and main `README.md`.
- Added pinning tip to `updates/welcome.md` for persistent dashboard visibility in VS Code.
# Changelog

<!-- ...existing code... -->

## [1.6.2] - Unreleased
### Added
- Backdrop blur (with fallback) to improve text contrast while preserving background context.
- Accessibility: Escape key to close mobile menu, outside-click to close, aria-haspopup on toggle.
- Reduced motion support for users preferring less animation.
- Dev server auto-port selection (will try sequential ports if 3000 is occupied) to reduce friction when multiple sessions are open.

### Docs/Meta
- 2025-10-08: Updated about page widget v1.4.4 with refreshed bio reflecting Point Park alumni status, freelance photographer/photojournalist work, Globe photo editor role, client work extending into summer, and Kentucky project collaboration. Enhanced contact options with clean dropdown menu offering email and Calendly coffee chat booking. Removed non-functional blog button, updated portfolio link to /featured-work. Improved contact UX with elegant slide-down menu and proper Calendly integration.
- 2025-10-08: Updated `.github/copilot-instructions.md` with comprehensive repository organization standards, widget development workflows, performance standards documentation, and AI agent responsibilities. Added scripts folder organization rules, widget status workflow guidelines, and enhanced documentation for future maintainers.
- 2025-10-06: Created comprehensive `docs/standards/seo-starter-guide.md` - Practical Squarespace SEO playbook tailored for McCal Media, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene implementable on Squarespace platform.
- 2025-10-06: Updated `.github/copilot-instructions.md` to reference new performance standards document (`docs/standards/performance-standards.md`) and establish Concert Portfolio v4.6 as the primary performance reference implementation for all widgets. Added performance standards to good starting references with priority star rating.
- 2025-10-06: Created `docs/standards/image-seo-standards.md` documenting comprehensive SEO best practices for portfolio images including alt text, file naming, structured data, lazy loading, and accessibility standards for improved search engine optimization and user experience.
- 2025-10-06: Scripts folder organization and archival rules documented in `.github/copilot-instructions.md`. All scripts must be organized by function (manifest, watchers, utils, admin), unused scripts archived, and all changes validated and documented for future maintainers. See instructions file for details.
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
- 2025-10-06: AI session — Session complete: minor updates.
- 2025-10-06: AI session — Successfully tested and fixed VS Code tasks for Copilot AI workflow. Fixed PowerShell quoting issues in widget validation task, created proper Node.js validation script, and verified all core tasks work correctly.
- 2025-10-06: AI session — Session complete: minor updates.
- 2025-10-06: AI session — Successfully implemented SEO enhancements for concert portfolio widget v4.5 including structured data, enhanced alt text generation, and accessibility improvements. Images are now loading properly and SEO features are working.
- 2025-10-06: AI session — Fixed structured data detection issues in concert portfolio widget v4.5. Updated addBasicStructuredData function to properly calculate total images from manifest bands, generate absolute image URLs, and add comprehensive metadata. Added debug functionality to check structured data locally. Structured data now includes proper Schema.org ImageGallery markup with image URLs, author info, and SEO metadata.
- 2025-10-06: AI session — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks. Added resource hints and lazy-loaded features.
- 2025-10-06: AI session — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks.
- 2025-10-06: AI session — Fixed concert portfolio widget v4.6 image loading and layout issues. Updated CSS to use responsive column-width layout with overlay info styling, matching journalism widget patterns. Images now load properly in masonry-style grid with smooth transitions and loading animations.
- 2025-10-06: AI session — Created comprehensive SEO starter guide document tailored for McCal Media's Squarespace implementation, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene. Added to docs/standards/ and updated main README and CHANGELOG.
- 2025-10-06: AI session — Session complete: minor updates.
- 2025-10-09: AI session — Close Button Optimization and Navigation Hiding pattern implemented
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
