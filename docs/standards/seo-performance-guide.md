# SEO & Performance Optimization Guide

This guide documents SEO and performance best practices for all widgets in the McCals-Website repository.

## Quick Reference

Run automated audits:
```bash
npm run seo:audit          # Scan all widgets for SEO issues
npm run images:optimize    # Generate WebP/AVIF variants
```

## SEO Best Practices

### 1. Structured Data (Schema.org JSON-LD)

Every widget should include Schema.org structured data in the `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Concert Photography Portfolio",
  "description": "Professional concert photography featuring live music performances",
  "author": {
    "@type": "Person",
    "name": "McCal Media"
  },
  "image": [
    "https://example.com/path/to/image1.jpg",
    "https://example.com/path/to/image2.jpg"
  ]
}
</script>
```

**Widget-specific schemas:**
- Concert/Event/Portrait Portfolios → `ImageGallery`
- About page → `Person` or `ProfilePage`
- Blog/Podcast → `BlogPosting` / `PodcastSeries`
- Contact → `ContactPage`

### 2. Meta Tags & Open Graph

Required in every widget:
```html
<meta name="description" content="Concise 155-character description for search results">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Social media description">
<meta property="og:image" content="https://example.com/social-preview.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### 3. Image Optimization

**Alt text (required):**
```html
<img src="concert.jpg" alt="Musician playing guitar on stage at Red Rocks Amphitheatre" loading="lazy">
```

**Alt text formula:**
- Subject + action + context + location (if relevant)
- Example: "Portrait of Sarah Johnson smiling in natural light studio"

**Responsive images (recommended):**
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="..." loading="lazy" width="800" height="600">
</picture>
```

**Lazy loading:**
- Add `loading="lazy"` to all images except above-the-fold (hero images)
- Use Intersection Observer for custom lazy-load logic

### 4. Semantic HTML

Use semantic elements:
```html
<main>
  <article>
    <h1>Portfolio Title</h1>
    <section aria-label="Photo gallery">
      <!-- gallery content -->
    </section>
  </article>
</main>
```

## Performance Best Practices

### 1. Core Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### 2. CSS Optimization

```html
<style>
/* Critical above-fold CSS inline */
.hero { /* minimal styles */ }
</style>
<!-- Non-critical CSS can be async -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 3. JavaScript Optimization

- Use `defer` for non-critical scripts
- Use `async` for independent scripts
- Minimize main-thread blocking (< 300ms tasks)
- Use Web Workers for heavy computation

### 4. Caching Strategy

Service Worker cache strategy (recommended):
```javascript
// Cache-first for images
// Network-first for manifests/data
// Stale-while-revalidate for CSS/JS
```

## Accessibility (A11y)

### ARIA Labels

```html
<button aria-label="Close lightbox" onclick="closeLightbox()">×</button>
<nav aria-label="Main navigation">...</nav>
<img src="photo.jpg" alt="..." aria-describedby="caption-1">
<p id="caption-1">Detailed caption text</p>
```

### Keyboard Navigation

Essential keyboard support:
- `Tab` / `Shift+Tab` → Navigate focusable elements
- `Enter` / `Space` → Activate buttons
- `Escape` → Close modals/lightboxes
- Arrow keys → Navigate galleries

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});
```

### Focus Management

```javascript
// Trap focus in modals
const modal = document.querySelector('.lightbox');
const focusable = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
// Implement focus trap logic
```

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Use tools: WebAIM Contrast Checker, Lighthouse

## Testing

### Manual Testing Checklist

- [ ] Run `npm run seo:audit` — no issues
- [ ] Test with screen reader (VoiceOver on macOS, NVDA on Windows)
- [ ] Keyboard-only navigation works
- [ ] Lighthouse score > 90 (all categories)
- [ ] Test on slow 3G connection
- [ ] Verify images load progressively
- [ ] Check mobile responsiveness

### Automated Tools

```bash
# SEO audit
npm run seo:audit

# Lighthouse CI (requires setup)
npx lhci autorun --config=lighthouserc.json

# Accessibility check
npx pa11y-ci src/widgets/**/*.html
```

## Widget Template

See `docs/standards/widget-template.html` for a complete boilerplate with:
- Structured data
- Meta tags
- Semantic HTML
- ARIA labels
- Lazy loading
- Keyboard navigation
- Performance optimizations

## Resources

- [Schema.org documentation](https://schema.org/)
- [Web.dev performance guide](https://web.dev/performance/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- Repository standards: `docs/standards/performance-standards.md`, `docs/standards/image-seo-standards.md`

---

_Last updated: 2025-11-04_
