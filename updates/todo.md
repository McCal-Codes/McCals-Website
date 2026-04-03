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

**Current Sprint:**
- [ ] **Component Decomposition** - Break up large components:
  - `blog.tsx` (~650 lines) → `BlogList.tsx`, `BlogPost.tsx`, `BlogCard.tsx`, `useBlogData.ts`
  - `podcast.tsx` (~550 lines) → `EpisodeList.tsx`, `AudioPlayer.tsx`, `usePodcastFeed.ts`
- [ ] **Migrate to Barrel Imports** - Update imports to use `@/components` pattern
- [ ] **Add React Query/TanStack Query** - Replace manual `useEffect` data fetching

**Next Up:**
- [ ] **CSS-by-Feature** - Move styles adjacent to components (co-location)
- [ ] **Bundle Analysis** - Run `vite-bundle-visualizer` to identify optimization targets
- [ ] **Add E2E Tests** - Playwright coverage for critical user flows

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

### Standards & Documentation

- [ ] **Widget README Refresh** - Update all widget READMEs with current versions
- [ ] **CHANGELOG.md Sync** - Ensure all recent changes documented
- [ ] **Copilot Instructions** - Update `.github/copilot-instructions.md` with latest patterns

---

## � Future Tracks (Unscheduled)

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
