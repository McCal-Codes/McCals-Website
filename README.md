# TODO Auto-Checker System

The workspace includes an automated TODO checker that marks checklist items as done based on commit message keywords or changed files. See `docs/standards/widget-standards.md` and `scripts/welcome.js` for configuration and details.
# McCal Media ## AI Development Support

This workspace includes comprehensive AI assistant instructions and validation tools:

### AI Instructions (Read First)
- **Copilot**: `.github/copilot-instructions.md` — Efficient, full-stack development workflow. For longer or more complex tasks, break work into clear steps, use preflight validation, and document your process in the Recent Updates section. Always update instructions and standards after major changes.
- **Canvas**: `.github/canvas-instructions.md` — Efficient, focused widget editing
- **Codex**: `.github/codex-instructions.md` — Efficient, rate-limit optimized patterns

### Preflight Validation

### Afterflight Validation
Run after making changes to ensure workspace health and documentation:
- **Checklist**: See [Afterflight section in workspace-organization.md](docs/standards/workspace-organization.md#4-preflight--afterflight-checklists)
- **Validate scripts**: Run all npm scripts and workflows to ensure nothing is broken
- **Archive unused scripts**: Move obsolete scripts to `scripts/_archived/` and add a comment/header
- **Update documentation**: Record changes in `.github/copilot-instructions.md`, `CHANGELOG.md`, and standards docs
- **Final review**: Confirm workspace is organized, efficient, and easy to maintain

### Agent Responsibilities
- **Always read instructions first** when starting sessions
- **Update instructions** when discovering new patterns or workflows  
- **Add entries to Recent updates** section for significant changes in the Development Workspace

> **Version 2.4.0** — Squarespace widget development and testing environment

This repository is primarily a **development workspace for Squarespace widgets**, containing reusable web components that embed into your Squarespace site. The standalone site is used only for testing widgets before deployment to Squarespace.


## 📝 Important Notes

Critical repository events, security incidents, and recovery steps are documented in [docs/important-notes/](docs/important-notes/).

**Latest:** [2025-10-09-secret-removal.md](docs/important-notes/2025-10-09-secret-removal.md) — Google Cloud service account secret removal and repository history rewrite. All collaborators must re-clone the repository.

- CDN-hosted manifests (no API required): see [docs/manifest-cdn.md](docs/manifest-cdn.md) for jsDelivr URLs and the publish workflow.

---

## ✅ Widget Validation & Continuous Integration

All Squarespace widgets are automatically validated for standards compliance on every push and pull request.

- **Validation script:** `scripts/utils/validate-widgets.js` checks all widget HTML files for:
	- Namespace wrapper and `data-widget-version` attribute
	- Inline CSS and JavaScript (no external `<link>` or `<script src=...>`)
	- Basic HTML structure
	- (Planned) Accessibility and SEO checks
- **CI workflow:** `.github/workflows/widget-validate.yml` runs the validation script in GitHub Actions.
	- If any widget fails validation, the workflow fails and must be fixed before merging.

### How to Fix Validation Errors

1. Run the validation script locally:
	 ```bash
	 node scripts/utils/validate-widgets.js
	 ```
2. Review the error messages for the specific widget file(s).
3. Update the widget HTML to meet standards (see `docs/standards/widget-standards.md`).
4. Commit and push your changes. The CI workflow will re-run automatically.

For more details, see the [Widget Standards documentation](docs/standards/widget-standards.md).

## 🆕 Recent Updates (October 2025)

✅ **Repository Organization Complete**:
- **Test files organized**: All debug/test files moved to categorized `tests/html/` directories
- **Documentation restructured**: Docs organized by category (`workflows/`, `automation/`, `integrations/`, etc.)
- **Widget status clarified**: GitHub portfolio archived, blog feed & nature portfolio marked as WIP
- **Cleaner root directory**: Removed 15+ scattered test files from root level
- **Preserved functionality**: All builds, deployments, and workflows still work perfectly

## Before you start (AI assistants)

**Start Here:** For workspace/process standards, scripts organization, and validation checklists, see [docs/standards/workspace-organization.md](docs/standards/workspace-organization.md).

- Read these short instruction pages first:
	- Copilot: `.github/copilot-instructions.md`
	- Canvas: `.github/canvas-instructions.md`
	- Codex (ratelimit efficient): `.github/codex-instructions.md`
- Run a quick preflight summary before large edits:
	- VS Code task: “AI: Preflight (short)”
	- Or via npm:
		- `npm run ai:preflight:short`
		- `npm run ai:preflight`
		- `npm run ai:preflight:json`
	- This summarizes key bullets from the instruction docs so agents validate context fast.

## Primary Purpose: Squarespace Widgets

### Available Widgets
- **Concert Portfolio** (`src/widgets/concert-portfolio/`) - Photo galleries for concert photography *(v4.5 SEO enhancements in development)*
- **Event Portfolio** (`src/widgets/event-portfolio/`) - Event photography displays
- **Featured Portfolio** (`src/widgets/featured-portfolio/`) - Curated portfolio highlights
- **Photojournalism Portfolio** (`src/widgets/photojournalism-portfolio/`) - News and journalism photos
- **Portrait Portfolio** (`src/widgets/portrait-portfolio/`) - Portrait photography displays with vertical composition focus *(v1.0)*
- **Video Portfolio** (`src/widgets/video-portfolio/`) - Multimedia video gallery (local MP4, YouTube, Vimeo) with accessible playback *(v0.1)*
- **About Section Widgets** (`src/widgets/about/`) - Complete about pages and client carousels
  - Complete About Page - Bio, photo, reviews, and integrated client carousel
  - Client Carousel - Standalone client logo showcase
- **Podcast Feed** (`src/widgets/podcast-feed/`) - Podcast episode displays *(v2.0.0 with performance optimizations)*
- **Hero Slideshow** (`src/widgets/hero-slideshow/`) - Homepage hero sections
- **Site Footer** (`src/widgets/site-footer/`) - Glass design footer with social links and newsletter
- **Hire to Unlock Résumé** (`src/widgets/hire-to-unlock-resume/`) - Interactive résumé with LinkedIn authentication that critiques gatekeeping while collecting genuine hiring leads *(v1.0.0)*
- **Admin Portfolio Importer** (`src/widgets/admin-portfolio-importer/`) - 🔐 Private admin tool for importing and organizing portfolio images *(admin-only)*

### Work in Progress
- **Photojournalism Portfolio v5.1** (`src/widgets/photojournalism-portfolio/versions/v5.1-performance-optimized.html`) - Performance optimization pass in development
- **Blog Feed** (`src/widgets/blog-feed/`) - External blog integration *(in development)*
- **Nature Portfolio** (`src/widgets/nature-portfolio/`) - Nature photography displays *(in development)*

### Using Widgets in Squarespace

1. Navigate to `src/widgets/[widget-name]/versions/`
2. Copy the latest version HTML file (e.g., `v4.1.0.html`)
3. In Squarespace, add a **Code Block**
4. Paste the widget HTML code
5. Adjust `data-panes` or other attributes as needed
6. Each widget has its own README with specific instructions

### Widget Development Standards ⭐ **NEW**
- **Quick Reference**: `docs/standards/widget-reference.md` - Essential checklist for widget development
- **Complete Guide**: `docs/standards/widget-standards.md` - Comprehensive architecture and design standards
- **Enhancement Patterns**: Proven improvement patterns for optimizing existing widgets
- **SEO Testing Guide**: `docs/standards/seo-testing-guide.md` - Comprehensive SEO testing and validation methods
- **SEO Starter Guide**: `docs/standards/seo-starter-guide.md` - Practical Squarespace SEO playbook for McCal Media

## Development & Testing

### Quick Commands
```bash
# Generate image manifests for widgets
npm run manifest:generate

# Build test site (for widget testing only)
npm run build

# Test widgets locally  
npm run serve                    # Production-like server
npm run dev                      # Development server with auto-reload

# Auto-organize photos
npm run organize:concerts

# Deploy test site (optional - main site is Squarespace)
npm run deploy                   # Interactive deployment
npm run deploy:netlify           # Deploy to Netlify
npm run deploy:vercel            # Deploy to Vercel

# AI Development Tools
npm run ai:preflight:short       # Quick context validation
npm run ai:preflight             # Full preflight check
```

### Adding Concert Photos for Widgets
1. Create folder: `src/images/Portfolios/Concert/[Band-Name]/[Month Year]/`
2. Add photos and run `npm run manifest:generate`
3. Photos automatically appear in Squarespace concert widgets

## Project Structure

```
McCals-Website/
├── src/
│   ├── widgets/           # ⭐ MAIN: Squarespace widgets (7 production + 2 WIP)
│   │   └── _archived/     # Temporarily archived widgets
│   ├── images/            # Photo assets organized by portfolio type
│   └── site/              # Local test harness (development only)
├── scripts/               # Build scripts, manifest generators, deployment tools
├── docs/                  # 📁 ORGANIZED: Categorized documentation
│   ├── workflows/         # Step-by-step processes (photo import, etc.)
│   ├── automation/        # Automated system documentation  
│   ├── integrations/      # External service guides (Squarespace, etc.)
│   ├── standards/         # Naming conventions & versioning
│   ├── deployment/        # Deployment & hosting guides
│   └── archive/           # Historical & completed documentation
├── tests/                 # 🧪 ORGANIZED: Categorized test files
│   └── html/              # Test files by widget type and purpose
├── config/                # Build configuration & automation
└── .github/               # CI/CD workflows & AI instructions
```

## Documentation

📖 **[Complete Documentation](docs/README.md)** — Organized by category for easy navigation

### Quick Reference
- 🔄 **[Workflows](docs/workflows/)** - Adding photos, content import processes
- 🤖 **[Automation](docs/automation/)** - Photo organization & manifest generation
- 🔌 **[Integrations](docs/integrations/)** - Squarespace, external services
- 📏 **[Standards](docs/standards/)** - Naming conventions & versioning guidelines
- 🚀 **[Deployment](docs/deployment/)** - Build & deployment guides

### Widget Documentation
- **Concert Widget**: [src/widgets/concert-portfolio/README.md](src/widgets/concert-portfolio/README.md)
- **Event Widget**: [src/widgets/event-portfolio/README.md](src/widgets/event-portfolio/README.md)  
- **Featured Widget**: [src/widgets/featured-portfolio/README.md](src/widgets/featured-portfolio/README.md)
- **Journalism Widget**: [src/widgets/photojournalism-portfolio/README.md](src/widgets/photojournalism-portfolio/README.md)
- **All Widgets**: See individual `src/widgets/[name]/README.md` files

## What's New in v2.4

✨ **Comprehensive Repository Organization (October 2025)**:
- **📁 Organized Documentation**: Docs categorized by purpose (workflows, automation, standards, etc.)
- **🧪 Organized Testing**: Test files categorized by widget type and purpose
- **🗂️ Clean Structure**: Removed 15+ scattered files from root directory
- **📚 7 Production Widgets**: Core portfolio widgets ready for Squarespace deployment
- **🚧 Work-in-Progress Tracking**: Clear status indicators for widgets under development
- **🗄️ Widget Archival System**: Organized storage for temporarily inactive widgets
- **🤖 AI Development Support**: Preflight checks, comprehensive instructions
- **⚡ Enhanced Automation**: Concert photo organization, manifest generation
- **🔄 Improved Workflows**: Streamlined development and deployment processes

### Previous Updates (v2.0-2.3)
- Widget HTML files grouped with changelogs
- Clear separation of widgets vs test site  
- Improved photo organization scripts
- Streamlined development workflow

## Maintenance & Updates

### Update Schedule
This README is updated with major repository changes. Key update dates:
- **October 4, 2025**: Repository & documentation reorganization (v2.4.0)
- **Previous**: Widget expansion and AI development support (v2.0-2.3)

### Contributing
When making significant changes:
1. Update relevant documentation in `docs/` categories
2. Update widget READMEs for widget changes  
3. Update this README for major structural changes
4. Add entries to `CHANGELOG.md`
5. Run `npm run ai:preflight` to validate structure
6. For widget improvements, reference `docs/standards/widget-standards.md` and `docs/standards/widget-development.md`

### Getting Help
- 📖 **Documentation**: [docs/README.md](docs/README.md) - Comprehensive guides
- 🔧 **Widget Issues**: Check individual widget READMEs and changelogs
- 🤖 **AI Development**: See `.github/copilot-instructions.md`

---

*This workspace supports the McCal Media Squarespace site*
