# Policies & Legal Widget

**Current Version:** v1.0.0  
**Status:** ✅ Production Ready  
**Type:** Legal Documentation Page with Navigation

## Overview

Comprehensive legal documentation page with sidebar navigation, featuring Terms & Conditions, Privacy Policy, Cookie Policy, Usage License, FAQ, and Contact information. Built with SEO-first approach, full accessibility, and responsive mobile drawer design.

## Features

### Core Functionality
- ✅ **Comprehensive Legal Documentation**: License, Privacy, Cookies, Terms (23 sections), FAQ, Contact
- ✅ **Sticky Sidebar Navigation**: Collapsible sections with scroll spy active link highlighting
- ✅ **Mobile Responsive**: Drawer menu with floating "Menu" button on mobile devices
- ✅ **Auto-Dating**: Effective date and copyright year update automatically
- ✅ **Section Anchors**: Visible § symbols on heading hover for easy linking

### SEO Features
- ✅ **WebPage Schema**: JSON-LD structured data with publisher, dates, language
- ✅ **BreadcrumbList Schema**: Home > Policies & Legal navigation
- ✅ **FAQPage Schema**: 6 frequently asked questions with structured answers
- ✅ **Semantic HTML**: Proper heading hierarchy (H1 → H2 → H3), `<address>`, `<time>`, `<dl>` elements
- ✅ **Meta Tag Template**: Open Graph, Twitter Cards, canonical URL (copy to Page Header)
- ✅ **Accessible Navigation**: ARIA labels, roles, keyboard navigation, screen reader optimized

### Design
- ✅ **Unsplash-Inspired Clean UI**: Minimalist design with subtle typography
- ✅ **Dark/Light Mode**: Automatic theme switching via `prefers-color-scheme`
- ✅ **Smooth Scroll**: JavaScript-enhanced anchor navigation
- ✅ **Glassmorphism Effects**: Backdrop blur on effective date badge and modals
- ✅ **Version Indicator**: Fixed changelog button (bottom-right)

## Installation

### Step 1: Create Page in Squarespace
1. Go to **Pages** → **Add Page** → **Blank**
2. Name it: "Policies & Legal"
3. Set URL slug: `/policies-legal`

### Step 2: Add Widget Code
1. Add a **Code Block** to the page
2. Copy the entire contents of `versions/v1.0.0-policies-legal-squarespace.html`
3. Paste into the Code Block
4. Save the block

### Step 3: Configure SEO Meta Tags
1. Go to **Page Settings** → **Advanced** → **Page Header Code Injection**
2. Copy the meta tag template from the HTML file comments (lines 7-29)
3. Paste into Page Header Code Injection
4. Update the OG image URL if you have a custom social share image
5. Save settings

### Step 4: Update Content (Optional)
- **Contact Information**: Update address, phone, email in the Contact section
- **Effective Date**: Auto-updates to current date (or manually set in script)
- **Terms & Conditions**: Customize sections based on your specific business needs
- **FAQ**: Add/remove/modify questions based on client inquiries

### Step 5: Link from Footer
Update your site footer widget to link to `/policies-legal`:
```html
<a href="/policies-legal">Policies & Legal</a>
<a href="/policies-legal#privacy">Privacy Policy</a>
<a href="/policies-legal#terms">Terms of Service</a>
```

## Usage Examples

### Deep Linking to Specific Sections
All sections have IDs for direct linking:

- **License**: `https://mccalmedia.com/policies-legal#license`
- **Privacy**: `https://mccalmedia.com/policies-legal#privacy`
- **Cookies**: `https://mccalmedia.com/policies-legal#cookies`
- **Terms Overview**: `https://mccalmedia.com/policies-legal#terms-overview`
- **Specific Term**: `https://mccalmedia.com/policies-legal#cancellations`
- **FAQ**: `https://mccalmedia.com/policies-legal#faq`
- **Contact**: `https://mccalmedia.com/policies-legal#contact`

### Embedding in Contracts/Emails
Reference specific terms in client communications:
```
Please review our cancellation policy: 
https://mccalmedia.com/policies-legal#cancellations

Full terms available at:
https://mccalmedia.com/policies-legal#terms
```

## Customization

### Updating Contact Information
Edit the Contact section (lines 340-353 in v1.0.0):
```html
<address>
  <p>
    <strong>Email:</strong> <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a><br/>
    <strong>Phone:</strong> <a href="tel:+15702991214">570-299-1214</a><br/>
    <strong>Company:</strong> McCal Media<br/>
    320 Pointview Rd, Apt 2<br/>
    Pittsburgh, PA 15227
  </p>
</address>
```

### Adding New Terms Sections
1. Add section to main content:
```html
<section id="new-section" aria-labelledby="new-section-heading">
  <h3 id="new-section-heading">New Section Title</h3>
  <p>Content here...</p>
</section>
```

2. Add navigation link in sidebar:
```html
<nav>
  <a href="#new-section">New Section Title</a>
</nav>
```

### Modifying FAQ
Add/edit questions in the FAQ section and update FAQPage schema:
```html
<dt><strong>New question?</strong></dt>
<dd>Answer to new question...</dd>
```

Update JSON-LD schema (lines 410-470) with new question:
```json
{
  "@type": "Question",
  "name": "New question?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Answer to new question..."
  }
}
```

## Mobile Behavior

- **Desktop (>980px)**: Sticky sidebar navigation always visible
- **Tablet/Mobile (≤980px)**: 
  - Navigation collapses into drawer menu
  - Floating "Menu" button appears (bottom-right)
  - Click button or backdrop to open/close
  - Smooth slide-in animation
  - Auto-closes when clicking section links

## Accessibility Features

- ✅ **ARIA Labels**: `role="navigation"`, `role="main"`, `role="separator"`, `aria-labelledby`
- ✅ **Keyboard Navigation**: Full keyboard support for all interactive elements
- ✅ **Screen Reader Optimized**: Semantic HTML, proper heading hierarchy, descriptive labels
- ✅ **Focus Management**: Visible focus states, logical tab order
- ✅ **Color Contrast**: WCAG AA compliant color combinations
- ✅ **Responsive Text**: Clamp-based font sizing, readable at all viewport sizes

## SEO Best Practices

### On-Page SEO
- ✅ H1 main heading: "Policies & Legal"
- ✅ H2 section headings: Each major policy area
- ✅ H3 subsection headings: Specific terms
- ✅ Descriptive meta description (160 characters)
- ✅ Canonical URL prevents duplicate content
- ✅ Semantic HTML5 elements

### Structured Data
- ✅ **WebPage Schema**: Tells search engines this is an informational page
- ✅ **BreadcrumbList Schema**: Shows site hierarchy
- ✅ **FAQPage Schema**: Enables rich results in Google Search
- ✅ **Organization Publisher**: Links to McCal Media brand

### Social Sharing
- ✅ Open Graph tags for Facebook/LinkedIn
- ✅ Twitter Card metadata
- ✅ OG image (update with custom legal/policies graphic)

## Performance

- ✅ **Self-Contained**: All CSS/JS inline, no external dependencies
- ✅ **Minimal JavaScript**: ~200 lines, runs once on load
- ✅ **CSS Variables**: Efficient theming with CSS custom properties
- ✅ **Smooth Scroll**: Native browser smooth scrolling
- ✅ **Intersection Observer**: Efficient scroll spy implementation
- ✅ **No jQuery**: Vanilla JavaScript for faster load times

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android)

## Maintenance

### Updating Effective Date
The widget auto-updates to current date. To set a specific date:
```javascript
// Line ~515 in script section
const now = new Date('2025-01-27'); // Set specific date here
```

### Version Updates
When creating new versions:
1. Copy current version file to new version number
2. Update `data-widget-version` attribute
3. Update version indicator text
4. Add changelog entry
5. Document changes in this README

## Legal Considerations

### Important Notes
- ✅ **Review with Attorney**: These terms are templates - customize for your jurisdiction
- ✅ **Update Regularly**: Review and update terms annually or when business practices change
- ✅ **Client Acknowledgment**: Consider requiring clients to acknowledge terms before booking
- ✅ **Jurisdiction**: Terms reference Pennsylvania law - update for your location
- ✅ **Insurance**: Ensure terms align with your professional liability insurance policy

### Required Updates for Your Business
- Update company name, address, contact information
- Adjust cancellation/refund policies to match your practices
- Review intellectual property section (copyright, usage rights)
- Customize payment terms, late fees, deposit percentages
- Add/remove sections based on services offered
- Verify compliance with local laws (GDPR, CCPA, etc.)

## Testing Checklist

- [ ] All navigation links work correctly
- [ ] Mobile drawer opens/closes smoothly
- [ ] Scroll spy highlights active sections
- [ ] Section anchors appear on heading hover
- [ ] Version indicator opens changelog
- [ ] Auto-dates display correctly
- [ ] Deep links work from external sources
- [ ] Schema validates in Google Rich Results Test
- [ ] Accessible with keyboard only
- [ ] Screen reader announces sections properly
- [ ] Dark/light mode switches correctly
- [ ] Contact links (email, phone) work
- [ ] All meta tags present in Page Header

## Support

For issues, questions, or customization help:
- **Email**: business@mcc-cal.com
- **Widget Version**: Check version indicator (bottom-right)
- **Documentation**: This README
- **Changelog**: Click version indicator for full changelog

## Version History

### v1.0.0 (2025-01-27)
- ✅ Initial release with comprehensive legal documentation
- ✅ SEO-enhanced with WebPage, BreadcrumbList, FAQPage schemas
- ✅ Full accessibility with ARIA labels and semantic HTML
- ✅ Responsive mobile drawer menu
- ✅ Scroll spy active link highlighting
- ✅ Auto-updating effective date and copyright year
- ✅ Unsplash-inspired clean design with dark/light mode
- ✅ Heading anchors with visible § symbols
- ✅ Smooth scroll navigation
- ✅ Version indicator with changelog modal

---

**Last Updated:** 2025-01-27  
**Maintainer:** McCal Media Development Team
