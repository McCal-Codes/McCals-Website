# Active To-Do List

Last Updated: December 31, 2025

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

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

- [ ] **Package.json Reorganization**
  - [ ] Group 105 scripts into logical categories (dev, build, manifest, test, etc.)
  - [ ] Add comment headers for each category
  - [ ] Test each category independently
  - [ ] Update documentation
  - **Reason:** Deferred from Phase 3 - requires careful testing of 105 scripts
  - **Priority:** Medium
  - **Estimated Time:** 2-3 hours

- [ ] **Major Dependency Updates**
  - [ ] ESLint 8.57.1 → 9.x (breaking changes in config format)
  - [ ] React/React-DOM 18.3.1 → 19.x (Next.js compatibility check needed)
  - [ ] Tailwind CSS 3.4.18 → 4.x (major rewrite, extensive changes)
  - [ ] chokidar 4.0.3 → 5.0.0 (test file watchers)
  - [ ] esbuild 0.27.2 → latest (test build scripts)
  - [ ] open 10.2.0 → 11.0.0 (minor API changes)
  - **Reason:** Breaking changes require thorough testing
  - **Priority:** High (security & compatibility)
  - **Estimated Time:** 4-6 hours

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
- [ ] **Podcast Reliability**: Implement CORS Proxy Fallback Chain for `podcast-feed`
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
- [ ] TODO: Add CI rule enforcing ≤2 active versions
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
