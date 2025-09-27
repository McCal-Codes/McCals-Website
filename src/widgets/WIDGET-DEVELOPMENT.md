# Widget Development Guidelines

## Proper Widget Organization

All Squarespace widgets live under `src/widgets/` using this structure:

```
src/widgets/
└── [widget-name]/
    ├── README.md           # Widget documentation
    ├── CHANGELOG.md        # Version history
    ├── versions/           # Production-ready builds
    │   ├── v1.0.html
    │   ├── v1.1.html
    │   └── v2.0.html
    └── demo/               # Experiments and test harnesses
        ├── test-demo.html
        └── debug-version.html
```

## Current Widget Structure

### ✅ Properly Organized Widgets
- **Concert Portfolio** (`src/widgets/concert-portfolio/`)
  - Latest: `v4.2.html` (API optimised, master manifest)
  - Assets: `src/images/Portfolios/Concert/`
- **Event Portfolio** (`src/widgets/event-portfolio/`)
  - Latest: `v1.1-manifest.html`
  - Assets: `src/images/Portfolios/Events/`
- **Photojournalism Portfolio** (`src/widgets/photojournalism-portfolio/`)
  - Latest: `v3.0-published-tags.html`
  - Assets: `src/images/Portfolios/Journalism/`
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
- `README.md` – usage instructions
- `CHANGELOG.md` – version history (start at v1.0.0)
- `versions/v1.0.0.html` – first stable release

### 3. GitHub Integration
For widgets that pull assets from GitHub, base URLs should follow the shared helper pattern:

```javascript
const GH = {
  owner: 'McCal-Codes',
  repo: 'McCals-Website',
  branch: 'main',
  base: ['src', 'images', 'Portfolios', '[Type]']
};

const manifestUrl = rawBase + 'src/images/Portfolios/[Type]/[type]-manifest.json';

function rawUrl(parts) {
  return rawBase + 'src/images/Portfolios/[Type]/' + parts.join('/');
}
```

## Versioning Rules

- Follow semantic versioning (MAJOR.MINOR.PATCH) for every widget.
- Before editing, duplicate the latest file in `versions/`, rename it to the new semantic version, then modify the copy only.
- **Patch (0.0.1)** – micro fixes: copy tweaks, aria labels, tiny visual adjustments.
- **Minor (0.1.0)** – additive improvements: new sections, responsive updates, optional feature toggles.
- **Major (1.0.0)** – breaking or foundational work: redesigns, rewrites, new data sources.
- Never delete older versions; Squarespace embeds rely on fast rollback.

## Required Widget Features

### Version Indicator & Changelog Modal
**Every widget must ship with:**

1. **Fixed version indicator** (bottom-right corner)
   ```css
   .version-indicator {
     position: fixed;
     bottom: 20px;
     right: 20px;
     background: rgba(0,0,0,0.7);
     color: rgba(255,255,255,0.6);
     padding: 4px 8px;
     border-radius: 4px;
     font: 600 10px/1 ui-monospace,monospace;
     cursor: pointer;
     z-index: 500;
     transition: color 0.2s ease;
   }
   .version-indicator:hover { color: var(--accent); }
   ```

2. **Clickable changelog modal** (patterned after Concert Portfolio v4.2)
   - Opens from the version indicator
   - Lists version history with key changes
   - Accessible: ESC closes, background click closes, focus trapped

3. **Implementation example**
   ```html
   <div class="version-indicator" onclick="showChangelog()" title="Click to view changelog">v2.1</div>

   <div class="changelog-modal" id="changelogModal">
     <div class="changelog-content">
       <div class="changelog-header">
         <h3 class="changelog-title">Widget Changelog</h3>
         <button class="changelog-close" onclick="hideChangelog()">&times;</button>
       </div>
       <div class="changelog-body">
         <div class="changelog-version">v2.1 – Latest Features (Current)</div>
         <ul class="changelog-items">
           <li>New feature description</li>
           <li>Bug fixes and improvements</li>
         </ul>
       </div>
     </div>
   </div>
   ```

## Testing Workflow

1. Prototype inside the widget’s `demo/` folder first.
2. Test thoroughly with the local site shell (`npm run serve`).
3. Promote to `versions/` with the correct semantic version once stable.
4. Update the widget `CHANGELOG.md` with a concise entry.
5. Refresh the widget README to point at the new latest version if needed.

## Deployment to Squarespace

1. Open `src/widgets/[widget-name]/versions/`.
2. Copy the latest production HTML file.
3. In Squarespace, add a **Code Block** (or Code Injection snippet).
4. Paste the HTML and adjust config options (dataset attributes, manifest URLs, etc.).

---

*Keep widgets tidy and versioned so Squarespace embeds stay reliable and easy to roll forward or back.*

## Event Portfolio Asset Ingest

Refer to `docs/development/event-portfolio-ingest.md` for the repeatable workflow (slug naming, manifest regeneration, PR prep).
