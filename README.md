# McCal Media — Website & Development Workspace

This repository contains both the production website and development workspace for McCal Media, including reusable web widgets and site integrations.

## Repository Structure

### Production Site
- `site/`: **Main website source code** with photo galleries
- `dist/`: **Build output directory** (auto-generated, not tracked in git)
- `images/`: Photo assets organized by portfolio type
- `.github/`: GitHub Actions for automated workflows

### Development Workspace
- `widgets/`: Reusable web widgets for embedding in various platforms
  - `concert-portfolio/`: Natural-height masonry gallery for concerts (GitHub-backed)
  - `github-portfolio-gallery/`: Grid/lightbox approach for generic portfolios
- `sites/`: Platform-specific setup documentation
  - `squarespace/`: Setup notes for embedding widgets via Code Block
- `notes/`: Development notes and website history
- `site-workspace/`: Local development files, test files, and backups
  - `public-site-standalone/`: Alternative standalone website version
  - `squarespace-backup/`: Extracted Squarespace admin interface backup
  - Test files and debugging utilities

## Quick Start

### Deploying a Test Site
1. **Interactive deployment** (recommended): `npm run test-deploy`
2. **Quick deployments**:
   - **Build first**: `npm run build`
   - **Test locally**: `npm run serve` (opens at http://localhost:8080)
   - **Deploy**: `npm run deploy:netlify` | `npm run deploy:vercel` | `npm run deploy:surge`
3. **Deploy standalone version**: Use files from `site-workspace/public-site-standalone/`
4. **Quick reference**: See `DEPLOY-CHEATSHEET.md` for common commands

### Deploying as Package
1. **NPM Package**: `npm run package` (creates redistributable .tgz file)
2. **Docker Container**: `npm run docker:build` then `npm run docker:run`
3. **Distribution Archive**: See `PACKAGE-DEPLOYMENT.md` for comprehensive options

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
- **Deployment Guide**: `DEPLOYMENT.md` - Complete tutorial for deploying test sites
- **Package Deployment**: `PACKAGE-DEPLOYMENT.md` - Deploy as NPM package, Docker container, or distribution archive
- **Quick Deploy**: `DEPLOY-CHEATSHEET.md` - Common deployment commands
- Widget-specific docs: See individual `widgets/[name]/README.md`
- Development notes: `notes/site-notes.md`
- Platform setup: `sites/[platform]/README.md`
- Change history: `CHANGELOG.md`
