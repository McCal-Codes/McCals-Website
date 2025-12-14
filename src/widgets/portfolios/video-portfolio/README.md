# Video Portfolio Widget

**Current Version: v0.1.0** — Multimedia gallery for showcasing video work (local MP4, YouTube, Vimeo) with accessible playback, lazy thumbnails, filtering, and SEO structured data.

## Overview

A self-contained Squarespace-compatible widget that renders a performant video gallery with lightbox playback. Designed to extend existing photo portfolio patterns (critical CSS, progressive enhancement, accessibility) to video content.

## Features

### Multimedia Support

- Local MP4 sources (direct URLs, CDN, or GitHub raw) — fallback poster images
- External platforms: YouTube & Vimeo (ID-only embed convenience)
- Mixed source grid with consistent styling & lazy initialization

### Performance & UX

- Critical CSS inlined for fast first paint
- Lazy thumbnail loading via native `loading="lazy"`
- Deferred player creation (on interaction only)
- IntersectionObserver for reveal animations (skipped with `prefers-reduced-motion`)
- Optional `data-max-items` limiting initial render (progressive hydrate on scroll)

### Accessibility

- Keyboard controls: Enter/Space to play/pause, `m` mute toggle, `Esc` to close lightbox
- Focus trap inside lightbox while open, restore focus to triggering card on close
- ARIA roles & labels for videos, categories, and transcript panel (future)
- Reduced motion compliance (disables non-essential transitions)

### Filtering

- Tag/category buttons auto-generated from dataset (e.g., `interview`, `promo`, `behind-the-scenes`)
- `data-default-filter` attribute to preselect a category (optional)
- Graceful fallback (all videos displayed if filtering disabled)

### SEO

- JSON-LD `VideoObject` entries + `ItemList` wrapper
- Automatic duration / uploadDate injection from dataset
- Future: transcript & caption extraction for enhanced search visibility

### Debug Mode

- Add `?debug=true` to page URL to log dataset parsing & structured data output

## Usage (Squarespace)

1. Copy entire contents of `versions/v0.1.0-video-portfolio.html`.
2. Paste into a Squarespace Code Block.
3. (Optional) Adjust `data-max-items`, `data-default-filter`, or replace inline dataset `<script id="videoPortfolioData" type="application/json">` with real video metadata.
4. Replace sample poster thumbnails with your real previews.
5. Confirm videos load and keyboard controls function.

## Configuration (Data Attributes on Root Element)

- `data-max-items` — Limit number of initial videos (progressive hydrate beyond via scroll). Default: all.
- `data-default-filter` — Tag to auto-select on load (e.g., `interview`).
- `data-widget-version` — Set internally for debugging.
- `data-player-theme` — `dark` | `light` (future).

## Inline Dataset Schema

The widget reads JSON from a `<script type="application/json" id="videoPortfolioData">` tag:

```jsonc
{
  "version": "0.1.0",
  ## Active Versions
  - v0.1.0 (current)

  Older versions will be archived under `src/widgets/_archived/Legacy Widgets/video-portfolio/` as the widget evolves.
  "generated": "2025-11-19T00:00:00.000Z",
  "videos": [
    {
      "id": "sample-local-1",
      "title": "Promo Reel Intro",
      "description": "Short teaser intro sequence.",
      "sourceType": "mp4", // mp4 | youtube | vimeo
      "src": "https://example.com/videos/promo-intro.mp4", // or YouTube/Vimeo ID
      "poster": "https://example.com/posters/promo-intro.jpg",
      "duration": 46,
      "uploadDate": "2025-10-01",
      "tags": ["promo"],
      "width": 1280,
      "height": 720
    }
  ]
}
```

## Roadmap

- Manifest generator (`scripts/manifest/generate-video-manifest.js`) aligning with existing image manifest architecture
- Transcripts & captions panel (WCAG, SEO enrichment)
- Adaptive bitrate streaming via HLS/DASH with quality selection
- Performance metrics surface (`window.videoPortfolioAPI.getMetrics()`) + debug panel
- CI validations: dataset schema, structured data, accessibility audits (axe-core)

## Changelog

See `CHANGELOG.md` for detailed version history.

## Troubleshooting

- Blank grid? Ensure inline JSON dataset is valid (check console) or remove trailing commas.
- Playback issues on iOS? Ensure MP4 sources are H.264/AAC encoded; avoid unsupported codecs.
- Keyboard not working? Confirm focus lands on card (Tab) then press Enter.
- SEO script missing? Dataset must have at least one valid video entry when DOMContentLoaded fires.

## License

Self-contained HTML. No external runtime dependencies. Embeddable in Squarespace under the repository license.

## Credits

Inspired by existing photo portfolio widgets (Concert v4.7 performance baseline).
