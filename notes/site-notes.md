# Caleb McCartney — Website Living Notes

Last updated: 2025-09-16 00:57 UTC

Link to prior chat context (for reference):
https://chatgpt.com/share/68c8b16e-7790-800a-a395-c4b082e6833c

---

## Active Feature: Concert Portfolio (Squarespace Code Block)

Purpose: pull concert photos from GitHub and show a natural-height masonry gallery with a vertical lightbox.

Key behaviors
- Source: GitHub repo McCal-Codes/McCals-Website, path images/Portfolios/Concert
- Uses manifest.json when present; otherwise lists files in folder
- Randomizes: order of bands and images on each page load
- Target panes: renders up to N cards using data-panes on the wrapper (default 12)
- Natural-height masonry via CSS columns (no cropping)
- Lightbox: vertical scroll with hint and keyboard controls (Esc to close, j/down, k/up)
- Date label: prefers manifest.date; if absent, uses latest commit date for that folder/manifest (cached in sessionStorage). Renders as short month and year (e.g., "Sep 2025").
- Z-index fix: lightbox sits above Squarespace header/nav.

Adjustments
- Number of cards: in the wrapper <div id="concertPf" data-panes="12"> → change 12 to desired count
- Date display style: switch formatter to monthYear for full month name if desired

---

## GitHub Repository Structure

Repository: https://github.com/McCal-Codes/McCals-Website

Expected path for concerts:
images/Portfolios/Concert/
  Band-Name-1/
    manifest.json (optional)
    image1.jpg
    image2.webp
  Band-Name-2/
    ...

Manifest options
1) Array format:
[
  "photo1.jpg",
  "photo2.jpg"
]

2) Object format with date (preferred):
{
  "date": "YYYY-MM-DD",
  "images": ["photo1.jpg", "photo2.jpg"]
}

Notes
- If manifest.json has a date, it is used. Otherwise, the latest commit affecting that path is queried for a date (and cached per session).
- Any nested band folders are supported (the code detects the first folder with a manifest or images).

---

## Lightbox and Header Overlap (Squarespace)

Fixes used
- Lightbox container z-index set to 2147483647 to beat template headers
- While open, add a class to <html> (lb-open) and disable pointer events on header elements

Result
- Lightbox fully overlays nav/header and captures all clicks while open

---

## Troubleshooting

- Photos not showing
  - Verify path images/Portfolios/Concert exists and repo is public
  - Check the browser console for GitHub API rate-limit messages (60/hour unauthenticated).
  - Ensure images have supported extensions: jpg, jpeg, png, webp, gif
  - If using manifest.json, confirm valid JSON and correct filenames.

- Header overlapping lightbox
  - Confirm z-index override and body/html class toggling are present as described above.

- Performance
  - Session storage caches commit dates to reduce API calls per session
  - Randomization is in-memory; no persistent indexing required

---

## How to Add a New Concert

1) Create a folder under images/Portfolios/Concert, e.g., images/Portfolios/Concert/The Book Club
2) (Recommended) Add manifest.json:
{
  "date": "2025-05-01",
  "images": [
    "sample.jpg",
    "shot-1.jpg",
    "shot-2.webp"
  ]
}
3) Push to main. The site will pick it up automatically.

---

## Keyboard and A11y
- Cards are focusable (Enter/Space open the lightbox)
- Lightbox supports Esc to close; large-scroll with j/down, k/up
- Aria attributes set on lightbox dialog

---

## Known Constraints
- GitHub API unauthenticated rate limit is 60 requests/hour/IP
  - If traffic grows, consider adding a small proxy or authenticated requests
- CSS columns provide simple masonry; order across columns is top-to-bottom per column

---

## Backlog / Ideas
- Optional: authenticated GitHub requests (to lift rate limit)
- Optional: pinned bands or curated order per page
- Optional: filter chips (year, band)
- Optional: skeleton loading placeholders
- Optional: per-band description sourced from a band.json
- Optional: CDN parameters / image resizing service for faster loads

---

## Versions
- v2.1: EXIF-first date derivation (earliest of up to 3 images), then commit date fallback
- v2.0: Natural masonry, Month/Year meta, target panes, header overlay fix
- v1.0: Initial grid gallery with GitHub API

---

## Quick Reference (Selectors / Attributes)
- Wrapper: #concertPf[data-panes] → target count of cards (default 12)
- Grid: .concert-grid (CSS columns)
- Card: .concert-card (natural height)
- Overlay: .concert-info → title + meta
- Lightbox root: #concertLightbox; open/close toggles body overflow and html.lb-open class

---

## Versioning Policy
- Major (vN.0): significant functional or visual updates → new file like widgets/concert-portfolio/versions/v2.0.html
- Minor (vN.M): small edits/tweaks → bump M by 0.1 and save as vN.(M+0.1)
- Keep widgets/concert-portfolio/CHANGELOG.md updated with each release.

---

Notes maintained by: Agent Mode (within Warp terminal)
