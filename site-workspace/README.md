# McCals Site — Widgets and Site Integrations

Organized workspace for reusable web widgets and site-specific setup docs.

- widgets/
  - concert-portfolio/: Natural-height masonry gallery for concerts (GitHub-backed)
  - github-portfolio-gallery/: Earlier grid/lightbox approach (generic portfolios)
- sites/
  - squarespace/: Setup notes for embedding widgets via Code Block

Versioning policy
- Major (vN.0): significant features/visual changes → new major version file
- Minor (vN.M): small tweaks → increment by 0.1
- Each widget has its own CHANGELOG.md; see root CHANGELOG.md for repo-level changes

Quick start (Squarespace)
- Paste a widget HTML file into a Code Block (e.g., widgets/concert-portfolio/versions/v2.1.html)
- Adjust data-panes on the wrapper to control number of cards
- Ensure GitHub repo McCal-Codes/McCals-Website has images/Portfolios/Concert with optional manifest.json

