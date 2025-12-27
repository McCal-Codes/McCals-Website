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
- **Current Version**: v1.5.6
- **Features**: Professional bio, GitHub-hosted photo, LinkedIn/Google reviews, integrated client showcase
- **Use Case**: Complete about page solution

#### 🟢 Client Carousel (`about/client-carousel/`)

- **Purpose**: Standalone client logo carousel
- **Current Version**: v1.4.0
- **Features**: 22+ client logos, Fisher-Yates shuffle, infinite loop, mobile responsive
- **Use Case**: Add to any page for brand credibility

### Portfolio Widgets

#### 🟢 Concert Portfolio (`concert-portfolio/`)

- **Purpose**: Concert photography portfolio with masonry layout
- **Current Version**: v4.9.2
- **Features**: Manifest-driven, lightbox gallery, Spotify integration, performance optimized
- **Use Case**: Showcase concert photography work

#### 🟢 Event Portfolio (`event-portfolio/`)

- **Purpose**: Event photography portfolio
- **Current Version**: v2.8.0
- **Features**: Featured-first ordering, lightbox gallery, responsive design
- **Use Case**: Display event photography collections

#### 🟢 Photojournalism Portfolio (`photojournalism-portfolio/`)

- **Purpose**: Photojournalism work showcase
- **Current Version**: v5.5.0
- **Features**: Filterable categories, masonry layout, lightbox viewing
- **Use Case**: Professional photojournalism portfolio

#### 🟢 Featured Portfolio (`featured-portfolio/`)

- **Purpose**: Curated portfolio highlights
- **Current Version**: v1.5.2
- **Features**: Fisher-Yates shuffle, scrollable lightbox, responsive grid
- **Use Case**: Featured work showcase

#### 🟢 Portrait Portfolio (`portrait-portfolio/`)

- **Purpose**: Portrait photography showcase
- **Current Version**: v1.0.0
- **Features**: Vertical composition focus, 3:4 aspect ratios, enhanced detail viewing
- **Use Case**: Portrait photography portfolio

#### 🟢 Video Portfolio (`video-portfolio/`)

- **Purpose**: Multimedia video gallery
- **Current Version**: v0.1.0
- **Features**: Mixed source support (local MP4, YouTube, Vimeo), accessible playback, category filtering, lazy loading, SEO structured data
- **Use Case**: Showcase video content (interviews, promos, behind-the-scenes)

### Content Widgets

#### 🟢 Podcast Feed (`podcast-feed/`)

- **Purpose**: RSS-powered podcast episode display
- **Current Version**: v2.1.0
- **Features**: Auto-hydrating RSS episodes, live caching, show branding
- **Use Case**: Display latest podcast episodes

#### 🟢 Blog Feed (`blog-feed/`)

- **Purpose**: Blog post integration
- **Current Version**: v3.5.1
- **Features**: Masonry layout, category filtering, dynamic pagination
- **Use Case**: Display latest blog posts

### Navigation & Layout Widgets

#### 🟢 Site Navigation (`site-navigation/`)

- **Purpose**: Header navigation with blur effects
- **Current Version**: v1.8.5
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

### Basic Deployment Steps

1. **Choose a widget** from the list above
2. **Navigate** to the widget's directory (e.g., `about/complete-about-page/`)
3. **Copy** the HTML from the latest version file (e.g., `complete-about-squarespace.html`)
4. **Paste** into a Squarespace Code Block
5. **Save and publish**

### Widget-Specific Setup

- **Portfolio widgets**: Ensure manifest files are generated (see main project README)
- **Image-dependent widgets**: Update image URLs if using custom assets
- **Admin widgets**: Require authentication and backend setup

## Organization Structure

```bash
src/widgets/
├── about/                          # About section widgets
│   ├── client-carousel/           # Standalone client carousel
│   └── complete-about-page/       # Full about page with integrated carousel
├── portfolios/                     # Portfolio showcase widgets
│   ├── concert-portfolio/
│   ├── event-portfolio/
│   └── ...
├── _content/                       # Content display widgets
├── site/                           # Site infrastructure widgets
├── _admin/                         # Administrative tools
├── _archived/                      # Archived/deprecated widgets
├── shared/                         # Common utilities and styles
└── README.md                       # This file
```

## Development Guidelines

### Adding New Widgets

1. Create widget directory with proper naming
2. Include `README.md` and `CHANGELOG.md`
3. Add `versions/` directory for version history
4. Update this README when production-ready

### Widget Standards

- 📖 [Widget Standards](../standards/widget-standards.md)
- 📖 [Widget Development Guide](../standards/widget-development.md)
- 📖 [Performance Standards](../standards/performance-standards.md)

## Recent Changes

- **2025-12-27**: Optimized widget performance (IntersectionObserver), fixed Event Portfolio image loading, and enhanced Admin Dashboard with GitHub API monitoring.
- **2025-12-14**: Completed Monochrome conversion for all portfolios and navigation.
- **2025-11-03**: Consolidated duplicate about widgets, archived redundant versions.
- **2025-10-24**: Added Portrait Portfolio v1.0.0.

---

**Last Updated**: December 27, 2025
**Total Production Widgets**: 12
