# Widget Development Guidelines

## Proper Widget Organization

All Squarespace widgets should be organized in the `src/widgets/` directory using this structure:

```
src/widgets/
└── [widget-name]/
    ├── README.md           # Widget documentation
    ├── CHANGELOG.md        # Version history
    ├── versions/           # Production widget versions
    │   ├── v1.0.html
    │   ├── v1.1.html
    │   └── v2.0.html      # Latest stable version
    └── demo/               # Test versions and demos
        ├── test-demo.html
        └── debug-version.html
```

## Current Widget Structure

### ✅ Properly Organized Widgets
- **Concert Portfolio** (`src/widgets/concert-portfolio/`)
  - Latest: `v4.2.html` (API-optimized, uses master manifest)
  - Path: `src/images/Portfolios/Concert/`
  
- **Event Portfolio** (`src/widgets/event-portfolio/`)
  - Latest: `v1.1-manifest.html`
  - Path: `src/images/Portfolios/Events/`
  
- **Photojournalism Portfolio** (`src/widgets/photojournalism-portfolio/`)
  - Latest: `v3.0-published-tags.html`
  - Path: `src/images/Portfolios/Journalism/`
  
- **Podcast Feed** (`src/widgets/podcast-feed/`)
  - Latest: `v1.8.html`
  
- **About Widgets** (`src/widgets/about-widgets/`)
  - Multiple utility widgets for about pages, client carousels, etc.

## Creating New Widgets

### 1. Create Widget Folder
```bash
mkdir -p src/widgets/[new-widget-name]/{versions,demo}
```

### 2. Required Files
- `README.md` - Widget documentation and usage instructions
- `CHANGELOG.md` - Version history starting with v1.0
- `versions/v1.0.html` - First stable version

### 3. GitHub Integration
For widgets that access GitHub-hosted images, use these paths:

```javascript
// Correct paths (after reorganization)
const GH = { 
  owner: 'McCal-Codes', 
  repo: 'McCals-Website', 
  branch: 'main',
  base: ['src', 'images', 'Portfolios', '[Type]'] 
};

// Manifest URLs
const manifestUrl = rawBase + 'src/images/Portfolios/[Type]/[type]-manifest.json';

// Raw content URLs  
function rawUrl(parts) { 
  return rawBase + 'src/images/Portfolios/[Type]/' + parts.join('/'); 
}
```

## Versioning Rules

- **Major versions (v2.0, v3.0)**: New features, breaking changes
- **Minor versions (v1.1, v1.2)**: Improvements, fixes, new options
- **Always increment** when making changes - never overwrite existing versions
- **Keep old versions** for compatibility with existing Squarespace sites

## Testing Workflow

1. Create widget in `/demo/` folder first
2. Test thoroughly using local test site (`npm run serve`)
3. Once stable, copy to `/versions/` with proper version number
4. Update CHANGELOG.md with changes
5. Update main README with new version info

## Deployment to Squarespace

1. Navigate to `src/widgets/[widget-name]/versions/`
2. Copy latest version HTML content
3. In Squarespace, add **Code Block** 
4. Paste widget HTML
5. Adjust `data-panes` or other parameters as needed

---

*This ensures all widgets are properly organized and maintainable for the McCal Media Squarespace site.*