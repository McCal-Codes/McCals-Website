# Changelog

## 2026-01-10

### Events Portfolio Update

- **New Content**: Added "University of Pittsburgh Winter Graduation 2024" gallery with 69 new images.
- **Optimization**: Processed 118 event images with optimization script, reducing file size by ~1GB.
- **Manifest**: Regenerated `events-manifest.json` to include new content.

### Podcast Feed Widget v2.2.2 [Optimization]

- **Link Fix**: Updated the "Let's Grab a Drink!" button to point directly to the Caffeinated Connections Calendly page (`https://calendly.com/cjmccar-mcc-cal/caffeinated_connections`).
- **Performance**: Added `loading="lazy"` to podcast episode avatars to improve initial page load performance.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.2.2-podcast-optimization.html`

### Featured Portfolio Widget v1.5.1 [LCP Optimized]

- **LCP Optimization**: Pre-rendered the primary hero card (Horseburner) in HTML to ensure immediate visibility and fix LCP metric.
- **Layout Stability**: Modified shuffle logic to prioritize and pin the LCP element to the top of the grid to prevent layout shifts (CLS) during hydration.
- **Performance**: Enforced `loading="eager"` and `fetchpriority="high"` for the hero image.
- **User Experience**: Removed the forced loading spinner, allowing the pre-rendered content to represent the initial state.
- **Files**: `src/widgets/portfolios/featured-portfolio/versions/v1.5.1-featured-optimization.html`

### Roadmap Widget v1.5.0 [Dual Timeline]

- **Dual View Toggle**: Implemented a "Life & Photography" vs "Web Development" toggle to showcase both career paths side-by-side.
- **Dynamic Content**: Header, description, and timeline milestones update dynamically based on the selected mode.
- **Life Roadmap**: populated with milestones from university, newspaper editor roles, and freelance expansion.
- **Files**: `src/widgets/_content/roadmap/versions/v1.5.0-roadmap-dual.html`

### Roadmap Widget v1.4.0 [Dynamic]

- **Live Activity**: Integrated direct GitHub API fetching to display real-time commit activity and the latest update message dynamically.
- **Visuals**: Added a "Latest Update" highlight that injects the most recent commit message into the timeline.
- **Files**: `src/widgets/_content/roadmap/versions/v1.4.0-roadmap-live.html`

### Footer Widget v1.4.0

- **Navigation**: Added a direct "Roadmap" link to the About/Connect section for easy access to the development journey.
- **Files**: `src/widgets/_navigation/site-footer/versions/v1.4.0-footer-roadmap.html`

### About Widget v2.4.2

- **Navigation**: Added "Roadmap" link pointing to the Development Roadmap in the "Documents" dropdown menu.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.4.2-about-roadmap.html`

## 2026-01-06

### Docs/Meta

- **Performance Intent (Authoritative)**: Added a new section to `.github/copilot-instructions.md` establishing a performance-first development doctrine. This prioritizing real-user experience (LCP, main-thread) on `mcc-cal.com` over synthetic metrics and mandates specific architectural rules for above-the-fold content and JS usage.

### Repository Hygiene

- **Widget Version Enforcement**: Archived excess versions for `photojournalism-portfolio` and `portrait-portfolio`. All widgets now comply with the ≤2 active versions policy (0 violations).

### Podcast Feed Widget v2.2.1

- **Bug Fix**: Restored missing `previewAudio` function that was accidentally omitted in v2.2.0, making the "Preview 15s" button functional again.
- **Enhanced Cleanup**: Added proper cleanup of preview timers and event listeners in audio control functions to prevent memory leaks and ensure smooth transitions between preview and full playback modes.
- **Cache Update**: Updated cache key to `podcast-feed-episodes-v2.2.1` for clean cache transitions.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.2.1-podcast-preview-fix.html`

### Podcast Feed Widget v2.2.0

- **Core Refactor**: Standardized the widget on a high-performance event delegation architecture.
- **"Load More" Feature**: Added a "Load More Episodes" button for paginated display of the full RSS catalog.
- **UI Refinement**: Implemented a "Read More" toggle for the podcast description with smart truncation point.
- **Aesthetic Alignment**: Neutralized play button colors to match the site's glassmorphic design.
- **Changelog Modal**: Added a clickable version indicator that triggers a detailed update modal.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.2.0-podcast-core.html`

### Podcast Feed Widget v2.1.0

- **Resilience Refinement**: Improved proxy fallback chain for RSS fetching.
- **Feature Parity**: Added "Read More" toggle, "Load More" button, and Changelog modal to match v2.2.0 functionality.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.1.0-podcast-resilience.html`

## 2025-12-31 (Continued)

### Repository Cleanup & 2026 Optimization

**Phase 1 Complete** - Streamlined repository structure for efficient 2026 work:

- **Documentation Archive**: Moved 9 Phase-2 completion documents to `docs/archive/phase-2/` (PHASE-2-\*.md, API-DEPLOYMENT-COMPLETE.md, WIDGET-HOT-RELOAD-FEATURE.md)
- **Test Organization**: Consolidated test/preview files to `tests/previews/` (preview-monochrome-nav.html, test-blog-admin.html)
- **Session Archive**: Moved historical session summaries to `docs/archive/sessions/`
- **System Cleanup**: Removed all `.DS_Store` files (9 instances) and `nohup.out` from repository
- **.gitignore Optimization**: Removed duplicate entries, added patterns for `.git-rewrite/`, `.turbo/`, `nohup.out`, and `tests/previews/*.html`
- **Root Directory**: Reduced from 39 files to 30 production-relevant files
- **Documentation**: Created comprehensive cleanup plan (`docs/2026-REPO-CLEANUP-PLAN.md`) and execution summary (`docs/2026-CLEANUP-SUMMARY.md`)
- **Validation**: All widgets pass HTML validation, repository health checks pass

**Next Steps**: Phase 2 (dependency updates) and Phase 3 (structural improvements) planned for Q1 2026.

### Repository Cleanup & 2026 Optimization - Phase 2

**Phase 2 Complete** - Updated dependencies to latest safe versions:

- **Package Updates**: Updated 7 packages (@eslint/js 9.39.2, @playwright/test 1.57.0, autoprefixer 10.4.23, express 5.2.1, jsdom 27.4.0, typescript-eslint 8.51.0, playwright 1.57.0)
- **Validation**: All widgets pass HTML validation, repository health checks pass
- **Security**: Improved security posture with latest patches (1 moderate esbuild issue deferred to Phase 3)
- **Compatibility**: No breaking changes, all updates backward compatible
- **Deferred Updates**: Major version updates (ESLint 9, React 19, Tailwind 4, esbuild 0.27) deferred to Q1 2026 for thorough testing
- **Documentation**: Created comprehensive Phase 2 summary (`docs/2026-PHASE-2-SUMMARY.md`)

**Node.js Recommendation**: Consider upgrading to Node.js 20.19+ or 22.x LTS for optimal package compatibility.

### Repository Cleanup & 2026 Optimization - Phase 3

**Phase 3 Complete** - Structural improvements and security fixes:

- **Security Fix**: Updated esbuild 0.23.1 → 0.27.2, resolving moderate CORS vulnerability (GHSA-67mh-4wv8-2f99). **0 vulnerabilities** ✅
- **Documentation Consolidation**: Merged `docs/automation/` into `docs/workflows/`, moved `scripts/agents/` to `docs/agents/` for clearer organization
- **Widget Versioning**: Scanned all widgets, confirmed compliance with ≤2 active versions policy
- **Package.json Analysis**: Analyzed 109 npm scripts, created backup, identified deprecated scripts for future removal
- **Validation**: All widgets pass HTML validation, repository health checks pass
- **Documentation**: Created comprehensive Phase 3 summary (`docs/2026-PHASE-3-SUMMARY.md`)

**Deferred to Q1 2026**: Package.json reorganization (109 scripts require careful categorization and testing)

**All 3 Phases Complete!** Repository is now fully optimized for 2026.

### Widget Monochrome & Navigation Refinements

- **Policies & Legal v1.1.1**:
  - **Full Content Restoration**: Restored the complete legal sections (License, Privacy, Cookies, Terms) and the comprehensive 7-item FAQ from the original release.
  - **Advanced Navigation**: Implemented a real-time table of contents search (discovery), reading progress bar, and estimated reading time indicator.
  - **Download Bar Expansion**: Added direct 'License PDF' and 'Print/Save' buttons alongside the original Terms PDF request.
  - **UI Refinement**: Resolved contrast issues by enforcing high-contrast white text for all interactive buttons and links.
  - **Spacing Audit**: Improved vertical rhythm and spacing throughout the document, including section margins and header breathing room for better readability.
  - **Section Precision**: Added persistent heading anchors (§) for direct linking to specific legal clauses.
  - **FAQ Accordion**: Implemented a monochrome-styled dropdown for the FAQ section using `<details>`/`<summary>`.
  - **SEO Restoration**: Restored missing FAQPage, WebPage, and BreadcrumbList structured data for better search indexing.
  - **Files**: `src/widgets/_content/policies-legal/versions/v1.1.1-policies-legal-monochrome.html`

- **Podcast Widget v2.1.0**:
  - **Brand Simplification**: Removed "2.0" from the header as requested. The title now cleanly displays "Latest Episodes".
  - **Internal Metadata**: Maintained technical versioning in the indicator for development tracking.
  - **Files**: `src/widgets/_content/podcast-feed/versions/v2.1.0-podcast-resilience.html`

- **Photojournalism v5.5.1**:
  - **Modal Visibility Fix**: Resolved 'all white' modal bug by enforcing a dark glassmorphic background and white text within the lightbox.
  - **Files**: `src/widgets/portfolios/photojournalism-portfolio/versions/v5.5.1-photojournalism-monochrome.html`

### Footer Widget v1.3.0

- **Back to Top Button**: Added circular floating button with scroll progress ring indicator that appears after 400px scroll
- **Smart Positioning**: Button automatically hides when approaching footer to prevent overlap
- **Enhanced Link Interactions**: Added animated underline effect on hover for all footer links
- **Social Icon Tooltips**: Platform names now appear on hover with smooth fade-in animation
- **Newsletter Form States**: Added loading spinner, success message with checkmark animation, and visual validation feedback
- **Version Interactivity**: Made version badge clickable (prepared for future changelog modal)
- **Dynamic Copyright**: Year range now displays "2019-2025" format when applicable
- **Improved Accessibility**: Enhanced focus states, keyboard navigation for Back to Top, and ARIA live regions for form feedback
- **Performance**: Smooth scroll behavior, optimized animations with reduced-motion support
- **Files**: `src/widgets/_navigation/site-footer/versions/v1.3.0-footer-back-to-top.html`

### About Widget v2.4.0

- **Client Carousel Update**: Added PGH Social Club and PRSSA Pittsburgh to the client carousel, bringing the total to 27 premium clients.
- **Logo Consistency**: Updated OSH360 logo to use white filter treatment instead of grayscale for visual consistency with other client logos.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.4.0-about-pgh-social-club.html`

### About Widget v2.3.0

- **Contact Link Update**: Migrated the "Grab a Coffee" link to the new endpoint: `https://calendly.com/cjmccar-mcc-cal/30min`.
- **Schema Optimization**: Updated JSON-LD structured data with the new contact URL for improved SEO and consistency.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.3.0-about-coffee-link.html`

## 2025-12-30

### Navigation Widget v2.0.0 (The Refined Lens)

- **Mimicry of v1.6.3**: Restored the classic full-width desktop bar and right-aligned mobile menu for a sophisticated asymmetrical look.
- **Focus Flow Effect**: Unique "Neighbor Dimming" interaction on desktop that subtly fades non-hovered items.
- **Micro-Refinement**: Utilized 0.5px ultra-minimal borders and cinematic ease-out transitions.
- **Native Efficiency**: Cleaned up the navigation engine for smoother performance across route changes.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v2.0.0-site-navigation.html`

### Navigation Widget v1.9.7

- **Expanded Mobile Profile**: Widened the mobile menu container to `230px`.
- **Left-Aligned Flow**: Switched all mobile navigation text and internal components to left-alignment for a cleaner reading line.
- **Improved Hierarchy**: Restored the toggle arrow to the right of the "Work" label to complement the left-aligned flow.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.7-site-navigation.html`

### Navigation Widget v1.9.6

- **Refined Mobile Profile**: Significantly narrowed the mobile menu box to `185px` for a tighter, more vertical aesthetic.
- **Micro-Scaled Typography**: Reduced mobile link sizes (Primary: `1.25rem`, Submenu: `1.05rem`) to better fit the compact layout.
- **Uniform Presence**: Implemented a solid `24px` uniform padding on all sides of the mobile navigation overlay.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.6-site-navigation.html`

### Navigation Widget v1.9.5

- **Right-Aligned Mobile Experience**: Switched the mobile menu container and internal items back to right-aligned for an asymmetric editorial feel.
- **Enhanced Typography**: Boosted mobile link sizes to `1.45rem` and submenu items to `1.15rem` for significant visual impact and readability.
- **Tightened Interaction**: Refined the placement of the "Work" toggle arrow to sit tightly against the text while maintaining flush right alignment.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.5-site-navigation.html`

### Navigation Widget v1.9.4 (Consolidated Release)

- **Minimalist Quote CTA**: Ghost-style button with refined editorial typography (Standard weight, uppercase).
- **Floating Lens Submenus**: Desktop dropdowns with vertical gaps, unified rounding, and scanable left-aligned text.
- **Centered Mobile UI**: Compact, centered "Lens" overlay (`220px` width) for a symmetrical mobile experience.
- **Visual Polish**: Advanced glassmorphism (24px blur), soft chip hover states, and tightened layout spacing.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.4-site-navigation.html`

### Quote Request Widget v1.1.0

- Upgraded to a multi-step slide transition architecture (3 steps: Contact, Details, Budget).
- Added canvas-confetti celebration upon successful submission.
- Implemented `localStorage` draft persistence to prevent data loss.
- **Files**: `src/widgets/_content/quote-request/versions/v1.1.0-quote-multistep.html`

### Quote Request Widget v1.0.0

- Created a conversion-focused "Request a Quote" form for McCal Media.
- **Features**:
  - Comprehensive service-based fields (Event, Headshots, Brand, editorial).
  - Conditional logic for event-specific details (times, attendance).
  - Detailed licensing & usage section for commercial pricing.
  - Integrated EmailJS handling (consistent with contact-form).
  - Anti-spam honeypot and monochrome responsive UI.
  - Built-in versioning and changelog modal.
- **Files**: `src/widgets/_content/quote-request/`

### About Widget v2.2.0

- Added scroll-triggered entrance logic (reveals after 400px scroll).
- Implemented periodic pulse micro-interaction for the CTA button.
- Added collision detection to hide the CTA when nearing the footer.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.2.0-about-enhanced-cta.html`

### About Widget v2.1.0

- Added a floating "Request a Quote" CTA button with a high-contrast monochrome design.
- Redirects users directly to the new quote request page for better conversion.
- Updated versioning and internal changelog.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.1.0-about-quote-cta.html`

## 2025-12-08

### Manifest Proxy & Shared Date Parsing Symlink

- **Manifest Proxy in Dev:** WidgetEmbed now rewrites manifest URLs in injected widget HTML in dev mode, so widgets load manifests from the local API endpoint (e.g., `/api/manifests/events`) instead of GitHub. This ensures widgets work locally and in CI/dev environments without manual HTML edits. See WidgetEmbed.tsx for details.
- **Shared Date Parsing Symlink:** To resolve CI and local import errors, a symlink was created: `scripts/utils/shared-date-parsing.js` → `../../src/api/scripts/utils/shared-date-parsing.js`. All manifest generators now use the canonical shared date parsing utility. If you move or update the canonical file, update the symlink accordingly. Do not edit or restore the archived copy in `scripts/_archived/`.

### Concert Manifest API Reliability & Horseburner Fix

- **Cloudflare Manifest API Mapping:** Added an explicit `MANIFEST_CONFIG` map plus a GitHub Raw fallback inside `tools/cloudflare/complete-worker.js`, guaranteeing `/api/v1/manifests/:type` resolves every portfolio even when `MANIFEST_BASE_URL` is unset. Auto-manifest workflows and Squarespace widgets now receive consistent data again.
- **Concert Manifest Generator v1.1.0:** `scripts/manifest/generate-concert-manifest.js` now imports `resolveDateOverride`, records `relativeFolderPath`, `dateSource`, `dateConfidence`, and optional notes, and emits a normalized `items[]` collection (with `src/...` paths) for easier widget consumption.
- **Concert Widget v4.7.1 Parity:** Updated `src/widgets/portfolios/concert-portfolio/versions/v4.7.1-api-optional.html` to normalize manifest entries (absolute URLs, relative paths, filenames) before building image URLs and alt text. Horseburner’s new December 2025 gallery now loads correctly through both API and GitHub fallbacks.
- **Manifest Regeneration:** Ran `npm run manifest:concert` after the generator changes (601 images / 25 bands). Local webhook notifications still expect the Cloudflare dev server but report warnings only; manifests themselves regenerate cleanly.

## 2025-11-23

### Version Standardization (x.x.0 Format)

- Concert Portfolio: 19 versions (v2.0.0 → v4.7.0)
- Photojournalism Portfolio: 12 versions (v1.0.0 → v5.2.0)
- Podcast Feed: 12 versions (v1.0.0 → v2.0.0)
- Featured Portfolio: 6 versions (v1.0.0 → v1.5.0)
- Nature, Event, Hero, Portrait, Navigation, Video: 14 versions
- `scripts/utils/standardize-versions.js`: Updates version strings in code content
- `scripts/utils/rename-widget-versions.js`: Renames version files to x.x.0 format
- Both support `--dry-run` mode for safe previewing
- `versions:standardize`: Run version content updates
- `versions:check`: Preview version content changes (dry-run)
- `versions:rename`: Run file renaming
- `versions:rename-check`: Preview file renames (dry-run)

## 2025-11-24

### SEO Automation & Workflow Enhancements

- **Enhanced SEO Scripts**: Major improvements to `scripts/seo/generate-sitemap.js` and `scripts/seo/generate-structured-data.js`:
  - Added comprehensive widget support (concert, photojournalism, event, nature, portrait, featured portfolios)
  - Implemented dynamic URL generation based on widget versions
  - Added Schema.org structured data for ImageGallery, CollectionPage, and portfolio content
  - Enhanced sitemap with widget-specific lastmod dates from git history
  - Added debugging modes and validation
- **SEO Documentation**: Created comprehensive `docs/integrations/seo-automation-guide.md` and `scripts/seo/README.md` with implementation patterns, API integration benefits, and best practices.
- **GitHub Actions Workflows**:
  - `.github/workflows/seo-auto-update.yml`: Automated sitemap and structured data generation on portfolio changes
  - `.github/workflows/publish-manifests-cdn.yml`: CDN publishing automation for portfolio manifests
- **API Integration Benefits**: Documented in `docs/integrations/api-seo-benefits.md` - explains how API-driven manifests enable dynamic SEO, automated updates, and rich structured data without manual intervention.
- **Manifest CDN Documentation**: Created `docs/manifest-cdn.md` explaining jsDelivr CDN usage for manifest distribution.
- **AI Preflight Enhancements**: Updated `scripts/utils/ai-instructions-preflight.js` with improved validation and context checks (87 additional lines).

### Docs/Meta

- 2025-12-06
  - Added changelog validator workflow to require CHANGELOG updates on PRs that touch core files (bypass via labels skip-changelog/docs-acknowledged).
  - Extended widget version policy workflow to run on pushes to main for continuous enforcement.
  - AI preflight now reports widget README coverage to highlight missing docs quickly.
  - Domain audit: confirmed only intentional `mccal.media` social/email references remain; site-root URLs standardized to `mcc-cal.com`.
  - Archived orphan scripts (auto-check-todo, date-overrides, find-latest-widget-versions, shared-date-parsing, auto-manifest-updater) to `scripts/_archived/`; updated docs to point to canonical watchers.
  - Added GitHub issue templates (bug, feature) and pull request template to standardize submissions.
  - Added widget version limit workflow, PR axe audit trigger, widget registry manifest, and dev.mcc-cal.com onboarding note; added a11y checklist to widget standards.
  - Archived `generate-cdn-snippets.js` (moved from scripts/utils/ to scripts/\_archived/; not referenced by npm scripts or code).
  - Updated .gitignore to exclude scripts/.welcome-state.json (prevents local state file from being committed).
  - Confirmed all scripts/ subfolders have up-to-date README files; no missing documentation in key folders.
- 2025-12-14
  - Corrected legacy widget archive path references across docs and Copilot instructions (`src/widgets/_archived/legacy-widget-versions/` → `src/widgets/_archived/Legacy Widgets/`).
- Updated `.github/copilot-instructions.md` Recent updates section with comprehensive version standardization entry documenting problem, solution, implementation details, key lessons learned, and future maintenance guidance.

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

## 2025-10-09 - Image Compressor

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

## 2025-10-09 - Admin Dashboard

- Added npm script `welcome` to run the dashboard (`node scripts/admin/welcome.js`, with a wrapper left at `scripts/welcome.js`).
- Enhanced TODO auto-checker: now supports keyword and file-diff based heuristics for marking checklist items as done (see `scripts/admin/welcome.js`).
- Documented the new system in `docs/standards/widget-standards.md` and main `README.md`.
- Added pinning tip to `updates/welcome.md` for persistent dashboard visibility in VS Code.

## 2025-11-23 - Version Standardization

### Version Standardization (x.x.0 Format)

- **Complete Repository Standardization**: Converted all version numbers to Semantic Versioning 2.0.0 format (x.x.0) throughout entire repository.
- **Widget Files Renamed**: Renamed 63 widget version files from `vX.Y.html` to `vX.Y.0.html` format:
  - Concert Portfolio: 19 versions (v2.0.0 → v4.7.0)
  - Photojournalism Portfolio: 12 versions (v1.0.0 → v5.2.0)
  - Podcast Feed: 12 versions (v1.0.0 → v2.0.0)
  - Featured Portfolio: 6 versions (v1.0.0 → v1.5.0)
  - Nature, Event, Hero, Portrait, Navigation, Video: 14 versions
- **Content Updates**: Updated version strings in 33+ widget HTML files (Version: headers) and 10+ script files (@version tags in manifest generators and watchers).
- **Documentation Updates**: Updated 13 documentation files with corrected version references (READMEs, CHANGELOGs, standards guides).
- **Automation Tools Created**:
  - `scripts/utils/standardize-versions.js`: Updates version strings in code content
  - `scripts/utils/rename-widget-versions.js`: Renames version files to x.x.0 format
  - Both support `--dry-run` mode for safe previewing
- **npm Scripts Added**:
  - `versions:standardize`: Run version content updates
  - `versions:check`: Preview version content changes (dry-run)
  - `versions:rename`: Run file renaming
  - `versions:rename-check`: Preview file renames (dry-run)
- **Comprehensive Documentation**: Created `docs/standards/version-standardization-guide.md` with format rules, semantic versioning guidelines, widget-specific standards, git tagging conventions, and troubleshooting.
- **Benefits**: Fixes dropdown sorting issues (v1.10.0 now properly sorts after v1.9.0), ensures professional Semantic Versioning compliance, provides consistency across repository, and includes automation tools for future maintenance.

## 2025-11-19

### Minor Maintenance & Cleanup (v2.5.3)

- **Documentation Updates**: Updated 'Last Updated' dates in widget READMEs (about, hire-to-unlock-resume, complete-about-page) to November 19, 2025.
- **Status File Cleanup**: Removed outdated STATUS.md files for production-ready widgets (concert-portfolio, photojournalism-portfolio, portrait-portfolio). These widgets are now at stable versions (v4.7, v5.2, v1.0 respectively).
- **Package Updates**: Updated npm dependencies within semver ranges (autoprefixer 10.4.21→10.4.22, open 10.2.0→11.0.0).
- **Version Bump**: Package version updated to 2.5.3 for minor maintenance release.

### Docs/Meta — Instructions & Reorganization Phase 1

- Updated `.github/copilot-instructions.md` with Repository Reorganization Phase 1 details (centralized legacy versions archive, orphan script audit utility, composite shadow manifest workflow, STATUS template standardization, deploy script consolidation). Added validation follow-up checklist (AI Preflight, widget HTML validator, repo health check). Phase 2 TODOs logged for physical legacy file relocation and orphan script archival.

### Testimonials Widget v1.0.0

- Created production-ready testimonials widget with masonry grid layout (3/2/1 columns responsive).
- Features: 5-star rating system, 12 sample testimonials with realistic data, monochrome featured badge, Schema.org AggregateRating structured data.
- Self-contained HTML with inline CSS/JS, full WCAG 2.1 AA accessibility support.
- Files: `src/widgets/testimonials/versions/v1.0.0-testimonials.html`, README, CHANGELOG.

### Contact Form Widget v1.0.0

- Created production-ready contact form with EmailJS integration for email delivery.
- Features: Dark/light mode toggle with localStorage persistence, privacy consent checkbox, honeypot spam protection, form validation, success/error messaging, loading states.
- Configuration: EmailJS credentials configured (publicKey: VJRlr0VVGGHH4PCeN, serviceId: service_twg853m, templateId: template_bxi2j5e).
- Theme System: Full CSS variables theming, default dark mode, sun/moon toggle icon, privacy link visibility in both themes.
- Template Parameters: name, email, subject, message, consent (Yes/No), timestamp.
- Files: `src/widgets/contact-form/versions/v1.0.0-contact-form.html`, README, SETUP.md.

### Design Standards

- Established monochrome design principle for all widgets (black/white/gray color palette).
- Dark mode set as default theme preference across contact form widget.

## 2025-11-10

### Interactive Thesis Widget v0.4 — Thesis Blog Format (No Live Embed)

- New version: `src/widgets/interactive-thesis/versions/v0.4-thesis-blog-format.html`.
- Removes the live Google Docs iframe; thesis sections (Abstract, Introduction, Methodology, Findings, Conclusion) are formatted as standalone blog-style cards using blog-grid/blog-card patterns.
- Keeps curated thesis-related podcast excerpts with media-fragment audio previews and full-episode links.
- A11y: list/listitem roles, toolbar aria-pressed, keyboard navigation (arrows) between cards, Enter toggles audio; reduced motion supported.
- Validation: widget HTML validator PASS.

### Interactive Thesis Widget v0.3 — Thesis Live Embed + Thesis-related Podcast Excerpts

- New version: `src/widgets/interactive-thesis/versions/v0.3-thesis-live-excerpts.html`.
- Aligns excerpt cards with blog widget aesthetics (blog-grid/blog-card, header/body, chips) for consistent look and feel.
- Embeds the published Google Doc via iframe (auto-updates on doc changes; no scraping) and surfaces curated thesis-related podcast clips with media fragment previews.
- Accessibility: semantic article cards with roles, toolbar filters with aria-pressed, reduced motion support.
- Validation: widget HTML validator PASS.

### Interactive Thesis Widget v0.1-minimal

### Interactive Thesis Widget v0.2 — Excerpts + Inline Thesis

- New version: `src/widgets/interactive-thesis/versions/v0.2-excerpts-inline-thesis.html`.
- Adds a "Thesis Draft (Inline)" section with clearly marked TODO placeholders (Abstract, Introduction, Methodology, Findings, Conclusion) for pasting actual thesis text.
- Adds "Podcast Excerpts" grid with accessible cards, each with a quote, tag, and inline audio preview (start-end via media fragment). Links to full episode.
- Performance: still self-contained, inline CSS/JS only. Reduced-motion respected. IntersectionObserver reveal.
- Validation: widget HTML validator PASS.
- Created new self-contained widget: `src/widgets/interactive-thesis/versions/v0.1-minimal.html`.
- Features: scroll reveal (IntersectionObserver with reduced motion fallback), accessible Story Drawer (ESC + click-away, focus trap, return-focus), lazy-loaded journalism images, demo audio clip + transcript.
- Performance: inline CSS/JS (no external frameworks) keeping footprint small; uses `loading="lazy"` and `decoding="async"` for images.
- Accessibility: semantic elements, dialog role, focus trap, escape handling, reduced motion support.
- Documentation: Added widget README with usage and stretch goals (podcast clips, map overlay, journal timeline).
- Next: Add build automation & page-level SEO meta integration if promoted beyond widget embed.

## 2025-10-09 - Journalism Portfolio

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
- 2025-11-11: Updated AI preflight and guardian logic to dynamically discover instruction docs in `.github/` and require a CHANGELOG Docs/Meta entry when any instruction file changes. Improved ai-instructions-preflight to support `--changed` cache mode and more robust heading/bullet extraction.
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
