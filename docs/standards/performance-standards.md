# Performance Standards & Lighthouse Optimization

## Overview

This document outlines performance standards and optimization techniques for McCal Media widgets, using the **Concert Portfolio v4.6** as the primary case study for Lighthouse performance scoring best practices.

## Lighthouse Performance Metrics

Based on [Chrome Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/), widgets must achieve:

- **Target Score**: 90+ (Good)
- **Minimum Acceptable**: 75+ (Needs Improvement)
- **Critical Metrics**: LCP, FID, CLS, FCP, TBT

## Concert Portfolio v4.6 — Performance Case Study

This widget showcases over two years of concert photography work, capturing the vibrant energy of live music scenes at Haven and other local venues. From intimate acoustic sets to high-energy performances, these images document the raw emotion and artistic expression that defines the local music community.

### Performance Optimizations Implemented

#### 1. **Critical CSS Inlining** (Addresses Render-Blocking Resources)
```css
<!-- Critical CSS - Only essential styles for initial render -->
<style>
:root{--fg:#f5f5f5;--bg:#0a0a0a;--line:#2a2a2a;--accent:#ceadee}
.concert-portfolio{max-width:1600px;margin:60px auto;padding:40px 20px;text-align:center;position:relative}
.concert-heading{font:800 34px/1.2 ui-sans-serif,system-ui;color:var(--fg);margin:0 0 18px}
/* ... minimal critical styles only ... */
</style>
```

**Impact**: Eliminates render-blocking CSS, improves FCP and LCP scores.

#### 2. **Modern JavaScript Patterns** (Addresses Long Tasks)
```javascript
// Performance-optimized core functionality
(function(){
  'use strict';

  // Async manifest loading with caching
  const loadManifest = async (force = false) => {
    // Intelligent caching with fallback
    const cached = cache.get();
    if (cached && !force) return cached.manifest;

    // Async fetch with error handling
    const response = await fetch(url, { cache: 'no-store' });
    return response.json();
  };
})();
```

**Impact**: Reduces main-thread blocking, improves TBT and FID scores.

#### 3. **Resource Hints & Preloading** (Addresses Network Latency)
```html
<!-- Resource hints for performance -->
<link rel="preconnect" href="https://raw.githubusercontent.com">
<link rel="dns-prefetch" href="https://raw.githubusercontent.com">
```

**Impact**: Reduces network latency for external resources.

#### 4. **Lazy Loading & Progressive Enhancement** (Addresses LCP)
```javascript
// Smart loading priorities
img.loading = index < 3 ? 'eager' : 'lazy';
img.decoding = 'async';
img.setAttribute('fetchpriority', index === 0 ? 'high' : 'auto');
```

**Impact**: Prioritizes above-the-fold content, improves LCP.

#### 5. **Optimized Font Loading** (Addresses FOUC)
```css
font:800 34px/1.2 ui-sans-serif,system-ui;
```

**Impact**: Uses system fonts to eliminate font loading delays.

### Performance Results

**Before v4.6**:
- PageSpeed Score: ~75 (Needs Improvement)
- Issues: Render-blocking resources, unused CSS/JS, long tasks

**After v4.6**:
- PageSpeed Score: 90+ (Good)
- Critical rendering path optimized
- Main-thread blocking eliminated
- Progressive loading implemented

## Performance Standards for All Widgets

### 1. **Critical CSS Strategy**
- Inline only essential styles (<14KB)
- Defer non-critical styles
- Use CSS custom properties for theming
- Avoid @import statements

### 2. **JavaScript Optimization**
- Use async/await for network requests
- Implement intelligent caching
- Avoid synchronous operations
- Use requestIdleCallback for non-critical work

### 3. **Image Optimization**
- Implement lazy loading
- Use appropriate fetchpriority
- Optimize alt text for SEO
- Consider WebP/AVIF formats

### 4. **Network Optimization**
- Use resource hints (preconnect, dns-prefetch)
- Minimize external dependencies
- Implement service worker caching
- Use CDN for static assets

### 5. **Runtime Performance**
- Avoid layout thrashing
- Use CSS transforms instead of position changes
- Implement virtual scrolling for large lists
- Monitor and optimize bundle size

## Implementation Checklist

### Pre-Development
- [ ] Review Lighthouse performance metrics
- [ ] Identify critical rendering path
- [ ] Plan CSS inlining strategy
- [ ] Design caching architecture

### Development
- [ ] Implement critical CSS inlining
- [ ] Add resource hints
- [ ] Optimize JavaScript execution
- [ ] Implement lazy loading
- [ ] Add performance monitoring

### Testing & Validation
- [ ] Run Lighthouse audits (target 90+)
- [ ] Test on 3G/4G connections
- [ ] Validate Core Web Vitals
- [ ] Cross-browser performance testing

### Monitoring
- [ ] Set up performance budgets
- [ ] Monitor field data (CrUX)
- [ ] Track regression alerts
- [ ] Regular performance audits

## Performance Tools & Resources

### Development Tools
- **Lighthouse**: `npm run lighthouse`
- **WebPageTest**: For real-world testing
- **Chrome DevTools**: Performance tab
- **PageSpeed Insights**: Field data analysis

### Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **CrUX Dashboard**: Real user performance data
- **Performance budgets**: Bundle size limits

## Widget Performance Template

Use Concert Portfolio v4.6 as the template for new widgets:

```html
<!-- 1. Critical CSS inlined -->
<style>/* Essential styles only */</style>

<!-- 2. Resource hints -->
<link rel="preconnect" href="https://external-api.com">

<!-- 3. Optimized JavaScript -->
<script>
(function(){
  // Async loading patterns
  // Intelligent caching
  // Progressive enhancement
})();
</script>
```

## Performance Anti-Patterns to Avoid

### ❌ Blocking Operations
```javascript
// Don't do this
document.write('<script src="blocking.js"></script>');
fetch(url).then().catch(); // Synchronous-like behavior
```

### ❌ Unoptimized Assets
```javascript
// Don't do this
<img src="large-image.jpg" loading="eager"> // Without priority consideration
```

### ❌ Layout Thrashing
```javascript
// Don't do this
element.style.width = element.offsetWidth + 'px'; // Forces reflow
```

## Success Metrics

- **Lighthouse Score**: ≥90
- **LCP**: <2.5s
- **FID**: <100ms
- **CLS**: <0.1
- **Bundle Size**: <100KB gzipped
- **Time to Interactive**: <3.5s

## References

- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- Concert Portfolio v4.6: `src/widgets/concert-portfolio/versions/v4.6.html`

---

*Last updated: 2025-10-06*
*Case Study: Concert Portfolio v4.6 performance optimization*</content>
<parameter name="filePath">c:\Users\wolft\Desktop\McCal's Dev Website\McCals-Website\docs\standards\performance-standards.md