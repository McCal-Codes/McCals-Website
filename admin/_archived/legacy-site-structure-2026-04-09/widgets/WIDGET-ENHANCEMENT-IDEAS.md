# Widget Enhancement Roadmap

This document outlines future ideas for improving the visual quality and efficiency of the widgets in `src/widgets/`, specifically prioritizing "wow" factor visuals and performance efficiency.

## 1. Visual Polish ("The Wow Factor")

### True Glassmorphism 2.0

The current glass effect is a standard blur. To make it feel "premium" and physical:

- **Noise Texture**: Add a subtle SVG noise filter or background image to the glass panels to simulate frosted textures.
- **Refined Borders**: Use a `linear-gradient` for the border color (e.g., top-left white to bottom-right transparent) to simulate light hitting the edge.
- **Inner Shadow**: Add a very faint white `box-shadow: inset` to give the glass thickness.

**Implementation Idea:**

```css
.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  /* Add noise via pseudo-element */
}
```

### Scroll Entrance Animations

Instead of static elements, elements should fade and slide up as they enter the viewport.

- **Technique**: Use `IntersectionObserver` to add a `.visible` class to sections (`.ss-about-bio`, `.ss-reviews-card`).
- **Effect**: `transform: translateY(20px) -> 0`, `opacity: 0 -> 1`.
- **Stagger**: Apply delays to child elements (e.g., reviews or client logos) so they cascade in (100ms, 200ms, 300ms...).

### Micro-Interactions

- **Logo Sheen**: When hovering over a client logo, a "glint" of light (white gradient) should sweep across the logo diagonally.
- **Magnetic Buttons**: Subtle movement of buttons towards the cursor when hovering nearby (optional, high effort but very premium).
- **Click Effects**: Pulse or ripple effects on the "Get In Touch" buttons.

## 2. Efficiency & Performance

### Image Optimization & CLS

- **Explicit Sizing**: Ensure `<img>` tags for client logos have `width` and `height` attributes (or aspect-ratio CSS) even if they are fluid. This prevents Cumulative Layout Shift (CLS) when images load.
- **WebP Conversion**: If valid, ensure logos are served as WebP where possible (requires changing the source URLs).

### Code Splitting (Advanced)

- For larger widgets, consider splitting the CSS into critical (inline) and non-critical (lazy loaded), though for single-file widgets this might add complexity.

### Zero-Layout Thrashing

- Ensure JS animations (like the carousel) use `transform` and `opacity` only (compositor threads) and never `top/left/margin` to avoid repaints.

## 3. Candidate Widgets for Revamp

- `complete-about-page`: Partially done (v1.5.5 added Stats animation). Needs Glassmorphism 2.0.
- `concert-portfolio`: Already advanced (v4.9.0). Could benefit from "Noise" textures.
- `site-navigation`: Could use "Magnetic" hover effects on links.
