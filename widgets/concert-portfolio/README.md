# Concert Portfolio Widget

Natural-height masonry gallery that pulls images from GitHub (images/Portfolios/Concert), includes lightbox, randomized bands/images, and automatic date labeling.

Usage
- Squarespace: Paste a versioned HTML file from versions/ into a Code Block
- Control count: <div id="concertPf" data-panes="12"> (change 12 to desired)
- Date label: prefers manifest.date; falls back to EXIF or latest commit date (v2.1)

GitHub structure
images/Portfolios/Concert/
  Band-Name/
    manifest.json (optional)
    *.jpg|png|webp|gif

Versions
- See CHANGELOG.md; current latest: v2.1
