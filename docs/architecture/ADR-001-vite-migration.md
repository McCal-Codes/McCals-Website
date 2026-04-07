# ADR-001: Migration from Squarespace Widgets to Vite/React

**Status**: Accepted  
**Date**: 2026-04-01  
**Deciders**: McCal Media Development Team

## Context

The McCal Media website was originally built on Squarespace using a widget-based architecture. Each section of the site (portfolios, navigation, footer, etc.) was implemented as standalone HTML/CSS/JS widgets that were embedded into Squarespace pages.

### Problems with the Widget Approach

1. **Security vulnerabilities**: Widgets contained hardcoded API keys and secrets
2. **Maintenance overhead**: 300+ widget files across multiple versions
3. **Performance**: No code splitting, duplicate dependencies
4. **Developer experience**: No hot module replacement, TypeScript, or modern tooling
5. **Deployment complexity**: Manual copy/paste into Squarespace

## Decision

Migrate to a modern Vite + React + TypeScript static site with the following architecture:

### Core Stack
- **Build Tool**: Vite 6.x
- **Framework**: React 18.x with TypeScript
- **Styling**: CSS Modules + Global CSS
- **Routing**: React Router DOM
- **Data**: JSON manifests for portfolio content
- **Deployment**: GitHub Pages (primary) + Vercel (secondary)

### Migration Strategy

1. **Phase 1**: Build React components that mirror widget functionality
2. **Phase 2**: Create bridge pages using `WidgetEmbed` for gradual migration
3. **Phase 3**: Migrate remaining bridge pages to full React
4. **Phase 4**: Purge widget directory

### Directory Structure

```
sites/mcc-cal-vite/
├── src/
│   ├── components/     # Reusable React components
│   │   ├── portfolio/  # Portfolio-specific components
│   │   ├── Layout/     # Navigation, Footer, Layout shell
│   │   └── widgets/    # Bridge WidgetEmbed component
│   ├── pages/          # Page-level route components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Global CSS, fonts
├── public/             # Static assets
└── scripts/            # Build and manifest scripts
```

## Consequences

### Positive

- **Security**: Centralized environment variable management
- **Performance**: Code splitting, lazy loading, tree shaking
- **Developer Experience**: Hot reload, TypeScript, ESLint
- **Maintainability**: Component-based architecture
- **Deployment**: Automated via GitHub Actions + Vercel

### Negative

- **Migration effort**: 8 pages still use bridge WidgetEmbed
- **Learning curve**: Team must learn React/Vite
- **Initial setup**: Infrastructure setup time

## Alternatives Considered

### Next.js
- **Pros**: SSR, image optimization, API routes
- **Cons**: Overkill for static portfolio site, vendor lock-in
- **Decision**: Rejected in favor of Vite for simplicity

### Astro
- **Pros**: Islands architecture, great for content
- **Cons**: Newer ecosystem, team familiarity with React
- **Decision**: Rejected, React more familiar to team

### Keep Widgets
- **Pros**: No migration work
- **Cons**: Security debt, maintenance burden
- **Decision**: Rejected, technical debt too high

## References

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Project Migration Plan](../migration-plan.md)
