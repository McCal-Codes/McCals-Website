# Dark Mode Audit — Widgets

This checklist guides auditing dark mode support across all widgets.

## Audit Targets
- Verify presence of CSS custom properties for color tokens.
- Ensure `prefers-color-scheme` media queries or explicit `.theme-dark` toggles.
- Confirm focus-visible styles have sufficient contrast in dark mode.
- Validate lightbox overlays and text maintain AA contrast.
- Check icons/SVGs invert properly or use currentColor.
- Ensure reduced motion is respected in both modes.

## Quick Checks
- Toggle system theme: macOS Appearance or browser devtools emulation.
- Inspect computed colors for text/background: aim for WCAG AA.
- Validate buttons/links hover/active/focus-visible states.
- Verify version badges and overlays adapt.

## Implementation Patterns
- Define base tokens:
  - `--bg`, `--text`, `--muted`, `--accent`, `--overlay`
- Light theme:
```css
:root{--bg:#ffffff;--text:#111827;--muted:#6b7280;--accent:#0ea5e9;--overlay:rgba(0,0,0,.6)}
```
- Dark theme:
```css
@media (prefers-color-scheme: dark){:root{--bg:#0b1220;--text:#e5e7eb;--muted:#94a3b8;--accent:#22d3ee;--overlay:rgba(0,0,0,.7)}}
```
- Use tokens:
```css
body{background:var(--bg);color:var(--text)}
.btn{color:var(--text);background:var(--accent)}
```

## Accessibility
- Use `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`
- Ensure link underline or color contrast is >= 4.5:1.
- Lightbox captions: text vs background contrast >= 4.5:1.

## Testing
- Include a dev-only toggle (`?debug=true`) to force theme classes.
- Add Playwright/Lighthouse checks to capture color contrast (future).

## Reporting
- Document findings per widget in `docs/widgets/index.md` or the widget README.
