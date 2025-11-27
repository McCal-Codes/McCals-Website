# McCal Media – Squarespace Widget Development Workspace

This repository hosts the development workspace for McCal Media's Squarespace widgets. It includes the widget source files, a local test site, automation scripts, and standards that keep contributions consistent and production-ready.

## Getting Started

**Requirements:** Node.js 18+ and npm.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the local dev server and preview widgets:
   ```bash
   npm run dev
   ```
3. Validate widgets (structure, attributes, and inline requirements):
   ```bash
   npm run validate:widgets
   ```
4. (Optional) Generate manifests after changing images:
   ```bash
   npm run manifest:generate
   ```

For a quick repository context check before large edits, run the AI preflight summary:
```bash
npm run ai:preflight:short
```

## Repository Map

- `src/widgets/` — Production and in-progress Squarespace widgets (self-contained HTML/CSS/JS)
- `src/site/` — Local test harness for widgets
- `src/images/` — Portfolio images organized by widget type
- `scripts/` — Build, manifest, deployment, and automation scripts
- `docs/` — Standards, workflows, integrations, and tutorials
- `tests/` — Organized test files (HTML and Playwright)
- `.github/` — CI workflows and AI assistant instructions

## Using Widgets in Squarespace

1. Open `src/widgets/[widget-name]/versions/` and copy the latest HTML file (e.g., `v4.7.html`).
2. In Squarespace, add a **Code Block** and paste the widget HTML.
3. Adjust widget attributes (e.g., `data-panes`) as needed; see each widget README for specifics.
4. Regenerate manifests when adding images so widget galleries stay in sync.

## Available Widgets

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
