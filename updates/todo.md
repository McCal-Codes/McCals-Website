# Active To-Do List

Last Updated: December 27, 2025

**Quick Reference:**

- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Integration guides: [docs/integrations/](../docs/integrations/)

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
