# Completed Tasks Archive

Archive Created: December 6, 2025

This file tracks all completed tasks that have been removed from the active `todo.md` file for better organization and clarity.

---

## March 2026 Completions

### Contact Form Hardening + Portfolio Bridge Cleanup (Mar 11, 2026)

- [x] **Contact Form v1.1.0 hardening** - Added a timed anti-bot trap in addition to the honeypot, fixed success/error auto-hide behavior, trimmed submitted values, escaped provider error text before rendering, and improved `aria-live`/status messaging.
- [x] **Contact Form docs corrected** - Rewrote `src/widgets/_content/contact-form/README.md` and `SETUP.md` so setup guidance matches the actual EmailJS implementation.
- [x] **Portfolio bridge version sync** - Updated `sites/dev.mcc-cal.com/utils/widgetConfig.ts` so the dev app points at current versions for journalism, concerts, events, featured work, portraits, nature, and video.
- [x] **Added missing video route** - Created `sites/dev.mcc-cal.com/pages/video.tsx` so the video portfolio has a proper dev bridge route.
- [x] **Fixed grouped widget version detection** - Updated `sites/dev.mcc-cal.com/utils/widgetVersionDetector.ts` to resolve version directories inside grouped widget folders such as `portfolios/`, `_content/`, `_navigation/`, `_admin/`, and `projects/`.
- [x] **Portfolio documentation cleanup** - Refreshed the READMEs for concert, event, featured, photojournalism, portrait, nature, and video portfolios to match active versions and current status.
- [x] **Validation completed**
  - `npx tsc --noEmit` passed in `sites/dev.mcc-cal.com`
  - `npm run validate:widgets` passed for all widget HTML files

**Open follow-up identified during the session:**

- `nature-portfolio` still needs broader content coverage plus final accessibility/performance review.
- `video-portfolio` still needs the manifest generator, external data flow, and a clearer production scope.

---

## ✅ January 2026 Completions

### Portfolio Performance Optimization (Jan 6, 2026)

- [x] **Event Portfolio v2.9.1** — Performance optimization with pre-rendered LCP hero (Pittsburgh Social Club)
  - Added eager loading and `fetchpriority="high"` for hero image
  - Inlined critical CSS for above-the-fold content
  - Added resource hints for GitHub Raw CDN
  - Restored premium hover effects (card lift + image scale)
  - Fixed changelog modal function references

- [x] **Photojournalism Portfolio v5.5.2** — Performance optimization with pre-rendered LCP hero (CMU Trump Protest)
  - Added eager loading and `fetchpriority="high"` for hero image
  - Inlined critical CSS for above-the-fold content
  - Added resource hints for GitHub Raw CDN
  - Restored premium hover effects with brightness/contrast boost
  - Enhanced changelog modal with complete version history (v5.5.2 → v5.4.0)

- [x] **Portrait Portfolio v2.0.1** — Performance optimization with pre-rendered LCP hero (Editorial)
  - Added eager loading and `fetchpriority="high"` for hero image
  - Inlined critical CSS for above-the-fold content
  - Added resource hints for GitHub Raw CDN
  - Restored premium hover effects with category tag animation
  - **Added complete changelog modal** (was missing entirely)
  - Added changelog modal HTML, CSS (61 lines), and JavaScript functions

- [x] **Concert Portfolio v4.9.3** — Already optimized (Horseburner hero)
  - Hover effects preserved from previous version

- [x] **About Page v2.4.1** — Already optimized (bio photo eager load)
  - Performance enhancements from previous session

- [x] **Documentation Updates**
  - Updated `updates/todo.md` to mark Events, Journalism, and Portraits as completed
  - Added status notes for each optimized widget with version numbers and LCP candidates

### Technical Details

**Performance Enhancements Applied:**

- Pre-rendered LCP candidates for instant visual feedback
- Eager loading strategy for critical images
- High fetch priority to prioritize hero images
- Inlined critical CSS to eliminate render-blocking
- DNS prefetch and preconnect for CDN resources

**UI/UX Improvements:**

- Restored smooth hover animations across all widgets
- Consistent `cubic-bezier(0.165, 0.84, 0.44, 1)` easing
- Premium micro-interactions (lift, scale, brightness adjustments)
- Fixed all changelog modal functionality issues

---

## ✅ December 2025 Completions

### Event Portfolio Bugfix & WIP Deployments (Dec 27, 2025)

- [x] **Fixed Event Portfolio Image Loading** — Resolved regression in `toUrl` in `v2.9.0-WIP` by restoring the stable logic from `v2.7.0`.
- [x] **Standardized Global API Scoping** — Renamed `window.portfolioAPI` to `window.eventPortfolioAPI` to prevent collision and exposed explicit global handlers.
- [x] **Deployed WIP Markers across Widget Ecosystem** — Standardized `-WIP` version suffix (e.g., `v2.9.0-WIP`, `v4.9.2-WIP`) across 10 widgets to mark active development phase.
- [x] **Updated Multi-Widget Changelogs** — Documented initial changes for upcoming resilience and performance updates in all affected widget `CHANGELOG.md` files.
- [x] **Documented Session Learnings** — Captured technical insights on URL normalization, API namespacing, and operational workflow rules in `docs/development/WIDGET-OPTIMIZATION-LEARNINGS.md`.

### Technical Debt & Code Annotations (Dec 27, 2025)

- [x] **Cleaned up duplicate API submodule structure** — Removed confusing nested `src/api/src/api/` directory in the API submodule, consolidating to single `routes/` at submodule root
- [x] **Created Code Annotations Standard** — New `docs/standards/code-annotations.md` documenting TODO, FIXME, BUG, SECURITY, HACK, NOTE, A11Y, DEBUG, WIP, and other annotation keywords with examples, search commands, and AI agent guidelines
- [x] **Enhanced security comments** — Improved plaintext password warning in `src/api/routes/blog.js` with actionable migration steps and SECURITY tag
- [x] **Comprehensive Widget Analysis (Dec 27, 2025)** — Audited all 24+ widgets in `src/widgets/`, documented v1 contracts, and created a phased vNext roadmap for Resilience, Performance, and Observability.

### Shared Widget Stylesheet Pipeline (Dec 10, 2025)

- [x] Created automatic pipeline to inline `site-widgets.css` into every widget version via `npm run site-widgets:build` (dry-run + no-inline flags supported)
- [x] Added shared CSS markers (`<!-- site-widgets:inline:start/end -->`) with opt-out comment `<!-- site-widgets:inline:skip -->`
- [x] Updated `validate:widgets` script to require the inline block (unless skipped) and documented the workflow in `docs/standards/widget-standards.md` & `src/widgets/_shared/README.md`

### iOS Installable App (PWA baseline) (Dec 12, 2025)

- [x] Added PWA manifest and app icons to `sites/dev.mcc-cal.com/public/` (`manifest.webmanifest`, `icons/*`)
- [x] Added minimal service worker (`public/sw.js`) + offline fallback page (`public/offline.html`)
- [x] Wired PWA/iOS meta tags + manifest link in `pages/_document.tsx` and SW registration in `pages/_app.tsx`
- [x] Documented iOS “Add to Home Screen” install steps in `sites/dev.mcc-cal.com/README.md`

### Manifest & CI Fixes (Dec 12, 2025)

- [x] Resolved merge conflict in `src/images/Portfolios/Nature/nature-manifest.json` (kept latest generated timestamp)
- [x] Fixed linter warnings in watcher scripts:
  - `scripts/watchers/watch-journalism-manifest.js` — removed unused helper and used `IMAGE_EXTS` to filter non-image files
  - `scripts/watchers/watch-nature-manifest.js` — improved logging and surfaced generator output to avoid unused-variable warnings
- [x] Made Cloudflare deploy workflow robust to missing secrets:
  - `src/api/.github/workflows/deploy.yml` now emits a clear warning and skips `wrangler deploy` when `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID` are not configured, and prints a `wrangler.toml` summary for debugging
  - Committed the workflow change in the `src/api` submodule and updated the parent repo's submodule pointer
- [x] Pushed fixes to `main` (lint fixes and manifest resolution) so CI can re-run cleanly

Notes:

- Follow-up required: add Cloudflare secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optional `CLOUDFLARE_WEBHOOK_SECRET`) in GitHub repo settings to enable actual Worker deployment.
- To finish deployment, re-run the Deploy Cloudflare Worker workflow after secrets are added or run `wrangler deploy` locally in `src/api` with the secrets exported.

### Blog System & Cloudflare Integration (Dec 5-6, 2025)

- [x] **Blog Admin Widget v1.0.0** — Complete blog authoring system with login, post editor (dynamic content blocks), post management dashboard, profile settings; production-ready self-contained admin widget
- [x] **Complete Cloudflare Worker** — Created `tools/cloudflare/complete-worker.js` integrating manifests, blog auth, webhooks, rate limiting, and cache management
- [x] **Deployment Guide** — Added comprehensive `tools/cloudflare/DEPLOYMENT-GUIDE.md` with step-by-step setup, KV namespace creation, and testing procedures
- [x] **Blog System Integration Documentation** — Created `docs/integrations/blog-system-integration.md` with architecture, API reference, and security best practices
- [x] **Wrangler Configuration** — Configured `tools/cloudflare/wrangler.toml` with KV bindings, CORS origins, and manifest base URL
- [x] **Environment Variables** — Updated `.env.example` with BLOG_AUTHORS environment variable for JWT authentication

### Manifest & CDN Fixes (Dec 5-6, 2025)

- [x] **Event Manifest Publishing Fix** — Resolved CDN cache issue preventing updated event dates from displaying in widget; confirmed GitHub raw URL serving correct dates
- [x] **Cloudflare Integration** — Added edge caching, webhook purge/warm endpoints, rate limiting, cache stats, and CI integration for automatic cache refresh after manifest publish
- [x] **Cloudflare Manifest Webhook Worker** — Deployed minimal worker with secret verification, origin forwarding, and GitHub fallback; updated .env.example and added docs/integrations/manifest-webhook-worker.md

### Manifest & Image Optimization (Dec 5, 2025)

- [x] **Auto-Manifest Watcher --initial Flag** — Added --initial flag to watch-auto-manifest.js for immediate regeneration on startup; supports per-portfolio and --all modes
- [x] **Event Date Corrections** — Fixed Back To School Bash (January 2022) and Growing Up (December 2021) dates via date-overrides.json; manifests regenerated and pushed to GitHub
- [x] **Image Compression** — Compressed 5 largest images (Nature/Concert portfolios) with sips, saving ~32.7 MB total

---

## ✅ November 2025 Completions

### Next.js Migration (Dec 1-5, 2025)

- [x] **Next.js Footer (v1.3.0 parity)** — Wired real newsletter subscription endpoint and adjusted JSON-LD logo URL to app's public assets path
  - Added Organization JSON-LD structured data injection via Next.js Head
  - Newsletter form now uses env-configurable NEXT_PUBLIC_NEWSLETTER_ENDPOINT (default: Mailchimp)
  - Logo URL now uses SITE_URL + /brand/logo-mark.svg from public/ directory
  - Added logo-mark.svg asset to sites/self-hosted-nextjs/public/brand/

### Widget Archival & Standards (Dec 1, 2025)

- [x] **Phase 1 — Legacy Version Archival (Planning & Scaffolding)** — COMPLETE
  - Defined archival policy and shadow workflow validation (completed per workspace standards and Recent Updates)
  - Documented policy in `docs/standards/workspace-organization.md` and `.github/copilot-instructions.md`
  - Added archive index scaffolds (INDEX.json templates) for `concert`, `photojournalism`, and `featured` under `src/widgets/_archived/Legacy Widgets/<widget>/versions/`
  - Added CI scan script (dry-run) to report active vs legacy counts per widget without failing builds

- [x] **Phase 2 — Legacy Version Physical Relocation** — COMPLETE
  - Physically relocated 60+ legacy widget version files to `src/widgets/_archived/Legacy Widgets/<widget>/versions/`
    - concert-portfolio: 17 versions archived (v2.0.0–v4.6.0)
    - photojournalism-portfolio: 11 versions archived (v1.0.0–v5.1.0)
    - podcast-feed: 11 versions archived (v1.0.0–v1.9.5)
    - event-portfolio: 8 versions archived (v1.0.0–v2.6.1)
    - featured-portfolio: 4 versions archived (v1.0.0–v1.3.0)
    - accessibility-statement: 3 versions archived (v1.0.0–v1.1.1)
    - nature-portfolio: 3 versions archived (v1.0.0, v1.2.0, v1.5.0)
    - site-footer: 2 versions archived (v1.0.0, v1.1.0)
    - site-navigation: 5 versions archived (v1.0.0, v1.6.x)
    - blog-feed: 1 version archived (v1-google-docs)
  - Validated all widgets now comply with ≤2 active versions policy (scanner confirmed 100% compliance)
  - Updated widget READMEs with standardized version sections and archive links
    - Standardized 10 widget READMEs with "Active Versions (≤2 Policy)" and "Legacy Versions (Archived)" sections
    - Added proper archive links to INDEX.json for all widgets with archived versions
    - Consistent format: current version, previous stable, archive location, version count
  - HTML validator enhancements — fixed to accept snippet-style widgets
    - Added skip logic for \_archived directories
    - Enhanced validation to recognize HTML snippets (semantic tags + content)
    - Achieved 100% pass rate (78/78 files valid)
  - Created CI workflow to enforce ≤2 active versions policy (`.github/workflows/widget-version-policy.yml`)

### Domain Updates (Dec 1, 2025)

- [x] **Update schema/links in archive indexes** — Completed for INDEX.json templates

### VS Code & Agent Integration (Nov 15, 2025)

- [x] **Sample `.agents.md` template** — Added at repo root to demonstrate safe Planning Agent and Git Hygiene agent
- [x] **Git Hygiene Agent Integration**
  - Added `scripts/agents/git-hygiene.sh` (runs git status, lint, tests)
  - Enhanced `.agents.md` with `git-hygiene` `run_command` and notes
  - Added `docs/agents/git-hygiene.md` with usage and CI hints
  - Added `lint` and `test` scripts to `package.json` for eslint and playwright
  - Created GitHub Action workflow `.github/workflows/agent-checks.yml` to run on PRs and comment with results
- [x] **Reorganizing Agent Integration**
  - Added `scripts/agents/reorganize-check.sh` (scans for workspace organization violations)
  - Enhanced `.agents.md` with `reorganizing-agent` entry, run_command, and notes
  - Added `docs/agents/reorganizing-agent.md` with usage and CI hints
  - Implemented `--fix` mode with JSON-based approved moves and safety checks (requires jq)
  - Updated documentation with `--fix` mode usage, JSON format, and safety notes
  - Included in GitHub Action workflow to run on PRs

### Widget Enhancements (Nov 2-11, 2025)

- [x] **Accessibility Statement Widget v1.1.x** — Added theme toggle (System/Light/Dark), readable panel with adaptive backdrop, localStorage persistence, full keyboard accessibility, WCAG AA contrast verified
- [x] **Policies & Legal Widget v1.1.0** — Accessibility enhancements: skip link, unified focus-visible, scroll spy with aria-current, mobile drawer improvements, reduced motion support, print stylesheet refinement
- [x] **Concert Portfolio v4.7 (refinement)** — Deduplicated artist list, Spotify support improvements, interaction safety and performance polish

### Repository Audit (Nov 4, 2025)

- [x] **Run repository audit and follow-up housekeeping**
  - Audit file: `docs/REPO-AUDIT-2025-11-04.md`
  - Large-file report: `reports/large-files-2025-11-04.txt`
  - npm audit: `reports/npm-audit-2025-11-04.json`
  - Added `.gitattributes`, `CONTRIBUTING.md`, and `CODEOWNERS`

---

## ✅ October 2025 Completions

### Widget Development (Oct 24, 2025)

- [x] **Portrait Portfolio v1.0** — Portrait photography widget (vertical-focused, 3:4, performance & SEO) — added to Available Widgets and sample manifest
- [x] **Podcast Feed v1.9.5** — RSS auto-hydration, caching, branding updates
- [x] **About Page v1.4.4** — Bio update, contact/Calendly integration

### Widget Standards & Documentation (Oct 5-8, 2025)

- [x] **Site Footer v1.2.0** — Compliance with standards, accessibility improvements
- [x] **Concert Portfolio v4.6→v4.7** — Performance work + v4.7 refinements
- [x] **Photojournalism v5.x** — Filter buttons, shuffle, adjacency minimization, lightbox fixes

### Automation & CI (Oct 4-6, 2025)

- [x] **Preflight & Workspace Validation** — AI preflight checks added and used (`npm run ai:preflight:short`) and related tasks wired
- [x] **Manifest & CI Automation** — Robust manifest generation scripts, watch processes, CI workflows for concert/events/journalism, retry/validation/rollback logic

### Video Widget Scaffold (Date TBD)

- [x] **Video Portfolio Widget v0.1 scaffold** — Created structure for video portfolio widget
  - Scaffold widget directory `src/widgets/video-portfolio/` with `versions/v0.1-video-portfolio.html`
  - Inline dataset (Phase 1) with mixed sources (mp4/youtube/vimeo) and accessible posters
  - Filtering (auto-generated tags) and lazy thumbnail loading
  - Accessible lightbox/player (focus trap, keyboard media controls, Escape close)
  - Basic structured data (VideoObject ItemList)

---

## 📚 Documentation Completions

### Standards & Guidelines (Nov 19, 2025)

- [x] **Update `docs/standards/widget-standards.md`** — Added November 2025 Addendum (archival policy, aggregated manifest, accessibility semantics, CI hooks)
- [x] **Create case studies** — `docs/case-studies/performance-seo-case-studies.md` (Concert v4.5→v4.7, Photojournalism v4.4→v5.x, Accessibility Statement, Policies & Legal)
- [x] **Widget development tutorial series** — `docs/tutorials/widget-development/part1-4` (structure, performance, accessibility, deployment)
- [x] **Update workspace organization standards** — Added archival + composite workflow sections in `docs/standards/workspace-organization.md`
- [x] **Comprehensive changelog system** — `docs/standards/widget-changelog-standard.md` (format, CI validation plan)
- [x] **Integration patterns documentation** — `docs/integrations/rss-integration.md`, `docs/integrations/calendar-integration.md`

### Preflight Validation (Oct-Nov 2025)

- [x] **Run `npm run ai:preflight:short`** — Added and used during recent sessions

---

_This file is automatically updated when tasks are moved from todo.md to maintain a historical record of completed work._
