# SEO Testing Guide — Comprehensive Checklist

## Overview

This guide provides a systematic approach to testing SEO (Search Engine Optimization) for web pages and widgets. It focuses on Google's official tools and best practices for verifying SEO implementation.

## Prerequisites

- **Live Website**: Most Google tools require your site to be publicly accessible
- **Google Account**: Required for Search Console and Analytics
- **Indexed Site**: Your pages should be indexed by Google (check with `site:yourdomain.com`)
- **Basic HTML Knowledge**: Understanding of meta tags, structured data, and accessibility

---

## 1. Structured Data Testing

### Google's Rich Results Test
**Purpose**: Validates JSON-LD structured data markup
**URL**: https://search.google.com/test/rich-results
**What it tests**:
- Schema.org markup validity
- Rich snippet eligibility
- Structured data errors and warnings

**Testing Steps**:
1. Go to the Rich Results Test tool
2. Enter your live page URL
3. Or paste your HTML code directly
4. Review detected structured data
5. Fix any validation errors

**For Your Concert Portfolio Widget**:
```javascript
// Check if structured data is present
console.log(document.querySelector('script[type="application/ld+json"]'));

// View the structured data
const structuredData = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
console.log(structuredData);
```

---

## 2. Mobile-Friendly Testing

### Google's Mobile-Friendly Test
**Purpose**: Ensures your site works well on mobile devices
**URL**: https://search.google.com/test/mobile-friendly
**What it tests**:
- Mobile viewport configuration
- Touch elements size
- Readable text without zooming
- Content width issues

**Testing Steps**:
1. Enter your page URL
2. Run the test
3. Review mobile usability issues
4. Fix viewport and responsive design problems

---

## 3. Page Speed and Performance

### Google PageSpeed Insights
**Purpose**: Analyzes page performance and provides SEO recommendations
**URL**: https://pagespeed.web.dev/
**What it tests**:
- Core Web Vitals (LCP, FID, CLS)
- Performance score (0-100)
- SEO opportunities
- Accessibility issues

**Testing Steps**:
1. Enter your page URL
2. Analyze both mobile and desktop
3. Review performance metrics
4. Implement suggested optimizations

**Key Metrics to Monitor**:
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1

---

## 4. Search Console Integration

### Google Search Console
**Purpose**: Monitor how Google sees and indexes your site
**URL**: https://search.google.com/search-console
**Setup Requirements**:
1. Verify site ownership (HTML file, DNS record, or Google Analytics)
2. Submit sitemap if available
3. Monitor indexing status

**Key Reports to Check**:
- **Index Coverage**: Pages indexed vs submitted
- **Rich Results**: Structured data performance
- **Core Web Vitals**: Real user performance data
- **Mobile Usability**: Mobile-specific issues
- **Search Performance**: Impressions, clicks, CTR

---

## 5. Local Development Testing

### Chrome DevTools Lighthouse
**Purpose**: Comprehensive local SEO and performance audit
**How to access**:
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select categories: Performance, Accessibility, Best Practices, SEO
4. Run audit

**SEO Checks Included**:
- Document has a `<title>` element
- Document has a meta description
- Page has successful HTTP status code
- Links have descriptive text
- Page isn't blocked from indexing
- Document uses legible font sizes
- Tap targets are appropriately sized

### Browser Extensions
- **SEO Meta in 1 Click**: Quick meta tag checker
- **Web Developer**: HTML validation and SEO tools
- **Structured Data Testing Tool**: Chrome extension for schema validation

---

## 6. Content and Technical SEO

### Manual Checks
**Title Tags**:
```html
<!-- Check in browser console -->
document.title
```

**Meta Description**:
```html
<!-- Check in browser console -->
document.querySelector('meta[name="description"]').content
```

**Heading Structure**:
```javascript
// Check heading hierarchy
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
headings.forEach(h => console.log(`${h.tagName}: ${h.textContent}`));
```

**Image Alt Text**:
```javascript
// Check all images have alt text
const images = document.querySelectorAll('img');
images.forEach(img => {
  if (!img.alt) console.log(`Missing alt: ${img.src}`);
});
```

**Internal Linking**:
```javascript
// Check for broken internal links
const links = document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]');
links.forEach(link => {
  fetch(link.href, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) console.log(`Broken link: ${link.href}`);
    });
});
```

---

## 7. Keyword and Content Analysis

### Google Keyword Planner
**Purpose**: Research keywords and search volume
**URL**: https://ads.google.com/aw/keywordplanner
**Requirements**: Google Ads account

### Manual Content Analysis
- **Keyword Density**: Check primary keyword usage (1-2%)
- **Content Length**: Ensure sufficient content depth
- **Semantic Keywords**: Related terms and LSI keywords
- **User Intent**: Content matches search intent

---

## 8. Technical SEO Audit

### Robots.txt Testing
```bash
# Check robots.txt is accessible
curl https://yourdomain.com/robots.txt
```

### Sitemap Validation
- Submit sitemap to Google Search Console
- Use online XML sitemap validators
- Ensure all important pages are included

### Canonical URLs
```html
<!-- Check canonical tags -->
<link rel="canonical" href="https://yourdomain.com/page">
```

---

## 9. Monitoring and Tracking

### Google Analytics 4
**Setup**:
1. Create GA4 property
2. Add tracking code to site
3. Set up goals and conversions

**Key Metrics**:
- Organic search traffic
- Bounce rate
- Session duration
- Conversion tracking

### Search Rankings
- Track keyword positions manually
- Use tools like SEMrush or Ahrefs (paid)
- Monitor Google Search Console impressions

---

## 10. Testing Checklist

### Pre-Launch SEO Checklist
- [ ] Title tags optimized (50-60 characters)
- [ ] Meta descriptions compelling (150-160 characters)
- [ ] H1 tag present and relevant
- [ ] Image alt text descriptive
- [ ] Structured data implemented
- [ ] Page speed optimized
- [ ] Mobile-friendly design
- [ ] Internal linking structure
- [ ] XML sitemap submitted
- [ ] Robots.txt configured
- [ ] Google Search Console verified

### Post-Launch Monitoring
- [ ] Monitor search rankings
- [ ] Track organic traffic
- [ ] Check for crawl errors
- [ ] Review Core Web Vitals
- [ ] Analyze user behavior
- [ ] Update content regularly

---

## Widget-Specific SEO Testing

### For Squarespace Code Block Widgets
1. **Test in Live Environment**: Widgets behave differently in Squarespace vs local dev
2. **Check Parent Page SEO**: Widget SEO affects overall page optimization
3. **Structured Data Integration**: Ensure widget schema doesn't conflict with page schema
4. **Performance Impact**: Test widget loading doesn't hurt page speed scores

### Concert Portfolio Widget v4.5 Testing
```javascript
// Test structured data generation
function testStructuredData() {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (script) {
    const data = JSON.parse(script.textContent);
    console.log('Structured data:', data);
    return data['@type'] === 'ImageGallery';
  }
  return false;
}

// Test alt text generation
function testAltText() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt || img.alt.length < 10) {
      console.log(`Poor alt text: ${img.alt} for ${img.src}`);
    }
  });
}

// Run SEO tests
testStructuredData();
testAltText();
```

---

## Common SEO Issues and Fixes

### High Priority
- Missing title tags
- Duplicate content
- Broken internal links
- Slow page speed
- Mobile usability issues

### Medium Priority
- Missing meta descriptions
- Poor image optimization
- Thin content
- Internal linking issues

### Low Priority
- Missing structured data
- Non-descriptive URLs
- Missing social meta tags

---

## Tools Summary

| Tool | Purpose | URL | Free/Paid |
|------|---------|-----|-----------|
| Rich Results Test | Structured data | search.google.com/test/rich-results | Free |
| Mobile-Friendly Test | Mobile optimization | search.google.com/test/mobile-friendly | Free |
| PageSpeed Insights | Performance | pagespeed.web.dev | Free |
| Search Console | Monitoring | search.google.com/search-console | Free |
| Keyword Planner | Research | ads.google.com/keywordplanner | Free |
| Lighthouse | Local testing | Chrome DevTools | Free |
| Google Analytics | Traffic analysis | analytics.google.com | Free |

---

## Next Steps

1. **Implement Testing**: Start with the tools appropriate for your current development stage
2. **Fix Issues**: Address critical SEO problems first
3. **Monitor Progress**: Set up ongoing monitoring with Search Console
4. **Content Optimization**: Focus on quality content and user experience
5. **Technical Maintenance**: Regularly audit and update SEO elements

Remember: SEO is a long-term strategy. Focus on providing value to users, and search engine visibility will follow.