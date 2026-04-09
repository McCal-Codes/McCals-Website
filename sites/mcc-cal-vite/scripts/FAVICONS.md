# Favicon Generation - Dark & Light Mode

Generates favicons that adapt to user's system color scheme.

## How It Works

**Dark Mode Browser Tabs:**
- White logo on dark background (`#0a0a0a`)
- Files: `favicon-dark-*.png`

**Light Mode Browser Tabs:**
- Black logo on light background (`#ffffff`)
- Files: `favicon-light-*.png`

**Adaptive SVG:**
- Uses CSS `prefers-color-scheme` media query
- Automatically switches between light/dark
- File: `favicon.svg`

## Generate Favicons

```bash
node scripts/generate-favicons-v2.js
```

## Output Files

### PNG (with media queries)
- `favicon-dark-16x16.png` / `favicon-light-16x16.png`
- `favicon-dark-32x32.png` / `favicon-light-32x32.png`
- `favicon-dark-96x96.png` / `favicon-light-96x96.png`
- `favicon.ico` (dark mode, for legacy browsers)

### Special Icons
- `apple-touch-icon.png` (dark theme, 180x180)
- `web-app-manifest-192x192.png` (PWA)
- `web-app-manifest-512x512.png` (PWA splash)

### SVG (Adaptive)
- `favicon.svg` - Uses CSS to adapt to color scheme

## HTML Setup

Already configured in `index.html`:

```html
<!-- SVG adapts automatically -->
<link rel="icon" type="image/svg+xml" href="/brand/favicon.svg" media="(prefers-color-scheme: light)" />
<link rel="icon" type="image/svg+xml" href="/brand/favicon-dark.svg" media="(prefers-color-scheme: dark)" />

<!-- PNG fallbacks -->
<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-light-32x32.png" media="(prefers-color-scheme: light)" />
<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-dark-32x32.png" media="(prefers-color-scheme: dark)" />
```

## Test

1. Build: `npm run build`
2. Switch your OS between light/dark mode
3. Browser tab favicon should change automatically
4. Test on Safari (macOS), Chrome, Firefox

## Troubleshooting

If favicon doesn't update:
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Clear browser cache
- Check DevTools → Application → Frames → top → Images
