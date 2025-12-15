# Portfolio Enhancements Pattern Guide

This document captures the patterns and learnings from enhancing the **concert-portfolio** and **photojournalism-portfolio** widgets so they can be applied consistently to other portfolio widgets.

---

## Features Implemented

### 1. Anchored Links (Deep Linking)

**Purpose:** Allow direct linking to specific items within a portfolio.

**Implementation:**

- Each card gets a unique `id` attribute (slugified from title)
- Anchor button appears on hover (top-left corner)
- Clicking copies the full URL with hash to clipboard
- Toast notification confirms copy

**CSS Classes:**

- `.anchor-link` - The button overlay
- `.copy-toast` - The notification element

**JS Functions:**

- `slugify(str)` - Converts title to URL-safe ID
- `copyAnchorLink(id, event)` - Handles clipboard copy

---

### 2. Hash Navigation (Auto-Open on Anchor Visit)

**Purpose:** When visiting a URL with `#band-name`, auto-scroll and open that item.

**Implementation:**

- `handleHashNavigation()` runs after init
- Finds card by ID, reveals if hidden, scrolls to it
- Opens lightbox after short delay
- Listens for `hashchange` event for dynamic navigation

---

### 3. Load More (Progressive Loading)

**Purpose:** Show initial batch, reveal more on demand for better performance.

**Configuration:**

- `data-panes="12"` - Initial visible cards
- `data-batch-size="6"` - Cards per "Load More" click

**Implementation:**

- All cards rendered, extras get `.hidden` class
- Button shows remaining count
- Clicking removes `.hidden` and adds `.visible` with staggered delay

**CSS Classes:**

- `.load-more-wrap` - Button container
- `.load-more-btn` - The button
- `.remaining` - Count badge inside button

**State:**

- `state.allSlots` - All available items
- `state.visibleCount` - Currently visible count

---

### 4. Animated Entrance (Staggered Fade-Up)

**Purpose:** Premium feel when cards appear.

**Implementation:**

- Cards start with `opacity: 0; transform: translateY(24px)`
- `.visible` class triggers animation
- `transitionDelay` set per card: `${index * 80}ms`
- Uses `cubic-bezier(0.16, 1, 0.3, 1)` for smooth easing

**CSS:**

```css
.card {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.card.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

### 5. View Count Badge

**Purpose:** Show engagement metrics on each card.

**Implementation:**

- Positioned absolute top-right with glassmorphism
- Uses `formatViews(count)` to display (e.g., 2400 → "2.4k")
- Currently uses demo random data; can wire to analytics later

**CSS Classes:**

- `.view-badge` - The badge element

---

### 6. Inline Spotify Embeds

**Purpose:** Let visitors preview artist music directly in "Support the Artists" panel.

**Implementation:**

- Artist IDs stored in `#spotifyArtistMap` JSON script
- If ID exists: render compact 80px Spotify iframe inline
- If no ID: show subtle placeholder with "Open" link

**Embed URL Format:**

```
https://open.spotify.com/embed/artist/{ARTIST_ID}?utm_source=generator&theme=0
```

**Finding Artist IDs:**

1. Go to artist's Spotify page
2. Copy ID from URL: `spotify.com/artist/6yQwlVvYdvOdzTkFGJCtzf`

---

### 7. SEO-Enhanced Anchor Links

**Purpose:** Make anchor links indexable by search engines.

**Implementation:**

- Structured data includes `hasPart` array with each item as `ImageObject`
- Each item has `@id` and `url` set to the anchor URL (e.g., `page.html#event-name`)
- Includes `thumbnailUrl`, `name`, `description`, `dateCreated` for each
- Links parent gallery via `isPartOf`

**JSON-LD Structure (per item):**

```json
{
  "@type": "ImageObject",
  "@id": "https://example.com/portfolio#event-name",
  "name": "Event Name",
  "description": "Event Name photojournalism coverage - Oct 2025",
  "url": "https://example.com/portfolio#event-name",
  "thumbnailUrl": "https://...",
  "dateCreated": "2025-10-15",
  "author": { "@type": "Person", "name": "Caleb McCartney" },
  "isPartOf": { "@id": "https://example.com/portfolio" }
}
```

**Benefits:**

- Search engines can index individual items within the gallery
- Rich snippets may show direct links to specific events
- Improved discoverability for deep-linked content

---

## File Naming Convention

Widget version files should include the **widget name** to avoid confusion:

```
v{X}.{Y}.{Z}-{widget-name}-{feature}.html
```

**Examples:**

- `v4.9.0-concert-enhanced.html`
- `v5.4.0-photojournalism-enhanced.html`
- `v2.1.0-nature-enhanced.html`

---

## File Structure

```
src/widgets/portfolios/{portfolio-name}/
├── versions/
│   ├── v{X}.{Y}.{Z}-{widget-name}-{feature}.html   ← Widget versions
│   └── ...
├── CHANGELOG.md                                     ← Version history
└── README.md                                        ← Usage docs
```

---

## Applying to Other Portfolios

When enhancing a new portfolio widget:

1. **Copy the latest version** (include widget name):

   ```bash
   cp v{current}.html v{new}-{widget-name}-enhanced.html
   ```

2. **Add CSS for new features** (view badge, load more, anchor, animations)

3. **Update HTML structure:**
   - Add `#loadMoreWrap` button container
   - Add `#copyToast` element

4. **Update JS:**
   - Add `slugify()`, `formatViews()`, `copyAnchorLink()`
   - Add `updateLoadMoreButton()`, `loadMoreCards()`
   - Add `handleHashNavigation()`
   - Update `addStructuredData()` to include `hasPart` with anchor URLs
   - Update render loop to include badges, anchors, hidden classes

5. **Update state:**
   - Add `allSlots`, `visibleCount`, `openLightbox` references

6. **Update CHANGELOG.md** with new version entry

---

## Widgets Enhanced

- [x] concert-portfolio → `v4.9.0-concert-enhanced.html`
- [x] photojournalism-portfolio → `v5.4.0-photojournalism-enhanced.html`
- [ ] event-portfolio
- [ ] nature-portfolio
- [ ] featured-portfolio
- [ ] portrait-portfolio
- [ ] video-portfolio

---

## Spotify Artist Map Template

```json
{
  "Band Name": "spotify-artist-id",
  "Horseburner": "6yQwlVvYdvOdzTkFGJCtzf",
  "Star Viper": "1hTGL0YIhETlizymMG0h1G"
}
```

---

_Last updated: 2025-12-15_
