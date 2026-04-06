# Onboarding — McCal Media Website

Welcome! This is a quick, zero-surprise setup guide for developing the Vite-based McCal Media website.

## Prerequisites

- Node.js 18+ (required for Vite and modern tooling)
- npm with network access to the public registry
- macOS/Linux/WSL (Windows PowerShell also supported)

## First-time setup (5–7 minutes)

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open http://localhost:5173 (or the port shown in terminal)

The dev server supports hot module replacement (HMR) for instant updates.

## Everyday commands (safe defaults)

- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Run linting: `npm run lint`
- Type check: `npm run type-check` (if configured)
- Repo health sweep: `npm run repo:health`

## Development workflow

1. Start the dev server: `npm run dev`
2. Edit components in `src/components/`
3. Add images to `src/images/Portfolios/`
4. Test locally at http://localhost:5173
5. Build for production: `npm run build`
6. Deploy from `dist/` folder

## What lives where

- **Components**: `src/components/` — React components
- **Pages**: `src/pages/` — Page-level components
- **Assets**: `src/images/Portfolios/**` — Photo assets and manifests
- **Styles**: `src/styles/` — Global CSS and Tailwind config
- **Public**: `public/` — Static files copied to build
- **Docs**: `docs/` — All documentation
- **Scripts**: `scripts/` — Build and utility scripts
- **Build output**: `dist/` — Generated static site (don't edit directly)

## Secrets & environment variables

- Copy `.env.example` to `.env` and fill required fields when using API features
- Optional values are marked; you can leave them blank for local development

## If something looks off

- Run `npm run build` to check for build errors
- Run `npm run repo:health` for a quick sweep
- Check `docs/standards/workspace-organization.md` for guardrails

Happy building!
