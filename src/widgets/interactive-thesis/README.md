# Interactive Thesis Widget

Self-contained interactive thesis page widget for Squarespace Code Blocks.

- Scroll reveal via IntersectionObserver (respects `prefers-reduced-motion`)
- Accessible Story Drawer overlay (v0.1) with ESC + click-away close, focus trap, return focus
- Images use `loading="lazy"` and `decoding="async"`
- Minimal inline CSS/JS; no external frameworks

## Files
- `versions/v0.1-minimal.html` — Minimal thesis intro + Story Drawer + sample images/audio
- `versions/v0.2-excerpts-inline-thesis.html` — Podcast excerpts grid + inline thesis placeholders (Abstract/Intro/Method/Findings/Conclusion)
- `versions/v0.3-thesis-live-excerpts.html` — Published Google Doc thesis embed + curated thesis-related podcast excerpts; excerpt cards restyled to match blog aesthetics
- `versions/v0.4-thesis-blog-format.html` — Thesis sections formatted as standalone blog-style cards (no iframe) plus curated thesis-related podcast excerpts

## Usage
1. Open the HTML file and copy all content.
2. Paste into a Squarespace Code Block on your page (`/thesis/interactive` recommended).
3. For v0.2: paste your actual thesis text into the marked TODO blocks.
4. For v0.3: ensure your Google Doc is published and replace the `iframe src` if needed; edit the `excerpts` array with correct `audioUrl`, `startSeconds`, `durationPreview`, and `quote`.
5. For v0.4: replace each thesis section card's placeholder text with finalized content; you can reorder or remove section cards as needed.

## Notes
- Meta/OG tags are intentionally omitted inside the widget since Squarespace manages page-level metadata.
- Audio previews use media fragments (`#t=start,end`) and do not preload; keep clips short (20–60s) for performance.
- v0.3 aligns card layout/styling with blog widgets (blog-grid/blog-card) for visual consistency.

## Next (Stretch)
- Podcast clip playlist
- Map overlay (journey timeline)
- Journal timeline with date anchors
