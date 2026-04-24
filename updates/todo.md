# Active To-Do List

Last Updated: April 24, 2026

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks  
- See [welcome.md](./welcome.md) for today's dashboard  
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

---

## 🚀 Active Tasks (April 2026)

### High Priority

- [x] **Script Reorganization** - Reduced 64 npm scripts to 47 (COMPLETED April 24, 2026)
  - Root package.json: 43 → 33 scripts (removed duplicates and rarely used commands)
  - Vite package.json: 16 → 10 scripts (removed predev:vercel, validate:manifests, build:fast, analyze, test:coverage, test:run)
  - Admin package.json: 5 → 4 scripts (removed dev:vercel)
  - Removed: api, api:refresh, manifest:dry, manifest:blog:build, manifest:all:build, blog:generate, watch:all, organize:preview, lint:scripts, test:e2e:ci, repo:analyze
- [ ] **Node.js Upgrade** - 20.15.1 → 20.19+ LTS (or 22.x LTS)
  - Update `package.json` engines field
  - Update GitHub Actions Node version matrix
  - Test Docker builds with new Node version
  - Update `Dockerfile.api` base image

### Medium Priority

- [x] **SEO Enhancements** - Open Graph, canonical URLs, article schema, XML sitemap, event schema
  - Add Open Graph images for all portfolio pages (COMPLETED - images copied to public-vite/images/)
  - Implement canonical URLs across all pages (ALREADY IMPLEMENTED)
  - Add Article structured data to blog posts (ALREADY IMPLEMENTED)
  - Create XML sitemap for better search engine indexing (ALREADY IMPLEMENTED)
  - Add schema.org for events (concerts, scheduling) (INFRASTRUCTURE ADDED)
- [ ] **Cloudflare Worker Production Deploy**
  - Add secrets to GitHub (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
  - Create KV namespaces (`MCCAL_KV`, `MCCAL_KV_PREVIEW`)
  - Deploy Worker and verify endpoints
  - Test: webhook purge, blog auth, rate limiting, cache stats
  - Point Vite site to production Worker URL
- [ ] **React 18 → 19 Upgrade**
  - Update `sites/mcc-cal-vite/package.json`
  - Test all components for breaking changes
  - Update TypeScript types
- [ ] **Widget Empty State Resilience**
  - Concert Portfolio - Empty state when no shows
  - Photojournalism Portfolio - Empty state
  - Blog Feed - Search debouncing (300ms)
- [ ] **Documentation Improvements**
  - Add 5 missing README sections to main README
  - Create widget catalog index
  - Add "Last Updated" dates to key docs
  - Consolidate integration docs (14 files in `docs/integrations/`)

### Low Priority

- [ ] **Code Quality Improvements**
  - Remove 3 console.log statements from production code (useAPI.ts, changelogTracker.ts, ErrorBoundary.tsx)
  - Replace 2 TypeScript `any` types with proper types (manifestLoader.ts, api-test.tsx)
  - Clean up TODO/FIXME comments in scripts (generate-events-manifest.js, archived scripts)
- [ ] **ESLint 9 Migration** - Flat config format
- [ ] **Dependency Refresh** - Run `npm audit fix` and update dev dependencies
- [ ] **Fix 11 ESLint warnings** - Run `npm run lint` to see specific issues
- [ ] **Add `npm audit` to CI** - Informational security scanning
- [ ] **Add CodeQL security analysis** - GitHub Actions workflow
- [ ] **Add dependency update bot** - Dependabot or Renovate
- [ ] **Add bundle analyzer** - `rollup-plugin-visualizer` for optimization
- [ ] **Video Portfolio** - Experimental v0.1 scaffold
  - Manifest generator for `video-manifest.json`
  - Data flow from external sources (YouTube, Vimeo, MP4)
- [ ] **Architecture Cleanup**
  - Review 290 archived widgets for permanent deletion
  - Clean up empty directories
  - Document widget deprecation process

---

## 📊 Quick Stats

| Area | Status | Count |
|------|--------|-------|
| Vite Site | Production | React 18, Vite 6, TypeScript 5.6 |
| Widgets | Maintained | 24 widgets, 2 active versions each |
| API | Deploy pending | Cloudflare Worker, KV storage |
| Docs | Current | 109 docs in `docs/` |

---

*Recently completed (April 24, 2026): Client Carousel dynamic logo track, CSS-by-Feature refactoring, SEO JSON-LD enhancements, Bundle analysis, E2E tests. See [completed.md](./completed.md) for full history.*
