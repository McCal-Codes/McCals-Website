# Widget Hot Reload Development Guide

## Overview

The dev site now supports **dynamic widget reloading** during development. When you update a widget HTML file, the changes appear on the dev site immediately **without requiring a rebuild or git push**.

## How It Works

### Development Mode (localhost)
- The dev site loads widgets from the **local filesystem** via the `/api/widgets/[widget]/[version]` endpoint
- Changes to widget files in `src/widgets/*/versions/` are picked up instantly
- No caching is performed, so each page load gets the latest version

### Production Mode (deployed)
- The dev site loads widgets from **GitHub raw content** URLs
- This ensures a frozen, consistent version is deployed
- Behavior is unchanged from the previous implementation

## Quick Start

### 1. Start the Dev Site

```bash
# From sites/dev.mcc-cal.com/
npm run dev

# Or from the repository root:
npm run dev:site
```

The dev site will start on `http://localhost:3000`.

### 2. Make Widget Changes

Edit any widget file:
```
src/widgets/photojournalism-portfolio/versions/v5.2.0-performance-optimized.html
```

### 3. Reload the Widget

You have three options:

#### Option A: Click the Reloader Button (Easiest)
- Look for the **"🔄 Widget Reloader"** button in the top-right corner
- Click "Reload Widget" to see your changes instantly
- No page refresh needed

#### Option B: Use Keyboard Shortcut (Fastest)
- Press **`Ctrl+Shift+W`** (or `Cmd+Shift+W` on macOS) to reload
- Works from any page with a widget

#### Option C: Full Page Refresh (Traditional)
- Press **`F5`** or **`Cmd+R`** to reload the entire page
- Less efficient, but works if above methods fail

## Implementation Details

### WidgetEmbed Component
The enhanced `WidgetEmbed` component now:
1. **Detects environment** (development vs production)
2. **Routes requests accordingly**:
   - Dev: `/api/widgets/[widget]/[version]` (local file)
   - Prod: `https://raw.githubusercontent.com/...` (GitHub)
3. **Disables caching** in development (`cache: 'no-store'`)
4. **Re-executes scripts** after injecting HTML

### API Endpoint
The new `/pages/api/widgets/[widget]/[version].ts` endpoint:
- Reads widget files from the local filesystem
- Includes security checks to prevent directory traversal
- Sets appropriate headers for dev mode (no-cache)
- Returns 404 if the widget doesn't exist

### WidgetReloader Component
The optional UI component provides:
- Visual feedback showing current widget details
- One-click reload button
- Last reload timestamp
- Keyboard shortcut hint
- Automatically hides in production

## Usage Examples

### Basic Page with Hot Reload

```tsx
// pages/concerts.tsx
import Layout from '../components/Layout/Layout';
import WidgetEmbed from '../components/widgets/WidgetEmbed';
import WidgetReloader from '../components/widgets/WidgetReloader';
import { getWidgetConfig } from '../utils/widgetConfig';

const ConcertsPage = () => {
  const config = getWidgetConfig('concerts');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} version={config.version} />
      <WidgetReloader widget={config.widget} version={config.version} />
    </Layout>
  );
};

export default ConcertsPage;
```

### Programmatic Reload (No UI)

```tsx
import { reloadWidget, setupWidgetReloadShortcut } from '@/utils/widgetHotReload';

// In your component
useEffect(() => {
  // Set up keyboard shortcut (Ctrl+Shift+W)
  const cleanup = setupWidgetReloadShortcut(widget, version);
  return cleanup;
}, [widget, version]);

// Programmatically reload
const handleClick = () => {
  reloadWidget(widget, version, { 
    bustCache: true, 
    showNotification: true 
  });
};
```

### Custom Reload Notification

```tsx
import { reloadWidget } from '@/utils/widgetHotReload';

// Reload without automatic notification
await reloadWidget('photojournalism-portfolio', 'v5.2.0-performance-optimized.html', {
  showNotification: false
});

// Handle notification manually
console.log('Widget reloaded successfully');
```

## Troubleshooting

### Widget Changes Not Appearing
1. **Ensure you're in development mode**: Visit `http://localhost:3000` (not a production URL)
2. **Check file path**: Widget must be at `src/widgets/[widget]/versions/[version].html`
3. **Clear browser cache**: Press `Ctrl+Shift+Delete` and clear cache
4. **Try full page reload**: Press `F5`

### "Widget Not Found" Error
- Check that the file path is correct
- Verify the widget folder exists in `src/widgets/`
- Ensure the version filename matches exactly (case-sensitive)
- Check the error message in browser console for the exact path being requested

### Scripts Not Executing in Widget
- The WidgetEmbed component re-executes all `<script>` tags in injected HTML
- Ensure your widget HTML is self-contained (no external script dependencies)
- If using `<script src="...">`, verify the URL is absolute or properly resolved

### Port Already in Use
If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or specify a different port
npm run dev -- -p 3001
```

## Architecture Benefits

✅ **Instant Feedback**: See changes as you make them (no build delays)
✅ **No Breaking Changes**: Production behavior unchanged (GitHub URLs)
✅ **Backward Compatible**: Falls back gracefully to production CDN
✅ **Flexible**: WidgetReloader component is optional
✅ **Secure**: API includes path validation to prevent attacks
✅ **Developer-Friendly**: Keyboard shortcuts and visual feedback

## Development Workflow

### Typical Widget Development Session

```
1. Start dev site: npm run dev
2. Open http://localhost:3000/concerts
3. Edit widget HTML in src/widgets/concert-portfolio/versions/*.html
4. Press Ctrl+Shift+W to reload
5. See changes instantly
6. Repeat 3-5 until satisfied
7. Commit and push changes
8. GitHub Actions rebuilds production site
9. Squarespace embeds are automatically updated (via CDN/manifest)
```

### Multiple Monitors Setup (Recommended)

- **Left monitor**: Editor (VS Code)
- **Right monitor**: Dev site (http://localhost:3000)
- Edit widget → Press Ctrl+Shift+W → See changes instantly

## Notes

- The widget reloader is **development-only** and completely hidden in production
- All changes are temporary (reloading the page reverts to the file system state)
- To persist changes, edit the actual widget HTML files in `src/widgets/`
- The dev site is a **preview tool** — production behavior may still depend on manifest files and API responses

## See Also

- [Widget Embed Guide](../WIDGET-EMBED-GUIDE.md) — How to embed widgets in Squarespace
- [Widget Standards](../../docs/standards/widget-standards.md) — Widget development guidelines
- [Widget Reference](../../docs/standards/widget-reference.md) — Quick widget development checklist
