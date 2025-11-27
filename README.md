# McCal Media – Squarespace Widget Development Workspace

This repository hosts the development workspace for McCal Media's Squarespace widgets. It includes the widget source files, a local test site, automation scripts, and standards that keep contributions consistent and production-ready.

## Getting Started

**Requirements:** Node.js 18+ and npm.

1. Install dependencies:
## Available Widgets

Critical repository events, security incidents, and recovery steps are documented in [docs/important-notes/](docs/important-notes/).

**Latest:** [2025-10-09-secret-removal.md](docs/important-notes/2025-10-09-secret-removal.md) — Google Cloud service account secret removal and repository history rewrite. All collaborators must re-clone the repository.

- CDN-hosted manifests (no API required): see [docs/manifest-cdn.md](docs/manifest-cdn.md) for jsDelivr URLs and the publish workflow.

### CI webhook notifications for manifests

Manifest workflows notify the API (if secrets set) so caches can be warmed automatically.

- Composite action: `/.github/actions/notify-manifest-webhook` centralizes webhook logic.
- Secrets required: `MANIFEST_WEBHOOK_URL` (or `MANIFEST_WEBHOOK_BASE`) and `WEBHOOK_SECRET`. If absent, notification step is skipped safely.

---

## ✅ Widget Validation & Continuous Integration

All Squarespace widgets are automatically validated for standards compliance (namespace wrapper, inline CSS/JS, version attribute).

Fixing validation errors:
1. Run locally: `node scripts/utils/validate-widgets.js`
2. Read error output for offending files.
3. Update HTML per `docs/standards/widget-standards.md`.
4. Commit & push; CI re-validates.

## 🆕 Recent Organizational Highlights

- Test files consolidated under `tests/`
- Docs categorized (workflows, automation, integrations, standards, etc.)
- Widget status clarity (archives, WIP markers)
- Root directory cleaned (legacy test artifacts removed)

## AI Assistant Quick Start

Read: `docs/standards/workspace-organization.md` then `.github/copilot-instructions.md`.
Preflight commands: `npm run ai:preflight:short` | `npm run ai:preflight` | `npm run ai:preflight:json`.

## Widget Catalog

Production:
- Concert Portfolio — performance + SEO reference (v4.x line)
- Event Portfolio — dynamic category & shuffle (v2.6.x)
- Featured Portfolio — curated highlights
- Photojournalism Portfolio — news/journalism (v5.x in progress)
- Portrait Portfolio — vertical composition (v1.x)
- Video Portfolio — accessible multimedia (v0.1)
- About Page / Client Carousel — bio & logos
- Podcast Feed — auto-hydrating episodes
- Hero Slideshow — landing hero sections
- Site Footer — accessible glass footer
- Hire to Unlock Résumé — interactive résumé experience
- Admin Portfolio Importer — private image ingestion tool

Work In Progress:
- Photojournalism Portfolio v5.1 optimization
- Blog Feed integration
- Nature Portfolio gallery

## Development Standards

Quick Reference: `docs/standards/widget-reference.md`
Architecture & Patterns: `docs/standards/widget-standards.md`
Enhancements: `docs/standards/widget-enhancements.md`
Performance: `docs/standards/performance-standards.md`
SEO Starter: `docs/standards/seo-starter-guide.md`
Image SEO: `docs/standards/image-seo-standards.md`

## Using Widgets in Squarespace (Summary)
1. Copy latest version HTML from `src/widgets/<name>/versions/`
2. Paste into a Squarespace Code Block
3. Adjust data attributes (see widget README)
4. Regenerate manifests after adding images
5. Validate: `npm run validate:widgets`

## Important Notes
Security & recovery events: `docs/important-notes/` (latest: 2025-10-09-secret-removal.md)
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
=======
- **Concert Portfolio** (`src/widgets/concert-portfolio/`) — Concert photography galleries
- **Event Portfolio** (`src/widgets/event-portfolio/`) — Event photography displays
- **Featured Portfolio** (`src/widgets/featured-portfolio/`) — Curated highlights
- **Photojournalism Portfolio** (`src/widgets/photojournalism-portfolio/`) — News and journalism photos
- **Portrait Portfolio** (`src/widgets/portrait-portfolio/`) — Vertical-focused portrait galleries
- **Video Portfolio** (`src/widgets/video-portfolio/`) — Multimedia gallery with accessible playback (v0.1)
- **About Section Widgets** (`src/widgets/about/`) — About pages and client carousels
- **Podcast Feed** (`src/widgets/podcast-feed/`) — Podcast episode displays
- **Hero Slideshow** (`src/widgets/hero-slideshow/`) — Homepage hero sections
- **Site Footer** (`src/widgets/site-footer/`) — Accessible footer with social links and newsletter
- **Hire to Unlock Résumé** (`src/widgets/hire-to-unlock-resume/`) — Interactive résumé experience
- **Admin Portfolio Importer** (`src/widgets/admin-portfolio-importer/`) — Private admin tool for portfolio imports

### Work in Progress
- **Photojournalism Portfolio v5.1** — Performance optimization
- **Blog Feed** — External blog integration
- **Nature Portfolio** — Nature photography displays
>>>>>>> 4f7e971f5bdf9e25b8dc6ffbf28e46ace3760853

## Development & Testing

Common scripts:
- `npm run dev` — Start the local dev server
- `npm run build` — Build the test site
- `npm run serve` — Serve the built site
- `npm run validate:widgets` — Validate widget structure
- `npm run repo:health` — Repository health checks
- `npm run lint` — ESLint
- `npm run test` — Playwright tests

## Contributing

- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branching, testing, and review expectations.
- Contributions are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
- Repository-wide improvement roadmap: [`docs/repo-improvement-plan.md`](docs/repo-improvement-plan.md).

## Documentation

Full documentation lives in [`docs/README.md`](docs/README.md) and includes:
- Standards: `docs/standards/`
- Workflows: `docs/workflows/`
- Automation: `docs/automation/`
- Integrations: `docs/integrations/`
- Deployment: `docs/deployment/`
- Tutorials: `docs/tutorials/`

## Important Notes

Security and recovery events are tracked in [`docs/important-notes/`](docs/important-notes/). The latest entry is `2025-10-09-secret-removal.md`.
