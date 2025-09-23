# McCal Media — Widget Development Workspace

> **Version 2.0.0** — Squarespace widget development and testing environment

This repository is primarily a **development workspace for Squarespace widgets**, containing reusable web components that embed into your Squarespace site. The standalone site is used only for testing widgets before deployment to Squarespace.

## Primary Purpose: Squarespace Widgets

### Available Widgets
- **Concert Portfolio** (`src/widgets/concert-portfolio/`) - Photo galleries for concert photography
- **Event Portfolio** (`src/widgets/event-portfolio/`) - Event photography displays
- **Photojournalism Portfolio** (`src/widgets/photojournalism-portfolio/`) - News and journalism photos
- **About Widgets** (`src/widgets/about-widgets/`) - Client logos, carousels, about sections
- **Blog Feed** (`src/widgets/blog-feed/`) - External blog integration
- **Podcast Feed** (`src/widgets/podcast-feed/`) - Podcast episode displays

### Using Widgets in Squarespace

1. Navigate to `src/widgets/[widget-name]/versions/`
2. Copy the latest version HTML file (e.g., `v4.1.html`)
3. In Squarespace, add a **Code Block**
4. Paste the widget HTML code
5. Adjust `data-panes` or other attributes as needed
6. Each widget has its own README with specific instructions

## Development & Testing

### Quick Commands
```bash
# Generate image manifests for widgets
npm run manifest:generate

# Build test site (for widget testing only)
npm run build

# Test widgets locally
npm run serve

# Auto-organize photos
npm run organize:concerts
```

### Adding Concert Photos for Widgets
1. Create folder: `src/images/Portfolios/Concert/[Band-Name]/[Month Year]/`
2. Add photos and run `npm run manifest:generate`
3. Photos automatically appear in Squarespace concert widgets

## Project Structure

```
McCals-Website/
├── src/
│   ├── widgets/           # ⭐ MAIN: Squarespace widgets
│   ├── images/            # Photo assets for widgets
│   └── site/              # Test site (widget testing only)
├── scripts/               # Photo organization & manifest generation
├── docs/                  # Documentation
├── tests/                 # Widget demos and testing
└── config/                # Build configuration
```

## Documentation

📖 **[Complete Documentation](docs/README.md)** — Full development guide

### Widget Documentation
- **Concert Widget**: [src/widgets/concert-portfolio/README.md](src/widgets/concert-portfolio/README.md)
- **Event Widget**: [src/widgets/event-portfolio/README.md](src/widgets/event-portfolio/README.md)  
- **Journalism Widget**: [src/widgets/photojournalism-portfolio/README.md](src/widgets/photojournalism-portfolio/README.md)

## What's New in v2.0

✨ **Better organized for Squarespace development**:
- Widget HTML files grouped with changelogs
- Clear separation of widgets vs test site
- Improved photo organization scripts
- Streamlined development workflow

---

*This workspace supports the McCal Media Squarespace site*