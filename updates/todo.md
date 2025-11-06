# Widget Enhancement To-Do (October–November 2025)

*Updated: November 3, 2025*

Reference standards:
- `docs/standards/preflight-afterflight.md`
- `docs/standards/widget-standards.md`
- `docs/standards/widget-development.md`
- `docs/standards/performance-standards.md`
- `docs/standards/image-seo-standards.md`

## Status Overview
- **Portfolio widgets**: Production-ready set — Concert (v4.7 refinements), Photojournalism (v5.x), Event Portfolio (v2.6.0+), Portrait (v1.0)
- **Podcast widget**: Complete (v1.9.5 with RSS auto-hydration)
- **Navigation widget**: Complete (v1.6.3/v1.7.0 with improvements)
- **Footer widget**: Complete (v1.2.0 compliance)
- **About page widget**: Complete (v1.4.4 with updated bio and contact)
- **Policies & Legal**: Hotfix applied and validated (v1.0.0)
- **Manifests & CI**: Manifest generation, watchers, and CI automation implemented and validated

## ✅ RECENT COMPLETIONS
- [x] **Portrait Portfolio v1.0** — Portrait photography widget (vertical-focused, 3:4, performance & SEO) — added to Available Widgets and sample manifest (Oct 24, 2025)
- [x] **Concert Portfolio v4.7 (refinement)** — deduplicated artist list, Spotify support improvements, interaction safety and performance polish (Nov 2, 2025)
- [x] **Policies & Legal v1.0.0** — hotfix for stray comment closure and validated (Nov 2, 2025)
- [x] **Manifest & CI Automation** — robust manifest generation scripts, watch processes, CI workflows for concert/events/journalism, retry/validation/rollback logic (Oct 5–Nov 2, 2025)
- [x] **Preflight & Workspace Validation** — AI preflight checks added and used (`npm run ai:preflight:short`) and related tasks wired (Oct 4–Oct 6, 2025)
- [x] **Podcast Feed v1.9.5** — RSS auto-hydration, caching, branding updates (Oct 24, 2025)
- [x] **Photojournalism v5.x** — filter buttons, shuffle, adjacency minimization, lightbox fixes (Oct 5–Oct 9, 2025)
- [x] **About Page v1.4.4** — bio update, contact/Calendly integration (Oct 24, 2025)
- [x] **Site Footer v1.2.0** — accessibility and standards compliance (Oct 5, 2025)

## 📍 CURRENT STATE (Ready for Next Batch)
- Production-ready widgets have been added to `Available Widgets` and most have sample manifests.
- Manifest generation, watchers, and CI are in place for automated manifest updates and validation.
- Scripts and workspace reorganization completed: `scripts/` cleaned, archived helpers moved to `scripts/_archived/`.
- Local dev/test site (`src/site/`) and widget preview workflow are working; use `npm run dev` to preview.
- Next steps: targeted testing in Squarespace, add a small automated test harness for widgets, and finalize remaining TODOs below.

## Completed Items (Mark as Done)
- [x] Podcast Feed v1.9.5: Auto-hydrating RSS episodes, live RSS caching, updated branding (Oct 24, 2025)
- [x] Site Navigation enhancements: Glassmorphism, hover states, mobile drawer, close button optimization (Oct 9, 2025)
- [x] Photojournalism Portfolio v5.x: Glass filter buttons, Fisher-Yates shuffle, adjacency minimization, lightbox fixes (Oct 5–Oct 9, 2025)
- [x] About Page v1.4.4: Updated bio, contact dropdown, Calendly integration (Oct 8, 2025)
- [x] Concert Portfolio v4.6→v4.7: Performance work + v4.7 refinements (Oct 6–Nov 2, 2025)
- [x] Site Footer v1.2.0: Compliance with standards, accessibility improvements (Oct 5, 2025)
- [x] Portrait Portfolio v1.0: New portrait photography widget with vertical composition focus, 3:4 aspect ratios, and enhanced detail viewing (Oct 24, 2025)

## Remaining / In-Progress Items
- [x] Run `npm run ai:preflight:short` — added and used during the recent sessions
- [ ] Confirm planned changes align with `docs/standards/widget-standards.md` and `widget-development.md` before editing remaining widgets
- [ ] Add automated widget validation (small unit/integration tests) and wire into CI
- [ ] Update `.github/copilot-instructions.md`, `CHANGELOG.md`, and docs when making further structural changes
- [ ] Concert Portfolio additional Spotify/embed features (follow-up enhancement)

## Performance & SEO Enhancements (Priority)
- [ ] Implement comprehensive SEO standards across all widgets: structured data, enhanced alt text, meta descriptions (partially implemented in recent updates)
- [ ] Audit and optimize Lighthouse performance metrics (FCP/LCP/TBT) for all portfolio widgets
- [ ] Add responsive image optimization (WebP/AVIF formats, lazy loading) to remaining widgets
- [ ] Implement aggressive caching strategies for widget-delivered assets
- [ ] Add accessibility improvements: ARIA labels, keyboard navigation, screen reader support
- [ ] Create performance monitoring dashboard widget for real-time metrics tracking

## New Widget Development Ideas
- [x] **Portrait Portfolio Widget**: COMPLETED v1.0 - Portrait photography showcase with vertical compositions (Oct 24, 2025)
- [ ] TODO: Develop Testimonials/Reviews widget with star ratings and client quotes
- [ ] TODO: Create Contact Form widget with validation and spam protection
- [ ] TODO: Build Newsletter Signup widget with Mailchimp/ConvertKit integration
- [ ] TODO: Design Services/Portfolio showcase widget for different work categories
- [ ] TODO: Implement Blog Post preview widget with RSS feed integration
- [ ] TODO: Create Social Media feed aggregator widget
- [ ] TODO: Develop Event calendar/scheduling widget with Google Calendar integration
- [ ] TODO: Build Interactive FAQ accordion widget
- [ ] TODO: Create Video portfolio/gallery widget for multimedia content

## Maintenance & Infrastructure
- [ ] Update `scripts/utils/ai-instructions-preflight.js` to reflect completed enhancements (follow-up)
- [ ] Consolidate and update all widget README files with current versions and features
- [ ] Create comprehensive widget testing suite with automated validation and wire to CI
- [ ] Implement version control system / release process for widget deployments to Squarespace
- [ ] Add automated performance regression testing for all widgets
- [ ] Create widget documentation site or comprehensive guide
- [ ] Implement dark mode support across all widgets
- [ ] Add internationalization (i18n) support for multi-language sites

## Advanced Features & Integrations
- [ ] TODO: Integrate AI-powered image alt-text generation for accessibility
- [ ] TODO: Add real-time analytics and user interaction tracking
- [ ] TODO: Implement progressive web app (PWA) features for offline viewing
- [ ] TODO: Create admin dashboard for content management and widget configuration
- [ ] TODO: Add A/B testing framework for widget variations
- [ ] TODO: Implement advanced filtering and search capabilities for portfolio widgets
- [ ] TODO: Create widget customization API for client-specific branding
- [ ] TODO: Add automated backup and recovery system for widget configurations


## Documentation & Standards Updates
- [ ] Update `docs/standards/widget-standards.md` with new patterns and best practices
- [ ] Create case studies documenting performance improvements and SEO gains
- [ ] Develop widget development tutorial series for future contributors
- [ ] Update workspace organization standards to reflect current structure
- [ ] Create comprehensive changelog system for all widget versions
- [ ] Document integration patterns for third-party services (RSS, calendars, etc.)

- [x] TODO: Run repository audit and follow-up housekeeping (2025-11-04)
		- Audit file: `docs/audit/REPO-AUDIT-2025-11-04.md`
		- Large-file report: `docs/audit/reports/large-files-2025-11-04.txt`
		- npm audit: `docs/audit/reports/npm-audit-2025-11-04.json`
	- Added `.gitattributes`, `CONTRIBUTING.md`, and `CODEOWNERS`

## Planned: Widgets grouping (phased; paused)

We will group widgets without creating overly nested folders. This plan is logged now and will be executed gradually.

- [x] TODO: Add widgets-manifest generator and run initial manifest (2025-11-05)
- [x] TODO: Create group folders under `src/widgets/{portfolios,site,components}` (no moves yet)
- [x] TODO: Map each widget to a group using `src/widgets/widgets-manifest.json`
- [x] TODO: Phase 1 — Move site widgets (nav, footer, hero) into `src/widgets/site/` and validate (2025-11-05)
- [x] TODO: Phase 2 — Move content/tool widgets into `src/widgets/{content,tools}/` and validate (2025-11-05)
- [ ] TODO: Phase 3 — Move shared components into `src/widgets/components/` where applicable
- [x] TODO: Update generator to include `group` field and refresh docs/README (2025-11-05)
- [ ] TODO: CI/test guard — ensure validator/tests catch broken embed paths after moves

_Last updated: 2025-11-05_
