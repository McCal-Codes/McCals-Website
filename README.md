# McCal Media — Website & Development Workspace

This repository contains both the production website and development workspace for McCal Media, including reusable web widgets and site integrations.

## Repository Structure

### Production Site
- `site/`: Main website with photo galleries
- `images/`: Photo assets organized by portfolio type
- `.github/`: GitHub Actions for automated workflows

### Development Workspace
- `widgets/`: Reusable web widgets for embedding in various platforms
  - `concert-portfolio/`: Natural-height masonry gallery for concerts (GitHub-backed)
  - `github-portfolio-gallery/`: Grid/lightbox approach for generic portfolios
- `sites/`: Platform-specific setup documentation
  - `squarespace/`: Setup notes for embedding widgets via Code Block
- `notes/`: Development notes and website history
- `site-workspace/`: Local development files and recovery codes

## Quick Start

### Using Widgets (Squarespace)
1. Navigate to `widgets/[widget-name]/versions/`
2. Copy the latest version HTML file (e.g., `v2.1.html`)
3. Paste into a Squarespace Code Block
4. Adjust `data-panes` attribute to control number of items displayed
5. Ensure GitHub repo has proper image structure (see widget README)

### Adding Concert Photos
1. Create folder: `images/Portfolios/Concert/[Band-Name]/`
2. Add images and optional `manifest.json`:
   ```json
   {
     "date": "2025-09-16",
     "images": ["photo1.jpg", "photo2.jpg"]
   }
   ```
3. Push to main branch

## Versioning Policy
- **Major** (vN.0): Significant features/visual changes → new major version file
- **Minor** (vN.M): Small tweaks → increment by 0.1
- Each widget maintains its own CHANGELOG.md
- Repository-level changes tracked in root CHANGELOG.md

## Documentation
- Widget-specific docs: See individual `widgets/[name]/README.md`
- Development notes: `notes/site-notes.md`
- Platform setup: `sites/[platform]/README.md`
- Change history: `CHANGELOG.md`
