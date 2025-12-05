# Widget Enhancement To-Do (October–November 2025)

*Updated: December 5, 2025*

Reference standards:
- `docs/standards/preflight-afterflight.md`
- `docs/standards/widget-standards.md`
- `docs/standards/widget-development.md`
- `docs/standards/performance-standards.md`
- `docs/standards/image-seo-standards.md`
- `docs/integrations/api-integration-guide.md`

---

## 📋 Combined To-Do List

### Website Improvements (from Review)

#### AI & VS Code: New Features (Nov 15, 2025)

**TL;DR**: The new update basically turns VS Code into a cockpit for AI-driven development, gives you more control over what agents and tools do on your machine, and smooths out everyday coding tasks like terminal autocomplete and branch comparisons. You can actually use these features right now to streamline your workflow.

**Focus areas you can action today:**
- Agent HQ — observe and control agent sessions without giving up autonomy
- Security & Trust — lock down tool approvals and local access
- Coding QoL — terminal IntelliSense, inline terminals, branch/tag comparisons

**Steps you can try immediately:**

1. **Explore the Agent Sessions dashboard**
   - How to use: View → Agent Sessions. Run a Copilot chat or agent task and watch each session appear. Switch, filter, or pause sessions as needed.
   - Why it matters: keeps AI work visible and lets you review planned changes before files are edited.
   - Quick test: Open Copilot Chat → ask "refactor this file" and watch the session appear.

2. **Try the Planning Agent**
   - In Copilot Chat type: `@planner Generate a step-by-step plan for adding error handling to this function.`
   - Outcome: receives a structured, editable plan you can hand off or reject.

3. **Experiment with custom agents (`.agents.md`)**
   - Create a `.agents.md` in the repo and define name, description, allowed tools, and rules.
   - Example agents: "Press-Release Editor", "Metadata Organizer", "Git Hygiene".
   - Trade-off: fast wins but requires thinking through permissions and handoffs.

4. **Inline terminals in chat**
   - Run commands from Copilot Chat and see terminal output inline in the chat thread.
   - Useful for quick installs, one-liners, and git checks while keeping the audit trail in chat.

5. **Lock down your Tool Approvals (recommended first step)**
   - Settings → AI Tools → Approvals → Toggle "Ask before running tools".
   - This gives you editorial veto over any tool runs and local file access.

6. **Test terminal IntelliSense**
   - Try: `git ch` → completes to `checkout`; `ls --` → shows flags; `npm ru` → suggests scripts.

7. **Use branch/tag comparisons inside Source Control**
   - Source Control → … menu → Compare Branches or Compare Tags for instant side-by-side diffs.

**Alternatives & trade-offs:**
- Speed-first: use Agent Sessions dashboard, terminal IntelliSense, and branch compare for immediate gains (low setup).
- Robust: configure Planning Agent, `.agents.md`, and tool approvals for safer, repeatable automation (takes ~1 hour).

**Quick fixes / recommended immediate action:**
- [ ] TODO: Turn on tool approvals so you keep control while testing AI features (Settings → AI Tools → Approvals).
- [x] TODO: Add a sample `.agents.md` template at the repo root to demonstrate a safe Planning Agent and a Git Hygiene agent. (added Nov 15, 2025)

**Next:** Once you try a few of these, I can help you set up a custom agent aligned with your workflows (photojournalism automator, metadata preprocessor, writing editor).

---

## Status Overview
- **Portfolio widgets**: Production-ready set — [Concert](../src/widgets/concert-portfolio/) (v4.7 refinements), [Photojournalism](../src/widgets/photojournalism-portfolio/) (v5.x), [Event Portfolio](../src/widgets/event-portfolio/) (v2.6.0+), [Portrait](../src/widgets/portrait-portfolio/) (v1.0)
- **Podcast widget**: Complete — [Podcast Feed](../src/widgets/podcast-feed/) (v1.9.5 with RSS auto-hydration)
- **Navigation widget**: Complete — [Site Navigation](../src/widgets/site-navigation/) (v1.6.3/v1.7.0 with improvements)
- **Footer widget**: Complete — [Site Footer](../src/widgets/site-footer/) (v1.2.0 compliance)
- **About page widget**: Complete — [About](../src/widgets/about/) (v1.4.4 with updated bio and contact)
- **Policies & Legal**: Hotfix applied and validated — [Policies & Legal](../src/widgets/policies-legal/) (v1.0.0)
- **Accessibility Statement**: Complete — [Accessibility Statement](../src/widgets/accessibility-statement/) (v1.1.x)
- **Manifests & CI**: Manifest generation, watchers, and CI automation implemented and validated

## ✅ RECENT COMPLETIONS
- [x] **Cloudflare Integration** — Added edge caching, webhook purge/warm endpoints, rate limiting, cache stats, and CI integration for automatic cache refresh after manifest publish (Dec 5, 2025)
- [x] **Accessibility Statement Widget v1.1.x** — Added theme toggle (System/Light/Dark), readable panel with adaptive backdrop, localStorage persistence, full keyboard accessibility, WCAG AA contrast verified (Nov 11, 2025)
- [x] **Policies & Legal Widget v1.1.0** — Accessibility enhancements: skip link, unified focus-visible, scroll spy with aria-current, mobile drawer improvements, reduced motion support, print stylesheet refinement (Nov 11, 2025)
- [x] **Portrait Portfolio v1.0** — Portrait photography widget (vertical-focused, 3:4, performance & SEO) — added to Available Widgets and sample manifest (Oct 24, 2025)
- [x] **Concert Portfolio v4.7 (refinement)** — deduplicated artist list, Spotify support improvements, interaction safety and performance polish (Nov 2, 2025)
- [x] **Manifest & CI Automation** — robust manifest generation scripts, watch processes, CI workflows for concert/events/journalism, retry/validation/rollback logic (Oct 5–Nov 2, 2025)
- [x] **Preflight & Workspace Validation** — AI preflight checks added and used (`npm run ai:preflight:short`) and related tasks wired (Oct 4–Oct 6, 2025)
- [x] **Podcast Feed v1.9.5** — RSS auto-hydration, caching, branding updates (Oct 24, 2025)
- [x] **Photojournalism v5.x** — filter buttons, shuffle, adjacency minimization, lightbox fixes (Oct 5–Oct 9, 2025)
- [x] **About Page v1.4.4** — bio update, contact/Calendly integration (Oct 24, 2025)
- [x] **Site Footer v1.2.0** — accessibility and standards compliance (Oct 5, 2025)

## 📍 CURRENT STATE (Ready for Next Batch)

## Completed Items (Mark as Done)
- [ ] TODO: Create Next.js self-hosted site structure under sites/self-hosted-nextjs/
- [ ] TODO: Add Layout, Nav, and Footer components with "Self-Hosted" branding
- [ ] TODO: Implement ConcertWidget (manifest typing, fetch, gallery, lightbox, CSS module)
- [ ] TODO: Add stubs for FeaturedWidget, EventWidget, JournalismWidget
- [ ] TODO: Add manifest loader utility and manifest types
- [ ] TODO: Add minimal pages for all routes
- [ ] TODO: Add CSS modules for visual parity
- [ ] TODO: Document all TODOs in updates/todo.md for traceability
- [x] About Page v1.4.4: Updated bio, contact dropdown, Calendly integration (Oct 8, 2025)
- [x] Concert Portfolio v4.6→v4.7: Performance work + v4.7 refinements (Oct 6–Nov 2, 2025)
- [x] Site Footer v1.2.0: Compliance with standards, accessibility improvements (Oct 5, 2025)
- [x] Portrait Portfolio v1.0: New portrait photography widget with vertical composition focus, 3:4 aspect ratios, and enhanced detail viewing (Oct 24, 2025)

## Remaining / In-Progress Items
**Next.js Migration (Self-Hosted Site)**
- [x] TODO: Next.js Footer (v1.3.0 parity) — wire the real newsletter subscription endpoint and adjust JSON-LD logo URL to the app's public assets path. Track status in `sites/self-hosted-nextjs/components/Layout/Footer.tsx`. (Added 2025-12-01; Completed 2025-12-05)
	- Added Organization JSON-LD structured data injection via Next.js Head
	- Newsletter form now uses env-configurable NEXT_PUBLIC_NEWSLETTER_ENDPOINT (default: Mailchimp)
	- Logo URL now uses SITE_URL + /brand/logo-mark.svg from public/ directory
	- Added logo-mark.svg asset to sites/self-hosted-nextjs/public/brand/
**Phase 1 — Legacy Version Archival (Planning & Scaffolding)** ✅ COMPLETE
- [x] TODO: Define archival policy and shadow workflow validation (completed per workspace standards and Recent Updates).
- [x] TODO: Document policy in `docs/standards/workspace-organization.md` and `.github/copilot-instructions.md` (completed).
- [x] TODO: Add archive index scaffolds (INDEX.json templates) for `concert`, `photojournalism`, and `featured` under `src/widgets/_archived/Legacy Widgets/<widget>/versions/` (Phase 1 scaffolding; no file moves yet).
- [x] TODO: Add CI scan script (dry-run) to report active vs legacy counts per widget without failing builds; prepare for Phase 2 enforcement.

**Phase 2 — Legacy Version Physical Relocation** ✅ COMPLETE
- [x] TODO: Physically relocated 60+ legacy widget version files to `src/widgets/_archived/Legacy Widgets/<widget>/versions/` (completed Dec 1, 2025).
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
- [x] TODO: Validated all widgets now comply with ≤2 active versions policy (scanner confirmed 100% compliance).
- [x] TODO: Updated widget READMEs with standardized version sections and archive links (completed Dec 1, 2025).
	- Standardized 10 widget READMEs with "Active Versions (≤2 Policy)" and "Legacy Versions (Archived)" sections
	- Added proper archive links to INDEX.json for all widgets with archived versions
	- Consistent format: current version, previous stable, archive location, version count
- [x] TODO: HTML validator enhancements — fixed to accept snippet-style widgets (Dec 1, 2025).
	- Added skip logic for _archived directories
	- Enhanced validation to recognize HTML snippets (semantic tags + content)
	- Achieved 100% pass rate (78/78 files valid)
- [x] TODO: Created CI workflow to enforce ≤2 active versions policy (`.github/workflows/widget-version-policy.yml`).

**Domain Update — mcc-cal.com**
- [x] TODO: Update schema/links in archive indexes (completed for INDEX.json templates).
- [ ] TODO: Audit remaining `mccal.media` references and update to `mcc-cal.com` where appropriate:
	- Found 10 references across widgets and docs (grep search completed Dec 1, 2025):
		- Instagram social URL: `mccal.media` (keep as social handle)
		- Email addresses: `contact@mccal.media` (determine if keeping or updating)
		- Documentation references in archived content
	- **Note**: Keep brand/social handles (e.g., instagram.com/mccal.media) unchanged
	- Update only site-root URLs and schema references to mcc-cal.com
	- Confirm newsletter and social links remain correct per current branding

- [x] Run `npm run ai:preflight:short` — added and used during the recent sessions
- [ ] TODO: Phase 2 — Review orphan scripts (`scripts/utils/generate-cdn-snippets.js`, `scripts/utils/auto-check-todo.js`, `scripts/utils/date-overrides.js`, `scripts/utils/find-latest-widget-versions.js`, `scripts/utils/shared-date-parsing.js`, `scripts/watchers/auto-manifest-updater.js`) and either archive to `scripts/_archived/` or integrate/document usage. Produce summary in `docs/CHANGELOG.md`.
- [ ] TODO: Add CI job to enforce active/legacy widget version policy (fail if >2 active versions present in a live widget directory).
- [ ] TODO: Draft a repository-wide improvement plan (README/CONTRIBUTING/code of conduct refresh, semantic HTML/accessibility audit, CSS/JS modernization, performance/resource-hint checklist, CI + templates) so contributors have a clear, best-practice roadmap. **Draft created; quick-win docs/CoC/gitignore updates completed** — see [`docs/repo-improvement-plan.md`](../docs/repo-improvement-plan.md) for phased priorities.
- [ ] Confirm planned changes align with `docs/standards/widget-standards.md` and `widget-development.md` before editing remaining widgets
- [ ] Add automated widget validation (small unit/integration tests) and wire into CI
- [ ] Update `.github/copilot-instructions.md`, `CHANGELOG.md`, and docs when making further structural changes
- [ ] Concert Portfolio additional Spotify/embed features (follow-up enhancement)
 - [ ] TODO: Concert manifest workflow secret lint warnings — evaluate if GitHub Actions runtime succeeds despite local YAML linter "Context access might be invalid" notices. If harmless, document acceptance in workflow comment; else create wrapper step exporting secrets to $GITHUB_ENV only when set. (Added 2025-11-27)
 - [ ] TODO: Reduce remaining secret lint warnings — consolidated by removing env secret blocks from portfolio workflows (Nov 27). Only `build-manifest.yml` still references secrets directly for concert webhook. Evaluate creating reusable `workflow_call` webhook dispatcher to isolate secret usage to one file; optional if warnings remain distracting. (Added 2025-11-27)
 - [ ] TODO: Add site-wide shared CSS at `src/widgets/_shared/site-widgets.css` (README, CDN snippet, and minimal tests). Ensure widgets keep local fallbacks and document opt-out.
 - [ ] TODO: Add accessibility audit notes and automation
	- Run axe-core (Playwright/Firefox) against widget pages and save reports to `reports/axe-firefox-results.json` and `reports/axe-firefox-widget-report.html`.
	- Document findings in `reports/axe-firefox-summary.md` and add CI automation so widget audits run on staging updates.
	- (Logged: 2025-11-11) A focused axe run was executed locally and results saved at `reports/axe-firefox-results.json` — consider adding as a scheduled CI job.

- TODO: Integrate and document `git-hygiene` agent
	- [x] Added `scripts/agents/git-hygiene.sh` (runs git status, lint, tests)
	- [x] Enhanced `.agents.md` with `git-hygiene` `run_command` and notes
	- [x] Added `docs/agents/git-hygiene.md` with usage and CI hints
	- [x] Added `lint` and `test` scripts to `package.json` for eslint and playwright (Nov 15, 2025)
	- [x] Created GitHub Action workflow `.github/workflows/agent-checks.yml` to run on PRs and comment with results (Nov 15, 2025)

- TODO: Integrate and document `reorganizing-agent`
	- [x] Added `scripts/agents/reorganize-check.sh` (scans for workspace organization violations)
	- [x] Enhanced `.agents.md` with `reorganizing-agent` entry, run_command, and notes
	- [x] Added `docs/agents/reorganizing-agent.md` with usage and CI hints
	- [x] Implemented `--fix` mode with JSON-based approved moves and safety checks (requires jq) (Nov 15, 2025)
	- [x] Updated documentation with `--fix` mode usage, JSON format, and safety notes (Nov 15, 2025)
	- [x] Included in GitHub Action workflow to run on PRs (Nov 15, 2025)

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
 - [x] TODO: Create Video portfolio/gallery widget for multimedia content — v0.1 scaffold added (directory, README, CHANGELOG, initial self-contained HTML)
	 - [x] Scaffold widget directory `src/widgets/video-portfolio/` with `versions/v0.1-video-portfolio.html`
	 - [x] Inline dataset (Phase 1) with mixed sources (mp4/youtube/vimeo) and accessible posters
	 - [x] Filtering (auto-generated tags) and lazy thumbnail loading
	 - [x] Accessible lightbox/player (focus trap, keyboard media controls, Escape close)
	 - [x] Basic structured data (VideoObject ItemList)
	 - [ ] TODO: Add transcripts & captions panel (WebVTT ingest + transcript export) — Phase 2
	 - [ ] TODO: Implement manifest generator `scripts/manifest/generate-video-manifest.js` and aggregated `video-manifest.json`
	 - [ ] TODO: Add adaptive bitrate streaming (HLS/DASH) with quality selector + fallback to MP4
	 - [ ] TODO: Add debug panel metrics (`window.videoPortfolioAPI.getMetrics()`) & performance logging
	 - [ ] TODO: Integrate axe-core accessibility audit into CI for video widget
	 - [ ] TODO: Add CI rule enforcing ≤2 active versions (archive future legacy versions)
	 - [ ] TODO: Add structured data validator & Lighthouse automation snapshot for regression prevention

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
 - [ ] TODO: Event Portfolio manifest dynamic versioning: update generator to auto-detect latest widget version (currently manual default 2.6.4 via --version / env). Add script to parse `src/widgets/event-portfolio/versions/` and supply `--version` in workflow.
 - [ ] TODO: Event Portfolio URL normalization: verify new `toUrl` encoding logic correctly loads files containing spaces & curly apostrophes; extend to fallback 404 diagnostic overlay.
 - [ ] TODO: Consolidate webp preference: implement manifest-side duplicate pairing (jpg+webp) with single logical image entry containing sources array to reduce array length.
- [ ] TODO: Add real-time analytics and user interaction tracking
- [ ] TODO: Implement progressive web app (PWA) features for offline viewing
- [ ] TODO: Create admin dashboard for content management and widget configuration
- [ ] TODO: Add A/B testing framework for widget variations
- [ ] TODO: Implement advanced filtering and search capabilities for portfolio widgets
- [ ] TODO: Create widget customization API for client-specific branding
- [ ] TODO: Add automated backup and recovery system for widget configurations


## Documentation & Standards Updates
- [x] Update `docs/standards/widget-standards.md` with new patterns and best practices (Nov 19, 2025) → Added November 2025 Addendum (archival policy, aggregated manifest, accessibility semantics, CI hooks).
- [x] Create case studies documenting performance improvements and SEO gains → `docs/case-studies/performance-seo-case-studies.md` (Concert v4.5→v4.7, Photojournalism v4.4→v5.x, Accessibility Statement, Policies & Legal).
- [x] Develop widget development tutorial series for future contributors → `docs/tutorials/widget-development/part1-4` (structure, performance, accessibility, deployment).
- [x] Update workspace organization standards to reflect current structure → Added archival + composite workflow sections in `docs/standards/workspace-organization.md`.
- [x] Create comprehensive changelog system for all widget versions → `docs/standards/widget-changelog-standard.md` (format, CI validation plan).
- [x] Document integration patterns for third-party services (RSS, calendars, etc.) → `docs/integrations/rss-integration.md`, `docs/integrations/calendar-integration.md`.

Follow-up Documentation TODOs:
- [ ] TODO: Implement CI changelog validator (`scripts/utils/validate-changelogs.js`).
- [ ] TODO: Add workflow to enforce ≤2 active widget versions (legacy archive policy).
- [ ] TODO: Add schema diff & performance snapshot automation (Lighthouse + JSON-LD validation).
- [ ] TODO: Integrate accessibility axe audit into CI (`npm run a11y:widgets`).
- [ ] TODO: Add widget registry manifest summarizing active versions and paths.

- [x] TODO: Run repository audit and follow-up housekeeping (2025-11-04)
	- Audit file: `docs/REPO-AUDIT-2025-11-04.md`
	- Large-file report: `reports/large-files-2025-11-04.txt`
	- npm audit: `reports/npm-audit-2025-11-04.json`
	- Added `.gitattributes`, `CONTRIBUTING.md`, and `CODEOWNERS`

_Last updated: 2025-12-05_
