# Portrait Portfolio v2.0.0 Enhancement Plan

## Overview

Transform portrait-portfolio from v1.1 to v2.0.0 with all enhanced features matching concert and photojournalism widgets.

---

## Changes Summary

### 1. Theme & Styling Updates

**Current State:**

- Purple accent color (`#ceadee`)
- Mixed styling approach
- No enhanced feature CSS

**Changes:**

- ✅ Switch to monochrome theme (`--accent: #ffffff`)
- Add CSS for view badges (top-right overlay with eye icon)
- Add CSS for anchor links (top-left chain icon, visible on hover)
- Add CSS for load more button (glassmorphism style)
- Add CSS for animated entrance (fade-up with stagger)
- Add CSS for copy toast notification
- Update tab styling to match monochrome theme

---

### 2. HTML Structure Updates

**Current State:**

```html
<div class="portrait-portfolio" id="portraitPf" data-panes="20" data-widget-version="1.1">
  <h2>Portrait Portfolio <span class="version-indicator">v1.1</span></h2>
  <p class="portrait-subheading">...</p>
  <div class="portrait-tabs" id="portraitTabs"></div>
  <div class="portrait-loading">...</div>
  <div class="portrait-grid" id="portraitGrid"></div>
</div>
```

**Changes:**

- Update `data-panes="12"` (reduce from 20 for faster load)
- Add `data-batch-size="6"` attribute
- Update `data-widget-version="2.0.0"`
- Update version indicator to `v2.0`
- Add load more button container after grid:
  ```html
  <div class="load-more-wrap" id="loadMoreWrap">
    <button class="load-more-btn" id="loadMoreBtn">
      <span>Load More</span>
      <span class="remaining" id="loadMoreRemaining">+0</span>
    </button>
  </div>
  ```
- Add copy toast element:
  ```html
  <div class="copy-toast" id="copyToast">Link copied</div>
  ```
- Update changelog modal with v2.0.0 entry

---

### 3. JavaScript Enhancements

**Current State:**

- Basic manifest loading
- Subject tab filtering
- Simple card rendering
- No enhanced features

**Changes to Add:**

#### A. Configuration & State

```javascript
const CONFIG = {
  panes: 12,
  batchSize: 6,
  cacheDuration: 30 * 60 * 1000,
  // ... existing config
};

let state = {
  // ... existing state
  allSlots: [],
  visibleCount: 0,
  openLightbox: null,
};
```

#### B. New Utility Functions

- `slugify(str)` - Convert portrait name to URL-safe ID
- `formatViews(count)` - Format view counts (e.g., "2.4k")
- `copyAnchorLink(portraitId, e)` - Copy anchor URL to clipboard
- `updateLoadMoreButton()` - Update button state and remaining count
- `loadMoreCards()` - Reveal next batch of hidden cards
- `handleHashNavigation()` - Auto-open portrait from URL hash

#### C. Enhanced Card Rendering

Each card will include:

- Unique `id` attribute (slugified portrait name)
- `hidden` class for cards beyond initial panes
- View count badge (top-right)
- Anchor link button (top-left, visible on hover)
- Staggered `transitionDelay` for animation
- `data-slot` attribute with JSON for hash navigation

#### D. SEO Enhancement

Update `addStructuredData()` to include:

```javascript
{
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  '@id': baseUrl,
  // ... existing fields
  'hasPart': [
    {
      '@type': 'ImageObject',
      '@id': 'https://mcc-cal.com/portraits#portrait-name',
      'name': 'Portrait Name',
      'url': 'https://mcc-cal.com/portraits#portrait-name',
      'thumbnailUrl': '...',
      'dateCreated': '...',
      'author': { '@type': 'Person', 'name': 'Caleb McCartney' },
      'isPartOf': { '@id': baseUrl }
    }
    // ... for each portrait (up to 20)
  ]
}
```

#### E. Author URL Fix

- Change from `https://mccalmedia.com` to `https://mcc-cal.com`

---

### 4. Manifest Structure Considerations

**Current:** Uses `collections` array with `collectionName`
**Note:** Keep this structure for portraits (it's appropriate for subject-based organization)
**Ensure:** Each collection has proper metadata for SEO

---

### 5. Performance Optimizations

- Limit total slots to `CONFIG.panes * 4` (48 max)
- Use browser caching for manifest (remove `cache: 'no-store'`)
- Extend cache TTL to 30 minutes
- Lazy load images with proper `loading` attribute
- Stagger animations to avoid jank

---

### 6. Accessibility & UX

- Proper ARIA labels on anchor buttons
- Keyboard navigation for all interactive elements
- Focus management in lightbox
- Screen reader announcements for load more
- Reduced motion support

---

## File Changes Required

1. **v2.0.0-portrait-enhanced.html** - Main widget file
2. **CHANGELOG.md** - Add v2.0.0 entry
3. **PORTFOLIO-ENHANCEMENTS.md** - Update checklist

---

## Testing Checklist

- [ ] Anchored links copy to clipboard
- [ ] Hash navigation opens correct portrait
- [ ] Load more reveals 6 cards at a time
- [ ] Animations stagger smoothly
- [ ] View counts display correctly
- [ ] Subject tabs still work
- [ ] Lightbox functions properly
- [ ] SEO structured data validates
- [ ] Mobile responsive
- [ ] Keyboard accessible

---

## Estimated Changes

- **Lines Modified:** ~400-500 lines
- **New CSS:** ~160 lines
- **New JavaScript:** ~200 lines
- **HTML Updates:** ~20 lines

---

_Created: 2025-12-15_
