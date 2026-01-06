# Active To-Do List

Last Updated: January 6, 2026

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

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
  - **Validation**: No render-blocking scripts reported in DevTools for above-the-fold content.

#### Page & Widget Mapping

- [ ] Home page
  - Primary widgets: site-navigation, featured-work, footer
  - LCP candidate: `.featured-item:first-child img` (or Squarespace Hero Image)

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
  - Status: Optimized in v5.5.2 with pre-rendered hero (CMU Trump Protest).

- [x] Portraits
  - Primary widgets: portrait-portfolio
  - LCP candidate: `.portrait-card:first-child img`
  - Status: Optimized in v2.0.1 with pre-rendered hero (Editorial).

- [x] About Page
  - Primary widgets: complete-about-page
  - LCP candidate: `.bio-photo img`
  - Status: Optimized in v2.4.1 (Eager load + High priority).

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
  - **Findings**: 0 violations now. All 11 violating widgets archived. Recursive scanner and CI check implemented.
  - **Validation**: CI passes; `npm run scan:widget-versions` returns "PASS".

- [ ] TODO: Add structured data validator & Lighthouse automation snapshot

### Performance, SEO & A11y

- [ ] TODO: Audit and optimize Lighthouse metrics (FCP/LCP/TBT) for all portfolio widgets
- [ ] TODO: Implement aggressive caching strategies for widget-delivered assets
- [ ] TODO: Add accessibility improvements: ARIA labels, keyboard navigation, screen reader support
- [ ] TODO: Integrate axe-core accessibility audit into CI for widgets

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
