# Active To-Do List

Last Updated: April 3, 2026

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks  
- See [welcome.md](./welcome.md) for today's dashboard  
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

---

## 🚀 Active Now (April 2026)

### Vite Site Refactoring (`sites/mcc-cal-vite/`)

The Vite site is the primary web surface. Current focus: code quality and performance.

**Just Completed:**
- ✅ Extracted duplicate utilities (`formatDate`, `slugify`) to `utils/formatters.ts`
- ✅ Centralized blog types to `types/blog.ts`
- ✅ Added barrel exports (`components/index.ts`)
- ✅ Implemented `React.lazy()` code splitting for all 24 routes
- ✅ Added `ErrorBoundary` component for error handling
- ✅ **SEO Optimization** - All pages now have comprehensive meta tags
  - Fixed missing og-image.jpg on homepage
  - Added usePageMeta to 12 pages (contact-us, request-quote, portfolios, etc.)
  - Added WebSite + Organization structured data to homepage
  - Added preconnect hints and advanced meta tags (theme-color, referrer, locale)
- ✅ **Component Decomposition** - Verified decomposition complete
  - `blog.tsx` uses barrel imports: `StoryCard`, `StoryMeta`, `StoryBody`, `StoryCitations`, `useBlogPageData`
  - `podcast.tsx` uses barrel imports: `EpisodeCard`, `usePodcastFeed`
  - All components under 300 lines, TypeScript validation passed
- ✅ **Barrel Import Migration** - Migrated 20+ page files to use `@/components` pattern
  - All Layout imports now use `import { Layout } from '@/components'`
  - Homepage uses `import { Nav, Footer, HeroCarousel } from '@/components'`
  - No more direct path imports like `@/components/Layout/Layout`
- ✅ **React Query Implementation** - Already complete
  - Blog data uses `useBlogManifest`, `useBlogAuthors`, `useBlogPost`, `useBlogPageData`
  - Podcast feed uses `usePodcastFeed` with caching and initial data
  - QueryClient configured with 5min staleTime, 30min gcTime

**Current Sprint:**
- [ ] **Add E2E Tests** - Playwright coverage for critical user flows (homepage, blog, podcast, contact)
- [ ] **Bundle Analysis** - Run `vite-bundle-visualizer` to identify optimization targets

**Next Up:**
- [ ] **CSS-by-Feature** - Move styles adjacent to components (co-location)
- [ ] **Bundle Analysis** - Run `vite-bundle-visualizer` to identify optimization targets
- [ ] **Add E2E Tests** - Playwright coverage for critical user flows
- [ ] **SEO Enhancements** - Advanced optimizations for search visibility
  - [ ] Add JSON-LD structured data to portfolio pages (portraits, nature, video, etc.)
  - [ ] Add BreadcrumbList schema to blog posts
  - [ ] Add FAQ schema to contact/request-quote pages
  - [ ] Add Service schema to commercial pages
  - [ ] Run Lighthouse audit for Core Web Vitals

---

## � Widget Ecosystem (`src/widgets/`)

Portfolio and content widgets. Currently stable; enhancements in backlog.

### Maintenance Mode

- [x] **Widget Version Policy** - CI enforces ≤2 active versions (100% compliance)
- [x] **Legacy Archival** - 60+ versions archived to `src/widgets/_archived/`
- [x] **Shared Styles** - `site-widgets.css` auto-inlined via build pipeline

### Pending Enhancements (Backlog)

- [ ] **Concert Portfolio** - Empty state resilience when no shows
- [ ] **Photojournalism Portfolio** - Empty state resilience
- [ ] **Blog Feed** - Search debouncing (300ms)
- [ ] **Client Carousel** - Dynamic logo track (currently static)
- [ ] **Testimonials** - Star rating schema markup

---

## ☁️ Cloudflare Worker (`tools/cloudflare/`)

Edge infrastructure for manifests, blog auth, and caching.

**Status:** Development complete, deployment pending.

- [ ] **Production Deploy**
  - [ ] Add secrets to GitHub (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
  - [ ] Create KV namespaces (`MCCAL_KV`, `MCCAL_KV_PREVIEW`)
  - [ ] Deploy Worker and verify endpoints
  - [ ] Test: webhook purge, blog auth, rate limiting, cache stats
- [ ] **Integration**
  - [ ] Point Vite site to production Worker URL
  - [ ] Configure blog widget to use production endpoints
  - [ ] Monitor cache hit rates and error logs

---

## 🎥 Video Portfolio (`src/widgets/video-portfolio/`)

Experimental video showcase widget. Currently v0.1 scaffold.

- [ ] **Manifest Generator** - Build pipeline for `video-manifest.json`
- [ ] **Data Flow** - Connect to external sources (YouTube, Vimeo, MP4)
- [ ] **Phase 2 Features** - WebVTT transcripts, adaptive bitrate (HLS/DASH)
- [ ] **Production Scope** - Decide if this becomes a full surface or stays experimental

---

## 🧹 Repository Maintenance

Ongoing housekeeping and modernizations.

### Q2 2026

- [ ] **Node.js Upgrade** - 20.15.1 → 20.19+ LTS (or 22.x LTS)
- [ ] **ESLint 9 Migration** - Flat config format (audit done, implementation pending)
- [ ] **Dependency Refresh** - Run `npm audit fix` and update dev dependencies

### Repository Audit - April 2026

Comprehensive audit completed 2026-04-05. Full report at `AUDIT-REPORT-2026-04-05.md`.

### 🔴 HIGH Priority (Do First)

#### Part 1: Script Reorganization (Biggest Pain Point)
- [ ] **Reorganize 109 npm scripts** → ~35 grouped scripts
  - [ ] Create new meta-scripts: `dev`, `dev:api`, `manifest`, `optimize`, `quality:check`
  - [ ] Consolidate manifest scripts: `manifest:concert`, `manifest:events`, etc. → `manifest:TYPE` pattern
  - [ ] Consolidate optimize scripts: `optimize:concert`, `optimize:portrait`, etc. → `optimize:TYPE` pattern
  - [ ] Add deprecation warnings to old scripts (Option C - hybrid approach)
  - [ ] Update README scripts reference section
  - [ ] Update `docs/standards/README-STANDARDS.md` with new script patterns

#### Part 2: Dependency Updates
- [ ] **Node.js 18 → 20** (or 22 LTS)
  - [ ] Update `package.json` engines field
  - [ ] Update `.github/workflows/` Node version matrix
  - [ ] Test Docker builds with new Node version
  - [ ] Update `Dockerfile.api` base image
- [ ] **React 18 → 19** (deferred from 2025 cleanup)
  - [ ] Update `sites/mcc-cal-vite/package.json`
  - [ ] Test all components for breaking changes
  - [ ] Update TypeScript types
- [ ] **Vite 6 → 7** when stable
  - [ ] Check breaking changes in migration guide
  - [ ] Test build pipeline

#### Part 3: Code Quality
- [ ] **Fix 11 ESLint warnings**
  - [ ] Run `npm run lint` to see specific issues
  - [ ] Likely unused variables in `scripts/utils/`
  - [ ] Add `_` prefix to intentionally unused params

#### Part 4: Security Hardening
- [ ] **Add `npm audit` to CI**
  - [ ] Update `.github/workflows/nightly-smoke-test.yml`
  - [ ] Add step: `npm audit --audit-level=moderate`
  - [ ] Set to not fail build (informational only)
- [ ] **Add CodeQL security analysis**
  - [ ] Create `.github/workflows/codeql-analysis.yml`
  - [ ] Enable in repo settings → Security → Code scanning
- [ ] **Verify .env not committed to root**
  - [ ] Run: `git ls-files | grep -E '^\.env' || echo "OK"`
  - [ ] Add to `.gitignore` if missing
- [ ] **Verify pre-commit hooks active**
  - [ ] Run: `cat .git/hooks/pre-commit | head -5`
  - [ ] Should see husky/lint-staged reference

### 🟡 MEDIUM Priority (This Month)

#### Part 5: Documentation
- [ ] **Add 5 missing README sections**
  - [ ] Security Policy reference (template in `docs/README-MISSING-SECTIONS-TEMPLATES.md`)
  - [ ] Changelog link with recent highlights
  - [ ] Architecture diagram (Mermaid)
  - [ ] Performance benchmarks table
  - [ ] Browser support matrix
- [ ] **Create widget catalog index**
  - [ ] Central index of all 24 active widgets
  - [ ] Link to individual widget READMEs
  - [ ] Add to `docs/widgets/WIDGET-CATALOG.md`

#### Part 6: CI/CD Improvements
- [ ] **Add dependency update bot**
  - [ ] Enable Dependabot in repo settings
  - [ ] Or add Renovate config
  - [ ] Set to weekly updates, auto-merge patch versions
- [ ] **Add test coverage reporting**
  - [ ] Configure Playwright for coverage
  - [ ] Upload to Codecov or similar

#### Part 7: Performance
- [ ] **Add bundle analyzer**
  - [ ] Install `rollup-plugin-visualizer`
  - [ ] Add script: `npm run analyze`
  - [ ] Run and identify bloat
- [ ] **Configure code splitting**
  - [ ] Add `@vitejs/plugin-legacy` for old browsers
  - [ ] Configure dynamic imports for heavy components
  - [ ] Verify React.lazy() working for all routes
- [ ] **Add preloading for critical assets**
  - [ ] Preload main CSS
  - [ ] Preload hero image
  - [ ] Add `rel="preload"` hints

### 🟢 LOW Priority (Backlog)

#### Part 8: Architecture Cleanup
- [ ] **Review 290 archived widgets**
  - [ ] Check `src/widgets/_archived/` for permanent deletion candidates
  - [ ] Anything >2 years old likely safe to delete
  - [ ] Keep git history, just remove from working tree
- [ ] **Clean up empty directories**
  - [ ] `src/site/` - verify empty, then remove
  - [ ] `src/pages/` - verify empty, then remove
  - [ ] Check others with: `find src -type d -empty`
- [ ] **Document widget deprecation process**
  - [ ] Add to `docs/standards/WIDGET-STANDARDS.md`
  - [ ] Define lifecycle: active → deprecated → archived → deleted

#### Documentation Maintenance
- [ ] **Add "Last Updated" dates to key docs**
  - [ ] Top of each standards doc
  - [ ] Auto-update via script or manual
- [ ] **Consolidate integration docs**
  - [ ] `docs/integrations/` has 14 files - review for duplicates
  - [ ] Merge related guides (e.g., all Squarespace docs)

### 📊 Audit Summary

| Part | Grade | Status | Key Action |
|------|-------|--------|------------|
| 1. Structure | B+ | 🔴 Needs work | Script reorganization |
| 2. Dependencies | B | 🟡 Watch | Node 20 upgrade |
| 3. Code Quality | B+ | 🟢 Good | 11 ESLint fixes |
| 4. Security | A- | 🟢 Good | Add npm audit to CI |
| 5. Documentation | A | 🟢 Good | 5 README sections |
| 6. CI/CD | A | 🟢 Good | Add dependency bot |
| 7. Performance | B | 🟡 Watch | Bundle analyzer |
| 8. Architecture | B+ | 🟡 Watch | Clean archived widgets |
| **Overall** | **A-** | **🟢 Production Ready** | Minor improvements only |

### Standards & Documentation

---

## Future Tracks (Unscheduled)

Ideas and longer-term initiatives. Not prioritized.

### Possible New Widgets

- [ ] Services showcase (categorized work overview)
- [ ] Event calendar (Google Calendar integration)
- [ ] FAQ accordion

### Platform Ideas

- [ ] AI-powered image alt-text generation
- [ ] Real-time analytics dashboard
- [ ] A/B testing framework for widget variations

---

## 📊 Quick Stats

| Area | Status | Count |
|------|--------|-------|
| Vite Site | Active dev | React 18, Vite 6, TypeScript 5.6 |
| Widgets | Maintained | 24 widgets, 2 active versions each |
| API | Deploy pending | Cloudflare Worker, KV storage |
| Docs | Current | 109 docs in `docs/` |

---

*This file is maintained manually. Move completed items to `completed.md`.*
