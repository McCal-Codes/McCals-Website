# Changelog — McCals Site

All notable changes to the Squarespace concert portfolio snippet.

## v2.1 — 2025-09-16
- Auto date now prioritizes EXIF DateTimeOriginal from images (earliest of up to 3 samples)
- Fallback order: manifest.date → EXIF → latest commit date

## v2.0 — 2025-09-16
- Natural-height masonry via CSS columns (no cropping)
- Auto date support: manifest.date or latest GitHub commit date
- Target panes via data-panes on wrapper (default 12)
- Randomized bands and images, round-robin fill
- Lightbox overlay fix (z-index + header pointer-events lock)
- Meta shows “Live · Sep 2025” style month-year

## v1.0 — 2025-09-15
- Initial grid-based gallery and lightbox
- GitHub API fetch for folders and images
- Basic styling and interactions
