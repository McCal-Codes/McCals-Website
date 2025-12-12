# Active To-Do List

_Updated: December 6, 2025_

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

---

## 🎯 High Priority (Active Work)

### Authentication & Token Setup ✅ COMPLETE

### Cloudflare Worker Deployment (Next Priority)

- [ ] TODO: Deploy Cloudflare Worker to production with proper environment variables (use AUTH-SETUP-GUIDE.md)
- [ ] TODO: Create KV namespaces in Cloudflare dashboard (MCCAL_KV for production, MCCAL_KV_PREVIEW for staging)
- [ ] TODO: Configure local/CI environments to point manifest generators and blog widget at deployed Worker URL
- [ ] TODO: Test end-to-end flows: manifest webhook, blog auth/posts, rate limiting, cache stats
- [ ] TODO: Monitor Worker analytics and optimize cache TTLs/rate limits based on actual traffic patterns

### Next.js Self-Hosted Site Migration

- [ ] TODO: Create Next.js self-hosted site structure under sites/dev.mcc-cal.com/
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

### Scripts Organization

### CI/CD Improvements

- [ ] Concert manifest workflow secret lint warnings — evaluate if GitHub Actions runtime succeeds despite local YAML linter warnings
- [ ] Reduce remaining secret lint warnings — evaluate creating reusable \`workflow_call\` webhook dispatcher

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
- [x] TODO: Add site-wide shared CSS at src/widgets/\_shared/site-widgets.css — Completed 2025-12-10 (site-widgets pipeline + inline markers via `npm run site-widgets:build`)

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

---

## 📊 Event Portfolio Optimizations

- [ ] TODO: Event Portfolio manifest dynamic versioning - auto-detect latest widget version
- [ ] TODO: Event Portfolio URL normalization - verify encoding logic for spaces & special characters
- [ ] TODO: Consolidate webp preference - implement manifest-side duplicate pairing with sources array

---

## 📝 Documentation

### Follow-up Documentation TODOs

- [ ] Add schema diff & performance snapshot automation (Lighthouse + JSON-LD validation)

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
