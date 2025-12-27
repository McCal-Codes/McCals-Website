# Widget Optimization & Visual Polish Learnings

**Date:** December 15, 2025
**Context:** Revamping `complete-about-page` (v1.5.4 -> v1.5.6)

This document captures the key technical and aesthetic lessons learned during the recent sprint to optimize the About Page widget. These patterns should be applied to future widget updates.

## 1. Performance Optimizations ("The Efficiency Layer")

### Hybrid Dynamic Statistics Pattern

We implemented a robust 3-layer fallback system for calculating statistics (Clients/Projects/Years) without blocking page load.

- **Layer 1 (Config)**: Fetch a lightweight JSON config first.
- **Layer 2 (Manifests)**: If config fails, lazily fetch heavy portfolio manifests (async) to count real data.
- **Layer 3 (Hardcoded Fallback)**: If all else fails, use safe defaults embedded in the script.
- **Lesson**: Never block the initial render for "nice-to-have" numbers. Hardcode a safe baseline and let the script "upgrade" the numbers if/when data loads.

### Content Visibility

We dealt with heavy layout thrashing by applying modern CSS properties to sections that are off-screen.

```css
.ss-client-showcase,
.ss-reviews-section {
  content-visibility: auto; /* Browser skips rendering layout/paint off-screen */
  contain-intrinsic-size: 500px; /* Placeholder height to prevent scrollbar jumping */
}
```

**Impact**: drastically reduces the main-thread work during the initial load of proper heavy widgets.

### IntersectionObserver for Data

Instead of running the statistics calculation immediately (fetching 3 JSON files), we wrapped the logic in an `IntersectionObserver`.

- **Result**: Network requests only fire when the user actually scrolls the stats section into view.

## 2. Visual Polish ("The Premium Layer")

### True Glassmorphism 2.0

We moved beyond simple `backdrop-filter: blur()` to a physically plausible glass effect.

- **Inner Shadow**: Adds thickness to the glass slab.
  `box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);`
- **Gradient Border**: Mimics light catching the top-left edge.
  `border-image: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.01) 100%);`
- **Noise Texture** (Planned): Adding subtle grain improves realism.

### Metallic Glint Effects

For client logos, we added a "sheen" animation without using JavaScript.

```css
/* The white bar that slides across */
.logo::after {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-25deg);
  /* Animation triggered on parent hover */
}
```

**Lesson**: CSS pseudo-elements are cheaper and smoother than JS for hover effects.

### Scroll Entrance

We replaced static content with a "Scroll Reveal" pattern using a single reusable Observer.

- **HTML**: Add class `.ss-reveal` (default `opacity: 0, scale: 0.98, y: 30px`).
- **JS**: Observer toggles `.active` (transition to `opacity: 1, scale: 1, y: 0`).
- **Lesson**: Staggering children (using `.ss-reveal-delay-1`) creates a sense of flow and quality.

## 3. Workflow Insights

### Iterative Versioning

We successfully improved the widget safely by splitting concerns:

1.  **v1.5.4** (Baseline)
2.  **v1.5.5** (Performance): Added lazy loading & `content-visibility`. Logic changes only.
3.  **v1.5.6** (Visuals): Added Glass 2.0 & Animations. CSS changes primarily.

This approach meant if Visuals (v1.5.6) had bugs, we could fallback to Performance (v1.5.5) instantly without losing the efficiency gains.

## 4. Reusable Snippets

_(Copy these for future widgets)_

**The "Glass 2.0" CSS Variable Set:**

```css
--bg-glass: rgba(20, 20, 20, 0.65);
--bg-glass-heavy: rgba(12, 12, 12, 0.85);
--border-glass: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.08) 0%,
  rgba(255, 255, 255, 0.02) 100%
);
--shadow-glass: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
```

**The "Scroll Observer":**

```javascript
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);
```

---

## 5. Event Branding & Resilience (Dec 27, 2025)

**Context:** Bugfix for `event-portfolio` (v2.9.0-WIP) and cross-widget versioning.

### URL Normalization Regression

We encountered a regression in the `toUrl` function during the monochrome-to-themed transition.

- **The Issue**: The logic for prepending `src/` to image paths became inconsistent, causing images to break when they were already correctly prefixed or when they relied on specific RAW URL structures.
- **The Fix**: Reverted to the stable `toUrl` implementation from v2.7.0 which uses 3 clear layers:
  1.  Direct pass-through for absolute/data URLs.
  2.  Prefix detection for `src/images/Portfolios/Events/` (canonical).
  3.  Fallback detection for `images/Portfolios/Events/` (Squarespace legacy) which prepends `src/`.
- **Lesson**: Image path normalization is high-risk. Always test with a "Reference Version" (like v2.7.0) when refactoring data handling.

### Global API Naming & Scoping

To avoid collisions when multiple widgets occupy the same global scope (e.g., inside a complex CMS page), we moved away from generic naming.

- **Change**: `window.portfolioAPI` -> `window.eventPortfolioAPI`.
- **Mapping**: Exposed explicit global handlers (`window.refreshData = () => window.eventPortfolioAPI.refreshData()`) to satisfy legacy `onclick` attributes in HTML while keeping the internal API safely namespaced.
- **Lesson**: Always namespace widget APIs specifically (e.g., `eventPortfolioAPI`, `concertPortfolioAPI`) to prevent "The Last Widget Wins" bugs in global scope.

### Workflow Lessons 🛑

- **Operational Rule**: **Work on ONE widget at a time.**
- **Rationale**: Batching "minor" changes (like WIP version updates) across 10 widgets simultaneously creates massive diffs, complicates debugging, and increases the surface area for errors.
- **Standard**: Each session should have a distinct focus (e.g., "Fix Event Portfolio", "Enhance Blog CSS"). Avoid "Global Refactors" unless explicitly requested.
- **Version Markers**: Use `-WIP` (e.g., `v2.9.0-WIP`) during the active development phase to distinguish between "under construction" code and "production stable" releases. This prevents accidental rollouts of half-finished features.

---
