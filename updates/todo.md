# Active To-Do List

Last Updated: May 15, 2026

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks  
- See [welcome.md](./welcome.md) for today's dashboard  
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

---

## 🚀 Active Tasks (May 2026)

### High Priority

- [x] **Script Reorganization** - Reduced 64 npm scripts to 47 (COMPLETED April 24, 2026)
  - Root package.json: 43 → 33 scripts (removed duplicates and rarely used commands)
  - Vite package.json: 16 → 11 scripts (removed stale commands; restored `test:run` for Vercel/Vitest CI parity on May 15, 2026)
  - Admin package.json: 5 → 4 scripts (removed dev:vercel)
  - Removed: api, api:refresh, manifest:dry, manifest:blog:build, manifest:all:build, blog:generate, watch:all, organize:preview, lint:scripts, test:e2e:ci, repo:analyze
- [x] **Node.js Runtime Baseline** - Active app and Vercel checks aligned to Node 20.19
  - Root `package.json` engines field requires `node >=20.19.0`
  - Vercel deployment checks use Node 20.19
  - `Dockerfile.api` uses `node:20.19-alpine`
  - Follow-up: audit legacy `config/Dockerfile`, which still uses `node:18-alpine`

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
- [x] **React 19 Upgrade for Active Vite Site**
  - `sites/mcc-cal-vite/package.json` uses React 19 and React DOM 19
  - Active Vite TypeScript types are on React 19
  - Follow-up: root package still carries React 18 tooling dependencies for non-active/legacy workflows
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
- [ ] **Fix remaining ESLint baseline** - Continue reducing current lint errors and warnings in scoped batches
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
| Vite Site | Production | React 19, Vite 6, TypeScript 5.6 |
| Widgets | Maintained | 24 widgets, 2 active versions each |
| API | Deploy pending | Cloudflare Worker, KV storage |
| Docs | Current | 109 docs in `docs/` |

---

*Recently completed (April 24, 2026): Client Carousel dynamic logo track, CSS-by-Feature refactoring, SEO JSON-LD enhancements, Bundle analysis, E2E tests. See [completed.md](./completed.md) for full history.*
