## 2025-11-04
### Repository Audit & Optimization Infrastructure
- **Audit System**: Created comprehensive audit documentation in `docs/audit/` with baseline report (`REPO-AUDIT-2025-11-04.md`), automated reports for large files and npm security.
- **Repository Standards**: Added `.gitattributes` for binary handling, `CONTRIBUTING.md`, `.github/CODEOWNERS`, `.github/dependabot.yml` for weekly dependency updates.
- **CI/CD Enhancements**: 
  - New workflows: `validate-manifests.yml`, `audit-log.yml`, `large-file-check.yml` (blocks PRs with files ≥10MB), `pr-health-check.yml`, `lighthouse-ci.yml`
  - Updated `playwright-smoke.yml` and `validate-manifests.yml` with npm caching for faster CI runs
  - Fixed `copilot-instructions-guardian.yml` to use `github.rest.issues` API
- **SEO & Performance Tools**:
  - `scripts/utils/seo-audit.js` - widget SEO scanner (structured data, alt text, meta tags, ARIA)
  - `scripts/optimize-images.js` - WebP/AVIF image converter with sharp/fast-glob
  - `scripts/utils/manifest-schema.json` - JSON schema for manifest validation
  - `lighthouserc.json` - Lighthouse CI config with performance thresholds (FCP <2s, LCP <2.5s, TBT <300ms, CLS <0.1)
  - `docs/standards/seo-performance-guide.md` - comprehensive SEO/performance best practices
- **New npm Commands**: `seo:audit`, `images:optimize`, `repo:health`
- **Dependencies**: Added sharp and fast-glob as optionalDependencies; synced package-lock.json
- **Docs/Meta**: Updated `.github/copilot-instructions.md` with audit/optimization tools section and Recent updates entry

## 2025-11-03
### Workflow Validation & Portrait Portfolio Automation
- **Workflow Validation System**: Fixed corrupted `ci-validate-workflows.js` script with comprehensive validation for script references, npm ci usage, and caching best practices.
- **Portrait Portfolio Workflow**: Added `portrait-manifest.yml` for automated manifest generation on image changes in `src/images/Portfolios/Portrait/**`.
- **Repository Health Validation**: Completed full health check including smoke tests, AI preflight, large files analysis, widget validation, and workflow validation.
- **Standards Updated**: Enhanced `docs/standards/workspace-organization.md` with workflow standards and validation procedures.
- **Documentation**: Updated copilot instructions and workspace standards to reflect workflow validation patterns and cross-platform compatibility considerations.

## 2025-10-28
### Policies & Legal Widget v1.0.0 — Hotfix
- Fixed stray "-->" rendering at top by closing the initial comment block properly; no functional or visual regressions.
- Confirmed PDF download wiring via `data-terms-pdf` (with fallback), floating menu, and version badge interactions remain intact.
- Widget HTML validation: PASS.

## 2025-10-10
### Nature Manifest Generator v2.0
- Major upgrade: Now scans all animal types under Wildlife (not just Birds) and auto-generates per-species manifest.json files tagged with the animal type.
- Aggregates all animal and landscape/location collections into nature-manifest.json for portfolio widgets.
- Documentation updated in scripts/manifest/README.md to reflect multi-animal support and workflow.
- Fully tested: Adding new animal types/species auto-populates manifests and tags correctly.

# 2025-10-09
### Image Compressor App v1.6.0
- Major efficiency and robustness improvements:
  - Parallel image compression for faster batch processing.
  - Skips existing files and images already smaller than the target size, with clear error/skipped reporting in the UI.
  - Input and file type validation before processing; invalid files are rejected with user feedback.
  - Progress bar and output folder display for improved user feedback.
  - Error summary panel shows skipped, failed, and manifest validation errors after each run.
  - Manifest.json is validated after writing; errors are reported in the UI.
  - Output folder and filenames are sanitized for cross-platform safety.
  - User settings (format, quality, last used folder, etc.) are persisted and reloaded automatically.
- All changes follow widget and workspace standards for seamless integration and reliability.


## 2025-10-09
- Added npm script `welcome` to run the dashboard (`node scripts/welcome.js`).
- Enhanced TODO auto-checker: now supports keyword and file-diff based heuristics for marking checklist items as done (see `scripts/welcome.js`).
- Documented the new system in `docs/standards/widget-standards.md` and main `README.md`.
- Added pinning tip to `updates/welcome.md` for persistent dashboard visibility in VS Code.
# Changelog

## 2025-10-09
### Journalism Portfolio Widget v5.1 (Work in Progress)
- Extracted all widget JavaScript to an external file (`journalism-widget-v5.1.js`) for CSP/DOMPurify compatibility and Squarespace embedding.
- Updated widget HTML to reference the external JS file via `<script src="...">` (user must update to public URL for production).
- Documented the CSP/DOMPurify issue and provided migration steps for external JS hosting.
- Widget remains marked as **Work in Progress**: lightbox and event listeners require verification in production Squarespace/CSP environments.

### Journalism Portfolio Widget v5.2 — 2025-10-09
- UI: Glass-like filter buttons with subtle outline and backdrop blur for better separation from page backgrounds.
- Behavior: Randomized selection using Fisher–Yates; widget now displays one main shuffled image per album (no duplicates) and reshuffles on each load. Added an adjacency minimizer and constrained shuffle to avoid same-folder clustering.
- Data & organization: Events that live in an `Events` folder (and items matching "rooney") are excluded from this Photojournalism feed so they belong to the Event portfolio instead.
- Filters: Removed per-category filters — the widget now exposes only "All" and "Published" filters to simplify navigation.
- Theming: Published accent switched to a muted green (`--published: #5fb189`) with a stronger hover variant (`--published-strong: #3f8f6d`).
- Config: Honor the root `data-panes` attribute (clamped between 4 and 48) to control how many cards are shown.
- Content: Subheading updated to note the portfolio currently contains political work only; more journalism will be added over time.
- Files: Changes applied to `src/widgets/photojournalism-portfolio/versions/v5.2-performance-optimized.html` and validated with the workspace HTML validator.

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
- 2025-10-24: AI session — Successfully implemented podcast widget v1.9.5 with auto-hydrating RSS episodes. Added Ep 9 fallback data, live RSS caching, and updated show branding. Created test page that works properly. Widget now auto-populates new episodes without manual updates.
- 2025-10-24: AI session — Successfully created Portrait Portfolio v1.0 widget - portrait photography showcase with vertical composition focus, 3:4 aspect ratios, enhanced detail viewing, performance optimizations, and SEO features. Added to available widgets list and created sample manifest.
- 2025-11-03: AI session — Completed workflow validation system and portrait portfolio automation. Added comprehensive health checks and updated standards documentation.
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
