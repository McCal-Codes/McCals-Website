# McCal Media - Current Deployment Status & Action Plan

**Generated:** November 12, 2025  
**Site:** https://mcc-cal.com (Squarespace)  
**Purpose:** Track what's deployed, what's ready to deploy, and what needs development

---

## 🎯 Executive Summary

**Status Overview:**
- ✅ **12 Production-Ready Widgets** available for deployment
- 🟡 **2 Widgets In Development** (blog feed, nature portfolio)
- ⚠️ **Deployment Status Unknown** - Need to verify what's currently live on mcc-cal.com
- 📋 **Action Required:** Audit live site to determine which widgets are deployed

---

## 📊 Widget Inventory by Status

### ✅ Production-Ready (12 widgets)

#### Site-Wide Components
1. **Site Navigation v1.7.0**
   - Location: `src/widgets/site/navigation/versions/v1.7.0-enhanced.html`
   - Features: Responsive burger menu, backdrop blur, accessibility
   - Deploy: All pages (header)
   - Status: **Ready - Not Yet Verified on Live Site**

2. **Site Footer v1.3.0**
   - Location: `src/widgets/site/footer/versions/v1.3.0-performance-optimized.html`
   - Features: Multi-section footer, social links, newsletter
   - Deploy: All pages (footer)
   - Status: **Ready - Not Yet Verified on Live Site**

#### About Page Components
3. **Complete About Page v1.4.4**
   - Location: `src/widgets/complete-about-page/versions/v1.4.4.html`
   - Features: Bio, photo, reviews, client carousel, contact CTA
   - Deploy: `/about` page
   - Status: **Ready - Not Yet Verified on Live Site**

4. **Client Carousel v1.1.8**
   - Location: `src/widgets/client-carousel/versions/v1.1.8.html`
   - Features: Client logos, testimonials
   - Deploy: Homepage or about page
   - Status: **Ready - Not Yet Verified on Live Site**

#### Portfolio Widgets
5. **Concert Portfolio v4.7**
   - Location: `src/widgets/portfolios/concert/versions/v4.7-spotify-integrated.html`
   - Features: Masonry layout, Spotify integration, performance optimized
   - Manifest: `src/images/Portfolios/Concert/concert-manifest.json` (16 bands, 211 images)
   - Deploy: `/portfolios/concert` or `/concert`
   - Status: **Ready - Not Yet Verified on Live Site**

6. **Event Portfolio v2.6.0**
   - Location: `src/widgets/portfolios/event/versions/v2.6.0-lightbox-enhanced.html`
   - Features: Event galleries, lightbox navigation
   - Manifest: `src/images/Portfolios/Events/events-manifest.json` (4 events, 84 images)
   - Deploy: `/portfolios/events` or `/events`
   - Status: **Ready - Not Yet Verified on Live Site**

7. **Photojournalism Portfolio v5.2**
   - Location: `src/widgets/portfolios/photojournalism/versions/v5.2-filters-enhanced.html`
   - Features: Published work filter, minimal design, glass-like buttons
   - Manifest: `src/images/Portfolios/Journalism/journalism-manifest.json`
   - Deploy: `/portfolios/journalism` or `/journalism`
   - Status: **Ready - Not Yet Verified on Live Site**

8. **Portrait Portfolio v1.0**
   - Location: `src/widgets/portfolios/portrait/versions/v1.0-release.html`
   - Features: Vertical compositions, 3:4 aspect ratios, detail viewing
   - Manifest: `src/images/Portfolios/Portrait/portrait-manifest.json`
   - Deploy: `/portfolios/portrait` or `/portraits`
   - Status: **Ready - Not Yet Verified on Live Site**

9. **Featured Portfolio v1.5**
   - Location: `src/widgets/portfolios/featured/versions/v1.5-journalism-titles.html`
   - Features: Curated highlights, randomized covers, minimal scrollbars
   - Manifest: Uses universal portfolio manifest
   - Deploy: `/featured-work` or homepage
   - Status: **Ready - Not Yet Verified on Live Site**

#### Content Widgets
10. **Podcast Feed v1.9.5**
    - Location: `src/widgets/content/podcast-feed/versions/v1.9.5-auto-hydrating.html`
    - Features: Auto-hydrating RSS feed, episode cards, Spotify links
    - RSS: [Your podcast RSS URL needed]
    - Deploy: `/podcast` page
    - Status: **Ready - Needs RSS URL Configuration**

#### Legal & Professional
11. **Policies & Legal v1.0.0**
    - Location: `src/widgets/tools/policies-legal/versions/v1.0.0.html`
    - Features: **Comprehensive all-in-one legal hub**
      - Terms & Conditions (23 sections)
      - Privacy Policy (GDPR/CCPA compliant)
      - Cookie Policy
      - Usage License (image licensing)
      - FAQ Section (7 questions)
      - Contact information
    - Sidebar navigation with smooth scrolling
    - Mobile drawer menu
    - SEO-enhanced (Schema.org: WebPage, BreadcrumbList, FAQPage)
    - Deploy: `/policies-legal` or `/policies`
    - Status: **Ready - Not Yet Verified on Live Site**
    - **Note:** This single widget replaces separate Privacy, FAQ, Cookie, and Licensing pages

12. **Hire to Unlock Resume v1.0.0**
    - Location: `src/widgets/tools/hire-to-unlock-resume/versions/v1.0.0.html`
    - Features: Interactive resume, LinkedIn auth unlock
    - Deploy: `/hire` or `/resume`
    - Status: **Ready - Needs LinkedIn OAuth Configuration**

---

### 🟡 In Development (2 widgets)

1. **Blog Feed Widget**
   - Location: `src/widgets/content/blog-feed/`
   - Status: Work in progress (see `STATUS.md`)
   - Target: `/blog` page
   - Notes: Google Docs/Sheets integration available

2. **Nature Portfolio Widget**
   - Location: `src/widgets/portfolios/nature/`
   - Status: Work in progress (see `STATUS.md`)
   - Target: `/portfolios/nature` or `/nature`
   - Manifest: `src/images/Portfolios/Nature/nature-manifest.json`

---

### 🚧 Additional Components Needed

1. **Contact Form**
   - Status: Not yet implemented
   - Options:
     - Use Squarespace native form builder (recommended)
     - Create custom widget with email integration
     - Integrate third-party service (Formspree, Netlify Forms)
   - Deploy: `/contact` page
   - Priority: High

2. **Google Maps Integration**
   - Status: Not yet implemented
   - Purpose: Show Pittsburgh location on contact page
   - Implementation: Embedded iframe or Google Maps API
   - Priority: Medium

3. **Accessibility Statement**
   - Status: Not yet implemented
   - Purpose: WCAG compliance statement
   - Options:
     - Add as section to Policies & Legal widget
     - Create separate static page
   - Priority: Medium

**Note:** The following are NOT needed as separate components:
- ❌ FAQ Page - Already included in Policies & Legal widget
- ❌ Privacy Policy Page - Already included in Policies & Legal widget
- ❌ Cookie Policy Page - Already included in Policies & Legal widget
- ❌ Licensing Page - Already included in Policies & Legal widget (Usage License section)
- ❌ Terms & Conditions Page - Already included in Policies & Legal widget

---

## 🔍 Live Site Audit Needed

### Critical Questions to Answer:

1. **Which widgets are currently deployed on mcc-cal.com?**
   - Visit each page and document current state
   - Check for any older widget versions
   - Identify any non-widget custom code

2. **What pages exist on the live site?**
   - Compare live site structure to planned structure
   - Document any pages not in our plan
   - Identify missing pages that should be added

3. **What integrations are currently active?**
   - Analytics (Google Analytics, Facebook Pixel, etc.)
   - Email services (newsletter signup, contact forms)
   - Social media feeds
   - Third-party embeds

4. **What's the current navigation structure?**
   - Main menu items
   - Dropdown menus
   - Footer links
   - Mobile menu behavior

5. **Are manifests properly connected?**
   - Test each portfolio widget
   - Verify images load correctly
   - Check for broken manifest URLs

### How to Audit:

```bash
# 1. Visit live site
open https://mcc-cal.com

# 2. Document current pages
# Take screenshots of:
# - Homepage
# - About page
# - Each portfolio page
# - Other content pages
# - Navigation and footer

# 3. Inspect code (right-click → Inspect)
# Look for:
# - Widget version comments (<!-- Widget: [Name] v[Version] -->)
# - Manifest URLs in JavaScript
# - External script/style references
# - Data attributes (data-widget-type, etc.)

# 4. Test functionality
# - Click through all navigation
# - Test portfolio filters
# - Check lightbox galleries
# - Test mobile responsive behavior
# - Verify all external links
```

---

## 📋 Recommended Deployment Order

### Phase 1: Foundation (Week 1)
**Goal:** Core site structure and navigation

1. Deploy Site Navigation v1.7.0 (all pages)
2. Deploy Site Footer v1.3.0 (all pages)
3. Update/create Homepage with Featured Portfolio v1.5
4. Deploy Complete About Page v1.4.4

**Success Criteria:**
- All pages have consistent navigation and footer
- Homepage shows curated work
- About page tells the story
- Site is mobile-responsive

---

### Phase 2: Portfolio Showcase (Week 2)
**Goal:** Complete portfolio presence

1. Deploy Concert Portfolio v4.7 → `/portfolios/concert`
2. Deploy Event Portfolio v2.6.0 → `/portfolios/events`
3. Deploy Photojournalism Portfolio v5.2 → `/portfolios/journalism`
4. Deploy Portrait Portfolio v1.0 → `/portfolios/portrait`

**Prerequisites:**
- Verify all manifest files are accessible
- Test image loading from GitHub
- Ensure proper image optimization

**Success Criteria:**
- All portfolio types accessible from navigation
- Images load quickly and correctly
- Lightbox galleries work smoothly
- Filters/categories function properly

---

### Phase 3: Content & Features (Week 3)
**Goal:** Additional content and functionality

1. Deploy Podcast Feed v1.9.5 → `/podcast`
   - Configure RSS feed URL
   - Test episode loading
2. Deploy Policies & Legal v1.0.0 → `/policies-legal`
   - **Comprehensive legal hub** (Terms, Privacy, Cookies, License, FAQs all in one)
   - Test sidebar navigation and mobile drawer
   - Verify all sections load correctly
3. Create Contact page with form
   - Use Squarespace native form builder (recommended)
   - Add contact information
4. Add Google Maps to contact page
   - Pittsburgh location
   - Embedded or API integration

**Success Criteria:**
- Podcast episodes load from RSS
- All legal sections accessible via sidebar navigation
- Contact form sends emails correctly
- Location visible on map

**Note:** No separate pages needed for Privacy, FAQs, Cookies, or Licensing - all consolidated in Policies & Legal widget.

---

### Phase 4: Professional Tools (Week 4)
**Goal:** Professional positioning

1. Deploy Hire to Unlock Resume v1.0.0 → `/hire`
   - Configure LinkedIn OAuth
   - Test unlock mechanism
2. Add Client Carousel to homepage
3. Complete SEO optimization
4. Set up analytics tracking

**Success Criteria:**
- Resume unlock works correctly
- Client logos display properly
- SEO metadata complete
- Analytics tracking conversions

---

### Phase 5: Polish & Expand (Ongoing)
**Goal:** Continuous improvement

1. Complete Blog Feed widget
2. Complete Nature Portfolio widget
3. Add any additional integrations
4. Performance optimization
5. Regular content updates

---

## 🔧 Technical Setup Checklist

### Squarespace Configuration

- [ ] Verify Squarespace plan supports Code Injection
- [ ] Enable Developer Mode (if using custom templates)
- [ ] Connect GitHub repository for theme files
- [ ] Set up local development environment (`sqsp` CLI)
- [ ] Configure custom domain (mcc-cal.com)

### Widget Deployment Process

For each widget:

1. **Prepare Widget File**
   ```bash
   # Copy latest version
   cp src/widgets/[category]/[widget]/versions/v[X.Y.Z].html \
      deployment/[widget]-v[X.Y.Z].html
   ```

2. **Update Configuration**
   - Replace manifest URLs with production URLs
   - Update API keys (if needed)
   - Configure any widget-specific settings
   - Test locally first

3. **Deploy to Squarespace**
   - Add Code Block to page
   - Paste widget HTML
   - Save and preview
   - Test all functionality
   - Publish

4. **Verify Deployment**
   - Test on desktop
   - Test on mobile
   - Check console for errors
   - Verify images load
   - Test all interactions

### Manifest Configuration

All portfolio widgets need manifest URLs:

```javascript
// Example configuration in widget
const MANIFEST_URL = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Concert/concert-manifest.json';
```

**Current Manifests:**
- Concert: `src/images/Portfolios/Concert/concert-manifest.json`
- Events: `src/images/Portfolios/Events/events-manifest.json`
- Journalism: `src/images/Portfolios/Journalism/journalism-manifest.json`
- Portrait: `src/images/Portfolios/Portrait/portrait-manifest.json`
- Nature: `src/images/Portfolios/Nature/nature-manifest.json` (in progress)
- Featured: Uses universal portfolio manifest

---

## 🎨 Branding & SEO

### Site Identity
- **Business Name:** McCal Media
- **Photographer:** Caleb McCartney (Founder)
- **Location:** Pittsburgh, PA
- **Tagline:** Professional Photography & Photojournalism

### SEO Strategy
- **Primary Keywords:** Pittsburgh photographer, concert photography, event photography, photojournalism
- **Target Audience:** Bands, venues, event organizers, publications
- **Local SEO:** Emphasize Pittsburgh coverage
- **Social Proof:** Client logos, testimonials, published work

### Current SEO Implementation
- ✅ Canonical links
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Schema.org JSON-LD (Organization, Person, ImageGallery)
- ✅ Meta descriptions
- ✅ Alt text on images
- ✅ Sitemap.xml (640 URLs)
- ✅ Robots.txt

---

## 📞 Next Actions

### Immediate (This Week)
1. **Audit Live Site**
   - Visit mcc-cal.com
   - Document current pages and widgets
   - Screenshot current state
   - List any issues or outdated content

2. **Plan Deployment Strategy**
   - Decide deployment order
   - Schedule deployment windows
   - Identify any dependencies
   - Plan for downtime (if any)

3. **Prepare Widget Files**
   - Review all production-ready widgets
   - Update manifest URLs for production
   - Test locally one more time
   - Create deployment package

### Short Term (Next 2 Weeks)
1. **Deploy Phase 1** (Foundation)
   - Navigation and footer
   - Homepage with featured work
   - About page

2. **Deploy Phase 2** (Portfolios)
   - All production-ready portfolio widgets
   - Test manifest connections
   - Optimize image loading

3. **Configure Integrations**
   - Podcast RSS feed
   - Contact form
   - Google Maps
   - Analytics

### Medium Term (Next Month)
1. **Deploy Remaining Widgets**
   - Podcast feed
   - Legal pages
   - Professional tools

2. **Complete SEO Setup**
   - Submit sitemap to Google
   - Set up Search Console
   - Configure analytics
   - Monitor performance

3. **Performance Optimization**
   - Run Lighthouse audits
   - Optimize image delivery
   - Minimize JavaScript
   - Improve loading times

### Long Term (Ongoing)
1. **Content Updates**
   - Regular portfolio additions
   - Blog posts (when widget ready)
   - News updates
   - Client testimonials

2. **Feature Additions**
   - Complete blog widget
   - Complete nature portfolio
   - Additional integrations
   - Enhanced functionality

3. **Maintenance**
   - Widget updates
   - Security patches
   - Performance monitoring
   - SEO optimization

---

## 📚 Resources

### Documentation
- Widget Standards: `docs/standards/widget-standards.md`
- Performance Guide: `docs/standards/performance-standards.md`
- SEO Guide: `docs/standards/seo-starter-guide.md`
- Deployment Guide: `docs/deployment/DEPLOYMENT.md`
- Squarespace Setup: `docs/integrations/squarespace/developer-mode-quickstart.md`

### Site Map
- Complete site structure: `docs/SITE-MAP-MCC-CAL.md`

### Widget Locations
- All widgets: `src/widgets/`
- Production versions: `src/widgets/[category]/[widget]/versions/`
- Widget catalog: `src/widgets/README.md`

### Manifest Files
- Concert: `src/images/Portfolios/Concert/concert-manifest.json`
- Events: `src/images/Portfolios/Events/events-manifest.json`
- Journalism: `src/images/Portfolios/Journalism/journalism-manifest.json`
- Portrait: `src/images/Portfolios/Portrait/portrait-manifest.json`
- Universal: `src/images/Portfolios/portfolio-manifest.json`

---

**Status:** Awaiting live site audit to determine current deployment state  
**Last Updated:** November 12, 2025  
**Next Review:** After live site audit completed
