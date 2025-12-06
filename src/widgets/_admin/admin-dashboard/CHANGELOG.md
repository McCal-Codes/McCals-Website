# Admin Dashboard Widget - Changelog

All notable changes to the Admin Dashboard Widget are documented here.

## Versioning

This widget follows **Semantic Versioning 2.0.0** format: `MAJOR.MINOR.PATCH`

All versions are self-contained HTML files located in `versions/` directory:
- `v1.3.0-admin-dashboard.html` (current)
- `v1.2.0-admin-dashboard.html` (previous)
- `v1.0.0-admin-dashboard.html` (original)

**⚠️ IMPORTANT VERSIONING RULES:**
- **Never edit existing version files** (v1.2.0, v1.1.0, etc.)
- **Always create a new version file** when making changes (v1.4.0, v1.5.0, etc.)
- **Update README.md** to reflect current version and new features
- **Update CHANGELOG.md** with version entry and detailed changes
- Follow format: `v{MAJOR}.{MINOR}.{PATCH}-admin-dashboard.html`

---

## [1.3.0] - 2025-12-06

### Added
- Dark theme with system-ui font stack matching portfolio widgets (concert, journalism)
- Glass-like cards with `backdrop-filter: blur(6px)` and subtle borders
- CSS variables for theme support (dark/light mode with `prefers-color-scheme`)
- Masonry-inspired grid layout for better visual organization
- Portfolio widget color scheme with accent colors and smooth gradients
- Modal changelog system with full keyboard and accessibility support
- Improved documentation with mandatory changelog/version rules

### Changed
- Refactored CSS architecture from light theme to dark theme
- Updated card styling with glassmorphism effects
- Enhanced hover states with smooth transitions and subtle elevation changes
- Improved status badges with portfolio-style gradient backgrounds
- Updated typography hierarchy for better readability
- Restructured expandable sections for cleaner interactions
- Analytics grid layout optimized for masonry-style display
- All section transitions now use cubic-bezier timing functions

### Improved
- Performance: v1.3.0 is **4KB smaller** than v1.2.0 (36KB vs 40KB)
- CSS is more optimized with better selector specificity
- Responsive design with mobile-first approach
- Better spacing and alignment throughout
- Enhanced interactive feedback patterns

### Technical
- HTML validation: ✅ PASSED (all 81 widgets valid)
- JavaScript: 52 functions/declarations, 9+ event handlers
- CSS: 31 component classes, responsive breakpoints at 1200px, 768px, 480px
- Accessibility: ARIA labels, semantic HTML, keyboard navigation support

### Browser Support
- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## [1.2.0] - 2025-12-06

### Added
- Complete CSS reorganization with semantic sections and comprehensive comments
- Enhanced header layout with better control organization
- Version indicator badge with changelog modal trigger
- Metric rows with hover effects and monospace fonts
- Cleaner expandable sections with toggle animations

### Changed
- Improved visual hierarchy with gradient backgrounds
- Updated status badges with color-coded backgrounds
- Enhanced card styling with improved shadows
- Better analytics grid layout and spacing
- Improved responsive design with mobile optimizations

### Technical
- Total lines: 1098
- File size: 40KB

---

## [1.0.0] - 2025-12-06

### Added
- Initial release of Admin Dashboard Widget
- Core 6-card status grid:
  - 🔌 API Health monitoring
  - 📦 Manifests tracking (Concert, Events, Journalism)
  - 🎨 Widgets validation
  - 💻 System information
  - ⚡ Cache statistics
  - 🔨 Build information
- Expandable analytics sections:
  - Portfolio Status
  - Analytics & Performance
  - Manifest Analytics
  - Diagnostics & Logs
  - Quick Links
- Environment detection (dev/prod)
- Timestamp tracking and updates
- Basic styling and responsive design

### Technical
- Total lines: 1130
- File size: 40KB
- Self-contained HTML widget (no external dependencies)

---

## Development Guidelines

### When to Create a New Version

Create a new version in the following cases:

1. **Visual/Styling Changes** (minor version bump)
   - Color scheme updates
   - Layout or spacing modifications
   - Hover state improvements
   - Typography changes
   
2. **Feature Additions** (minor version bump)
   - New dashboard cards or sections
   - New analytics panels
   - Enhanced filtering or sorting
   - Additional monitoring capabilities

3. **Bug Fixes** (patch version bump)
   - JavaScript errors
   - CSS alignment issues
   - Accessibility fixes
   - Performance improvements

4. **Major Refactors** (major version bump)
   - Complete rewrite
   - Breaking API changes
   - Significant architecture changes

### Changelog Entry Requirements

Every new version **MUST** include:

1. **Version header** with date: `## [X.Y.Z] - YYYY-MM-DD`
2. **Added section** - New features and functionality
3. **Changed section** - Modifications to existing features
4. **Technical section** - Line count, file size, test results
5. **Browser support** - Updated compatibility matrix (if changed)

### File Organization

```
src/widgets/_admin/admin-dashboard/
├── README.md                          # Current version info + usage
├── CHANGELOG.md                       # This file (version history)
└── versions/
    ├── v1.3.0-admin-dashboard.html   # Current (latest)
    ├── v1.2.0-admin-dashboard.html   # Previous stable
    └── v1.0.0-admin-dashboard.html   # Original
```

### Update Checklist for New Versions

Before committing a new version:

- [ ] Create new version file: `vX.Y.Z-admin-dashboard.html`
- [ ] Add entry to `CHANGELOG.md` with all sections (Added, Changed, Technical)
- [ ] Update `README.md` with new current version and features
- [ ] Run HTML validation: `npm run validate:widgets`
- [ ] Test locally: `npm run dev` and preview in browser
- [ ] Verify responsive design at 1200px, 768px, 480px breakpoints
- [ ] Check dark/light theme rendering
- [ ] Test changelog modal and expandable sections
- [ ] Verify all buttons and interactive elements work
- [ ] Check JavaScript console for errors
- [ ] Update version number in widget header comment
- [ ] Commit with message: `Admin Dashboard Widget vX.Y.Z: [brief description]`

### Documentation Standards

For each new version, ensure:

1. **Header comment** in HTML file includes:
   - Version number
   - Date created/updated
   - List of changes
   - Any special notes

2. **README.md** includes:
   - Current version designation
   - Feature overview
   - Version history with detailed descriptions
   - Squarespace embed snippet with correct version

3. **CHANGELOG.md** includes:
   - Semantic version with date
   - All changes categorized (Added/Changed/Improved/Technical)
   - Browser support matrix
   - Development guidelines for future versions

---

## Past Releases

### Notes
- All versions are backward compatible
- v1.0.0 remains available for legacy integrations
- v1.2.0 available as intermediate stable version
- v1.3.0 recommended for new deployments (portfolio widget styling)

---

**Last Updated:** 2025-12-06
**Current Version:** 1.3.0
**Next Expected:** 1.4.0 (pending new features)
