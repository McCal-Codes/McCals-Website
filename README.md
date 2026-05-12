# McCal Media Website

This repository contains the source code and documentation for the McCal Media website. The main site is built with Vite and serves as the public-facing portfolio and project hub. Legacy widget code is archived and no longer the focus of development.

## Quick Start

**Requirements:** Node.js 20.19+ and npm.

1. Install dependencies: `npm install`
2. Start the dev server for the production site: `cd sites/mcc-cal-vite && npm run dev`
3. Open [http://localhost:5173](http://localhost:5173) to view the site.

## Project Structure

- `sites/mcc-cal-vite/` — **Production site** (Vite-based, main public site)
- `sites/dev.mcc-cal.com/` — **Dev/Preview site** (Next.js, for local development and previews)
- `src/` — Shared source code (images, data, API, widgets [archived])
- `docs/` — Documentation, standards, and migration notes
- `scripts/` — Build, manifest, and utility scripts

## Development

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run end-to-end tests

**Code Quality:**
- TypeScript for type safety
- ESLint for code standards
- Prettier for formatting
- Component-based architecture with React

**Performance Features:**
- Lazy loading for large components
- Image optimization and CDN delivery
- Skeleton loaders for portfolio grids
- Code splitting for better bundle sizes

## Sites

- **Production Site (`sites/mcc-cal-vite`)**: The main site, built with Vite. All new content and features are developed here.
- **Dev/Preview Site (`sites/dev.mcc-cal.com`)**: Next.js-based preview and development harness. Use for local development, previews, and testing before production deployment.

## Legacy Widgets (Archived)

Legacy widget code and documentation are archived. Widgets remain available for Squarespace/CDN embedding, but all new development is focused on the Vite site. See `src/widgets/` and `docs/standards/widget-reference.md` for legacy details.

## Documentation

- `docs/` — All documentation, standards, and migration notes
- `docs/standards/` — Coding, performance, and accessibility standards
- `docs/2026-COMPLETE.md`, `docs/2026-READY.md` — Project status and migration notes

## Development Workflow

- Run `npm install` and `npm run dev` in `mcc-cal-vite/` for the main site
- Use `sites/dev.mcc-cal.com/` for preview/testing as needed
- Legacy widget validation: `npm run validate:widgets` (rarely needed)
- Run manifest/image scripts as needed for portfolio updates

### Blog Workflow

- Canonical blog source: `src/content/blog/`
- Authors: `src/content/blog/authors.json`
- Preferred authored post source: `src/content/blog/posts/<slug>/post.md`
- Generated runtime post document: `src/content/blog/posts/<slug>/post.json`
- Compile Markdown posts and rebuild the blog manifest: `npm run manifest:blog`
- Compile Markdown posts only: `npm run blog:compile`
- Validate blog authors, post metadata, and referenced local assets: `npm run blog:validate`
- Generate JSON/RSS feeds: `npm run blog:feed`
- Run the full blog publish prep (compile, validate, manifest, feeds): `npm run blog:generate`
- Migrate existing JSON posts to Markdown: `npm run blog:migrate-markdown`
- Import Google Docs into canonical blog posts: `npm run blog:sync-docs`

## Deployment

- Production site (`mcc-cal-vite`) is deployed via Vercel or static hosting
- Legacy widgets are published via jsDelivr CDN for Squarespace embedding (archived)

## Contributing

This is a personal project. No outside contributors are accepted at this time.

## License

See [LICENSE](LICENSE) for details.
- CDN-hosted manifests (no API required): see [docs/manifest-cdn.md](docs/manifest-cdn.md) for jsDelivr URLs and the publish workflow.

### CI webhook notifications for manifests

Manifest workflows notify the API (if secrets set) so caches can be warmed automatically.

- Composite action: `/.github/actions/notify-manifest-webhook` centralizes webhook logic.
- Secrets required: `MANIFEST_WEBHOOK_URL` (or `MANIFEST_WEBHOOK_BASE`) and `WEBHOOK_SECRET`. If absent, notification step is skipped safely.

---

## ✅ Widget Validation & Continuous Integration

All Squarespace widgets are automatically validated for standards compliance (namespace wrapper, inline CSS/JS, version attribute).

### Widget Release

We use tag-based releases for deploying widgets to Squarespace via jsDelivr:

- Tag format: `widget-name@MAJOR.MINOR.PATCH` (e.g., `interactive-thesis@0.4.0`)
- Pre-publish CI: On tag push, `.github/workflows/prepublish-widget-release.yml` runs preflight, HTML validation, and manifest dry-run, then uploads reports.
- CDN pattern: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/<path-to-versioned-html>`
- Example: `https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@interactive-thesis@0.4.0/src/widgets/interactive-thesis/versions/v0.4-thesis-blog-format.html`



Fixing validation errors:

1. Run locally: `node scripts/utils/validate-widget-html.js`
2. Read error output for offending files.
3. Update HTML per `docs/standards/widget-standards.md`.
4. Commit & push; CI re-validates.

## 🆕 Recent Organizational Highlights

- Test files consolidated under `tests/`
- Docs categorized (workflows, automation, integrations, standards, etc.)
- Widget status clarity (archives, WIP markers)
- Root directory cleaned (legacy test artifacts removed)



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

Performance Regression CI:

- A headless Playwright-based performance scaffold runs basic metrics for widgets and uploads HTML reports. Lighthouse integration will be added in a subsequent iteration.

Quick Reference: `docs/standards/widget-reference.md`
Architecture & Patterns: `docs/standards/widget-standards.md`
Code Annotations: `docs/standards/code-annotations.md` — **TODO, FIXME, BUG, SECURITY, and other annotation keywords**
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
- **Blog Feed** (`src/widgets/blog-feed/`) - External blog integration _(in development)_
- **Nature Portfolio** (`src/widgets/nature-portfolio/`) - Nature photography displays _(in development)_

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

Common scripts:

- `npm run dev` — Start the local dev server
- `npm run build` — Build the test site
- `npm run serve` — Serve the built site
- `npm run validate:widgets` — Validate widget structure
- `npm run repo:health` — Repository health checks
- `npm run lint` — ESLint
- `npm run test` — Playwright tests

Quick task aliases:

| Script                       | What it does                                   |
| ---------------------------- | ---------------------------------------------- |
| `npm run ai:preflight:short` | Fast context/standards preflight (no writes)   |
| `npm run dev`                | Serve local demo site at http://localhost:3000 |
| `npm run validate:widgets`   | Validate widget HTML structure (no writes)     |
| `npm run manifest:dry-run`   | Dry-run manifest generation (no writes)        |
| `npm run repo:health`        | Clean + preflight + large-file scan            |

## Contributing

- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branching, testing, and review expectations.
- Contributions are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
- Repository-wide improvement roadmap: [`docs/repo-improvement-plan.md`](docs/repo-improvement-plan.md).

## Documentation

Widget Documentation:

- See `docs/widgets/index.md` for per-widget usage summaries and links.

Full documentation lives in [`docs/README.md`](docs/README.md) and includes:

- Standards: `docs/standards/`
- Workflows: `docs/workflows/`
- Automation: `docs/automation/`
- Integrations: `docs/integrations/`
- Deployment: `docs/deployment/`
- Tutorials: `docs/tutorials/`

## Important Notes

Security and recovery events are tracked in [`docs/important-notes/`](docs/important-notes/). The latest entry is `2025-10-09-secret-removal.md`.
