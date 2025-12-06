# Widget Embed System for Dev Site

## Overview

The dev site (`dev.mcc-cal.com`) now uses the **WidgetEmbed** component to load production widget HTML directly from GitHub. This ensures the dev pages look **identical** to the Squarespace production site.

## Architecture

### Key Components

- **`WidgetEmbed.tsx`**: React component that fetches and injects production widget HTML
- **`widgetConfig.ts`**: Configuration mapping dev pages to production widget versions
- **Page files** (`journalism.tsx`, `concerts.tsx`, etc.): Simplified to use `<WidgetEmbed>`

### How It Works

1. Each portfolio page imports `WidgetEmbed` and `getWidgetConfig`
2. `getWidgetConfig('page-name')` returns the widget config from `widgetConfig.ts`
3. `<WidgetEmbed>` fetches the production HTML from GitHub raw content
4. Widget HTML is injected and scripts are re-executed for full functionality

## Adding a New Widget Page

### 1. Add Config Entry

Edit `components/widgets/widgetConfig.ts`:

```typescript
export const widgetMap: Record<string, WidgetConfig> = {
  'my-page': {
    widget: 'my-widget-folder',
    version: 'vX.Y.0-my-widget.html',
    description: 'My widget description',
  },
  // ... other widgets
};
```

### 2. Create Page File

Create `pages/my-page.tsx`:

```tsx
import Layout from '../components/Layout/Layout';
import WidgetEmbed from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const MyPage = () => {
  const config = getWidgetConfig('my-page');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} version={config.version} />
    </Layout>
  );
};

export default MyPage;
```

## Available Pages

- `/journalism` - Photojournalism Portfolio
- `/concerts` - Concert Photography
- `/events` - Event Photography
- `/featured-work` - Featured Work
- `/portraits` - Portrait Photography
- `/nature` - Nature Photography
- `/podcast` - Podcast Feed

## Updating Widget Versions

To update a widget version:

1. Find the widget config in `widgetConfig.ts`
2. Update the `version` field to the new version file
3. Commit and redeploy

Example:

```typescript
// Before
photography: {
  widget: 'photojournalism-portfolio',
  version: 'v5.1.0-photojournalism-portfolio.html',
},

// After
photography: {
  widget: 'photojournalism-portfolio',
  version: 'v5.2.0-performance-optimized.html',
},
```

## Benefits

✅ **Production Parity**: Dev pages use the exact same widget code as production  
✅ **No Duplication**: Single source of truth for widget code  
✅ **Easy Updates**: Change version numbers in config, no code changes needed  
✅ **Live Preview**: Changes to widgets automatically appear on dev site  
✅ **Simplified Maintenance**: No custom React components to maintain  

## Troubleshooting

### Widget Not Loading

1. Check browser console for CORS errors
2. Verify the widget path exists on GitHub
3. Ensure the version file name is correct

### Scripts Not Running

The `WidgetEmbed` component re-executes scripts from the injected HTML. If a widget uses external scripts, you may need to adjust how scripts are handled in the component.

### Styling Issues

Widgets use inline CSS, so there shouldn't be style conflicts. If issues occur:
1. Check for conflicting global CSS in `styles/globals.css`
2. Use browser DevTools to inspect applied styles
3. Consider scoping dev-specific styles differently

## Related Files

- `components/widgets/WidgetEmbed.tsx` - Widget embedding logic
- `utils/widgetConfig.ts` - Widget configuration
- `styles/globals.css` - Global styles
- All page files in `pages/`
