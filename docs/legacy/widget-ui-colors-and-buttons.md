# McCal Media Widget UI Standards: Buttons & Backgrounds

## Dark Mode Standard (2025-10-09)

- **All widgets must use a pitch-black background (#050506).**
- **Business Accent Palette:**
  - `#302C2C`, `#363230`, `#5B5553`, `#B8B0AA`, `#CAC2BA`
- **No chromatic colors** (reds, pinks, blues) in the current standard.
- Buttons: Use business gradients, subtle hover states, and dark text on light accents for contrast.
- Glass effects: Use `rgba(30, 30, 30, 0.85)` for panels on black backgrounds.
- All color variables should be defined in CSS custom properties for easy future theming.

## Example CSS: Using Accent/Gradient Variables

```css
:root {
  /* See src/widgets/shared/theme.css for full business variable list */
  --mc-accent-bg: #050506;
  --mc-accent-slate: #1a1a1b;
  --mc-accent-stone: #2a2a2a;
  --mc-accent-taupe: #5b5553;
  --mc-accent-light: #b8b0aa;
  --mc-accent-bright: #cac2ba;

  /* Business Gradients */
  --mc-gradient-business: linear-gradient(135deg, #cac2ba 0%, #b8b0aa 100%);
  --mc-gradient-subtle: linear-gradient(135deg, #5b5553 0%, #363230 100%);
}
.button,
.btn {
  background: var(--mc-gradient-business);
  color: #050506;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.button:hover,
.btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
/* Accent gradient for chips, overlays, or lines */
.chip-accent {
  background: var(--mc-gradient-subtle);
  color: #ffffff;
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
