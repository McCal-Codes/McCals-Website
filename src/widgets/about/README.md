# About Section Widgets

This directory contains widgets related to the About section of the website, organized by functionality.

## Current Widgets

### Client Carousel (`client-carousel/`)
- **Purpose**: Professional client showcase carousel for Squarespace
- **Current Version**: v1.1.5
- **Features**: Randomized order, seamless infinite loop, high-quality logos
- **Status**: Production Ready ✅

#### Key Features:
- Fisher-Yates shuffle algorithm for random client display
- Triple array system for seamless infinite scrolling
- High-quality transparent logos optimized for dark themes
- Mobile responsive design with hover effects
- Text fallback system for failed logo loads
- Easy Squarespace integration (single Code Block)

#### Files:
- `client-carousel-squarespace.html` - Main production file
- `versions/` - Version history and archived releases
- `README.md` - Detailed documentation
- `CHANGELOG.md` - Version change history

### Complete About Page (`complete-about-page/`)
- **Purpose**: Comprehensive about section with bio, photo, reviews, and client showcase
- **Current Version**: v1.4.1
- **Features**: Integrated design, debug system, GitHub asset hosting
- **Status**: Production Ready ✅

#### Key Features:
- Professional bio with GitHub-hosted photo
- Integrated client carousel (built-in, separate from standalone carousel)
- LinkedIn and Google reviews section
- Interactive debug system for troubleshooting
- Self-contained design for easy Squarespace deployment
- Multiple variants (complete vs. simplified)

#### Files:
- `complete-about-squarespace.html` - Full-featured about page
- `about-section-squarespace.html` - Simplified bio-only version
- `README.md` - Comprehensive documentation
- `CHANGELOG.md` - Version history

## Directory Structure

```
src/widgets/about/
├── client-carousel/
│   ├── client-carousel-squarespace.html    # Main production file
│   ├── versions/                           # Version history
│   │   ├── v1.1.0-client-carousel-squarespace.html
│   │   ├── v1.1.1-client-carousel-squarespace.html
│   │   ├── v1.1.2-client-carousel-squarespace.html
│   │   ├── v1.1.3-client-carousel-squarespace.html
│   │   ├── v1.1.4-client-carousel-squarespace.html
│   │   └── v1.1.5-client-carousel-squarespace.html
│   ├── README.md                           # Widget documentation
│   └── CHANGELOG.md                        # Change history
├── complete-about-page/
│   ├── complete-about-squarespace.html     # Full about page with everything
│   ├── about-section-squarespace.html     # Simplified bio-only version
│   ├── README.md                           # Widget documentation
│   └── CHANGELOG.md                        # Change history
└── README.md                               # This file
```

## Usage Guidelines

### For Squarespace Deployment:
1. Navigate to the specific widget directory
2. Copy content from the main HTML file (e.g., `client-carousel-squarespace.html`)
3. Paste into Squarespace Code Block
4. Save and publish

### For Development:
1. Make changes to the main widget file
2. Create new version file when releasing updates
3. Update CHANGELOG.md with changes
4. Update README.md if new features are added

## Organization Benefits

- **Clear Separation**: Each widget type has its own directory
- **Version Control**: Complete history maintained in `versions/` folders
- **Easy Maintenance**: Predictable file structure across all widgets
- **Documentation**: Each widget has its own README and CHANGELOG
- **Scalable**: Easy to add new about-section widgets in the future

## Widget Distinction

### Client Carousel vs. Complete About Page

**Client Carousel** (`client-carousel/`):
- **Standalone component**: Just the client logo carousel
- **Focused purpose**: Display trusted brands and partners
- **Reusable**: Can be embedded anywhere on the site
- **Lightweight**: Minimal footprint, single functionality

**Complete About Page** (`complete-about-page/`):
- **Full page solution**: Bio, photo, reviews, AND integrated client showcase
- **Comprehensive**: Everything needed for an about page
- **Self-contained**: All-in-one widget for complete about sections
- **Feature-rich**: Debug tools, multiple layouts, extensive customization

## Future Widgets

Potential additions to this section:
- About Hero Section widget (banner/header only)
- Team Members carousel
- Company Statistics widget
- Timeline/History widget
- Awards/Recognition showcase

---

**Last Updated**: January 14, 2025  
**Maintained By**: McCal Media Development Team