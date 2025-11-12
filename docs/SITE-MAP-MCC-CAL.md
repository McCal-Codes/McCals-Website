# McCal Media (mcc-cal.com) - Complete Site Map & Widget Integration Guide

**Generated:** November 12, 2025  
**Site:** https://mcc-cal.com  
**Purpose:** Comprehensive guide to all pages, widgets, and integrations for the live Squarespace site

---

## 📍 Current Site Structure

### Main Pages

#### 1. **Homepage** (`/`)
**Purpose:** Portfolio showcase and main entry point  
**Current Status:** ✅ Implemented  
**Required Widgets:**
- ✅ Site Navigation (v1.7.0) - Header
- ✅ Hero Section - Welcome message
- ✅ Featured Portfolio (v1.5) - Curated work highlights
- ✅ Site Footer (v1.3.0) - Footer

**Recommended Additions:**
- 🟡 Client Carousel (v1.1.8) - Show brand credibility
- 🟡 Contact CTA section - Link to contact page

---

#### 2. **About Page** (`/about`)
**Purpose:** Personal story and brand introduction  
**Current Status:** ✅ Implemented (needs widget integration)  
**Required Widgets:**
- ✅ Site Navigation (v1.7.0) - Header
- ✅ Complete About Page (v1.4.4) - Bio, photo, reviews, client carousel
- ✅ Site Footer (v1.3.0) - Footer

**Current Implementation:**
- Basic HTML about section exists
- Needs Complete About Page widget integration for full features

---

#### 3. **Portfolio Pages**

##### Concert Photography (`/concert` or `/portfolios/concert`)
**Purpose:** Concert photography showcase  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Concert Portfolio (v4.7) with Spotify integration
- Manifest: `src/images/Portfolios/Concert/concert-manifest.json`

##### Event Photography (`/events` or `/portfolios/events`)
**Purpose:** Event photography showcase  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Event Portfolio (v2.6.0)
- Manifest: `src/images/Portfolios/Events/events-manifest.json`

##### Photojournalism (`/journalism` or `/portfolios/journalism`)
**Purpose:** Photojournalism work showcase  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Photojournalism Portfolio (v5.2)
- Manifest: `src/images/Portfolios/Journalism/journalism-manifest.json`

##### Portrait Photography (`/portraits` or `/portfolios/portrait`)
**Purpose:** Portrait photography showcase  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Portrait Portfolio (v1.0)
- Manifest: `src/images/Portfolios/Portrait/portrait-manifest.json`

##### Nature Photography (`/nature` or `/portfolios/nature`)
**Purpose:** Wildlife and landscape photography  
**Status:** 🟡 Widget In Progress  
**Required Widget:**
- Nature Portfolio (WIP - see STATUS.md)
- Manifest: `src/images/Portfolios/Nature/nature-manifest.json`

##### Featured Work (`/featured-work` or `/featured-projects`)
**Purpose:** Curated portfolio highlights  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Featured Portfolio (v1.5)
- Uses universal portfolio manifest

---

#### 4. **Podcast Page** (`/podcast`)
**Purpose:** "Caffeinated Connections" podcast showcase  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Podcast Feed (v1.9.5) - Auto-hydrating RSS feed
- RSS URL: [Your podcast RSS feed]

---

#### 5. **Blog Page** (`/blog`)
**Purpose:** Blog posts and articles  
**Status:** 🟡 In Development  
**Required Widget:**
- Blog Feed (WIP - see `src/widgets/blog-feed/STATUS.md`)
- Google Docs/Sheets integration available

---

#### 6. **Contact Page** (`/contact`)
**Purpose:** Contact form and information  
**Status:** ⚠️ Needs Implementation  
**Required:**
- Contact form (Squarespace native or custom widget)
- Email: contact@mccalmedia.com
- Optional: Calendly integration for coffee chats
- Social media links

---

#### 7. **Policies & Legal** (`/policies-legal`)
**Purpose:** Comprehensive legal documentation hub  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Policies & Legal (v1.0.0) - All-in-one legal documentation widget

**Includes (All in One Widget):**
- ✅ **Terms & Conditions** (23 sections) - Service terms, usage rights, liability
- ✅ **Privacy Policy** - Data collection, cookies, GDPR/CCPA compliance
- ✅ **Cookie Policy** - Cookie usage, types, management
- ✅ **Usage License** - Image licensing terms and restrictions
- ✅ **FAQ Section** (7 questions) - Common questions about services and licensing
- ✅ **Contact Information** - Legal inquiries and support

**Features:**
- Sidebar navigation with smooth scrolling
- Mobile drawer menu
- Auto-updating effective date and copyright year
- SEO-enhanced with Schema.org (WebPage, BreadcrumbList, FAQPage)
- Full accessibility (ARIA labels, semantic HTML, keyboard navigation)
- Dark/light mode support
- Download terms as PDF (optional)

**Note:** This single widget replaces the need for separate Privacy, FAQs, Cookie Policy, and Licensing pages. All legal content is centralized in one comprehensive, navigable page.

---

#### 8. **Hire/Resume Page** (`/hire` or `/resume`)
**Purpose:** Professional resume with unlock feature  
**Status:** ✅ Widget Ready  
**Required Widget:**
- Hire to Unlock Resume (v1.0.0) - Interactive resume with LinkedIn auth

---

#### 9. **Accessibility Page** (`/accessibility`)
**Purpose:** Accessibility statement  
**Status:** ⚠️ Needs Implementation  
**Suggestion:** Could be added as a section in Policies & Legal widget or as a separate static page
**Required:** Accessibility statement and WCAG compliance information

---

## 🔧 Site-Wide Components

### Navigation (All Pages)
**Widget:** Site Navigation (v1.7.0)  
**Location:** `src/widgets/site/navigation/versions/v1.7.0-enhanced.html`  
**Features:**
- Mobile responsive burger menu
- Backdrop blur effects
- Smooth animations
- Accessibility compliant

**Menu Structure:**
```
- Home (/)
- About (/about)
- Portfolios (dropdown)
  - Concert (/portfolios/concert)
  - Events (/portfolios/events)
  - Journalism (/portfolios/journalism)
  - Portrait (/portfolios/portrait)
  - Nature (/portfolios/nature)
  - Featured Work (/featured-work)
- Podcast (/podcast)
- Blog (/blog)
- Contact (/contact)
- Hire (/hire)
```

### Footer (All Pages)
**Widget:** Site Footer (v1.3.0)  
**Location:** `src/widgets/site/footer/versions/v1.3.0-performance-optimized.html`  
**Features:**
- Multiple footer sections
- Social media links
- Newsletter signup
- Copyright and legal links

**Footer Sections:**
- About: About Me, Policies & Legal
- Contact: Contact Form, FAQs, Email
- Portfolio: Photography, Featured Work, Blog, Licensing
- Follow: Social media, Newsletter signup

---

## 📊 Widget Deployment Checklist

### ✅ Ready to Deploy (Production-Ready Widgets)

1. **Site Navigation v1.7.0** - Header for all pages
2. **Site Footer v1.3.0** - Footer for all pages
3. **Complete About Page v1.4.4** - About page
4. **Client Carousel v1.1.8** - Homepage/About page
5. **Concert Portfolio v4.7** - Concert page
6. **Event Portfolio v2.6.0** - Events page
7. **Photojournalism Portfolio v5.2** - Journalism page
8. **Portrait Portfolio v1.0** - Portrait page
9. **Featured Portfolio v1.5** - Featured work page
10. **Podcast Feed v1.9.5** - Podcast page
11. **Policies & Legal v1.0.0** - Legal page
12. **Hire to Unlock Resume v1.0.0** - Resume/Hire page

### 🟡 In Development (Not Ready)

1. **Blog Feed** - Needs completion (see STATUS.md)
2. **Nature Portfolio** - In progress (see STATUS.md)
3. **Hero Slideshow** - In progress

### ⚠️ Missing/Needed

1. **Contact Form** - Use Squarespace native form or create custom widget
2. **Google Maps Integration** - For contact page (Pittsburgh location)
3. **Accessibility Statement** - Could be added to Policies & Legal widget or create separate page

**Note:** FAQs, Privacy Policy, Cookie Policy, and Licensing are all included in the Policies & Legal v1.0.0 widget.

---

## 🗺️ Google Maps Integration

### Option 1: Embedded Google Map
**Location:** Contact page  
**Implementation:**
```html
<iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48377.84983974586!2d-79.99552!3d40.44062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8834f16f48068503%3A0x8df915a15aa21b34!2sPittsburgh%2C%20PA!5e0!3m2!1sen!2sus!4v1234567890"
  width="600" 
  height="450" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy" 
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

### Option 2: Google Maps API
**Use Case:** Custom interactive map with markers  
**API Key Required:** Yes  
**Features:**
- Custom markers for coverage areas
- Pittsburgh-focused
- Interactive controls

---

## 📋 Deployment Priority

### Phase 1: Core Pages (Immediate)
1. ✅ Homepage with Featured Portfolio widget
2. ✅ About page with Complete About Page widget
3. ✅ Site Navigation on all pages
4. ✅ Site Footer on all pages

### Phase 2: Portfolio Pages (High Priority)
1. Concert Portfolio page
2. Event Portfolio page
3. Photojournalism Portfolio page
4. Portrait Portfolio page
5. Featured Work page

### Phase 3: Content Pages (Medium Priority)
1. Podcast page with Podcast Feed widget
2. Policies & Legal page
3. Hire/Resume page
4. Contact page with form and map

### Phase 4: Additional Features (Lower Priority)
1. Blog page (when Blog Feed widget is ready)
2. Nature portfolio (when widget is ready)
3. Hero slideshow on homepage
4. Additional integrations

---

## 🔗 External Integrations

### Currently Available
- ✅ **Spotify API** - Concert Portfolio widget (artist search links)
- ✅ **RSS Feed** - Podcast Feed widget (auto-hydrating episodes)
- ✅ **LinkedIn OAuth** - Hire to Unlock Resume widget
- ✅ **GitHub** - Image hosting for manifests and assets

### Recommended Additions
- 🟡 **Google Maps** - Contact page location
- 🟡 **Calendly** - Schedule coffee chats (About/Contact pages)
- 🟡 **Mailchimp/ConvertKit** - Newsletter signup in footer
- 🟡 **Google Analytics** - Site traffic tracking
- 🟡 **Facebook Pixel** - Marketing tracking

---

## 📱 Mobile Optimization

All widgets are mobile-responsive with:
- ✅ Responsive CSS with breakpoints
- ✅ Touch-friendly interactions
- ✅ Mobile burger menu (navigation)
- ✅ Optimized images with lazy loading
- ✅ Fast load times (Lighthouse optimized)

**Test on:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Various screen sizes (320px - 1920px)

---

## ♿ Accessibility Compliance

All production widgets follow:
- ✅ WCAG 2.1 Level AA standards
- ✅ Semantic HTML5
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast ratios (4.5:1 minimum)

**Test with:**
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Color blindness simulators
- Lighthouse accessibility audits

---

## 🎨 Branding Consistency

### Colors
- Primary: #007acc (accent blue)
- Secondary: #000000 (black for buttons)
- Text: #333333 (dark gray)
- Background: #ffffff (white) / #1a1a1a (dark mode)
- Muted: #666666, #999999

### Typography
- Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
- Headings: 600-700 weight
- Body: 400 weight, 1.6 line-height

### Dark Mode
- ✅ Implemented site-wide with CSS variables
- ✅ Theme toggle button (bottom-right)
- ✅ Respects prefers-color-scheme
- ✅ localStorage persistence

---

## 🚀 Quick Deployment Guide

### For Each Page:

1. **Create Squarespace Page**
   - Add new page in Squarespace dashboard
   - Set URL slug (e.g., `/about`, `/contact`, `/portfolios/concert`)

2. **Add Navigation**
   - Add Code Block at top of page
   - Copy Site Navigation widget HTML
   - Paste and save

3. **Add Main Content**
   - Add Code Block for main content area
   - Copy relevant widget HTML (e.g., Concert Portfolio)
   - Update any configuration (manifest URLs, API keys)
   - Paste and save

4. **Add Footer**
   - Add Code Block at bottom of page
   - Copy Site Footer widget HTML
   - Paste and save

5. **Test**
   - Preview page in Squarespace
   - Test on mobile
   - Check all links and interactions
   - Validate accessibility

6. **Publish**
   - Save and publish page
   - Add to navigation menu if needed

---

## 📞 Support & Documentation

### Widget Documentation
Each widget has a README with:
- Purpose and features
- Installation instructions
- Configuration options
- Version history (CHANGELOG.md)
- Known issues and fixes

### General Documentation
- Widget Standards: `docs/standards/widget-standards.md`
- Performance Standards: `docs/standards/performance-standards.md`
- SEO Guide: `docs/standards/seo-starter-guide.md`
- Development Guide: `docs/standards/widget-development.md`

### Contact
- GitHub: [McCal-Codes/McCals-Website](https://github.com/McCal-Codes/McCals-Website)
- Email: contact@mccalmedia.com

---

**Last Updated:** November 12, 2025  
**Next Review:** When new widgets are production-ready or site structure changes
