# Widget Inventory - Ground Truth

**Last Updated:** November 12, 2025  
**Purpose:** Definitive list of widgets with actual production status based on code inspection and live site verification

## 🔍 Live Site Audit Summary

**Site:** https://www.mcc-cal.com  
**Audit Date:** November 12, 2025  
**Repository Cleanup:** ✅ Completed archival of 20+ old widget versions

### Pages Verified:
- ✅ **/about** - Complete About Page widget v1.4.6 deployed and functional
- ✅ **/accessibility** - Accessibility Statement widget v1.0 (custom widget, needs to be added to repo)

### Confirmed Deployed Widgets:
- ✅ Complete About Page v1.4.6
- ✅ Site Footer v1.2.0 (v1.3.0 available but not yet deployed)
- ✅ Accessibility Statement (version TBD - needs to be added to repository)
- ⚠️ Need to audit: Homepage, portfolio pages, podcast, policies pages

### Repository Cleanup Completed:
- ✅ **Concert Portfolio:** Archived 9 old versions (v2.1-v4.5), kept v2.0, v4.6, v4.7
- ✅ **Podcast Feed:** Archived 10 old versions (v1.1-v2.0-perf), kept v1.0, v1.9.5, v2.0.0
- ✅ **Photojournalism:** Archived 1 version (v2.0), kept v1.0, v4.9, v5.1, v5.2
- ✅ **Archive folders created:** `versions\_archive/` in each widget directory
- 📊 **Total archived:** 20 old versions moved to archive folders
- 💡 **Result:** Cleaner version directories, easier to find latest stable versions

### Key Findings:
1. About page is fully functional with testimonials and 25+ client logos
2. Footer version on live site (v1.2.0) is older than latest available (v1.3.0)
3. Policies & Legal widget uses anchor-based navigation (#faq, #cookies)
4. All social media links and contact forms are active
5. Widget version badges visible in footer for verification
6. Repository cleaned: Old widget versions archived for better organization

---

## 🌐 Live Site Verification

**About Page:** https://www.mcc-cal.com/about

### ✅ Currently Deployed:

1. **Complete About Page Widget v1.4.6**
   - **Confirmed Live:** Footer shows "v1.4.6" 
   - **Sections Deployed:**
     - Professional bio with headshot (GitHub-hosted image)
     - Client testimonials (LinkedIn + Google reviews with ⭐ 5.0 rating)
     - "Trusted by Leading Brands" carousel with 25+ client logos
     - Stats counter: "30+ HAPPY CLIENTS | 65+ PROJECTS | 6+ YEARS EXPERIENCE"
     - Links to portfolio, podcast, and contact
   - **Footer Version:** v1.2.0 (site-wide footer)
   - **Status:** ✅ Fully functional and production-quality

### 📋 Client Logos Currently Live:

The about page displays **25+ client logos** including:
- Point Park University (DOWNTOWN PITTSBURGH)
- Howl at the Moon
- Next Generation News
- University of Pittsburgh
- Ghostlight Theatre Company
- Yinzers Meet
- Penn State Fayette
- Terrible Tailgate
- Butler County Community College (BC3)
- The Globe (Photo Editor role)
- New York Post
- Dream the Heavy
- Voyage Visuals
- Pittsburgh Union Progress (Staff Photographer)
- Capo's on Carson
- The Space Upstairs
- When We Were Dead (HALLOWEEN FESTIVAL)
- Jagoff Media
- West Hills Gazette
- Pittsburgh Magazine
- Center for Media Innovation
- Carnegie Mellon University
- The Watchful Shepherd
- Haven Pittsburgh
- Western PA Press Club

### 🔗 Links & Integrations Active:

- ✅ FAQs → `/policies-legal#faq`
- ✅ Policies & Legal → `/policies-legal`
- ✅ Contact Form → `/contact-us`
- ✅ Email → `contact@mcc-cal.com`
- ✅ Portfolio → `/featured-work`
- ✅ Blog → `/blog`
- ✅ Podcast → `/podcast`
- ✅ Accessibility → `/accessibility`
- ✅ Cookies → `/policies-legal#cookies`
- ✅ Social Media:
  - Facebook: https://www.facebook.com/mccalphotography
  - Instagram: https://www.instagram.com/mcc_cal
- ✅ Google Reviews: https://maps.app.goo.gl/CKztLDxynn6mwSwS8

### 🎯 Key Insights:

1. **Widget IS Deployed:** The Complete About Page widget v1.4.6 is LIVE
2. **Footer Version Mismatch:** Documentation said v1.3.0, site shows v1.2.0
3. **Client Carousel Integrated:** 25+ logos displaying in "Trusted by Leading Brands" section
4. **Testimonials Working:** LinkedIn and Google reviews with proper attribution
5. **All Links Functional:** Internal navigation and external links working
6. **Policies & Legal Links:** Using anchor tags for FAQ and Cookies sections

---

## 🟢 Production-Ready Widgets (13 widgets)

These widgets have stable versions and are ready for Squarespace deployment.

### Portfolio Widgets (5)

1. **Concert Portfolio v4.7**
   - Path: `src/widgets/portfolios/concert-portfolio/versions/v4.7.html`
   - Status: ✅ Production Ready
   - Features: Masonry layout, lightbox, Spotify integration
   - Manifest: `src/images/Portfolios/Concert/concert-manifest.json`
   - Deploy to: `/portfolios/concert` or `/concert`

2. **Event Portfolio v2.6.2**
   - Path: `src/widgets/portfolios/event-portfolio/versions/v2.6.2-event-portfolio.html`
   - Status: ✅ Production Ready (latest is v2.6.2, not v2.6.0)
   - Features: Event galleries, lightbox, featured-first ordering
   - Manifest: `src/images/Portfolios/Events/events-manifest.json`
   - Deploy to: `/portfolios/events` or `/events`

3. **Photojournalism Portfolio v5.2**
   - Path: `src/widgets/portfolios/photojournalism-portfolio/versions/v5.2-performance-optimized.html`
   - Status: ✅ Production Ready
   - Features: Filterable categories, masonry, glass-like buttons
   - Manifest: `src/images/Portfolios/Journalism/journalism-manifest.json`
   - Deploy to: `/portfolios/journalism` or `/journalism`

4. **Portrait Portfolio v1.0**
   - Path: `src/widgets/portfolios/portrait-portfolio/versions/v1.0.html`
   - Status: ✅ Production Ready
   - Features: Vertical compositions, 3:4 aspect ratios, detail viewing
   - Manifest: `src/images/Portfolios/Portrait/portrait-manifest.json`
   - Deploy to: `/portfolios/portrait` or `/portraits`

5. **Featured Portfolio v1.5**
   - Path: `src/widgets/portfolios/featured-portfolio/versions/v1.5-working.html`
   - Status: ✅ Production Ready (note: filename says "working" but it's stable)
   - Features: Curated highlights, Fisher-Yates shuffle, scrollable lightbox
   - Manifest: Uses universal portfolio manifest
   - Deploy to: `/featured-work` or homepage

### Site Infrastructure (2)

6. **Site Navigation v1.7.1**
   - Path: `src/widgets/site/navigation/versions/v1.7.1-rollback.html`
   - Status: ✅ Production Ready (v1.7.1 is rollback/stable version)
   - Features: Mobile burger menu, backdrop blur, responsive
   - Deploy to: All pages (header)

7. **Site Footer v1.3.0**
   - Path: `src/widgets/site/footer/versions/v1.3.0-performance-optimized.html`
   - Status: ✅ Production Ready (v1.3.0 exists in repo)
   - **Live Site:** v1.2.0 is currently deployed (per footer badge on mcc-cal.com)
   - Features: Multi-section footer, social links, newsletter signup
   - Deploy to: All pages (footer)
   - **Action Needed:** Consider updating live site to v1.3.0 for performance improvements

### Content Widgets (3)

8. **Complete About Page v1.4.6**
   - Path: `src/widgets/content/about/complete-about-page/versions/v1.4.6-complete-about-squarespace.html`
   - Status: ✅ Production Ready (v1.4.6, not v1.4.4)
   - Features: Bio, photo, reviews, integrated client carousel
   - Deploy to: `/about`

9. **Client Carousel v1.3.0**
   - Path: `src/widgets/content/about/client-carousel/versions/v1.3.0-client-carousel-squarespace.html`
   - Status: ✅ Production Ready (v1.3.0, not v1.1.8)
   - Features: 22+ client logos, Fisher-Yates shuffle, infinite loop
   - Deploy to: Homepage or about page

10. **Podcast Feed v2.0.0**
    - Path: `src/widgets/content/podcast-feed/versions/v2.0.0.html`
    - Status: ✅ Production Ready (v2.0.0, not v1.9.5)
    - Features: Auto-hydrating RSS, episode cards, Spotify links
    - Needs: RSS feed URL configuration
    - Deploy to: `/podcast`

### Legal & Professional (3)

11. **Policies & Legal v1.0.0**
    - Path: `src/widgets/content/policies-legal/versions/v1.0.0-policies-legal-squarespace.html`
    - Status: ✅ Production Ready
    - **Comprehensive legal hub includes:**
      - Terms & Conditions (23 sections)
      - Privacy Policy (GDPR/CCPA compliant)
      - Cookie Policy
      - Usage License (image licensing)
      - FAQ Section (7 questions)
      - Contact information
    - Features: Sidebar navigation, mobile drawer, Schema.org SEO
    - Deploy to: `/policies-legal` or `/policies`
    - **Note:** Replaces need for separate `/privacy`, `/faqs`, `/cookies`, `/licensing` pages

12. **Accessibility Statement v1.1.0** (Custom Widget)
    - Path: `src/widgets/content/accessibility-statement/versions/v1.1.0-accessibility-statement.html`
    - Status: ✅ **DEPLOYED LIVE** at https://www.mcc-cal.com/accessibility
    - ✅ **Added to Repository:** November 12, 2025
    - **NEW in v1.1.0:** OLED dark mode + Light mode toggle
    - **Features:**
      - 🌙 **OLED Dark Mode** - True black (#000000) background for power savings
      - ☀️ **Light Mode** - White (#ffffff) background option
      - 🔄 **Theme Toggle** - Fixed position button with localStorage persistence
      - WCAG 2.1 Level AA compliance documentation
      - Sidebar navigation with collapsible sections and scroll spy
      - Mobile drawer menu with overlay backdrop
      - Skip to main content link for keyboard users
      - Auto-updating effective date display
      - Full keyboard support (Tab, Enter/Space, Esc)
      - Semantic HTML & ARIA landmarks
      - 4.5:1 color contrast minimum (both themes)
      - Reduced motion support (prefers-reduced-motion)
      - Print-optimized styles
      - Respects system prefers-color-scheme preference
    - **Content Sections:**
      - Accessibility Statement & commitment
      - Standards followed (WCAG 2.1 AA, monitoring 2.2)
      - Scope & Coverage
      - Feedback & Support (email, phone, mail)
      - Keyboard Navigation instructions
      - Headings & Structure (landmark roles)
      - Links, Forms & Errors
      - Text Alternatives (alt text)
      - Color & Contrast targets
      - Audio & Video (captions, transcripts)
      - Motion & Animation (Reduce Motion support)
      - Language identification
      - Browser & Assistive Technology support
      - Third-party content accessibility
      - Continuous improvement process
      - Legal & Effective Date (Nov 12, 2025)
      - Contact information
    - Deploy to: `/accessibility`

13. **Hire to Unlock Resume v1.0.0**
    - Path: `src/widgets/content/hire-to-unlock-resume/versions/v1.0.0-hire-to-unlock-resume.html`
    - Status: ✅ Production Ready
    - Features: Interactive resume, LinkedIn OAuth unlock
    - Needs: LinkedIn OAuth configuration
    - Deploy to: `/hire` or `/resume`

---

## 🟡 Work in Progress (3 widgets)

These widgets have STATUS.md files indicating they're under development.

### 1. Blog Feed
- Path: `src/widgets/blog-feed/`
- Latest: `versions/v2.1-google-docs-blog.html`
- Status: 🟡 In Development (has STATUS.md)
- Target: `/blog` page
- Notes: Google Docs integration in progress

### 2. Nature Portfolio v1.8
- Path: `src/widgets/portfolios/nature-portfolio/`
- Latest: `versions/v1.8-performance-optimized.html`
- Status: 🟡 In Development (has STATUS.md)
- Target: `/portfolios/nature` or `/nature`
- Manifest: `src/images/Portfolios/Nature/nature-manifest.json`

### 3. Hero Slideshow v1.2
- Path: `src/widgets/site/hero-slideshow/`
- Latest: `versions/v1.2.html`
- Status: 🟡 Development/Testing
- Target: Homepage hero section
- Notes: May not have STATUS.md but appears to be WIP

---

## 🔴 Not Ready for Production

### Admin Tools (_admin/)

**Admin Portfolio Importer v1.1.0**
- Path: `src/widgets/_admin/admin-portfolio-importer/versions/v1.1.0-admin-portfolio-importer.html`
- Status: 🔐 Admin-Only Tool
- Purpose: Backend tool for importing and organizing portfolio images
- **DO NOT deploy to public site**

### Development Tools (tools/)

These are development aids, not production widgets:
- CSS Playground (v1.3)
- Performance Dashboard
- SEO Performance Template
- Widget Enhancement Template

### Archived (_archived/)

Moved to `_archived/` directory - do not use:
- GitHub Portfolio Gallery
- About Page Duplicate
- About Widgets Legacy

---

## 📊 Version Corrections

The documentation had some outdated version numbers. Here are the **actual latest versions**:

| Widget | Documented Version | Actual Latest Version |
|--------|-------------------|----------------------|
| Concert Portfolio | v4.7 | ✅ v4.7 (correct) |
| Event Portfolio | v2.6.0 | ⚠️ v2.6.2 |
| Photojournalism | v5.2 | ✅ v5.2 (correct) |
| Featured Portfolio | v1.5 | ✅ v1.5 (correct) |
| Portrait Portfolio | v1.0 | ✅ v1.0 (correct) |
| Site Navigation | v1.7.0 | ⚠️ v1.7.1 (rollback) |
| Site Footer | v1.3.0 | ✅ v1.3.0 (correct) |
| Complete About | v1.4.4 | ⚠️ v1.4.6 |
| Client Carousel | v1.1.8 | ⚠️ v1.3.0 |
| Podcast Feed | v1.9.5 | ⚠️ v2.0.0 |
| Policies & Legal | v1.0.0 | ✅ v1.0.0 (correct) |
| Hire to Unlock | v1.0.0 | ✅ v1.0.0 (correct) |

---

## 🔍 Verification Commands

```bash
# List all version folders
Get-ChildItem -Path "src\widgets" -Recurse -Filter "versions" -Directory

# Find latest version files
Get-ChildItem -Path "src\widgets\portfolios\concert-portfolio\versions" | Sort-Object Name -Descending | Select-Object -First 1

# Check for STATUS.md files (indicates WIP)
Get-ChildItem -Path "src\widgets" -Recurse -Filter "STATUS.md"

# View widget manifest
cat src\widgets\widgets-manifest.json
```

---

## 📝 Key Insights

### What This Tells Us:

1. **12 Production-Ready Widgets** - More than previously thought!
2. **Version Numbers Were Outdated** - Need to update deployment docs
3. **Policies & Legal is Comprehensive** - Truly replaces 4-5 separate pages
4. **Blog Feed Is WIP** - Don't promise it for Phase 1-3 deployment
5. **Nature Portfolio Is WIP** - Has v1.8 but STATUS.md indicates not ready
6. **Admin Importer Exists** - Backend tool for portfolio management

### What Needs Updating:

- [x] README.md widget list with correct versions
- [ ] SITE-MAP-MCC-CAL.md with correct versions
- [ ] DEPLOYMENT-STATUS.md with correct versions
- [ ] Any widget-specific documentation

---

**Source of Truth:** Actual file inspection of `src/widgets/` directory structure  
**Method:** PowerShell directory listing + README/STATUS.md checks  
**Confidence Level:** High - based on actual files, not assumptions
