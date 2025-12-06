# Dev Site Updates - Spacing & Changelog Tracking

## Changes Made

### 1. Fixed Header-to-Content Spacing
- **Issue**: Large gap between navigation and widget content
- **Fix**: Added negative margin to `.site-main` in `styles/globals.css`
  ```css
  margin-top: clamp(0px, -2vw, -20px);
  ```
- **Result**: Seamless transition from nav to widget content

### 2. Automatic Changelog Tracking
Every time you view a widget page, it's automatically tracked in the changelog.

#### New Files Created:
- **`utils/changelogTracker.ts`**: Core changelog functionality
  - `getChangelog()` - Retrieve all entries
  - `addChangelogEntry()` - Track widget views/updates
  - `clearChangelog()` - Wipe entries
  - `exportChangelogAsText()` - Export to readable format
  - `exportChangelogAsJSON()` - Export to JSON

- **`components/ChangelogViewer.tsx`**: UI component to view changelog
  - Table view of all entries
  - Export as Text (.txt)
  - Export as JSON (.json)
  - Clear all entries
  - Color-coded action types

- **`pages/changelog.tsx`**: New page at `/changelog`
  - View all widget activity
  - Download changelog files
  - Reset if needed

#### Updated Files:
- **`components/widgets/WidgetEmbed.tsx`**
  - Now calls `addChangelogEntry()` on load
  - Tracks: widget name, version, timestamp
  - Prevents duplicate entries

## How It Works

### Automatic Tracking
1. When you visit `/journalism`, the page loads the Journalism widget
2. `WidgetEmbed` component automatically logs the view
3. Entry is saved to browser's localStorage with timestamp

### Changelog Entry Format
```typescript
{
  timestamp: "2025-12-06T15:30:00.000Z",      // ISO timestamp
  date: "Dec 6, 2025 3:30 PM",               // Human readable
  widget: "photojournalism-portfolio",       // Widget name
  version: "v5.2.0-performance-optimized",   // Version
  action: "view" | "update" | "add",         // Action type
  notes?: "Optional notes"                    // Optional metadata
}
```

### Viewing the Changelog
- **URL**: `http://localhost:3000/changelog`
- **Features**:
  - Real-time updates as you browse
  - Filter by action type (View/Update/Add)
  - Export capabilities
  - Last 50 entries stored (configurable)

### Exporting Data
From the Changelog page:
1. **Export as Text** - Creates a markdown-formatted .txt file
2. **Export as JSON** - Creates a structured .json file
3. Both include timestamp and can be imported into other tools

## Use Cases

### QA/Testing
- Track which widgets you tested and when
- Export logs for bug reports
- See version history for specific widgets

### Development
- Monitor widget updates during development
- Track performance across different versions
- Compare widget versions side-by-side

### Documentation
- Generate changelog reports
- Track when each widget was last updated
- Create historical records for releases

## Configuration

### Adjust Max Entries
Edit `utils/changelogTracker.ts`:
```typescript
const MAX_ENTRIES = 50; // Change this value
```

### Clear Changelog on Page Load
Add to any page component:
```typescript
import { clearChangelog } from '@/utils/changelogTracker';

useEffect(() => {
  clearChangelog();
}, []);
```

### Manual Entry Creation
For non-widget pages, manually log changes:
```typescript
import { addChangelogEntry } from '@/utils/changelogTracker';

// Track a manual update
addChangelogEntry(
  'my-widget',
  'v1.0.0',
  'update',
  'Fixed styling bug'
);
```

## Storage

- **Location**: Browser localStorage
- **Key**: `dev-site-changelog`
- **Persistence**: Survives page reloads (same browser/device)
- **Clearing**: Click "Clear All" on `/changelog` or use DevTools

## Next Steps

Optional enhancements:
1. Add export to server-side database
2. Create real-time sync with GitHub
3. Generate automated release notes
4. Add webhook integration for Slack notifications
5. Build analytics dashboard
