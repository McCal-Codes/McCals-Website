# McCal Media Widget UI Standards: Buttons & Backgrounds

## Dark Mode Standard (2025-10-09)

- **All widgets and buttons must use dark backgrounds only.**
- Use the McCal Media business palette:
  - `#272423`, `#302C2C`, `#363230`, `#5B5553`, `#B8B0AA` (for subtle accents only)
- **No light backgrounds** (e.g., #fff, #CAC2BA) in the current standard—avoid eye strain and maintain a professional, gallery-like look.
- Buttons: Use dark backgrounds, subtle hover/active states, and neutral or light text for contrast.
- Glass/blur effects are encouraged for overlays and navigation.
- All color variables should be defined in CSS custom properties for easy future theming.


## Example CSS: Using Accent/Gradient Variables
```css
:root {
  /* See src/widgets/shared/theme.css for full variable list */
  --mc-accent-black: #272423;
  --mc-accent-dark: #302C2C;
  --mc-accent-slate: #363230;
  --mc-accent-stone: #5B5553;
  --mc-accent-taupe: #B8B0AA;
  --mc-gradient-accent: linear-gradient(90deg, #e0ad6aff 0%, #B8B0AA 100%);
}
.button, .btn {
  background: var(--mc-accent-black);
  color: var(--mc-accent-taupe);
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  text-decoration: none;
  display: inline-block;
}
.button:hover, .btn:hover {
  background: var(--mc-accent-slate);
  transform: translateY(-1px);
}
/* Accent gradient for chips, overlays, or lines */
.chip-accent {
  background: var(--mc-gradient-accent);
  color: var(--mc-accent-black);
}
```

> **Note:** Only use these accent/gradient variables for highlights, chips, overlays, or accent lines—not as base backgrounds. See `src/widgets/shared/theme.css` for the canonical variable list and usage notes.

## Accessibility
- Ensure all buttons and text have sufficient contrast (WCAG AA or better).
- Use `:focus` styles for keyboard accessibility.

## Future TODO (not urgent)
- [ ] Add a light/dark mode toggle for all widgets.
  - When implemented, use the same palette but invert for light backgrounds.
  - Ensure the toggle is accessible and does not cause eye strain.

---

This standard ensures a consistent, professional, and eye-friendly look for all McCal Media widgets. Update as needed when light/dark mode is prioritized.
