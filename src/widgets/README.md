# Widgets directory

This folder contains self-contained widgets intended to be embedded into Squarespace Code Blocks or used by the local demo site in `src/site/`.

## Organization

Widgets are grouped by function:
- **`portfolios/`** - Portfolio showcase widgets (concert, events, journalism, portrait, featured, nature)
- **`site/`** - Site infrastructure widgets (navigation, footer, hero-slideshow)
- **`content/`** - Content-focused widgets (about, podcast-feed, policies-legal, hire-to-unlock-resume)
- **`tools/`** - Development tools and templates (css-playground, performance-dashboard, seo-performance-template, widget-enhancement-template)
- **`components/`** - Reusable UI components (empty for now)
- **Top-level folders** - Support folders (docs, shared, templates) and work-in-progress widgets (blog-feed)
- **`_archived/`** - Deprecated widgets no longer in active use
- **`_admin/`** - Admin-only tools (not for production)

## Manifest

The repository contains `src/widgets/widgets-manifest.json`, a consolidated manifest of widgets with basic metadata (name, path, description, status, versions, group). This file is auto-generated and provides:
- Machine-readable widget discovery
- Group categorization
- Version tracking
- Status indicators

To regenerate the manifest locally:

```sh
# If your project is ESM (package.json has "type": "module") run the .cjs script:
node scripts/utils/generate-widgets-manifest.cjs
```

## Conventions

- Keep each widget in a single directory.
- Use `versions/` inside a widget directory for versioned HTML files if needed.
- Use `STATUS.md` in a widget folder to mark work-in-progress state.
- If a widget is archived, move it to `src/widgets/_archived/`.
- Portfolio widgets stay organized under `portfolios/`.
- Site infrastructure widgets (nav, footer, hero) stay under `site/`.

## Why this approach

- Minimal structural change: no overly nested folders.
- Machine-readable manifest enables filtered lists, demo pages, and automated checks.
- Clear grouping makes discovery easier without breaking existing embed paths.
- README + generator script keep organization discoverable and maintainable.

## Recent changes (2025-11-05)

Phase 1 completed:
- Created group folders (`portfolios/`, `site/`, `components/`, `content/`, `tools/`)
- Moved site widgets: `site-navigation` → `site/navigation`, `site-footer` → `site/footer`, `hero-slideshow` → `site/hero-slideshow`
- Updated manifest generator to scan group folders recursively and add `group` field
- Updated all documentation references to new paths
- Git history preserved via `git mv`

Phase 2 completed:
- Moved content widgets: `about`, `podcast-feed`, `policies-legal`, `hire-to-unlock-resume` → `content/`
- Moved dev/template widgets: `css-playground`, `performance-dashboard`, `seo-performance-template`, `widget-enhancement-template` → `tools/`
- Updated manifest generator to include `content` and `tools` groups
- Remaining ungrouped: `_admin` (admin tools), `blog-feed` (WIP), support folders (`docs`, `shared`, `templates`)

Portfolio widgets were already organized under `portfolios/` before this session.
# Squarespace Widgets

This directory contains production-ready and work-in-progress widgets for the McCal Media Squarespace site.

## Widget Status System

📖 **[Complete Status Guide](widget-status-guide.md)** - Full development workflow and criteria

### Quick Reference
- **🟢 Production Ready**: Listed below - ready for Squarespace deployment
- **🟡 Work in Progress**: Has `STATUS.md` file - under development, do not use in production
- **🔴 Archived**: In `_archived/` directory - temporarily inactive or consolidated

## Available Production Widgets

### About Section Widgets (`about/`)

#### 🟢 Complete About Page (`about/complete-about-page/`)
- **Purpose**: Full about section with bio, photo, reviews, and integrated client carousel
- **Current Version**: v1.4.4
- **Features**: Professional bio, GitHub-hosted photo, LinkedIn/Google reviews, integrated client showcase
- **Use Case**: Complete about page solution

#### 🟢 Client Carousel (`about/client-carousel/`)
- **Purpose**: Standalone client logo carousel
- **Current Version**: v1.1.8
- **Features**: 22+ client logos, Fisher-Yates shuffle, infinite loop, mobile responsive
- **Use Case**: Add to any page for brand credibility

### Portfolio Widgets

#### 🟢 Concert Portfolio (`concert-portfolio/`)
- **Purpose**: Concert photography portfolio with masonry layout
- **Current Version**: v4.7
- **Features**: Manifest-driven, lightbox gallery, Spotify integration, performance optimized
- **Use Case**: Showcase concert photography work

#### 🟢 Event Portfolio (`event-portfolio/`)
- **Purpose**: Event photography portfolio
- **Current Version**: v2.6.0
- **Features**: Featured-first ordering, lightbox gallery, responsive design
- **Use Case**: Display event photography collections

#### 🟢 Photojournalism Portfolio (`photojournalism-portfolio/`)
- **Purpose**: Photojournalism work showcase
- **Current Version**: v5.2
- **Features**: Filterable categories, masonry layout, lightbox viewing
- **Use Case**: Professional photojournalism portfolio

#### 🟢 Featured Portfolio (`featured-portfolio/`)
- **Purpose**: Curated portfolio highlights
- **Current Version**: v1.5
- **Features**: Fisher-Yates shuffle, scrollable lightbox, responsive grid
- **Use Case**: Featured work showcase

#### 🟢 Portrait Portfolio (`portrait-portfolio/`)
- **Purpose**: Portrait photography showcase
- **Current Version**: v1.0
- **Features**: Vertical composition focus, 3:4 aspect ratios, enhanced detail viewing
- **Use Case**: Portrait photography portfolio

### Content Widgets

#### 🟢 Podcast Feed (`podcast-feed/`)
- **Purpose**: RSS-powered podcast episode display
- **Current Version**: v1.9.5
- **Features**: Auto-hydrating RSS episodes, live caching, show branding
- **Use Case**: Display latest podcast episodes

#### 🟢 Blog Feed (`blog-feed/`)
- **Purpose**: Blog post integration
- **Status**: Work in Progress (see `STATUS.md`)

### Navigation & Layout Widgets

#### 🟢 Site Navigation (`site-navigation/`)
- **Purpose**: Header navigation with blur effects
- **Current Version**: v1.7.0
- **Features**: Mobile responsive, backdrop blur, smooth animations
- **Use Case**: Main site navigation

#### 🟢 Site Footer (`site-footer/`)
- **Purpose**: Site footer with links and branding
- **Current Version**: v1.3.0
- **Features**: CSS custom properties, enhanced accessibility, mobile optimizations
- **Use Case**: Site footer

#### 🟢 Hero Slideshow (`hero-slideshow/`)
- **Purpose**: Hero banner slideshow
- **Status**: Work in Progress (see `STATUS.md`)

### Legal & Admin Widgets

#### 🟢 Hire to Unlock Résumé (`hire-to-unlock-resume/`)
- **Purpose**: Interactive résumé with LinkedIn authentication
- **Current Version**: v1.0.0
- **Features**: Redacted sections unlock via OAuth, critiques gatekeeping, collects genuine leads
- **Use Case**: Professional résumé presentation with authentic lead filtering

#### 🔴 Admin Portfolio Importer (`_admin/admin-portfolio-importer/`)
- **Purpose**: Secure admin tool for importing portfolio images
- **Status**: Admin Only - Not for production use

## How to Use Widgets in Squarespace

### Basic Deployment Steps:
1. **Choose a widget** from the list above
2. **Navigate** to the widget's directory (e.g., `about/complete-about-page/`)
3. **Copy** the HTML from the latest version file (e.g., `complete-about-squarespace.html`)
4. **Paste** into a Squarespace Code Block
5. **Save and publish**

### Widget-Specific Setup:
- **Portfolio widgets**: Ensure manifest files are generated (see main project README)
- **Image-dependent widgets**: Update image URLs if using custom assets
- **Admin widgets**: Require authentication and backend setup

## Organization Structure

```
src/widgets/
├── about/                          # About section widgets
│   ├── client-carousel/           # Standalone client carousel
│   └── complete-about-page/       # Full about page with integrated carousel
├── [portfolio-type]-portfolio/     # Portfolio showcase widgets
├── [content-type]/                 # Content display widgets
├── site-[component]/               # Site infrastructure widgets
├── _admin/                         # Administrative tools
├── _archived/                      # Archived/deprecated widgets
├── shared/                         # Common utilities and styles
└── README.md                       # This file
```

## Development Guidelines

### Adding New Widgets:
1. Create widget directory with proper naming
2. Include `README.md` and `CHANGELOG.md`
3. Add `versions/` directory for version history
4. Update this README when production-ready

### Widget Standards:
- 📖 [Widget Standards](../standards/widget-standards.md)
- 📖 [Widget Development Guide](../standards/widget-development.md)
- 📖 [Performance Standards](../standards/performance-standards.md)

## Recent Changes

- **2025-11-03**: Consolidated duplicate about widgets, archived redundant versions
- **2025-10-24**: Added Portrait Portfolio v1.0
- **2025-10-09**: Added Policies & Legal v1.0.0
- **2025-10-06**: Major widget performance optimizations and standardization

---

**Last Updated**: November 3, 2025
**Total Production Widgets**: 11