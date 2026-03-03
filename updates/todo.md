# Active To-Do List

Last Updated: March 3, 2026

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

---

## ✅ Completed - March 3, 2026

### 🧰 `.github` Audit & Stale File Cleanup

- [x] Audited `.github` workflows, local composite actions, and script references for active usage.
- [x] Archived/removed high-confidence stale files:
  - `.github/workflows/scripts/gen-manifest.js` (unused legacy helper; no workflow references)
  - `.github/.DS_Store` (system artifact; no source value)
- [x] Revalidated workflow script references after cleanup.
  - `node scripts/utils/ci-validate-workflows.js` → pass for script reference integrity.
- [x] Phase 2 medium-confidence cleanup:
  - Removed `.github/workflows/wpcom.yml` (legacy placeholder workflow that only uploaded a repository artifact and had no active references in repo standards/docs).

**Notes:**

- Remaining workflow validator output is advisory cache-optimization warnings (non-blocking), not broken references.
- Follow-up complete (2026-03-03): Added `cache: 'npm'` to Node-heavy workflows (`weekly-duplicates-report.yml`, `publish-manifests-cdn.yml`, `validate-manifests.yml`, `ci-scripts-smoke.yml`, `nightly-smoke-test.yml`) and refined `scripts/utils/ci-validate-workflows.js` to warn about missing cache only when a workflow actually performs Node/npm work.
- Current validator status: clean pass with no missing-script or cache warnings.

---

## ✅ Completed - March 2, 2026

### 🧭 Hero, Navigation, About, and Roadmap Iteration

- [x] **Hero Slideshow (Active) — v1.3.13 + v1.3.14**
  - Added long-task-aware initialization and progressive dynamic hydration for faster perceived load and smoother runtime behavior.
  - Added slot override controls for targeted blend of favorite/dynamic content.
- [x] **Hero Slideshow (Legacy Archive) — v1.3.8 + v1.3.9**
  - Archived intermediate responsive focal/overlay and SEO/button-polish iterations for traceable version history.
- [x] **Site Navigation — v2.0.4 + v2.0.5**
  - Shipped strict monochrome visual pass.
  - Hardened keyboard/outside-click handling and submenu behavior.
  - Improved crawl path for Work navigation link structure.
- [x] **Complete About Page — v2.4.5 SEO Refresh**
  - Added refreshed metadata and SEO-focused copy updates.
  - Updated structured data approach and release notes/changelog block for v2.4.5.
- [x] **Roadmap Widget — v1.6.0 + v1.7.0**
  - Added dual-track responsive roadmap experience.
  - Added live sync behavior from `updates/todo.md` with graceful fallback.

**Notes:**

- Widget validation should be re-run after final staging to confirm all newly added versions pass the HTML validator in this batch.

---

## ✅ Completed - January 6, 2026

### 🚀 Portfolio Performance Optimization

- [x] **Event Portfolio v2.9.1** — LCP optimization with pre-rendered hero (Pittsburgh Social Club)
- [x] **Photojournalism Portfolio v5.5.2** — LCP optimization with pre-rendered hero (CMU Trump Protest) + enhanced changelog
- [x] **Portrait Portfolio v2.0.1** — LCP optimization with pre-rendered hero (Editorial) + added complete changelog modal
- [x] **Restored Premium Hover Effects** — All portfolio widgets now have smooth lift/scale animations
- [x] **Fixed Changelog Modals** — Corrected function references and added missing modal to portrait portfolio
- [x] **Documentation** — Updated todo.md and completed.md with full session details

**Performance Metrics:**

- Pre-rendered LCP candidates for instant visual feedback
- Eager loading + high fetch priority for hero images
- Inlined critical CSS to eliminate render-blocking
- Resource hints (preconnect/dns-prefetch) for CDN

---

## ✅ Completed - December 31, 2025

### 🧹 2026 Repository Cleanup (All Phases Complete)

- [x] **Phase 1: Safe Cleanup**
  - [x] Archived 9 Phase-2 completion documents to `docs/archive/phase-2/`
  - [x] Consolidated test files to `tests/previews/`
  - [x] Removed system artifacts (.DS_Store, nohup.out)
  - [x] Optimized .gitignore
  - [x] Reduced root directory from 39 to 29 files (-26%)
- [x] **Phase 2: Dependency Updates**
  - [x] Updated 7 packages to latest safe versions
  - [x] All widgets pass validation
  - [x] Fixed security vulnerabilities (0 now)
  - [x] Deferred major updates to Q1 2026
- [x] **Phase 3: Structural Improvements**
  - [x] Fixed esbuild security vulnerability (GHSA-67mh-4wv8-2f99)
  - [x] Consolidated documentation structure
  - [x] Scanned widget versions (all compliant)
  - [x] Analyzed package.json (109 scripts)
- [x] **Audit & Final Cleanup**
  - [x] Removed 4 deprecated npm scripts (docker, deploy)
  - [x] Deleted obsolete build artifacts (~4 MB)
  - [x] Archived backups to `docs/archive/backups/`
  - [x] Final count: 105 scripts, 29 root files

**Documentation Created:**

- `docs/2026-REPO-CLEANUP-PLAN.md`
- `docs/2026-CLEANUP-SUMMARY.md`
- `docs/2026-PHASE-2-SUMMARY.md`
- `docs/2026-PHASE-3-SUMMARY.md`
- `docs/2026-AUDIT-REPORT.md`
- `docs/2026-COMPLETE.md`
- `docs/PRE-2026-CHECKLIST.md`

---

## 🚀 Q1 2026 Priorities (Deferred from 2025 Cleanup)

### 🔧 Repository Improvements

- [x] **Categorize and Document package.json Scripts**
  - **Purpose**: Reduce cognitive load and prevent accidental execution of deprecated or incorrect scripts across 105+ entries.
  - **Scope**: Reorganizes the `scripts` object in `/package.json`. Must NOT change script names or logic.
  - **Findings**: Categorized into 13 logical groups with header comments.
  - **Validation**: `npm run` executes without errors; all CI-critical scripts function.

- [x] **Pre-Upgrade Audit for ESLint 9 and React 19**
  - **Purpose**: Identify breaking changes and required config updates (ESLint config format, Next.js compat) before starting the actual upgrade.
  - **Findings**: Documented in [docs/2026-DEPENDENCY-AUDIT.md](../docs/2026-DEPENDENCY-AUDIT.md)
  - **Validation**: Summary of breaking changes documented.

- [ ] **Node.js Upgrade (20.19+ or 22.x LTS)**
  - **Purpose**: Align with newer package recommendations (≥20.17) and security standards.
  - **Scope**: Internal development environment and CI/CD runners.
  - **Dependencies**: none
  - **Risk level**: low
  - **Validation**: All npm scripts and build processes pass; CI/CD workflows updated.

- [ ] **Node.js Upgrade**
  - [ ] Upgrade from Node.js 20.15.1 to 20.19+ or 22.x LTS
  - [ ] Test all npm scripts and build processes
  - [ ] Update CI/CD workflows if needed
  - [ ] Update documentation with new Node version
  - **Reason:** Current version works but newer packages recommend ≥20.17
  - **Priority:** Medium
  - **Estimated Time:** 1-2 hours

- [ ] **Cloudflare Worker Production Deployment**
  - [ ] Deploy Worker to production with proper environment variables
  - [ ] Create KV namespaces (MCCAL_KV, MCCAL_KV_PREVIEW)
  - [ ] Configure manifests/blog widget to point at production Worker URL
  - [ ] Test end-to-end flows: manifest webhook, blog auth/posts, rate limiting
  - **Reason:** Active project, not urgent - can be completed in Q1
  - **Priority:** Medium
  - **Estimated Time:** 3-4 hours

---

## 🚀 Active Sprints (The "Now")

### ⚡ Live Site Performance (mcc-cal.com)

- [x] **Define and Document LCP Elements per Primary Page**
  - **Purpose**: Establish measurable performance targets for Home, Concerts, Events, Journalism, and Portraits pages.
  - **Scope**: Touches `updates/todo.md` (Page & Widget Mapping section). Does not touch widget code.
  - **Findings**: Candidate selectors documented in the mapping section below.
  - **Validation**: LCP candidates recorded for all 5 primary pages.

- [ ] **Audit and Replace JS-rendered Hero Images**
  - **Purpose**: Shift LCP elements from JS-driven rendering to native `<img>` tags to improve FCP/LCP.
  - **Scope**: Touches widget HTML versions. Must preserve responsive srcset/sizes logic.
  - **Dependencies**: LCP candidates must be defined first.
  - **Risk level**: medium (Visual regression if image loading logic breaks).
  - **Validation**: Hero images visible with JS disabled;srcset/sizes verified correct on mobile.

- [ ] **Enforce JS Deferral & Widget Gating**
  - **Purpose**: Remove render-blocking scripts and prevent unnecessary initialization code from running.
  - **Scope**: All widgets and main site bootstrap.
  - **Dependencies**: none
  - **Risk level**: high (Could break widget initialization or event listeners).
  - **Progress (2026-03-03)**: Added strict root-element init guards to active `event-portfolio` (v2.9.1), `concert-portfolio` (v4.9.3), `photojournalism-portfolio` (v5.5.3), and `portrait-portfolio` (v2.0.2) so scripts exit early when widget markup is absent/incomplete.
  - **Validation (2026-03-03)**: `npm run validate:widgets` now passes fully after adding required site-widgets inline markers to `src/widgets/_content/abridged/versions/v1.0-landing.html` and `src/widgets/_content/abridged/versions/v1.0-abridged.html`.
  - **Validation**: No render-blocking scripts reported in DevTools for above-the-fold content.

#### Page & Widget Mapping

- [ ] Home page
  - Primary widgets: site-navigation, featured-portfolio, footer
  - LCP candidate: Squarespace Hero (Template) / `.featured-card:first-child img` (Secondary)
  - Status: Featured Portfolio optimized in v1.5.1 with native pre-rendered secondary LCP image (static audit complete); Main Hero remains managed via Squarespace template (pending user updates).

- [x] Concerts
  - Primary widgets: concert-portfolio
  - LCP candidate: `.concert-card:first-child img`
  - Status: Optimized in v4.9.3 with pre-rendered hero.

- [x] Events
  - Primary widgets: event-portfolio
  - LCP candidate: `.event-card:first-child img`
  - Status: Optimized in v2.9.1 with pre-rendered hero (Pittsburgh Social Club).

- [x] Journalism
  - Primary widgets: photojournalism-portfolio
  - LCP candidate: `.journalism-card:first-child img`
  - Status: Optimized in v5.5.3 with pre-rendered hero (CMU Trump Protest).

- [x] Portraits
  - Primary widgets: portrait-portfolio
  - LCP candidate: `.portrait-card:first-child img`
  - Status: Optimized in v2.0.2 with pre-rendered hero (Editorial).

- [x] About Page
  - Primary widgets: complete-about-page
  - LCP candidate: `.bio-photo img`
  - Status: Optimized in v2.4.5 (Eager load + High priority).

##### Static Source Audit (2026-03-03)

- Home (secondary candidate): `featured-portfolio` v1.5.1 includes a pre-rendered first `.featured-card` image with `loading="eager"` and `fetchpriority="high"` before widget JS execution.
- Concerts: `concert-portfolio` v4.9.3 includes pre-rendered first `.concert-card` image with eager/high-priority loading in HTML.
- Events: `event-portfolio` v2.9.1 includes pre-rendered first `.event-card` image with eager/high-priority loading in HTML.
- Journalism: `photojournalism-portfolio` v5.5.3 includes pre-rendered first `.journalism-card` image with eager/high-priority loading in HTML.
- Portraits: `portrait-portfolio` v2.0.2 includes pre-rendered first `.portrait-card` image with eager/high-priority loading in HTML.
- About: `complete-about-page` v2.4.5 includes bio photo `<img>` with `loading="eager"` and `fetchpriority="high"`.
- Pending runtime proof: DevTools LCP capture on live pages is still required to close the runtime verification checklist below.

For each page:

- [ ] Identify actual LCP element via DevTools
- [ ] Verify it renders without waiting on JavaScript
- [ ] Record findings before optimization

#### Definition of Done (Performance)

This section may be considered complete only when:

- [ ] LCP element is explicitly identified per primary page
- [ ] LCP content is visible without waiting on JS execution
- [ ] No render-blocking scripts remain for above-the-fold content
- [ ] Widget initialization is gated by presence
- [ ] DOM structure for primary widgets is minimal and intentional
- [ ] Before/after metrics are recorded for each optimized page
- [ ] Accessibility and semantics are preserved or improved

If a change improves Lighthouse scores but delays visible content, it is not done.

### ☁️ Infrastructure & Deployment

- [ ] **Cloudflare Worker Production Deploy**
  - [ ] Deploy Worker to production with proper environment variables (use AUTH-SETUP-GUIDE.md)
  - [ ] Create KV namespaces (MCCAL_KV, MCCAL_KV_PREVIEW)
  - [ ] Configure manifests/blog widget to point at production Worker URL
  - [ ] Test end-to-end flows: manifest webhook, blog auth/posts, rate limiting, cache stats
- [ ] **Next.js Self-Hosted Site Migration**
  - [ ] Create structure under `sites/dev.mcc-cal.com/`
  - [ ] Add Layout, Nav, and Footer components with "Self-Hosted" branding
  - [ ] Implement ConcertWidget (manifest typing, fetch, gallery, lightbox, CSS module)
  - [ ] Add stubs for FeaturedWidget, EventWidget, JournalismWidget
  - [ ] Add manifest loader utility and manifest types
  - [ ] Add minimal pages for all routes & CSS modules for visual parity
- [ ] **Domain & DNS Setup**
  - [ ] Set up dev.mcc-cal.com subdomain (CNAME/Tunnel)
  - [ ] Configure SSL/TLS and test CORS/API integration

### 🎥 Feature Tracks: Video Portfolio (v0.2.x)

- [ ] TODO: Add transcripts & captions panel (WebVTT ingest + transcript export) — Phase 2
- [ ] TODO: Implement manifest generator and aggregated video-manifest.json
- [ ] TODO: Add adaptive bitrate streaming (HLS/DASH) with quality selector + fallback to MP4
- [ ] TODO: Add debug panel metrics and performance logging

---

## 🛠️ Widget Enhancement Roadmap (vNext)

Phased improvements for the existing widget ecosystem.

### Phase 1: Foundation & Reliability

- [ ] **Global Debug Mode**: Implement `data-debug` in `portfolio-api.js` v2 adapter
- [ ] **Navigation Refinement**: Add Passive Scroll Listeners and Safe Area Insets to `site-navigation`
- [ ] **Empty State Resilience**: Add UI handling in `concert-portfolio` and `photojournalism-portfolio`
- [ ] **Blog Performance**: Add Search Debouncing (300ms) to `blog-feed`
- [x] **Podcast Reliability**: _[OUT OF SCOPE - Assigned to Podcast Agent]_ Implement CORS Proxy Fallback Chain for `podcast-feed`
- [ ] **Admin Observability**: Add GitHub API Rate Limit Detection to `admin-dashboard`
- [ ] **Event Portfolio Polish**: Auto-detect latest widget version & URL normalization fix
- [ ] **Content Widget Polish**:
  - [ ] Add spam honeypot to `contact-form`
  - [ ] Implement dynamic logo track for `client-carousel`
  - [ ] Add star-rating schema to `testimonials`

### Phase 2: Performance & Scale

- [ ] **Persistent Cache**: Implement IndexedDB Caching in `portfolio-api.js`
- [ ] **Image Optimization**: Add Thumbnail Precomputation logic to concert manifest generator
- [ ] **Video Deferral**: Implement Script Deferral (lazy load YT/Vimeo SDKs)
- [ ] **Virtual Scrolling**: Add opt-in for `blog-feed` (data-virtual-scroll)
- [ ] **Live Roadmap**: Integrate real-time GitHub Commit Sync (replacing hardcoded stats)
- [ ] **WebP Consolidation**: Implement manifest-side duplicate pairing with sources array

### Phase 3: Advanced Configurability

- [ ] **Modular About Page**: Add Component Toggle Flags (data-show-\*) to `complete-about-page`
- [ ] **Card Templating**: Implement Custom Card Template Slot in `blog-feed`
- [ ] **Fresh Views**: Add Shuffle on Load capability to all standard portfolios
- [ ] **Concert Experience**: Additional Spotify artist integrations and interactive embeds

---

## 🔧 Engineering Standards & Quality

### CI/CD & Automation

- [ ] Evaluate GitHub Actions secret lint warnings (reusable `workflow_call` dispatcher)
- [ ] TODO: Add automated widget validation (small unit/integration tests) and wire into CI
- [x] **Implement CI Check for Active Widget Versions**
  - **Purpose**: Enforce the "≤2 active versions" policy to prevent technical debt and maintain repository hygiene.
  - **Scope**: Github Actions workflows or standalone script in `scripts/`. Must not modify widget files.
  - [x] Cleanup existing violations (archive older versions)
  - **Findings**: 0 violations. All violating widgets archived. Recursive scanner and CI check implemented.
  - **Validation**: CI passes; `npm run scan:widget-versions` returns "PASS".

- [x] TODO: Add structured data validator
  - **Completed:** Added `scripts/seo/validate-seo-assets.js` and `npm run seo:validate`
  - **Validation:** `npm run seo:validate` passes (sitemap + structured data + domain consistency)
- [ ] TODO: Add Lighthouse automation snapshot

### Performance, SEO & A11y

- [ ] TODO: Audit and optimize Lighthouse metrics (FCP/LCP/TBT) for all portfolio widgets
- [ ] TODO: Implement aggressive caching strategies for widget-delivered assets
- [ ] TODO: Add accessibility improvements: ARIA labels, keyboard navigation, screen reader support
- [x] TODO: Integrate axe-core accessibility audit into CI for widgets
  - **Completed (2026-03-03):** Hardened `.github/workflows/a11y-axe-firefox.yml` by fixing step output wiring (`id: ensure_target_url` + explicit `skip`/`target_url` outputs), standardized workflow execution via npm script (`a11y:axe:firefox`), and enabled strict CI mode (`AXE_FAIL_ON_VIOLATIONS=true`).
  - **Also updated:** `playwright-smoke.yml` now uses the same npm script path for consistency; `scripts/a11y/axe-firefox.js` now emits JSON + HTML + Markdown reports expected by CI artifacts.
  - **Audit follow-up (2026-03-03):** Fixed stale script paths in `agent-checks.yml` (`scripts/agents/*` -> `docs/agents/*`) and updated `scripts/utils/ci-validate-workflows.js` to recognize `./.github/actions/setup-node-workspace` as satisfying checkout/cache requirements.
  - **Artifacts:** `reports/axe-firefox-results.json`, `reports/axe-firefox-widget-report.html`, `reports/axe-firefox-summary.md`

---

## 📚 Documentation & Maintenance

- [ ] TODO: Update copilot instructions, CHANGELOG.md, and docs when making structural changes
- [ ] TODO: Consolidate and update all widget README files with current versions and features
- [ ] TODO: Create comprehensive widget testing suite / documentation site
- [ ] TODO: Continue phased repository improvement plan (docs/repo-improvement-plan.md)
- [ ] TODO: Add schema diff & performance snapshot automation

---

## 🔮 Backlog & Future Ideation

### New Widget Concepts

- [ ] Services/Portfolio showcase (categorized work)
- [ ] Social Media Feed aggregator
- [ ] Event Calendar / Scheduling (Google Calendar integration)
- [ ] Interactive FAQ accordion widget

### Advanced Features

- [ ] AI-powered image alt-text generation
- [ ] Real-time analytics and user interaction tracking
- [ ] A/B testing framework for widget variations
- [ ] Widget customization API for client-specific branding
- [ ] Dashboards: Centralized performance monitoring widget
