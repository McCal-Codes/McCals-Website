# Active To-Do List

*Updated: December 6, 2025*

**Quick Reference:**
- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

---

## 🎯 High Priority (Active Work)

### Authentication & Token Setup ✅ COMPLETE
- [x] Generated and documented AUTH-SETUP-GUIDE.md with complete environment variable setup (JWT_SECRET, WEBHOOK_SECRET, BLOG_AUTHORS, MANIFEST_BASE_URL, CORS_ORIGINS)
- [x] Created AUTH-TOKEN-QUICK-REFERENCE.md for fast copy-paste local development setup
- [x] Documented token generation, rotation, expiry, and security best practices
- [x] Provided troubleshooting guide for common auth issues
- [x] Added Cloudflare deployment checklist and test procedures

### Cloudflare Worker Deployment (Next Priority)
- [ ] TODO: Deploy Cloudflare Worker to production with proper environment variables (use AUTH-SETUP-GUIDE.md)
- [ ] TODO: Create KV namespaces in Cloudflare dashboard (MCCAL_KV for production, MCCAL_KV_PREVIEW for staging)
- [ ] TODO: Configure local/CI environments to point manifest generators and blog widget at deployed Worker URL
- [ ] TODO: Test end-to-end flows: manifest webhook, blog auth/posts, rate limiting, cache stats
- [ ] TODO: Monitor Worker analytics and optimize cache TTLs/rate limits based on actual traffic patterns

### Next.js Self-Hosted Site Migration
- [ ] TODO: Create Next.js self-hosted site structure under sites/self-hosted-nextjs/
- [ ] TODO: Add Layout, Nav, and Footer components with "Self-Hosted" branding
- [ ] TODO: Implement ConcertWidget (manifest typing, fetch, gallery, lightbox, CSS module)
- [ ] TODO: Add stubs for FeaturedWidget, EventWidget, JournalismWidget
- [ ] TODO: Add manifest loader utility and manifest types
- [ ] TODO: Add minimal pages for all routes
- [ ] TODO: Add CSS modules for visual parity
- [ ] TODO: Document all TODOs in updates/todo.md for traceability

---

## 🔧 Infrastructure & Maintenance

### Domain Updates
- [ ] TODO: Set up dev.mcc-cal.com subdomain for development environment:
	- Add DNS CNAME record pointing to development server (or use Cloudflare Tunnel for local dev)
	- Configure SSL/TLS certificate for dev subdomain
	- Test CORS and API integration with dev subdomain
	- Update documentation with dev subdomain usage instructions
- [ ] TODO: Audit remaining \`mccal.media\` references and update to \`mcc-cal.com\` where appropriate:
	- Found 10 references across widgets and docs (grep search completed Dec 1, 2025):
		- Instagram social URL: \`mccal.media\` (keep as social handle)
		- Email addresses: \`contact@mccal.media\` (determine if keeping or updating)
		- Documentation references in archived content
	- **Note**: Keep brand/social handles (e.g., instagram.com/mccal.media) unchanged
	- Update only site-root URLs and schema references to mcc-cal.com
	- Confirm newsletter and social links remain correct per current branding

### Scripts Organization
- [ ] TODO: Phase 2 — Review orphan scripts and either archive to \`scripts/_archived/\` or integrate/document usage:
	- \`scripts/utils/generate-cdn-snippets.js\`
	- \`scripts/utils/auto-check-todo.js\`
	- \`scripts/utils/date-overrides.js\`
	- \`scripts/utils/find-latest-widget-versions.js\`
	- \`scripts/utils/shared-date-parsing.js\`
	- \`scripts/watchers/auto-manifest-updater.js\`
	- Produce summary in \`docs/CHANGELOG.md\`

### CI/CD Improvements
- [ ] TODO: Add CI job to enforce active/legacy widget version policy (fail if >2 active versions present in a live widget directory)
- [ ] TODO: Concert manifest workflow secret lint warnings — evaluate if GitHub Actions runtime succeeds despite local YAML linter warnings
- [ ] TODO: Reduce remaining secret lint warnings — evaluate creating reusable \`workflow_call\` webhook dispatcher

### Widget Standards
- [ ] TODO: Confirm planned changes align with standards before editing remaining widgets
- [ ] TODO: Add automated widget validation (small unit/integration tests) and wire into CI
- [ ] TODO: Update copilot instructions, CHANGELOG.md, and docs when making structural changes

---

## 🎨 Widget Development

### Video Portfolio Widget (In Progress)
- [ ] TODO: Add transcripts & captions panel (WebVTT ingest + transcript export) — Phase 2
- [ ] TODO: Implement manifest generator and aggregated video-manifest.json
- [ ] TODO: Add adaptive bitrate streaming (HLS/DASH) with quality selector + fallback to MP4
- [ ] TODO: Add debug panel metrics and performance logging
- [ ] TODO: Integrate axe-core accessibility audit into CI for video widget
- [ ] TODO: Add CI rule enforcing ≤2 active versions
- [ ] TODO: Add structured data validator & Lighthouse automation snapshot

### New Widget Ideas
- [ ] TODO: Develop Testimonials/Reviews widget with star ratings and client quotes
- [ ] TODO: Create Contact Form widget with validation and spam protection
- [ ] TODO: Build Newsletter Signup widget with Mailchimp/ConvertKit integration
- [ ] TODO: Design Services/Portfolio showcase widget for different work categories
- [ ] TODO: Implement Blog Post preview widget with RSS feed integration
- [ ] TODO: Create Social Media feed aggregator widget
- [ ] TODO: Develop Event calendar/scheduling widget with Google Calendar integration
- [ ] TODO: Build Interactive FAQ accordion widget

### Existing Widget Enhancements
- [ ] TODO: Concert Portfolio additional Spotify/embed features (follow-up enhancement)
- [ ] TODO: Add site-wide shared CSS at src/widgets/_shared/site-widgets.css

---

## 🚀 Performance & SEO

### Performance Optimization
- [ ] TODO: Implement comprehensive SEO standards across all widgets (partially implemented)
- [ ] TODO: Audit and optimize Lighthouse performance metrics (FCP/LCP/TBT) for all portfolio widgets
- [ ] TODO: Add responsive image optimization (WebP/AVIF formats, lazy loading) to remaining widgets
- [ ] TODO: Implement aggressive caching strategies for widget-delivered assets
- [ ] TODO: Add performance monitoring dashboard widget for real-time metrics tracking

### Accessibility
- [ ] TODO: Add accessibility improvements: ARIA labels, keyboard navigation, screen reader support
- [ ] TODO: Add accessibility audit automation with axe-core in CI

---

## 📊 Event Portfolio Optimizations

- [ ] TODO: Event Portfolio manifest dynamic versioning - auto-detect latest widget version
- [ ] TODO: Event Portfolio URL normalization - verify encoding logic for spaces & special characters
- [ ] TODO: Consolidate webp preference - implement manifest-side duplicate pairing with sources array

---

## 📝 Documentation

### Follow-up Documentation TODOs
- [ ] TODO: Implement CI changelog validator
- [ ] TODO: Add workflow to enforce ≤2 active widget versions
- [ ] TODO: Add schema diff & performance snapshot automation (Lighthouse + JSON-LD validation)
- [ ] TODO: Integrate accessibility axe audit into CI
- [ ] TODO: Add widget registry manifest summarizing active versions and paths

### Repository Improvements
- [ ] TODO: Continue phased repository improvement plan (see docs/repo-improvement-plan.md)

---

## 🔮 Advanced Features & Integrations

- [ ] TODO: Integrate AI-powered image alt-text generation for accessibility
- [ ] TODO: Add real-time analytics and user interaction tracking
- [ ] TODO: Implement progressive web app (PWA) features for offline viewing
- [ ] TODO: Create admin dashboard for content management and widget configuration
- [ ] TODO: Add A/B testing framework for widget variations
- [ ] TODO: Implement advanced filtering and search capabilities for portfolio widgets
- [ ] TODO: Create widget customization API for client-specific branding
- [ ] TODO: Add automated backup and recovery system for widget configurations

---

## �� VS Code AI Features (Action Items)

**Quick wins:**
- [ ] TODO: Turn on tool approvals (Settings → AI Tools → Approvals)

**Optional explorations:**
- Explore Agent Sessions dashboard (View → Agent Sessions)
- Try Planning Agent (\`@planner\` in Copilot Chat)
- Test terminal IntelliSense
- Use branch/tag comparisons in Source Control

---

## 📚 Additional Maintenance

- [ ] TODO: Update ai-instructions-preflight.js to reflect completed enhancements
- [ ] TODO: Consolidate and update all widget README files with current versions and features
- [ ] TODO: Create comprehensive widget testing suite with automated validation and wire to CI
- [ ] TODO: Implement version control system / release process for widget deployments to Squarespace
- [ ] TODO: Add automated performance regression testing for all widgets
- [ ] TODO: Create widget documentation site or comprehensive guide
- [ ] TODO: Implement dark mode support across all widgets
- [ ] TODO: Add internationalization (i18n) support for multi-language sites

---

_Last updated: 2025-12-06_
_For completed tasks, see [completed.md](./completed.md)_
