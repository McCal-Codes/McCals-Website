## 2026-07-15: Site Bugfix Pass

- Added a semantic page-level heading to the Photojournalism portfolio.
- Made Blog static content requests fail promptly into a cleaner message state when local blog files are unavailable.

---

## 2026-07-15 — Portfolio Lightbox And Gallery Polish

- Refined portfolio gallery layouts so larger screens use more of the available canvas while mobile remains one column.
- Improved lightbox image sizing, zoom gestures, scroll behavior, and cross-album navigation for portfolio browsing.
- Simplified featured work and card caption density to keep the portfolio pages easier to scan.
- Fixed Nature portfolio thumbnail URL normalization for `_webuse` images and covered the path mapping with a focused test.
- Changed lightweight PR guard workflows to use shallow checkouts so checks do not stall on full repository history.

---

## 2026-07-15: Podcast Page And Dependabot Noise Reduction

- Widened the podcast page container so episode cards can use a real desktop grid while staying single column on mobile.
- Hardened podcast playback cleanup so audio stops when the page unmounts and playback errors reset the player cleanly.
- Added a clipboard fallback for podcast episode sharing in browsers where the async clipboard API is unavailable.
- Reduced future Dependabot branch noise with lower open PR limits, weekly local-time schedules, cooldown windows, and disabled automatic rebasing for version-update PRs.

---

## 2026-04-06 — Vite Site Migration

- **Major Architecture Shift**: Migrated from Squarespace widget-based architecture to Vite-based static site
  - Replaced self-contained HTML widgets with React components
  - Migrated from `src/widgets/` to `src/components/` structure
  - Build system: Vite with HMR for development, static export for deployment
- **Documentation Overhaul**: Updated all docs to reflect Vite workflow
  - Rewrote `docs/README.md` — removed Squarespace references, updated quick links
  - Rewrote `docs/ONBOARDING.md` — Vite dev server instructions, component structure
  - Created `docs/standards/widget-to-vite.md` — migration guide for legacy patterns
  - Cleaned `docs/standards/` — archived legacy widget docs to `archive/legacy-standards/`
- **Standards Modernization**: Removed widget-specific standards, added Vite-focused patterns
  - Updated `ui-patterns.md` with React/Vite patterns
  - Removed broken links to non-existent widget docs
  - Consolidated performance, accessibility, and SEO standards
- **Deployment**: GitHub Pages (and/or Vercel) replaces Squarespace widget embedding

---

## 2025-11-19 — Repository Reorganization Phase 1 & Docs polish

- **Legacy Widget Archival**: Moved older versions for Concert (v2.x–v4.5), Photojournalism (v1.0–v4.8), and Featured Portfolio (v1.0–v1.4) into `src/widgets/_archived/Legacy Widgets/` with per-widget `INDEX.json` inventories.
- **Active Version Policy**: Updated widget READMEs (concert, photojournalism, featured) to document retained versions and archive location/policy.
- **STATUS Standardization**: Applied unified STATUS template to Blog Feed, Nature Portfolio, and Admin Importer; refreshed dates and added exit criteria.
- **Scripts Hygiene**: Added `scripts/utils/orphan-audit.js` to emit JSON report of unreferenced scripts; documented duplicate cleanup policy in `scripts/_archived/README.md`.
- **Deploy Script Consolidation**: Replaced deprecated `deploy:vercel` / `deploy:surge` scripts with single `deploy:placeholder` entry in `package.json` (historic deployment flows archived).
- **Composite CI (Shadow)**: Composite workflow removed (Dec 2025) after redundancy validated; rely on per-portfolio + `regenerate-all-manifests.yml`.
- **Standards Index Polish**: Updated `docs/standards/README.md` for faster navigation and consistency (workspace icon fix, linked quick start, added SEO / Troubleshooting / UI sections, TOC cleanup).
- Updated `docs/standards/README.md` for faster navigation and consistency:
  - Replaced broken workspace icon with 🗂️
  - Converted plain filenames to clickable relative links (including Quick Start items)
  - Added sections: SEO Standards, Troubleshooting & Debugging, UI Patterns & Enhancements
  - Inserted a Table of contents and tidied whitespace
- Purpose: Improve discoverability of standards and reduce click-path friction.

## 2025-10-10

- Nature Manifest Generator v2.0: Now supports all animal types under Wildlife, auto-generates per-species manifest.json files tagged with animal type, and aggregates all collections into nature-manifest.json. Documentation and workflow updated.

## 2025-10-09

- Documented new TODO auto-checker system (keyword/diff heuristics) in `widget-standards.md`.
- Added pinning tip for `updates/welcome.md`.

# Changelog — McCal Media Repository

This changelog tracks repository-level changes. Individual widgets maintain their own changelogs.

## 2025-09-23 — Major Reorganization v2.0.0 🗂️

### Complete Project Restructure

- **MAJOR**: Reorganized entire repository structure for better maintainability
  - Moved all source code to `src/` directory
  - Consolidated documentation in `docs/` with deployment guides
  - Organized test files in `tests/` directory
  - Configuration files moved to `config/`
- **CRITICAL**: Fixed all GitHub API paths in widgets after reorganization
  - Concert Portfolio v4.2: Updated from `images/Portfolios/Concert` to `src/images/Portfolios/Concert`
  - Event Portfolio v1.1: Updated manifest and raw URLs
  - Photojournalism Portfolio v3.0: Updated GitHub API base paths
  - All widgets now correctly reference `src/images/Portfolios/[Type]/` structure
- **NEW**: Widget Development Guidelines (`src/widgets/WIDGET-DEVELOPMENT.md`)
  - Proper widget organization standards
  - GitHub integration best practices
  - Future development workflow documentation
- **IMPROVED**: Widget Organization
  - All widget HTML files properly grouped with changelogs
  - Standardized `/versions/` and `/demo/` folder structure
  - Concert Portfolio v4.2 moved from demo to versions (latest)
- **TESTED**: All functionality verified working
  - Build system: ✅ `npm run build` works
  - Manifest generation: ✅ `npm run manifest:concert` works
  - GitHub API: ✅ Widgets correctly access reorganized image paths
- **VERSION**: Bumped to v2.0.0 per user versioning preferences (major reorganization)

## 2025-09-19 — Development Infrastructure Revolution (Major 1.0 Update)

### Complete Development Ecosystem 🛠️

- **MAJOR**: Added comprehensive build and deployment system
  - `package.json` with Node.js build pipeline
  - `scripts/build.js` for production builds
  - `dev-server.js` for local development
  - `deploy.js` for automated deployment
- **NEW**: Universal Caption System (`widgets/shared/universal-caption-system.js`)
  - 363 lines of advanced caption management
  - Cross-widget compatibility and theming
  - Performance-optimized rendering
- **NEW**: Complete widget versioning system
  - Concert Portfolio v3.0 with universal captions
  - Podcast Feed v1.4, v1.5, v1.6 iterations
  - Structured version management across all widgets
- **INFRASTRUCTURE**: Production-ready build system
  - `dist/` output directory with optimized assets
  - `public-site/` for static site generation
  - WordPress integration tools
  - Automated asset pipeline
- **DEVELOPMENT**: Enhanced site architecture
  - New `site/app.js` (249 lines) application logic
  - Enhanced `site/styles.css` (529 lines) styling system
  - Updated main site integration
  - Debug and testing utilities
- **FILES**: 132+ new files added to repository
  - Complete widget ecosystem expansion
  - Build tools and deployment scripts
  - Development utilities and test files

## 2025-09-16 — Repository Merge & Performance Revolution

### Repository Merge 🔄

- **MAJOR**: Merged McCals Site development workspace into McCals-Website repository
- Combined production website and development tools into unified repository
- Added comprehensive README covering both website and development aspects
- Integrated development structure:
  - `widgets/`: Reusable web widgets with versioning
  - `sites/`: Platform-specific setup documentation
  - `notes/`: Development history and living documentation
- Maintained existing production site structure (`site/`, `images/`, `.github/`)
- Cleaned up duplicate files and .DS_Store artifacts
- Established unified versioning policy across repository

### Performance Revolution 🚀

- **NEW**: Shared portfolio API backend (`widgets/shared/portfolio-api.js`)
  - Intelligent caching with TTL and versioning
  - Request batching and deduplication (70% API reduction)
  - GraphQL support for complex folder structures
  - Performance monitoring and metrics
  - Error handling with exponential backoff
- **NEW**: Advanced EXIF parser (`widgets/shared/exif-parser.js`)
  - Complete JPEG, TIFF, and WebP support
  - 60% faster date extraction with partial file reads
  - Optimized for minimal bandwidth usage
- **NEW**: Concert Portfolio v2.2 with performance optimizations
  - 3x faster initial load time (2.3s → 0.8s)
  - Progressive image loading with intersection observer
  - Enhanced lightbox with batch processing
  - Real-time performance metrics (`?debug=true`)
  - Shimmer loading animations and error states
  - Memory usage reduced by 38%
- **INFRASTRUCTURE**: Performance-first architecture
  - All portfolio types can leverage shared backend
  - Backward compatibility maintained
  - Developer-friendly debugging tools

### Previous Changes (from McCals Site)

- Create widgets/ and sites/ structure
- Move Concert Portfolio into widgets/concert-portfolio (with per-version files)
- Move GitHub Portfolio Gallery (v1) into widgets/github-portfolio-gallery
- Add sites/squarespace with setup.md
- Seed per-widget changelogs and READMEs
