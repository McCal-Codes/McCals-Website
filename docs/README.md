# McCal Media — Widget Development Workspace

This repository is primarily a **development workspace for Squarespace widgets**. The main McCal Media website is hosted on Squarespace, and this repo contains the reusable widgets that embed into that site. The standalone site files are used only for testing widgets during development.

## Repository Structure

### Source Code
- `src/`: **All source code and assets**
  - `widgets/`: **PRIMARY:** Reusable web widgets for Squarespace
    - `concert-portfolio/`: Photo galleries for concert photography
    - `event-portfolio/`: Event photography displays
    - `photojournalism-portfolio/`: News and journalism photos
    - `about-widgets/`: Client logos, carousels, about sections
    - `blog-feed/`: External blog integration
    - `podcast-feed/`: Podcast episode displays
  - `images/`: Photo assets organized by portfolio type (feeds into widgets)
  - `site/`: Test site for widget development (not production)

### Documentation
- `docs/`: **All project documentation**
  - `deployment/`: Deployment guides and cheat sheets
  - `development/`: Development notes, site history, and platform setup
  - `VERSIONING.md`: Version management guidelines

### Development Tools
- `scripts/`: Build scripts, manifest generators, and automation tools
- `tests/`: Test files, HTML examples, and development workspace
  - `html/`: HTML test files and widget examples
  - `site-workspace/`: Local development files and backups
- `config/`: Configuration files (Docker, plist files)

### Build Output
- `dist/`: **Build output directory** (auto-generated, not tracked in git)
- `.github/`: GitHub Actions for automated workflows

## Quick Start

### Widget Development Workflow
1. **Add photos**: Place in `src/images/Portfolios/[Type]/[Name]/[Date]/`
2. **Generate manifests**: `npm run manifest:generate`
3. **Test widgets locally**: `npm run build && npm run serve`
4. **Copy widget code**: From `src/widgets/[name]/versions/[latest].html`
5. **Deploy to Squarespace**: Paste into Code Block

### Testing & Development
- **Build test site**: `npm run build`
- **Test locally**: `npm run serve` (opens at http://localhost:8080)
- **Auto-organize photos**: `npm run organize:concerts`
- **Quick reference**: See `deployment/DEPLOY-CHEATSHEET.md`

### Optional: Deploy Test Site
- **Interactive deployment**: `npm run deploy`
- **Specific platforms**: `npm run deploy:netlify` | `npm run deploy:vercel`
- *Note: Test site deployment is optional - main site is on Squarespace*

### Using Widgets (Squarespace)
1. Navigate to `src/widgets/[widget-name]/versions/`
2. Copy the latest version HTML file (e.g., `v2.1.html`)
3. Paste into a Squarespace Code Block
4. Adjust `data-panes` attribute to control number of items displayed
5. Ensure GitHub repo has proper image structure (see widget README)

### Adding Concert Photos
1. Create folder: `src/images/Portfolios/Concert/[Band-Name]/`
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
- **Deployment Guide**: `docs/deployment/DEPLOYMENT.md` - Complete tutorial for deploying test sites
- **Package Deployment**: `docs/deployment/PACKAGE-DEPLOYMENT.md` - Deploy as NPM package, Docker container, or distribution archive
- **Quick Deploy**: `docs/deployment/DEPLOY-CHEATSHEET.md` - Common deployment commands
- Widget-specific docs: See individual `src/widgets/[name]/README.md`
- Development notes: `docs/development/notes/site-notes.md`
- Platform setup: `docs/development/[platform]/README.md`
- Change history: `CHANGELOG.md`
